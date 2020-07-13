// -- scanner api route --

/// <reference types="better-sqlite3"/>

import express from 'express';
import sqlite from 'better-sqlite3';
import DB from 'better-sqlite3-helper';
import { BetterSqlite3Helper } from 'better-sqlite3-helper';
import bodyParser from 'body-parser';
import { logger } from './../logger';
import { v4 as uuidv4 } from 'uuid';
import { SQL } from './../../types/'

// sql querys

const sql_scanner: SQL = `
    SELECT rec_id, stamp FROM scanner WHERE uuid = ? AND datetime(scanner.stamp, '+1 day') > datetime('now');
`;

const sql_station: SQL = `
    SELECT rec_id, uuid, name FROM stations WHERE uuid = ?;
`;

// init router
export const router: express.Router = express.Router();

router.post('/', bodyParser.json(), function(req, res) {

    logger.debug("POST api.tracker.scanner /",);

    if (!req.body.station) {
        logger.warn("POST api.tracker.scanner / No Station");
        res.status(400).json({ error: 'add station uuid to request', errorid: 203 });
        return;
    }

    // check if station uuid exists
    let station_uuid: string = req.body.station
    let check_station = DB().queryFirstRow(sql_station, station_uuid);
    if (check_station === undefined) {
        // station uuid not in database
        logger.warn("POST api.tracker.scanner / Bad station uuid")
        res.status(404).json({ error: 'station uuid not valid', errorid: 456 });
        return;
    }


    let scanner_uuid: string = '';
    if (req.body.scanner) {
        // request alreay has a scanner uuid
        let check_scanner = DB().queryFirstCell(sql_scanner, req.body.scanner);
        if (check_scanner === undefined) {
            res.status(401).json({ error: "scanner uuid not accepted", errorid: 506 });
            return;
        } else {
            scanner_uuid = req.body.scanner;  
        }
    } else {
        // create new scanner uuid cause station id is valid
        scanner_uuid = uuidv4();
        let obj: BetterSqlite3Helper.DataObject = {
            uuid: scanner_uuid
        };
        if (req.body.scanner_name) obj['name'] = req.body.scanner_name;
        try {
            DB().insert('scanner', obj);
        } catch (e) {
            logger.error("DB ERROR api.tracker.scanner / Insert new scanner uuid");
            res.status(500).json({ error: "Server Error", errorid: 666 });
            return;
        }
    }

    logger.info(
        "Scanner %s registerd at station %s",
        scanner_uuid,
        check_station.name
    );   

    res.status(200).json({ success: "Scanner registred", scanner_uuid, station_name: check_station.name });
});