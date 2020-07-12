// -- checkin api route --

/// <reference types="better-sqlite3"/>

import express from 'express';
import sqlite from 'better-sqlite3';
import DB from 'better-sqlite3-helper';
import { BetterSqlite3Helper } from 'better-sqlite3-helper';
import bodyParser from 'body-parser';
import { logger } from './../logger';
import { SQL } from './../../types/';
import { Station, Checkin } from './../../types/tracker';
import { secure } from './../scanner_authentication';

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
    SELECT rec_id FROM codes WHERE active = 1 AND uuid = ?;
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
    if (!req.body.station) {
        logger.warn("POST api.tracker.checkin / No Station");
        res.status(400).json({ error: 'add station uuid to request', errorid: 2503 });
        return;
    }

    // check if station uuid exists
    let station_uuid: string = req.body.station
    let check_station = DB().queryFirstCell(sql_station, station_uuid);
    if (check_station === undefined) {
        // station uuid not in database
        logger.warn("POST api.tracker.checkin / Bad station uuid")
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
    DB().insert('checkins', {
        code_id: parseInt(check_code),
        station_id: parseInt(check_station),
        scanner_id
    });
    res.status(200).json({ success: "Success" });

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
        logger.warn("POST api.tracker.checkin.station / Bad station uuid")
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

    // all good insert checkin
    DB().insert('checkins', {
        code_id: parseInt(check_code),
        station_id: parseInt(check_station),
        scanner_id
    });
    res.status(200).json({ success: "Success" });

});


/// get all checkins for qrcode uuid
router.get('/code/:code_uuid', secure, function(req, res) {

    let code_uuid: string = req.params.code_uuid;
    logger.debug("GET api.tracker.checkin /code/%s", code_uuid);

    let checkins: any[] = DB().query(sql_checkins_code, code_uuid);
    res.status(200).json({ success: "Success", checkins, length: checkins.length });

});