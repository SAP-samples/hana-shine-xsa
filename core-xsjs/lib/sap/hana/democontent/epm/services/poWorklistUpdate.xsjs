await $.import("sap.hana.democontent.epm.services", "messages");
var MESSAGES = $.sap.hana.democontent.epm.services.messages;


async function deletePO() {
    var body = '';
    
    console.log("info  "+ $.request.body.asString());
    var obj = $.request.body.asString();
    console.log("body "+obj);
    var map = JSON.parse(obj);
    console.log("map "+map);
    var purchaseOrderID = map.payload[0].purchaseOrderId;
     console.log("info  "+ purchaseOrderID);
    purchaseOrderID = purchaseOrderID.replace("'", "");
    if (purchaseOrderID === null) {
        $.trace.error("Error:BAD_REQUEST" + $.net.http.BAD_REQUEST);
        $.response.status = $.net.http.BAD_REQUEST;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '012'));
        return;
    }

    var conn = await $.db.getConnection();
    var pstmt;
    var rs;
    var query;

    try {
        // Read Current Status for PO
        query = 'SELECT LIFECYCLESTATUS, APPROVALSTATUS, CONFIRMSTATUS, ORDERINGSTATUS, INVOICINGSTATUS ' + 'from "PO.Header" where PURCHASEORDERID = ?';
        pstmt = await conn.prepareStatement(query);
        pstmt.setString(1, purchaseOrderID);
        rs = await pstmt.executeQuery();
    } catch (e) {
        $.trace.error("Exception Raised" + e.message);
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody("Deletion of Purchase Order failed. Check logs for details");
        return;
    }

    if (! await rs.next()) {
        $.trace.error("Error:BAD_REQUEST" + $.net.http.BAD_REQUEST);
        $.response.status = $.net.http.BAD_REQUEST;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '013',
            encodeURI(purchaseOrderID))); // Invalid purchase order number specified
        return;
    }

    // If Lifecycle is Closed; can't delete
    if (rs.getNString(1) === "C") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '014'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        // Closed purchase orders can not be deleted
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '014'));
        return;
    }

    // If Lifecycle is Cancelled; can't delete
    if (rs.getNString(1) === "X") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '015',
            encodeURI(purchaseOrderID)));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '015',
            encodeURI(purchaseOrderID))); // Purchase Order &1 has already been
        // deleted
        return;
    }

    // If Approval is Approved; can't delete
    if (rs.getNString(2) === "A") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '016'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '016')); // Approved
        // Purchase
        // Orders
        // can
        // not
        // be
        // deleted
        return;
    }

    // If Confirmed is Confirmed; can't delete
    if (rs.getNString(3) === "C") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '017'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '017')); // Confirmed
        // Purchase
        // Orders
        // can
        // not
        // be
        // deleted
        return;
    }

    // If Confirmed is Sent; can't delete
    if (rs.getNString(3) === "S") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '018'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '018')); // Confirmed
        // Purchase
        // Orders
        // which
        // have
        // been
        // sent
        // to
        // the
        // partner
        // can
        // not
        // be
        // delete
        return;
    }

    // If Delivered; can't delete
    if (rs.getNString(4) === "D") {
        $.trace.error( await MESSAGES.getMessage('SEPM_POWRK', '019'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '019')); // Delivered
        // Purchase
        // Orders
        // can
        // not
        // be
        // deleted
        return;
    }

    // If Invoiced; can't delete
    if (rs.getNString(5) === "D") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '020'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '020')); // Invoiced
        // Purchase
        // Orders
        // can
        // not
        // be
        // delete
        return;
    }

    await rs.close();
    await pstmt.close();

    try {
        // Update Purchase Order Status in order to delete it
        query = "UPDATE \"PO.Header\" set LIFECYCLESTATUS = 'X' where PURCHASEORDERID = ?";
        pstmt = await conn.prepareStatement(query);
        pstmt.setString(1, purchaseOrderID);
        await pstmt.executeUpdate();
        await pstmt.close();
        await conn.commit();

        await conn.close();
    } catch (error) {
        $.trace.error("INTERNAL SERVER ERROR" + error.message);
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody("Lifecycle Update Failed. Check logs for details");
        return;
    }

    body = await MESSAGES.getMessage('SEPM_POWRK', '021'); // Success
    $.trace.debug(body);
    $.response.contentType = 'application/text';
    await $.response.setBody(body);
    $.response.status = $.net.http.OK;

}

async function approvePO() {
    var body = '';
    var obj = $.request.body.asString();
    console.log("body "+obj);
    var map = JSON.parse(obj);
    console.log("map "+map);
    var purchaseOrderID = map.payload[0].purchaseOrderId;
    var action = map.payload[1].Action;
    console.log("key "+purchaseOrderID+ "action "+action);
    
    purchaseOrderID = purchaseOrderID.replace("'", "");
    if (purchaseOrderID === null) {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '012'));
        $.response.status = $.net.http.BAD_REQUEST;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '012')); // No
        // purchase
        // order
        // specified
        return;
    }
    
    if (action === null) {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '022'));
        $.response.status = $.net.http.BAD_REQUEST;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '022')); // No
        // Purchase
        // Order
        // Action
        // Supplied
        return;
    }

    switch (action) {
        case "Reject":
            break;
        case "Accept":
            break;
        default:
            $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '023', encodeURI(action)));
            $.response.status = $.net.http.BAD_REQUEST;
            await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '023', encodeURI(action))); // Action
            // &1
            // is
            // an
            // invalid
            // choice
            return;
    }
    var conn = await $.db.getConnection();
    var pstmt;
    var rs;
    var query;

    try {
        // Read Current Status for PO
        query = 'SELECT LIFECYCLESTATUS, APPROVALSTATUS, CONFIRMSTATUS, ORDERINGSTATUS, INVOICINGSTATUS ' + 'from "PO.Header" where PURCHASEORDERID = ?';
        pstmt = await conn.prepareStatement(query);
        pstmt.setString(1, purchaseOrderID);
        rs = await pstmt.executeQuery();
    } catch (e) {
        $.trace.error("INTERNAL SERVER ERROR" + e.message);
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody("Approval of Purchase Order failed. Check logs for details");
        return;
    }

    if (! await rs.next()) {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '013',
            encodeURI(purchaseOrderID)));
        $.response.status = $.net.http.BAD_REQUEST;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '013',
            encodeURI(purchaseOrderID))); // Invalid purchase order number specified
        return;
    }

    // If Lifecycle is Closed; can't approve or reject
    if (rs.getNString(1) === "C") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '024'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '024')); // Closed
        // purchase
        // orders
        // can
        // not
        // be
        // accepted
        // or
        // rejected
        return;
    }

    // If Lifecycle is Cancelled; can't delete
    if (rs.getNString(1) === "X") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '025'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '025')); // Deleted
        // purchase
        // orders
        // can
        // not
        // be
        // accepted
        // or
        // rejected
        return;
    }

    // If Confirmed is Confirmed; can't delete
    if (rs.getNString(3) === "C") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '026'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '026')); // Confirmed
        // Purchase
        // Orders
        // can
        // not
        // be
        // rejected
        return;
    }

    // If Confirmed is Sent; can't delete
    if (rs.getNString(3) === "S") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '027'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '027')); // Confirmed
        // Purchase
        // Orders
        // which
        // have
        // been
        // sent
        // to
        // the
        // partner
        // can
        // not
        // be
        // rejected
        return;
    }

    // If Delivered; can't delete
    if (rs.getNString(4) === "D") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '028'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '028')); // Delivered
        // Purchase
        // Orders
        // can
        // not
        // be
        // rejected
        return;
    }

    // If Invoiced; can't delete
    if (rs.getNString(5) === "D") {
        $.trace.error(await MESSAGES.getMessage('SEPM_POWRK', '029'));
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_POWRK', '029')); // Invoiced
        // Purchase
        // Orders
        // can
        // not
        // be
        // rejected
        return;
    }

    try {
        await rs.close();
        await pstmt.close();

        // Update Purchase Order Status in order to delete it
        if (action === "Reject") {
            query = "UPDATE \"PO.Header\" set APPROVALSTATUS = 'R' where PURCHASEORDERID = ?";
        }

        if (action === "Accept") {
            query = "UPDATE \"PO.Header\" set APPROVALSTATUS = 'A' where PURCHASEORDERID = ?";
        }

        pstmt = await conn.prepareStatement(query);
        pstmt.setString(1, purchaseOrderID);
        await pstmt.executeUpdate();
        await pstmt.close();
        await conn.commit();

        await conn.close();
    } catch (error) {
        $.trace.error("INTERNAL SERVER ERROR" + error.message);
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        await $.response.setBody("Updation of approval status failed. Check logs for details");
        return;
    }

    body = await MESSAGES.getMessage('SEPM_POWRK', '021'); // Success
    $.trace.debug(body);
    $.response.contentType = 'application/text';
    await $.response.setBody(body);
    $.response.status = $.net.http.OK;

}

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
    case "delete":
        await deletePO();
        break;
    case "approval":
        await approvePO();
        break;
    default:
        $.trace.error("BAD REQUEST" + $.net.http.BAD_REQUEST);
        $.response.status = $.net.http.BAD_REQUEST;
        await $.response.setBody(await MESSAGES.getMessage('SEPM_ADMIN', '002', encodeURI(aCmd)));
}
export default {MESSAGES,deletePO,approvePO,aCmd};
