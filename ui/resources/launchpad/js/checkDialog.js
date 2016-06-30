jQuery.sap.declare("sap.account.CheckDialog");

sap.account.CheckDialog = function(oFrameController) {
    this.controller = oFrameController;
};

sap.account.CheckDialog.prototype.open = function() {

    var oContent = new sap.ui.commons.layout.VerticalLayout({
        height: "100%",
        width: "100%"
    });

    var oContentMatrix = new sap.ui.commons.layout.MatrixLayout({
        layoutFixed: false,
        columns: 2,
        width: '100%',
        height: '100%',
        widths: ['50%', '50%']
    });

    // title
    oContentMatrix.addRow(createHeaderRow());

    // vspace
    oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
        height: '20px'
    }));

    // prompt to help document
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
        width: '100%',
        colSpan: 2
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("PRE_PROMPT"),
        design: sap.ui.commons.TextViewDesign.H3,
        width: '100%',
        textAlign: sap.ui.core.TextAlign.Center,
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    // vspace
    oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
        height: '10px'
    }));

    // add the button to launch help guide pdf
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Center,
        width: '100%',
        colSpan: 2
    });

    var oLinkButton = new sap.ui.commons.Button({
        text: sap.app.i18n.getText("LINK_PROMPT"),
        style: sap.ui.commons.ButtonStyle.Accept,
        press: function() {
            window.open(sap.app.i18n.getText("PDF_LINK"));
        }
    });

    oCell.addContent(oLinkButton);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    // vspace
    oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
        height: '10px'
    }));

    oContentMatrix.addRow(createDividerRow());

    var destroyDialog = function(oEvent) {
        oEvent.getSource().destroy();
    };

    // initialize dialog 
    var oCheckDialog = new sap.ui.commons.Dialog({
        modal: true,
        // a percentage width does result in an ugly vertical slider in Chrome
        width: '600px',
        content: oContent,
        closed: destroyDialog
    });

    // add rows
    // time data 
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    // time data prerequisite title
    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("TIME_DATA_GENERATED"),
        design: sap.ui.commons.TextViewDesign.H3,
        textAlign: sap.ui.core.TextAlign.Left,
    });
    oTextView.addStyleClass('dialogTextColor');
    oCell.addContent(oTextView);

    // time data prerequisite status	
    oCellStatus = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Right,
    });
    oCheckDialog.tdStatusLayout = new sap.ui.layout.HorizontalLayout({
        content: [new sap.m.BusyIndicator({
            size: "1.4em"
        })]
    });
    oCellStatus.addContent(oCheckDialog.tdStatusLayout);
    oRow.addCell(oCell);
    oRow.addCell(oCellStatus);

    oContentMatrix.addRow(oRow);

    // add Time Data Info
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
        width: '100%',
        colSpan: 2
    });
    oTextView = new sap.ui.core.HTML({
        content: sap.app.i18n.getText("TIME_INFO"),
        width: '100%'
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    // add button to generate time data
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Right,
        width: '100%',
        colSpan: 2
    });

    oCheckDialog.timeBtn = new sap.ui.commons.Button({
        text: sap.app.i18n.getText("GENERATE_TIME_DATA"),
        enabled: false,
        press: function() {
            oCheckDialog.timeBtn.setEnabled(false);

            // check the prerequesites
            $.ajax({
                url: '/sap/hana/democontent/epm/ui/launchpad/services/generateTimeData.xsjs',
                type: 'GET',
                async: true,
                success: function(data) {

                },
                error: function() {

                }
            });

            // re-trigger the check
            setTimeout(checkPre, 1000);
        }
    });
    oCell.addContent(oCheckDialog.timeBtn);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    oContentMatrix.addRow(createDividerRow());

    // Synonyms present
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    // Synonyms present prerequisite title
    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("SYNONYM_PRESENT"),
        design: sap.ui.commons.TextViewDesign.H3,
        textAlign: sap.ui.core.TextAlign.Left,
    });
    oTextView.addStyleClass('dialogTextColor');
    oCell.addContent(oTextView);

    // Synonyms present prerequisite status	
    oCellStatus = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Right,
    });
    oCheckDialog.synonymLayout = new sap.ui.layout.HorizontalLayout({
        content: [new sap.m.BusyIndicator({
            size: "1.4em"
        })]
    });
    oCellStatus.addContent(oCheckDialog.synonymLayout);
    oRow.addCell(oCell);
    oRow.addCell(oCellStatus);

    oContentMatrix.addRow(oRow);

    // add Synonyms Info
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
        width: '100%',
        colSpan: 2
    });
    oTextView = new sap.ui.core.HTML({
        content: sap.app.i18n.getText("SYNONYMS_INFO"),
        width: '100%'
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    // add button to create synonyms
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Right,
        width: '100%',
        colSpan: 2
    });

    oCheckDialog.synonymBtn = new sap.ui.commons.Button({
        text: sap.app.i18n.getText("CREATE_SYNONYMS"),
        enabled: false,
        press: function() {
            oCheckDialog.synonymBtn.setEnabled(false);
            // check the prerequesites
            $.ajax({
                url: '/sap/hana/democontent/epm/admin/DataGen.xsjs?cmd=synonym',
                type: 'GET',
                async: true,
                success: function(data) {

                },
                error: function() {

                }
            });

            // re-trigger the check
            setTimeout(checkPre, 1000);
        }
    });
    oCell.addContent(oCheckDialog.synonymBtn);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    oContentMatrix.addRow(createDividerRow());

    // add matrix layout to content
    oContent.addContent(oContentMatrix);

    var ok = function(oEvent) {
        oCheckDialog.close();
    };
    var okButton = new sap.ui.commons.Button({
        text: sap.app.i18n.getText("OK_BUTTON"),
        press: ok
    });
    oCheckDialog.addStyleClass("welcomeDlg");
    oCheckDialog.addButton(okButton).setDefaultButton(okButton).open();

    // trigger check
    checkPre();

    function checkPre() {
        // check the prerequesites
        jQuery.ajax({
            url: '/sap/hana/democontent/epm/ui/launchpad/services/checkPrerequisites.xsjs',
            type: 'GET',
            dataType: 'text',
            success: function(data) {
                var response = JSON.parse(data);
                // time data check
                oCheckDialog.tdStatusLayout.removeAllContent();
                if (response.hasTimeData) {
                    oCheckDialog.tdStatusLayout.addContent(new sap.ui.commons.Image({
                        src: './launchpad/images/green_tick.png',
                    }));
                } else {
                    oCheckDialog.timeBtn.setEnabled(true);
                    oCheckDialog.tdStatusLayout.addContent(new sap.ui.commons.Image({
                        src: './launchpad/images/red_cross.png',
                    }));
                }

                // synonyms check
                oCheckDialog.synonymLayout.removeAllContent();
                if (response.synonymsPresent) {
                    oCheckDialog.synonymLayout.addContent(new sap.ui.commons.Image({
                        src: './launchpad/images/green_tick.png',
                    }));
                } else {
                    oCheckDialog.synonymBtn.setEnabled(true);
                    oCheckDialog.synonymLayout.addContent(new sap.ui.commons.Image({
                        src: './launchpad/images/red_cross.png',
                    }));
                }
            },
            error: function() {
                alert(sap.app.i18n.getText("CANT_CHECK"));
            }
        });
    }

    function createHeaderRow() {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow(); // {height : '25px'});
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            colSpan: 2,
            hAlign: sap.ui.commons.layout.HAlign.Center
        });
        var textView = new sap.ui.commons.TextView({
            text: sap.app.i18n.getText("CHECKING_PRE"),
            design: sap.ui.commons.TextViewDesign.H1
        });
        textView.addStyleClass("welcomeHeaderTextAlign");
        textView.addStyleClass('dialogTextColor');
        var oHorizontalLayout = new sap.ui.commons.layout.HorizontalLayout({
            content: [textView]
        });
        oCell.addContent(oHorizontalLayout);
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