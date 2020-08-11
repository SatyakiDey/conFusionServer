const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); //specifying the directory on the server where the file will be stored. Setting the error paramter of the callback function to null.
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname) //setting the name of the file to be the same name as the one uploaded.
    }
});

const imageFileFilter = (req, file, cb) => { //filtering the files uploaded.
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { //allowing only image file extensions to be uploaded.
        return cb(new Error('You can upload only iamge files!'), false); //returning an error uisng the first parameter of the callback function.
    }
    else{
        cb(null, true);
    }
};

const upload = multer({storage: storage, fileFilter: imageFileFilter}); //used to parse multi-part form data using boundary. You will have a content type set to multipart/form-data. And then also a boundary value set up. The boundary separates the multiple parts of the request body. So the request body itself of the outgoing request message will be divided into multiple parts. And each part will be delineated from the previous part by by using the boundary .

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
 })
.get(cors.cors, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode=403;
    res.end('Get operation not supported on /imageUpload');
})
.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode=403;
    res.end('Put operation not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode=403;
    res.end('Delete operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, upload.single('imageFile'), (req,res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json(req.file); //returning the details of the uploaded file along with the path where the file that has been stored in the server.
});

module.exports = uploadRouter;