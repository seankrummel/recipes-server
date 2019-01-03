'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const schema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true}
});

schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});

// schema.methods.serialize = function() {
//   return {username: this.username};
// };
schema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};
schema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

module.exports = {User: mongoose.model('User', schema)};
