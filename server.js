'use strict';

// DEPENDENCIES
const express = require('express');
const superagent = require('superagent');

// START APPLICATION
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// ROUTES
app.get('/', homeHandler);
app.post('/newSearches', searchHandler);

// CATCH-ALL
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// HANDLER FUNCTIONS
// FUNCTION FOR SEARCH PAGE
function homeHandler(req, res) {
  res.status(200).render('pages/searches/new')
    .catch(() => {
      handleError(res);
    });
}

// FUNCTION FOR SEARCH RESULTS PAGE
function searchHandler(req, res) {

  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  if (req.body.keyword === 'title') {
    url += `+intitle:${req.body.search}`;
  }

  if (req.body.keyword === 'author') {
    url += `+inauthor:${req.body.search}`;
  }

  superagent.get(url)
    .then(value => {
      console.log('value.body >>>>>>>>> ', value.body.items);
      const bookData = value.body.items;
      const books = bookData.map(value => {
        return new Book(value);
      });
      console.log('superagent up and running');
      res.status(200).render('pages/results', { data: books });
    })
    .catch(() => {
      handleError(res);
    });
}

function handleError(res){
  return res.status(500).render('pages/error');
}

// CONSTRUCTORS
function Book(data) {
  this.title = data.volumeInfo.title;
  this.author = data.volumeInfo.authors;
  this.description = data.volumeInfo.description
  this.thumbnail = data.volumeInfo.imageLinks.thumbnail || null;
}

// PORT LISTENING
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
