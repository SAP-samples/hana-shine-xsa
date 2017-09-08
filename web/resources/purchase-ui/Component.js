jQuery.sap.declare("shine.democontent.epm.poworklist.Component");

sap.ui.core.UIComponent.extend("shine.democontent.epm.poworklist.Component",{
   metadata : {
       name : "SHINE - POWorklist",
       version : "10",
       includes : ["js/global.js"],
       dependencies : {
           libs : ["sap.ui.ux3","sap.ui.commons","sap.ui.table"],
           components : []
       },
    
       config : {
           resourceBundle : "i18n/messagebundle.hdbtextbundle",
           serviceConfig : {
               serviceUrl : "/sap/hana/democontent/epm/services/poWorklist.xsodata/"
           }
       }
   },
   
   init : function(){
       
       sap.ui.core.UIComponent.prototype.init.apply(this,arguments);
       
       var mConfig = this.getMetadata().getConfig();
       
       var oRootPath = jQuery.sap.getModulePath("shine.democontent.epm.poworklist");
       
       var i18nModel = new sap.ui.model.resource.ResourceModel({
           bundleUrl : [oRootPath, mConfig.resourceBundle].join("/")
       });
       this.setModel(i18nModel, "i18n");
       
   },
   
   createContent : function(){
       
       return sap.ui.xmlview("idShellView",jQuery.sap.viewName);
       
   }
   
});