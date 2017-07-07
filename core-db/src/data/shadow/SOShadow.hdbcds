namespace shadow;

using Core as EPM;
using MD;


context SOShadow {

    Entity Header {
        key  SALESORDERID: EPM.BusinessKey;
        ITEMS: Association[*] to Item on ITEMS.SALESORDERID = SALESORDERID;
        HISTORY: MD.HistT;
        NOTEID: EPM.BusinessKey null;
        PARTNER: Association to MD.BusinessPartner;
        CURRENCY: EPM.CurrencyT;
        GROSSAMOUNT: EPM.AmountT;
        NETAMOUNT: EPM.AmountT;
        TAXAMOUNT: EPM.AmountT;
        LIFECYCLESTATUS: EPM.StatusT;
        BILLINGSTATUS: EPM.StatusT;
        DELIVERYSTATUS: EPM.StatusT;
    };

    Entity Item {
        key  SALESORDERID: EPM.BusinessKey;
        key  SALESORDERITEM: EPM.BusinessKey;
        HEADER: Association[1] to Header on HEADER.SALESORDERID = SALESORDERID;
        PRODUCT: Association to MD.Products;
        NOTEID: EPM.BusinessKey null;
        CURRENCY: EPM.CurrencyT;
        GROSSAMOUNT: EPM.AmountT;
        NETAMOUNT: EPM.AmountT;
        TAXAMOUNT: EPM.AmountT;
        ITEMATPSTATUS: String(1);
        OPITEMPOS: EPM.BusinessKey null;
		QUANTITY: EPM.QuantityT;
		QUANTITYUNIT: EPM.UnitT;
		DELIVERYDATE: EPM.SDate;
    };
 
    Entity Filter {
        key  MODEL: String(30);
        key  COLNAME: String(8);
        COLVALUE: String(8);
    };
       
};