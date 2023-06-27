sap.ui.controller("shine.democontent.epm.spatial.view.bpDetails", {

	// instantiated view will be added to the oViewCache object and retrieved from there
	oViewCache: {},

	onInit: function() {

	},

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf shine_so.main
	 */
	onBeforeRendering: function() {

	},

	bpWebPress: function(oEvent) {
		sap.m.URLHelper.redirect(this.getView().byId(oEvent.getParameter("id")).getText(), true);
	},

	onAfterRendering: function() {
		var view = this.getView();
		var addresses = [],
			labels = [],
			bps = [];

		// Obtain the default map types from the platform object:
		var defaultLayers = sap.app.platform.createDefaultLayers();

		// Instantiate (and display) a map object:
		var map = new H.Map(
			document.getElementById("bpDetails--splitter0_firstPane"),
			defaultLayers.vector.normal.map, {
				zoom: 2,
				center: {
					lat: 0.0,
					lng: 0.0
				}
			});

		// MapEvents enables the event system
		// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
		var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

		// Create the default UI:
		var ui = H.ui.UI.createDefault(map, defaultLayers);

		var clusteringProviderTemp = new H.clustering.Provider([], {
			clusteringOptions: {
				minWeight: 1,
				eps: 32
			}
		});

		//for distance calculation
		var lati, longi;

		function locationFound(p) {
			lati = p.coords.latitude;
			longi = p.coords.longitude;
		}

		function locationNotFound(err) {
			jQuery.sap.require("sap.ui.commons.MessageBox");
			sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("REVEAL_COORDINATES"),
				sap.ui.commons.MessageBox.Icon.INFORMATION,
				sap.app.i18n.getText("LOCREQUIRED"));
		}

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(locationFound, locationNotFound);
		} else {
			locationNotFound();
		}

		/*
		 * Function to be called on marker click.
		 */
		function onMarkerSelected(label, selectedBP, marker) {
			var bubble = new H.ui.InfoBubble(marker.getPosition(), {
				// read custom data
				content: label
			});
			// show info bubble
			ui.addBubble(bubble);

			// infoBubbles.openBubble(label, marker.coordinate);
			(view.byId("bpHeader")).setTitle(selectedBP.Name);
			(view.byId("bpId")).setText(selectedBP.ID);
			(view.byId("bpEmail")).setText(selectedBP.Email);
			(view.byId("bpPhone")).setText(selectedBP.Phone);
			(view.byId("bpWeb")).setText(selectedBP.Web);

			(view.byId("bpBuildingItem")).setValue(selectedBP.Building);
			(view.byId("bpStreetItem")).setValue(selectedBP.Street);
			(view.byId("bpCityItem")).setValue(selectedBP.City);
			(view.byId("bpCountryItem")).setValue(selectedBP.Country);
			(view.byId("bpZipItem")).setValue(selectedBP.Zip);

			// send event for bp transaction details display
			$.ajax({
				type: "GET",
				async: false,
				url: "/sap/hana/democontent/epm/spatial/services/getBPTransactionData.xsjs?cmd=getData&bpId=" + selectedBP.ID + "&lat=" +
					selectedBP.lat + "&long=" + selectedBP.long + "&userlat=" + lati + "&userlong=" + longi,
				success: function(data) {
					var sales;
					var oModel = new sap.ui.model.json.JSONModel({});
					if (!data.salesTotal) {
						sales = 0;
					} else {
						sales = data.salesTotal;
						// add sales chart
						oModel.setData(data);
					}

					(view.byId("oSalesChart")).setModel(oModel);
					(view.byId("oSalesChart")).bindRows("/salesYoY");
					oModel.refresh();

					(view.byId("bpHeader")).setNumber(sales);
					(view.byId("bpHeader")).setNumberUnit(data.currency);
					//for distance calculation

					(view.byId("bpDistanceItem")).setValue(data.distance / 1000);
				},
				error: function(err) {
					sap.ui.commons.MessageBox.show("Error in getting Business Partner details",
						"ERROR",
						"Error");
					return;
				}
			});
		}

		// Custom clustering theme description object.
		// Object should implement H.clustering.ITheme interface
		var CUSTOM_THEME = {
			getClusterPresentation: function(cluster) {
				return clusteringProviderTemp.getTheme().getClusterPresentation(cluster);
			},
			getNoisePresentation: function(noisePoint) {
				// Get a reference to data object our noise points
				var data = noisePoint.getData(),
					// Create a marker for the noisePoint
					noiseMarker = new H.map.Marker(noisePoint.getPosition(), {
						// Use min zoom from a noise point
						// to show it correctly at certain zoom levels:
						min: noisePoint.getMinZoom()
					});

				// Link a data from the point to the marker
				// to make it accessible inside onMarkerClick
				noiseMarker.setData(data);

				// Show a bubble on marker click/tap
				noiseMarker.addEventListener("tap", function() {
					onMarkerSelected(data.$label, data, noisePoint);
				});

				return noiseMarker;
			}
		};

		$.ajax({
			type: "GET",
			async: false,
			url: "/sap/hana/democontent/epm/spatial/services/getAllBusinessPartnersData.xsjs",
			success: function(data) {
				bps = data.entry;
				for (var i = 0; i < data.entry.length; i++) {
					labels[i] = data.entry[i].Name;
					addresses[i] = data.entry[i].Building + ' ' + data.entry[i].Street + ', ' + data.entry[i].Zip + ' ' + data.entry[i].City + ', ' +
						data.entry[i].Country;
				}

				// Create a clustering provider with a custom theme
				var clusteredDataProvider = new H.clustering.Provider([], {
					clusteringOptions: {
						// Maximum radius of the neighborhood
						eps: 64,
						// minimum weight of points required to form a cluster
						minWeight: 3
					},
					theme: CUSTOM_THEME
				});

				for (var z = 0; z < bps.length; z++) {
					var cood = new H.clustering.DataPoint(parseFloat(bps[z].lat),
						parseFloat(bps[z].long), 1, bps[z]);

					/* We store the address from the location and name of the
					 * Place object in the dataPoint so we can pass the
					 * information to the marker in cluster theme.
					 */
					bps[z].$address = addresses[z];
					bps[z].$label = bps[z].Name;
					clusteredDataProvider.addDataPoint(cood);
				}

				// Create a layer that will consume objects from our clustering provider
				var layer = new H.map.layer.ObjectLayer(clusteredDataProvider);

				// To make objects from clustering provider visible,
				// we need to add our layer to the map
				map.addLayer(layer);

				// show the map and ask user to select a BP
				jQuery.sap.require("sap.ui.commons.MessageBox");
				sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("SELECT_BP"),
					sap.ui.commons.MessageBox.Icon.INFORMATION,
					sap.app.i18n.getText("TITLE"));

			},
			error: function(err) {
				sap.ui.commons.MessageBox.show("Error in getting Business Partner details",
					"ERROR",
					"Error");
				return;
			}
		});

	}

});