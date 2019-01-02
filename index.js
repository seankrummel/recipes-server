'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');
const {router: usersRouter} = require('./users');

const app = express();

app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
  skip: (req, res) => process.env.NODE_ENV === 'test'
}));
app.use(cors({origin: CLIENT_ORIGIN}));

app.use('/api/users', usersRouter);

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
