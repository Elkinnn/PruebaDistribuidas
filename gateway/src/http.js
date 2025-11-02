const axios = require('axios');
const config = require('./config');

const http = axios.create({
  timeout: config.http.timeoutMs
});

module.exports = http;



