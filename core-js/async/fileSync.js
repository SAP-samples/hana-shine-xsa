"use strict";
var fs = require("fs");

module.exports = {
   fileDemo: function(wss){
var text = fs.readFileSync("./async/file.txt","utf8"); 
wss.broadcast(text);
 
wss.broadcast("After First Read\n");
 
text = fs.readFileSync("./async/file2.txt","utf8");
wss.broadcast(text);
 
wss.broadcast("After Second Read\n");

  }
};