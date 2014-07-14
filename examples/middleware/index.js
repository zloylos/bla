var app = require('express')();
var apiMiddleware = require('../../lib/middleware');

app
    .use('/api/:method?', apiMiddleware(__dirname + '/../api/**/*.api.js'))
    .listen(8080);

console.log('Go to http://127.0.0.1:8080/api/ and choose any available API method.');