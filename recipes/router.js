'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const {Recipe} = require('./models');
const {RecipeList} = require('../recipeLists/models');

router.use('/', passport.authenticate('jwt', {session: false, failWithError: true}));

// get all recipes
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  Recipe.find({userId}).sort({title: 'desc'})
    .then(results => res.json(results))
    .catch(err => next(err));
});
// get recipe by id
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Recipe.findOne({_id: id, userId})
    .then(result => {
      if (result) res.json(result);
      else next();
    }).catch(err => next(err));
});
// crete new recipe
router.post('/', (req, res, next) => {
  console.log(req.body);
  const {title, instructions, publicDoc} = req.body;
  let ingredients = req.body.ingredients; // not a constant, might be changing below w/ ingredients.map
  const userId = req.user.id;
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (ingredients) {
    if (!Array.isArray(ingredients)) {
      const err = new Error('The `ingredients` field must be an array');
      err.status = 400;
      return next(err);
    }
    let broken = false;
    ingredients = ingredients.map(ingredient => {
      if (!ingredient.ingredient || !ingredient.quantity) {
        const err = new Error('Each element of `ingredients` must contain ingredient and quantity properties');
        err.status = 400;
        next(err); // if I return next(err) here, then it'll just be pushed onto ingredientsList
        broken = true;
      }
      else return {ingredient: ingredient.ingredient, quantity: ingredient.quantity};
      // this makes sure that we have ingredient and quantity and no additional keys
    });
    if (broken) return;
  }

  const newRecipe = {title, ingredients, instructions, publicDoc, userId};
  Recipe.create(newRecipe)
    .then(result => res.location(`${req.originalUrl}/${result.id}`).status(201).json(result))
    .catch(err => next(err));
});
// update recipe
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  const toUpdate = {edited: true};
  const updatableFields = ['title', 'ingredients', 'instructions'];
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
    err.status = 400;
    return next(err);
  }
  if (toUpdate.ingredients) {
    if (!Array.isArray(toUpdate.ingredients)) {
      const err = new Error('The `ingredients` field must be an array');
      err.status = 400;
      next(err);
    }
    let broken = false;
    toUpdate.ingredients = toUpdate.ingredients.map(ingredient => {
      if (!ingredient.ingredient || !ingredient.quantity) {
        const err = new Error('Each element of `ingredients` must contain ingredient and quantity properties');
        err.status = 400;
        next(err);
        broken = true;
      }
      else return {ingredient: ingredient.ingredient, quantity: ingredient.quantity};
    });
    if (broken) return;
  }

  Recipe.findOneAndUpdate({_id: id, userId}, toUpdate, {new: true})
    .then(result => {
      if (result) res.json(result);
      else next();
    }).catch(err => next(err));
});
// delete recipe
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  // remove recipe from recipeLists before deleting the recipe. let user know a recipe on their list has been deleted.
  // it shouldn't be necessary to alert user if they delete their own recipe
  // RecipeList.updateMany({recipes: id, userId: {$not: userId}}, {$pull: {recipes: id}, recipeDeletedAlert: true})
  //   .then(() => RecipeList.updateMany({recipes: id, userId}, {$pull: {recipes: id}}))
  RecipeList.updateMany({recipes: id}, {$pull: {recipes: id}})
    .then(() => Recipe.findOneAndRemove({_id: id, userId}))
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = {router};
