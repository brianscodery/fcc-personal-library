/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const mongoose = require("mongoose");
const Book = require("../models/book.js");

module.exports = async app => {
  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    dbName: "fccAdvancedNode"
  };
  const connection = mongoose.connect(process.env.DB, options, err => {
    if (err) {
      console.error(err);
    } else {
      console.log("DB connected swell-like");
    }
  });

  app
    .route("/api/books")
    .get(async (req, res) => {
      const books = await Book.find().catch(err => {
        throw err;
      });

      const resBooks = [];
      books.forEach(book => {
        resBooks.push({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        });
      });

      res.json(resBooks);
      return;
    })

    .post(async (req, res) => {
      const title = req.body.title;
      if (!title) {
        res.status(400).send("A title is required");
        return;
      }
      const existingBook = await Book.findOne({ title });
      if (existingBook) {
        res
          .status(200)
          .json({ title: existingBook.title, _id: existingBook._id });
        return;
      }
      const book = new Book({ title });
      const response = await book.save().catch(err => {
        console.error(err);
      });
      res.status(200).json({ title: book.title, _id: book._id });
      return;

      //response will contain new book object including atleast _id and title
    })

    .delete(async (req, res) => {
      const response = await Book.deleteMany();
    if(response.ok === 1){
      res.status(200).send('complete delete successful');
      return;
    }
  });

  app
    .route("/api/books/:id")
    .get(async (req, res) => {
      const bookId = req.params.id;
      const book = await Book.findById(bookId).catch(err => console.error(err));
      if (!book) {
        res.status(400).send("no book exists");
        return;
      }
      res
        .status(200)
        .json({ _id: bookId, title: book.title, comments: book.comments });
      return;
    })

    .post(async (req, res) => {
      const bookId = req.params.id;
      const comment = req.body.comment;
      const book = await Book.findByIdAndUpdate(
        bookId,
        { $push: { comments: comment } },
        { new: true, useFindAndModify: false, fields: "title _id comments" }
      );
      if (book) {
        res.status(200).json(book);
        return;
      } else {
        res.status(400).send("no book exists");
        return;
      }
    })

    .delete(async (req, res) => {
      const bookId = req.params.id;
      const response = await Book.findByIdAndDelete(bookId)
      .catch(err=>console.error(err));
      if(!response){
        res.status(400).send('no book exists');
      } else {
        res.status(200).set({_id: response._id, title: response.title}).send('delete successful');
      }
      //if successful response will be 'delete successful'
    });
};
