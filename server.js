' use strict '

// DEPENDENCIES
const express = require('express');
require('dotenv').config();
const superagent = require('superagent');

// START APPLICATION
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.get('/', homeHandler);
app.post('/contact', contactHandler);
app.post('/searches', createSearch);

// CATCH-ALL
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// HANDLER FUNCTIONS
function homeHandler(request, response) {
  response.status(200).sendFiles('./index.html');
}

function contactHandler(request, response) {
  console.log('Contact Route!');
  console.log('request.body.first_name>>' , request.body);
  response.status(200).json('Thank You!');
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
  .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
  .then(results => response.render('pages/show', { searchResults: results }));
}

// CONSTRUCTORS
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  this.title = info.title || 'No title available';
}


// PORT LISTEN
app.listen(PORT, () => console.log(`now listening on port ${PORT}`));