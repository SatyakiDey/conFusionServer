const express = require('express');
const bodyParser = require('body-parser');

//const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');

const dishRouter = express.Router(); //The express.Router class is used to create modular, mountable route handlers. A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.

dishRouter.use(bodyParser.json());//parsing the incoming JSON request into a JSON object and the data is available in "req.body" or the body of the request.

dishRouter.route('/') //When no paramter is mentioned in the URI ,i.e, URI points to '/dishes'. Then this route handler in executed.
/*.all((req,res,next) => { //this snippet means that this code will be executed first for any incoming request with any method
    res.statusCode=200;
    res.setHeader('Content-Type','text/plain');
    next(); //Using next(), the modified "res" object with statusCode and Header will be propagated to all the methods which will operate on the same resource or endpoint(which in this case is '/dishes')
})*/
.get((req,res,next) => { //"res" already has statusCode 200 and previously set header

    //res.end("Will send all the dishes to you!");
    Dishes.find({})
    .populate('comments.author')
    .then((dishes) => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);//returning json document
    },
    (err) => next(err)) //when the promise is resolved, first call back function with parameter "dishes" is executed. When promise is rejected the second call back function with parameter "err" is executed.
    .catch((err) => next(err)); //this is executed when the resolved part of the ".then()"(or the callaback function with "dishes" parameter) throws any error.
})
.post( authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
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
.put(authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode=403;
    res.end('Put operation not supported on /dishes');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{
    //res.end("Deleting all the dishes!");
    //authenticate.verifyAdmin(req.user, next);
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
    .populate('comments.author')
    .then((dish) => {
        console.log('Dish Created ',dish);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },
    (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next) => {
    res.statusCode=403;
    res.end('Post operation not supported on /dishes/'+ req.params.dishId);
})
.put(authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
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
.delete(authenticate.verifyUser, (req,res,next) =>{
    //res.end("Deleting dish: "+req.params.dishId);
    /*var admin = authenticate.verifyAdmin(req.user);
    if(admin)
        next();
    else
        next(err);*/
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
    .populate('comments.author')
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
.post(authenticate.verifyUser, (req,res,next) => {

    Dishes.findById(req.params.dishId)
   .then((dish) => {
    if(dish != null)
    {
        req.body.author = req.user._id; //setting the "author" field of the request body with the id of the user, that has been set after the user is succesfully authenticated. Everytime the ".populate()" method is called with the path 'comments.author' the objectId of the loggedin user will be stored in the author filed of the 'comments[]' and will be populated by the user.
        dish.comments.push(req.body);
        dish.save()
        .then((dish) => {
            Dishes.findById(dish._id)
                .populate('comments.author')//This means that populate the author field of the comments sub-document array of the dish object that has been recieved after execution of th sub array, referencing to the objectid that has been set in the request body.
                .then((dish) => {
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish);
        })
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
.put(authenticate.verifyUser, (req,res,next) => {
    res.statusCode=403;
    res.end('Put operation not supported on /dishes/' + req.params.dishId + '/comments');
})
.delete(authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) =>{

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
    .populate('comments.author')
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
.post(authenticate.verifyUser, (req,res,next) => {
    res.statusCode=403;
    res.end('Post operation not supported on /dishes/'+ req.params.dishId + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req,res,next) => {
    
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        id1=dish.comments.id(req.params.commentId).author;
        id2=req.user._id;
        if(dish != null && dish.comments.id(req.params.commentId) != null && id1.equals(id2))
        {
            if(req.body.rating){ //if the update parameter has a new rating
                dish.comments.id(req.params.commentId).rating = req.body.rating; //to update a specific parameter of a subdocument "$set: updateValue" cannot be used. In such case, this way of updating has to be adopted.
            }
            if(req.body.comment){ //if the update parameter has a new comment
                dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comment.author')
                .then((dish) => {
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish);
                })
            },
            (err) => next(err));
        }
        else if(dish == null){
            err = new Error('Dish '+ req.params.dishId +' not found');
            err.status = 404;
            return next(err);
        }
        else if(!id1.equals(id2)){
            err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        else{
            new Error('Comment '+ req.params.commentId +' not found');
        }
    },
    (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req,res,next) =>{

    Dishes.findById(req.params.dishId)
    .then((dish) => {
        id1=dish.comments.id(req.params.commentId).author;
        id2=req.user._id;
        if(dish != null && dish.comments.id(req.params.commentId) != null && id1.equals(id2))
        {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comment.author')
                .then((dish) => {
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish);
                })
            },
            (err) => next(err))
        }
        else if(dish == null){
            err = new Error('Dish '+ req.params.dishId +' not found');
            err.status = 404;
            return next(err);
        }
        else if(!id1.equals(id2)){
            err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
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