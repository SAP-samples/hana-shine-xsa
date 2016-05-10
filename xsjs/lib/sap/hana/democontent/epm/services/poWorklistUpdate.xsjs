$.import("sap.hana.democontent.epm.services", "messages");
var MESSAGES = $.sap.hana.democontent.epm.services.messages;


function deletePO() {
    var body = '';
    var purchaseOrderID = $.request.parameters.get('PurchaseOrderId');
    purchaseOrderID = purchaseOrderID.replace("'", "");
    if (purchaseOrderID === null) {
        $.response.status = $.net.http.BAD_REQUEST;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '012'));
        return;
    }

    var conn = $.db.getConnection();
    var pstmt;
    var rs;
    var query;

    try {
        // Read Current Status for PO
        query = 'SELECT LIFECYCLESTATUS, APPROVALSTATUS, CONFIRMSTATUS, ORDERINGSTATUS, INVOICINGSTATUS ' + 'from "sap.hana.democontent.epm.data::PO.Header" where PURCHASEORDERID = ?';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, purchaseOrderID);
        rs = pstmt.executeQuery();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }

    if (!rs.next()) {
        $.response.status = $.net.http.BAD_REQUEST;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '013',
            encodeURI(purchaseOrderID))); // Invalid purchase order number specified
        return;
    }

    // If Lifecycle is Closed; can't delete
    if (rs.getNString(1) === "C") {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        // Closed purchase orders can not be deleted
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '014'));
        return;
    }

    // If Lifecycle is Cancelled; can't delete
    if (rs.getNString(1) === "X") {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '015',
            encodeURI(purchaseOrderID))); // Purchase Order &1 has already been
        // deleted
        return;
    }

    // If Approval is Approved; can't delete
    if (rs.getNString(2) === "A") {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '016')); // Approved
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
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '017')); // Confirmed
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
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '018')); // Confirmed
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
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '019')); // Delivered
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
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '020')); // Invoiced
        // Purchase
        // Orders
        // can
        // not
        // be
        // delete
        return;
    }

    rs.close();
    pstmt.close();

    try {
        // Update Purchase Order Status in order to delete it
        query = "UPDATE \"sap.hana.democontent.epm.data::PO.Header\" set LIFECYCLESTATUS = 'X' where PURCHASEORDERID = ?";
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, purchaseOrderID);
        pstmt.executeUpdate();
        pstmt.close();
        conn.commit();

        conn.close();
    } catch (error) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(error.message);
        return;
    }

    body = MESSAGES.getMessage('SEPM_POWRK', '021'); // Success
    $.trace.debug(body);
    $.response.contentType = 'application/text';
    $.response.setBody(body);
    $.response.status = $.net.http.OK;

}

function approvePO() {
    var body = '';
    var purchaseOrderID = $.request.parameters.get('PurchaseOrderId');
    purchaseOrderID = purchaseOrderID.replace("'", "");
    if (purchaseOrderID === null) {
        $.response.status = $.net.http.BAD_REQUEST;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '012')); // No
        // purchase
        // order
        // specified
        return;
    }
    var action = $.request.parameters.get('Action');
    if (action === null) {
        $.response.status = $.net.http.BAD_REQUEST;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '022')); // No
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
            $.response.status = $.net.http.BAD_REQUEST;
            $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '023', encodeURI(action))); // Action
            // &1
            // is
            // an
            // invalid
            // choice
            return;
    }
    var conn = $.db.getConnection();
    var pstmt;
    var rs;
    var query;

    try {
        // Read Current Status for PO
        query = 'SELECT LIFECYCLESTATUS, APPROVALSTATUS, CONFIRMSTATUS, ORDERINGSTATUS, INVOICINGSTATUS ' + 'from "sap.hana.democontent.epm.data::PO.Header" where PURCHASEORDERID = ?';
        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, purchaseOrderID);
        rs = pstmt.executeQuery();
    } catch (e) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(e.message);
        return;
    }

    if (!rs.next()) {
        $.response.status = $.net.http.BAD_REQUEST;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '013',
            encodeURI(purchaseOrderID))); // Invalid purchase order number specified
        return;
    }

    // If Lifecycle is Closed; can't approve or reject
    if (rs.getNString(1) === "C") {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '024')); // Closed
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
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '025')); // Deleted
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
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '026')); // Confirmed
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
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '027')); // Confirmed
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
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '028')); // Delivered
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
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(MESSAGES.getMessage('SEPM_POWRK', '029')); // Invoiced
        // Purchase
        // Orders
        // can
        // not
        // be
        // rejected
        return;
    }

    try {
        rs.close();
        pstmt.close();

        // Update Purchase Order Status in order to delete it
        if (action === "Reject") {
            query = "UPDATE \"sap.hana.democontent.epm.data::PO.Header\" set APPROVALSTATUS = 'R' where PURCHASEORDERID = ?";
        }

        if (action === "Accept") {
            query = "UPDATE \"sap.hana.democontent.epm.data::PO.Header\" set APPROVALSTATUS = 'A' where PURCHASEORDERID = ?";
        }

        pstmt = conn.prepareStatement(query);
        pstmt.setString(1, purchaseOrderID);
        pstmt.executeUpdate();
        pstmt.close();
        conn.commit();

        conn.close();
    } catch (error) {
        $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
        $.response.setBody(error.message);
        return;
    }

    body = MESSAGES.getMessage('SEPM_POWRK', '021'); // Success
    $.trace.debug(body);
    $.response.contentType = 'application/text';
    $.response.setBody(body);
    $.response.status = $.net.http.OK;

}

var aCmd = $.request.parameters.get('cmd');
switch (aCmd) {
    case "delete":
        deletePO();
        break;
    case "approval":
        approvePO();
        break;
    default:
        $.response.status = $.net.http.BAD_REQUEST;
        $.response.setBody(MESSAGES.getMessage('SEPM_ADMIN', '002', encodeURI(aCmd)));
}