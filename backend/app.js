const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const router = require("./routes/userRoutes");
const fileUpload = require('express-fileupload');

app.set('trust proxy', true);

app.use(cors({
    origin: ['https://hotel-management-2-03dr.onrender.com', 'http://localhost:3000', 'https://hotel-management-sepia-eight.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(fileUpload({ useTempFiles: true })); 
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api/v1", router);

module.exports = app;