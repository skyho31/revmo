/**
 * Log class
 * 
 * @author Revine Kim
 * @version 1.0.0
 * @since 2018.02.12
 * 
 */

// npm modules
const fs = require('fs');

// default settings
const defaultPath = './logs/';

class Log {
  static read(fileName){
    let filePath = defaultPath + fileName + '.json';
    let returnData = fs.readFileSync(filePath, 'utf-8');
    
    try {
      return JSON.parse(returnData);
    } catch(e) {
      console.log('[log.read] This file is not JSON format. ' + e);
      return false;
    }
  }

  static write(fileName, message, isAppended = false){

    let filePath = defaultPath + fileName + '.json';
    let parsedMessage = JSON.stringify(message);
    let isExisted = fs.existsSync(filePath);

    try {
      return isAppended ? (isExisted ? fs.appendFileSync(filePath, parsedMessage) : fs.writeFileSync(filePath, parsedMessage)) : fs.writeFileSync(filePath, parsedMessage);
    } catch(e){
      console.log('[log.write] This file is not JSON format. ' + e);
      return false;
    }
  }
}

module.exports = Log; 
