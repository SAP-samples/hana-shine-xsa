# server.py

from cfenv import AppEnv
from sap.cf_logging import flask_logging
from flask import abort,Flask,send_file,request,g
from hdbcli import dbapi
import logging
from openpyxl import Workbook
import os
import check
from io import BytesIO
from sap import xssec

app = Flask(__name__)
env = AppEnv()

env_port = os.getenv("PORT")
port = int(os.environ.get('PORT', 3000))

hana = env.get_service(label='hana')
uaa_credentials = env.get_service(name='shine-uaa').credentials

flask_logging.init(app, logging.INFO)

@app.before_request
def before_request():
    g._uaa_credentials = uaa_credentials 

# Define get_po_work_list_data() function to query the HANA DB to get the
# Purchase Order data and creating the workbook
def get_po_work_list_data():
    # Getting the HANA DB Connection
    conn = dbapi.connect(address=hana.credentials['host'], port=int(hana.credentials['port']),
                         user=hana.credentials['user'], password=hana.credentials['password'],
                         CURRENTSCHEMA=hana.credentials['schema'])
    # Creating cursor()
    cursor = conn.cursor()
    # Define the query to select the Purchase Order Table
    query = "SELECT FROM PO.Item { PURCHASEORDERID , PURCHASEORDERITEM , PRODUCT.PRODUCTID , GROSSAMOUNT}"
    # Execute the query
    cursor.execute(query, {})
    # Creating the Workbook()
    workbook = Workbook()
    worksheet=workbook.active
    # Appending the Worksheet Column Headers
    worksheet.append(('PurchaseOrderItemId', 'ItemPos', 'ProductID', 'Amount'))
    # Iterating the ResultSet
    for row in cursor.fetchall():
        po = (
            row['PURCHASEORDERID'],
            row['PURCHASEORDERITEM'],
            row['PRODUCTID'],
            str(row['GROSSAMOUNT'])  # decimal doesn't get serialised
        )
        # Appending the row into Worksheet
        worksheet.append(po)
    # Close cursor
    cursor.close()
    # Close DB Connection
    conn.close()
    out = BytesIO()
    workbook.save(out)
    out.seek(0)
    return out

# Define home() function to print the default service / welcome message
@app.route('/')
def home():
    return 'Simple Python service to generate Excel for PO List from Hana DB'

# Define download_purchase_order_excel() function for downloading the excel
# This service function can be accessed as a rest service '/excel'
@app.route('/excel')
@check.authenticated
def download_purchase_order_excel():
    logger = logging.getLogger('cli.logger')
    logger.info('Generating WorkBook')
    
    # Calling send_file() function defined in Flask and passing the parameters 
    # file/file_path, mimetype,attachment_filename,as_attachment
    # get_po_work_list_data() function passed as first parameter which will return the file
    return send_file(get_po_work_list_data(), mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     attachment_filename='PurchaseOrder.xlsx', as_attachment=True)


if __name__ == '__main__':
    app.run(port=port)

