async function my_create_after_exit(param) {
    var after = param.afterTableName;
    var pStmt, FirstName,LastName,Email,rs;
    pStmt = FirstName = LastName = Email = null;
    try {
		console.log("inside...");
        pStmt = await param.connection.prepareStatement('select * from "' + after + '"');
        rs = await pStmt.executeQuery();
        while (await rs.next()) {
            FirstName = rs.getString(2);
            LastName = rs.getString(3);
            Email = rs.getString(4);
        }
        pStmt = await param.connection.prepareStatement("insert into \"UserData.User\" values('"+FirstName+"','"+LastName+"','"+Email+"')");
        await pStmt.executeUpdate();
        await pStmt.close();
        console.log(FirstName);
        console.log(LastName);
        console.log(Email);
    } catch (e) {
    	console.log(e);
    	await pStmt.close();
    }
}

async function my_delete_after_exit(param) {
    var before = param.beforeTableName;
    var pStmt,UserId,rs;
    pStmt = UserId = null;
    try {
		console.log("inside...");
        pStmt = await param.connection.prepareStatement('select * from "' + before + '"');
        rs = await pStmt.executeQuery();
        while (await rs.next()) {
            UserId = rs.getInteger(1);
        }
		console.log(UserId);
        pStmt = await param.connection.prepareStatement('delete from "UserData.User" where "UserId"='+UserId);
        await pStmt.executeUpdate();
        await pStmt.close();
    } catch (e) {
    	console.log(e);
    	await pStmt.close();
    }
}

async function my_update_after_exit(param) {
    var before = param.afterTableName;
    var pStmt,UserId,rs,FirstName,LastName,Email;
    pStmt = UserId = FirstName = LastName = Email = null;
    try {
		console.log("inside...");
        pStmt = await param.connection.prepareStatement('select * from "' + before + '"');
        rs = await pStmt.executeQuery();
        while (await rs.next()) {
            UserId = rs.getInteger(1);
            FirstName = rs.getString(2);
            LastName = rs.getString(3);
            Email = rs.getString(4);
        }
		console.log(UserId);
		console.log(FirstName);
        pStmt = await param.connection.prepareStatement('update "UserData.User" set "FirstName"=\''+FirstName+'\',"LastName"=\''+LastName+'\',"Email"=\''+Email+'\' where "UserId"='+UserId);
        await pStmt.executeUpdate();
        await pStmt.close();
    } catch (e) {
    	console.log(e);
    	await pStmt.close();
    }
}

export default {my_create_after_exit,my_delete_after_exit,my_update_after_exit};