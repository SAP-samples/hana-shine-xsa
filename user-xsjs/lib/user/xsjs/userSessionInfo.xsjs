	var body = "";
	body = JSON.stringify({
		"session" : [{"UserName": $.session.getUsername(), "Language": $.session.language}] 
	});
	$.response.contentType = "application/json"; 
	$.response.setBody(JSON.parse(body));
	$.response.status = $.net.http.OK;
