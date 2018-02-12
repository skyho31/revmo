// npm modules
const readline = require('readline');
const colors = require('colors');

// custom modules
const DataCollector = require('./DataCollector');
const Log = require('./Log');

const requestInterval = 60 * 1000;

let collector = new DataCollector(requestInterval);

let startZero = setInterval(function(){
  let now = new Date().getSeconds();
  readline.clearLine(process.stdout);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`[REVMO] Start Process after ${60 - now} sec`.yellow);  // write text

  if(now === 0) {
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
    console.log(`[REVMO] Start Process`.yellow);
    collector.start();

    clearTimeout(startZero);  
  }
},1000);
