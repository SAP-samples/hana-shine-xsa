var conn = $.db.getConnection();
var pstmt;
var rs;
var query;

function base(){}
base.prototype.getValueFromRS = function(i, rs, meta){
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


function header(purchaseOrderId, schema) {
	
	//schema = typeof schema !== 'undefined' ? schema :  'SAP_HANA_EPM_NEXT'; 
	
	query = 'SELECT * FROM "PO.HeaderView" '
			+ ' WHERE "PurchaseOrderId" = ?';
	pstmt = conn.prepareStatement(query);
	pstmt.setString(1, purchaseOrderId);
	rs = pstmt.executeQuery();

	var meta = rs.getMetaData();
	while (rs.next()) {
		for (var i = 1; i <= meta.getColumnCount(); i++) {
			this[meta.getColumnLabel(i)] = this.getValueFromRS(i, rs, meta);
		}
	}
	rs.close();


	//Calculate Discount
	this.DiscountAmount = function() {
		return (this.GrossAmount - this.GrossAmount * '.10');
	};

	//Buyer Details
	this.Buyer = new buyer(this.PartnerId);

	//Get Items
	this.Items = [];
	query = 'SELECT "ItemPos" FROM "PO.ItemView" '
		+ ' WHERE "PurchaseOrderItemId" = ?';
	pstmt = conn.prepareStatement(query);
	pstmt.setString(1, purchaseOrderId);
	var rsItems = pstmt.executeQuery();
	while (rsItems.next()) {
	   this.Items.push(new item(this.PurchaseOrderId,rsItems.getNString(1)));
	}
	
	rsItems.close();
}
header.prototype = new base();

function buyer(partnerId) {

	query = 'SELECT * FROM "MDViews.BuyerView" '
			+ ' WHERE "Id" = ?';
	pstmt = conn.prepareStatement(query);
	pstmt.setString(1, partnerId);
	rs = pstmt.executeQuery();

	var meta = rs.getMetaData();
	while (rs.next()) {
		for (var i = 1; i <= meta.getColumnCount(); i++) {
			this[meta.getColumnLabel(i)] = this.getValueFromRS(i, rs, meta);
		}
	}

	rs.close();


}
buyer.prototype = new base();

function item(purchaseOrderId, itemPos){

	query = 'SELECT * FROM "PO.ItemView" '
			+ ' WHERE "PurchaseOrderItemId" = ? and "ItemPos" = ?';
	pstmt = conn.prepareStatement(query);
	pstmt.setString(1, purchaseOrderId);
	pstmt.setString(2, itemPos);	
	var rs = pstmt.executeQuery();

	var meta = rs.getMetaData();
	while (rs.next()) {
		for (var i = 1; i <= meta.getColumnCount(); i++) {
			this[meta.getColumnLabel(i)] = this.getValueFromRS(i, rs, meta);
		}
		//Product Details
		this.Product = new product(this.ProductID);
	}

	rs.close();
}
item.prototype = new base();

function product(productId) {

	query = 'SELECT * FROM "MDViews.ProductView" '
			+ ' WHERE "Product_Id" = ?';
	pstmt = conn.prepareStatement(query);
	pstmt.setString(1, productId);
	rs = pstmt.executeQuery();

	var meta = rs.getMetaData();
	while (rs.next()) {
		for (var i = 1; i <= meta.getColumnCount(); i++) {
			this[meta.getColumnLabel(i)] = this.getValueFromRS(i, rs, meta);
		}
	}

	rs.close();


}
product.prototype = new base();