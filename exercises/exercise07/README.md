Exercise 07 : Build updated SHINE application and deploy it
===============

## Estimated time

20 mins

## Objective
In this exercise you will build the SHINE application after extending it and redeploy it

## Exercise Description

### 1. Build SHINE application
1. In Web IDE click on shine-cf folder.
2. Open mta.yaml and change version from 1.3.10 to 1.3.11.  
![Alt text](./images/Update_MTA.jpg "Update MTA")
3. Click on Save button.
4. Right click on shine-cf folder and click on Build.
5. When the project is built an mtar is in the folder workspace->mta_archives->com.sap.refapps.shine->com.sap.refapps.shine_1.3.11.mtar.  
![Alt text](./images/Build.jpg "Build")
6. Right click on com.sap.refapps.shine_1.3.11.mtar and click on export and download it to your machines Desktop.

### 2. Deploy SHINE 
1. Open Command Line Interface.
2. Navigate to the folder where you have copied SHINE mtar, if its desktop, then `C:\Users\student\Desktop`.
3. Undeploy older version of SHINE, this can be done by running below command
` cf undeploy com.sap.refapps.shine -f --delete-services`
4. Wait for the undeploy to complete.
5  You will notice one by one the modules being undeployed and finally the backing services being deleted.
6. Run the command `cf deploy com.sap.refapps.shine_1.3.11.mtar` to deploy the updated version of SHINE application.
7. The deployment starts and within a few minutes the complete application gets deployed.
8. After deployment run the command `cf apps` to see all the deployed apps.
9. Run command `cf apps` to see all the backing service instances created.
10. Copy the url for the app shine-web and paste it in browser.  
![Alt text](./images/CF_Apps.jpg "CF Apps")
11. Login to this url with the SAP Cloud Platform User ID and Password.

### 3. Explore extended parts of application
1. Click on Ok to close the Welcome popup.
2. Click on the Sales Dashboard Tile.
3. A new tab called Search will be displayed.  
![Alt text](./images/Sales_Dashboard.jpg "Sales Dashboard")
4. Click on Search tile.  
![Alt text](./images/Search_Tab.jpg "Search Tab")
5. In Search filed enter any text like `Toko` or `Talp` and check the output.  
![Alt text](./images/Search_Tab_Results.jpg "Search Tab Results")
6. Fuzzy Search results will be displayed. 

## Summary
In this exercise you have deployed an extended version of SHINE mtar to Cloud Foundry Environment and explored it.
