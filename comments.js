// Create web server

// Import express
const express = require('express');
const router = express.Router();

// Import comment model
const Comment = require('../models/comment');

// Import post model
const Post = require('../models/post');

// Import passport
const passport = require('passport');

// Import user model
const User = require('../models/user');

// Import middleware
const middleware = require('../middleware');

// Import helper functions
const { isLoggedIn, checkUserComment } = middleware;

// Create comment
router.post('/posts/:id/comments', isLoggedIn, (req, res) => {
    // Find post by id
    Post.findById(req.params.id, (err, post) => {
        if (err) {
            console.log(err);
            res.redirect('/posts');
        } else {
            // Create comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash('error', 'Something went wrong');
                    console.log(err);
                } else {
                    // Add username and id to comments
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;

                    // Save comment
                    comment.save();

                    // Connect new comment to post
                    post.comments.push(comment);
                    post.save();

                    // Redirect to post show page
                    req.flash('success', 'Successfully added comment');
                    res.redirect('/posts/' + post._id);
                }
            });
        }
    });
});

// Edit comment
router.get('/posts/:id/comments/:comment_id/edit', checkUserComment, (req, res) => {
    // Find comment by id
    Comment.findById(req.params.comment_id, (err, comment) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.render('comments/edit', { post_id: req.params.id, comment: comment });
        }
    });
});

// Update comment
router.put('/posts/:id/comments/:comment_id', checkUserComment, (req, res) => {
    // Find comment by id and update
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, comment) => {
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/posts/' + req.params.id);
        }
    });
});

// Delete comment
router.delete('/posts/:id/comments/:comment_id', checkUserComment