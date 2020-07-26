const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router(); //The express.Router class is used to create modular, mountable route handlers. A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.

dishRouter.use(bodyParser.json());//parsing the incoming JSON request into a JSON object and the data is available in "req.body" or the body of the request.

dishRouter.route('/') //When no paramter is mentioned in the URI ,i.e, URI points to '/dishes'. Then this route handler in executed.
.all((req,res,next) => { //this snippet means that this code will be executed first for any incoming request with any method
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next(); //Using next(), the modified "res" object with statusCode and Header will be propagated to all the methods which will operate on the same resource(which in this case is '/dishes')
})
.get((req,res,next) => { //"res" already has statusCode 200 and previously set header
    res.end("Will send all the dishes to you!");
})
.post((req,res,next) => {
    //"name" and "description" of the req.body is avaliable because the "body-parser" middleware has been used to already parse the request into a JSON object which conatins the key "name" and "description" and their corresponding values. This can be set using POSTMAN.
    res.end('Will add the dish: '+ req.body.name +' with details: '+ req.body.description);
})
.put((req,res,next) => {
    res.statusCode=403;
    res.end('Put operation not supported on /dishes');
})
.delete((req,res,next) =>{
    res.end("Deleting all the dishes!");
});

dishRouter.route('/:dishId') //When a paramter is mentioned in the URI ,i.e, URI points to '/dishes/:dishId'. Then this route handler in executed.
.all((req,res,next) => {
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();
})
.get((req,res,next) =>{
    res.end("Will send details of the dish: "+
    req.params.dishId+' to you!');
})
.post((req,res,next) => {
    res.statusCode=403;
    res.end('Post operation not supported on /dishes/'+ req.params.dishId);
})
.put((req,res,next) => {
    res.write('Updating the dish: '+req.params.dishId+'\n');
    res.end('Will update the dish: '+ req.body.name + ' with details '+ req.body.description);
})
.delete((req,res,next) =>{
    res.end("Deleting dish: "+req.params.dishId);
});

module.exports = dishRouter;