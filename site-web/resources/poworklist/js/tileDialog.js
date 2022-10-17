jQuery.sap.declare("sap.account.TileDialog");

sap.account.TileDialog = function(oFrameController,helpID) {
    this.controller = oFrameController;
    // Help 1: Search

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
    oContentMatrix.addRow(createWelcomeHeaderRow(helpID));

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
        content: getDescription(helpID),
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

    // Major db tables/views
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left
    });
    oTextView = new sap.ui.commons.TextView({
        text: oBundle.getText("MAJOR_TABLES"),
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
        text: getModel(helpID)
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    oContentMatrix.addRow(createDividerRow());

    // UI views information
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left
    });
    oTextView = new sap.ui.commons.TextView({
        text: oBundle.getText("UI_VIEWS"),
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
        content: getUIViews(helpID),
        width: '100%'
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    oContent.addContent(oContentMatrix);

    var destroyDialog = function(oEvent) {
        oEvent.getSource().destroy();
    };

    var oTileDialog = new sap.ui.commons.Dialog({
        modal: true,
        // a percentage width does result in an ugly vertical slider in Chrome
        width: '600px',
        content: oContent,
        closed: destroyDialog
    });

    var ok = function(oEvent) {
        oTileDialog.close();
    };
    var okButton = new sap.ui.commons.Button({
        text: oBundle.getText("OK"),
        press: ok
    });
    oTileDialog.addStyleClass("welcomeDlg");
    oTileDialog.addButton(okButton).setDefaultButton(okButton);
    
    return oTileDialog;

    function getTitle(helpID) {
        switch (helpID) {
            case 1:
                return oBundle.getText("s_search");
            case 2:
                return oBundle.getText("ACTIONS_EXPORT");
        }
    }

    function getDescription(helpID) {
        switch (helpID) {
            case 1:
                return oBundle.getText("SEARCH_HELP_DESC");
            case 2:
                return oBundle.getText("ACTIONS_EXPORT_DESC");
        }
    }

    function getModel(helpID) {
        switch (helpID) {
            case 1:
                return oBundle.getText("SEARCH_HELP_MODEL");
            case 2:
                return oBundle.getText("ACTIONS_EXPORT_MODEL");
        }
    }

    function getUIViews(helpID) {
        switch (helpID) {
            case 1:
                return oBundle.getText("SEARCH_HELP_UI");
            case 2:
                return oBundle.getText("ACTIONS_EXPORT_UI");
        }
    }

    function createWelcomeHeaderRow(helpID) {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow(); // {height : '25px'});
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            colSpan: 2,
            hAlign: sap.ui.commons.layout.HAlign.Center
        });
        var textView = new sap.ui.commons.TextView({
            text: getTitle(helpID),
            design: sap.ui.commons.TextViewDesign.H1
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
            colSpan: 2,
            hAlign: sap.ui.commons.layout.HAlign.Left
        });
        var hDevider = new sap.ui.commons.HorizontalDivider();
        oCell.addContent(hDevider);
        oRow.addCell(oCell);
        return (oRow);
    }
};

sap.account.TileDialog.prototype.open = function(helpID) {

    this.open();
    
};