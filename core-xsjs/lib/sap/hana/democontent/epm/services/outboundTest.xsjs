await $.import("sap.hana.democontent.epm.services", "messages");
var MESSAGES = $.sap.hana.democontent.epm.services.messages;

// enables outbound access to a defined HTTP destination defined in the image.xshttpdest file.
async function searchImages() {
    var search = encodeURI($.request.parameters.get("search"));
    var index = encodeURI($.request.parameters.get("index"));
    if (index === undefined) {
        index = 0;
    }
    var dest = await $.net.http.readDestination("sap.hana.democontent.epm.services", "images");

    var client = new $.net.http.Client();
    var req = new $.web.WebRequest($.net.http.GET, search);
    client.request(req, dest);

    var response = encodeURI(await client.getResponse());

    var body = null;
    if (response.body) {
        body = response.body.asString();
    }
    $.response.status = response.status;

    if (response.status === $.net.http.INTERNAL_SERVER_ERROR) {
        $.response.contentType = "application/json";
        await $.response.setBody("body");
    } else {
        $.response.contentType = "text/html";
        var searchDet = JSON.parse(body);
        var outBody =
            "First Result of " + encodeURIComponent(searchDet.search.hits) + "</br>" +
            "<img src=\"" + encodeURI(searchDet.results[index].image.full) + "\">";
        await $.response.setBody(outBody);
    }
}

var aCmd = encodeURI($.request.parameters.get("cmd"));
switch (aCmd) {
    case "Images":
        await searchImages();
        break;
    default:
        $.response.status = $.net.http.BAD_REQUEST;
        await $.response.setBody(await MESSAGES.getMessage("SEPM_ADMIN", "002", encodeURI(aCmd)));
}
export default {MESSAGES,searchImages,aCmd};

