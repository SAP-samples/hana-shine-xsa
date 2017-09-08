    // Service Call Logic
    var gFilterTerms = "";
    var gFilterAttribute = "";
    var gLastOrdersChangedTime = "";
    var gSearchParam;
    var oPieModel = new sap.ui.model.json.JSONModel();

    /*************** Language Resource Loader *************/
    jQuery.sap.require("jquery.sap.resources");
    var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
    var oBundle = jQuery.sap.resources({
        url: "./i18n/messagebundle.hdbtextbundle",
        locale: sLocale
    });
    
    /** Tooltip formatting for the chart */
    var tooltipFormatString = '';
    if (sLocale.indexOf("de") > -1) {
        tooltipFormatString = '#.###.###.###,00'; 
    } else {
        tooltipFormatString = '#,###,###,###.00'; 
    }

    /** initialize tile dialog */
    jQuery.sap.registerModulePath('app', 'js');
    jQuery.sap.require("app.tileDialog");


    /*************** Hijacking for Gold Reflection *************/
    if (sap.ui.getCore().getConfiguration().getTheme() == "sap_goldreflection") { // this line is a hack, the rest of this coding is what a BusyIndicator hijacker could do
        sap.ui.core.BusyIndicator.attachOpen(function(oEvent) {
            $Busy = oEvent.getParameter("$Busy");
            iBusyPageWidth = jQuery(document.body).width();
            $Busy.css("top", "0").css("width", iBusyPageWidth + "px");
            bBusyAnimate = true;
            iBusyLeft = $Busy[0].offsetLeft;
            window.setTimeout(animationStep, iBusyTimeStep);
        });
        sap.ui.core.BusyIndicator.attachClose(function(oEvent) {
            bBusyAnimate = false;
        });
    }

    var bBusyAnimate = false;
    var iBusyLeft = 0;
    var iBusyDelta = 60;
    var iBusyTimeStep = 50;
    var iBusyWidth = 500;
    var iBusyPageWidth;
    var $Busy;

    function animationStep() {
        if (bBusyAnimate) {
            iBusyLeft += iBusyDelta;
            if (iBusyLeft > iBusyPageWidth) {
                iBusyLeft = -iBusyWidth;
            }
            $Busy.css("background-position", iBusyLeft + "px 0px");
            window.setTimeout(animationStep, iBusyTimeStep);
        }
    }
    /*************** END of Hijacking for Gold Reflection *************/

    function escape(v1) {
        var v2 = v1.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return v2;
    }

    /*** Numeric Formatter for Quantities ***/
    function numericSimpleFormatter(val) {
        if (val === undefined) {
            return '0'
        } else {
            jQuery.sap.require("sap.ui.core.format.NumberFormat");
            var oNumberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
                maxFractionDigits: 0,
                minFractionDigits: 0,
                groupingEnabled: true
            });
            return oNumberFormat.format(val);
        }

    }
    
    /* Wrapper for the function to be executed only once */
    function once(fn, context) { 
	    var result;
	    return function() { 
		    if(fn) {
			    result = fn.apply(context || this, arguments);
			    fn = null;
		    }
		    return result;
	    };
    }