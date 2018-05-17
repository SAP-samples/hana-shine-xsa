sap.ui.controller("sap.hana.democontent.epm.salesdashboard.view.details", {

	onRowSelect: function(oEvent) {
		var path = oEvent.getParameter("rowContext");
		var oSHTable = this .byId("soHeader");
		var rowNum = oSHTable.getSelectedIndex();
		var visibleRows=oSHTable.getVisibleRowCount();
		this.byId("tablePaginator").setCurrentPage(Math.ceil( parseInt(rowNum)/parseInt(visibleRows))); 
		
		//var oSITable = sap.ui.getCore().byId("details--soItemTable");
		var oSITable = this.getView().byId("soItemTable");
		oSITable.bindRows(path + "/SalesOrderItem");
	},

	onRefresh: function(oEvent) {
		// clear selection and filters
		//var oSHTable = sap.ui.getCore().byId("details--soHeader");
		var oSHTable = this.getView().byId("soHeader");
        //var oSITable = sap.ui.getCore().byId("details--soItemTable");
        var oSITable = this.getView().byId("soItemTable");
        
		oSHTable.clearSelection();
		var aCols = oSHTable.getColumns();
		if (aCols) {
			for (var i = aCols.length - 1; i >= 0; --i) {
				aCols[i].setFiltered(false);
				aCols[i].setFilterValue("");
			}
		}
		if (oSITable.isBound("rows")) {
			oSITable.unbindRows();
		}
		// clear filters
		aCols = oSITable.getColumns();
		if (aCols) {
			for (var i = aCols.length - 1; i >= 0; --i) {
				aCols[i].setFiltered(false);
				aCols[i].setFilterValue("");
			}
		}

		// bind with default value
		var oPaginator=this.byId("tablePaginator");
		var oTable= this.byId("soHeader");
		var visibleRows = oTable.getVisibleRowCount(); 
		
		$.ajax({
				type: "GET",
				url: "/sap/hana/democontent/epm/services/salesOrdersBuyer.xsodata/SalesOrderHeader/$count",
				async: true,
				success: function(data, textStatus, request) {
					
					oPaginator.setNumberOfPages(Math.ceil( parseInt(data.toString() )/parseInt(visibleRows)));
					
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Error in loading Jobs Table",
						"ERROR",
						"Error");
					return;
				}
			});
			oPaginator.setCurrentPage(1);
		var sort1 = new sap.ui.model.Sorter("SALESORDERID", true);
		oSHTable.bindRows({
			path: "/SalesOrderHeader",
			sorter: sort1
		});

	},


	onNewPress: function(oEvent) {
		this.newDialog = new sap.ui.commons.Dialog({
			modal: true
		});
		this.newDialog.setTitle(sap.app.i18n.getText("CREATE_LONG"));
		this.newDialog.addContent(this.createNewDialogContent(this));


		this.newDialog.open();

	},

	onDeletePress: function(oEvent) {
		var oController = this;
		//var oTable = sap.ui.getCore().byId("details--soHeader");
		var oTable = this.getView().byId("soHeader");
		var data = oTable.getModel();
		var soId = data.getProperty("SALESORDERID", oTable.getContextByIndex(oTable.getSelectedIndex()));

		if (soId && soId !== undefined) {

            sap.ui.commons.MessageBox.confirm(sap.app.i18n.getText("CONFIRM_DELETE", [soId]),
					function(bResult) {
				oController.deleteConfirm(bResult, oController, soId);
			},
			sap.app.i18n.getText("TITLE_DELETE"));			

		} else {
		    
		    sap.ui.commons.MessageBox.show(sap.app.i18n.getText("ERROR_SELECT"), "ERROR", sap.app.i18n.getText("ERROR_SO_HEADER"));

		}
	},

	//Delete Confirmation Dialog Results
	deleteConfirm: function(bResult, oController, soId) {
		if (bResult) {
			var aUrl = "so_details('" + soId + "')";

			oController.deleteModel.remove(aUrl, {
				success: function(myTxt) {
					oController.onDeleteSuccess(myTxt, oController);
				},
				error: oController.onErrorCall
			});
		}
	},

	//Delete Successful Event Handler
	onDeleteSuccess: function(myTxt, oController) {
		oController.onRefresh();
		sap.ui.commons.MessageBox.show(sap.app.i18n.getText("DELETE_SUCCESS"),
				"SUCCESS",
				sap.app.i18n.getText("TITLE_DELETE_SUCCESS"));
	},


	/* Called when binding of the model is modified.
	 *
	 */
	onBindingChange: function(oController) {
		var oSHTable = this.getView().byId("soHeader");
		var iNumberOfRows = oSHTable.getBinding("rows").iLength;
		
		oSHTable.setTitle("Sales Orders" + " (" + this.numericSimpleFormatter(iNumberOfRows) + ")");
	},

	onSubmit: function(oEvent, min, max) {
		var view = this.getView();
		var oController = this;
		var items = [];
		var payload = {};

		//validation for User Input
		if (view.oComboBoxBp._getExistingListBox().getSelectedItem() === null) {
			sap.ui.commons.MessageBox.show(sap.app.i18n.getText("FILL_ALL_LINE_ITEMS"),
					"ERROR",
					sap.app.i18n.getText("TITLE_MISSING_DATA"));
			return;


		}

		var endindex = max;
		for (var beginindex = min + 1; beginindex < endindex; beginindex++) {
			if (jQuery.sap.domById('productsel' + beginindex + '-input') !== null) {
				if (sap.ui.getCore().byId('productsel' + beginindex)._getExistingListBox().getSelectedItem() === null) {
					sap.ui.commons.MessageBox.show(sap.app.i18n.getText("FILL_ALL_LINE_ITEMS"),
							"ERROR",
							sap.app.i18n.getText("TITLE_MISSING_DATA"));
					return;
				}
			}
		}

		for (var beginindex = min + 1; beginindex < endindex; beginindex++) {
			if (jQuery.sap.domById('productsel' + beginindex + '-input') !== null) {
				var Quantity = jQuery.sap.domById('quantitysel' + beginindex).value;
				if (Number(Quantity) <= 0 || isNaN(Number(Quantity)) || Number(Quantity) % 1 !== 0) {
					sap.ui.commons.MessageBox.show(sap.app.i18n.getText("TITLE_VALID_INTEGER"),
							"ERROR",
							sap.app.i18n.getText("CHECK_VALID_INTEGER"));
					return;
				}
			}
		}

		//get the Business Partner ID
		payload.PARTNERID = view.oComboBoxBp._getExistingListBox().getSelectedItem().getCustomData()[0].getValue();

		for (var beginindex1 = min + 1; beginindex1 < endindex; beginindex1++) {
			if (jQuery.sap.domById('productsel' + beginindex1 + '-input') !== null) {
				items.push({
					Product_Id: sap.ui.getCore().byId('productsel' + beginindex1)._getExistingListBox().getSelectedItem().getCustomData()[0].getValue(),
					Quantity: jQuery.sap.domById('quantitysel' + beginindex1).value
				});
			}
		}

		payload.SalesOrderItems = items;

		// handle xsrf token
		// first obtain token using Fetch
		var xsrf_token;
		$.ajax({
			type: "GET",
			async: false,
			url: "/sap/hana/democontent/epm/services/soCreate.xsodata",
			contentType: "application/json",
			headers: {
				'x-csrf-token': 'Fetch',
				'Accept': "application/json"
			},
			success: function(data, textStatus, request) {
				xsrf_token = request.getResponseHeader('x-csrf-token');
			}
		});

		// add x-csrf-token in headers
		$.ajax({
			type: "POST",
			url: "/sap/hana/democontent/epm/services/soCreateMultiple.xsjs",
			headers: {
				'x-csrf-token': xsrf_token
			},
			contentType: "application/json",
			data: JSON.stringify(payload),
			dataType: "json",
			success: function(data) {

			},
			dataFilter: function(data) {
				oController.onRefresh();
				var oSalesOrderId = data.split('\n')[1].split(' ')[2];
				sap.ui.commons.MessageBox.show('Sales Order ' + oSalesOrderId + ' Created Successfully',
				                    "SUCCESS",
				                    sap.app.i18n.getText("SALES_ORDER_CREATED"));
			}

		});
		this.onRefresh(oEvent);
		this.newDialog.close();
	},

	/*** Numeric Formatter for Currencies ***/
	numericFormatter: function(val) {
		if (val === undefined) {
			return '0'
		} else {
			jQuery.sap.require("sap.ui.core.format.NumberFormat");
			var oNumberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
				maxFractionDigits: 2,
				minFractionDigits: 2,
				groupingEnabled: true
			});
			return oNumberFormat.format(val);
		}

	},

	/*** Numeric Formatter for Quantities ***/
	numericSimpleFormatter: function(val) {
		if (val === undefined) {
			return '0';
		} else {
			jQuery.sap.require("sap.ui.core.format.NumberFormat");
			var oNumberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
				maxFractionDigits: 0,
				minFractionDigits: 0,
				groupingEnabled: true
			});
			return oNumberFormat.format(val);
		}

	},
	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf sales-dashboard.details
	 */
	onInit: function() {
		this.deleteModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/soDelete.xsodata/", true);
	},
	
	onSend : function(){
	   
	},
	
	onSendSuccess : function(response){
	   
	},
	
	onSendFailed : function(response){
	
		
	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf sales-dashboard.details
	 */
	onAfterRendering: function() {
	    var oController = this;
	    var oModel = new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/salesOrdersBuyer.xsodata/", true);
        
        oModel.setDefaultCountMode("Inline");
        
        oModel.attachRequestCompleted(function() {
            oController.onBindingChange(oController);
        });
	    
        //var oSHTable = sap.ui.getCore().byId("details--soHeader");
        var oSHTable = this.getView().byId("soHeader");
        if(oSHTable != undefined){
        	oSHTable.setModel(oModel);
        
        	//var oSITable = sap.ui.getCore().byId("details--soItemTable");
        	var oSITable = this.getView().byId("soItemTable");
    		oSITable.setModel(oModel);
        
        	var sort1 = new sap.ui.model.Sorter("SALESORDERID", true);
        	oSHTable.bindRows({
            	path: "/SalesOrderHeader",
            	parameters: {
            		//  expand: "Buyer",
                	select: "SALESORDERID,CURRENCY,GROSSAMOUNT,TAXAMOUNT,PARTNER_PARTNERID,COMPANYNAME,CITY"
            	},
            	sorter: sort1
        	});

        	var iNumberOfRows = oSHTable.getBinding("rows").iLength;
        	oSHTable.setTitle("Sales Orders" + " (" + this.numericSimpleFormatter(iNumberOfRows) + ")");
        	var oPaginator=this.byId("tablePaginator");
			var oTable= this.byId("soHeader");
			var visibleRows = oTable.getVisibleRowCount();             
        	$.ajax({
				type: "GET",
				url: "/sap/hana/democontent/epm/services/salesOrdersBuyer.xsodata/SalesOrderHeader/$count",
				async: true,
				success: function(data, textStatus, request) {
					
					oPaginator.setNumberOfPages(Math.ceil( parseInt(data.toString() )/parseInt(visibleRows)));
				},
				error: function(jqXHR, textStatus, errorThrown) {
					sap.ui.commons.MessageBox.show("Error in loading Jobs Table",
						"ERROR",
						"Error");
					return;
				}
			});
		
        }
    },
    
    openTileDialog: function(oEvent) {
        var iData = parseInt(oEvent.getSource().data("tileDialog"), 10);
        var tileDialog = new sap.account.TileDialog(this );
        tileDialog.open(iData);
    },

    lineItemCount: function(oController) {
        arguments.callee.myStaticVar = arguments.callee.myStaticVar || 1;
        arguments.callee.myStaticVar++;
        return arguments.callee.myStaticVar;
    },

    createNewDialogContent: function(oController) {
        var that = this;

        var min = that.lineItemCount(oController);
        var view = this.getView();

        // create a simple matrix layout
        view.oLayout = new sap.ui.commons.layout.MatrixLayout({
            layoutFixed: false
        });


        view.submitButton = new sap.ui.commons.Button({
            text: sap.app.i18n.getText("CREATE"),
            style: sap.ui.commons.ButtonStyle.Accept,
            press: function(oEvent) {
                var max = that.lineItemCount(oController);
                oController.onSubmit(oEvent, min, max);
            }
        });

        view.addLineItemButton = new sap.ui.commons.Button({
            text: sap.app.i18n.getText("ADD_LINE_ITEM"),
            style: sap.ui.commons.ButtonStyle.Accept,
            press: function() {
                that.createNewLineItemContent(oController);
            }
        });

        view.oLayout.createRow(view.submitButton);
	
	var lineitemindex = that.lineItemCount(oController);
	var oComboBoxPd = new sap.ui.commons.ComboBox({
		id: "productsel" + lineitemindex,
		displaySecondaryValues: true,
		width: '300px',
		change: function(oEvent) {

		}
	});
	    
        view.oComboBoxBp = new sap.ui.commons.ComboBox({
            displaySecondaryValues: true,
            width: '300px',
            change: function(oEvent) {
		var selectedBP = oEvent.oSource.getSelectedKey();
				var max = that.lineItemCount(oController);
				var oItemTemplatePd = new sap.ui.core.ListItem();
				oItemTemplatePd.bindProperty("text", "PRODUCT_NAME");
				oItemTemplatePd.bindProperty("additionalText", {
					parts: [{
						path: "PRODUCT_PRICE",
						type: new sap.ui.model.type.Float({
							minFractionDigits: 2,
							maxFractionDigits: 2
						})
					}, {
						path: "PRODUCT_CURRENCY"
					}],
					formatter: function(price, currency) {
						return price + " " + currency;
					}
				});
				
					var oDataTemplatePd1 = new sap.ui.core.CustomData({
						key: "PRODUCTID",
						value: "{PRODUCTID}"
					});
					oItemTemplatePd.addCustomData(oDataTemplatePd1);
			
					var oDataTemplatePd2 = new sap.ui.core.CustomData({
						key: "PRODUCT_CURRENCY",
						value: "{PRODUCT_CURRENCY}"
					});
					oItemTemplatePd.addCustomData(oDataTemplatePd2);
					var endindex = max;
					for (var beginindex1 = min + 1; beginindex1 < endindex; beginindex1++) {
						if (jQuery.sap.domById('productsel' + beginindex1 + '-input') !== null) {
							sap.ui.getCore().byId('productsel' + beginindex1).bindItems({
								path: "/ProductDetails",
								parameters: {
									select: "PRODUCTID,PRODUCT_NAME,PRODUCT_PRICE,PRODUCT_CURRENCY"
								},
							//	sorter: sortPd,
								template: oItemTemplatePd,
								filters:[
					                new sap.ui.model.odata.Filter("SUPPLIER_ID", [{operator:"EQ",value1:selectedBP}])
					            ]
							});
							sap.ui.getCore().byId('productsel' + beginindex1).fireChange();
							sap.ui.getCore().byId('productsel' + beginindex1).setValue("");
						}
					}

            }

        });

        view.oComboBoxBp.setModel(new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/businessPartners.xsodata",
            true));

        var oItemTemplateBp = new sap.ui.core.ListItem();
	oItemTemplateBp.bindProperty("key", "PARTNERID");
        oItemTemplateBp.bindProperty("text", "COMPANYNAME");
        oItemTemplateBp.bindProperty("additionalText", {
            parts: [{
                path: "PARTNERID"
            }],
            formatter: function(partnerid) {
                return partnerid;
            }
        });

        var oDataTemplateBp = new sap.ui.core.CustomData({
            key: "PARTNERID",
            value: "{PARTNERID}"
        });
        oItemTemplateBp.addCustomData(oDataTemplateBp);

        var sortBp = new sap.ui.model.Sorter("COMPANYNAME");
        view.oComboBoxBp.bindItems({
            path: "/BusinessPartners",
            parameters: {
                select: "PARTNERID,COMPANYNAME"
            },
            sorter: sortBp,
            template: oItemTemplateBp
        });

        var selectBpLbl = new sap.ui.commons.TextView({
            text: sap.app.i18n.getText("SELECT_BP")
        });

        view.oLayout.createRow(selectBpLbl, view.oComboBoxBp);
        //that.createNewLineItemContent(oController);
        //******changing******
		
		oComboBoxPd.setModel(new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/productDetails.xsodata",true));

		var oItemTemplatePd = new sap.ui.core.ListItem();
		oItemTemplatePd.bindProperty("text", "PRODUCT_NAME");
		oItemTemplatePd.bindProperty("additionalText", {
			parts: [{
				path: "PRODUCT_PRICE",
				type: new sap.ui.model.type.Float({
					minFractionDigits: 2,
					maxFractionDigits: 2
				})
			}, {
				path: "PRODUCT_CURRENCY"
			}],
			formatter: function(price, currency) {
				return price + " " + currency;
			}
		});

		var oDataTemplatePd1 = new sap.ui.core.CustomData({
			key: "PRODUCTID",
			value: "{PRODUCTID}"
		});
		oItemTemplatePd.addCustomData(oDataTemplatePd1);

		var oDataTemplatePd2 = new sap.ui.core.CustomData({
			key: "PRODUCT_CURRENCY",
			value: "{PRODUCT_CURRENCY}"
		});
		oItemTemplatePd.addCustomData(oDataTemplatePd2);

		var sortPd = new sap.ui.model.Sorter("PRODUCT_NAME");
	    oComboBoxPd.bindItems({
			path: "/ProductDetails",
			parameters: {
				select: "PRODUCTID,PRODUCT_NAME,PRODUCT_PRICE,PRODUCT_CURRENCY"
			},
			sorter: sortPd,
			filters:[
	                new sap.ui.model.odata.Filter("SUPPLIER_ID", [{operator:"EQ",value1:''}])
	        ],
			template: oItemTemplatePd
		});

		var selectProductLblPd = new sap.ui.commons.TextView({
			text: sap.app.i18n.getText("SELECT_PRODUCT")
		});

		// create a simple Input field
		var quantityInputPd = new sap.ui.commons.TextField({
			id: "quantitysel" + lineitemindex,
			value: "1"
		});

		var quantityLbPd = new sap.ui.commons.TextView({
			text: sap.app.i18n.getText("ENTER_QUANTITY")
		});

		var addButtonPd = new sap.ui.commons.Button({
		    id: "addlineitmbtn" + lineitemindex,
		    icon: "/resources/salesdashboard/images/AddLineItem.gif",
		    iconHovered: "/resources/salesdashboard/images/AddLineItemHover.gif",
		    iconSelected: "/resources/salesdashboard/images/AddLineItemHover.gif",
		    tooltip: "Add Row",
		    width: "30px",
		    press: function(oControlEvent) {

				if (sap.ui.getCore().byId(oControlEvent.getSource().getId()).getTooltip_AsString() === 'Add Row') {
					sap.ui.getCore().byId(oControlEvent.getSource().getId()).setTooltip('Remove Row');
					sap.ui.getCore().byId(oControlEvent.getSource().getId()).setIcon("/resources/salesdashboard/images/DeleteLineItem.gif");
					sap.ui.getCore().byId(oControlEvent.getSource().getId()).setIconHovered("/resources/salesdashboard/images/DeleteLineItemHover.gif");
					sap.ui.getCore().byId(oControlEvent.getSource().getId()).setIconSelected("/resources/salesdashboard/images/DeleteLineItem.gif");
					that.createNewLineItemContent(oController);
				} else if (sap.ui.getCore().byId(oControlEvent.getSource().getId()).getTooltip_AsString() === 'Remove Row') {
					view.oLayout.removeRow(jQuery.sap.domById(oControlEvent.getSource().getId()).parentElement.parentElement.id);
				}
			}

		});

		view.oLayout.createRow(selectProductLblPd,oComboBoxPd, quantityLbPd, quantityInputPd, addButtonPd);
		
		//******** changing ******//

        return view.oLayout;
    },

    createNewLineItemContent: function(oController) {

        var that = this;
        var view = this.getView();
        var lineitemindex = that.lineItemCount(oController);

        this.oComboBoxPd = new sap.ui.commons.ComboBox({
			id: "productsel" + lineitemindex,
			displaySecondaryValues: true,
			width: '300px',
			change: function(oEvent) {

			}
		});

        this.oComboBoxPd.setModel(new sap.ui.model.odata.ODataModel("/sap/hana/democontent/epm/services/productDetails.xsodata",
            true));

        var oItemTemplatePd = new sap.ui.core.ListItem();
        oItemTemplatePd.bindProperty("text", "PRODUCT_NAME");
        oItemTemplatePd.bindProperty("additionalText", {
            parts: [{
                path: "PRODUCT_PRICE",
                type: new sap.ui.model.type.Float({
                    minFractionDigits: 2,
                    maxFractionDigits: 2
                })
            }, {
                path: "PRODUCT_CURRENCY"
            }],
            formatter: function(price, currency) {
                return price + " " + currency;
            }
        });

        var oDataTemplatePd1 = new sap.ui.core.CustomData({
            key: "PRODUCTID",
            value: "{PRODUCTID}"
        });
        oItemTemplatePd.addCustomData(oDataTemplatePd1);

        var oDataTemplatePd2 = new sap.ui.core.CustomData({
            key: "PRODUCT_CURRENCY",
            value: "{PRODUCT_CURRENCY}"
        });
        oItemTemplatePd.addCustomData(oDataTemplatePd2);

        var sortPd = new sap.ui.model.Sorter("PRODUCT_NAME");
	var partnerid =  view.oComboBoxBp.getSelectedKey();
        this.oComboBoxPd.bindItems({
            path: "/ProductDetails",
            parameters: {
                select: "PRODUCTID,PRODUCT_NAME,PRODUCT_PRICE,PRODUCT_CURRENCY"
            },
            sorter: sortPd,
            template: oItemTemplatePd,
	     filters:[
			new sap.ui.model.odata.Filter("SUPPLIER_ID", [{operator:"EQ",value1:partnerid}])
	     ]
        });

        var selectProductLblPd = new sap.ui.commons.TextView({
            text: sap.app.i18n.getText("SELECT_PRODUCT")
        });

        // create a simple Input field
        var quantityInputPd = new sap.ui.commons.TextField({
            id: "quantitysel" + lineitemindex,
            value: "1"
        });

        var quantityLbPd = new sap.ui.commons.TextView({
            text: sap.app.i18n.getText("ENTER_QUANTITY")
        });

        var addButtonPd = new sap.ui.commons.Button({

            id: "addlineitmbtn" + lineitemindex,
            icon: "/resources/salesdashboard/images/AddLineItem.gif",
            iconHovered: "/resources/salesdashboard/images/AddLineItemHover.gif",
            iconSelected: "/resources/salesdashboard/images/AddLineItemHover.gif",
            tooltip: "Add Row",
            width: "30px",
            press: function(oControlEvent) {

                
                if (sap.ui.getCore().byId(oControlEvent.getSource().getId()).getTooltip_AsString() === 'Add Row') {
                    sap.ui.getCore().byId(oControlEvent.getSource().getId()).setTooltip('Remove Row');
                    sap.ui.getCore().byId(oControlEvent.getSource().getId()).setIcon("/resources/salesdashboard/images/images/DeleteLineItem.gif");
                    sap.ui.getCore().byId(oControlEvent.getSource().getId()).setIconHovered("/resources/salesdashboard/images/images/DeleteLineItemHover.gif");
                    sap.ui.getCore().byId(oControlEvent.getSource().getId()).setIconSelected("/resources/salesdashboard/images/images/DeleteLineItem.gif");
                    that.createNewLineItemContent(oController);
                } else if (sap.ui.getCore().byId(oControlEvent.getSource().getId()).getTooltip_AsString() === 'Remove Row') {
                    view.oLayout.removeRow(jQuery.sap.domById(oControlEvent.getSource().getId()).parentElement.parentElement.id);
                }
            }

        });

        view.oLayout.createRow(selectProductLblPd, this.oComboBoxPd, quantityLbPd, quantityInputPd, addButtonPd);

    },
    onPageChange: function(oEvent){
		var oTable = this.byId("soHeader");
		var visibleRows=oTable.getVisibleRowCount();
		var row = (parseInt(oEvent.getParameter("targetPage").toString())-1)*visibleRows;
		
		oTable.setFirstVisibleRow(row);
			
	}

});
