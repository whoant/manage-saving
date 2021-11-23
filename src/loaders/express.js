const express = require("express");
const methodOverride = require('method-override');
const path = require('path');

const route = require('../routes');
module.exports = app => {

    app.use(express.urlencoded({extended: true}));
    app.use(express.json());
    
    app.use(methodOverride('_method'));
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, '../', 'views'));

    app.use(express.static(path.join(__dirname, '../', 'public')));
    app.use('/css', express.static(path.join(__dirname, '../', 'public', 'css')));

    route(app);
    app.all('*', (req, res, next) => {
        res.sendStatus(400);
    });
};