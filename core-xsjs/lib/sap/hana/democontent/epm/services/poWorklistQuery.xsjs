await $.import("sap.hana.democontent.epm.services", "messages");
var MESSAGES = $.sap.hana.democontent.epm.services.messages;
await $.import("sap.hana.democontent.epm.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epm.services.session;

async function getFilter() {
    function createFilterEntry(rs, attribute, obj) {
       
        console.log("add " + rs.getNString(1) + " " + rs.getNString(2) + " obj " + obj);
        return {
            "terms": rs.getNString(1),
            "attribute": rs.getNString(2)
        };
    }

    var body = '';
    var terms = encodeURI($.request.parameters.get('query'));
    
    var termList = terms.split(" ");
    var termStr = "";
    var i;
    for (i = 0; i < termList.length && i < 50; i++) {
        termStr += termList[i].replace(/\s+/g, '') + "* ";
    }
    terms = termStr;
	
    try {
    	var conn = await $.db.getConnection();
    	var pstmt;
    	var rs;
    	var query;
		var list = [];
		var str = termStr.split("*"); 
		var isNumbericString = str[0];
		console.log("termstr "+str);
		if(isNaN(isNumbericString)){
			console.log("is Nan");
			try{
		        // Business Partner Company Name
		       // query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(COMPANYNAME) FROM "MD.BusinessPartner" ' + ' WHERE CONTAINS(COMPANYNAME,?)';
		       query = 'SELECT * FROM "text_search"(?,?)';
		        pstmt = await conn.prepareStatement(query);
		        pstmt.setString(1, terms);
		        pstmt.setString(2,"OTHERS");
		        rs = await pstmt.executeQuery();
		
		        while (await rs.next()) {
		        	
		            // list.push(createFilterEntry(rs, MESSAGES.getMessage('SEPM_POWRK',
		            //     '001'), "businessPartner"));
		            console.log("rs.getNString(2)"+rs.getNString(2)+"rs.getNString(1)"+rs.getNString(1));
		            list.push(createFilterEntry(rs, rs.getNString(2), "businessPartner"));
		                
		        }
			}catch(err){
	        	 $.trace.error("Exception raised:" + err+" message from company name search:"+err.message);
			}finally{
	        	await rs.close();
	        	await pstmt.close();
			}
	        
	  //      try{
		 //       // Business Partner City
		 //      // query = 'SELECT "CITY" FROM "get_city"(?)';
		 //       query = 'SELECT "RESULTS" FROM "text_search"(?,?)';
		 //       pstmt = await conn.prepareStatement(query);
		 //       pstmt.setString(1, terms);
		 //       pstmt.setString(2,"CITY");
		 //       rs = pstmt.executeQuery();
		
		 //       while (rs.next()) {
		 //           list.push(createFilterEntry(rs, MESSAGES.getMessage('SEPM_POWRK',
		 //               '007'), "businessPartner"));
		 //       }
	  //      }catch(err){
	  //      	 $.trace.error("Exception raised:" + err+" message from city search:"+err.message);
	  //      }finally{
	  //      	await rs.close();
	  //      	await pstmt.close();	
	  //      }
			
			// try{
		 //       // Product - Product Category
		 //       //query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(CATEGORY) FROM "MD.Products" ' + 'WHERE CONTAINS(CATEGORY,?)';
		 //       query = 'SELECT "RESULTS" FROM "text_search"(?,?)';
		 //       pstmt = await conn.prepareStatement(query);
		 //       pstmt.setString(1, terms);
		 //       pstmt.setString(2,"CATEGORY");
		 //       rs = pstmt.executeQuery();
		
		 //       while (rs.next()) {
		 //           list.push(createFilterEntry(rs, MESSAGES.getMessage('SEPM_POWRK',
		 //               '008'), "products"));
		 //       }
			// }catch(err){
			// 	$.trace.error("Exception raised:" + err+" message from product cateory search:"+err.message);
			// }finally{
			// 	await rs.close();
	  //      	await pstmt.close();
			// }
			
			// try{
		 //       // Product - Product ID
		 //       //query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(PRODUCTID) FROM "MD.Products" ' + 'WHERE CONTAINS(PRODUCTID,?)';
		 //       query = 'SELECT "RESULTS" FROM "text_search"(?,?)';
		 //       pstmt = await conn.prepareStatement(query);
		 //       pstmt.setString(1, terms);
		 //       pstmt.setString(2,"PRODUCTID");
		 //       rs = pstmt.executeQuery();
		
		 //       while (rs.next()) {
		 //           list.push(createFilterEntry(rs, MESSAGES.getMessage('SEPM_POWRK',
		 //               '009'), "products"));
		 //       }
		 //     }catch(err){
		 //     	 $.trace.error("Exception raised:" + err+" message from productId search:"+err.message);
		 //     }finally{
		 //     	await rs.close();
	  //      	 await pstmt.close();
		 //     }
    	  }else{
    	  	  console.log("inside else NaN");
			  try{
			     // PO - PO ID
			    // query = 'SELECT TOP 50 DISTINCT TO_NVARCHAR(PURCHASEORDERID) FROM "PO.Header" ' + 'WHERE CONTAINS(PURCHASEORDERID,?)';
			     query = 'SELECT * FROM "text_search"(?,?)';
			     pstmt = await conn.prepareStatement(query);
			     pstmt.setString(1, terms);
			     pstmt.setString(2,"PURCHASEORDERID");
			     rs = await pstmt.executeQuery();
			
			     while (await rs.next()) {
			         list.push(createFilterEntry(rs, rs.getNString(2), "purchaseOrder"));
			     }
			  }catch(err){
			  	$.trace.error("Exception raised:" + err+" message from purchaseorder id search:"+err.message);
			  }finally{
				await rs.close();
	        	await pstmt.close();	
			  }
    	  }
		  await conn.close();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.contentType = 'text/plain; charset=UTF-8';
        await $.response.setBody("Search failed due to an internal server error. Check logs for details");
        $.trace.error("Exception raised:" + e.message);
        return;
    }
    body = JSON.stringify(list);
    $.trace.debug(body);
    $.response.contentType = 'application/json';
    await $.response.setBody(body);
    $.response.status = $.net.http.OK;
}

async function getTotalOrders() {
    function createTotalEntry(rs) {
        return {
            "name": rs.GROUP1,
            "value": rs.AMOUNT1
        };
    }

    var body = '';
    var ivGroupBy = encodeURI($.request.parameters.get('groupby'));
   
    var ivCurrency = encodeURI($.request.parameters.get('currency'));
   
    var list = [];

    switch (ivGroupBy) {
        case "COMPANYNAME":
            break;
        case "CATEGORY":
            break;
        case "CITY":
            break;
        case "POSTALCODE":
            break;
        case "PRODUCTID":
            break;

        default:
            $.trace.error("HTTP:BAD_REQUEST" + $.net.http.BAD_REQUEST);
            $.response.status = $.net.http.BAD_REQUEST;
            $.response.contentType = 'text/plain; charset=UTF-8';
            await $.response.setBody(await MESSAGES.getMessage('SEPM_ADMIN', '000', ivGroupBy));
            return;

    }
    if (ivCurrency === null) {
        ivCurrency = "EUR";
    }
    ivCurrency = ivCurrency.substring(0, 3);


    var CheckUpperCase = new RegExp('[A-Z]{3}');

    if (CheckUpperCase.test(ivCurrency) === true) {
        try {
           var query = 'SELECT TOP 5 ' + ivGroupBy + ' AS GROUP1, SUM("CONVGROSSAMOUNT") AS AMOUNT1 FROM "sap.hana.democontent.epm.models::PURCHASE_COMMON_CURRENCY"' + ' (\'PLACEHOLDER\' = (\'$$IP_O_TARGET_CURRENCY$$\', \'' + ivCurrency + '\')) group by ' + ivGroupBy + ' order by sum("CONVGROSSAMOUNT") desc';
            $.trace.debug(query);
            var conn = await $.hdb.getConnection();
            var rs = await conn.executeQuery(query);


            for (var i = 0; i < rs.length; i++) {
                list.push(createTotalEntry(rs[i]));
             }

            await conn.close();
        } catch (e) {
            $.response.contentType = 'text/plain; charset=UTF-8';
            await $.response.setBody(e.message);
            $.trace.error("Exception raised:" + e.message);
            return;
        }

        body = JSON.stringify({
            "entries": list
        });

        $.response.contentType = 'application/json; charset=UTF-8';
        await $.response.setBody(body);
        $.response.status = $.net.http.OK;

    } else {
        $.trace.error("HTTP:BAD_REQUEST" + $.net.http.BAD_REQUEST);
        $.response.status = $.net.http.BAD_REQUEST;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_BOR_MESSAGES', '053', encodeURI(ivCurrency)));
        return;
    }
}

async function downloadExcel() {
    var body = '';

    try {
        var query = 'SELECT TOP 25000 "PurchaseOrderId", "PartnerId", "CompanyName", "CreatedByLoginName", "CreatedAt", "GrossAmount" ' + 'FROM "PO.HeaderView" order by "PurchaseOrderId"';

        $.trace.debug(query);
        var conn = await $.hdb.getConnection();
        var rs = await conn.executeQuery(query);

        body = await MESSAGES.getMessage('SEPM_POWRK', '002') + "\t" + // Purchase
            // Order ID
            await MESSAGES.getMessage('SEPM_POWRK', '003') + "\t" + // Partner ID
            await MESSAGES.getMessage('SEPM_POWRK', '001') + "\t" + // Company Name
            await MESSAGES.getMessage('SEPM_POWRK', '004') + "\t" + // Employee
            // Responsible
            await MESSAGES.getMessage('SEPM_POWRK', '005') + "\t" + // Created At
            await MESSAGES.getMessage('SEPM_POWRK', '006') + "\n"; // Gross Amount

        var i;
        for (i = 0; i < rs.length; i++) {
            body += rs[i].PurchaseOrderId + "\t" + rs[i].PartnerId + "\t" + rs[i].CompanyName + "\t" + rs[i].CreatedByLoginName + "\t" + rs[i].CreatedAt + "\t" + rs[i].GrossAmount + "\n";
        }
    } catch (e) {
      
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.contentType = 'text/plain; charset=UTF-8';
        await $.response.setBody("Excel download Failed.Check logs for details.");
        $.trace.error("Exception raised:" + e.message);
        return;
    }

    await $.response.setBody(body);
    $.response.contentType = 'application/vnd.ms-excel; charset=utf-16le';
    $.response.headers.set('Content-Disposition',
        'attachment; filename=Excel.xls');
    $.response.status = $.net.http.OK;
}

//Zip Functionality
async function downloadZip() {
    var body = '';

    try {

        var query = 'SELECT TOP 25000 "PurchaseOrderId", "PartnerId", "CompanyName", "CreatedByLoginName", "CreatedAt", "GrossAmount" ' + 'FROM "PO.HeaderView" order by "PurchaseOrderId"';

        $.trace.debug(query);
        var conn = await $.hdb.getConnection();
        var rs = await conn.executeQuery(query);

        body = await MESSAGES.getMessage('SEPM_POWRK', '002') + "\t" + // Purchase
            // Order ID
            await MESSAGES.getMessage('SEPM_POWRK', '003') + "\t" + // Partner ID
            await MESSAGES.getMessage('SEPM_POWRK', '001') + "\t" + // Company Name
            await MESSAGES.getMessage('SEPM_POWRK', '004') + "\t" + // Employee
            // Responsible
            await MESSAGES.getMessage('SEPM_POWRK', '005') + "\t" + // Created At
            await MESSAGES.getMessage('SEPM_POWRK', '006') + "\n"; // Gross Amount

        var i;
        for (i = 0; i < rs.length; i++) {
            body += rs[i].PurchaseOrderId + "\t" + rs[i].PartnerId + "\t" + rs[i].CompanyName + "\t" + rs[i].CreatedByLoginName + "\t" + rs[i].CreatedAt + "\t" + rs[i].GrossAmount + "\n";
        }

        var zip = await new $.util.Zip();
        zip["Excel.xls"] = body;

        $.response.status = $.net.http.OK;
        $.response.contentType = "application/zip";
        $.response.headers.set('Content-Disposition', "attachment; filename = Purchase.zip");
        await $.response.setBody(zip.asArrayBuffer());

    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.contentType = 'text/plain; charset=UTF-8';
        await $.response.setBody("Zipping data Failed. Check logs for details.");
        $.trace.error("Exception raised:" + e.message);
        return;
    }
}
//end of zip

var aCmd = encodeURI($.request.parameters.get('cmd'));
switch (aCmd) {
    case "filter":
        await getFilter();
        break;
    case "getTotalOrders":
        await getTotalOrders();
        break;
    case "Excel":
        await downloadExcel();
        break;
    case "Zip":
        await downloadZip();
        break;
    case "getSessionInfo":
        await SESSIONINFO.fillSessionInfo();
        break;
    default:
        $.trace.error("Error:INTERNAL SERVER ERROR" + $.net.http.INTERNAL_SERVER_ERROR);
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.contentType = 'text/plain; charset=UTF-8';
        await $.response.setBody(await MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
}
export default {MESSAGES,SESSIONINFO,getFilter,getTotalOrders,downloadExcel,downloadZip,aCmd};
