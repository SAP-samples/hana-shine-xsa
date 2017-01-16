SHINEfor XSA SAP HANA 2.0 SPS00
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

For more information, please refer to [SHINE for XSA guide](http://help.sap.com/hana/SAP_HANA_Interactive_Education_SHINE_for_SAP_HANA_XS_Advanced_Model_en.pdf).
## Prerequisites
The following components should be installed before SHINE installation on XSA:

- XSAC_MONITORING   
- XSAC_SERVICES  

**Note:** In HANA Express, the Job Scheduler(XSAC_SERVICES) could be pre-installed, so in addition to checking if the job scheduler service is present, also check if the status of jobscheduler-broker is started.
To do this, proceed as follows:
 
1. Go to SAP space via command xs target –o HANAExpress –s SAP.
2.  Run command xs apps | grep STOPPED to get all stopped services.
3.   Check if status of jobscheduler-broker is stopped.
4.   If stopped, start it via the command xs start jobscheduler-broker.  
 

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

- Create a Custom User Provided Services(CUPS) for SYS and SYS_BI schemas where USERNAME and PASSWORD is for the USER created in the above step "  Create a user for Custom User Provided Services creation". The hostname is host name of HANA system. 

##
    xs cups CROSS_SCHEMA_SYS -p "{\"host\":\"<hostname>\",\"port\":\"3##<15|13>\",\"user\":\"<USERNAME>\",\"password\":\"<PASSWORD>\",\"driver\":\"com.sap.db.jdbc.Driver\",\"tags\":[\"hana\"] , \"schema\" : \"SYS\" }"
    


   

##

     
    xs cups CROSS_SCHEMA_SYS_BI -p "{\"host\":\"<hostname>\",\"port\":\"3##<15|13>\",\"user\":\"<USERNAME>\",\"password\":\"<PASSWORD>\",\"driver\":\"com.sap.db.jdbc.Driver\",\"tags\":[\"hana\"] , \"schema\" : \"_SYS_BI\" }"

‘##’ corresponds to instance number.

- Create a service for the UAA by executing the command in CLI of XSA system:

    `xs create-service xsuaa default shine-uaa -c xs-security.json`

- Create Job Scheduler Service by executing the command in CLI of XSA system:
  
    `xs cs jobscheduler default shine-scheduler`

- 	After all these services are created, build all packages like core-db, user-db, user-js etc.
	Note: While building the core-db module, the following two things have to be replaced in the mta.yaml:
a)	User container name
b)	Uaa Endpoint 
	
	For more details on how to do the above steps, plese refer below:
	
   a)	**User container name**: To find out the user container name, please do a dummy build of the user-db module, without any changes. After the build fails, please execute the following command:

     xs s          
                                                                                               
	

Please copy the respective user container name which will look like:

  < GUID ><project-name>-shine-user-conatiner

 and paste it in line 115 of mta.yaml.

b)	**UAA Endpoint**: Please replace the UAA end point URL in line 129 of mta.yaml to your respective UAA end point URL which will be of the format :
http(s)://<host-name> :3<instance-number>32/ uaa-security

For example in HANA express the UAA endpoint can be https://hxehost:39032/uaa-security

For more information on cloning, building, deploying etc. for XSA applications, see [SAP Web IDE for SAP HANA - Installation and Upgrade Guide. ](http://help.sap.com/hana/SAP_Web_IDE_for_SAP_HANA_Installation_Guide_en.pdf )

