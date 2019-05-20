sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/Dialog"
], function (Controller, MessageBox, Dialog) {
	"use strict";

	return Controller.extend("com.sap.refapps.shine.web.controller.main", {

		onInit: function () {
			var backBtn = this.getView().byId("backBtn");
			backBtn.setVisible(false);
		},
		onNext: function () {
			var carousel = this.getView().byId("carousel");
			carousel.next();
		},
		onPrev: function () {
			var carousel = this.getView().byId("carousel");
			carousel.previous();
		},
		handleCheckbox: function () {
			var flag = this.getView().byId("helpCheckbox").getSelected();
			if (flag) {
				window.sessionStorage.setItem("help", flag);
			} else {
				window.sessionStorage.setItem("help", flag);
			}
		},
		onAfterRendering: function () {
			if (this.getView() === 'ALL') {
				this.onRefresh();
			} else if (this.getView() === 'NEW') {
				this.onRefresh1();
			} else {
				this.onRefresh();
			}
			//render help dialog based on checkbox value
			var val = window.sessionStorage.getItem("help");
			if (!val) {
				this.renderHelpDialog();
			}

		},
		closeHelpDialog: function () {
			var dialog = this.getView().byId("helpDialog");
			dialog.destroy();
		},
		openHelpDialog: function () {
			this.renderHelpDialog();
		},
		renderHelpDialog: function () {
			var oView = this.getView();
			var dialog = this.getView().byId("helpDialog");
			if (!dialog) {
				dialog = sap.ui.xmlfragment(oView.getId(), "com.sap.refapps.shine.web.view.help", this);
				this.getView().addDependent(dialog);
			}
			dialog.open();
			var val = window.sessionStorage.getItem("help");
			if (val === "true") {
				this.getView().byId("helpCheckbox").setSelected(true);
			} else {
				this.getView().byId("helpCheckbox").setSelected(false);
			}
		},
		numberWithCommas: function (x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		generateDataPress: function () {
			if (!this.checkScope()) {
				return;
			}

			var oView = this.getView();
			var dialog = this.getView().byId("generateDialog");
			if (!dialog) {
				dialog = sap.ui.xmlfragment(oView.getId(), "com.sap.refapps.shine.web.view.generate", this);
				this.getView().addDependent(dialog);
			}
			dialog.open();
			this.setDateRange();
		},
		setDateRange: function () {
			var dateFrom = new Date();
			dateFrom.setUTCDate(1);
			dateFrom.setUTCMonth(0);
			dateFrom.setUTCFullYear(2019);

			var dateTo = new Date();
			dateTo.setUTCDate(dateTo.getDate());
			dateTo.setUTCMonth(dateTo.getMonth());
			dateTo.setUTCFullYear(dateTo.getFullYear());

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				dateValue: dateFrom,
				secondDateValue: dateTo,
				dateMin: new Date(2016, 0, 1),
				dateMax: new Date(2030, 11, 31)
			});
			this.getView().byId("dateRange").setModel(oModel);

		},
		validateGenerateSO: function () {
			var flag = true;
			var oModel = this.getView().byId("dateRange").getModel();

			var startDate = oModel.getProperty('/dateValue');
			var endDate = oModel.getProperty('/secondDateValue');
			var number = this.getView().byId("numberOfSO").getValue();

			var pattern = /^[0-9]+$/;
			if (!number.match(pattern)) {
				flag = false;
				MessageBox.error("Invalid input. Please enter numeric value for No. of Sales Orders");
			}
			if (!(number >= 1000 && number <= 5000)) {
				flag = false;
				MessageBox.error("Invalid input. Please enter value between 1000 to 5000 for No. of Sales Orders");
			}
			if (startDate === null || endDate === null) {
				flag = false;
				MessageBox.error("Please enter valid date range");
			}
			return flag;
		},
		generateSO: function (data) {
			var that = this;
			//fetch x-csrf token
			var token;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/salesOrder.xsjs?cmd=GETALLSALESORDER",
				contentType: "application/json",
				headers: {
					'x-csrf-token': 'Fetch',
					'Accept': "application/json"
				},
				success: function (data, textStatus, request) {
					token = request.getResponseHeader('x-csrf-token');
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Error in fetching XSRF token",
						"ERROR",
						"Error");
					return;
				}
			});
			$.ajax({
				type: "POST",
				data: JSON.stringify(data),
				async: false,
				url: "/com/sap/refapps/shine/services/generateData.xsjs",
				headers: {
					"x-csrf-token": token
				},
				contentType: "application/json",
				success: function (data, textStatus, request) {
					var dialog = that.getView().byId("generateDialog");
					dialog.destroy();
					that.onRefresh();
					MessageBox.success(data);
				},
				error: function (err) {
					MessageBox.error("Error in generating data");
				}
			});
		},
		generateSOPress: function () {
			if (!this.validateGenerateSO()) {
				return;
			}
			var oModel = this.getView().byId("dateRange").getModel();
			var startDateStr = oModel.getProperty('/dateValue').toDateString();
			var endDateStr = oModel.getProperty('/secondDateValue').toDateString();
			var number = this.getView().byId("numberOfSO").getValue();
			var startDate = this.formatDate(startDateStr);
			var endDate = this.formatDate(endDateStr);
			var data = {
				"startDate": startDate,
				"endDate": endDate,
				"noSO": number
			};
			var that = this;

			MessageBox.confirm(
				"This action will reset the Sales Order Transactional Data and generate new sales orders. Do you want to continue?",
				jQuery.proxy(function (bResult) {
					if (bResult === "OK") {
						var busyDialog = new sap.m.BusyDialog({
							text: 'Generating Sales Order Data...'
						});
						busyDialog.open();
						var callBackend = function () {
							that.generateSO(data);
							busyDialog.close();
						};
						setTimeout(callBackend, 2000);
					}
				}, this),
				"Confirmation");

		},
		formatDate: function (dateStr) {
			var date = new Date(dateStr);
			var day = date.getDate();
			var month = date.getMonth() + 1;
			var year = date.getFullYear();
			if (day < 10) {
				day = "0" + day;
			}
			if (month < 10) {
				month = "0" + month;
			}
			return year + month + day;
		},
		closeGenerateDialog: function () {
			var dialog = this.getView().byId("generateDialog");
			dialog.close();
		},
		getSalesOrder: function () {
			var oTable = this.getView().byId("sotable");
			oTable.setBusy(true);
			var that = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/salesOrder.xsjs?cmd=GETALLSALESORDER",
				contentType: "application/json",
				success: function (data, textStatus, request) {
					var oData = {
						"count": that.numberWithCommas(data.length),
						"salesOrders": data
					};
					//salesOrders = data;
					// create JSON model instance
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oModel.setDefaultBindingMode("TwoWay");
					that.getView().setModel(oModel);
					oTable.setBusy(false);
				},
				error: function (err) {
					MessageBox.error("Error in fetching sales orders");
				}
			});

		},
		setView: function (view) {
			window.sessionStorage.setItem("view", view);
		},
		getView: function () {
			return window.sessionStorage.getItem("view");
		},
		onRefresh1: function () {
			var that = this;
			var oTable = this.getView().byId('sotable');
			oTable.setBusy(true);
			var callBackend = function () {
				that.getAllNewSalesOrder();
				oTable.setBusy(false);
			};
			setTimeout(callBackend, 2000);
		},
		onRefresh: function () {
			var that = this;
			var oTable = this.getView().byId('sotable');
			oTable.setBusy(true);
			var callBackend = function () {
				that.getSalesOrder();
				oTable.setBusy(false);
			};
			setTimeout(callBackend, 2000);

		},
		onRefreshPress: function () {
			this.onRefresh();
		},
		onItemPress: function (oEvent) {
			var oItem = oEvent.getSource();
			var oTable = this.getView().byId('sotable');
			oTable.setBusy(true);
			var aItems = oTable.getItems();
			var index = oItem.getBindingContext().getPath().split("/")[2];
			var salesOrderId = aItems[index].getAggregation("cells")[0].getProperty("text");
			//navigation
			// var oItem = oEvent.getSource();
			var that = this;
			var callBackend = function () {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				oRouter.navTo("details", {
					salesOrderId: salesOrderId
				});
				oTable.setBusy(false);
			};
			setTimeout(callBackend, 2000);
		},

		onCreate: function (oEvent) {
			var oView = this.getView();
			var dialog = this.getView().byId("createDialog");
			if (!dialog) {
				dialog = sap.ui.xmlfragment(oView.getId(), "com.sap.refapps.shine.web.view.create", this);
				this.getView().addDependent(dialog);
			}
			dialog.open();
			this.getBusinessPartners();
			this.onBpChange();
			var productDropdown = this.getView().byId("productDropdown");
			var that = this;
			productDropdown.ontap = function (oEvent) {
				if (!productDropdown.isOpen()) {
					productDropdown.setBusy(true);
					productDropdown.destroyItems();
					var partnerId = that.getView().byId("bpDropdown").getSelectedKey();
					var callBackend = function () {
						that.getProducts(partnerId);
						productDropdown.setBusy(false);
					};
					setTimeout(callBackend, 2000);
				}
				sap.m.Select.prototype.ontap.apply(this, arguments);
			};
		},
		onBpChange: function () {
			var productDropdown = this.getView().byId("productDropdown");
			productDropdown.destroyItems();
			productDropdown.setSelectedKey("");
		},
		close: function () {
			var dialog = this.getView().byId("createDialog");
			dialog.destroy();
			dialog.close();
		},
		getProducts: function (partnerId) {
			var productDropdown = this.getView().byId("productDropdown");
			productDropdown.setBusy(true);
			var that = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/products.xsjs?PARTNERID=" + partnerId,
				contentType: "application/json",
				success: function (data, textStatus, request) {
					var oData = {
						"products": data
					};
					//salesOrders = data;
					// create JSON model instance
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oModel.setDefaultBindingMode("TwoWay");
					that.getView().byId("productDropdown").setModel(oModel);
					productDropdown.setBusy(false);
				},
				error: function (err) {
					MessageBox.error("Error in fetching business partners");
				}
			});
		},
		getBusinessPartners: function () {
			var dialog = this.getView().byId("createDialog");
			dialog.setBusy(true);
			var that = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/businessPartners.xsjs",
				contentType: "application/json",
				success: function (data, textStatus, request) {
					var oData = {
						"businessPartners": data
					};
					//salesOrders = data;
					// create JSON model instance
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oModel.setDefaultBindingMode("TwoWay");
					that.getView().byId("bpDropdown").setModel(oModel);
					dialog.setBusy(false);
				},
				error: function (err) {
					MessageBox.error("Error in fetching business partners");
				}
			});
		},
		validateSOForm: function () {
			var flag = true;
			var product = this.getView().byId("productDropdown");
			var quantity = this.getView().byId("quantityField");

			if (quantity.getValue() === '' && product.getSelectedKey() === '') {
				quantity.setValueState(sap.ui.core.ValueState.Error);
				product.setValueState(sap.ui.core.ValueState.Error);
				flag = false;
			}
			if (quantity.getValue() !== '' && product.getSelectedKey() === '') {
				quantity.setValueState(sap.ui.core.ValueState.Success);
				product.setValueState(sap.ui.core.ValueState.Error);
				flag = false;
			}
			if (quantity.getValue() === '' && product.getSelectedKey() !== '') {
				quantity.setValueState(sap.ui.core.ValueState.Error);
				product.setValueState(sap.ui.core.ValueState.Success);
				flag = false;
			}
			if (quantity.getValue() !== '' && product.getSelectedKey() !== '') {
				quantity.setValueState(sap.ui.core.ValueState.Success);
				product.setValueState(sap.ui.core.ValueState.Success);
				flag = true;
			}
			var pattern = /^[0-9]+$/;
			if (!quantity.getValue().match(pattern)) {
				quantity.setValueState(sap.ui.core.ValueState.Error);
				MessageBox.error("Please input only numeric value in quantity");
				flag = false;
			}
			return flag;
		},
		createSO: function () {
			var that = this;
			if (!this.validateSOForm()) {
				return;
			}
			var PARTNERID = this.getView().byId("bpDropdown").getSelectedKey();
			var PRODUCTID = this.getView().byId("productDropdown").getSelectedKey();
			var QUANTITY = this.getView().byId("quantityField").getValue();
			var data = {
				"PARTNERID": PARTNERID,
				"PRODUCTID": PRODUCTID,
				"QUANTITY": QUANTITY
			};
			//fetch x-csrf token
			var token;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/salesOrder.xsjs?cmd=GETALLSALESORDER",
				contentType: "application/json",
				headers: {
					'x-csrf-token': 'Fetch',
					'Accept': "application/json"
				},
				success: function (data, textStatus, request) {
					token = request.getResponseHeader('x-csrf-token');
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Error in fetching XSRF token",
						"ERROR",
						"Error");
					return;
				}
			});
			$.ajax({
				type: "POST",
				async: false,
				url: "/com/sap/refapps/shine/services/createSalesOrder.xsjs",
				data: JSON.stringify(data),
				headers: {
					'x-csrf-token': token
				},
				contentType: "application/json",
				success: function (data, textStatus, request) {
					var dialog = that.getView().byId("createDialog");
					dialog.close();
					dialog.destroy();
					MessageBox.success("Sales Order Created with ID : " + data.SALESORDERID);
					//calling SO prediction
					var busyDialog = new sap.m.BusyDialog({
						text: 'Predicting Sales Order...'
					});
					busyDialog.open();
					var callBackend = function () {
						that.predictSalesOrder();
						busyDialog.close();
					};
					setTimeout(callBackend, 2000);
					that.onRefresh();
				},
				error: function (err) {
					MessageBox.error("Error in creating sales order");
				}
			});
		},
		onDelete: function () {
			var that = this;
			var oSelected = this.getView().byId("sotable").getSelectedItem();
			if (oSelected === null) {
				MessageBox.error("Please select a sales order");
				return;
			}
			var soId = oSelected.getBindingContext().getProperty("SALESORDERID");
			MessageBox.confirm("Do you sure want to delete sales order: " + soId,
				jQuery.proxy(function (bResult) {
					if (bResult === "OK") {
						that.deleteSalesOrder(soId);
					}
				}, this),
				"Delete Sales Order");
		},
		deleteSalesOrder: function (soId) {
			var that = this;
			//fetch x-csrf token
			var token;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/salesOrder.xsjs?cmd=GETALLSALESORDER",
				contentType: "application/json",
				headers: {
					'x-csrf-token': 'Fetch',
					'Accept': "application/json"
				},
				success: function (data, textStatus, request) {
					token = request.getResponseHeader('x-csrf-token');
				},
				error: function (jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Error in fetching XSRF token",
						"ERROR",
						"Error");
					return;
				}
			});
			$.ajax({
				type: "DELETE",
				async: false,
				url: "/com/sap/refapps/shine/services/salesOrder.xsjs?cmd=DELETESALESORDER&ID=" + soId,
				headers: {
					"x-csrf-token": token
				},
				contentType: "application/json",
				success: function (data, textStatus, request) {
					that.onRefresh();
					MessageBox.success("Sales order: " + soId + " is deleted successfully");
				},
				error: function (err) {
					MessageBox.error("Error in deleting sales order");
				}
			});
		},
		getAllNewSalesOrder: function () {
			var oTable = this.getView().byId("sotable");
			var that = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/salesOrder.xsjs?cmd=GETALLNEWSALESORDER",
				contentType: "application/json",
				success: function (data, textStatus, request) {
					var oData = {
						"count": that.numberWithCommas(data.length),
						"salesOrders": data
					};
					oTable.getModel().destroy();
					// create JSON model instance
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(oData);
					oModel.setDefaultBindingMode("TwoWay");
					that.getView().setModel(oModel);
					that.actionButtonsStyle("DISABLE");

				},
				error: function (err) {
					MessageBox.error("Error in fetching sales orders");
				}
			});
		},
		actionButtonsStyle: function (action) {
			var generateBtn = this.getView().byId("generateBtn");
			var acceptBtn = this.getView().byId("acceptBtn");
			var rejectBtn = this.getView().byId("rejectBtn");
			var trainBtn = this.getView().byId("trainBtn");
			var addBtn = this.getView().byId("addBtn");
			var refreshBtn = this.getView().byId("refreshBtn");
			var deleteBtn = this.getView().byId("deleteBtn");
			var adminBtn = this.getView().byId("adminBtn");
			var backBtn = this.getView().byId("backBtn");
			var backBtn1 = this.getView().byId("backBtn1");
			var mainTitle = this.getView().byId("mainTitle");

			if (action === 'DISABLE') {
				//disabling buttons
				generateBtn.setVisible(false);
				mainTitle.setVisible(false);
				acceptBtn.setVisible(true);
				rejectBtn.setVisible(true);
				backBtn.setVisible(true);
				backBtn1.setVisible(true);
				adminBtn.setVisible(false);
				deleteBtn.setVisible(false);
				refreshBtn.setVisible(false);
				addBtn.setVisible(false);
				trainBtn.setVisible(false);
			}
			if (action === 'ENABLE') {
				//enabling buttons
				generateBtn.setVisible(true);
				mainTitle.setVisible(true);
				acceptBtn.setVisible(false);
				rejectBtn.setVisible(false);
				backBtn1.setVisible(false);
				backBtn.setVisible(false);
				adminBtn.setVisible(true);
				deleteBtn.setVisible(true);
				refreshBtn.setVisible(true);
				addBtn.setVisible(true);
				trainBtn.setVisible(true);
			}

		},
		showAdminScreen: function () {
			if (!this.checkScope()) {
				return;
			}
			this.setView("NEW");
			var that = this;
			var busyDialog = new sap.m.BusyDialog({
				text: 'Taking you to the Sales Order Admin Dashboard...'
			});
			busyDialog.open();
			var callBackend = function () {
				that.getAllNewSalesOrder();
				busyDialog.close();
				MessageBox.alert("Displaying New Sales Orders");
			};
			setTimeout(callBackend, 2000);
		},
		onSalesDashboard: function () {
			var that = this;
			this.setView("ALL");
			var oTable = this.getView().byId("sotable");
			oTable.setBusy(true);
			var callBackend = function () {
				that.onRefresh();
				oTable.setBusy(false);
				that.actionButtonsStyle("ENABLE");
			};
			setTimeout(callBackend, 2000);
		},
		trainModel: function () {
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/trainModel.xsjs",
				contentType: "application/json",
				success: function (data, textStatus, request) {
					MessageBox.success(data);
				},
				error: function (err) {
					MessageBox.error("Error in training model.");
				}
			});
		},
		trainModelPress: function () {
			var that = this;
			var busyDialog = new sap.m.BusyDialog({
				text: 'Training model...'
			});
			busyDialog.open();
			var callBackend = function () {
				busyDialog.close();
				that.trainModel();
			};
			setTimeout(callBackend, 2000);
		},
		predictSalesOrder: function () {
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/predictSalesOrder.xsjs",
				contentType: "application/json",
				success: function (data, textStatus, request) {},
				error: function (err) {
					MessageBox.error("Error in predicting sales order");
				}
			});
		},
		salesOrderApproval: function (soId, approval) {
			var that = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/salesOrderApproval.xsjs?action=" + approval + "&SOID=" + soId,
				contentType: "application/json",
				success: function (data, textStatus, request) {
					that.onRefresh1();
					MessageBox.success(data);
				},
				error: function (err) {
					MessageBox.error("Error in sales order approval");
				}
			});
		},
		acceptSO: function () {
			var that = this;
			var oSelected = this.getView().byId("sotable").getSelectedItem();
			if (oSelected === null) {
				MessageBox.error("Please select a sales order");
				return;
			}
			var soId = oSelected.getBindingContext().getProperty("SALESORDERID");
			MessageBox.confirm("Do you sure want to approve this sales order: " + soId,
				jQuery.proxy(function (bResult) {
					if (bResult === "OK") {
						var busyDialog = new sap.m.BusyDialog({
							text: 'Processing Sales Order...'
						});
						busyDialog.open();
						var callBackend = function () {
							busyDialog.close();
							that.salesOrderApproval(soId, "Accept");
						};
						setTimeout(callBackend, 2000);

					}
				}, this),
				"Sales Order Approval");
		},
		rejectSO: function () {
			var that = this;
			var oSelected = this.getView().byId("sotable").getSelectedItem();
			if (oSelected === null) {
				MessageBox.error("Please select a sales order");
				return;
			}
			var soId = oSelected.getBindingContext().getProperty("SALESORDERID");
			MessageBox.confirm("Do you sure want to reject this sales order: " + soId,
				jQuery.proxy(function (bResult) {
					if (bResult === "OK") {
						var busyDialog = new sap.m.BusyDialog({
							text: 'Processing Sales Order...'
						});
						busyDialog.open();
						var callBackend = function () {
							busyDialog.close();
							that.salesOrderApproval(soId, "Reject");
						};
						setTimeout(callBackend, 2000);

					}
				}, this),
				"Sales Order Approval");
		},
		onLogoutPress: function (oEvent) {
			MessageBox.confirm("Do you sure want to logout?",
				jQuery.proxy(function (bResult) {
					if (bResult === "OK") {
						var busyDialog = new sap.m.BusyDialog({
							text: 'Logging out...'
						});
						busyDialog.open();
						var url = window.location.href;
						var arr = url.split("/");
						var location = arr[0] + "//" + arr[2];
						window.location.replace(location + "/do/logout");
					}
				}, this),
				"Logout Confirmation");
		},
		checkScope: function () {
			var flag = false;
			var that = this;
			$.ajax({
				type: "GET",
				async: false,
				url: "/com/sap/refapps/shine/services/scope.xsjs",
				contentType: "application/json",
				success: function (data, textStatus, request) {
					flag = true;
				},
				error: function (err) {
					flag = false;
					if (err.status === 403) {
						MessageBox.error(
							"Access Denied! Please assign SHINE_ADMIN role to the user and login again.\n\n 💡 Tip : To create SHINE_ADMIN rolecollection, navigate to SHINE Launchpad → Check Prerequisite → Create Role Collection"
						);
					} else {
						MessageBox.error(err.responseText);
					}

				}
			});
			return flag;
		}
	});

});