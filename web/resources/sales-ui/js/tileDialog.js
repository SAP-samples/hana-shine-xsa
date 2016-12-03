jQuery.sap.declare("sap.account.TileDialog");

sap.account.TileDialog = function(oFrameController) {
	this.controller = oFrameController;
};

sap.account.TileDialog.prototype.open = function(chartID) {
	
	// Chart 1: Sales by region, pie chart
	// Chart 2: Sales by Country, column chart
	// Chart 3: Sales Rank, bubble chart
	// Chart 4: Discount for region, pie chart
	// Chart 5: Compare Product Category Sales Year to Year, column chart
	// Chart 6: Sales by product, bubble chart
	// Chart 7: Fuzzy search 
	// Chart 8: Sales order table
	
	var oContent = new sap.ui.commons.layout.VerticalLayout({
		height : "100%",
		width : "100%"
	});

	var oContentMatrix = new sap.ui.commons.layout.MatrixLayout({
		layoutFixed : false,
		columns : 1,
		width : '100%',
		height : '100%',
		widths : [ '100%' ]
	});

	// header
	oContentMatrix.addRow(createWelcomeHeaderRow(chartID));

	// vspace
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height : '30px'
	}));
	
	oContentMatrix.addRow(createDividerRow());
	
	// business scenario
	oContentMatrix.addRow(getLabelRow(sap.app.i18n.getText("BUSINESS_SCENARIO")));
	
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign : sap.ui.commons.layout.HAlign.Left,
		width : '100%'
	});
	oTextView = new sap.ui.commons.TextView({
		text : getBusinessScenario(chartID),
		design : sap.ui.commons.TextViewDesign.Standard,
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oContentMatrix.addRow(createDividerRow());
	
	// Major db tables/views
	oContentMatrix.addRow(getLabelRow(sap.app.i18n.getText("MAJOR_TABLES")));
	
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign : sap.ui.commons.layout.HAlign.Left,
		width : '100%'
	});
	oTextView = new sap.ui.commons.TextView({
		text : getModel(chartID),
		design : sap.ui.commons.TextViewDesign.Standard,
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oContentMatrix.addRow(createDividerRow());
	
	// UI views information
	oContentMatrix.addRow(getLabelRow(sap.app.i18n.getText("UI_VIEWS")));
	
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign : sap.ui.commons.layout.HAlign.Left,
		width : '100%'
	});
	oTextView =new sap.ui.core.HTML({
        content : getUIViews(chartID),
		width: '100%'
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oContentMatrix.addRow(createDividerRow());
	
	// Odata service used
	oContentMatrix.addRow(getLabelRow(sap.app.i18n.getText("MAJOR_TABLES")));

	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign : sap.ui.commons.layout.HAlign.Left,
		width : '100%'
	});
	oTextView = new sap.ui.core.HTML({
		content : getODataService(chartID),
	    width: '100%'
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oContentMatrix.addRow(createDividerRow());
	
	oContent.addContent(oContentMatrix);

	var destroyDialog = function(oEvent) {
		oEvent.getSource().destroy();
	};

	var oTileDialog = new sap.ui.commons.Dialog({
		modal : true,
		// a percentage width does result in an ugly vertical slider in Chrome
		width : '600px',
		content : oContent,
		closed : destroyDialog
	});

	var ok = function(oEvent) {
//		sap.app.localStorage.storePreference(sap.app.localStorage.PREF_DISPLAY_WELCOME_DIALOG, !oNotShowAgainChkBox
//				.getChecked());
		oTileDialog.close();
	};
	var okButton = new sap.ui.commons.Button({
		text : sap.app.i18n.getText("OK"),
		press : ok
	});
	oTileDialog.addStyleClass("welcomeDlg");
	oTileDialog.addButton(okButton).setDefaultButton(okButton).open();
	
	function getLabelRow(label) {
	    var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
    		hAlign : sap.ui.commons.layout.HAlign.Left
    	});
    	oTextView = new sap.ui.commons.TextView({
    		text : label,
    		design : sap.ui.commons.TextViewDesign.H3,
    		width : '100%',
    		textAlign : sap.ui.core.TextAlign.Left,
    	});
    	oTextView.addStyleClass('dialogTextColor');
    	oCell.addContent(oTextView);
    	oRow.addCell(oCell);
    	
    	return oRow;
	}
	
	function getTitle(chartID) {
		switch (chartID) {
		case 1:
			return sap.app.i18n.getText("SALES_BY_REGION");
		case 2:
			return sap.app.i18n.getText("SALES_BY_COUNTRY");
		case 3:
			return sap.app.i18n.getText("SALES_RANK");
		case 4:
			return sap.app.i18n.getText("DISCOUNT_PER_REGION_TITLE");
		case 5:
			return sap.app.i18n.getText("COMPARE_PRODUCT_CATEGORY_YEAR");
		case 6:
			return sap.app.i18n.getText("PRODUCT_SALES");	
		case 7:
			return sap.app.i18n.getText("FUZZY_SEARCH");	
		case 8:
			return sap.app.i18n.getText("SALES_ORDER_HEADERS");	
		}
	}
	
	function getBusinessScenario(chartID) {
        return sap.app.i18n.getText("CHART_BUSI_SCENARIO_" + chartID)
	}
	
	function getModel(chartID) {
	    return sap.app.i18n.getText("CHART_VIEW_" + chartID);
	}
	
	function getUIViews(chartID) {
		return sap.app.i18n.getText("CHART_UI_VIEW_" + chartID);
	}
	
	function getODataService(chartID) {
		return sap.app.i18n.getText("CHART_ODATA_" + chartID);
	}
	
	function createWelcomeHeaderRow(chartID) {
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();// {height : '25px'});
		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			colSpan : 2,
			hAlign : sap.ui.commons.layout.HAlign.Center
		});
		var textView = new sap.ui.commons.TextView({
			text : getTitle(chartID),
			design : sap.ui.commons.TextViewDesign.H1
		});
		textView.addStyleClass("welcomeHeaderTextAlign");
		textView.addStyleClass('dialogTextColor');
		oCell.addContent(textView);
		oRow.addCell(oCell);
		return (oRow);
	}

	function createDividerRow() {
		// hDevider row
		oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		// horizontal divider
		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			colSpan : 2,
			hAlign : sap.ui.commons.layout.HAlign.Left
		});
		var hDevider = new sap.ui.commons.HorizontalDivider();
		oCell.addContent(hDevider);
		oRow.addCell(oCell);
		return (oRow);
	}
};