const express = require("express");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { flash } = require("express-flash-message");

const path = require("path");

const route = require("../routes");
const { SESSION_SECRET } = require("../config");

module.exports = (app) => {

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.use(methodOverride("_method"));
    app.set("view engine", "pug");
    app.set("views", path.join(__dirname, "../", "views"));
    app.use(cookieParser(SESSION_SECRET));
    app.use(
        session({
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
            }
        })
    );
    
    app.use(flash({ sessionKeyName: "flashMessage" }));
    route(app);
    app.use(express.static(path.join(__dirname, "../", "public")));

    app.all("*", (req, res, next) => {
        res.send("ERROR");
    });
};
