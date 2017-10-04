"use strict";
module.exports = {
   asyncDemo: function(wss){
	 	wss.broadcast("Start");
		setTimeout(function(){
				wss.broadcast("Wait Timer Over");
		}, 3000);
		wss.broadcast("End");
  }
};