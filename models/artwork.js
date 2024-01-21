// models/user.js
const db = require("./db");
const Artwork = db.model("Artwork", {
  Title: {
    type: String,
    unique: true,
  },
  Artist: String,
  artist_id: {
    type: db.Schema.Types.ObjectId,
  },
  Year: String,
  Category: [String],
  Medium: [String],
  Description: String,
  Poster: String,
  reviews: {
    type: [
      {
        user_id: {
          type: db.Schema.Types.ObjectId,
        },
        username: String,
        content: String,
        _id: db.Schema.Types.ObjectId,
      },
    ],
    default: [],
  },
  likes: { type: Number, default: 0 },
});

module.exports = Artwork;
