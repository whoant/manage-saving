require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    DATABASE: {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_PASS: process.env.DB_PASS,
        DB_NAME: process.env.DB_NAME,
    },
    KEY_HASH: process.env.KEY_HASH,
    SESSION_SECRET: process.env.SESSION_SECRET,
};
