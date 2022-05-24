const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const app = express();

const { connectDatabase } = require('./src/config/initDatabase');
const PORT = process.env.PORT || 3000;

const router = require('./src/router');

app.use(require('cors')({
    origin: process.env.ORIGIN,
    credentials: true
}));

app.use(require('cookie-parser')());
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

app.use(router);

connectDatabase
    .then(() => {
        console.log('Database connection established');
        app.listen(
            PORT,
            () => console.log(`Server listening on port: ${PORT}`)
        );
    })
    .catch(err => console.log(err));