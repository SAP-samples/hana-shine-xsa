"use strict";
var fs = require("fs");

module.exports = {
   fileDemo: function(wss){
fs.readFile("./async/file.txt","utf8", function(error, text){
	wss.broadcast(text);
}); 
wss.broadcast("After First Read\n");
 
fs.readFile("./async/file2.txt","utf8", function(error, text){
	wss.broadcast(text);
});
wss.broadcast("After Second Read\n");

  }
};