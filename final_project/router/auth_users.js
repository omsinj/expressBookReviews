const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    let existingUser = users.filter((user)=>{ return user.username === username });
    return existingUser.length > 0;
}

const authenticatedUser = (username,password)=>{ 
    let validUsers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });    
    return validUsers.length > 0;
}

regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;  

  if (!username || !password) 
      return res.status(404).json({message: "Error logging in"});
  
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: {username: username, password: password}}, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username};    
    return res.status(200).send({accessToken: accessToken});
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
// Hint: You have to give a review as a request query & it must get posted with 
// the username  (stored in the session) posted
// review as a request query (but PUT request)?? something is not clear here
regd_users.put("/auth/review/:isbn", (req, res) => {
  let book = books[req.params.isbn];
  let username = req.user.data.username;
  if(!book)
        return res.status(300).json({message: "Unable to find the book"});

   if(!req.body.comment)
        return res.status(300).json({message: "Review should be provided"});

    book.reviews[username] = req.body.comment; 
   
   res.send("The review on book " + (' ')+ (req.params.isbn) + " has been added!")    
});

regd_users.delete("/auth/review/:isbn", (req, res) => {   
    let book = books[req.params.isbn];
    let username = req.user.data.username;
    if(!book)
        return res.status(300).json({message: "Unable to find the book"});
    
    delete book.reviews[username]; 

    return res.status(200).json({message: "Book review removed successful"});
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
