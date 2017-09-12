Exercise 03 : Deploy application to SAP Cloud Platform Cloud Foundry Environment
===============
## Estimated time

15 min

## Objective
In Chapter you will deploy the SHINE mtar to Cloud Foundry environment


## Exercise Description
### 1. Deploy SHINE application
1. Open Command Line Interface.
2. Navigate to the folder where you have copied SHINE mtar.
3. Set Cloud Foundry API via CLI by running below command
* if you have chosen Region for your Cloud Foundry instance as Europe (Frankfurt) AWS
 run command ` cf api https://api.cf.eu10.hana.ondemand.com` 
* if you have chosen Region for your Cloud Foundry instance as US East (VA) AWS
 run command ` cf api https://api.cf.us10.hana.ondemand.com` 
4. Login to Cloud Foundry by running below command.
` cf login`
5. On being prompted for Email enter email which was used for registering for SAP Cloud Platform Trial account and enter the password.
6. You will be logged into your Cloud Foundry org P*******trial_trial and space dev.  
![Alt text](./images/CF_login.jpg "CF Login")
7. Run the command `cf deploy com.sap.refapps.shine_1.3.10.mtar`
8. The deployment starts and within a few minutes the complete application get deployed.
9. After deployment run the command `cf apps` to see all the deployed apps.
10. Run command `cf services` to see all the backing service instances created.
11. Copy the url for the app `shine-web` and paste it in browser.  
![Alt text](./images/CF_Apps.jpg "CF Apps")
12. Login to this url with the SAP Cloud Platform User ID and password.

### 2. Explore SHINE application (optional)
1.  Click on Ok to close the Welcome popup.  
![Alt text](./images/SHINE_Welcome.jpg "SHINE Welcome")
2. SHINE Launchpad will be visible.
![Alt text](./images/Launchpad.jpg "Launchpad")
3. Click on the Data Generator Tile and explore the features.  
![Alt text](./images/Data_Generator.jpg "Data Generator")
4. Click on the Sales Dashboard tile and explore the tabs here.  
![Alt text](./images/Sales_Dashboard.jpg "Sales Dashboard")

## Summary
In this exercise you have deployed SHINE mtar to Cloud Foundry Environment and explored it.
