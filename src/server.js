const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const app = express();

const { connectDatabase } = require('./config/initDatabase');
const PORT = process.env.PORT || 3000;

const router = require('./router');

app.use(require('cors')());
app.use(require('cookie-parser')());
app.use(express.json());
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
