'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {PORT, CLIENT_ORIGIN} = require('./config');

const app = express();

app.use(morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
  skip: (req, res) => process.env.NODE_ENV === 'test'
}));
app.use(cors({origin: CLIENT_ORIGIN}));

function runServer(port = PORT) {
  const server = app.listen(port, () => console.info(`App listining on port ${server.address().port}`))
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  runServer();
}

module.exports = {app};
