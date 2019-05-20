sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller,MessageBox) {
	"use strict";

	return Controller.extend("com.sap.refapps.shine.web.controller.details", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("details").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			this.getSalesOrderDetails(oEvent.getParameter("arguments").salesOrderId);
		},
		onBack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteView1", true);
		},
		getSalesOrderItems: function(salesOrderId){
				var that = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/salesOrder.xsjs?cmd=GETSALESORDERITEMS&ID="+salesOrderId,
				contentType: "application/json",
				success: function (data, textStatus, request) {
					var oData = {
						"salesOrderItems": data
					};
					//salesOrders = data;
					// create JSON model instance
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oModel.setDefaultBindingMode("TwoWay");
					that.getView().byId("soitemtable").setModel(oModel);
				},
				error: function (err) {
					MessageBox.error("Error in fetching sales order items");
				}
			});
		},
		getSalesOrderDetails: function(salesOrderId){
			var that = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/salesOrder.xsjs?cmd=GETSALESORDERBYID&ID="+salesOrderId,
				contentType: "application/json",
				success: function (data, textStatus, request) {
					var oData = {
						"salesOrderDetails": data[0]
					};
					//salesOrders = data;
					// create JSON model instance
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oModel.setDefaultBindingMode("TwoWay");
					that.getView().byId("salesdetails").setModel(oModel);
					that.getView().byId("salesitems").setModel(oModel);
					that.getSalesOrderItems(salesOrderId);
				},
				error: function (err) {
					MessageBox.error("Error in fetching sales orders details");
				}
			});

		}
	});
});