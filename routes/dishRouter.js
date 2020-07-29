const express = require('express');
const bodyParser = require('body-parser');

//const mongoose = require('mongoose');
const Dishes = require('../models/dishes');

const dishRouter = express.Router(); //The express.Router class is used to create modular, mountable route handlers. A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.

dishRouter.use(bodyParser.json());//parsing the incoming JSON request into a JSON object and the data is available in "req.body" or the body of the request.

dishRouter.route('/') //When no paramter is mentioned in the URI ,i.e, URI points to '/dishes'. Then this route handler in executed.
/*.all((req,res,next) => { //this snippet means that this code will be executed first for any incoming request with any method
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next(); //Using next(), the modified "res" object with statusCode and Header will be propagated to all the methods which will operate on the same resource(which in this case is '/dishes')
})*/
.get((req,res,next) => { //"res" already has statusCode 200 and previously set header

    //res.end("Will send all the dishes to you!");
    Dishes.find({})
    .then((dishes) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);//returning json document
    },
    (err) => next(err)) //when the promise is resolved, first call back function with parameter "dishes" is executed. When promise is rejected the second call back function with parameter "err" is executed.
    .catch((err) => next(err)); //this is executed when the resolved part of the ".then()"(or the callaback function with "dishes" parameter) throws any error.
})
.post((req,res,next) => {
    //"name" and "description" of the req.body is avaliable because the "body-parser" middleware has been used to already parse the request into a JSON object which conatins the key "name" and "description" and their corresponding values. This can be set using POSTMAN.
   // res.end('Will add the dish: '+ req.body.name +' with details: '+ req.body.description);

   Dishes.create(req.body)
   .then((dish) => {
       console.log('Dish Created ',dish);
       res.statusCode=200;
       res.setHeader('Content-Type','application/json');
       res.json(dish); 
   },
   (err) => next(err))
   .catch((err) => next(err)); 
})
.put((req,res,next) => {
    res.statusCode=403;
    res.end('Put operation not supported on /dishes');
})
.delete((req,res,next) =>{
    //res.end("Deleting all the dishes!");

    Dishes.remove({})
    .then((resp) => {
       res.statusCode=200;
       res.setHeader('Content-Type','application/json');
       res.json(resp);
    },
    (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId') //When a paramter is mentioned in the URI ,i.e, URI points to '/dishes/:dishId'. Then this route handler in executed.
/*.all((req,res,next) => {
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next();
})*/
.get((req,res,next) =>{
    /*res.end("Will send details of the dish: "+
    req.params.dishId+' to you!');*/

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        console.log('Dish Created ',dish);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },
    (err) => next(err))
    .catch((err) => next(err));
})
.post((req,res,next) => {
    res.statusCode=403;
    res.end('Post operation not supported on /dishes/'+ req.params.dishId);
})
.put((req,res,next) => {
    /*res.write('Updating the dish: '+req.params.dishId+'\n');
    res.end('Will update the dish: '+ req.body.name + ' with details '+ req.body.description);*/

    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set : req.body
    },
    { new : true }) //if true, return the modified document rather than the original. 
    .then((dish) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },
    (err) => next(err))
    .catch((err) => next(err));
})
.delete((req,res,next) =>{
    //res.end("Deleting dish: "+req.params.dishId);

    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
     },
     (err) => next(err))
     .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments') //subdocument of a document endpoint indicated by URI following REST API 
.get((req,res,next) => { 

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish != null)
        {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish '+ req.params.dishId +' not found');
            err.status = 404;
            return next(err);
        }
    },
    (err) => next(err))
    .catch((err) => next(err)); 
})
.post((req,res,next) => {

    Dishes.findById(req.params.dishId)
   .then((dish) => {
    if(dish != null)
    {
        dish.comments.push(req.body);
        dish.save()
        .then((dish) => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        },
        (err) => next(err));
    }
    else {
        err = new Error('Dish '+ req.params.dishId +' not found');
        err.status = 404;
        return next(err);
    }
   },
   (err) => next(err))
   .catch((err) => next(err));  
})
.put((req,res,next) => {
    res.statusCode=403;
    res.end('Put operation not supported on /dishes/' + req.params.dishId + '/comments');
})
.delete((req,res,next) =>{

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish != null)
        {
            for (var i= (dish.comments.length -1) ; i>=0;i--)
            {
              dish.comments.id(dish.comments[i]._id).remove(); //"dish.comments.id(id_to_be_searched)" is used to search a specific subdocument(for a particular comment by it's id) in a document(dish) of a collection (dishes)
            }
        dish.save()
        .then((dish) => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        },
        (err) => next(err))
        }
        else {
            err = new Error('Dish '+ req.params.dishId +' not found');
            err.status = 404;
            return next(err);
        }
    },
    (err) => next(err))
    .catch((err) => next(err));
});

dishRouter.route('/:dishId/comments/:commentId') 
.get((req,res,next) =>{

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish != null && dish.comments.id(req.params.commentId) != null)
        {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if(dish == null){ 
            err = new Error('Dish '+ req.params.dishId +' not found');
            err.status = 404;
            return next(err);
        }
        else{
            new Error('Comment '+ req.params.commentId +' not found');
        }
    },
    (err) => next(err))
    .catch((err) => next(err));
})
.post((req,res,next) => {
    res.statusCode=403;
    res.end('Post operation not supported on /dishes/'+ req.params.dishId + '/comments/' + req.params.commentId);
})
.put((req,res,next) => {

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish != null && dish.comments.id(req.params.commentId) != null)
        {
            if(req.body.rating){ //if the update parameter has a new rating
                dish.comments.id(req.params.commentId).rating = req.body.rating; //to update a specific parameter of a subdocument "$set: updateValue" cannot be used. In such case, this way of updating has to be adopted.
            }
            if(req.body.comment){ //if the update parameter has a new comment
                dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save()
            .then((dish) => {
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            },
            (err) => next(err));
        }
        else if(dish == null){
            err = new Error('Dish '+ req.params.dishId +' not found');
            err.status = 404;
            return next(err);
        }
        else{
            new Error('Comment '+ req.params.commentId +' not found');
        }
    },
    (err) => next(err))
    .catch((err) => next(err));
})
.delete((req,res,next) =>{

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish != null && dish.comments.id(req.params.commentId) != null)
        {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            },
            (err) => next(err))
        }
        else if(dish == null){
            err = new Error('Dish '+ req.params.dishId +' not found');
            err.status = 404;
            return next(err);
        }
        else{
            new Error('Comment '+ req.params.commentId +' not found');
        }
     },
     (err) => next(err))
     .catch((err) => next(err));
});

module.exports = dishRouter;