var purchaseOrder = await $.import("xsjs.JavaScriptBasics", "purchaseOrder");

async function objectsAdv(){
	var body = '';
	var inputPO = encodeURI($.request.parameters.get('po'));
	inputPO = typeof inputPO !== 'undefined' ? inputPO : '300000000'; 
	
	body += '<b>Object Advanced</b><br>';
	var po = await new purchaseOrder.header(inputPO);
	body +=  '<b>Purchase Order: </b>' + po.PurchaseOrderId + ' <b>Gross Amount: </b>'+ po.GrossAmount 
	      + ' <b>Discount Amount: </b>'+ po.DiscountAmount() +' <b>Company Name: </b>'+ po.Buyer.CompanyName
	      + ' <b>Created At: </b>' + po.CreatedAt.toLocaleDateString()	      
	      + '</br>';
	for(var i = 0; i < po.Items.length; i++){
    	body += '&nbsp&nbsp&nbsp<b>Item: </b>' + po.Items[i].ItemPos 
    	       +' <b>Product ID: </b>'+ po.Items[i].ProductID 
    	       +' <b>Product Category: </b>'+ po.Items[i].Product.Product_Category 
    	       +' </p>';
    }
	
	
	//Inheritance - Override Discount Calculation to be an additional 15%
	purchaseOrder.header.prototype.DiscountAmountDeep = function () {
		return (this.DiscountAmount() - this.GrossAmount * '.15');
	};	
	
	body += '<b>Object Advanced - Inherited DiscountAmount</b><br>';
	var po = await new purchaseOrder.header(inputPO);
	body +=  '<b>Purchase Order: </b>' + po.PurchaseOrderId + ' <b>Gross Amount: </b>'+ po.GrossAmount 
	      + ' <b>Discount Amount: </b>'+ po.DiscountAmountDeep() +' <b>Company Name: </b>'+ po.Buyer.CompanyName
	      + ' <b>Created At: </b>' + po.CreatedAt.toLocaleDateString()	      
	      + '</br>';
	for(var i = 0; i < po.Items.length; i++){
    	body += '&nbsp&nbsp&nbsp<b>Item: </b>' + po.Items[i].ItemPos 
    	       +' <b>Product ID: </b>'+ po.Items[i].ProductID 
    	       +' <b>Product Category: </b>'+ po.Items[i].Product.Product_Category 
    	       +' </p>';
    }
	
	
	$.response.status = $.net.http.OK;
	$.response.contentType = "text/html";
	await $.response.setBody(body);
}

async function getObjectsJSON(){
	var inputPO = encodeURI($.request.parameters.get('po'));
	inputPO = typeof inputPO !== 'undefined' ? inputPO : '0300000000'; 
	var po = await new purchaseOrder.header(inputPO);
	var poJson = {"purchaseOrder": po};
	
	var body = JSON.stringify(poJson);
	
	$.response.contentType = 'application/json';
	await $.response.setBody(body);
	$.response.status = $.net.http.OK;
	
}

var aCmd = encodeURI($.request.parameters.get('cmd'));
switch (aCmd) {
case "json":
	await getObjectsJSON();
	break;
default:
	await objectsAdv();
}
export default {purchaseOrder,objectsAdv,getObjectsJSON,aCmd};
