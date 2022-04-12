const express = require('express');

const envVariables = require('./config/env-variables.json');

const app = express();

app.listen(
    envVariables[process.env['NODE_ENV']].PORT,
    () => console.log(`Server listening on port: ${envVariables[process.env['NODE_ENV']].PORT}`)
);