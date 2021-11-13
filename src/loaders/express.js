const express = require("express");
const route = require('../routes');
module.exports = app => {

    app.use(express.urlencoded({extended: true}));
    app.use(express.json());
    route(app);
    app.all('*', (req, res, next) => {
        res.sendStatus(400);
    });
};