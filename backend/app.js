const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const router = require("./routes/userRoutes");

app.set('trust proxy', true);

// Set up CORS
app.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));

app.use(fileUpload({ useTempFiles: true }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", router);

module.exports = app;
