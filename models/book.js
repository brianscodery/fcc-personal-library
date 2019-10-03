const mongoose = require('mongoose');


const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  comments: {
    type: [String],
    default: []
  },
  commentcount: {
    type: Number,
    required: false
  }
});

const Book = mongoose.model('book', BookSchema);

module.exports = Book;