try{
	var conn = $.db.getConnection();
    var pstmt = conn.prepareStatement("CALL \"train\"()");
    pstmt.executeQuery();
    conn.commit();

    $.response.status = $.net.http.OK;
    $.response.setBody("Model has been updated");
}catch(e){
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
    $.response.setBody("Error occurred during train model.");
}