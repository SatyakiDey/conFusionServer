const express = require('express');
const bodyParser = require('body-parser');

const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        if(favorite == null) {
            err = new Error('You have no favorites!');
            err.statusCode = 404;
            return next(err);
        }
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(favorite);
    }, 
    (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(!favorite) {
            Favorites.create({user:req.user._id})
            .then((favorite) => {
                for(i in req.body){
                    favorite.dishes.push((req.body[i])._id);
                }
                favorite.save()
                .then((fav) => {
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fav);
            })
            })
        }

        else{
            for(i in req.body)
        {
            if(favorite.dishes.indexOf((req.body[i])._id)<0){
                favorite.dishes.push((req.body[i])._id);
            }
            
        } 
            favorite.save()
            .then((fav) => {
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(fav);
            })
        }
        
    }, 
    (err) => next(err))
    .catch((err) => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id})
            .then((result) => {
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(result);
    }, 
    (err) => next(err))
    .catch((err) => next(err))
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (!favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorite});
        }
        else {
            if (favorite.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorite});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorite});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(!favorite) {
            Favorites.create({user:req.user._id})
            .then((favorite) => {
                favorite.dishes.push(req.params.dishId);
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite);
            })
        }
        else{
             if(favorite.dishes.indexOf(req.params.dishId)<0)
                 favorite.dishes.push(req.params.dishId);
             favorite.save()
            .then((fav) => {
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(fav);
                        
            })
        }

    },
        (err) => next(err))
        .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if(!favorite) {
            err = new Error('You have no such favorite dish');
            err.statusCode = 404;
            return next(err);
        }
      else{
        favorite.dishes= favorite.dishes.filter((fav) => fav._id != req.params.dishId);
        favorite.save()
        .then((fav) => {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(fav);
        })
      }
    }, 
    (err) => next(err))
    .catch((err) => next(err))
});

module.exports= favoriteRouter;