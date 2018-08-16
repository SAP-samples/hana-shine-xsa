jQuery.sap.declare("sap.account.CheckDialog");

sap.account.CheckDialog = function(oFrameController) {
    this.controller = oFrameController;
};

sap.account.CheckDialog.prototype.open = function() {
	var doShineAdminRoleExist = false;
	var doJobSchedulerRoleExist = false;
	var doRoleCollectionExist = false;
	var ifShineAdminRoleFailed = false;
	var ifSuccess=false;
	var roleTemplates;
	var applications;
    var oContent = new sap.ui.commons.layout.VerticalLayout({
        height: "100%",
        width: "100%"
    });

    var oContentMatrix = new sap.ui.commons.layout.MatrixLayout({
        layoutFixed: false,
        columns: 2,
        width: '100%',
        height: '100%',
        widths: ['50%', '50%']
    });

    // title
    oContentMatrix.addRow(createHeaderRow());

    // vspace
    oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
        height: '20px'
    }));

    // prompt to help document
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
        width: '100%',
        colSpan: 2
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("PRE_PROMPT"),
        design: sap.ui.commons.TextViewDesign.H3,
        width: '100%',
        textAlign: sap.ui.core.TextAlign.Center,
    });
    oCell.addContent(oTextView);
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    // vspace
    oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
        height: '10px'
    }));

    // add the button to launch help guide pdf
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Center,
        width: '100%',
        colSpan: 2
    });

    var oLinkButton = new sap.ui.commons.Button({
        text: sap.app.i18n.getText("LINK_PROMPT"),
        style: sap.ui.commons.ButtonStyle.Accept,
        press: function() {
            window.open(sap.app.i18n.getText("PDF_LINK"));
        }
    });

   // oCell.addContent(oLinkButton);
   // oRow.addCell(oCell);
   // oContentMatrix.addRow(oRow);

    // vspace
    oContentMatrix.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
        height: '10px'
    }));

    oContentMatrix.addRow(createDividerRow());

    var destroyDialog = function(oEvent) {
        oEvent.getSource().destroy();
    };

    // initialize dialog 
    var oCheckDialog = new sap.ui.commons.Dialog({
        modal: true,
        // a percentage width does result in an ugly vertical slider in Chrome
        width: '600px',
        content: oContent,
        closed: destroyDialog
    });


    // role collections present
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    // role collections present present prerequisite title
    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("ROLE_COLLECTION"),
        design: sap.ui.commons.TextViewDesign.H3,
        textAlign: sap.ui.core.TextAlign.Left,
    });
    
    oTextView.addStyleClass('dialogTextColor');
 
    oCell.addContent(oTextView);
   

    // Synonyms present prerequisite status	
    oCellStatus = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Right,
    });
    oCheckDialog.roleCollectionLayout = new sap.ui.layout.HorizontalLayout({
        content: [new sap.m.BusyIndicator({
            size: "1.4em"
        })]
    });
    oCellStatus.addContent(oCheckDialog.roleCollectionLayout);
    oRow.addCell(oCell);
    oRow.addCell(oCellStatus);

    oContentMatrix.addRow(oRow);

    // add Synonyms Info
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
        width: '100%',
        colSpan: 2
    });
    oTextView = new sap.ui.core.HTML({
        content: sap.app.i18n.getText("ROLE_COLLECTION_INFO"),
        width: '100%'
    });
  
    oCell.addContent(oTextView);
   
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);

    // add button to create synonyms
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Right,
        width: '100%',
        colSpan: 2
    });

    oCheckDialog.roleCollectionBtn = new sap.ui.commons.Button({
        text: sap.app.i18n.getText("CREATE_ROLE_COLLECTION"),
        enabled: false,
        press: function() {
        	var csrftoken;
            $.ajax({ 
                         type: 'get', 
                         url: "/sap/rest/authorization/rolecollections/" + "XS_AUTHORIZATION_ADMIN", 
                         headers: { 
                             "X-CSRF-Token": "Fetch",
                             'Accept': "application/json",
							 'Content-Type': "application/json"
                         }, 
                         async: false, 
                         success: function(res, status, xhr) { 
                             csrftoken = xhr.getResponseHeader('x-csrf-token'); 
                         }, 
                         error: function(error) { 
                           sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("ERROR_CSRFTOKEN"));
                         } 
                     }); 
            var jobrole = {roleTemplateAppId: "jobscheduler", roleTemplateName: "jobscheduler_administration_template", name: "jobscheduler_administration_template"};
            
            var ifRoleCollectionFailed = false;
            var ifJobSchedulerRoleFailed = false;
            
			//create role collection starts..
            if(!doRoleCollectionExist){
				$.ajax({
					type: 'POST',
					url: "/sap/rest/authorization/rolecollections/" + "SHINE_ADMIN" + "?description=" +"shine admin",
					async: false,
					headers: {
						'x-csrf-token': csrftoken,
						'Accept': "application/json",
						'Content-Type': "application/json"
					},
					success: function(res, status, xhr) {
						ifSuccess = true;
					},
					error: function(error) {
						ifSuccess=false;
						ifRoleCollectionFailed = true;
					}
				});
            }
            //create role collection ends....
            //delete existing applications(shine-admin*) roles and create a new ones....
            if(!doShineAdminRoleExist){
            		if(applications != undefined){
							if(applications.length!=undefined && applications.length>0){
								var applicationFound = false;
								for(var i=0;i<applications.length;i++){
									if((applications[i].appid).indexOf("shine!")>-1){
										applicationFound = true;
										var role = {roleTemplateAppId: applications[i].appid, roleTemplateName: "shine_admin", name: "shine_admin"};
										if(roleTemplates != undefined){
											if(roleTemplates.length!=undefined && roleTemplates.length>0){
												var appidPresent = false;
												for(var j=0;j<roleTemplates.length;j++){
													if(roleTemplates[j].roleTemplateAppId === applications[j].appid){
														appidPresent = true;
													}
												}
												if(!appidPresent){
													//create roles for this app
													createShineAdminRole(role, csrftoken);
												}
											}
											else{
												if(!ifShineAdminRoleFailed){
													//create roles for this app
													createShineAdminRole(role,csrftoken);
												}
											}
										}else{
											if(!ifShineAdminRoleFailed){
													//create roles for this app
													createShineAdminRole(role,csrftoken);
												}
										}
									}
								}
								if(!applicationFound){
									sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("ERROR_CSRFTOKEN"));
									ifShineAdminRoleFailed = true;
									ifSuccess = false;
								}
							}
						}
            }
            
     
            
            if(ifSuccess){
				sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("SUCCESS_ROLECOLLECTION"), logoutMethod);
				
			}
			else{
				if(ifRoleCollectionFailed){
					sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("ERROR_ROLECOLLECTION"));
				}
				if(ifShineAdminRoleFailed){
					sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("ERROR_ROLECREATION"));
				}
				
			}

			oCheckDialog.roleCollectionBtn.setEnabled(false);
			
            // re-trigger the check
            setTimeout(checkPre, 1000);
        }
    });
    
   
    oCell.addContent(oCheckDialog.roleCollectionBtn);
    
    
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);


 
      oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    // role collections present present prerequisite title
    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
    });
    oTextView = new sap.ui.commons.TextView({
        text: sap.app.i18n.getText("GENERATE_TIME_DATA"),
        design: sap.ui.commons.TextViewDesign.H3,
        textAlign: sap.ui.core.TextAlign.Left,
    });
    
    oTextView.addStyleClass('dialogTextColor');
 
    oCell.addContent(oTextView);
   

    
    oCellStatus = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Right,
    });
    oCheckDialog.timeDataLayout = new sap.ui.layout.HorizontalLayout({
        content: [new sap.m.BusyIndicator({
            size: "1.4em"
        })]
    });
    oCellStatus.addContent(oCheckDialog.timeDataLayout);
    oRow.addCell(oCell);
    oRow.addCell(oCellStatus);

    oContentMatrix.addRow(oRow);
    
      // add time data info Info
    oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Left,
        width: '100%',
        colSpan: 2
    });
    oTextView = new sap.ui.core.HTML({
        content: sap.app.i18n.getText("TIME_INFO"),
        width: '100%'
    });
  
    oCell.addContent(oTextView);
   
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);
    //coide
    
     oRow = new sap.ui.commons.layout.MatrixLayoutRow();

    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
        hAlign: sap.ui.commons.layout.HAlign.Right,
        width: '100%',
        colSpan: 2
    });

 var ifTimeDataSuccess = false; 	
 
  


    oCheckDialog.generateTimeDataBtn = new sap.ui.commons.Button({
        text: sap.app.i18n.getText("GENERATE_TIME_DATA"),
        enabled: false,
        press: function() {
        	var csrftoken;
            $.ajax({ 
                         type: 'GET', 
                         url: "/sap/hana/democontent/epm/services/generateTimeData.xsjs", 
                         headers: { 
                             	'x-csrf-token': csrftoken
					
                         }, 
                         async: false, 
                         	success: function(myTxt) {
                         		ifTimeDataSuccess = true;
                         			oCheckDialog.timeDataLayout.removeAllContent();
                         		oCheckDialog.generateTimeDataBtn.setEnabled(false);
                         		oCheckDialog.timeDataLayout.addContent(new sap.ui.commons.Image({
                        src: './images/green_tick.png'}));
					 sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("TIME_DATA_SUCCESS"));
				},
                         error: function(error) { 
                           sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("TIME_DATA_FAILURE"));
                         } 
                     }); 
}
}); 
oCheckDialog.generateTimeDataBtn.setEnabled(true);

$.ajax({ 
                         type: 'GET', 
                         url: "/sap/hana/democontent/epm/services/checkTimeData.xsjs", 
                         async: false, 
                         	success: function(myTxt) {
                         		ifTimeDataSuccess = true;
                         			oCheckDialog.timeDataLayout.removeAllContent();
                         		oCheckDialog.generateTimeDataBtn.setEnabled(false);
                         		oCheckDialog.timeDataLayout.addContent(new sap.ui.commons.Image({
                        src: './images/green_tick.png'}));
					 
				},
                         error: function(error) { 
                            var ifTimeDataSuccess = false; 	
                         } 
                     }); 
 

 if(!ifTimeDataSuccess)
{
		oCheckDialog.timeDataLayout.removeAllContent();
					oCheckDialog.generateTimeDataBtn.setEnabled(true);
					oCheckDialog.timeDataLayout.addContent(new sap.ui.commons.Image({
                        src: './images/red_cross.png'}));
}   
    oCell.addContent(oCheckDialog.generateTimeDataBtn);
    
    
    oRow.addCell(oCell);
    oContentMatrix.addRow(oRow);
    //add time data button
   
	

    oContentMatrix.addRow(createDividerRow());

    // add matrix layout to content
    oContent.addContent(oContentMatrix);

    var ok = function(oEvent) {
        oCheckDialog.close();
    };
    var okButton = new sap.ui.commons.Button({
        text: sap.app.i18n.getText("OK_BUTTON"),
        press: ok
    });
    oCheckDialog.addStyleClass("welcomeDlg");
    oCheckDialog.addButton(okButton).setDefaultButton(okButton).open();
	
	function logoutMethod(){
		 window.location.replace('/logout');
	}
	
	function createShineAdminRole(role, csrftoken){
		$.ajax({
					type: 'PUT',
					url: '/sap/rest/authorization/rolecollections/' + "SHINE_ADMIN" + "/roles",
					async: false,
					headers: {
						'x-csrf-token': csrftoken,
						'Accept': "application/json",
						'Content-Type': "application/json"
					},
					data: JSON.stringify(role),
					success: function(result) {
						ifSuccess=true;
					},
					error: function(error) {
						ifSuccess=false;
						ifShineAdminRoleFailed = true;
            		}
            	});
	}
	
    // trigger check
    checkPre();
    
    function checkPre() {
    	
	//check for Role Collection starts.............
    	jQuery.ajax({
			type: 'get',
			url: "/sap/rest/authorization/rolecollections/SHINE_ADMIN/",
			datatype: 'json',
			async: false,
			success: function(result, status, xhr) {
				doRoleCollectionExist = true;
			},
			error: function(error) {
				doRoleCollectionExist = false;
			}
    	});
	//check for Role Collection ends.............  
	
	//check for Roles starts.............
	//ajax query to get roles
    	jQuery.ajax({
			type: 'get',
			url: "/sap/rest/authorization/rolecollections/SHINE_ADMIN/roles",
			datatype: 'json',
			async: false,
			success: function(result, status, xhr) {
				roleTemplates = result.roles;
			//get all the applications to check whether admin role is assigned to it. even if one is not assigned set the variable doShineAdminROleExist to false. 
				jQuery.ajax({
					type: 'get',
					url: "/sap/rest/authorization/apps",
					datatype: 'json',
					async: false,
					success: function(apps, status, xhr) {
						applications = apps.apps;
						if(applications != undefined){
							if(applications.length!=undefined && applications.length>0)
							var arrayDoShineAdminRoleExist = [];
								for(var i=0;i<applications.length;i++){
									var bool = false;
									if((applications[i].appid).indexOf("shine!")>-1){
										if(roleTemplates != undefined){
											if(roleTemplates.length!=undefined && roleTemplates.length>0)
												for(var j=0;j<roleTemplates.length;j++){
													if(roleTemplates[j].roleTemplateAppId === applications[i].appid){
														doShineAdminRoleExist = true;
														bool = true;
													}
												}
										}
										
										arrayDoShineAdminRoleExist[i] = bool;
									}
									if((applications[i].appid).indexOf("shine!")>-1 && !bool){
											break;
									}
								}
							if(arrayDoShineAdminRoleExist != undefined){
							if(arrayDoShineAdminRoleExist.length!=undefined && arrayDoShineAdminRoleExist.length>0){
								for(var l=0;l<arrayDoShineAdminRoleExist.length;l++){
									if(arrayDoShineAdminRoleExist[l] === false){
										doShineAdminRoleExist = false;
									}
								}
							}
							}
						}
						
					},
					error: function(error) {
						doRoleCollectionExist = false;
						sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("ERROR_CSRFTOKEN"));
					}
    			});
        		validateAndEnableDisableButton(doRoleCollectionExist,doShineAdminRoleExist,doJobSchedulerRoleExist);
			},
			error: function(error) {
				if(error.status === '404'){
					doRoleCollectionExist = false;
					validateAndEnableDisableButton(doRoleCollectionExist,doShineAdminRoleExist,doJobSchedulerRoleExist);
				}else{
					doRoleCollectionExist = false;
					sap.ui.commons.MessageBox.alert(sap.app.i18n.getText("ERROR_CSRFTOKEN"));
					validateAndEnableDisableButton(doRoleCollectionExist,doShineAdminRoleExist,doJobSchedulerRoleExist);
				}
			}
    	});
    }
    
    function validateAndEnableDisableButton(doRoleCollectionExist,doShineAdminRoleExist,doJobSchedulerRoleExist){
        
        if(doRoleCollectionExist & doShineAdminRoleExist){
        	oCheckDialog.roleCollectionLayout.removeAllContent();
					oCheckDialog.roleCollectionBtn.setEnabled(false);
					oCheckDialog.roleCollectionLayout.addContent(new sap.ui.commons.Image({
                        src: './images/green_tick.png'}));
        }else{
        	oCheckDialog.roleCollectionLayout.removeAllContent();
					oCheckDialog.roleCollectionBtn.setEnabled(true);
					oCheckDialog.roleCollectionLayout.addContent(new sap.ui.commons.Image({
                        src: './images/red_cross.png'}));
        }
    }
    
    function createHeaderRow() {
        var oRow = new sap.ui.commons.layout.MatrixLayoutRow(); // {height : '25px'});
        var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            colSpan: 2,
            hAlign: sap.ui.commons.layout.HAlign.Center
        });
        var textView = new sap.ui.commons.TextView({
            text: sap.app.i18n.getText("CHECKING_PRE"),
            design: sap.ui.commons.TextViewDesign.H1
        });
        textView.addStyleClass("welcomeHeaderTextAlign");
        textView.addStyleClass('dialogTextColor');
        var oHorizontalLayout = new sap.ui.commons.layout.HorizontalLayout({
            content: [textView]
        });
        oCell.addContent(oHorizontalLayout);
        oRow.addCell(oCell);
        return (oRow);
    }

    function createDividerRow() {
        // hDevider row
        oRow = new sap.ui.commons.layout.MatrixLayoutRow();
        // horizontal divider
        oCell = new sap.ui.commons.layout.MatrixLayoutCell({
            colSpan: 2,
            hAlign: sap.ui.commons.layout.HAlign.Left
        });
        var hDevider = new sap.ui.commons.HorizontalDivider();
        oCell.addContent(hDevider);
        oRow.addCell(oCell);
        return (oRow);
    }
};
