sap.ui.controller("shine.democontent.epm.usercrud.view.usercrud", {

    onInit : function(){
        var oLocalUserData = {
            "FirstName": "",
            "LastName" : "",
            "Email" : "",
            "UserId" : 1
        };
        this.oLocalUserModel = new sap.ui.model.json.JSONModel(oLocalUserData);
        this.getView().setModel(this.oLocalUserModel,"user");
       
        var oLocalUserBatchData = [{
            "FirstName": "",
            "LastName" : "",
            "Email" : "",
            "UserId" : 1
        }];
        this.oBatchModel = new sap.ui.model.json.JSONModel(oLocalUserBatchData);
        this.getView().setModel(this.oBatchModel,"batch");
        
        this.oBatchDialog = null;
        
        var data = { languages: [{
        "name": "German"    
    }]
    };

    var oModel = new sap.ui.model.json.JSONModel(data);
    this.getView().setModel(oModel,"lang");

    //Call the User Service (GET) and populate the table.
    this.loadJobsTable();

    },
    
    onChange: function(evt){
    	var sId = evt.getSource().getId();
    	var sKey = (sId.split("--"))[1];
    	var oMode = this.getView().byId("serviceUrlMode");
         oMode.setSelectedKey(sKey);
    	this.loadJobsTable();
    	var batchBtn = this.getView().byId("batchButton");
    	var batchHelpBtn = this.getView().byId("batchHelpButton");
    	if(sKey === "nodejs"){
         	batchBtn.setVisible(true);
         	batchHelpBtn.setVisible(true);
         	
         }
         else if (sKey === "java")
         {
         	batchBtn.setVisible(false);
         	batchHelpBtn.setVisible(false);
         }
        
        
       
    },


    loadJobsTable: function() {
        var oThis = this;
        var oTable = oThis.byId("userTbl");
        var oMode = oThis.getView().byId("serviceUrlMode");
         var sKey = oMode.getSelectedKey();
         var rest_url;
         if(sKey === "nodejs"){
         	rest_url = "/user/xsodata/user.xsodata/Users";
         	
         }
         else if (sKey === "java")
         {
         	rest_url = "/user/odata/v4/UserData/User";	
         }
         else if(sKey === "")
         {
         rest_url = "/user/xsodata/user.xsodata/Users";
         }
       
        $.ajax({
            type: "GET",
            async: true,
            url: rest_url,
            contentType: "application/json",
            dataType:'json',
            headers: {
                // 'x-csrf-token': 'Fetch',
                'Accept': "application/json"
            },
            success: function(data, textStatus, request) {
                
                var oModelTable = new sap.ui.model.json.JSONModel();
                if(sKey === "nodejs" || sKey === ""){
                	data = data.d.results;
                }else if(sKey === "java"){
                	data = data.value;
                }
                oModelTable.setData({
                    	modelData: data
                });
                oTable.setModel(oModelTable);
                oTable.bindRows("/modelData");
                
            },
            error: function(error){
                sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("TAB_NOT_UPDATED"));
                oTable.bindRows("/");
            }
            
        });
    },

getServiceUrl:function(state){
               //var nodejs = "/sap/hana/democontent/epm/services/user.xsodata";
                var nodejs="/user/xsodata/user.xsodata/Users";
                var java="/user/odata/v4/UserData/User";
                                if(state == "nodejs"){
                                                return nodejs;
                                }
                                else{
                                                return java;
                                }
},

    callUserService: function() {
        
        var oModel = this.getView().getModel();
        var oThis = this;
         var oMode = oThis.getView().byId("serviceUrlMode");
         var sKey = oMode.getSelectedKey();
         var rest_url;
         sKey = "nodejs";
         if(sKey === "nodejs"){
         	rest_url = "/user/xsodata/user.xsodata/Users";
         	
         }
         else if (sKey === "java")
         {
         	rest_url = "/user/odata/v4/UserData/User";	
         }
       // var rest_url=this.getServiceUrl(oMode.getSelectedKey());

        
        var oEntry = this.getView().getModel("user").getData();
        // validate that all fields (FName, LName and EmailId) are populated
        if(oEntry && (!oEntry.FirstName || !oEntry.LastName || !oEntry.Email)){
            sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USER_VALIDATION"));
            return false;
        }
        var xsrf_token;
        $.ajax({
            type: "GET",
            async: false,
            url: rest_url, //"/user/odata/v4/UserData/User",
            contentType: "application/json",
            headers: {
                'x-csrf-token': 'Fetch',
                'Accept': "application/json"
            },
            success: function(data, textStatus, request) {
                xsrf_token = request.getResponseHeader('x-csrf-token');
            },
            error: function(error){
                sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USR_CRT_ERROR"));
            }
        });
        
        var aUrl = '/user/odata/v4/UserData/User';
        jQuery.ajax({
            url: rest_url,//aUrl,
            method: 'POST',
            data: JSON.stringify(oEntry),
            contentType: "application/json",
            headers: {
                'x-csrf-token': xsrf_token,
                 'Accept': "application/json"
            },
            success: function(){
                sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USER_CREATED"));
                oThis.loadJobsTable();
                oThis.resetUserModel();
            },
            error: function(error) {
               sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USR_CRT_ERROR"));
                
            }
        });

    },

    updateService: function(Event) {
        //var oModel = this.byId("userTbl").getModel();


        var oThis = this;
        var oTable = oThis.byId("userTbl");
        // var oMode = oThis.byId("serviceUrlMode");
      
      var oMode = oThis.getView().byId("serviceUrlMode");
         var sKey = oMode.getSelectedKey();
         var rest_url;
	 sKey = "nodejs";
         if(sKey === "nodejs"){
         	rest_url = "/user/xsodata/user.xsodata/Users";
         	
         }
         else if (sKey === "java")
         {
         	rest_url = "/user/odata/v4/UserData/User";	
         }
      
      
      
       // var rest_url=this.getServiceUrl(oMode.getSelectedKey());

        // Get the index of the table.
        var index = Event.getSource().getParent().getIndex();
        var selectedRow = oTable.getRows()[index];
        var cells = selectedRow.getCells();
        
        // construct the object
        var oEntry = {
            "FirstName": cells[1].getValue(),
            "LastName" : cells[2].getValue(),
            "Email" : cells[3].getValue(),
            "UserId" : parseInt(cells[0].getValue())
        };

        var model = oTable.getModel();
        var userId = cells[0].getValue();

        var xsrf_token;
        $.ajax({
            type: "GET",
            async: false,
            url:rest_url,// "/user/odata/v4/UserData/User",
            contentType: "application/json",
            headers: {
                'x-csrf-token': 'Fetch',
                'Accept': "application/json"
            },
            success: function(data, textStatus, request) {
                xsrf_token = request.getResponseHeader('x-csrf-token');
            },
            error: function(error){
                console.log(error);
            }
        });
        var aUrl = rest_url+'('+userId + ')';
        //'/user/odata/v4/UserData/User'+'('+userId + ')';
            jQuery.ajax({
                url: aUrl,
                method: 'PUT',
                async: false,
                data: JSON.stringify(oEntry),
                contentType: "application/json",
                headers: {
                    'x-csrf-token': xsrf_token
                },
                success: function(){
                    //sap.ui.commons.MessageBox.alert(i18n.getProperty("CC_NUMBER_ADDED"));
                    oThis.loadJobsTable();
                },
                error: function(error) {
                    sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USR_UPD_ERROR"));
                    
                }
            });

    },

    onSubmitBatch : function(){
      //create an array of batch changes and save
        var oThis = this;
        var oModel = this.byId("userTbl").getModel();
        var i18n = this.getView().getModel("i18n");
        var batchModel = new sap.ui.model.odata.ODataModel("/user/xsodata/user.xsodata/", true);
        var newUserList = this.getView().getModel("batch").getData();
        var batchChanges = [];
        for (var k = 0; k < newUserList.length; k++) {
            batchChanges.push(batchModel.createBatchOperation("/Users", "POST", newUserList[k]));
        }
        batchModel.addBatchChangeOperations(batchChanges);
        //submit changes and refresh the table and display message  
        batchModel.submitBatch(function(data, response, errorResponse) {
            oModel.refresh();
            //Call the User Service (GET) and populate the table.
            
            if (errorResponse && errorResponse.length > 0) {
                sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USR_CRT_ERROR"));
            } else {
                //alert(i18n.getResourceBundle().getText("USER_CREATED", k));
                sap.m.MessageToast.show(k + " users created");
                oThis.loadJobsTable();
            }
        }, function(data) {
            sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USR_CRT_ERROR"));
        });

        this.oBatchDialog.close();
    },
    
    onDeletePress: function(oEvent) {
        var oThis = this;
        var oTable = oThis.byId("userTbl");
        var model = oTable.getModel();
        var userId = model.getProperty("UserId", oTable.getContextByIndex(oTable.getSelectedIndex()));
	     var oMode = oThis.getView().byId("serviceUrlMode");
         var sKey = oMode.getSelectedKey();
         var rest_url;
	 sKey = "nodejs";
         if(sKey === "nodejs"){
         	rest_url = "/user/xsodata/user.xsodata/Users";
         	
         }
         else if (sKey === "java")
         {
         	rest_url = "/user/odata/v4/UserData/User";	
         }
      

        if (!userId) {
            jQuery.sap.require("sap.ui.commons.MessageBox");
            sap.ui.commons.MessageBox.show(oThis.getView().getModel("i18n").getProperty("SELECT_ROW"), "ERROR", "User CRUD");
        } else {

            var xsrf_token;
            $.ajax({
                type: "GET",
                async: false,
                url: rest_url,//"/user/odata/v4/UserData/User",
                contentType: "application/json",
                headers: {
                    'x-csrf-token': 'Fetch',
                    'Accept': "application/json"
                },
                success: function(data, textStatus, request) {
                    xsrf_token = request.getResponseHeader('x-csrf-token');
                },
                error: function(error){
                    console.log(error);
                }
            });
        
            var aUrl = rest_url+'('+userId + ')';
            //'/user/odata/v4/UserData/User'+'('+userId + ')';
            jQuery.ajax({
                url: aUrl,
                method: 'DELETE',
                contentType: "application/json",
                headers: {
                    'x-csrf-token': xsrf_token
                },
                success: function(){
                    sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USER_DELETED_SUCCESS"));
                    oThis.loadJobsTable();
                },
                error: function(error) {
                    sap.ui.commons.MessageBox.alert(oThis.getView().getModel("i18n").getProperty("USER_DELETE_FAILURE"));
                    //console.log(error);
                }
            });

        }
    },
    
    onFileTypeMissmatch : function(){
        this.oFileUploader.clear();
    },
    
    openBatchDialog : function(){
        if(!this.oBatchDialog){
            this.oBatchDialog = sap.ui.xmlfragment("shine.democontent.epm.usercrud.view.batchDialog",this);
            this.getView().addDependent(this.oBatchDialog);
        }
        this.oBatchDialog.open();
    },
    
    addNewLineItem : function(){
        
        var oLocalUserData = {
            "FirstName": "",
            "LastName" : "",
            "Email" : "",
            "UserId" : 1
        };
        this.getView().getModel("batch").getData().push(oLocalUserData);
        this.getView().getModel("batch").updateBindings("true");
        
    },
    
    openTileDialog : function(oEvent){
        var iData = parseInt(oEvent.getSource().data("tileDialog"));
        var oTileDialog = new sap.account.TileDialog(this,iData);
        this.getView().addDependent(oTileDialog);
        oTileDialog.open(iData);
    },
    
    onBatchDialogClose : function(){
        //reset the model
         this.getView().getModel("batch").setData([{
            "FirstName": "",
            "LastName" : "",
            "Email" : "",
            "UserId" : 1
        }]);
    },
    isDeleteIconVisible : function(oEvent){
        if(oEvent.UserId === "0000000000"){
            return false;
        }
        return true;
    },
    
    onRemoveRow : function(oEvent){
        var regEx = /\d+/;
        var sPath = oEvent.getSource().getBindingContext("batch").getPath();
        var iIndex = sPath.match(regEx);
        var oBatchModel = this.getView().getModel("batch");
        oBatchModel.getData().splice(iIndex,1);
        oBatchModel.updateBindings();
    },
    
    resetUserModel : function(){
         
         var oLocalUserData = {
            "FirstName": "",
            "LastName" : "",
            "Email" : "",
            "UserId" : 1
        };
        this.getView().getModel("user").setData(oLocalUserData);
    },
    
    handlePressHome: function(oEvent) {
        var oShell = this.getView().byId("myShell");
        var bState = oShell.getShowPane();
		oShell.setShowPane(!bState);
    },
  
  onListItemPress : function (oEvent){
    //   var oTileDialog = new sap.account.TileDialog(this,1);
    //   this.getView().addDependent(oTileDialog);
    //   oTileDialog.open(1);
    //   var oBtnOk = sap.ui.getCore().byId("idOkBtn");
    //   oBtnOk.addDelegate({"onpress":function(){
    //     var win = window.open("/sap/hana/democontent/epm/ui/userCRUD/index.html?sap-ui-language=de", '_blank');
    //     win.focus(); 
  
		var oItem = oEvent.getParameters();
		var item = JSON.stringify(oItem);
		var languageId = item.substr(36,1);
				
        var oDialog;
        var btnOk = new sap.m.Button( {
               text : "{i18n>OK}",
               press: function(oEvent){
                  oDialog.close();
               }
            });
        
            var oTextView = new sap.ui.core.HTML({
                content: "{i18n>TRANSLATE_TO_LANG"+languageId+"_LINK}",
                width: "100%"
            });
             var destroyDialog = function(oEvent) {
                oEvent.getSource().destroy();
             };
            oDialog = new sap.m.Dialog({
                title: "{i18n>TRANSLATE_TO_LANG"+languageId+"}",
                content : [ oTextView ],
    			buttons : [ btnOk ],
    			closed: destroyDialog
    		});
    		if(!(oDialog.isOpen())){
    	    	this.getView().addDependent(oDialog);
    		    oDialog.open();
    		}
      }
});
