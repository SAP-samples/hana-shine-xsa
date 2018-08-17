SHINE XSA 1.5.0
===============
SAP HANA Interactive Education, or SHINE, is a demo application that makes it easy to learn how to build applications on SAP HANA extended application services advanced model. This demo application is delivered as a package that contains sample data and design-time developer objects for the applications database tables, views, OData and user interface.
The application consists of the following packages:



- core-db - This is the core db package contains Core data models artifacts required to create the tables and other database artifacts (for example, .hdbcds, .hdbsequence, and so on).


- core-node - This package has the Node.js implementation of Data Generator, Job Scheduler.

- core-python - This package has the python implementation of Excel Download in Purchase Order Worklist.

- core-xsjs - This package has the Node.js implementation of PO Worklist, Sales Dashboard, Spatial Demo using xsodata libraries.

- site-content - This package contains the JSON configurations for the Fiori as a Service module.

- site-web - This package contains the user interface for Fiori as a Service for the SHINE Launchpad.

- user-db - This package contains the artifacts contains the db artificats for User Creation. 

- user-java - This package contains the User CRUD implementation in Java using Java oData V4 libraries.

- user-xsjs - This package contains the User CRUD implementation in nodejs using xsodata libraries.

- web - This package contains the user interface for the SHINE Launchpad, Data Generator, and Purchase Order Worklist, Sales Dashboard, User CRUD pplications implemented in SAP UI5.


For details on how to deploy the application on XS Advanced, kindly refer to [blog](https://blogs.sap.com/2018/08/16/shine-with-python-runtime-for-sap-hana-xs-advanced/#).
