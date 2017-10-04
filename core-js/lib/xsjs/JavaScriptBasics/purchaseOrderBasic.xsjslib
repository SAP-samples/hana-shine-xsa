/**
@author i809764 
**/
var conn = $.db.getConnection();
var pstmt;
var rs;
var query;

/**
@function base "class" with reusable functions
*/
function base() {
}

/**
@function takes a Record Set and returns the value based upon the metadata type
@param {int} i - counter for the current position in the record set
@param {object} rs - Record Set object
@param {object} meta - meta data object
@returns {*} the value for the current position in the record set
*/
base.prototype.getValueFromRS = function(i, rs, meta) {
	var value;
	switch (meta.getColumnType(i)) {
	case $.db.types.VARCHAR:
	case $.db.types.CHAR:
		value = rs.getString(i);
		break;
	case $.db.types.NVARCHAR:
	case $.db.types.NCHAR:
	case $.db.types.SHORTTEXT:
		value = rs.getNString(i);
		break;
	case $.db.types.TINYINT:
	case $.db.types.SMALLINT:
	case $.db.types.INT:
	case $.db.types.BIGINT:
		value = rs.getInteger(i);
		break;
	case $.db.types.DOUBLE:
		value = rs.getDouble(i);
		break;
	case $.db.types.DECIMAL:
		value = rs.getDecimal(i);
		break;
	case $.db.types.REAL:
		value = rs.getReal(i);
		break;
	case $.db.types.NCLOB:
		value = rs.getNClob(i);
		break;
	case $.db.types.TEXT:
		value = rs.getText(i);
		break;
	case $.db.types.CLOB:
		value = rs.getClob(i);
		break;
	case $.db.types.BLOB:
		value = rs.getBlob(i);
		break;
	case $.db.types.DATE:
		value = rs.getDate(i);
		break;
	case $.db.types.TIME:
		value = rs.getTime(i);
		break;
	case $.db.types.TIMESTAMP:
		value = rs.getTimestamp(i);
		break;
	case $.db.types.SECONDDATE:
		value = rs.getSeconddate(i);
		break;
	default:
		value = rs.getString(i);
	}
	return value;
};
/**
@function Check the input schema and default a value if not supplied 
@param {string} [schema] - Input Schema
@returns {string} Valid Schema
*/
base.prototype.checkSchema = function(schema) {
	schema = typeof schema !== 'undefined' ? schema : 'SAP_HANA_EPM_NEXT';
	return schema;
};
/**
@function Check the input Connect and default a value if not supplied
@param {object} [connection] - Connection Object
@returns {object} valid connection
*/
base.prototype.checkConnection = function(connection) {
	connection = typeof connection !== 'undefined' ? connection : conn;
	return connection;
};

/**
@function Constructor - Returns a PO Header Objects
@param {string} purchaseOrderId - Unique Key of the Purchase Order object
@param {string} [schema] - Input Schema
@param {object} [connection] - Connection Object
@returns {object} Purchase Order Header object
*/
function getHeader(purchaseOrderId, schema, connection) {

	schema = this.checkSchema(schema);
	connection = this.checkConnection(connection);

	query = 'SELECT * FROM "PO.Header" '
			+ ' WHERE PURCHASEORDERID = ?';
	pstmt = connection.prepareStatement(query);
	pstmt.setString(1, purchaseOrderId.toString());
	rs = pstmt.executeQuery();

	var meta = rs.getMetaData();
	while (rs.next()) {
		for (var i = 1; i <= meta.getColumnCount(); i++) {
			this[meta.getColumnLabel(i)] = this.getValueFromRS(i, rs, meta);
		}
	}
	rs.close();

	// Calculate Discount
	this.DiscountAmount = function() {
		return (this.GrossAmount - this.GrossAmount * '.10');
	};
}
getHeader.prototype = new base();

/**
@function Creates a new PO Header record
@param {object} header - PO Header object
@param {string} header.partnerId - Partner Id
@param {string} header.currency - Currency
@param {number} header.netAmount - Net Amount
@param {string} [purchaseOrderId] - Unique Key of the Purchase Order object
@param {string} [schema] - Input Schema
@param {object} [connection] - Connection Object
*/
function putHeader(purchaseOrderId, header, schema, connection ) {
	schema = this.checkSchema(schema); 
	connection = this.checkConnection(connection);
	purchaseOrderId = typeof purchaseOrderId !== 'undefined' ? purchaseOrderId : getNextPoId(connection);
	
	query = 'INSERT INTO ' 
	+ ' "PO.Header" ' 
	+ '(PURCHASEORDERID, "HISTORY.CREATEDBY.EMPLOYEEID", "HISTORY.CREATEDAT", "HISTORY.CHANGEDBY.EMPLOYEEID", "HISTORY.CHANGEDAT", '
	+ ' "PARTNER.PARTNERID", CURRENCY, GROSSAMOUNT, NETAMOUNT, TAXAMOUNT, LIFECYCLESTATUS, APPROVALSTATUS, CONFIRMSTATUS, ORDERINGSTATUS, INVOICINGSTATUS )'
	+ 'VALUES (?,?, now(), ?, now(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
	
	pstmt = connection.prepareStatement(query);
	pstmt.setString(1, purchaseOrderId.toString());
	pstmt.setString(2,'0000000033');  //Created By
	pstmt.setString(3,'0000000033');  //Changed By	
	pstmt.setString(4,header.partnerId);  
	pstmt.setString(5,header.currency);  
	
	var tax = header.netAmount * '.10';
	var gross = header.netAmount + tax;
	var net = header.netAmount * 1;
	pstmt.setDecimal(6,gross);
	pstmt.setDecimal(7,net);	
	pstmt.setDecimal(8,tax);
	
	pstmt.setString(9, 'N');  //Lifecycle - New   
	pstmt.setString(10, 'I');  //Approval - Initial  	
	pstmt.setString(11, 'I');  //Confirm - Initial
	pstmt.setString(12, 'I');  //Ordering - Initial
	pstmt.setString(13, 'I');  //Invoicing - Initial	
	
	rs = pstmt.execute();
	connection.commit();
	
}
putHeader.prototype = new base();

/**
@function Get the next PO Id from the Sequence
@param {object} connection - Connection Object
@returns {string} Purchase Order Id
*/
function getNextPoId(connection) {
	connection = checkConnection(connection);
	var pStmt = connection.prepareStatement('select "purchaseOrderId".NEXTVAL from DUMMY');
	var rs = pStmt.executeQuery();
	var purchaseOrderId = '';
	while (rs.next()) {
		purchaseOrderId = rs.getString(1);
	}
	pStmt.close();
	return purchaseOrderId;
}
getNextPoId.prototype = new base();