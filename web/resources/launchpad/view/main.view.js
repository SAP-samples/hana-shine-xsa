sap.ui.jsview("view.main", {

    /** Specifies the Controller belonging to this View. 
     * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
     * @memberOf shine-so.main
     */
    getControllerName: function() {
        return "view.main";
    },

    /**
     * Utility method to handle all tile click events.
     */
    handlePress: function(oController, tileID) {

        var value = sap.app.localStorage.getPreference(sap.app.localStorage.PREF_TILE_HELP_SHOW_PREFIX + tileID);
        if (value !== 'false') {
            var tileDialog = new sap.account.TileDialog(oController);
            tileDialog.open(tileID);
        } else {
            var tileDialog = new sap.account.TileDialog(oController);
            window.location = tileDialog.getHrefLocation(tileID);
        }

    },

    /** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
     * Since the Controller is given to this method, its event handlers can be attached right away.
     * @memberOf launchpad.main
     */
    createContent: function(oController) {
        var view = this;

        var app = new sap.m.App({
            initialPage: "home"
        });

        var adminTile = new sap.m.StandardTile({
            icon: "sap-icon://database",
            removable: false,
            press: function(oEvent) {

                view.handlePress(oController, 1);

            },
            info: sap.app.i18n.getText("DG"),
            infoState: "None"
        });
        adminTile.addStyleClass('templateTileClass');
        adminTile.addStyleClass('dgClass');

        var poTile = new sap.m.StandardTile({
            icon: "sap-icon://my-sales-order",
            info: sap.app.i18n.getText("POWLIST"),
            infoState: "None",
            removable: false,
            press: function(oEvent) {
                view.handlePress(oController, 2);
            }
        });
        poTile.addStyleClass('templateTileClass');
        poTile.addStyleClass('poClass');

        var jobTile = new sap.m.StandardTile({
            icon: "sap-icon://time-entry-request",
            info: sap.app.i18n.getText("JOBSCHEDULING"),
            infoState: "None",
            removable: false,
            press: function(oEvent) {
                view.handlePress(oController, 3);
            }
        });
        jobTile.addStyleClass('templateTileClass');
        jobTile.addStyleClass('jobschedulingClass');
        
          var soTile = new sap.m.StandardTile({
            icon: "sap-icon://sales-order",
            info: sap.app.i18n.getText("SALES_DASH"),
            infoState: "None",
            removable: false,
            press: function(oEvent) {
                view.handlePress(oController, 4);
            }
        });
        soTile.addStyleClass('templateTileClass');
        soTile.addStyleClass('soClass');

        var userTile = new sap.m.StandardTile({
            icon: "sap-icon://account",
            info: sap.app.i18n.getText("USER"),
            infoState: "None",
            removable: false,
            press: function(oEvent) {
                view.handlePress(oController, 5);
            }
        });
        userTile.addStyleClass('templateTileClass');
        userTile.addStyleClass('ucClass');
        
        var spatialTile = new sap.m.StandardTile({
            icon: "sap-icon://map",
            info: sap.app.i18n.getText("SPATIAL"),
            infoState: "None",
            removable: false,
            press: function(oEvent) {
                view.handlePress(oController, 8);
            }
        });
        spatialTile.addStyleClass('templateTileClass');
        spatialTile.addStyleClass('spatialClass');
        
        var oLink1 = new sap.ui.commons.Link({
	    text: "Source code",
	    tooltip: "Click to download Source code"
	    
		});
	    oLink1.setHref("/epm.zip");
       
        var items = [
            adminTile, poTile, jobTile, soTile, userTile, spatialTile
        ];
        // create tile container
        var tileContainer = new sap.m.TileContainer({
            tileDelete: function(evt) {
                var tile = evt.getParameter("tile");
                evt.getSource().removeTile(tile);
            },
            tiles: items
        });

        var titleLabel = new sap.m.Label({
            design: sap.m.LabelDesign.Bold,
            text: 'SHINE (SAP HANA Interactive Education) for SAP HANA XS Advanced Model'
        });

        var page = new sap.m.Page("home", {
            // title: "Home",
            icon: 'images/SAPLogo.gif',
            customHeader: new sap.m.Bar({
                // enableFlexBox: true,
                contentMiddle: [new sap.m.Image({
                        height: '26px',
                        src: 'images/SAPLogo.gif',
                    }),
                    // label
		
                 titleLabel
                ]

            }),             
          
            content: [tileContainer],
            enableScrolling: false
        });

        app.addPage(page);
        return app;
    }

});

