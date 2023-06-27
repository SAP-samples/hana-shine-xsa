var connection = await $.hdb.getConnection({"sqlcc": "xsjs.sqlcc_config", "pool": true });

var query = "SELECT CURRENT_USER FROM \"DUMMY\"";  
var rs = await connection.executeQuery(query);
var currentUser = rs[0].CURRENT_USER;

query = "SELECT SESSION_CONTEXT('APPLICATIONUSER') \"APPLICATION_USER\" FROM \"DUMMY\"";  
rs = await connection.executeQuery(query);
var applicationUser = rs[0].APPLICATION_USER;

var greeting = "XS Layer Session User: " + $.session.getUsername() +
               "</br>Database Current User: " + currentUser +
               "</br> Database Application User: " + applicationUser +
               "</br>Welcome to HANA ";


$.response.contentType = "text/html; charset=utf-8";
await $.response.setBody(greeting);
export default {connection,query,rs,currentUser,applicationUser,greeting};
