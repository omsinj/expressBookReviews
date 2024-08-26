const express = require('express');
let books = require("./booksdb.js");
const e = require('express');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    
    if(!req.body.username)
        return res.send("Username is mandatory!")

    if(!req.body.password)
        return res.send("Password is mandatory!")

    let existingUser = users.filter(user => user.username === req.body.username);

    if(existingUser && existingUser.username)
        return res.send("ERROR! The user" + (' ')+ (req.body.username) + " already exist!")

    users.push({"username":req.body.username,"password":req.body.password});
    res.send("The user" + (' ')+ (req.body.username) + " Has been added!")
});


const getAllBooks = new Promise( (resolve, reject) => {
    try{
        const data = books;
        resolve(data)
    }catch(err){
        reject(err)
    }
})

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    //res.send(JSON.stringify({books},null,4));
    getAllBooks
        .then(
            (data) => res.send(JSON.stringify({data},null,4)),
            (err) => res.send("Error loading the books")
        )
});  

const getDetails = async (url) => {
    const req = await axios.get(url)
    req.then(resp => {
        return resp.data;
    })
    .catch(err => {
        return null;
    })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn; 
    //filter books by isbn
    //one or zero book should be found   
    //res.send(JSON.stringify(books[isbn],null,4));
    getDetails('http://invalid-url/isbn/' + isbn)
    .then(resp => {
        res.send(JSON.stringify(resp.data,null,4));
    })
    .catch(err => {
        return res.status(300).json({message: "Error retrieving book details"});
    })
 });
  
const getBooksByAuthor = (author) => {
    return new Promise( (resolve, reject) => {
        try{
            let books_filtered = Object.values(books).filter(book => book.author.toLowerCase().includes(author));
            resolve(books_filtered)
        }catch(err){
            reject(err)
        }
    })
}
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author ? req.params.author.toLowerCase() : '';   ; 
    //filter books by author
    //more than one book could be found 

    //Obtain all the keys for the ‘books’ object and Iterate through the ‘books’ array & check the author
    //Better if we Iterate through values
    //let filtered_books = Object.values(books).filter(book => book.author.includes(author))
    //res.send(JSON.stringify(filtered_books,null,4));
    getBooksByAuthor(author)
    .then(
        (data) => res.send(JSON.stringify(data,null,4)),
        (err) => res.status(300).json({message: "Error retrieving book details"})
    )
});

const getBooksByTitle = (title) => {
    return new Promise( (resolve, reject) => {
        try{
            let books_filtered = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
            resolve(books_filtered)
        }catch(err){
            reject(err)
        }
    })
}
// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title ? req.params.title.toLowerCase() : '';   
    //filter books by author
    //more than one book could be found 
    //let filtered_books = Object.values(books).filter(book => book.title.toLowerCase().includes(title))
    //res.send(JSON.stringify(filtered_books,null,4));
    getBooksByTitle(title)
    .then(
        (data) => res.send(JSON.stringify(data,null,4)),
        (err) => res.status(300).json({message: "Error retrieving book details"})
    )
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let book = books[req.params.isbn]; 

    if(!book)
        return res.send({message: "Invalid isbn"}); 

    res.send(JSON.stringify(book.reviews,null,4));
});

module.exports.general = public_users;
