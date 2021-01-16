' use strict '

// DEPENDENCIES
const express = require('express');
require('dotenv').config();

// START APPLICATION
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.get('/', homeHandler);
app.post('/contact', contactHandler);

// HANDLERS FUNCTIONS
function homeHandler(request, response) {
  response.status(200).sendFiles('./index.html');
}

function contactHandler(request, response) {
  console.log('Contact Route!');
  console.log('request.body.first_name>>' , request.body);
  response.status(200).json('Thank You!');
}

// PORT LISTEN
app.listen(PORT, () => console.log(`now listening on port ${PORT}`));

