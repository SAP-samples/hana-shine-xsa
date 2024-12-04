SHINE for XS Advanced SAP HANA 2.0 SPS08
===============

This release of the application consists of the following packages:

- core-db - This is the core db package contains Core data models artifacts required to create the tables and other database artifacts (for example, .hdbcds, .hdbsequence, and so on).

- core-node - This package has the Node.js implementation of Data Generator, Job Scheduler.

- core-xsjs - This package has the Node.js implementation of PO Worklist, Sales Dashboard, Spatial Demo using xsodata libraries.

- site-content - This package contains the JSON configurations for the Fiori as a Service module.

- site-web - This package contains the user interface for Fiori as a Service for the SHINE Launchpad.

- user-db - This package contains the db artifacts for User Creation.

- user-xsjs - This package contains the User CRUD implementation in nodejs using xsodata libraries.

- web - This package contains the user interface for the SHINE Launchpad, Data Generator, Purchase Order Worklist, Sales Dashboard, User CRUD applications, and Spatial Demo implemented in SAP UI5.

## Prerequisites
The following components should be installed before SHINE installation on XSA. If not installed please contact your system administrator to install them.

- XSAC_SERVICES   

- XSAC_PORTAL_SERVICES

- SAPUI5_SB & SAPUI5_FESV6

- Auditlog service   

Note: In HANA Express, the Job Scheduler (XSAC_SERVICES) could be pre-installed.
If the services are stopped, please contact the system administrator to start them.

## Importing SHINE from GitHub to SAP Web IDE for SAP HANA

- Launch SAP Web IDE for SAP HANA.

- Navigate to File->Git->Clone Repository
- Enter the URL of the repository as [https://github.com/SAP-samples/hana-shine-xsa.git](https://github.com/SAP-samples/hana-shine-xsa.git)

- Create the xs-security.json file manually via CLI by copy pasting contents from the xs-security.json file in the repository.

- Create a service for the UAA by executing the command in CLI of XSA system:

    `xs create-service xsuaa space shine-uaa -c xs-security.json`

- Create Job Scheduler Service by executing the command in CLI of XSA system:

    `xs cs jobscheduler default shine-scheduler`

- Create Auditlog service by executing the following command:   

    `xs cs auditlog free shine-auditlog`

- Create HANA Secure store service by executing the following command:   

    `xs cs hana securestore secureStore`    

- Create SAPUI5 broker service by executing the following command:

    `xs cs sapui5_sb sapui5-1.71 sapui5-provider`

- Right click on Project, go to Project Settings in WebIDE -> Space -> select PROD and apply.

- You may need to set npm registry upstream link (in case of an error) which can be done in **SAP** space by `xs set-env di-local-npm-registry UPSTREAM_LINK http://registry.npmjs.org/` and then restarting the app "di-local-npm-registry".

Note: Before building the modules, the following two things have to be replaced in the mta.yaml:

a)	UAA Endpoint

b)	Controller Endpoint

For more details on how to do the above steps, please refer below:

   a)	**UAA Endpoint**: Please replace the UAA end point URL in line 245 of mta.yaml to your respective UAA end point URL which will be of the format :

   `http(s)://<host-name >:3<instance-number>32/ uaa-security`

   The domain-name here is the machine domain name.

   For example in HANA express the UAA endpoint can be https://hxehost:39032/uaa-security

   b)   **Controller Endpoint**: Please replace the controller end point URL in line 255 of the mta.yaml file to your respective XS controller end point.

   ` http(s)://<host name>:<xs controller port>`

   By default, the xs controller port is 3##30 where ## is the instance number

   Please Note, In HANAExpress VM install has default instance as 90, Binary install is a user-defined number.   
   This will install SHINE without FLP. Please follow the steps in the below section to deploy SHINE with FLP.

- 	After all these services are created, build user-db module and then core-db module until successfully built. In case of error, bump up a particular library or search for other solution. Then run all the modules one by one in order like core-node, core-xsjs, user-xsjs & web.

- On running the Web module as Web Application, choose the ‘launchpad/index.html’ if prompted.

- Click on "Check Prerequisites" button, generate Time Data and create Role Collections. The application will log off automatically. Don't login back just yet.

- Go to XSA Cockpit application, assign the role collection "SHINE_ADMIN" to your user.

- Now login back to shine web application to access all modules seamlessly.

## Deploy SHINE for XSA application with FLP  ##

After doing the above steps,

- Uncomment the site-web and site-content module code in mta.yaml
- Right click on the shine project folder and select Build.
- After successful build of the project, there will be a folder called **mta_archives** created in the workspace.
- Expand the folder and right click on the file **com.sap.refapps.shine_1.x.x.mtar** present inside and select Export.
- Once exported, transfer the mtar file to XSA system (a tool like Filezilla might help), then login to the XSA system via CLI.

- Choose some other space via `xs t -s <space-name>`.

- Create the UAA service similar to the Web IDE approach mentioned above:

    `xs create-service xsuaa space shine-uaa -c xs-security.json`

- Then deploy it using the following command:

    `xs deploy com.sap.refapps.shine_1.9.x.mtar`

   For more information on cloning, building, deploying etc. for XSA applications, see [SAP Web IDE for SAP HANA - Installation and  Upgrade Guide. ](https://help.sap.com/docs/SAP_HANA_PLATFORM/4505d0bdaf4948449b7f7379d24d0f0d/0a1c5d829a074a8a889acd2ace444042.html)

## Useful Tips

1. If you want to do a duplicate deployment in a different space then before creating mtar, change the schema name in mta.yaml under both shine-container and shine-user-container resources.

2. Undeploying an existing deployment can be done by obtaining its mta-id:-
    - `xs mtas`
    - `xs undeploy <mta-id> --delete-services`

## Troubleshooting

1. If the SHINE installation message fails with the message,
Error resolving merged descriptor properties and parameters: No configuration entries were found matching the filter specified in resource "sapui5-provider"
Install SAPUI5_FESV6 version 1.71 and reinstall SHINE.

2. If the build of any module fails with the error message that looks like:   
   **No compatible version found: @sap/jobs-client@1.1.1**

Then open the package.json of the module which failed and change the version of the library shown in the error message to one of the correct versions also mentioned in the error message.

You can also check the compatible versions of the libraries by right-clicking on the module and selecting “Show dependency updates”

## Support
For any question/clarification or report an issue in SHINE please [create issue](https://github.com/sap/hana-shine-xsa/issues/new/)

[SHINE XSA for HANA 2.0 SPS 08 Documentation ](https://help.sap.com/viewer/shine-xsa/2.0.06/en-US)

## License
[SAP SAMPLE CODE LICENSE AGREEMENT](LICENSE)