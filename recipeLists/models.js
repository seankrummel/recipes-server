'use strict';
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {type: String, required: true},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  recipes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'}],
  recipeDeletedAlert: {type: Boolean, default: false}
});

schema.index({title: 1, userId: 1}, {unique: true});

schema.set('timestamps', true);
schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  }
});

module.exports = {RecipeList: mongoose.model('RecipeList', schema)};
