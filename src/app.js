const config = require('./config');
const express = require('express');

const loaders = require('./loaders');
const app = express();
const PORT = config.PORT || 3001;

loaders(app);

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
