jQuery.sap.declare("sap.account.WelcomeDialog");

var isSettings = false;
sap.account.WelcomeDialog = function (oFrameController, isSettings) {
	this.controller = oFrameController;
	this.isSettings = isSettings;
};

sap.account.WelcomeDialog.prototype.open = function () {

	var radioselectIndex = 0;
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
	oContentMatrix.addRow(createWelcomeHeaderRow());

	// vspace
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '30px'
	}));

	function setSelectedIndex(index) {

		radioselectIndex = index;

	}

	function getSelectedIndex() {

		return radioselectIndex;
	}

	function addDisclaimer() {

		oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			hAlign: sap.ui.commons.layout.HAlign.Left,
			width: '100%'
		});
		/*oTextView = new sap.ui.core.HTML({
        content: permissions,
        width: '100%'
    }); */

		var oTextView = new sap.ui.commons.TextView({
			text: sap.app.i18n.getText("DISCLAIMER"),
			design: sap.ui.commons.TextViewDesign.H3,
			width: '100%',
			textAlign: sap.ui.core.TextAlign.Left,
		});
		oTextView.addStyleClass('dialogTextColor');
		oCell.addContent(oTextView);

		oTextView = new sap.m.TextArea({
			value: sap.app.i18n.getText("DISCLAIMER_TEXT"),
			rows: 10,
			editable: false,
			width: '100%'
		});
		oTextView.addStyleClass('sapUiSmallMarginTop');

		oCell.addContent(oTextView);
		oRow.addCell(oCell);
		oContentMatrix.addRow(oRow);

	}

	function addDisclaimerButtons() {

		oRow = new sap.ui.commons.layout.MatrixLayoutRow();
		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			hAlign: sap.ui.commons.layout.HAlign.Left,
			width: '100%'
		});
		oRadioButtonGrp = new sap.m.RadioButtonGroup({
			id: "rbgrp1",
			columns: 5,
			selectedIndex: 0,
			width: '100%'

		});
		oRadioButtonGrp.addButton(new sap.m.RadioButton({
			text: "Yes"
		}))
		oRadioButtonGrp.addButton(new sap.m.RadioButton({
			text: "No"
		}))

		oRadioButtonGrp.attachEvent("select", function (event) {

		var selectedIndex = event.getParameter("selectedIndex");
			if(selectedIndex === 1){
				appIdInput.setEnabled(false); 
				appIdInput.setValue("");
				appCodeInput.setEnabled(false);
				appCodeInput.setValue("");
			}
			else
			{
				appIdInput.setEnabled(true); 
				appCodeInput.setEnabled(true)
			}
			
			setSelectedIndex(selectedIndex);
		})

		oRadioButtonGrp.addStyleClass('sapUiTinyMarginTop');

		var oLabel = new sap.m.Label({
			labelFor: "rbgrp1",
			columns: "5",
			text: sap.app.i18n.getText("ACCEPT")
		});
		oLabel.addStyleClass('sapUiSmallMarginTop');
		oCell.addContent(oLabel);
		oCell.addContent(oRadioButtonGrp);

		oRow.addCell(oCell);
		oContentMatrix.addRow(oRow);

	}

	addDisclaimer();
	addDisclaimerButtons();
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '20px'
	}));

	oContentMatrix.addRow(createDividerRow());

	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '10px'
	}));

	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left,
		width: '100%'
	});
	oTextView = new sap.ui.commons.TextView({
		text: sap.app.i18n.getText("WELCOME_DESC"),
		design: sap.ui.commons.TextViewDesign.Standard,
		width: '100%'
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	// vspace
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '20px'
	}));

	oContentMatrix.addRow(createDividerRow());

	// get evaluation key
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left
	});
	oTextView = new sap.ui.commons.TextView({
		text: sap.app.i18n.getText("WELCOME_LINK_EVAL_TITLE"),
		design: sap.ui.commons.TextViewDesign.H3,
		width: '100%',
		textAlign: sap.ui.core.TextAlign.Left,
	});
	oTextView.addStyleClass('dialogTextColor');
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	// vspace
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '10px'
	}));

	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left,
		width: '100%'
	});
	oTextView = new sap.ui.commons.Link({
		text: sap.app.i18n.getText("WELCOME_LINK_EVAL"),
		href: sap.app.i18n.getText("WELCOME_LINK_EVAL"),
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	// vspace
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '10px'
	}));

	oContentMatrix.addRow(createDividerRow());

	// more information
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left
	});
	oTextView = new sap.ui.commons.TextView({
		text: sap.app.i18n.getText("WELCOME_LINK_INFO_TITLE"),
		design: sap.ui.commons.TextViewDesign.H3,
		width: '100%',
		textAlign: sap.ui.core.TextAlign.Left,
	});
	oTextView.addStyleClass('dialogTextColor');
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	// vspace
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '10px'
	}));

	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

	oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		hAlign: sap.ui.commons.layout.HAlign.Left,
		width: '100%'
	});
	oTextView = new sap.ui.commons.Link({
		text: sap.app.i18n.getText("WELCOME_LINK_INFO"),
		href: sap.app.i18n.getText("WELCOME_LINK_INFO"),
	});
	oCell.addContent(oTextView);
	oRow.addCell(oCell);
	oContentMatrix.addRow(oRow);

	// vspace
	oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
		height: '10px'
	}));

	oContentMatrix.addRow(createDividerRow());
	var destroyDialog = function (oEvent) {
		oEvent.getSource().destroy();
	};

	var oWelcomeDialog = new sap.ui.commons.Dialog("WelcomeDialog", {
		modal: true,
		// a percentage width does result in an ugly vertical slider in Chrome
		width: '600px',
		content: oContent,
		closed: destroyDialog
	});
	if (this.isSettings === true) {
		// more information
		oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			hAlign: sap.ui.commons.layout.HAlign.Left
		});
		oTextView = new sap.ui.commons.TextView({
			text: sap.app.i18n.getText("WELCOME_INPUT_TITLE"),
			design: sap.ui.commons.TextViewDesign.H3,
			width: '100%',
			textAlign: sap.ui.core.TextAlign.Left,
		});
		oTextView.addStyleClass('dialogTextColor');
		oCell.addContent(oTextView);
		oRow.addCell(oCell);
		oContentMatrix.addRow(oRow);

		oContentMatrix.addRow(createDividerRow());
		// add APP ID input
		oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			hAlign: sap.ui.commons.layout.HAlign.Left,
			width: '100%'
		});
		var apiKeyInput = new sap.ui.commons.TextField({
			placeholder: sap.app.i18n.getText("WELCOME_INPUT_APIKEY"),
			width: '100%'
		});
		oCell.addContent(apiKeyInput);
		oRow.addCell(oCell);
		oContentMatrix.addRow(oRow);

		// add APP Code input
		// oRow = new sap.ui.commons.layout.MatrixLayoutRow();

		// oCell = new sap.ui.commons.layout.MatrixLayoutCell({
		// 	hAlign: sap.ui.commons.layout.HAlign.Left,
		// 	width: '100%'
		// });
		// var appCodeInput = new sap.ui.commons.TextField({
		// 	placeholder: sap.app.i18n.getText("WELCOME_INPUT_APPCODE"),
		// 	width: '100%'
		// });
		// oCell.addContent(appCodeInput);
		// oRow.addCell(oCell);
		// oContentMatrix.addRow(oRow);

		oContent.addContent(oContentMatrix);

		oContentMatrix.addRow(createDividerRow());

		var ok = function (oEvent) {

			if (getSelectedIndex() === 1) {

				window.location.href = '/launchpad/index.html';
			}

			// store the user input in database
			if (apiKeyInput.getValue() != '') {

				// handle xsrf token
				// first obtain token using Fetch
				var xsrf_token;
				$.ajax({
					type: "GET",
					async: false, // request has to synchronous
					url: "/sap/hana/democontent/epm/services/soCreate.xsodata",
					contentType: "application/json",
					headers: {
						'x-csrf-token': 'Fetch',
						'Accept': "application/json"
					}, // request server to send the token with the response
					success: function (data, textStatus, request) {
						xsrf_token = request.getResponseHeader('x-csrf-token'); // store the token in a variable for future use
					}
				});

				var entry = {};
				var apiKeyInputValue = apiKeyInput.getValue();
				entry.API_KEY = btoa(apiKeyInputValue);

				var userId = "";
				var aUrl = '/sap/hana/democontent/epm/services/poWorklistQuery.xsjs?cmd=getSessionInfo';
				var loggedUser = "";
				var apiKeyKey;
				jQuery.ajax({
					url: aUrl,
					method: 'GET',
					dataType: 'json',
					async: false,
					success: function (myJSON) {
						userId = myJSON.session[0].UserName;

						location.reload();
						apiKeyKey = userId + ":apiKey";
					},
					error: function (err) {
						sap.ui.commons.MessageBox.alert("Unexpected Error" + err + "Please check the application logs for more details");
					}
				});
				var secureStore = {};
				secureStore.apiKeyKey = apiKeyKey;
				secureStore.apiKey = entry.API_KEY;

				jQuery.ajax({
					url: "/sap/hana/democontent/epm/services/secureStore.xsjs?cmd=store",
					method: 'POST',
					data: JSON.stringify(secureStore),
					dataType: 'json',
					headers: {
						'x-csrf-token': xsrf_token
					},
					async: false,
					success: function (myJSON) {
						sap.ui.commons.MessageBox.alert("The credentials are successfully in Hana Secure Store");
					},
					error: function (err) {
						sap.ui.commons.MessageBox.alert("Unexpected Error" + err + "Please check the application logs for more details");
					}
				});

				oWelcomeDialog.close();
			} else {
				sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("WELCOME_INVALID_KEY"));
			}

		};
		var okButton = new sap.ui.commons.Button("welcomePageOkButton", {
			text: sap.app.i18n.getText("WELCOME_SUBMIT"),
			press: ok
		});
		oWelcomeDialog.addButton(okButton).setDefaultButton(okButton).open();
	} else {
		var okButton = new sap.ui.commons.Button("welcomePageOkButton", {
			text: "ok",
			press: closeWindow
		});
		oWelcomeDialog.addButton(okButton).setDefaultButton(okButton).open();
	}
	oContent.addContent(oContentMatrix);
	oWelcomeDialog.addStyleClass("welcomeDlg");

	function closeWindow() {
		oWelcomeDialog.close();
	}

	function createWelcomeHeaderRow() {
		var oRow = new sap.ui.commons.layout.MatrixLayoutRow(); // {height : '25px'});
		var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
			colSpan: 2,
			hAlign: sap.ui.commons.layout.HAlign.Left
		});
		var textView = new sap.ui.commons.TextView({
			text: sap.app.i18n.getText("TITLE"),
			design: sap.ui.commons.TextViewDesign.H1
		});
		textView.addStyleClass("welcomeHeaderTextAlign");
		textView.addStyleClass('dialogTextColor');
		var oHorizontalLayout = new sap.ui.commons.layout.HorizontalLayout({
			content: [new sap.ui.commons.Image({
				src: "./images/SAPLogo.gif"
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
};