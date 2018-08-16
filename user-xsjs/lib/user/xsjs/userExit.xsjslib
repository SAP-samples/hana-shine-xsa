function my_create_after_exit(param) {
    var after = param.afterTableName;
    //Get Input New Record Values
    var pStmt, FirstName,LastName,Email,rs;
    pStmt = FirstName = LastName = Email = null;
    try {
		console.log("inside...");
        pStmt = param.connection.prepareStatement('select * from "' + after + '"');
        rs = pStmt.executeQuery();
        while (rs.next()) {
            FirstName = rs.getString(2);
            LastName = rs.getString(3);
            Email = rs.getString(4);
        }

        pStmt = param.connection.prepareStatement('insert into "UserData.User" ("FirstName","LastName","Email") values(\''+FirstName+'\',\''+LastName+'\',\''+Email+'\')');
        // pStmt.setString(1, FirstName);
        // pStmt.setString(2, LastName);
        // pStmt.setString(3, Email);
        pStmt.executeUpdate();
        pStmt.close();
        console.log(FirstName);
console.log(LastName);
console.log(Email);

    } catch (e) {
    	console.log(e);
    	pStmt.close();
    }

}


function my_delete_after_exit(param) {
    var before = param.beforeTableName;
    //Get Input New Record Values
    var pStmt,UserId,rs;
    pStmt = UserId = null;
    try {
		console.log("inside...");
        pStmt = param.connection.prepareStatement('select * from "' + before + '"');
        rs = pStmt.executeQuery();
        while (rs.next()) {
            UserId = rs.getInteger(1);
      
        }
		console.log(UserId);
        pStmt = param.connection.prepareStatement('delete from "UserData.User" where "UserId"='+UserId);
        // pStmt.setString(1, FirstName);
        // pStmt.setString(2, LastName);
        // pStmt.setString(3, Email);
        pStmt.executeUpdate();
        pStmt.close();
     
    } catch (e) {
    	console.log(e);
    	pStmt.close();
    }

}


function my_update_after_exit(param) {
    var before = param.afterTableName;
    //Get Input New Record Values
    var pStmt,UserId,rs,FirstName,LastName,Email;
    pStmt = UserId = FirstName = LastName = Email = null;
    try {
		console.log("inside...");
        pStmt = param.connection.prepareStatement('select * from "' + before + '"');
        rs = pStmt.executeQuery();
        while (rs.next()) {
            UserId = rs.getInteger(1);
            FirstName = rs.getString(2);
            LastName = rs.getString(3);
            Email = rs.getString(4);
      
        }
		console.log(UserId);
		console.log(FirstName);
        pStmt = param.connection.prepareStatement('update "UserData.User" set "FirstName"=\''+FirstName+'\',"LastName"=\''+LastName+'\',"Email"=\''+Email+'\' where "UserId"='+UserId);
        // pStmt.setString(1, FirstName);
        // pStmt.setString(2, LastName);
        // pStmt.setString(3, Email);
        pStmt.executeUpdate();
        pStmt.close();
     
    } catch (e) {
    	console.log(e);
    	pStmt.close();
    }

}
