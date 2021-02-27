const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    profileHandle:{
        type:String,
        ref: 'Profile'
    },
    profilePicture:{
        type:String,
        ref: 'Profile'
    },
    text: {
        type: String,
        required: true
    },
    name:{
        type: String,
    },
    profile:{
        type: Object,
        ref: 'Profile',
      },
    likes:[
        {
            user:{
                type:Schema.Types.ObjectId,
                ref: 'users'
            },
            profile:{
                type: Object,
                ref: 'Profile',
              },
        }
    ],
    comments: [
        {
            user:{
                type:Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            name:{
                type: String,
            },
            profileHandle:{
                type:String,
                ref: 'Profile'
            },
            profilePicture:{
                type:String,
                ref: 'Profile'
            },
            date: {
                type: Date,
                default: Date.now
            }
        },
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);
