'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const schema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true}
});

schema.methods.serialize = function() {
  return {username: this.username};
};
schema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};
schema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', schema);
module.exports = {User};
