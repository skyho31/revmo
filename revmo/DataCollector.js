/**
 * Data Collector
 * 
 * @author Revine Kim
 * @version 1.0.0
 * @since 2018.02.12
 * 
 */

 // npm module
const request = require('request');
const events = require('events');
const fs = require('fs');
const readline = require('readline');
const colors = require('colors');

// custom module
const Log = require('./Log');
const Util = require('./Util');


let collectEvent = new events.EventEmitter();

const url = {
  chart: 'https://www.bithumb.com/resources/chart/{coinName}_xcoinTrade_01M.json',
  ticker: 'https://api.bithumb.com/public/ticker/all'
};

class Currency {
  constructor(key, name) {
    this.name = name;
    this.key = key;
    this.buyPrice = 0;
    this.sellPrice = 0;
  }
}

class DataCollector {
  constructor(intervalTime) {
    this.intervalTime = intervalTime;
    this.currencyInfo = {};
    this.currencyKey = [];
    this.requestCount = 0;
  }

  start() {
    console.log('[Data Collector] Start Process'.yellow);

    this.makeCurrencyInfo().then(() => {
      this.countDown();
      this.checkTicker();
      this.checkStatus();
    });

    let me = this;

    collectEvent.on('chart collected', () => {
      let loadingPercent = ((this.requestCount / this.currencyKey.length) -1) * 100;

      readline.clearLine(process.stdout);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`Data Loaded : ${loadingPercent.toFixed}% `.yellow);

      if (this.requestCount === this.currencyKey.length) {
        let currencyInfo = me.currencyInfo;
        let date = new Date();
        for (var key in currencyInfo) {
          Log.write(key, currencyInfo[key]);
        }

        me.requestCount = 0;
        console.log(`[Data Collected] ${Util.getTime()}`.green);
        
        setTimeout(function() {
          me.countDown();
          me.checkTicker();
          me.checkStatus();
        }, this.intervalTime);
      }
    });
  }

  makeCurrencyInfo() {
    return new Promise((resolve) => {
      fs.readFile('./libs/currency.json', (err, data) => {
        if (err) throw err;

        let currencyInfo = JSON.parse(decodeURIComponent(data))[0];
        let currencyKey = (this.currencyKey = Object.keys(currencyInfo));

        for (let idx in currencyKey) {
          this.currencyInfo[currencyKey[idx]] = new Currency(currencyKey[idx], currencyInfo[currencyKey[idx]]);
        }

        resolve();
      });
    });
  }

  checkTicker() {
    request(url.ticker, (err, res, body) => {
      if (err) {
        console.log('ticker load failed : ' + err);
        return false;
      }

      let result = JSON.parse(body);
      let currencyKey = this.currencyKey;

      for (let idx in currencyKey) {
        if (idx === 'date') return false;
        let currency = this.currencyInfo[currencyKey[idx]];
        let key = currencyKey[idx];
        currency.buyPrice = Number(result.data[key].buy_price);
        currency.sellPrice = Number(result.data[key].sell_price);
      }

    });
  }

  checkStatus() {
    let currencyInfo = this.currencyInfo;
    let i = 0;
    for (let key in currencyInfo) {
      if(i > this.currencyKey.length) break;
      if (currencyInfo.hasOwnProperty(key)) this.checkChart(key);
      i++;
    }
  }

  checkChart(key) {
    let chartUrl = url.chart.replace('{coinName}', key);
    const TYPE = ['timestamp', 'startPrice', 'endPrice', 'highPrice', 'lowPrice', 'strLength'];

    request(chartUrl, (err, res, body) => {
      if (err) console.log(`[${key} chart request] : failed `.red + err);

      try {
        let result = JSON.parse(body);
        let currency = this.currencyInfo[key];

        currency.chart = result;
        
        this.requestCount++;
        collectEvent.emit('chart collected');
      } catch (e) {
        console.log('[DataCollector] request failed '.red + key);

        this.requestCount++;
        collectEvent.emit('chart collected');
      }
    });
  }

  countDown() {
    let count = this.intervalTime / 1000;
    let timer = setInterval(function() {    
      count--;
      
      readline.clearLine(process.stdout);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`next collect : after ${String(count).yellow.underline} sec`);  // write text

      if (count === 0) {
        readline.clearLine(process.stdout);
        readline.cursorTo(process.stdout, 0);

        clearTimeout(timer);
      }
    }, 1000);
  }
}

module.exports = DataCollector;

