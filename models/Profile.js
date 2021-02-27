const mongoose = require('mongoose');
const User = require('./User');
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  handle: {
    type: String,
    max: 40,
    default: "",
  },
  profilePicture:{
    type: String,
    default: "https://th.bing.com/th/id/R8c8279834629e263d31ee551c00d396d?rik=SVgN71lLFXJCwA&riu=http%3a%2f%2fsites.nicholas.duke.edu%2fclarklab%2ffiles%2f2011%2f01%2fdefault_profile-d80441a6f25a9a0aac354978c65c8fa9.jpg&ehk=SVwqkVaDR05fU1iqvX%2fgjiyCCxN%2bqDeGzHKKjsoTIbQ%3d&risl=&pid=ImgRaw"
  },
  company: {
    type: String
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  bio: {
    type: String
  },
  following: [
    {
      user:{
        type: Schema.Types.ObjectId,
        ref: 'users',
        type: Object
        },
       profile:{
          type: Object,
          ref: 'Profile',
        },
        name:{
          type: String,
        },
          from: {
          type: Date,
          default: Date.now,
        },
        count:{
          type: Number,
         default: 0
        }
    }
  ],
  followers: [
    {
      user:{
        type: Schema.Types.ObjectId,
        ref: 'users',
        type: Object
        },
        profile:{
          type: Object,
          ref: 'Profile',
        },
        name:{
          type: String,
        },
        from: {
          type: Date,
          default: Date.now,
        },  
    }
  ],
  experience: [
    {
      title: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      location: {
        type: String
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  education: [
    {
      school: {
        type: String,
        required: true
      },
      degree: {
        type: String,
        required: true
      },
      fieldofstudy: {
        type: String,
        required: true
      },
      from: {
        type: Date,
        required: true
      },
      to: {
        type: Date
      },
      current: {
        type: Boolean,
        default: false
      },
      description: {
        type: String
      }
    }
  ],
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    linkedin: {
      type: String
    },
    instagram: {
      type: String
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);