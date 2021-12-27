jQuery.sap.declare("sap.account.TileDialog");

sap.account.TileDialog = function (oFrameController) {
	this.controller = oFrameController;
};

sap.account.TileDialog.prototype.getHrefLocation = function (tileID) {
	var url = '';
	switch (tileID) {
	case 1:
		url = "../admin-ui/index.html";
		break;
	case 2:
		url = "../purchase-ui/index.html";
		break;
	case 3:
		url = "../job-ui/index.html";
		break;
	case 4:
		url = "../sales-ui/index.html";
		break;
	case 5:
		url = "../user-ui/index.html";
		break;
	case 8:
		url = '/spatial-ui/index.html';
		break;
	case 9:
		url = '/fulltext-ui/index.html';
		break;
	}
	return url;
};

sap.account.TileDialog.prototype.open = function (tileID) {

	//	var showWelcomeDialog = sap.app.localStorage.getPreference(sap.app.localStorage.PREF_DISPLAY_WELCOME_DIALOG);

	var dialog = this;
	

	var oNotShowAgainChkBox = new sap.ui.commons.CheckBox({
		text: sap.app.i18n.getText("DO_NOT_SHOW"),
		checked: true
	});

	var oContent = new sap.ui.commons.layout.VerticalLayout({
		height: "100%",
		width: "100%"
	});

	var oContentMatrix = new sap.ui.commons.layout.MatrixLayout({
		layoutFixed: false,
		columns: 1,
		width: '100%',
		height: '100%',
		widths: ['100%']
	});

	// header
	oContentMatrix.addRow(createWelcomeHeaderRow(tileID));

	// vspace
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '30px'
	}));

	// description
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left,
		width: '100%'
	});
	oTextView = new sap.ui.core.HTML({
		content: getContent(tileID),
		width: '100%'
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	// vspace
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '10px'
	}));

	oContentMatrix.addRow(createDividerRow());
	
	

	// business scenario
	if (showBusinessScenario(tileID)) {
		oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			hAlign: sap.ui.commons.layout.HAlign.Left
		});
		oTextView = new sap.ui.commons.TextView({
			text: sap.app.i18n.getText("BUSINESS_SCENARIO"),
			design: sap.ui.commons.TextViewDesign.H3,
			width: '100%',
			textAlign: sap.ui.core.TextAlign.Left,
		});
		oTextView.addStyleClass('dialogTextColor');
		oCell.addContent(oTextView);
		oRow.addCell(oCell);
		oContentMatrix.addRow(oRow);

		oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			hAlign: sap.ui.commons.layout.HAlign.Left,
			width: '100%'
		});
		oTextView = new sap.ui.commons.TextView({
			text: getBusinessScenario(tileID),
			design: sap.ui.commons.TextViewDesign.Standard,
		});
		oCell.addContent(oTextView);
		oRow.addCell(oCell);
		oContentMatrix.addRow(oRow);

		oContentMatrix.addRow(createDividerRow());
	}

	// Major db tables/views
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left
	});
	oTextView = new sap.ui.commons.TextView({
		text: sap.app.i18n.getText("MAJOR_TABLES"),
		design: sap.ui.commons.TextViewDesign.H3,
		width: '100%',
		textAlign: sap.ui.core.TextAlign.Left,
	});
	oTextView.addStyleClass('dialogTextColor');
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left,
		width: '100%'
	});
	oTextView = new sap.ui.core.HTML({
		content: getDBTablesViews(tileID),
		width: '100%'
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oContentMatrix.addRow(createDividerRow());

	// UI folder information
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left
	});
	oTextView = new sap.ui.commons.TextView({
		text: sap.app.i18n.getText("UI_FOLDER"),
		design: sap.ui.commons.TextViewDesign.H3,
		width: '100%',
		textAlign: sap.ui.core.TextAlign.Left,
	});
	oTextView.addStyleClass('dialogTextColor');
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left,
		width: '100%'
	});
	// 	oTextView = new sap.ui.commons.TextView({
	// 		text : getUIFolders(tileID),
	// 		design : sap.ui.commons.TextViewDesign.Standard,
	// 	});
	oTextView = new sap.ui.commons.TextView({
		text: getUIFolders(tileID)
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oContentMatrix.addRow(createDividerRow());

	// Permission/roles/priviliges required
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left
	});
	oTextView = new sap.ui.commons.TextView({
		text: sap.app.i18n.getText("PERMISSIONS"),
		design: sap.ui.commons.TextViewDesign.H3,
		width: '100%',
		textAlign: sap.ui.core.TextAlign.Left,
	});
	oTextView.addStyleClass('dialogTextColor');
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left,
		width: '100%'
	});
	var permissions = getPermissions(tileID);
	oTextView = new sap.ui.core.HTML({
		content: permissions,
		width: '100%'
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	oContentMatrix.addRow(createDividerRow());



	// do not show again checkbox
	oContentMatrix.addRow(createNotShowAgainChkBoxRow(oNotShowAgainChkBox));

	oContent.addContent(oContentMatrix);

	var destroyDialog = function (oEvent) {
		oEvent.getSource().destroy();
	};

	var widthString = '600px';

	if (tileID == 3) {
		widthString = '750px';
	}

	var oTileDialog = new sap.ui.commons.Dialog({
		modal: true,
		// a percentage width does result in an ugly vertical slider in Chrome
		width: widthString,
		content: oContent,
		closed: destroyDialog
	});


	var ok = function (oEvent) {
		sap.app.localStorage.storePreference(sap.app.localStorage.PREF_TILE_HELP_SHOW_PREFIX + tileID, !oNotShowAgainChkBox.getChecked());
		oTileDialog.close();
		setTimeout(function () {
			var url = dialog.getHrefLocation(tileID);
			window.location.href = url;	
			
		}, 1000);
	};
	var okButton = new sap.ui.commons.Button({
		text: sap.app.i18n.getText("CONTINUE"),
		press: ok
	});
	oTileDialog.addStyleClass("welcomeDlg");
	if (tileID === 13) {
		checkXSuntPermission();
	}
	oTileDialog.addButton(okButton).setDefaultButton(okButton).open();
	
 

	function getIcon(tileID) {
		switch (tileID) {
		case 1:
			return "sap-icon://database";
		case 2:
			return "sap-icon://my-sales-order";
			// case 3:
			//     return "sap-icon://sales-order";
		case 3:
			return "sap-icon://time-entry-request";
		case 4:
			return "sap-icon://sales-order";
		case 5:
			return "sap-icon://account";
		case 6:
			return "sap-icon://widgets";
		case 7:
			return "sap-icon://widgets";
		case 8:
			return "sap-icon://map";
		case 9:
			return "sap-icon://widgets";
		case 10:
			return "sap-icon://iphone";
		case 11:
			return "sap-icon://widgets";
		case 12:
			return "sap-icon://sales-order";
		case 13:
			return "sap-icon://sales-order";
		case 14:
			return "sap-icon://search";
		case 15:
			return "sap-icon://time-entry-request";
		case 16:
			return "sap-icon://shield";

		}
	}

	function getTitle(tileID) {
		switch (tileID) {
		case 1:
			return sap.app.i18n.getText("DG");
		case 2:
			return sap.app.i18n.getText("POWLIST");
			// case 3:
			//     return sap.app.i18n.getText("SALES_DASH");
		case 3:
			return sap.app.i18n.getText("JOBSCHEDULING");
		case 4:
			return sap.app.i18n.getText("SALES_DASH");
		case 5:
			return sap.app.i18n.getText("USER");
		case 6:
			return sap.app.i18n.getText("HANA_UIS_BLUE");
		case 7:
			return sap.app.i18n.getText("HANA_UIS_GOLD");
		case 8:
			return sap.app.i18n.getText("SPATIAL");
		case 9:
			return sap.app.i18n.getText("INATOOLKIT");
		case 10:
			return sap.app.i18n.getText("SALES_DASH_MOB");
		case 11:
			return sap.app.i18n.getText("FIORI_LAUNCHPAD");
		case 12:
			return sap.app.i18n.getText("XSDS");
		case 13:
			return sap.app.i18n.getText("XSUNT");
		case 14:
			return sap.app.i18n.getText("UI5_SEARCH");
		case 15:
			return sap.app.i18n.getText("JOBSCHEDULING");
		case 16:
			return sap.app.i18n.getText("ETAGSXSODATA");
		}
	}

	function getContent(tileID) {
		switch (tileID) {
		case 1:
			return sap.app.i18n.getText("TILE_DESC_DG");
		case 2:
			return sap.app.i18n.getText("TILE_DESC_PO");
			// case 3:
			//     return sap.app.i18n.getText("TILE_DESC_SD");
		case 3:
			return sap.app.i18n.getText("TILE_DESC_JOBSCHEDULING");
		case 4:
			return sap.app.i18n.getText("TILE_DESC_SD");
		case 5:
			return sap.app.i18n.getText("TILE_DESC_US");
		case 6:
			return sap.app.i18n.getText("TILE_DESC_UIS_BLUE");
		case 7:
			return sap.app.i18n.getText("TILE_DESC_UIS_GOLD");
		case 8:
			return sap.app.i18n.getText("TILE_DESC_SPATIAL");
		case 9:
			return sap.app.i18n.getText("TILE_DESC_INATOOLKIT");
		case 10:
			return sap.app.i18n.getText("TILE_DESC_SALES_MOBILE");
		case 11:
			return sap.app.i18n.getText("TILE_DESC_FIORI");
		case 12:
			return sap.app.i18n.getText("TILE_DESC_XSDS");
		case 13:
			return sap.app.i18n.getText("TILE_DESC_XSUNT");
		case 14:
			return sap.app.i18n.getText("TILE_DESC_UI5SEARCH");
		case 15:
			return sap.app.i18n.getText("TILE_DESC_JOBSCHEDULING");
		case 16:
			return sap.app.i18n.getText("TILE_DESC_ETAGSXSODATA");

		}
	}

	function showBusinessScenario(tileID) {
		switch (tileID) {
		case 3:
			return false;
		case 8:
			return true;
		case 1:
		case 2:
		case 4:
			return true;
		case 5:
		case 6:
		case 7:
		case 9:
		case 10:
		case 11:
		case 12:
			return false;
		}
	}

	function getBusinessScenario(tileID) {
		switch (tileID) {
		case 4:
			return sap.app.i18n.getText("TILE_BUSI_SCEN_SD");
		case 8:
			return sap.app.i18n.getText("TILE_BUSI_SCEN_SP");
		}
	}

	function getDBTablesViews(tileID) {
		switch (tileID) {
		case 1:
			return sap.app.i18n.getText("TILE_DB_VIEWS_DG");
		case 2:
			return sap.app.i18n.getText("TILE_DB_VIEWS_PO");
			// case 3:
			//     return sap.app.i18n.getText("TILE_DB_VIEWS_SD");
		case 3:
			return sap.app.i18n.getText("TILE_DB_VIEWS_JOBSCHEDULING");
		case 4:
			return sap.app.i18n.getText("TILE_DB_VIEWS_SD");
		case 5:
			return sap.app.i18n.getText("TILE_DB_VIEWS_US");
		case 6:
			return sap.app.i18n.getText("TILE_DB_VIEWS_UIS_BLUE");
		case 7:
			return sap.app.i18n.getText("TILE_DB_VIEWS_UIS_GOLD");
		case 8:
			return sap.app.i18n.getText("TILE_DB_VIEWS_SPATIAL");
		case 9:
			return sap.app.i18n.getText("TILE_DB_VIEWS_INATOOLKIT");
		case 10:
			return sap.app.i18n.getText("TILE_DB_VIEWS_SALES_MOB");
		case 11:
			return sap.app.i18n.getText("TILE_DB_VIEWS_FIORI");
		case 12:
			return sap.app.i18n.getText("TILE_DB_VIEWS_XSDS");
		case 13:
			return sap.app.i18n.getText("TILE_DB_VIEWS_XSUNT");
		case 14:
			return sap.app.i18n.getText("TILE_DB_VIEWS_UI5SEARCH");
		case 15:
			return sap.app.i18n.getText("TILE_DB_VIEWS_JOBSCHEDULING");
		case 16:
			return sap.app.i18n.getText("TILE_DB_VIEWS_ETAGSXSODATA");
		}
	}

	function getUIFolders(tileID) {
		switch (tileID) {
		case 1:
			return sap.app.i18n.getText("TILE_UI_FOLDER_DG");
		case 2:
			return sap.app.i18n.getText("TILE_UI_FOLDER_PO");
			// case 3:
			//     return sap.app.i18n.getText("TILE_UI_FOLDER_SD");
		case 3:
			return sap.app.i18n.getText("TILE_UI_FOLDER_JOBSCHEDULING");
		case 4:
			return sap.app.i18n.getText("TILE_UI_FOLDER_SD");
		case 5:
			return sap.app.i18n.getText("TILE_UI_FOLDER_US");
		case 6:
			return sap.app.i18n.getText("TILE_UI_FOLDER_UIS_BLUE");
		case 7:
			return sap.app.i18n.getText("TILE_UI_FOLDER_UIS_GOLD");
		case 8:
			return sap.app.i18n.getText("TILE_UI_FOLDER_SPATIAL");
		case 9:
			return sap.app.i18n.getText("TILE_UI_FOLDER_INATOOLKIT");
		case 10:
			return sap.app.i18n.getText("TILE_UI_FOLDER_SALES_MOB");
		case 11:
			return sap.app.i18n.getText("TILE_UI_FOLDER_FIORI");
		case 12:
			return sap.app.i18n.getText("TILE_UI_FOLDER_XSDS");
		case 13:
			return sap.app.i18n.getText("TILE_UI_FOLDER_XSUNT");
		case 14:
			return sap.app.i18n.getText("TILE_UI_FOLDER_UI5SEARCH");
		case 15:
			return sap.app.i18n.getText("TILE_UI_FOLDER_JOBSCHEDULING");
		case 16:
			return sap.app.i18n.getText("TILE_UI_FOLDER_ETAGSXSODATA");
		}
	}

	function getPermissions(tileID) {
		switch (tileID) {
		case 1:
			return sap.app.i18n.getText("TILE_PERMS_DG");
		case 2:
			return sap.app.i18n.getText("TILE_PERMS_PO");
			// case 3:
			//     return sap.app.i18n.getText("TILE_PERMS_SD");
		case 3:
			return sap.app.i18n.getText("TILE_PERMS_JOBSCHEDULING");
		case 4:
			return sap.app.i18n.getText("TILE_PERMS_SD");
		case 5:
			return sap.app.i18n.getText("TILE_PERMS_US");
		case 6:
			return sap.app.i18n.getText("TILE_PERMS_UIS_BLUE");
		case 7:
			return sap.app.i18n.getText("TILE_PERMS_UIS_GOLD");
		case 8:
			var permission = getInternetConnectivity();
			return permission;
		case 9:
			return sap.app.i18n.getText("TILE_PERMS_INATOOLKIT");
		case 10:
			return sap.app.i18n.getText("TILE_PERMS_SALES_MOB");
		case 11:
			return sap.app.i18n.getText("TILE_PERMS_FIORI");
		case 12:
			return sap.app.i18n.getText("TILE_PERMS_XSDS");
		case 14:
			return sap.app.i18n.getText("TILE_PERMS_UI5SEARCH");
		case 15:
			return sap.app.i18n.getText("TILE_PERMS_JOBSCHEDULING");
		case 16:
			return sap.app.i18n.getText("TILE_PERMS_ETAGSXSODATA");
		case 13:
			var responseBody = "<div><ul>";
			var duImport = false,
				executeRole = false;
			$.ajax({
				url: "/sap/hana/democontent/epm/ui/launchpad/services/xsUnitPermission.xsjs?cmd=DU",
				success: function (response) {
					if (response === "Hana Test Tools imported") {
						responseBody += "<li>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_DU") +
							" - <img src='/sap/hana/democontent/epm/ui/launchpad/images/green_tick.png' /> </li>";
						duImport = true;
					} else {
						responseBody += "<li>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_DU") +
							" - <img src='/sap/hana/democontent/epm/ui/launchpad/images/red_cross.png' /></li>";
					}
				},
				error: function () {
					responseBody += "<li>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_DU") +
						" -<span style='color:red'> Error while checking permission</span> </li>";
				},
				async: false
			});
			$.ajax({
				url: "/sap/hana/democontent/epm/ui/launchpad/services/xsUnitPermission.xsjs?cmd=Role",
				success: function (response) {
					if (response === "Test Execute Role available") {
						responseBody += "<li>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_ROLE") +
							" - <img src='/sap/hana/democontent/epm/ui/launchpad/images/green_tick.png' /> </li>";
						executeRole = true;
					} else {
						responseBody += "<li>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_ROLE") +
							" - <img src='/sap/hana/democontent/epm/ui/launchpad/images/red_cross.png' /> </li>";
					}
				},
				error: function () {
					responseBody += "<li>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_ROLE") +
						" - <span style='color:red'> Error while checking permission </span><</li>";
				},
				async: false
			});
			responseBody += "<li style='line-height:36px'>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_ASSERTION") + "</li>";
			responseBody += "<ol><li>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_ASSERTION_USER") + "</li>";
			responseBody += "<li>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_ASSERTION_PACKAGE") + "</li>";
			responseBody += "<li>" + sap.app.i18n.getText("TILE_PERMS_XSUNT_ASSERTION_DESTINATION") + "</li></ol></ul></div>";

			if (!(duImport && executeRole)) {
				responseBody += "<h3 style='color:red'>Please be advised you need the above permissions to run the xsunit tests.</h3>";
			}
			return responseBody;
		}
	}

	function getInternetConnectivity() {
		var status = navigator.onLine;
		var responseBody = "";
		if (status) {
			responseBody += " <li><font color='green'> You are connected to the internet. Good to go!!</font> </li>";
		} else {
			responseBody += "<li><font color='red'> Please connect to the internet to access this tile</font> </li>";
		}
		return responseBody;
	}

	function createWelcomeHeaderRow(tileID) {
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow(); // {height : '25px'});
		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			colSpan: 2,
			hAlign: sap.ui.commons.layout.HAlign.Center
		});
		var textView = new sap.ui.commons.TextView({
			text: getTitle(tileID),
			design: sap.ui.commons.TextViewDesign.H1
		});
		textView.addStyleClass("welcomeHeaderTextAlign");
		textView.addStyleClass('dialogTextColor');
		var oHorizontalLayout = new sap.ui.commons.layout.HorizontalLayout({
			content: [new sap.ui.core.Icon({
				src: getIcon(tileID),
				size: '26px',
				color: '#007CC0'
			}), textView]
		});
		oCell.addContent(oHorizontalLayout);
		oRow.addCell(oCell);
		return (oRow);
	}

	function createNotShowAgainChkBoxRow(oNotShowAgainChkBox) {
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			colSpan: 2,
			hAlign: sap.ui.commons.layout.HAlign.Right
		});
		oCell.addContent(oNotShowAgainChkBox);
		oRow.addCell(oCell);
		return (oRow);
	}

	function createDividerRow() {
		// hDevider row
		oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		// horizontal divider
		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			colSpan: 2,
			hAlign: sap.ui.commons.layout.HAlign.Left
		});
		var hDevider = new sap.ui.commons.HorizontalDivider();
		oCell.addContent(hDevider);
		oRow.addCell(oCell);
		return (oRow);
	}

	function checkXSuntPermission() {
		var duImport = false,
			executeRole = false;
		$.ajax({
			url: '/sap/hana/democontent/epm/ui/launchpad/services/xsUnitPermission.xsjs?cmd=DU',
			success: function (response) {
				if (response === "Hana Test Tools imported") {
					duImport = true;
				}
			},
			async: false
		});
		$.ajax({
			url: '/sap/hana/democontent/epm/ui/launchpad/services/xsUnitPermission.xsjs?cmd=Role',
			success: function (response) {
				if (response === "Test Execute Role available") {
					executeRole = true;
				}
			},
			async: false
		});
		if (!(duImport && executeRole)) {
			okButton.setEnabled(false);
		}
	}
};