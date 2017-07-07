namespace shadow;

using Core as EPM;

context UtilShadow {

    Entity Constants {
        key  DOMAIN: String(30);
        key  FIXEDVALUE: String(30);
        key  LANGUAGE: EPM.ABAPLanguage;
        DESCRIPTION: EPM.MString;     
    };

    Entity Texts {
        key  TEXTID: EPM.BusinessKey;
        LANGUAGE: EPM.ABAPLanguage;
        ISOLANGUAGE: EPM.ISOLanguageT;
        TEXT: EPM.VLString null;     
    };
        
    Entity Notes {
        key  NOTEID: EPM.BusinessKey;
        LINKID: EPM.BusinessKey;
        AUTHOR: String(30);
        TEXT: EPM.LString;
        CREATEDAT: EPM.SDate;
        THUMBNAIL: EPM.LString;      
    };   
    
    Entity Attachments {
        key  NOTEID: EPM.BusinessKey;
        LINKID: EPM.BusinessKey;        
        TYPE: String(30);
        TITLE: EPM.LString;
        CREATEDAT: EPM.SDate;
        DESCRIPTION: EPM.LString;
        SIZE: String(40);      
    };       
  
};