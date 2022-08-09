// -- checkin api route --

/// <reference types="better-sqlite3"/>

import express from 'express';
import sqlite from 'better-sqlite3';
import DB from 'better-sqlite3-helper';
import { BetterSqlite3Helper } from 'better-sqlite3-helper';
import bodyParser from 'body-parser';
import { logger } from './../logger';
import { SQL } from './../../types/';
import { Station, Checkin, SendWalker } from './../../types/tracker';
import { secure } from './../scanner_authentication';
import { v4 as uuidv4 } from 'uuid';

// sql querys

const sql_checkins_all: SQL = `
    SELECT * FROM checkins_full;
`;

const sql_checkins_station: SQL = `
    SELECT * FROM checkins_full WHERE station_uuid = ?;
`;

const sql_checkins_code: SQL = `
    SELECT * FROM checkins_full WHERE code_uuid = ?;
`;


const sql_station: SQL = `
    SELECT rec_id FROM stations WHERE uuid = ?;
`;

const sql_code: SQL = `
    SELECT rec_id FROM codes WHERE (active = 1 OR active = 2) AND uuid = ?;
`;

const sql_code_walker: SQL = `
    SELECT 
        class, lastname, firstname, code_uuid AS uuid
    FROM code_walker_full
    WHERE code_id = ?
    LIMIT 1;
`;

// init router
export const router: express.Router = express.Router();

// get all checkins
router.get('/', secure, function(req, res) {

    logger.debug("GET api.tracker.checkin /");
    let checkins: any[] = DB().query(sql_checkins_all);
    res.status(200).json({ success: "Success", checkins, length: checkins.length });

});

// add new checking
router.post('/', secure, bodyParser.json(), function(req, res) {

    logger.debug("POST api.tracker.checkin /");

    // check if station exists in request
    if (!req.body.station_uuid) {
        logger.warn("POST api.tracker.checkin / No Station");
        res.status(400).json({ error: 'add station uuid to request', errorid: 2503 });
        return;
    }

    // check if station uuid exists
    let station_uuid: string = req.body.station_uuid;
    let check_station = DB().queryFirstCell(sql_station, station_uuid);
    if (check_station === undefined) {
        // station uuid not in database
        logger.warn("POST api.tracker.checkin / Bad station uuid");
        res.status(404).json({ error: 'station uuid not valid', errorid: 457 });
        return;
    }

    // scanner uuid from auth with cookie
    let scanner_id: number = parseInt(res.locals.scanner_id);

    // check if code_uuid exists in request
    if (!req.body.code_uuid) {
        logger.warn("POST api.tracker.checkin / No QR Code");
        res.status(400).json({ error: 'add code uuid to request', errorid: 2504 });
        return;
    }

    // get code rec_id for code
    let code_uuid: string = req.body.code_uuid;
    let check_code = DB().queryFirstCell(sql_code, code_uuid);
    if (check_code === undefined) {
        logger.warn("POST api.tracker.checkin / Bad code uuid")
        res.status(404).json({ error: 'code uuid not valid', errorid: 458 });
        return;
    }

    // all good insert checkin
    let insert_data: Checkin = {
        code_id: parseInt(check_code),
        station_id: parseInt(check_station),
        scanner_id
    }

    if (req.body?.timestamp)
        insert_data.stamp = req.body.timestamp

    DB().insert('checkins', insert_data);

    // get walker data to send back
    let walker_code_ref = DB().queryFirstRow(sql_code_walker, parseInt(check_code)) as SendWalker;

    // resolve request with checkind in walker data
    res.status(200).json({ 
        success: "Success",
        walker: walker_code_ref
    });

});

// get all checkins for station
router.get('/station/:station_uuid', secure, function(req, res) {

    let station_uuid: string = req.params.station_uuid;
    logger.debug("GET api.tracker.checkin /station/%s", station_uuid);

    let checkins: any[] = DB().query(sql_checkins_station, station_uuid);
    res.status(200).json({ success: "Success", checkins, length: checkins.length });

});

// add new checkin for station
router.post('/station/:station_uuid', secure, bodyParser.json(), function(req, res) {

    let station_uuid: string = req.params.station_uuid;
    logger.debug("POST api.tracker.checkin /station/%s", station_uuid);

    // check if station uuid exists
    let check_station = DB().queryFirstCell(sql_station, station_uuid);
    if (check_station === undefined) {
        // station uuid not in database
        logger.warn("POST api.tracker.checkin.station / Bad station uuid");
        res.status(404).json({ error: 'station uuid not valid', errorid: 287 });
        return;
    }

    // scanner uuid from auth with cookie
    let scanner_id: number = parseInt(res.locals.scanner_id);

    // check if code_uuid exists in request
    if (!req.body.code_uuid) {
        logger.warn("POST api.tracker.checkin.station / No QR Code");
        res.status(400).json({ error: 'add code uuid to request', errorid: 2504 });
        return;
    }

    // get code rec_id for code
    let code_uuid: string = req.body.code_uuid;
    let check_code = DB().queryFirstCell(sql_code, code_uuid);
    if (check_code === undefined) {
        logger.warn("POST api.tracker.checkin.station / Bad code uuid")
        res.status(404).json({ error: 'code uuid not valid', errorid: 4058 });
        return;
    }

    // get walker data to send back
    let walker_code_ref = DB().queryFirstRow(sql_code_walker, parseInt(check_code)) as SendWalker;

    // all good insert checkin
    let insert_data: Checkin = {
        code_id: parseInt(check_code),
        station_id: parseInt(check_station),
        scanner_id
    }

    if (req.body?.timestamp)
        insert_data.stamp = req.body.timestamp

    DB().insert('checkins', insert_data);

    logger.debug("POST api.tracker.checkin.station / SUCCESS checkin %s", code_uuid)

    res.status(200).json({ 
        success: "Success",
        walker: walker_code_ref
    });

});


/// get all checkins for qrcode uuid
router.get('/code/:code_uuid', secure, function(req, res) {

    let code_uuid: string = req.params.code_uuid;
    logger.debug("GET api.tracker.checkin /code/%s", code_uuid);

    let checkins: any[] = DB().query(sql_checkins_code, code_uuid);
    res.status(200).json({ success: "Success", checkins, length: checkins.length });

});

// add new checking from offline
router.post('/offline', secure, bodyParser.json(), function(req, res) {

    logger.debug("POST api.tracker.checkin /offline");

    // check if station exists in request
    if (!req.body.codes) {
        logger.warn("POST api.tracker.checkin /offline No Codes");
        res.status(400).json({ error: 'add codes to request', errorid: 2548 });
        return;
    }

    // scanner uuid from auth with cookie
    let scanner_id: number = parseInt(res.locals.scanner_id);
    let success: number = 0;
    let walkers: SendWalker[] = [];

    for (let c of req.body.codes) {
        // check if station uuid exists
        let check_station = DB().queryFirstCell(sql_station, c.station_uuid);
        if (check_station === undefined) {
            // station uuid not in database
            logger.warn("POST api.tracker.checkin /offline Bad station uuid");
            logger.info("Failed offline upload: ", c);
            continue;
        }

        // get code rec_id for code
        let check_code = DB().queryFirstCell(sql_code, c.uuid);
        if (check_code === undefined) {
            logger.warn("POST api.tracker.checkin /offline Bad code uuid")
            logger.info("Failed offline upload: ", c);
            continue;
        }

        // all good insert checkin
        walkers.push(
            DB().queryFirstRow(sql_code_walker, parseInt(check_code)) as SendWalker
        );

        let insert_data: Checkin = {
            code_id: parseInt(check_code),
            station_id: parseInt(check_station),
            scanner_id
        }

        if (c?.timestamp)
            insert_data.stamp = c.timestamp

        DB().insert('checkins', insert_data);

        success++;
    }
    res.status(200).json({ 
        success: "Success", 
        count: success,
        walkers: walkers,
    });

});


// add new temp checkin
router.post('/temp', secure, bodyParser.json(), function(req, res) {

    logger.debug("POST api.tracker.checkin /temp");

    // check if station exists in request
    if (!req.body.station_uuid) {
        logger.warn("POST api.tracker.checkin /temp No Station");
        res.status(400).json({ error: 'add station uuid to request', errorid: 2503 });
        return;
    }

    // check if station uuid exists
    let station_uuid: string = req.body.station_uuid;
    let check_station = DB().queryFirstCell(sql_station, station_uuid);
    if (check_station === undefined) {
        // station uuid not in database
        logger.warn("POST api.tracker.checkin /temp Bad station uuid");
        res.status(404).json({ error: 'station uuid not valid', errorid: 457 });
        return;
    }

    // scanner uuid from auth with cookie
    let scanner_id: number = parseInt(res.locals.scanner_id);

    // check if code_uuid exists in request
    if (!req.body.walker) {
        logger.warn("POST api.tracker.checkin /temp No Walker object");
        res.status(400).json({ error: 'add code uuid to request', errorid: 2507 });
        return;
    }

    // create new code
    const code_uuid: string = uuidv4();
    const code_id = DB().insert('code', {
        uuid: code_uuid,
        active: 2 
    });

    // insert new walker
    // TODO maybe replace by temp walkers
    DB().insert('walkers', req.body.walker);

    // all good insert checkin
    let insert_data: Checkin = {
        code_id: code_id,
        station_id: parseInt(check_station),
        scanner_id
    }

    if (req.body.timestamp)
        insert_data.stamp = req.body.timestamp

    DB().insert('checkins', insert_data);

    // resolve request
    res.status(200).json({ 
        success: "Success"
    });

});