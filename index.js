var i = 0;  // dots counter
var count = 60;
setInterval(function() {
  
  process.stdout.clearLine();  // clear current text
  process.stdout.cursorTo(0);  // move cursor to beginning of line
  process.stdout.write("Waiting " + count + '...');  // write text
  count--;
}, 1000);
