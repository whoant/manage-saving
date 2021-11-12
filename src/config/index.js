require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    MONGODB: process.env.MONGODB,
    KEY_HASH: process.env.KEY_HASH
}