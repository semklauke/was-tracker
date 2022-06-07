/// <reference types="better-sqlite3"/>

// execute logger init for the first time
import './includes/logging';
import { logger } from './includes/logger';
import express from 'express';
import sqlite from 'better-sqlite3';
import { Database, Statement } from 'better-sqlite3';
import DB from 'better-sqlite3-helper'; 
import winston from 'winston';
import path from 'path';
import https from 'https';
import http from 'http';
import fs from 'fs';
import url from 'url';

import express_session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import config from './includes/config';

// important globals
const app: express.Express = express();
let server: https.Server;
let server_http: http.Server; 
let server6: https.Server;

// express setup
const port_https: number = config.port.https || 443;
const port_http: number = config.port.http || 80;
let sslOptions: https.ServerOptions;

app.use('/assets', express.static(path.resolve(__dirname, config.frontend_folder, 'assets')));
app.use('/static', express.static(path.resolve(__dirname, 'static')));

app.use(express_session({ 
    secret: "was2020",
    saveUninitialized: false,
    resave: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// db setup + express start
try {
    logger.info('Open SQLite database at %s', config.db);
    const mig = config.debug == true ? 'last' : false;
    DB({
        path: path.join(__dirname, config.db),
        readonly: false,
        fileMustExist: false,
        WAL: true,
        migrate: {
            force: mig,
            table: 'migration',
            migrationsPath: path.join(__dirname, 'migrations')
        }
    });
    DB().defaultSafeIntegers(false);       
    logger.info('Migrating database. force=%s', mig);

    logger.info('Reading ssl key and cert from ', config.ssl);
    let key = fs.readFileSync(config.ssl.key);
    let cert = fs.readFileSync(config.ssl.cert);
    sslOptions = { key, cert };

    logger.info('Starting node https server on ipv4 and ipv6');

    if (config.https) {
        server = https.createServer(sslOptions, app).listen(port_https, config.ip.ipv4, () => {
            logger.info('-------- IPv4 SERVER IS RUNNING --------');
            logger.info('at: https://%s:%d', config.ip.ipv4, port_https);
        });

        if (config.ipv6) {
            server6 = https.createServer(sslOptions, app).listen(port_https, config.ip.ipv6, () => {
                logger.info('-------- IPv6 SERVER IS RUNNING --------');
                logger.info('at: https://[%s]:%d', config.ip.ipv6, port_https);
            });
        }
    }
    if (config.http) {
        server_http = http.createServer(app).listen(port_http, config.ip.ipv4, () => {
            logger.info('-------- IPv4 HTTP SERVER IS RUNNING --------');
            logger.info('at: http://%s:%d', config.ip.ipv4, port_http);
        });
    }

} catch (err: any) {
    if (!err) err = new Error("DB Setup error");
    logger.error(err.toString());
    process.exit(1);
}

import { router as api_scanner } from './includes/api/scanner';
app.use('/api/scanner', api_scanner);

import { router as api_station } from './includes/api/station';
app.use('/api/station', api_station);

import { router as api_checkin } from './includes/api/checkin';
app.use('/api/checkin', api_checkin);

// serve vue frontend
app.get('*', function(req, res){
    res.sendFile(path.resolve(__dirname, config.frontend_folder, 'index.html'));
});


process.on('exit', () => DB().close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(128 + 15));