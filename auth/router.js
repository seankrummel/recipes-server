'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY} = require('../config');

function createAuthToken(user) {
  return jwt.sign({user}, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
}

const localAuth = passport.authenticate('local', {session: false});
const jwtAuth = passport.authenticate('jwt', {session: false});

router.use(bodyParser.json());
router.post('/login', localAuth, (req, res) => res.json({authToken: createAuthToken(req.user.toJSON())}));
router.post('/refresh', jwtAuth, (req, res) => res.json({authToken: createAuthToken(req.user)}));

module.exports = {router};
