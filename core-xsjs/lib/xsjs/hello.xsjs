var connection = await $.hdb.getConnection();

var query = 'SELECT CURRENT_USER FROM "DUMMY"';  
var rs = await connection.executeQuery(query);
var currentUser = rs[0].CURRENT_USER;


var greeting = 'Hello Application User: ' + $.session.getUsername() +
               ' Database User: ' + currentUser +
               '! Welcome to HANA ';


$.response.contentType = 'text/plain; charset=utf-8';
await $.response.setBody(greeting);
export default {connection,query,rs,currentUser,greeting};
