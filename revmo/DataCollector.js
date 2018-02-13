/**
 * Data Collector
 * 
 * @author Revine Kim
 * @version 1.0.2
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
    let me = this;
    console.log('[Data Collector] Start Process'.yellow);

    this.makeCurrencyInfo().then(() => {
      this.checkTicker();
      this.checkStatus();
    }).then(() => {
      Util.setIntervalMsg('Chart Data Loaded', () => {
          me.checkTicker();
          me.checkStatus();
      });
    });

    collectEvent.on('chart collected', () => {
      let loadingPercent = (this.requestCount / this.currencyKey.length) * 100;
      Util.write(`[Chart Data Loaded] : ${loadingPercent === 100 ? 'completed' : loadingPercent.toFixed(2) + '%'}`.yellow + ' / ');

      if (this.requestCount === this.currencyKey.length) {
        let currencyInfo = me.currencyInfo;
        let date = new Date();
        for (var key in currencyInfo) {
          Log.write(key, currencyInfo[key]);
        }

        me.requestCount = 0;
        console.log(`[Data Collected] ${Util.getTime()}`.green);
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

        console.log('[Data Collector] Make Currency Information Process'.yellow);

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
    const TYPE = ['timestamp', 'startPrice', 'endPrice', 'highPrice', 'lowPrice', 'strLength'];
    let me = this;
    let chartUrl = url.chart.replace('{coinName}', key);
    let returnObj = {
      [TYPE[0]] : [],
      [TYPE[1]] : [],
      [TYPE[2]] : [],
      [TYPE[3]] : [],
      [TYPE[4]] : [],
      [TYPE[5]] : []
    };


    request(chartUrl, (err, res, body) => {
      if (err) console.log(`[${key} chart request] : failed `.red + err);

      try {
        let result = JSON.parse(body);
        let currency = this.currencyInfo[key];


        result.forEach(data => {
          for(let idx = 0; idx < TYPE.length; idx++){
            returnObj[TYPE[idx]].push(data[idx]);
          }
        });

        currency.chart = returnObj;
        
        this.requestCount++;
        collectEvent.emit('chart collected');
      } catch (e) {
        me.checkChart(key);
      }
    });
  }
}

module.exports = DataCollector;

