jQuery.sap.declare("shine.democontent.epm.spatial.Component");

sap.ui.core.UIComponent.extend("shine.democontent.epm.spatial.Component",{
   metadata : {
       name : "SHINE Spatial Demo",
       version : "10",
       includes : ["js/welcome.js"],
       dependencies : {
           libs : ["sap.ui.ux3","sap.ui.commons","sap.ui.table"],
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
       
       return sap.ui.xmlview("main",jQuery.sap.viewName);
       
   }
   
});