jQuery.sap.declare("sap.account.WelcomeDialog");

sap.account.WelcomeDialog = function(oFrameController) {
    this.controller = oFrameController;
};

sap.account.WelcomeDialog.prototype.open = function() {

    //	var showWelcomeDialog = sap.app.localStorage.getPreference(sap.app.localStorage.PREF_DISPLAY_WELCOME_DIALOG);

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
    oContentMatrix.addRow(createWelcomeHeaderRow());

    // vspace
    oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
        height: '15px'
    }));

    // intro text
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
        width: '100%'
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("SHINE_INTRO"),
        design: sap.ui.commons.TextViewDesign.Standard,
        width: '100%'
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    // vspace
    oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
        height: '5px'
    }));

    oContentMatrix.addRow(createDividerRow());
	
	
	
    // what's new
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("WHATS_NEW"),
        design: sap.ui.commons.TextViewDesign.H3,
        width: '100%',
        textAlign: sap.ui.core.TextAlign.Center,
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
        content: sap.app.i18n.getText("SHINE_WHATS_NEW"),
        width: '100%'
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    // vspace
    oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
        height: '5px'
    }));
    
    // prompt for tiles help
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Center,
        width: '100%'
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("TILE_HELP_PROMPT"),
        design: sap.ui.commons.TextViewDesign.Standard,
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);
	
	//Adding the button check pre-requisites....
     oContentMatrix.addRow(createDividerRow());
	
   //GDPR warning message
	oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Center,
        width: '100%'
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("GDPR_MESSAGE"),
        design: sap.ui.commons.TextViewDesign.Standard,
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    // vspace
    // oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
    //     height: '2px'
    // }));
	
	
	
    //Adding the button check pre-requisites....
     oContentMatrix.addRow(createDividerRow());

    // check prerequisites
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Center,
        width: '100%'
    });

    var oCheckButton = new sap.ui.commons.Button({
        text: sap.app.i18n.getText("CHECK_PRE"),
        style: sap.ui.commons.ButtonStyle.Accept,
        press: function() {
            var checkDialog = new sap.account.CheckDialog(this);
            checkDialog.open();
        }
    });

    oCell.addContent(oCheckButton);
    oRow.addCell(oCell);
    //Adding the button check pre-requisites ENDS....
    oContentMatrix.addRow(oRow);

    // do not show again checkbox
    oContentMatrix.addRow(createNotShowAgainChkBoxRow(oNotShowAgainChkBox));

    oContent.addContent(oContentMatrix);

    var destroyDialog = function(oEvent) {
        oEvent.getSource().destroy();
    };

    var oWelcomeDialog = new sap.ui.commons.Dialog("WelcomeDialog", {
        modal: true,
        // a percentage width does result in an ugly vertical slider in Chrome
        width: '600px',
        content: oContent,
        closed: destroyDialog
    });

    var ok = function(oEvent) {
        sap.app.localStorage.storePreference(sap.app.localStorage.PREF_SHOW_WELCOME, !oNotShowAgainChkBox.getChecked());
        oWelcomeDialog.close();
    };
    var okButton = new sap.ui.commons.Button("welcomePageOkButton", {
        text: sap.app.i18n.getText("OK_BUTTON"),
        press: ok
    });
    oWelcomeDialog.addStyleClass("welcomeDlg");
    oWelcomeDialog.addButton(okButton).setDefaultButton(okButton).open();

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
