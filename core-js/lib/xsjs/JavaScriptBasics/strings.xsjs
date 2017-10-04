function stringsBasic(){
	var body = ''; 
	var demo1 = 'SAP HANA Extended Application Services';
	
	body += 'Basic String: ' + demo1 + '</p>';
	
	body += 'The first character in the string: ' + demo1[0] + '</p>';
	
	body += 'The length of the string: ' + demo1.length.toString() + '</p>';
	
	//slice with a negative index
	body += 'The last character in the string: ' + demo1.slice(-1) + '</p>';
	
	body += 'Upper: ' + demo1.toUpperCase() + '</p>';
	
	body += 'Lower: ' + demo1.toLowerCase() + '</p>';	
	
	body += 'Find HANA: ' + demo1.indexOf("HANA").toString() + '</p>';

	body += 'Find Last occurance of the letter A: ' + demo1.lastIndexOf("A").toString() + '</p>';
	
	body += 'Replace with XS: ' + demo1.replace('Extended Application Services', 'XS') + '</p>';
	
	$.response.status = $.net.http.OK;
	$.response.contentType = "text/html";
	$.response.setBody(body);
	
}

stringsBasic();