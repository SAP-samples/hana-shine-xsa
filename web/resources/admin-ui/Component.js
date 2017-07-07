jQuery.sap.declare("sap.hana.democontent.epm.admin.Component");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");

sap.ui.core.UIComponent.extend("sap.hana.democontent.epm.admin.Component",{
   metadata : {
       name : "SHINE - Data Generator",
       version : "1",
       includes : [],
       dependencies : {
           libs : ["sap.ui.commons", "sap.ui.table","sap.ui.unified"],
           components : []
       },
       
       rootView : "sap.hana.democontent.epm.admin.view.App",
       
       config : {
           resourceBundle : "i18n/messagebundle.hdbtextbundle",
           serviceConfig : {
               name : "Get Size",
               serviceUrl : "/get/tablesize"
           }
       }
   },
   
   	init : function () {
   	    	data = [{
  	        label: oBundle.getText("empty"),
  	        record_count: 10,
  	        table_size: 100
  	    }];
  		var chartModel = new sap.ui.model.json.JSONModel({modelData: data});
  		sap.ui.getCore().setModel(chartModel, "chart"); 
   	    sap.ui.core.UIComponent.prototype.init.apply(this,arguments);
   	    var mConfig = this.getMetadata().getConfig();
   	    var sServiceUrl = mConfig.serviceConfig.serviceUrl;
	    var oConfig = new sap.ui.model.json.JSONModel(sServiceUrl);
	    oConfig.attachRequestCompleted(jQuery.proxy(function(){
	        this.getSessionInfo();
	    }),this);
          sap.ui.getCore().setModel(oConfig, "config");
          this.setModel(oConfig, "config");
          this.mainModelInit(); 
    //Chart model
    		var oRootPath = jQuery.sap.getModulePath("sap.hana.democontent.epm.admin");
  		// set i18n model
  	 var i18nModel = new sap.ui.model.resource.ResourceModel({
           bundleUrl : [oRootPath, mConfig.resourceBundle].join("/")
       });
  		sap.ui.getCore().setModel(i18nModel, "i18n");
  		this.setModel(i18nModel, "i18n");
  		
  		
	},	
	getSessionInfo: function(){
		var aUrl = '/get/sessioninfo';
	    this.onLoadSession(
	    		JSON.parse(jQuery.ajax({
	    		       url: aUrl,
	    		       method: 'GET',
	    		       dataType: 'json',
	    		       async: false}).responseText));
   
	},
	
	onLoadSession: function(myJSON){
            var mConfig = this.getModel("config");
            mConfig.setProperty("/UserName", JSON.parse(decodeURI(myJSON.userEncoded)).id);
	},
	mainModelInit: function(){
		var model = new sap.ui.model.json.JSONModel({});
        model.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);		
        sap.ui.getCore().setModel(model); 
        this.setModel(model);
        model.setProperty("/POVal",0);
        model.setProperty("/SOVal",0);          
        model.setProperty("/times"," * " + numericSimpleFormatter(1000));
        model.setProperty("/listVisible",false);
        model.setProperty("/listDateVisible",false); 
        model.setProperty("/displayValue"," ");    
        model.setProperty("/percentValue",0);        

        //  For Time Based DG
    	var now = new Date();
        var startDate = new Date();
        startDate.setMonth(now.getMonth()-1);
        var todayDate = new Date(); 
        model.setProperty("/startDate",startDate);
        model.setProperty("/endDate",todayDate);        
	}
});
