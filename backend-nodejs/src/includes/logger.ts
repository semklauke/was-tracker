import config from './config';
import winston from 'winston';
import { Logger } from 'winston';

export const logger: Logger = config.debug 
    ? <Logger>winston.loggers.get('debug') 
    : <Logger>winston.loggers.get('production');