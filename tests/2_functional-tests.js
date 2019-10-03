/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server.js");
const mongoose = require("mongoose");
const Book = require("../models/book.js");
chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("Routing tests", () => {
    suite(
      "POST /api/books with title => create book object/expect book object",
      () => {
        test("Test POST /api/books with title", done => {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Moby Dick" })
            .end((err, res) => {
              assert.equal(res.status, 200, "response code should be 200");
              assert.isString(res.body.title, "title is a string");
              assert.property(res.body, "_id", "_id is returned");
              done();
            });
        });

        test("Test POST /api/books with no title given", done => {
          chai
            .request(server)
            .post("/api/books")
            .end((err, res) => {
              assert.equal(res.status, 400, "response code should be 400");
              assert.equal(
                res.text,
                "A title is required",
                'Assert response text is "A title is required"'
              );

              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", () => {
      test("Test GET /api/books", done => {
        chai
          .request(server)
          .get("/api/books")
          .end(function(err, res) {
            assert.equal(res.status, 200, "response code should be 200");
            assert.isArray(res.body, "response should be an array");
            assert.property(
              res.body[0],
              "commentcount",
              "Books in array should contain commentcount"
            );
            assert.property(
              res.body[0],
              "title",
              "Books in array should contain title"
            );
            assert.property(
              res.body[0],
              "_id",
              "Books in array should contain _id"
            );
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", () => {
      test("Test GET /api/books/[id] with id not in db", done => {
        chai
          .request(server)
          .get("/api/books/5d960bd02e101d7781af1f46")
          .end((err, res) => {
            assert.equal(res.status, 400, "response code should be 400");
            assert.equal(
              res.text,
              "no book exists",
              'response should be "no book exists"'
            );
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function(done) {
        const randomTitle = "adjfhjlsadfkkdsfjh;asdfl";
        const newBook = new Book({ title: randomTitle });
        newBook.save((err, savedBook) => {
          chai
            .request(server)
            .get(`/api/books/${newBook._id}`)
            .end((err, res) => {
              assert.equal(res.status, 200, "status should be 200");
              assert.isString(
                res.body.title,
                "Book returned should contain title"
              );
              assert.equal(
                res.body._id,
                newBook._id,
                "Book returned should contain _id of new Book"
              );
              assert.isArray(
                res.body.comments,
                "Returned Book should have comments array"
              );
              res.body.comments.forEach(comment => assert.isString(comment));
              done();
            });
        });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      () => {
        test("Test POST /api/books/[id] with comment", done => {
          const randomTitle = "adjfhjlsadfkkdsfjh;asdfl";
          const newBook = new Book({ title: randomTitle });
          newBook.save((err, savedBook) => {
            chai
              .request(server)
              .post(`/api/books/${newBook._id}`)
              .send({ comment: "my super cool comment" })
              .end((err, res) => {
                const comments = res.body.comments;
                assert.equal(res.status, 200, "status should be 200");
                assert.equal(
                  res.body.title,
                  randomTitle,
                  `Book returned should contain title of new book: ${randomTitle}`
                );
                assert.equal(
                  res.body._id,
                  newBook._id,
                  "Book returned should contain _id of new book"
                );
                assert.isArray(
                  comments,
                  "Returned Book should have comments array"
                );
                assert.equal(
                  comments[comments.length - 1],
                  "my super cool comment",
                  "last comment should be 'my super cool comment'"
                );
                assert.equal(
                  res.body._id,
                  newBook._id,
                  "returned _id should match new book"
                );
                comments.forEach(comment => assert.isString(comment));

                done();
              });
          });
        });

        test("Test POST /api/books/[id] with wrong _id", done => {
          const invalidId = mongoose.Types.ObjectId();
          chai
            .request(server)
            .post(`/api/books/${invalidId}`)
            .send({ comment: "my super cool comment2" })
            .end((err, res) => {
              assert.equal(res.status, 400, "status should be 400");
              assert.isString(
                res.text,
                "no book exists",
                "Response should be 'no book exists'"
              );
              done();
            });
        });
      }
    );

    suite(
      "DELETE /api/books/[id] => delete book/expect book object with id",
      () => {
        test("Test DELETE /api/books/[id] with invalid id", done => {
          const invalidId = mongoose.Types.ObjectId();
          chai
            .request(server)
            .delete(`/api/books/${invalidId}`)
            .end((err, res) => {
              assert.equal(res.status, 400, "response should be 400");
              assert.isString(
                res.text,
                "no book exists",
                "Response should be 'no book exists'"
              );
              done();
            });
        });

        test("Test POST /api/books/[id] with valid _id", done => {
          const randomTitle = "adjfhjlsadfkkdsfjh;asdfl";
          const newBook = new Book({ title: randomTitle });
          newBook.save((err, savedBook) => {
            chai
              .request(server)
              .delete(`/api/books/${newBook._id}`)
              .end((err, res) => {
                const { _id: deletedId, title: deletedTitle } = res.headers;
                assert.equal(res.status, 200, "status should be 200");
                assert.isString(
                  res.text,
                  "delete successful",
                  "Response should be 'delete successful'"
                );
                assert.equal(
                  deletedId,
                  newBook._id,
                  "id of deleted book should match id of new book"
                );
                assert.equal(
                  deletedTitle,
                  randomTitle,
                  "title of deleted book should match title of new book"
                );
                done();
              });
          });
        });
      }
    );

        suite("DELETE /api/books => delete library", () => {
          test("Test DELETE /api/books", done => {
            chai
              .request(server)
              .delete("/api/books")
              .end((err, res) => {
                assert.equal(res.status, 200, "response should be 200");
                assert.isString(
                  res.text,
                  "complete delete successful",
                  "Response should be 'complete delete successful'"
                );
                done();
              });
          });
        });
  });
});
