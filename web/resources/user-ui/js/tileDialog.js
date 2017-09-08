jQuery.sap.declare("sap.account.TileDialog");

sap.account.TileDialog = function(oFrameController,helpID) {
    this.controller = oFrameController;
    
     // Help 1: Create single
    // Help 2: Create Batch
    // Help 3: Delete and update

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
    oTextView = new sap.ui.commons.TextView({
        text: getDescription(helpID),
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

    // OData service
    createHeaderRow(1, oContentMatrix);
    createContentRow(helpID, 1, oContentMatrix);

    oContentMatrix.addRow(createDividerRow());

    // Procedure
    if (helpID == 1 || helpID == 2) {
        createHeaderRow(2, oContentMatrix);
        createContentRow(helpID, 2, oContentMatrix);

        oContentMatrix.addRow(createDividerRow());
    }

    // controller method
    createHeaderRow(3, oContentMatrix);
    createContentRow(helpID, 3, oContentMatrix);

    oContentMatrix.addRow(createDividerRow());

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
        text: "{i18n>OK}",
        press: ok
    });
    oTileDialog.addStyleClass("welcomeDlg");
    //oTileDialog.addButton(okButton).setDefaultButton(okButton).open();

    return oTileDialog.addButton(okButton).setDefaultButton(okButton);
    
    function getTitle(helpID) {
        switch (helpID) {
            case 1:
                return "{i18n>ADD_NEW_RECORD}";
            case 2:
                return "{i18n>CREATE_BATCH}";
            case 3:
                return "{i18n>UPDATE_DELETE}";
            case 4:
                return "{i18n>CREATE_XML}";
        }
    }

    function getDescription(helpID) {
        return "{i18n>HELP_DESC_" + helpID + "}";
    }

    function getContentString(helpID, id) {
        switch (id) {
            case 1:
                return "{i18n>HELP_ODATA_" + helpID + "}";
            case 2:
                return "{i18n>HELP_PROCEDURE_" + helpID + "}";
            case 3:
                return "{i18n>HELP_CONTROLLER_" + helpID + "}";
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

    function createHeaderRow(id, oContentMatrix) {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign: sap.ui.commons.layout.HAlign.Left
        });
        var oTextView = new sap.ui.commons.TextView({
            text: "{i18n>HELP_HEADER_" + id + "}",
            design: sap.ui.commons.TextViewDesign.H3,
            width: '100%',
            textAlign: sap.ui.core.TextAlign.Left,
        });
        oTextView.addStyleClass('dialogTextColor');
        oCell.addContent(oTextView);
        oRow.addCell(oCell);
        oContentMatrix.addRow(oRow);
    }

    function createContentRow(helpID, id, oContentMatrix) {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow();

        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            hAlign: sap.ui.commons.layout.HAlign.Left,
            width: '100%'
        });
        var oTextView = new sap.ui.core.HTML({
            content: getContentString(helpID, id),
            width: '100%'
        });
        oCell.addContent(oTextView);
        oRow.addCell(oCell);
        oContentMatrix.addRow(oRow);
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