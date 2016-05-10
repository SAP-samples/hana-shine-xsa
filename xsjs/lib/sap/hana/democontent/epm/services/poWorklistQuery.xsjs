$.import("sap.hana.democontent.epm.services", "messages");
var MESSAGES = $.sap.hana.democontent.epm.services.messages;
$.import("sap.hana.democontent.epm.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epm.services.session;

function getFilter() {
    function createFilterEntry(rs, attribute, obj) {
        console.log("add " + rs.getNString(1) + " " + attribute + " obj " + obj);
        return {
            "terms": rs.getNString(1),
            "attribute": attribute,
            "category": obj
        };
    }

    var body = '';
    var terms = $.request.parameters.get('query');
    terms = terms.replace("'", "");
    var termList = terms.split(" ");
    var termStr = "";
    var i;
    for (i = 0; i < termList.length && i < 50; i++) {
        termStr += termList[i].replace(/\s+/g, '') + "* ";
    }
    terms = termStr;

    var conn = $.db.getConnection();
    var pstmt;
    var rs;
    var query;
    var list = [];

    try {
        // Business Partner Company Name
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(COMPANYNAME) FROM "sap.hana.democontent.epm.data::MD.BusinessPartner" ' + ' WHERE CONTAINS(COMPANYNAME,?)';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, terms);
        rs = pstmt.executeQuery();

        while (rs.next()) {
            list.push(createFilterEntry(rs, MESSAGES.getMessage('SEPM_POWRK',
                '001'), "businessPartner"));
        }

        rs.close();
        pstmt.close();

        // Business Partner City
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR("CITY") FROM "sap.hana.democontent.epm.models::BUYER" ' + ' WHERE CONTAINS("CITY",?)';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, terms);
        rs = pstmt.executeQuery();

        while (rs.next()) {
            list.push(createFilterEntry(rs, MESSAGES.getMessage('SEPM_POWRK',
                '007'), "businessPartner"));
        }

        rs.close();
        pstmt.close();

        // Product - Product Category
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(CATEGORY) FROM "sap.hana.democontent.epm.data::MD.Products" ' + 'WHERE CONTAINS(CATEGORY,?)';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, terms);
        rs = pstmt.executeQuery();

        while (rs.next()) {
            list.push(createFilterEntry(rs, MESSAGES.getMessage('SEPM_POWRK',
                '008'), "products"));
        }

        rs.close();
        pstmt.close();

        // Product - Product ID
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(PRODUCTID) FROM "sap.hana.democontent.epm.data::MD.Products" ' + 'WHERE CONTAINS(PRODUCTID,?)';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, terms);
        rs = pstmt.executeQuery();

        while (rs.next()) {
            list.push(createFilterEntry(rs, MESSAGES.getMessage('SEPM_POWRK',
                '009'), "products"));
        }

        rs.close();
        pstmt.close();

        // PO - PO ID
        query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(PURCHASEORDERID) FROM "sap.hana.democontent.epm.data::PO.Header" ' + 'WHERE CONTAINS(PURCHASEORDERID,?)';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, terms);
        rs = pstmt.executeQuery();

        while (rs.next()) {
            list.push(createFilterEntry(rs, MESSAGES.getMessage('SEPM_POWRK',
                '002'), "purchaseOrder"));
        }

        rs.close();
        pstmt.close();

        conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }
    body = JSON.stringify(list);
    $.trace.debug(body);
    $.response.contentType = 'application/json';
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
}

function getTotalOrders() {
    function createTotalEntry(rs) {
        return {
            "name": rs.getNString(1),
            "value": rs.getDecimal(2)
        };
    }

    var body = '';
    var ivGroupBy = $.request.parameters.get('groupby');
    ivGroupBy = ivGroupBy.replace("'", "");
    var ivCurrency = $.request.parameters.get('currency');
    ivCurrency = ivCurrency.replace("'", "");
    var list = [];

    switch (ivGroupBy) {
        case "PARTNERCOMPANYNAME":
            break;
        case "PRODUCTCATEGORY":
            break;
        case "PARTNERCITY":
            break;
        case "PARTNERPOSTALCODE":
            break;
        case "PRODUCTID":
            break;

        default:
            $.response.status = $.net.http.BAD_REQUEST;
            $.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '000', ivGroupBy));
            return;

    }
    if (ivCurrency === null) {
        ivCurrency = "USD";
    }
    ivCurrency = ivCurrency.substring(0, 3);


    var CheckUpperCase = new RegExp('[A-Z]{3}');

    if (CheckUpperCase.test(ivCurrency) === true) {
        try {
            // not able to add Currency as prepared statement using setString so adding it in query directly
            var query = 'SELECT top 5 ' + ivGroupBy + ', SUM("CONVGROSSAMOUNT") FROM "sap.hana.democontent.epm.models::AN_PURCHASE_COMMON_CURRENCY"' + ' (\'PLACEHOLDER\' = (\'$$IP_O_TARGET_CURRENCY$$\', \'' + ivCurrency + '\')) group by ' + ivGroupBy + ' order by sum("CONVGROSSAMOUNT") desc';
            $.trace.debug(query);
            var conn = $.db.getConnection();
            var pstmt = conn.prepareStatement(query);
            var rs = pstmt.executeQuery();

            while (rs.next()) {
                list.push(createTotalEntry(rs));
            }

            rs.close();
            pstmt.close();
        } catch (e) {
            $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
            $.response.setBody(e.message);
            return;
        }

        body = JSON.stringify({
            "entries": list
        });

        $.response.contentType = 'application/json; charset=UTF-8';
        $.response.setBody(body);
        $.response.status = $.net.http.OK;

    } else {
        $.response.status = $.net.http.BAD_REQUEST;
        $.response.setBody(MESSAGES.getMessage('SEPM_BOR_MESSAGES', '053', encodeURI(ivCurrency)));
        return;
    }
}

function downloadExcel() {
    var body = '';

    try {
        var query = 'SELECT TOP 25000 "PurchaseOrderId", "PartnerId", "CompanyName", "CreatedByLoginName", "CreatedAt", "GrossAmount" ' + 'FROM "sap.hana.democontent.epm.data::PO.HeaderView" order by "PurchaseOrderId"';

        $.trace.debug(query);
        var conn = $.hdb.getConnection();
        var rs = conn.executeQuery(query);

        body = MESSAGES.getMessage('SEPM_POWRK', '002') + "\t" + // Purchase
            // Order ID
            MESSAGES.getMessage('SEPM_POWRK', '003') + "\t" + // Partner ID
            MESSAGES.getMessage('SEPM_POWRK', '001') + "\t" + // Company Name
            MESSAGES.getMessage('SEPM_POWRK', '004') + "\t" + // Employee
            // Responsible
            MESSAGES.getMessage('SEPM_POWRK', '005') + "\t" + // Created At
            MESSAGES.getMessage('SEPM_POWRK', '006') + "\n"; // Gross Amount

        var i;
        for (i = 0; i < rs.length; i++) {
            body += rs[i].PurchaseOrderId + "\t" + rs[i].PartnerId + "\t" + rs[i].CompanyName + "\t" + rs[i].CreatedByLoginName + "\t" + rs[i].CreatedAt + "\t" + rs[i].GrossAmount + "\n";
        }
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }

    $.response.setBody(body);
    $.response.contentType = 'application/vnd.ms-excel; charset=utf-16le';
    $.response.headers.set('Content-Disposition',
        'attachment; filename=Excel.xls');
    $.response.status = $.net.http.OK;
}

//Zip Functionality
function downloadZip() {
    var body = '';

    try {

        var query = 'SELECT TOP 25000 "PurchaseOrderId", "PartnerId", "CompanyName", "CreatedByLoginName", "CreatedAt", "GrossAmount" ' + 'FROM "sap.hana.democontent.epm.data::PO.HeaderView" order by "PurchaseOrderId"';

        $.trace.debug(query);
        var conn = $.hdb.getConnection();
        var rs = conn.executeQuery(query);

        body = MESSAGES.getMessage('SEPM_POWRK', '002') + "\t" + // Purchase
            // Order ID
            MESSAGES.getMessage('SEPM_POWRK', '003') + "\t" + // Partner ID
            MESSAGES.getMessage('SEPM_POWRK', '001') + "\t" + // Company Name
            MESSAGES.getMessage('SEPM_POWRK', '004') + "\t" + // Employee
            // Responsible
            MESSAGES.getMessage('SEPM_POWRK', '005') + "\t" + // Created At
            MESSAGES.getMessage('SEPM_POWRK', '006') + "\n"; // Gross Amount

        var i;
        for (i = 0; i < rs.length; i++) {
            body += rs[i].PurchaseOrderId + "\t" + rs[i].PartnerId + "\t" + rs[i].CompanyName + "\t" + rs[i].CreatedByLoginName + "\t" + rs[i].CreatedAt + "\t" + rs[i].GrossAmount + "\n";
        }

        var zip = new $.util.Zip();
        zip["Excel.xls"] = body;

        $.response.status = $.net.http.OK;
        $.response.contentType = "application/zip";
        $.response.headers.set('Content-Disposition', "attachment; filename = Purchase.zip");
        $.response.setBody(zip.asArrayBuffer());

    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }
}
//end of zip

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
    case "filter":
        getFilter();
        break;
    case "getTotalOrders":
        getTotalOrders();
        break;
    case "Excel":
        downloadExcel();
        break;
    case "Zip":
        downloadZip();
        break;
    case "getSessionInfo":
        SESSIONINFO.fillSessionInfo();
        break;
    default:
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
}
