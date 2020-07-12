// -- station api route --

/// <reference types="better-sqlite3"/>

import express from 'express';
import sqlite from 'better-sqlite3';
import DB from 'better-sqlite3-helper';
import { BetterSqlite3Helper } from 'better-sqlite3-helper';
import bodyParser from 'body-parser';
import { logger } from './../logger';
import { SQL } from './../../types/';
import { Station } from './../../types/tracker';
import { secure } from './../scanner_authentication';

// sql querys

const sql_station_all: SQL = `
    SELECT * FROM stations;
`;

const sql_station: SQL = `
    SELECT * FROM stations WHERE uuid = ?;
`;

// init router
export const router: express.Router = express.Router();

/*router.post('/', bodyParser.json(), function(req, res) {

    logger.debug("POST api.tracker.station /");

});*/

router.get('/', secure, function(req, res) {

    logger.debug("GET api.tracker.station /");
    let stations: any[] = DB().query(sql_station_all);
    res.status(200).json({ success: "Success", stations, length: stations.length });

});

router.get('/:station_uuid', secure, function(req, res) {

    let station_uuid: string = req.params.station_uuid;
    logger.debug("GET api.tracker.station /%s", station_uuid);

    // check if station uuid exists
    let station: Station | undefined = DB().queryFirstRow(sql_station, station_uuid);
    if (station == undefined) {
        logger.debug("GET api.tracker.station /%s (:station__ud) No such station", station_uuid);
        res.status(404).json({ error: 'The station does not exists', errorid: 210 });
        return;
    }

    res.status(200).json({ success: 'Success', station });
});

/*
router.put('/:station_uuid', bodyParser.json(), function(req, res) {

    let station_uuid: string = req.params.station_uuid;
    logger.debug("PUT api.tracker.station /:station_uuid");

});

router.delete('/:station_uuid', bodyParser.json(), function(req, res) {

    let station_uuid: string = req.params.station_uuid;
    logger.debug("DELETE api.tracker.station /:station_uuid");

});
*/