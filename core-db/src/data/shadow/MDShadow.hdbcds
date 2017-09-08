namespace shadow;

using Core as EPM;
using Util;
using MD;

context MDShadow {

    Entity Addresses {
        key  ADDRESSID: EPM.BusinessKey;
        CITY: EPM.SString;
        POSTALCODE: EPM.BusinessKey;
        STREET: EPM.MString;
        BUILDING: EPM.BusinessKey;
        COUNTRY: String(3);
        REGION: String(4);
        ADDRESSTYPE: String(2);
        VALIDITY: EPM.ValidityT;   
        LATITUDE: Double;
        LONGITUDE: Double; 
    };
    
    Entity BusinessPartner {
        key  PARTNERID: EPM.BusinessKey;
        PARTNERROLE: String(3); //Business Partner Role
        EMAILADDRESS: EPM.LString;
        PHONENUMBER: EPM.PhoneT;
        FAXNUMBER: EPM.PhoneT null;
        WEBADDRESS: EPM.VLString;
        ADDRESSES: Association to Addresses null;
        COMPANYNAME: String(80);
        LEGALFORM: EPM.BusinessKey;
        HISTORY: MD.HistT;
        CURRENCY: EPM.CurrencyT;
    };
  
    Entity Employees {
        key  EMPLOYEEID: EPM.BusinessKey;
        NAME: MD.NameT null;
        SEX: MD.SexT;
        LANGUAGE: EPM.ABAPLanguage;
        PHONENUMBER: EPM.PhoneT null;
        EMAILADDRESS: EPM.LString;
        LOGINNAME: String(12);
        ADDRESSES: Association to Addresses null;
        VALIDITY: EPM.ValidityT; 
        CURRENCY: EPM.CurrencyT;                
        SALARYAMOUNT: EPM.AmountT;
        ACCOUNTNUMBER: EPM.BusinessKey;
        BANKID: EPM.BusinessKey;
        BANKNAME: EPM.LString;
        EMPLOYEEPICURL: EPM.LString;
    };

    Entity Products {
        key  PRODUCTID: EPM.BusinessKey; 
		TYPECODE: String(2);
		CATEGORY: EPM.SString;
        HISTORY: MD.HistT;
        NAMEID: EPM.BusinessKey;
        DESCID: EPM.BusinessKey;
        SUPPLIER: Association to MD.BusinessPartner;
        TAXTARIFFCODE: Integer;
        QUANTITYUNIT: EPM.UnitT;
        WEIGHTMEASURE: EPM.QuantityT;
        WEIGHTUNIT: EPM.UnitT; 
        CURRENCY: EPM.CurrencyT;
        PRICE: EPM.AmountT;
        PRODUCTPICURL: EPM.LString null;
        WIDTH: EPM.QuantityT;
        DEPTH: EPM.QuantityT;
        HEIGHT: EPM.QuantityT;
        DIMENSIONUNIT: EPM.UnitT;

    };

 }; 