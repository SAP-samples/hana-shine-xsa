namespace shadow;

using Core as EPM;
using MD;


context POShadow {

    Entity Header {
        key  PURCHASEORDERID: EPM.BusinessKey;
        ITEMS: Association[*] to Item on ITEMS.PURCHASEORDERID = PURCHASEORDERID;
        HISTORY: MD.HistT;
        NOTEID: EPM.BusinessKey null;
        PARTNER: Association to MD.BusinessPartner;
        CURRENCY: EPM.CurrencyT;
        GROSSAMOUNT: EPM.AmountT;
        NETAMOUNT: EPM.AmountT;
        TAXAMOUNT: EPM.AmountT;
        LIFECYCLESTATUS: EPM.StatusT;
        APPROVALSTATUS: EPM.StatusT;
        CONFIRMSTATUS: EPM.StatusT;
        ORDERINGSTATUS: EPM.StatusT;
        INVOICINGSTATUS: EPM.StatusT;
    };


    Entity Item {
        key  PURCHASEORDERID: EPM.BusinessKey;
        key  PURCHASEORDERITEM: EPM.BusinessKey;
        HEADER: Association[1] to Header on HEADER.PURCHASEORDERID = PURCHASEORDERID;
        PRODUCT: Association to MD.Products;
        NOTEID: EPM.BusinessKey null;
        CURRENCY: EPM.CurrencyT;
        GROSSAMOUNT: EPM.AmountT;
        NETAMOUNT: EPM.AmountT;
        TAXAMOUNT: EPM.AmountT;
		QUANTITY: EPM.QuantityT;
		QUANTITYUNIT: EPM.UnitT;
		DELIVERYDATE: EPM.SDate;
    };
  
};