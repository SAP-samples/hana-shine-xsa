var xssec = $.require('@sap/xssec');
var xsenv = $.require('@sap/xsenv');

var uaaService = xsenv.getServices({
	uaa: {
		tag: 'xsuaa'
	}
});
var xsuaaCredentials = uaaService.uaa;

if (!xsuaaCredentials) {
	$.response.status = 500;
	$.response.setBody("uaa service not found");
}
var SCOPE = xsuaaCredentials.xsappname + '.DataGenerator';

var accessToken;
if ($.request.headers["4"].name) {
	accessToken = $.request.headers["4"].value.split(' ')[1];
} else {
	$.response.status = 500;
	$.response.setBody("Authorization header not found");
}

xssec.createSecurityContext(accessToken, xsuaaCredentials, function (error, securityContext) {
	if (error) {
		$.response.status = 500;
		$.response.setBody("Invalid access token");
	}
	if (securityContext.checkScope(SCOPE)) {
		$.response.status = 200;
	} else {
		$.response.status = 403;
		$.response.setBody("Forbidden");
	}
});