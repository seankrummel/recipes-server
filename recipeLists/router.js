'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const {RecipeList} = require('./models');
const {Recipe} = require('../recipes');

router.use('/', passport.authenticate('jwt', {session: false, failWithError: true}));

// get all lists
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  // don't need to populate recipes on the get all because we're only trying to access the title, rating, and id when we
  // access this endpoint on the client
  // should it be sorted by updatedAt or rating? <- default sorting only, as a stretch goal I'd like to implement
  // user-defined filters/sorting
  RecipeList.find({userId}).sort({updatedAt: 'desc'})
    .then(results => res.json(results))
    .catch(err => next(err));
});
// get list by id
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  // this one should be populated, because we want all the data when getting a specific list
  RecipeList.findOne({_id: id, userId})
    .populate('recipes')
    .then(result => {
      if (result) res.json(result);
      else next();
    }).catch(err => next(err));
});
// create new list
router.post('/', (req, res, next) => {
  const{title, recipes} = req.body;
  const userId = req.user.id;
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (recipes) {
    if (!Array.isArray(recipes)){
      const err = new Error('The `recipes` field must be an array');
      err.status = 400;
      return next(err);
    }
    recipes.forEach(recipeId => {
      if (!mongoose.Types.ObjectId.isValid(recipeId)) {
        const err = new Error('The `recipes` array contains an invalid `id`');
        err.status = 400;
        return next(err);
      } else { // is this necessary? do I need to manually check that an id has a corresponding document or does
        // mongoose.Types.ObjectId.isValid() already do that?
        Recipe.findOne({_id: recipeId})
          .then(recipe => {
            if (!recipe) {
              const err = new Error('The `recipes` array contains an invalid `id`');
              err.status = 400;
              return next(err);
            }
          }).catch(err => next(err));
      }
    });
  }

  const newRecipeList = {title, recipes, userId};
  RecipeList.create(newRecipeList)
    .then(result => res.json(result))
    .catch(err => next(err));
});
// update list
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  const toUpdate = {};
  const updatableFields = ['title', 'recipes', 'recipeDeletedAlert']; // should title be an updatable field?
  updatableFields.forEach(field => {
    if (field in req.body) toUpdate[field] = req.body[field];
  });
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  if (toUpdate.title === '') {
    const err = new Error('Missing `title` in request body');
  }
  if (toUpdate.recipes) {
    if (!Array.isArray(toUpdate.recipes)) {
      const err = new Error('The `recipes` field must be an array');
      err.status = 400;
      return next(err);
    }
    toUpdate.recipes.forEach(recipeId => {
      if (!mongoose.Types.ObjectId.isValid(recipeId)) {
        const err = new Error('The `recipes` array contains an invalid `id`');
        err.status = 400;
        return next(err);
      } else {
        Recipe.findOne({_id: recipeId})
          .then(recipe => {
            if (!recipe) {
              const err = new Error('The `recipes` array contains an invalid `id`');
              err.status = 400;
              return next(err);
            }
          }).catch(err => next(err));
      }
    });
  }

  RecipeList.findOneAndUpdate({_id: id, userId}, toUpdate, {new: true})
    .then(result => {
      if (result) res.json(result);
      else next();
    }).catch(err => next(err));
});
// delete list
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.stauts = 400;
    return next(err);
  }

  RecipeList.findOneAndRemove({_id: id, userId})
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = {router};
