/**
 * REVMO - bithumb trader bot
 * 
 * @author Revine Kim
 * @version 1.0.1
 * @since 2018.02.12
 * 
 */

// npm modules
const readline = require('readline');
const colors = require('colors');

// custom modules
const DataCollector = require('./revmo/DataCollector');
const Log = require('./revmo/Log');
const Util = require('./revmo/Util');

// default settings
const requestInterval = 60 * 1000;

let collector = new DataCollector(requestInterval);
Util.setIntervalMsg('REVMO', () => collector.start(), 'Start Process Completed'.yellow, true);
