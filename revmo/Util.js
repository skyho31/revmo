/**
 * Util - simple custom util
 * 
 * @author Revine Kim
 * @version 1.0.1
 * @since 2018.02.12
 * 
 */

 const readline = require('readline');

 class Util {
  static getTime(){
    let parsedZero = this.prototype.parsedZero;
    let date = new Date();
    let month = date.getMonth();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let seconds = date.getSeconds();

    return `${parsedZero(month + 1)}/${parsedZero(day)}_${parsedZero(hour)}:${parsedZero(minute)}:${parsedZero(seconds)}`;
  }

  parsedZero(num){
    return num < 10 ? '0' + num : String(num);
  }

  /**
   * @name setIntervalMsg
   * @param topic:String / interval message topic
   * @param callback:Function / execute callback function every minute.
   * @param completedMsg:String / if you want to show compleed msg, type it. default = false
   * @param isOnly:Boolean / execute once or every interval.
   */
  static setIntervalMsg(topic, callback, completedMsg = false, isOnly = false){
    let intervalInstance = setInterval(() => {
        let now = new Date().getSeconds();
        this.write(`[${topic}] Start Process after ${60 - now} sec`.yellow)

        if(now === 0) {
          completedMsg ? this.write(`[${topic}] ${completedMsg}`.yellow) : this.clearLine();
          if(isOnly) clearTimeout(intervalInstance);

          callback();
        }
    }, 1000);
  }

  static write(msg) {
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(msg);
  }

  static clearLine(){
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
  }
}

module.exports = Util;
