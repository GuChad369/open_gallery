// models/user.js
const db = require("./db");
const User = db.model("User", {
  username: {
    type: String,
    unique: true,
    required: [true, "Must contain username..."],
  },
  password: { type: String, required: [true, "Must contain password..."] },
  following: {
    type: [
      {
        artist_id: {
          type: db.Schema.Types.ObjectId,
          unique: true,
        },
        artist_name: String,
      },
    ],
    default: [],
  },
  reviews: {
    type: [
      {
        artwork_id: {
          type: db.Schema.Types.ObjectId,
        },
        artwork_title: String,
        content: String,
      },
    ],
    default: [],
  },
  likes: {
    type: [
      {
        artwork_id: {
          type: db.Schema.Types.ObjectId,
          unique: true,
        },
        artwork_title: String,
      },
    ],
    default: [],
  }, // artwork id
  notifications: {
    type: [
      {
        artist_id: {
          type: db.Schema.Types.ObjectId,
        },
        artist_name: String,
        content: String,
      },
    ],
    default: [],
  },
  artist: { type: Boolean, default: false },
  artworks: {
    type: [
      {
        artwork_id: {
          type: db.Schema.Types.ObjectId,
          unique: true,
        },
        artwork_title: String,
      },
    ],
    default: [],
  },
  host: [String],
  enrollment: [String],
  followers: [db.Schema.Types.ObjectId],
});

module.exports = User;
