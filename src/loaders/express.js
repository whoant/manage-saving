const express = require("express");
module.exports = app => {

    app.use(express.urlencoded({extended: true}));

    app.all('*', (req, res, next) => {
        res.sendStatus(400);
    });
};