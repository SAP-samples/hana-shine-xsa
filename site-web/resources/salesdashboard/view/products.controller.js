sap.ui.controller("sap.hana.democontent.epm.salesdashboard.view.products", {

    onAfterRendering: function() {
        var oModel = new sap.ui.model.odata.ODataModel(
                "/sap/hana/democontent/epm/services/salesYearCompare.xsodata",
                true);
        var sort1 = new sap.ui.model.Sorter("PRODUCT_CATEGORY");

        var currentYear = new Date().getFullYear();
        var previousYear = new Date().getFullYear() - 1;
        var dataset = new sap.viz.ui5.data.FlattenedDataset({
            dimensions : [ {
                axis : 1,
                name : sap.app.i18n.getText("PRODUCT_CATEGORY"),
                value : "{PRODUCT_CATEGORY}"
            } ],
            measures : [
                    {
                        name : sap.app.i18n.getText("SALES_FOR_YEAR",
                                [ previousYear ]),
                        value : '{YEAR1_NET_AMOUNT}'
                    },
                    {
                        name : sap.app.i18n.getText("SALES_FOR_YEAR",
                                [ currentYear ]),
                        value : '{YEAR2_NET_AMOUNT}'
                    } ]
        });
        dataset.setModel(oModel);

        var bindString = "/InputParams(IP_YEAR_1=" + previousYear
                + ",IP_YEAR_2=" + currentYear + ")/Results";

        dataset.bindData(bindString, sort1);

        //var oYearsCompareBarChart = sap.ui.getCore().byId("products--salesCompareColumn");
        var oYearsCompareBarChart = this.getView().byId("salesCompareColumn");
        oYearsCompareBarChart.setDataset(dataset);
        
        var xAxis = oYearsCompareBarChart.getXAxis();
        var yAxis = oYearsCompareBarChart.getYAxis();

        xAxis.setTitle(new sap.viz.ui5.types.Axis_title({
            visible : true,
            text : sap.app.i18n.getText("PRODUCT_CATEGORY")
        }));

        yAxis.setTitle(new sap.viz.ui5.types.Axis_title({
            visible : true,
            text : sap.app.i18n.getText("SALES_IN_EUR")
        }));
        
        //
        
        oModel = new sap.ui.model.odata.ODataModel (
                "/sap/hana/democontent/epm/services/salesByProduct.xsodata",
                true);
        sort1 = new sap.ui.model.Sorter("TOTAL_SALES");

        dataset = new sap.viz.ui5.data.FlattenedDataset({

            dimensions : [ {
                axis : 1,
                name : sap.app.i18n.getText("PRODUCT"),
                value : "{PRODUCT_NAME}"
            } ],

            measures : [ {
                group : 1,
                name : sap.app.i18n.getText("SALES"),
                value : '{SALES}'
            }, 
            
            {
                group : 2,
                name : sap.app.i18n.getText("SALES_SHARE"),
                value : '{SHARE_SALES}'
            } ]
        });
        dataset.setModel(oModel);
        //dataset.bindData("/SalesByProduct");
        dataset.bindData({
                path: "/SalesByProduct",
            	length: 1000
        });

        //var oSalesRankBubble = sap.ui.getCore().byId("products--productSalesScatter");
        var oSalesRankBubble = this.getView().byId("productSalesScatter");
        oSalesRankBubble.setDataset(dataset);
        
        xAxis = oSalesRankBubble.getXAxis();
        yAxis = oSalesRankBubble.getYAxis();

        xAxis.setTitle(new sap.viz.ui5.types.Axis_title({
            visible : true,
            text : sap.app.i18n.getText("SALES_IN_EUR")
        }));

        yAxis.setTitle(new sap.viz.ui5.types.Axis_title({
            visible : true,
            text : sap.app.i18n.getText("SALES_SHARE")
        }));

        oSalesRankBubble.getLegend().setIsScrollable(true); 
    },
    
    openTileDialog: function(oEvent) {
        var iData = parseInt(oEvent.getSource().data("tileDialog"), 10);
        var tileDialog = new sap.account.TileDialog(this );
        tileDialog.open(iData);
    }



});
