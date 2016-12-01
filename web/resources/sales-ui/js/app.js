jQuery.sap.registerModulePath('app', 'js');

jQuery.sap.require("app.tileDialog");

sap.app = {};

// Internationalization:
// create global i18n resource bundle for texts in application UI
jQuery.sap.require("jquery.sap.resources");

var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
sap.app.i18n = jQuery.sap.resources({url : "i18n/messagebundle.hdbtextbundle", locale: sLocale});

var tooltipFormatString = '';

if (sLocale.indexOf("de") > -1) {
    tooltipFormatString = '#.###.###.###,00'; 
} else {
    tooltipFormatString = '#,###,###,###.00'; 
}

// instantiate initial view with a shell
sap.ui.localResources("sales-dashboard");
var oMainView = sap.ui.view({
	id : "main-shell",
	viewName : "sales-dashboard.main",
	type : sap.ui.core.mvc.ViewType.JS
});

oMainView.placeAt("content");