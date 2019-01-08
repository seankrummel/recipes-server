'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');
const {router: usersRouter} = require('./users');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');
const {router: recipesRouter} = require('./recipes');
// console.log(require('./recipes'));
const {router: recipeListsRouter} = require('./recipeLists');

const app = express();
const jsonParser = bodyParser.json();

app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
  skip: (req, res) => process.env.NODE_ENV === 'test'
}));
app.use(cors({origin: CLIENT_ORIGIN}));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(jsonParser);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/lists', recipeListsRouter);

function runServer(port = PORT) {
  const server = app.listen(port, () => console.info(`App listining on port ${server.address().port}`))
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = {app};
