//To use a javascript controller its name must end with .controller.js
sap.ui.controller("shine.democontent.epm.spatial.view.productsHeatMap", {

	onInit: function() {

	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf shine_so.main
	 */
	onAfterRendering: function() {
		var view = this.getView();
		var controller = this;

		var oModel = new sap.ui.model.odata.ODataModel('/sap/hana/democontent/epm/spatial/services/productSales.xsodata', true);
		this.getView().setModel(oModel);
		oModel.attachRequestCompleted(function(oEvent) {

		});

		(view.byId("selector")).bindItems({
			path: '/ProductDetails',
			parameters: {
				select: 'PRODUCTID,PRODUCT_NAME'
			},
			template: new sap.ui.core.Item({
				key: "{PRODUCTID}",
				text: "{PRODUCT_NAME}"
			}),
			sorter: new sap.ui.model.Sorter("PRODUCT_NAME")
		});

		(view.byId("selector")).onAfterRendering = function(oEvent) {
			controller.loadDataForProduct('HT-2001', view, controller);
		};

		// Get the DOM node to which we will append the map
		var mapContainer = document.getElementById("productsHeatMap--splitter2_firstPane");

		try {
			// Obtain the default map types from the platform object:
			var defaultLayers = sap.app.platform.createDefaultLayers();

			// Instantiate (and display) a map object:
			var map = new H.Map(
				mapContainer,
				defaultLayers.normal.map, {
					zoom: 2,
					center: {
						lat: 10.0,
						lng: 0.0
					}
				});
			controller.map = map;

			// MapEvents enables the event system
			// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
			var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

			// Create the default UI:
			var ui = H.ui.UI.createDefault(map, defaultLayers);

		} catch (e) {
			// The heat map overlay constructor throws an exception if there
			// is no canvas support in the browser
			console.log(e);
		}

	},

	onProductSelected: function() {
		var oController = this;
		oController.loadDataForProduct(oController.getView().byId("selector").getSelectedKey(),
			oController.getView(), oController);
	},

	loadDataForProduct: function(productID, view, oController) {
		(view.byId("oSalesChart")).bindRows({
			path: '/ProductSales',
			filters: [
				new sap.ui.model.Filter("PRODUCT_PRODUCTID", "EQ", productID)
			]
		});

		OData.read("/sap/hana/democontent/epm/spatial/services/productSales.xsodata/ProductRegionQuantity?$filter=PRODUCT_PRODUCTID eq '" +
			productID + "'",
			function(data, request) {
				// Only start loading data if the heat map overlay was successfully created
				if (data.results && data.results.length > 0) {
					if (oController.map.getLayers()) {
						oController.map.removeLayer(oController.heatmapLayer);
					}
					// Create heat map provider
					oController.heatmapProvider = new H.data.heatmap.Provider({
						colors: new H.data.heatmap.Colors({
							'0': 'blue',
							'0.5': 'yellow',
							'1': 'red'
						}, true),
						// paint assumed values in regions where no data is available
						assumeValues: true
					});
					for (var i = 0; i < data.results.length; i++) {
						oController.heatmapProvider.addData([{
							lat: data.results[i].LATITUDE,
							lng: data.results[i].LONGITUDE,
							value: data.results[i].QUANTITY
						}]);
					}

					// Create semi transparent heat map layer
					oController.heatmapLayer = new H.map.layer.TileLayer(oController.heatmapProvider, {
						opacity: 0.8
					});

					// Add layer to the map
					oController.map.addLayer(oController.heatmapLayer);
				} else {
					if (oController.map.getLayers()) {
						oController.map.removeLayer(oController.heatmapLayer);
					}
				}
			},
			function(err) {
				sap.ui.commons.MessageBox.show("Error in getting product sales details",
					"ERROR",
					"Error");
				return;
			});
	}
});