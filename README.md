SHINE for XSA SAP HANA 2.0 SPS01
===============
SAP HANA Interactive Education, or SHINE, is a demo application that makes it easy to learn how to build applications on SAP HANA extended application services advanced model. This demo application is delivered as a package that contains sample data and design-time developer objects for the applications database tables, views, OData and user interface.
The application consists of the following packages:



- core-db - This is the core db package contains Core data models artifacts required to create the tables and other database artifacts (for example, .hdbcds, .hdbsequence, and so on).


- core-js -This package has the Node.js implementation of Data Generator, PO Worklist, Sales Dashboard (back end).


- user-db - This package contains the artifacts contains the db artificats for User Creation 


- user-js - This package contains the User CRUD implementation in nodejs using xsodata libraries.

- user-java - This package contains the User CRUD implementation in Java using Java oData V4 libraries.

- web - This package contains the user interface for the SHINE Launchpad, Data Generator, and Purchase Order Worklist, Sales Dashboard, User CRUD pplications implemented in SAP UI5.

- site-content - This package contains site configuration files required for SAP Fiori Launchpad.

- site-web - This package contains the user interface for the SHINE Fiori Launchpad, Data Generator, Purchase Order Worklist, Job Scheduler, Sales Dashboard, Spatial, and User CRUD applications implemented in SAPUI5.

## Prerequisites
The following components should be installed before SHINE installation on XSA. If not installed please contact your system administrator to install them.

- XSAC_MONITORING   

- XSAC_SERVICES   

- XSAC_PORTAL_SERVICES

- SAPUI5_FESV3   

Note: In HANA Express, the Job Scheduler(XSAC_SERVICES) could be pre-installed.
If the services are stopped, please contact the system administrator to start them.

## Importing SHINE from GitHub to SAP Web IDE for SAP HANA

- Launch SAP Web IDE for SAP HANA.

- Navigate to File->Git->Clone Repository
- Enter the URL of the repository as [https://github.com/SAP/hana-shine-xsa.git](https://github.com/SAP/hana-shine-xsa.git)

- Choose OK.


- Create a service for the UAA by executing the command in CLI of XSA system:

    `xs create-service xsuaa default shine-uaa -c xs-security.json`

- Create Job Scheduler Service by executing the command in CLI of XSA system:
  
    `xs cs jobscheduler default shine-scheduler`

- 	After all these services are created, build and run all modules like core-db, user-db, user-js, user-java and web.

Note: While building the core-db module, the following two things have to be replaced in the mta.yaml:

a)	UAA Endpoint 

b)	Controller Endpoint

	
For more details on how to do the above steps, please refer below:
	
   a)	**UAA Endpoint**: Please replace the UAA end point URL in line 204 of mta.yaml to your respective UAA end point URL which will    be of the format :

   `http(s)://< host-name >:3<instance-number>32/ uaa-security`

   For example in HANA express the UAA endpoint can be https://hxehost:39032/uaa-security

   b)   **Controller Endpoint**: Please replace the controller end point URL in line 214 of the mta.yaml file to your respective XS controller end point.
   
   ` http(s)://<XSA host name>:<xs controller port>`

   By default, the xs controller port is 3##30 where ## is the instance number

   Please Note, In HANAExpress VM install has default instance as 90, Binary install is a user-defined number.   
   This will install SHINE without FLP. Please follow the steps in the below section to deploy SHINE with FLP.

## Deploy SHINE for XSA application with FLP  ##

After doing the above steps,

- Right click on the shine project folder and select Build.
- After successful build of the project, there will be a folder called mta_archives created in the workspace.
- Expand the folder and expand the folder com.sap.refapps.shine_1.3.x.mtar file present inside.
- Right click on the mtar file present inside and select Export.
- Once exported, login to the XSA system via CLI and deploy the mtar file using the following command:
    
    `xs deploy com.sap.refapps.shine_1.3.x.mtar`
    


   For more information on cloning, building, deploying etc. for XSA applications, see [SAP Web IDE for SAP HANA - Installation and  Upgrade Guide. ](https://help.sap.com/doc/13ff61e61a8f442090e27050dc61f019/2.0.01/en-US/SAP_HANA_Interactive_Education_SHINE_for_SAP_HANA_XS_Advanced_en_HANA2.0SPS01.pdf)

## Troubleshooting

In case the build of the java module fails with error:

    [ERROR] Failed to execute goal on project sap-xsac-shine-user-java: Could not resolve 
    dependencies for project com.sap.refapps:sap-xsac-shine-user-java:war:1.2.2: The following
    artifacts could not be resolved: com.sap.gateway.v4.rt:com.sap.gateway.v4.rt.api:jar:1.2.2, com.sap.gateway.v4.rt:com.sap.gateway.v4.rt.core:jar:1.2.2, 
    com.sap.gateway.v4.rt:com.sap.gateway.v4.rt.jdbc:jar:1.2.2, 
    com.sap.gateway.v4.rt:com.sap.gateway.v4.rt.cds:jar:1.2.2, 
    com.sap.gateway.v4.rt:com.sap.gateway.v4.rt.core.web:jar:1.2.2, 
    com.sap.gateway.v4.rt:com.sap.gateway.v4.rt.xsa:jar:1.2.2: Could not find artifact 
    com.sap.gateway.v4.rt:com.sap.gateway.v4.rt.api:jar:1.2.2 in central 

Then please follow the below steps:

1.Expand the folder user-java and open pom.xml file.

2.Look for the below line:    

    	<sap.gateway.version>1.2.2</sap.gateway.version>

3.Change the version from 1.2.2 to 1.2.1 and build and run the java module again.

## Support
For any question/clarification or report an issue in SHINE please [create issue](https://github.com/sap/hana-shine-xsa/issues/new/)

## License
[Apache License 2.0](LICENSE)
