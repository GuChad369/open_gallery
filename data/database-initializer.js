// Read the data from the JSON file
const fs = require("fs");
let artworks = [];
fs.readFile("gallery.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }
  // Parse the JSON data
  artworks = JSON.parse(data);
  // insert artworks
  insertArtworks();
});

// insert into mongodb
const mongoose = require("mongoose");
//Save Schema reference into variable to save typing
const Schema = mongoose.Schema;

let Artwork;
let db;
let User;

function insertArtworks() {
  // define Schema
  let artworkSchema = Schema({
    Title: {
      type: String,
      unique: true,
    },
    Artist: String,
    artist_id: {
      type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
          },
          username: String,
          content: String,
          _id: Schema.Types.ObjectId,
        },
      ],
      default: [],
    },

    likes: { type: Number, default: 0 },
  });

  mongoose.connect("mongodb://127.0.0.1/term_project");

  Artwork = mongoose.model("Artwork", artworkSchema);

  // Drop the Artwork collection
  Artwork.collection.drop((err, result) => {
    if (err) {
      console.error("Error dropping collection:", err);
    } else {
      console.log("Collection dropped:", result);
    }
  });

  //Get the default Mongoose connection (can then be shared across multiple files)
  db = mongoose.connection;

  db.on("error", console.error.bind(console, "connection error:"));

  //Once connected, create a document for each product
  db.once("open", function () {
    //Or use the model's insertMany method
    Artwork.insertMany(artworks)
      .then((result) => {
        console.log(result);
        insertUsers();
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

function insertUsers() {
  let users = [];
  let userSchema = Schema({
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
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            unique: true,
          },
          artwork_title: String,
        },
      ],
      default: [],
    },
    host: [String],
    enrollment: [String],
    followers: [Schema.Types.ObjectId],
  });

  User = mongoose.model("User", userSchema);

  // Drop the user collection
  User.collection.drop((err, result) => {
    if (err) {
      console.error("Error dropping collection:", err);
    } else {
      console.log("Collection dropped:", result);
    }
  });

  // find all artist name
  Artwork.find({}, { Artist: 1, _id: 1, Title: 1 })
    .then((result) => {
      // combine all artist
      let artistMap = {};
      result.forEach((ele) => {
        if (!artistMap[ele.Artist]) {
          artistMap[ele.Artist] = [];
        }
        artistMap[ele.Artist].push({
          artwork_id: ele._id,
          artwork_title: ele.Title,
        });
      });
      let combinedArtists = Object.keys(artistMap).map((artist) => {
        return {
          username: artist,
          password: "123",
          artist: true,
          artworks: artistMap[artist],
        };
      });

      // insert user
      User.insertMany(combinedArtists)
        .then((result) => {
          console.log(result);
          updateArtistId();
        })
        .catch((err) => {
          console.log(err);
          // mongoose.connection.close();
        });
    })
    .catch((err) => {
      console.error("find all artist name:", err);
    });
}

async function updateArtistId() {
  let artwork = [];
  await Artwork.find({})
    .then((res) => {
      artwork = res;
    })
    .catch((err) => {
      console.error("Update:", err);
    });
  let user = [];
  await User.find({})
    .then((res) => {
      user = res;
    })
    .catch((err) => {
      console.error("Update:", err);
    });

  let artistNameToIdMap = {};
  user.forEach((artist) => {
    artistNameToIdMap[artist.username] = artist._id;
  });

  let updatedArtworks = artwork.map((artwork) => {
    return {
      Title: artwork.Title,
      artist_id: artistNameToIdMap[artwork.Artist], // Find the artist ID using the artist's name
    };
  });

  Promise.all(
    updatedArtworks.map((updatedArtwork) => {
      return Artwork.findOneAndUpdate(
        { Title: updatedArtwork.Title }, // find artwork by Title
        { $set: { artist_id: updatedArtwork.artist_id } }, // update artist_id
        { new: true } // return the updated document
      ).catch((error) => {
        console.error("Error updating artwork:", updatedArtwork.Title, error);
        return null; // Return null or a custom error object if needed
      });
    })
  )
    .then((results) => {
      // All updates are done here
      console.log("All updates completed");
      mongoose.connection.close();
    })
    .catch((error) => {
      // Handle any error that might have occurred in Promise.all
      console.error("An error occurred during the update process:", error);
      mongoose.connection.close();
    });
}
