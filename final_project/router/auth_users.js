const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const registered_users = express.Router();

const users = [];

const isValid = (username) => {
  return users.every(user => user.username !== username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// Only registered users can log in
registered_users.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(401).json({ message: 'Error logging in. No username/password provided' });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).json({ message: 'User successfully logged in' });
  } else {
    return res.status(401).json({ message: 'Invalid Login. Check username and password' });
  }
});

registered_users.use('/auth/review/:isbn', (req, res, next) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: `The book is not found by ISBN: ${isbn}` });
  }
  next();
});

// Add a book review
registered_users.put('/auth/review/:isbn', (req, res) => {
  const username = req.session.authorization.username;
  const review = req.query.review;
  const book = books[req.params.isbn];

  if (!review) {
    return res.status(400).json({ message: 'Bad request. No review provided' });
  }

  const isNewReview = !book.reviews[username];
  book.reviews[username] = review;

  return res.status(200).json({ message: `Review was ${isNewReview ? 'added' : 'updated'}` });
});

// Delete a book review
registered_users.delete('/auth/review/:isbn', (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: 'Review deleted' });
});

module.exports.authenticated = registered_users;
module.exports.isValid = isValid;
module.exports.users = users;
