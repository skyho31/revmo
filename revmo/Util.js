/**
 * Util - simple custom util
 * 
 * @author Revine Kim
 * @version 1.0.0
 * @since 2018.02.12
 * 
 */

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
}

module.exports = Util;
