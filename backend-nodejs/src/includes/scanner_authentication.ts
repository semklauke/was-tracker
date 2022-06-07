/// <reference types="better-sqlite3"/>

import sqlite from 'better-sqlite3';
import DB from 'better-sqlite3-helper';
import path from 'path';
import winston from 'winston';
import { logger } from './../includes/logger';
import { User, Login } from './../types';
import { RequestHandler } from 'express';

export let secure: RequestHandler = function(req, res, next)  {
    if (req.headers.authorization === undefined) {
        res.status(401).json({ error: "Not logged in", errorid: 3 });
    } else {
        let scanner_uuid: string = req.headers.authorization;
        res.locals.scanner_uuid = scanner_uuid;

        let e: Error | null = null;
        let u: User | null = null;

        try {
            let result: Login | undefined = DB().prepare("SELECT * FROM scanner WHERE uuid = ?").get(scanner_uuid); 
            if (!result) {
                logger.warn("Unauthorized request from %s", scanner_uuid);
                res.status(401).json({ error: "Not logged in", errorid: 3 });
            } else {
                res.locals.scanner_id = result.rec_id;
                logger.debug("Authorized %s", result.uuid);
                next();
            }
        } catch (error) {
            res.status(500).json({ error: "DATABASE ERROR. Contact admin", errorid: 4 });
            logger.error("DB ERROR | tracker secure");
        }
        
    }
}