const express = require('express');

const envVariables = require('./config/env-variables.json');
const { connectDatabase } = require('./config/initDatabase');

const app = express();

app.use(express.json());

connectDatabase
    .then(() => {
        console.log('Database connection established');
        app.listen(
            envVariables[process.env['NODE_ENV']].PORT,
            () => console.log(`Server listening on port: ${envVariables[process.env['NODE_ENV']].PORT}`)
        );
    })
    .catch(err => console.log(err));
