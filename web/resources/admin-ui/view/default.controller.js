sap.ui.controller("sap.hana.democontent.epm.admin.view.default", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     */
       onInit: function() {
    	    // attach handlers for validation errors
    	    sap.ui.getCore().attachValidationError(function (evt) {
    	      var control = evt.getParameter("element");
    	      if (control && control.setValueState) {
    	        control.setValueState("Error");
    	      }
    	    });
    	    sap.ui.getCore().attachValidationSuccess(function (evt) {
    	      var control = evt.getParameter("element");
    	      if (control && control.setValueState) {
    	        control.setValueState("None");
    	      }
    	    });  
    	    
            var oVizFrame = this.getView().byId("idVizFrameBar");
	    
    	    // A Dataset defines how the model data is mapped to the chart 
    	    var oDataset = new sap.viz.ui5.data.FlattenedDataset({
    	        dimensions: [{
    	            axis: 1,    	        	
    	            name: oBundle.getText("table"),
    	            value: "{TABLE_SYNONYM}"
   
    	        }],

    	        // it can show multiple measures, each results in a new set of bars in a new color 
    	        measures: [
    	            // measure 1
    	            {
    	                group: 1,
     	                name: oBundle.getText("size"), // 'name' is used as label in the Legend 
    	                value: "{RECORD_COUNT}" // 'value' defines the binding for the displayed value   
    	            }, {
    	                group: 2,    	            	
    	                name: oBundle.getText("size2"), // 'name' is used as label in the Legend 
    	                value: "{TABLE_SIZE}" // 'value' defines the binding for the displayed value   
    	            }
    	        ],

    	        // 'data' is used to bind the whole data collection that is to be displayed in the chart 
    	        data: {
    	            path: "/modelData"
    	        }

    	    });
    	    oVizFrame.setDataset(oDataset);
    	    var data = sap.ui.getCore().getModel("chart").getData();
            oVizFrame.setModel(sap.ui.getCore().getModel("chart"));   
            
            oVizFrame.setTitle(new sap.viz.ui5.types.Title({
                visible: true,
                text: oBundle.getText("bartitle")
            }));
            
            oVizFrame.setPlotArea(new sap.viz.ui5.types.VerticalBar({
            	 dataLabel : {visible : true, formatString : "#,##0"},
                 isFixedDataPointSize : true
            }));
            
            oVizFrame.setYAxis(new sap.viz.ui5.types.Axis({
                label: {
                    formatString: "u"
                }
            }));
            
            oVizFrame.setToolTip(new sap.viz.ui5.types.Tooltip({
                formatString: [
                               [tooltipFormatString]
                           ] // defined in global.js
            }));
       
            
            this.getTableSizes(this);
       },

  
   onHelpOpen: function(){
	   var view = this.getView();
       view._bDialog = sap.ui.xmlfragment(
           "sap.hana.democontent.epm.admin.view.tileDialog", this // associate controller with the fragment
       );
       view._bDialog.addStyleClass("sapUiSizeCompact");
       view.addDependent(this._bDialog);
       view._bDialog.open();	   
 
   },
   
   onDialogCloseButton: function() {
       this.getView()._bDialog.close();
   },
   
   onExecute: function(){
	   // collect input controls
	    var view = this.getView();
	    var inputs = [
	      view.byId("POVal"),
	      view.byId("SOVal")

	    ];

	    // check that inputs are not empty
	    // this does not happen during data binding as this is only triggered by changes
	    jQuery.each(inputs, function (i, input) {
	      if (!input.getValue()) {
	        input.setValueState("Error");
	      }
	    });

	    // check states of inputs
	    var canContinue = true;
	    jQuery.each(inputs, function (i, input) {
	      if ("Error" === input.getValueState()) {
	        canContinue = false;
	        return false;
	      }
	    });

	    // output result
	    if (canContinue) {
         this .executeCall(this );
	    } else {
	      sap.m.MessageBox.alert(oBundle.getText("ValidNumber"));
	    }	   
   },
   
   executeCall: function(oController){
	   //changes to check if DG is being executed by a different user.This would avoid simultaneous updates    		 
       var that = this;
       var xsrf_token;

       var intRegex = /^\d+$/;
       var oModel = sap.ui.getCore().getModel();
       if (oModel.getProperty('cb5') === true) {
           if (parseInt(oModel.getProperty('/POVal')) !== 0 || parseInt(oModel.getProperty('/SOVal')) !== 0) {
                   oModel.setProperty('txtLog',"");
                   phase1 = 0;
                   phase2 = 0;
                   phase3 = 0;
                   phase4 = 0;
                   poLoops = 0;
                   soLoops = 0;
                   totalOrdersCreated = 0;
                   oModel.setProperty('/percentValue',0);
                   oModel.setProperty('/displayValue',"");
                   sap.m.MessageBox.show(oBundle.getText("confirm_delete"),{
                	   icon: sap.m.MessageBox.Icon.QUESTION,
                	   title: oBundle.getText("title_delete"),
                	   actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                	   onClose: function(bResult) {
                           oController.executeConfirm(bResult, oController);
                       }
                	   
                   });

           }

       } else {
           oModel.setProperty('/txtLog',"");
           phase1 = 0;
           phase2 = 0;
           phase3 = 0;
           phase4 = 0;
           poLoops = 0;
           soLoops = 0;
           oModel.setProperty('/percentValue',0);
           oModel.setProperty('/displayValue',"");
           sap.m.MessageBox.show(oBundle.getText("confirm_delete"),{
        	   icon: sap.m.MessageBox.Icon.QUESTION,
        	   title: oBundle.getText("title_delete"),
        	   actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        	   onClose: function(bResult) {
                   oController.executeConfirm(bResult, oController);
               }
        	   
           });           
       }
	   
   },
   
   executeConfirm: function(bResult, oController) {
	   if(bResult==='CANCEL'){return};
       //ajax call to fetch the xsrf token
       additionalSession = false;
       var oModel = sap.ui.getCore().getModel();
       if (bResult) {
           if (oModel.getProperty("/cb1")) {
               var urls = [
                    '/reset/addresses',
                    '/reset/partners',
                    '/reset/employees',
                    '/reset/products',
                    '/reset/constants',
                    '/reset/texts',
                    '/reset/notes',
                    '/reset/attachments'
               ];
               oController.reloadData(urls, oController,"cb1");
                              
           } else if (oModel.getProperty("/cb2")) {              
               var urls = [
                    '/reset/soheader',
                    '/reset/soitem',
                    '/reset/poheader',
                    '/reset/poitem',
               ];
               oController.reloadData(urls, oController,"cb2");
               
           } else if (oModel.getProperty("/cb2a")) {
        	   oModel.setProperty('/percentValue',0);
        	   oModel.setProperty('/displayValue',"");
               var aUrl = 'DataGen.xsjs?cmd=synonym';
               jQuery.ajax({
                   url: aUrl,
                   method: 'GET',
                   dataType: 'text',
                   success: function(myTxt) {
                       oController.onSynonymComplete(myTxt, oController);
                   },
                   error: function(jqXHR, textStatus, errorThrown) {
                       onError(jqXHR.status, oBundle.getText("cb2a"));
                   },
                   async: true
               });
           } else if (oModel.getProperty("/cb3")) {
        	   oModel.setProperty('/percentValue',0);
        	   oModel.setProperty('/displayValue',"");
               var aUrl = 'DataGen.xsjs?cmd=resetSequence&object=';
               var tableArray = ["addressSeqId",
                   "employeeSeqId", "partnerSeqId",
                   "purchaseOrderSeqId", "salesOrderId",
                   "textSeqId"
               ];
               for (var i = 0; i < tableArray.length; i++) {
                   jQuery.ajax({
                       url: aUrl + tableArray[i],
                       method: 'GET',
                       dataType: 'text',
                       success: function(myTxt) {
                           oController.onResequenceComplete(myTxt, oController, 
                                    tableArray[i], (i >= (tableArray.length - 1)));
                       },
                       error: function(jqXHR, textStatus, errorThrown) {
                            onError(jqXHR.status, oBundle.getText("cb3"));
                       },
                       async: false
                   });
               }
           } else if (oModel.getProperty("/cb4")) {
        	    var oModel = sap.ui.getCore().getModel();
                oModel.setProperty('/percentValue', 0);
                oModel.setProperty('/displayValue', "");
                oModel.setProperty('/txtLog', ""); 
                soLoops = 0;
                poLoops = 0;
                soRequired = parseInt(oModel.getProperty('/SOVal'), 10);;
                poRequired = parseInt(oModel.getProperty('/POVal'), 10);;
                for (var i = 0; i < soRequired; i++) {
                    jQuery.ajax({
                        url: '/replicate/sales',
                        method: 'GET',
                        dataType: 'json',
                        success: function (myTxt) {
                            oModel.setProperty('/txtLog', myTxt.message 
                                    + "\n" + oModel.getProperty('/txtLog')); 
                            soLoops++;
                            oModel.setProperty('/percentValue', 
                                    Math.round((soLoops + poLoops)
                                                / (soRequired + poRequired) * 100));
                            oModel.setProperty('/displayValue', 
                                    oBundle.getText("generatedPG", 
                                    [
                                        (soLoops + poLoops) * 1000, 
                                        (soRequired + poRequired) * 1000
                                    ]
                                    ));
                            if ((soLoops + poLoops) >= (soRequired + poRequired)) {
                                oController.getTableSizes();
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            onError(jqXHR.status, oBundle.getText("cb4"));
                            i = soRequired+1;
                        },
                        async: false
                    });
                }
                for (var j = 0; j < poRequired; j++) {
                    jQuery.ajax({
                        url: '/replicate/purchase',
                        method: 'GET',
                        dataType: 'json',
                        success: function (myTxt) {
                            oModel.setProperty('/txtLog', myTxt.message 
                                    + "\n" + oModel.getProperty('/txtLog')); 
                            soLoops++;
                            oModel.setProperty('/percentValue', 
                                    Math.round((soLoops + poLoops)
                                                / (soRequired + poRequired) * 100));
                            oModel.setProperty('/displayValue', 
                                    oBundle.getText("generatedPG", 
                                    [
                                        (soLoops + poLoops) * 1000, 
                                        (soRequired + poRequired) * 1000
                                    ]
                                    ));
                            if ((soLoops + poLoops) >= (soRequired + poRequired)) {
                                oController.getTableSizes();
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            onError(jqXHR.status, oBundle.getText("cb4"));
                            j = poRequired +1;
                        },
                        async: false
                    });
                }
           }
           // checkbox for time based data generator
           else if (oModel.getProperty("/cb5")) {
               totalOrdersCreated = 0;
               soLoops = 0;
               poLoops = 0;
        	   oModel.setProperty('/percentValue',0);
        	   oModel.setProperty('/displayValue',"");
        	   var oModel = sap.ui.getCore().getModel();
               soLoops = parseInt(oModel.getProperty('/SOVal'), 10);
               poLoops = parseInt(oModel.getProperty('/POVal'), 10);
               if (parseInt(oModel.getProperty('/POVal')) !== 0) {
                   oController.triggerReplicateTimeBasedPO(oController);
               } else
               if (parseInt(oModel.getProperty('/SOVal')) !== 0) {
                   oController.triggerReplicateTimeBasedSO(oController);
               }
           }
       }
   },
   
   reloadData: function(urls, oController,msg){
        var oModel = sap.ui.getCore().getModel();
        oModel.setProperty('/percentValue', 0);
        oModel.setProperty('/displayValue', "");
        oModel.setProperty('/txtLog', ""); 
        resetCount = 0;
        resetMax = urls.length;
        for (var i = 0; i < urls.length; i++) {
           jQuery.ajax({
               url: urls[i],
               method: 'GET',
               dataType: 'json',
               success: function (myTxt) {
                   oModel.setProperty('/txtLog', myTxt.message 
                            + "\n" + oModel.getProperty('/txtLog')); 
                   resetCount++;
                   oModel.setProperty('/percentValue', 
                            Math.round(resetCount / resetMax * 100));
                   oModel.setProperty('/displayValue', 
                            oBundle.getText("reloadedPG", [resetCount, resetMax]));
                   if (resetCount >= resetMax) {
                       oController.getTableSizes();
                   }
               },
               error: function(jqXHR, textStatus, errorThrown) {
                   onError(jqXHR.status, oBundle.getText(msg));
               },
               async: false
           });
        }
   },
   
   updateReplicateProgress: function() {
       var oModel = sap.ui.getCore().getModel();
       var totalPO = parseInt(oModel.getProperty('/POVal'), 10);
       var totalSO = parseInt(oModel.getProperty('/SOVal'), 10);
       oModel.setProperty('/percentValue',Math.round((poLoops + soLoops) / (totalPO + totalSO) * 100));
       oModel.setProperty('/displayValue',oBundle.getText("generatedPG", [
           numericSimpleFormatter((poLoops + soLoops) * 1000),
           numericSimpleFormatter((totalPO + totalSO) * 1000)
       ]));
   },
  
   updateReplicateTimeBasedProgress: function() {
	   var oModel = sap.ui.getCore().getModel();	   
	   oModel.setProperty('/percentValue', (totalOrdersCreated / (soLoops + poLoops)) * 100);
	   oModel.setProperty('/displayValue',oBundle.getText("generatedTimeBased", [
           numericSimpleFormatter(totalOrdersCreated * 1000)
       ]));
   },
   
   triggerReplicatePO: function(oController) {
       if (additionalSession) 
        return;
       poLoops++;
       oController.updateReplicateProgress();
       var aUrl = 'DataGen.xsjs?cmd=replicatePO&dummy=' + oController.getUniqueTime().toString();
       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'text',
           success: function(myTxt) {
               oController.onPOComplete(myTxt, oController);
           },
           error: function(jqXHR, textStatus, errorThrown) {
                   onError(jqXHR.status, oBundle.getText("purchase_order"));
           },
           async: true
       });
   },
   triggerReplicateSO: function(oController) {
       if (additionalSession) 
        return;
       soLoops++;
       oController.updateReplicateProgress();
       var aUrl = 'DataGen.xsjs?cmd=replicateSO&dummy=' + oController.getUniqueTime().toString();
       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'text',
           success: function(myTxt) {
               oController.onSOComplete(myTxt, oController);
           },
           error: function(jqXHR, textStatus, errorThrown) {
               onError(jqXHR.status, oBundle.getText("sales_order"));
           },
           async: true
       });
   },
   // For time based data generation
   triggerReplicateTimeBasedPO: function(oController) {
       if (additionalSession) 
        return;
	   var oModel = sap.ui.getCore().getModel();
       poLoops = parseInt(oModel.getProperty('/POVal'), 10);
       var aUrl = 'DataGen.xsjs?cmd=replicateTimeBasedPO&startdate=' + oModel.getProperty('/startDate').toDateString() + '&enddate=' + oModel.getProperty("/endDate").toDateString() + '&noRec=' + oModel.getProperty('/POVal') + '&dummy=' + oController.getUniqueTime().toString();
       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'text',
           success: function(myTxt) {
               oController.onTimeBasedRequestComplete(myTxt, oController);
               if (parseInt(oModel.getProperty('/SOVal')) !== 0) {
                   oController.triggerReplicateTimeBasedSO(oController);
               }
           },
           error: function(jqXHR, textStatus, errorThrown) {
                onError(jqXHR.status, oBundle.getText("purchase_order"));
           },
           async: true
       });
   }, 
   triggerReplicateTimeBasedSO: function(oController) {
       if (additionalSession) 
        return;
	   var oModel = sap.ui.getCore().getModel();
       soLoops = parseInt(oModel.getProperty('/SOVal'), 10);
       var aUrl = 'DataGen.xsjs?cmd=replicateTimeBasedSO&startdate=' + oModel.getProperty('/startDate').toDateString() + '&enddate=' + oModel.getProperty("/endDate").toDateString() + '&noRec=' + oModel.getProperty('/SOVal') + '&dummy=' + oController.getUniqueTime().toString();
       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'text',
           success: function(myTxt) {
               oController.onTimeBasedRequestComplete(myTxt, oController);
           },
           error: function(jqXHR, textStatus, errorThrown) {
               onError(jqXHR.status, oBundle.getText("sales_order"));
           },
           async: true
       });
   },  

   toggleGenerate: function(selected, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty("/POVal",0);
       oModel.setProperty("/SOVal",0);
       oModel.setProperty("/listVisible",selected);

   },   
   
   toggleDateGenerateFalse: function(){
	  this.toggleDateGenerate(false,this);
   },
   toggleDateGenerateExt: function(){
	   this.toggleDateGenerate(false,this );
	  this.toggleGenerate(true,this);	   
   },   
   toggleDateGenerateExt2: function(){
	 this.toggleGenerate(false,this);
	 this.toggleDateGenerate(true,this);	   
   },   
   // For time based data generation
   toggleDateGenerate: function(selected, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty("/listVisible",selected);
       oModel.setProperty("/listDateVisible",selected);        
       if (selected) {
    	   var now = new Date();
           var startDate = new Date();
           startDate.setMonth(now.getMonth()-1);
           var todayDate = new Date(); 
           oModel.setProperty("/startDate",startDate);
           oModel.setProperty("/endDate",todayDate);   
       }
   },
   
   onReseedComplete: function(myTxt, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));
       phase1 = 7;
       oModel.setProperty('/percentValue', Math.round(phase1 / 7 * 100));
       oModel.setProperty('/displayValue', oBundle.getText("reloadedPG", [phase1.toString(), 7]));
   },
   

   onReseedComplete2: function(myTxt, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));      
       phase2 = 4;
       oModel.setProperty('/percentValue', Math.round(phase2 / 4 * 100));
       oModel.setProperty('/displayValue', oBundle.getText("reloadedPG", [phase2.toString(), 4]));
       oController.getTableSizes();
   },

   onSynonymComplete: function(myTxt, oController) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog')); 
       oModel.setProperty('/percentValue',100);
       oModel.setProperty('/displayValue','100%');

   },
   onResequenceComplete: function(myTxt, oController, oObject, lastSequence) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));
       phase3++;
       oModel.setProperty('/percentValue', Math.round(phase3 / 6 * 100));
       oModel.setProperty('/displayValue', oBundle.getText("reloadedPG", [phase3.toString(), 6]));
       if (lastSequence) {
         oController.getTableSizes();
       }
   },

   onPOComplete: function(myTxt, oController, i) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));	   
       if (poLoops >= parseInt(oModel.getProperty('/POVal'), 10)) {
            if (soLoops >= parseInt(oModel.getProperty('/SOVal'), 10)) {
               oController.getTableSizes();
            }
            if (parseInt(oModel.getProperty('/SOVal')) !== 0) {
               oController.triggerReplicateSO(oController);
            }
       } else {
           oController.triggerReplicatePO(oController);
       }
   },
   onTimeBasedRequestComplete: function(myTxt, oController) {
       var resp = JSON.parse(myTxt);
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog', resp.message + oModel.getProperty('/txtLog'));	   
       totalOrdersCreated += resp.numberOfRecords / 1000;
       oController.updateReplicateTimeBasedProgress();

       if (totalOrdersCreated == (poLoops + soLoops)) {
           oController.getTableSizes();
       } 
   },
   onSOComplete: function(myTxt, oController, i) {
	   var oModel = sap.ui.getCore().getModel();
       oModel.setProperty('/txtLog',myTxt + oModel.getProperty('/txtLog'));	   
       
       if (soLoops >= parseInt(oModel.getProperty('/SOVal'), 10)) {
           if (poLoops >= parseInt(oModel.getProperty('/POVal'), 10)) {
                oController.getTableSizes();
           }
       } else {
           oController.triggerReplicateSO(oController);
       }
   },
   getUniqueTime: function() {
       var time = new Date().getTime();
       while (time == new Date().getTime())
       ;
       return new Date().getTime();
   },
   
   handleDateChange: function(evt){
	// collect input controls
	   var from = evt.getParameter('from');
	   var to = evt.getParameter('to');
	   var valid = evt.getParameter('valid');
	   var view = this.getView();
 	    
   },
   
   
   getTableSizes: function(oController) {
       var aUrl = '/get/tablesize';

       jQuery.ajax({
           url: aUrl,
           method: 'GET',
           dataType: 'json',
           success: onLoadSizes,
           error: function(jqXHR, textStatus, errorThrown) {
                onError(jqXHR.status, oBundle.getText("table_size"));
           }
       });
   },

   

});

function onLoadSizes(myJSON) {

    
    var oBarModel = sap.ui.getCore().getModel("chart");
    oBarModel.setData({
        modelData: myJSON
    });
    oBarModel.refresh();
}

