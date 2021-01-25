SHINE for the Cloud Foundry Environment within SAP Cloud Platform (v1.3.11)
===============
SHINE is a Muti-Target Application (MTA) and follows the XS Advanced Programming Model. It consists of the following packages:

- core-db - This package contains core data model artifacts required to create the tables and other database artifacts (e.g. .hdbcds, .hdbsequence, ...).

- core-js - This package contains the Node.js implementation of Data Generator, Purchase Order Worklist, and Sales Dashboard (backend).

- user-js - This package contains the User CRUD applications implementation in Node.js using XSOData libraries and it also showcases how to use the the job scheduler service in Cloud Foundry for creating and scheduling jobs.

- web - This package contains the user interface for the SHINE Launchpad, Data Generator, Purchase Order Worklist, Job Scheduler, Sales Dashboard, Spatial and User CRUD applications implemented in SAPUI5.

- site-content - This package contains site configuration files required for SAP Fiori Launchpad.

- site-web - This package contains the user interface for the SHINE Fiori Launchpad, Data Generator, Purchase Order Worklist, Job Scheduler, Sales Dashboard, Spatial and User CRUD applications implemented in SAPUI5.

Architecture:

![Alt text](./images/SHINE-CF.jpg "Architecture")

This repository contains a version of SHINE which is configured to run on the Cloud Foundry environment within SAP Cloud Platform. You can read more about the "[General Availability of the XS Advanced Programming Model with Cloud Foundry on SAP Cloud Platform](https://blogs.sap.com/2017/05/16/general-availability-of-the-xs-advanced-programming-model-with-cloud-foundry-on-sap-cloud-platform/)". The code base of SHINE that is used is version SHINE for XSA SAP HANA 2.0 SPS01. A blog post with the same instructions as in this readme can be found [here](https://blogs.sap.com/2017/07/10/deploying-shine-on-the-cloud-foundry-environment-within-sap-cloud-platform/).

## Setup Cloud MBT Build tool

1. To build the multi target application, we need the [Cloud MTA Build tool](https://sap.github.io/cloud-mta-build-tool/), download the tool from [here](https://sap.github.io/cloud-mta-build-tool/download/)
2. For Windows system, install 'MAKE' from https://sap.github.io/cloud-mta-build-tool/makefile/
3. To install using npm run the command: `npm install -g mbt`

#### Setup Git
1. Download and install Git from [here](https://git-scm.com/)

#### Setup Node.js and NPM
1. Install Node.js from [here](https://nodejs.org/download/release/latest-v12.x/).
2. Create a file with name `.npmrc` in your HOME directory. On Windows, that would be `C:/Users/<User Name>`, on macOS, that would be `~/Users/<User Name>`. 
3. Copy the below content to the .npmrc file. With this configuration, you are updating all 3 proxy settings (proxy, http-proxy, https-proxy) as per your network settings. If no proxy settings are required mark values of all 3 proxy settings as null. Also you have disabled the SSL key validation when making requests to the npm registry.

~~~~
strict-ssl=false
proxy=http://proxy:8080/
http-proxy=http://proxy:8080/
https-proxy=http://proxy:8080/

~~~~

You can read more about the SAP NPM Registry in "[SAP NPM Registry launched: Making the lives of Node.js developers easier](https://blogs.sap.com/2017/05/16/sap-npm-registry-launched-making-the-lives-of-node.js-developers-easier/)".

## Setup Cloud Foundry Environment Account and CLI
1. To run shine on cloud foundry you need to have Cloud Foundry enterprise account. Check if the Cloud Foundry Space you will be deploying the application has the following minimum entitlements:

         Job Scheduler: lite - 1
         Audit Log: standard - 1
         Portal Services: site - 1
         Application Runtime: MEMORY - 6
         Hana DB: 64STANDARD - 1
         Hana: hdi-shared - 1

2. Download and install the Cloud Foundry CLI as described [here](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/4ef907afb1254e8286882a2bdef0edf4.html)
3. To deploy the MTAR we need the MTA CF CLI plugin, download the MTA CF CLI Plugin from [here](https://github.com/cloudfoundry-incubator/multiapps-cli-plugin/releases) 
4. To install the MTA CF CLI Plugin open your CLI and run the command: `cf install-plugin <path to plugin download folder>/mta_plugin_<os-name>_amd64.exe|tar.gz`

## Build the Source Code
1. Clone the SHINE code from this  repository to your local drive via Git or GitHub Desktop, the branch is **shine-cf**; alternatively, download and unpack the ZIP. 
2. Logon to your Cloud Foundry environment instance by following the steps explained [here](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/7a37d66c2e7d401db4980db0cd74aa6b.html)  
*Please note: The Cloud Foundry API endpoints are listed [here](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/350356d1dc314d3199dca15bd2ab9b0e.html), for the Cloud Foundry environment in Frankfurt it's https://api.cf.eu10.hana.ondemand.com and for the Cloud Foundry environment in Virginia it's https://api.cf.us10.hana.ondemand.com.*
> The Job Scheduler service is used by SHINE, therefore this needs to be available. Currently, the Job Scheduler service is only available in the Cloud Foundry environments in Frankfurt and Virginia, not in the beta in California. Therefore, the installation of SHINE into the Cloud Foundry environment in California would fail. Please install SHINE only in the Cloud Foundry environments in Frankfurt and Virginia.
3. In line no. 185 of mta.yaml update the url property of the controller to the Cloud Foundry API endpoint of the region you are using (see above).
4. Check the Cloud Foundry org and space names to which you are planning to deploy.
> The Multi-target Application Archive (MTAR), which is obtained after following the build steps described here, cannot be deployed into Cloud Foundry orgs or spaces with white spaces in the name (e.g. "My Space") due to a limitation from the deploy service. Therefore, the installation of the SHINE MTAR into Cloud Foundry orgs or spaces with white spaces in the name (e.g. "My Space") would fail. Please install the SHINE MTAR only into Cloud Foundry orgs or spaces without white spaces in the name  (e.g. "MySpace" or "My_Space").
5. If the Cloud Foundry org or space, to which you are planning to deploy, has any special characters in the name other than the permissible 'a'-'z', 'A'-'Z', '0'-'9', '_', '-', '\', and '/', open the file xs-security.json under the shine-cf project root folder and edit line no. 2 `${org}-${space}-shinecf`. Change the value to `"your-org-name-without-special-characters"-"your-space-name-without-special-characters"-shinecf`, e.g. `demoapps-dev_cf-shinecf` althrough my org name is "demoapps" and space name is "dev@cf".
6. In your CLI in the SHINE project root folder run the command: `mbt build --mtar=shine-cf.mtar`  
> You might notice that the build is too slow. This is because of an issue with [npm](https://github.com/npm/npm/issues/11028) when behind a proxy server. In such cases please run the build from an environment without a proxy.
7. An MTAR with the name shine-cf.mtar was generated.

## Deploy the MTAR
1. SHINE needs Cloud Foundry resources as described below. Therefore, this amount of resources should be assigned in Quota Management (on Global Account level) before SHINE deployment:-
    1.	5 routes
    2.	6 services
    3.	1 GB instance memory
2. Navigate to your Cloud Foundry org and space via CLI where you want to deploy SHINE and where you have the above-mentioned resources assigned and free
3. Before deploying the MTAR, you need a Service Instance of Hana DB  already setup and running within the space where you. Follow this [link](https://help.sap.com/viewer/cc53ad464a57404b8d453bbadbc81ceb/Cloud/en-US/21418824b23a401aa116d9ad42dd5ba6.html) for information on how setting it up. If you already have such instance running, then you can avoid setting it up as shine-container will use the existing instance automatically.
4. In case, if your space has more than 1 Hana DB service instance, add database_id in config.yaml in shine-container properties under resources section. To look for database_id, run cli command -> cf service <hana_db-service_inst_name> --guid
5. Run the command: `cf deploy shine-cf.mtar`

## Launch the SHINE Application
SHINE has two entry points: SHINE Launchpad and Fiori Launchpad for SHINE. The steps below specify how to get the URLs for SHINE Launchpad and Fiori Launchpad for SHINE  
1. Run the command: `cf apps`  
2. Locate the URLs for the two Apps with name shine-web and site-web.  
3. shine-web has the url for SHINE Launchpad and  site-web has the url for Fiori Launchpad of SHINE.  
![Alt text](./images/shine-url.jpg "SHINE URL;s")  
### SHINE Web  
![Alt text](./images/shine-web.jpg "SHINE Web")
### Site Web  
![Alt text](./images/shine-site-web.jpg "Site Web")  

## Undeploy the SHINE Application
To undeploy SHINE and delete all its services run the command: `cf undeploy com.sap.refapps.shine -f --delete-services`

## Support
For any question/clarification or report an issue in SHINE for CF Environment please [create an issue](https://github.com/sap/hana-shine-xsa/issues/new/). Please mention `[shine-cf]` in the title to differentiate issue between SHINE for XS Advanced and SHINE for CF Environment

## License
[Apache License 2.0](LICENSE)
