SHINE for the Cloud Foundry Environment within SAP Cloud Platform
===============
SAP HANA Interactive Education, or SHINE, is a demo application that makes it easy to learn how to build SAP HANA native applications. This demo application is delivered as a package that contains sample data and design-time developer objects for the application database tables, views, OData services and user interface. SHINE is a Muti-Target Application (MTA) and follows the XS Advanced Programming Model. It consists of the following  packages:

- core-db - This package contains core data model artifacts required to create the tables and other database artifacts (e.g. .hdbcds, .hdbsequence, ...).

- core-js - This package contains the Node.js implementation of Data Generator, Purchase Order Worklist, and Sales Dashboard (backend).

- user-js - This package contains the User CRUD applications implementation in Node.js using XSOData libraries and it also showcases how to use the the job scheduler service in Cloud Foundry for creating and scheduling jobs.

- web - This package contains the user interface for the SHINE Launchpad, Data Generator, Purchase Order Worklist, Sales Dashboard, and User CRUD applications implemented in SAPUI5.
