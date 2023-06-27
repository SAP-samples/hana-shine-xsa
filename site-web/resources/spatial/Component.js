jQuery.sap.declare("shine.democontent.epm.spatial.Component");
jQuery.sap.registerResourcePath("mapsjscorejs", "https://js.api.here.com/v3/3.1/mapsjs-core");
jQuery.sap.require("mapsjscorejs");
jQuery.sap.registerResourcePath("mapsjsservicejs", "https://js.api.here.com/v3/3.1/mapsjs-service");
jQuery.sap.require("mapsjsservicejs");
jQuery.sap.registerResourcePath("mapsjsuijs", "https://js.api.here.com/v3/3.1/mapsjs-ui");
jQuery.sap.require("mapsjsuijs");
jQuery.sap.registerResourcePath("mapsjsmapeventsjs", "https://js.api.here.com/v3/3.1/mapsjs-mapevents");
jQuery.sap.require("mapsjsmapeventsjs");
jQuery.sap.registerResourcePath("mapsjsdatajs", "https://js.api.here.com/v3/3.1/mapsjs-data");
jQuery.sap.require("mapsjsdatajs");
jQuery.sap.registerResourcePath("mapsjsclusteringjs", "https://js.api.here.com/v3/3.1/mapsjs-clustering");
jQuery.sap.require("mapsjsclusteringjs");
jQuery.sap.includeStyleSheet("https://js.api.here.com/v3/3.1/mapsjs-ui.css");
sap.ui.core.UIComponent.extend("shine.democontent.epm.spatial.Component",{
   metadata : {
       name : "SHINE Spatial Demo",
       version : "10",
       includes : ["js/welcome.js"],
       dependencies : {
           libs : ["sap.ui.ux3","sap.ui.commons","sap.ui.table","sap.m", "sap.makit"],
           components : []
       },
    
       config : {
           resourceBundle : "i18n/messagebundle.hdbtextbundle"
           //serviceConfig : {
           //    serviceUrl : "/sap/hana/democontent/epm/services/poWorklist.xsodata/"
           //}
       }
   },
   
   init : function(){
	sap.app = {};
	sap.isSingle = false;
       
       sap.ui.core.UIComponent.prototype.init.apply(this,arguments);
       
       var mConfig = this.getMetadata().getConfig();
       
       var oRootPath = jQuery.sap.getModulePath("shine.democontent.epm.spatial");
        var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
        sap.app.i18n = jQuery.sap.resources({url : "./i18n/messagebundle.hdbtextbundle", locale: sLocale});
       var i18nModel = new sap.ui.model.resource.ResourceModel({
           bundleUrl : [oRootPath, mConfig.resourceBundle].join("/")
       });
       this.setModel(i18nModel, "i18n");  
   },
   
   createContent : function(){
       
       return sap.ui.xmlview("main","shine.democontent.epm.spatial.view.main");
       
   }
   
});