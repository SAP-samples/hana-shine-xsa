SHINE XSA 1.2.2
===============
SAP HANA Interactive Education, or SHINE, is a demo application that makes it easy to learn how to build applications on SAP HANA extended application services advanced model. This demo application is delivered as a package that contains sample data and design-time developer objects for the applications database tables, views, OData and user interface.
The application consists of the following packages:



- core-db - This is the core db package contains Core data models artifacts required to create the tables and other database artifacts (for example, .hdbcds, .hdbsequence, and so on).


- core-js -This package has the Node.js implementation of Data Generator, PO Worklist, Sales Dashboard (back end).


- user-db - This package contains the artifacts contains the db artificats for User Creation 


- user-js - This package contains the User CRUD implementation in nodejs using xsodata libraries.

- user-java - This package contains the User CRUD implementation in Java using Java oData V4 libraries.

- web - This package contains the user interface for the SHINE Launchpad, Data Generator, and Purchase Order Worklist, Sales Dashboard, User CRUD pplications implemented in SAP UI5.

- site-web - This package contains the user interface for Fiori as a Service for the SHINE Launchpad. Currently User CRUD application has been implemented

- site-content - This package contains the JSON configurations for the Fiori as a Service module.

## Prerequisites
The following components should be installed before SHINE installation on XSA:

- XSAC_MONITORING   
- XSAC_SERVICES   

##Installation via Product Installer 
###Create a user for Custom User Provided Services creation

Open SQL console of the HANA system in SAP HANA studio and execute the following SQL statements:

    CREATE USER <USERNAME> PASSWORD <PASSWORD>;  
    Grant SELECT on "SYS"."M_TABLES" to <USERNAME>;
    Grant SELECT on "SYS"."TABLES" to <USERNAME>;
    Grant SELECT on "SYS"."VIEWS" to <USERNAME> ;
    Grant SELECT on "SYS"."USERS" to <USERNAME> ;
    Grant SELECT on "_SYS_BI"."M_TIME_DIMENSION" to <USERNAME> WITH GRANT OPTION;
    Grant EXECUTE on "SYS"."SERIES_GENERATE_TIMESTAMP" to <USERNAME>;
 
After user creation login once with this user to the HANA system to change the initial password.   



##Importing SHINE from GitHub to SAP WebIDE

- Launch SAP Web IDE for SAP HANA.

- Navigate to File->Git->Clone Repository
- Enter the URL of the repository as [https://github.com/SAP/hana-shine-xsa.git](https://github.com/SAP/hana-shine-xsa.git)

- Choose OK.

- Create a Custom User Provided Services(CUPS) for SYS and SYS_BI schemas where USERNAME and PASSWORD is for the USER created in the above step "  Create a user for Custom User Provided Services creation". The hostname name is host name of HANA system. 

##
    xs cups CROSS_SCHEMA_SYS -p "{\"host\":\"<hostname>\",\"port\":\"3##<15|13>\",\"user\":\"<USERNAME>\",\"password\":\"<PASSWORD>\",\"driver\":\"com.sap.db.jdbc.Driver\",\"tags\":[\"hana\"] , \"schema\" : \"SYS\" }"
    


   

##

     
    xs cups CROSS_SCHEMA_SYS_BI -p "{\"host\":\"<hostname>\",\"port\":\"3##<15|13>\",\"user\":\"<USERNAME>\",\"password\":\"<PASSWORD>\",\"driver\":\"com.sap.db.jdbc.Driver\",\"tags\":[\"hana\"] , \"schema\" : \"_SYS_BI\" }"

‘##’ corresponds to instance number.

- Create a service for the UAA by executing the command in CLI of XSA system:

    `xs create-service xsuaa default shine-uaa -c xs-security.json`

- Create Job Scheduler Service by executing the command in CLI of XSA system:
  
    `xs cs jobscheduler default shine-scheduler`

- After all these services are created, build all packages like core-db, user-db, user-js etc.
For more information, see Web IDE for SAP HANA - Installation and Upgrade Guide.
