SHINE for SAP HANA extended application services advanced model (SHINE for XSA) SPS12
================
SAP HANA Interactive Education, or SHINE, is a demo application that makes it easy to learn how to build applications on SAP HANA extended application services advanced model. This demo application is delivered as a package that contains sample data and design-time developer objects for the applications database tables, views, OData and user interface. 

SHINE for HANA extended application services advanced model (SHINE for XSA) is a successor of [SHINE for XS Classic](https://github.com/SAP/hana-shine/ "SHINE for XS Classic"). It is based on micro service architecture. It showcases how multiple runtimes(Nodejs and XSJS) can be used in a single application and is packaged as a Multi Target Application

## How do I use it?
This repository is intended to be used as a reference for code of SHINE for XSA. The SHINE for XSA MTA can be found in SAP Support Portal. 

[For detailed steps on where to find the MTA and how to install the application please refer to the SHINE for XSA detailed documentation found here.](http://help.sap.com/hana/SAP_HANA_Interactive_Education_SHINE_for_SAP_HANA_XS_Advanced_Model_en.pdf)

## What is in the repository?

The application consists of the following packages:


- db - This package contains the SAP HANA Deployment Infrastructure (HDI) artifacts and the database artifacts required to create the tables and other database artifacts (for example, .hdbcds, .hdbsequence, and so on).


- admin-js -This package has the Node.js implementation of Data Generator application (back end).


- xsjs - This package contains the XSJS implementation for Purchase Order Worklist (back end).


- ui - This package contains the user interface for the SHINE Launchpad, Data Generator, and Purchase Order Worklist applications implemented in SAP UI5.

Note: The code will not work in SPS11 and it will work only in SPS12