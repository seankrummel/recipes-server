'use strict';
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {type: String, required: true},
  ingredients: [{ingredient: String, quantity: Number}],
  instructions: String,
  publicDoc: {type: Boolean, default: true},
  edited: {type: Boolean, default: false},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

schema.set('timestamps', true);
schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  }
});

module.exports = {Recipe: mongoose.model('Recipe', schema)};
