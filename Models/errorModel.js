
var winston = require('../config/winston');

function consolelog(message){
    winston.error(
        message.stack
    );
}

function consolelog2(message){
    winston.error(
        message
    );
}
  
module.exports.consolelog = consolelog
module.exports.consolelog2 = consolelog2
