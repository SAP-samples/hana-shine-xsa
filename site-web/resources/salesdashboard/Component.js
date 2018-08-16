jQuery.sap.require("jquery.sap.resources");
jQuery.sap.declare("sap.hana.democontent.epm.salesdashboard.Component");

sap.ui.core.UIComponent.extend("sap.hana.democontent.epm.salesdashboard.Component",{
   metadata : {
       name : "SHINE - Sales Dashboard",
       version : "1.0",
       includes : [],
       dependencies : {
           libs : ["sap.ui.commons", "sap.ui.table","sap.ui.unified","sap.ui.ux3"],
           components : []
       },
       
       rootView : "sap.hana.democontent.epm.salesdashboard.view.main",
       
       config : {
           resourceBundle : "i18n/messagebundle.hdbtextbundle"
       }
   },
   
   init : function() {
       sap.isSingle = false;
       sap.app = {};
       sap.ui.core.UIComponent.prototype.init.apply(this,arguments);
       
       var mConfig = this.getMetadata().getConfig();
       
       var oRootPath = jQuery.sap.getModulePath("sap.hana.democontent.epm.salesdashboard");
       
        // jQuery.sap.require("app.tileDialog");
        
        // Internationalization:
        // create global i18n resource bundle for texts in application UI
        jQuery.sap.require("jquery.sap.resources");
        
        var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
        sap.app.i18n = jQuery.sap.resources({url : "/resources/salesdashboard/i18n/messagebundle.hdbtextbundle", locale: sLocale});
        
        var i18nModel = new sap.ui.model.resource.ResourceModel({
           bundleUrl : [oRootPath, mConfig.resourceBundle].join("/")
        });
        this.setModel(i18nModel, "i18n");
        
        var tooltipFormatString = '';
        
        
        /** initialize tile dialog */
        jQuery.sap.registerModulePath('app', '/sap/hana/democontent/epm/salesdashboard/js');
        jQuery.sap.require("sap.hana.democontent.epm.salesdashboard.js.tileDialog");
   }
});
