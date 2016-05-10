function fillSessionInfo() {
    var body = '';
    body = JSON.stringify({
        "session": [{
            "UserName": $.session.getUsername(),
            "Language": $.session.language
        }]
    });
    $.response.contentType = 'application/json';
    $.response.setBody(body);
    $.response.status = $.net.http.OK;
}


function escapeSpecialChars(input) {
    if (input !== 'undefined' && input !== null) {
        return input
            .replace(/[\\]/g, '\\\\')
            .replace(/[\"]/g, '\\\"')
            .replace(/[\/]/g, '\\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    }

    return "";

}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

function calcTomorrow() {
    var ts = addMinutes(new Date(), (24 * 60));
    return JSON.stringify(ts).substring(1, 24);
}

function getSessionId() {
    var sessionId = $.request.cookies.get('xsUtilSession') || null;
    if (sessionId === null) {
        var conn = $.db.getConnection();
        var pstmt;
        var rs;
        var query = 'select "sap.hana.democontent.epm.data::sessionId".NEXTVAL from dummy';
        pstmt = conn.prepareStatement(query);
        rs = pstmt.executeQuery();
        while (rs.next()) {
            sessionId = rs.getInteger(1).toString();
            $.response.cookies.set('xsUtilSession', sessionId);
        }
    }
    return sessionId;
}

function recordSetToJSON(rs, rsName) {
    rsName = rsName !== 'undefined' ? rsName : 'entries';

    var meta = rs.getMetaData();
    var colCount = meta.getColumnCount();
    var values = [];
    var table = [];
    var value = "";
    var i = 1;
    while (rs.next()) {
        for (i = 1; i <= colCount; i++) {
            value = '"' + meta.getColumnLabel(i) + '" : ';
            switch (meta.getColumnType(i)) {
                case $.db.types.VARCHAR:
                case $.db.types.CHAR:
                    value += '"' + escapeSpecialChars(rs.getString(i)) + '"';
                    break;
                case $.db.types.NVARCHAR:
                case $.db.types.NCHAR:
                case $.db.types.SHORTTEXT:
                    value += '"' + escapeSpecialChars(rs.getNString(i)) + '"';
                    break;
                case $.db.types.TINYINT:
                case $.db.types.SMALLINT:
                case $.db.types.INT:
                case $.db.types.BIGINT:
                    value += rs.getInteger(i);
                    break;
                case $.db.types.DOUBLE:
                    value += rs.getDouble(i);
                    break;
                case $.db.types.DECIMAL:
                    value += rs.getDecimal(i);
                    break;
                case $.db.types.REAL:
                    value += rs.getReal(i);
                    break;
                case $.db.types.NCLOB:
                case $.db.types.TEXT:
                    value += '"' + escapeSpecialChars(rs.getNClob(i)) + '"';
                    break;
                case $.db.types.CLOB:
                    value += '"' + escapeSpecialChars(rs.getClob(i)) + '"';
                    break;
                case $.db.types.BLOB:
                    value += '"' + $.util.convert.encodeBase64(rs.getBlob(i)) + '"';
                    break;
                case $.db.types.DATE:
                    value += '"' + rs.getDate(i) + '"';
                    break;
                case $.db.types.TIME:
                    value += '"' + rs.getTime(i) + '"';
                    break;
                case $.db.types.TIMESTAMP:
                    value += '"' + rs.getTimestamp(i) + '"';
                    break;
                case $.db.types.SECONDDATE:
                    value += '"' + rs.getSeconddate(i) + '"';
                    break;
                default:
                    value += '"' + escapeSpecialChars(rs.getString(i)) + '"';
            }
            values.push(value);
        }
        table.push('{' + values + '}');
    }
    return JSON.parse('{"' + rsName + '" : [' + table + ']}');

}

function get_session_variable(name, application) {
    var sessionId = getSessionId();
    var conn = $.db.getConnection();
    var cstmt;
    var rs;
    var output = '';
    var query = 'CALL "sap.hana.democontent.epm.procedures::get_session_variable"(?,?,?,?)';
    cstmt = conn.prepareCall(query);
    cstmt.setString(1, sessionId);
    cstmt.setString(2, name);
    cstmt.setString(3, application);
    var bSuccess = cstmt.execute();
    if (!bSuccess) {
        return bSuccess;
    }
    rs = cstmt.getResultSet();
    if (!rs) {
        return false;
    }
    while (rs.next()) {
        output = rs.getNClob(5);
    }
    cstmt.close();
    conn.commit();
    conn.close();
    if (output === '') {
        return false;
    }
    return output;

}

function get_session_variables(application) {
    var sessionId = getSessionId();
    var conn = $.db.getConnection();
    var cstmt;
    var rs;
    var query = 'CALL "sap.hana.democontent.epm.procedures::get_session_variables" (?,?,?)';
    cstmt = conn.prepareCall(query);
    cstmt.setString(1, sessionId);
    cstmt.setString(2, application);
    var bSuccess = cstmt.execute();
    if (!bSuccess) {
        return bSuccess;
    }
    rs = cstmt.getResultSet();
    if (!rs) {
        return false;
    }
    var jsonOut = recordSetToJSON(rs);
    cstmt.close();
    conn.commit();
    conn.close();

    return jsonOut;
}

function set_session_variable(name, application, value, expiry) {
    var sessionId = getSessionId();
    expiry = expiry !== 'undefined' ? expiry : calcTomorrow();

    var conn = $.db.getConnection();
    var cstmt;
    var query = 'CALL "sap.hana.democontent.epm.procedures::set_session_variable"(?,?,?,?,?)';
    cstmt = conn.prepareCall(query);
    cstmt.setString(1, sessionId);
    cstmt.setString(2, name);
    cstmt.setString(3, application);
    cstmt.setTimestamp(4, expiry);
    cstmt.setNClob(5, value.toString());
    var bSuccess = cstmt.execute();
    if (!bSuccess) {
        return bSuccess;
    }
    cstmt.close();
    conn.commit();
    conn.close();
    return true;
}

function get_application_variable(name, application) {
    var conn = $.db.getConnection();
    var cstmt;
    var rs;
    var output = '';
    var query = 'CALL "sap.hana.democontent.epm.procedures::get_application_variable"(?,?,?)';
    cstmt = conn.prepareCall(query);
    cstmt.setString(1, name);
    cstmt.setString(2, application);
    var bSuccess = cstmt.execute();
    if (!bSuccess) {
        return bSuccess;
    }
    rs = cstmt.getResultSet();
    if (!rs) {
        return false;
    }
    while (rs.next()) {
        output = rs.getNClob(5);
    }
    cstmt.close();
    conn.commit();
    conn.close();
    if (output === '') {
        return false;
    }
    return output;
}

function get_application_variables(application) {
    var conn = $.db.getConnection();
    var cstmt;
    var rs;
    var query = 'CALL "sap.hana.democontent.epm.procedures::get_application_variables"(?,?)';
    cstmt = conn.prepareCall(query);
    cstmt.setString(1, application);
    var bSuccess = cstmt.execute();
    if (!bSuccess) {
        return bSuccess;
    }
    rs = cstmt.getResultSet();
    if (!rs) {
        return false;
    }
    var jsonOut = recordSetToJSON(rs);
    cstmt.close();
    conn.commit();
    conn.close();

    return jsonOut;
}

function set_application_variable(name, application, value, expiry) {
    expiry = expiry !== 'undefined' ? expiry : calcTomorrow();

    var conn = $.db.getConnection();
    var cstmt;
    var query = 'CALL "sap.hana.democontent.epm.procedures::set_application_variable"(?,?,?,?)';
    cstmt = conn.prepareCall(query);
    cstmt.setString(1, name);
    cstmt.setString(2, application);
    cstmt.setTimestamp(3, expiry);
    cstmt.setNClob(4, value.toString());
    var bSuccess = cstmt.execute();
    if (!bSuccess) {
        return bSuccess;
    }
    cstmt.close();
    conn.commit();
    conn.close();
    return true;
}