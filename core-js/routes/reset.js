const express = require('express');
const util = require('./util');
const router = express.Router();

router.get('/reset/soheader', (req, res) => {
    util.resetTable(
        req, 
        res,
        "SO.Header", 
        "SOShadow.Header",
        util.callback
    );
});

router.get('/reset/soitem', (req, res) => {
    util.resetTable(
        req, 
        res,
        "SO.Item", 
        "SOShadow.Item",
        util.callback
    );
});

router.get('/reset/poheader', (req, res) => {
    util.resetTable(
        req, 
        res,
        "PO.Header", 
        "POShadow.Header",
        util.callback
    );
});

router.get('/reset/poitem', (req, res) => {
    util.resetTable(
        req, 
        res,
        "PO.Item", 
        "POShadow.Item",
        util.callback
    );
});

router.get('/reset/addresses', (req, res) => {
    util.resetTable(
        req, 
        res,
        "MD.Addresses", 
        "MDShadow.Addresses",
        util.callback
    );
});

router.get('/reset/partners', (req, res) => {
    util.resetTable(
        req, 
        res,
        "MD.BusinessPartner", 
        "MDShadow.BusinessPartner",
        util.callback
    );
});

router.get('/reset/employees', (req, res) => {
    util.resetTable(
        req, 
        res,
        "MD.Employees", 
        "MDShadow.Employees",
        util.callback
    );
});

router.get('/reset/products', (req, res) => {
    util.resetTable(
        req, 
        res,
        "MD.Products", 
        "MDShadow.Products",
        util.callback
    );
});

router.get('/reset/constants', (req, res) => {
    util.resetTable(
        req, 
        res,
        "Util.Constants", 
        "UtilShadow.Constants",
        util.callback
    );
});

router.get('/reset/texts', (req, res) => {
    util.resetTable(
        req, 
        res,
        "Util.Texts", 
        "UtilShadow.Texts",
        util.callback
    );
});

router.get('/reset/notes', (req, res) => {
    util.resetTable(
        req, 
        res,
        "Util.Notes", 
        "UtilShadow.Notes",
        util.callback
    );
});

router.get('/reset/attachments', (req, res) => {
    util.resetTable(
        req, 
        res,
        "Util.Attachments", 
        "UtilShadow.Attachments",
        util.callback
    );
});

module.exports = router;