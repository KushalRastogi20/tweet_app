// const mongoose = require('mongoose');
// import { c } from "framer-motion/dist/types.d-Cjd591yU";
import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 280, // Twitter-like character limit
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    repost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null,
    },

});

// const Tweet = mongoose.model('Tweet', tweetSchema);

// module.exports = Tweet;
export default Tweet;