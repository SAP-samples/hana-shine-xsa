/* for impelementing level hierarchy*/
await $.import("sap.hana.democontent.epm.services", "messages");
var MESSAGES = $.sap.hana.democontent.epm.services.messages;
await $.import("sap.hana.democontent.epm.services", "session");
var SESSIONINFO = $.sap.hana.democontent.epm.services.session;

    var list = [];
    var body = '';
    
 function createTotalEntry(rs) {
        return {
            "COUNTRY": rs.COUNTRY,
            "TOTAL_SALES": rs.TOTAL_SALES
        };
     
 }
    
async function getHierarchyData()
{
    var conn = await $.hdb.getConnection();
    var region = encodeURI($.request.parameters.get('region'));
    region = region.replace("'", ""); 
    var rs;
try
{

  var query = 'SELECT  "COUNTRY",SUM("TOTAL_SALES") AS "TOTAL_SALES" FROM "sap.hana.democontent.epm.models/SALES_DYNAMIC_PARENT"'+' WHERE "COUNTRY" IN (SELECT "QUERY_NODE_NAME"'+
           ' FROM "sap.hana.democontent.epm.models/SALES_DYNAMIC_PARENT/REGION_COUNTRY_LEVEL/hier/REGION_COUNTRY_LEVEL"' +' WHERE PRED_NODE = ?)'+
            'GROUP BY "COUNTRY"';                

 rs = await conn.executeQuery(query, '[REGION].[' + region + ']');
  var i;
 
         for (i = 0; i < rs.length; i++) {
            list.push(createTotalEntry(rs[i]));
        }

        await conn.close();
} 
    
    catch (e)
    {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(e.message);
        return;
    }

    body = JSON.stringify({SalesByCountry:list});
    $.trace.debug(body);
    $.response.contentType = 'application/json';
    await $.response.setBody(body);
    $.response.status = $.net.http.OK;
}

var aCmd = encodeURI($.request.parameters.get('cmd'));
switch (aCmd) {
    case "getHierarchyData":
        await getHierarchyData();
        break;
  
    default:
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_ADMIN', '002', aCmd));
}   
export default {MESSAGES,SESSIONINFO,list,body,createTotalEntry,getHierarchyData,aCmd};


    
    
