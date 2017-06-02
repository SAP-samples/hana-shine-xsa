jQuery.sap.declare("shine.democontent.epm.job.app.tileDialog");

function HelpDialog(){
	
	this.oSimpleForm;
	
	this.addContent = function(oInfoSettings, oi18n){
	
		this.oSimpleForm = new sap.ui.layout.form.SimpleForm({maxContainerCols:1});
		var oNum = parseInt(oi18n.getProperty('INFOHELP_' + oInfoSettings.toUpperCase())); 	
		this.oSimpleForm.addContent(new sap.m.Text({text: oi18n.getProperty('INFOHELP_' + oInfoSettings.toUpperCase() + '_TITLE_DESC')}));
		for (i = 0; i < oNum; i++) { 
			this.oSimpleForm.addContent(new sap.m.Label({design:"Bold", visible:true, text: oi18n.getProperty('INFOHELP_' + oInfoSettings.toUpperCase() + '_LABEL_' + i)}));
			this.oSimpleForm.addContent(new sap.m.Text({text: oi18n.getProperty('INFOHELP_' + oInfoSettings.toUpperCase() + '_TEXT_' + i)}));
		}
		
		
	}
}
