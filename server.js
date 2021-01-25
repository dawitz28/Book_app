'use strict';

// DEPENDENCIES
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const methodOverride = require('method-override');

require('dotenv').config();

// START OUR APPLICATION
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors() );

//CREATE MY DATABASE CONNECTION 
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', error => console.error(error));

// EXPRESS MIDDLEWARE
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

//SET THE VIEW ENGINE FOR SERVER-SIDE RENDERING
app.set('view engine', 'ejs');

// USE METHOD OVERRIDE
app.use(methodOverride('_method'));

// ROUTES
app.get('/', getBooks);
app.get('/books/:id', bookDetails);
app.post('/bookSearch', bookSearchHandler);
app.get('/newSearches', newSearchHandler); 
app.post('/books', booksHandler);
app.get('/edit/:id', editHandler);
app.put('/update/:id', updateHandler);
app.delete('/delete/:id', deleteHandler);

// CATCH-ALL
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// HANDLER FUNCTIONS

// EDIT HANDLER FUNCTION
function editHandler(req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1';
  let values = [req.params.id];

  client.query(SQL, values)
    .then(results => {
      let details = results.rows[0];
      res.status(200).render('pages/edit', { data: details});
    });
}

// DELETE HANDLER FUNCTION
function deleteHandler(req, res){
  let SQL = 'DELETE FROM books WHERE id= $1';
  let values = [req.params.id];

  client.query(SQL, values)
    .then(() => {
      res.status(200).redirect('/');
    });
}

// UPDATE HANDLER FUNCTION
function updateHandler(req, res) {
  let SQL = `UPDATE books
             SET title = $1, 
                author = $2,
                description = $3,
                thumbnail = $4, 
                isbn = $5, 
                bookshelf = $6 
             WHERE id=$7`;
  let safeValues = [req.body.title, req.body.author, req.body.description, req.body.thumbnail, req.body.isbn, req.body.bookshelf, req.body.id];

  client.query(SQL, safeValues)
    .then(() => {
      res.status(200).redirect('/');
    });
}

// FUNCTION FOR SEARCH PAGE
function getBooks(req, res) {
  let SQL = 'SELECT * FROM books';
  client.query(SQL)
    .then(results => {
      let databaseBooks = results.rows;
      res.status(200).render('pages/index', { data: databaseBooks });
    })
    .catch(err => {
      console.log(err);
    });

}

function bookDetails(req, res){
  // console.log(req.params);
  const SQL = 'SELECT * FROM Books WHERE id = $1';
  let values = [req.params.id];
  
  client.query(SQL, values)
  .then(results => {
    let details = results.rows[0];
    // console.log(details);
    res.status(200).render('pages/books/show', { data: details });
  })
  .catch(() => {
    handleError(res);
  }); 
}

function newSearchHandler(req, res) {
  res.status(200).render('pages/searches/new');
}

// FUNCTION FOR SEARCH RESULTS PAGE
function bookSearchHandler(req, res) {

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
        return new Book(value.volumeInfo);
      });
      console.log(books);
      res.status(200).render('pages/searches/results', { data: books });
    })
    .catch(() => {
      handleError(res);
    });
}

// FUNCTION FOR SAVING SELECTED BOOK TO FAVS LIST
function booksHandler(req, res) {
  let SQL = `INSERT INTO books
            (title, author, description, thumbnail, isbn, bookshelf)
            VALUES ($1, $2, $3, $4, $5, $6);`;
  let safeValues = [req.body.title, req.body.author, req.body.description, req.body.isbn, req.body.thumbnail, req.body.bookshelf];
  client.query(SQL, safeValues)
    .then(() => {
      console.log(`${req.body.title} has been added to your favorites list!`);
      res.status(200).redirect('/');
    });
}

// HANDLE ERRORS FUNCTION
function handleError(res){
  return res.status(500).render('pages/error');
}

// CONSTRUCTORS
function Book(data) {
  this.title = data.title;
  this.author = data.authors;
  this.description = data.description
  this.isbn = data.industryIdentifiers[0].identifier;
  this.thumbnail = data.imageLinks.thumbnail || null;
  this.bookshelf = data.categories;
}

// PORT LISTENING / START OUR SERVER 
client.connect()
.then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  });
})
