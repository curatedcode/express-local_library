const Genre = require("../models/genre");
const Book = require("../models/book")
const async = require("async")

const { body, validationResult } = require('express-validator')

// Display list of all Genre.
exports.genre_list = (req, res, next) => {
  Genre.find()
    .sort([["name", "ascending"]])
    .exec(function (err, genre_list){
      if(err){
        return next(err)
      }

      res.render("genre_list", {
        title: "Genre List",
        genre_list: genre_list
      })
    })
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback)
      },

      genre_books(callback){
        Book.find({ genre: req.params.id }).exec(callback)
      },
    },
    (err, results) => {
      if(err){
        return next(err)
      }
      if(results.genre === null){
        const err = new Error("Genre not found")
        err.status = 404
        return next(err)
      }
      
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books,
      })
    }
  )
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
  res.render('genre_form', { title: "Create Genre" })
};

// Handle Genre create on POST.
exports.genre_create_post = [
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req)

    const genre = new Genre({ name: req.body.name })

    if( !errors.isEmpty()){
      res.render('genre_form', {
        title: 'Create Genre',
        genre,
        errors: errors.array(),
      })
      return
    } else {
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if(err) {
          return next(err)
        }

        if(found_genre){
          res.redirect(found_genre.url)
        } else {
          genre.save((err) => {
            if(err){
              return next(err)
            }
            res.redirect(genre.url)
          })
        }
      })
    }
  }
]

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) =>{
  async.parallel(
    {
      genre(callback){
        Genre.findById(req.params.id).exec(callback)
      },
      genre_list(callback){
        Book.find({ genre: req.params.id }).exec(callback)
      },
    },
    (err, results)=> {
      if(err){
        return next(err)
      }
      if(results.genre == null){
        res.redirect('/catalog/genres')
      }
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_list: results.genre_list
      })
    }
  )
}

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res) => {
  async.parallel(
    {
      genre(callback){
        Genre.findById(req.body.genreid).exec(callback)
      },
      genre_list(callback){
        Book.find({ genre: req.body.genreid }).exec(callback)
      }
    },
    (err, results) =>{
      if(err){
        return next(err)
      }
      if(results.genre_list.length > 0){
        res.render('genre_delete', {
          title: 'Delete Genre',
          genre: results.genre,
          genre_list: results.genre_list
        })
        return
      }
      Genre.findByIdAndRemove(req.body.genreid, (err) => {
        if(err) {
          return next(err)
        }
        res.redirect('/catalog/genres')
      })
    }
  )
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {

  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback)
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        const err = new Error("Author not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("genre_form", {
        title: "Update Genre",
        genre: results.genre
      });
    }
  );
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validate and sanitize fields.
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          genre(callback) {
            Genre.find(callback);
          }
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("genre_form", {
            title: "Update Genre",
            genre,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, thegenre) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to book detail page.
      res.redirect(thegenre.url);
    });
  },
];