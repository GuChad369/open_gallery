const express = require("express");
const User = require("../models/user");
const Artwork = require("../models/artwork");
//Create the router
let router = express.Router();

// handle different request
router.post("/", createUser);
router.get("/", auth, getArtists);
router.get("/:id", auth, getArtist);
router.put("/", auth, toggleRole);
router.post("/like", auth, addLike);
router.delete("/like", auth, deleteLike);
router.post("/reviews", auth, addReview);
router.delete("/reviews", auth, deleteReview);
router.post("/following", auth, following);
router.delete("/following", auth, deleteFollowing);
router.post("/workshop", auth, addWorkshop);
router.post("/enrollment", auth, enrollment);

// authorization function
function auth(req, res, next) {
  if (!req.session.userId) {
    res.format({
      "text/html": () => {
        res.render("../public/pages/login");
      },
      "application/json": () => {
        res.status(401).send("Unauthorized");
      },
    });
    return;
  }
  next();
}

function enrollment(req, res, next) {
  // add workshop
  User.findOneAndUpdate(
    {
      _id: req.session.userId,
    },
    {
      $push: { enrollment: req.body.title },
    },
    { new: true, safe: true }
  )
    .then((update) => {
      if (update) {
        // push notifications
        User.findOneAndUpdate(
          { _id: req.session.userId },
          {
            $push: {
              notifications: {
                artist_id: req.body.artist_id,
                artist_name: req.body.artist_name,
                content: "Welcome to my workshop!",
              },
            },
          },
          {
            new: true,
            safe: true,
            upsert: false,
          }
        )
          .then((enroll_succ) => {
            res.status(200).send("Enrollment successfully");
          })
          .catch((err) => {
            res.status(400).send("cant find user");
          });
      } else {
        res.status(400).send("Not found");
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function addWorkshop(req, res, next) {
  // add workshop
  User.findOneAndUpdate(
    {
      _id: req.session.userId,
    },
    {
      $push: { host: req.body.Title },
    },
    { new: true, safe: true }
  )
    .then((update) => {
      if (update) {
        res.status(200).send({ userId: req.session.userId });
      } else {
        res.status(400).send("Not found");
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function toggleRole(req, res, next) {
  // get user
  User.findById(req.session.userId, { artist: 1 })
    .then((role) => {
      // toggle role
      User.findOneAndUpdate(
        {
          _id: req.session.userId,
        },
        {
          $set: { artist: !role.artist },
        },
        { new: true }
      )
        .then((update) => {
          if (update) {
            res.status(200).send({ userId: req.session.userId });
          } else {
            res.status(400).send("Not found");
          }
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function deleteFollowing(req, res, next) {
  // find user
  User.findOneAndUpdate(
    { _id: req.session.userId },
    { $pull: { following: { artist_id: req.body.artist_id } } },
    { new: true }
  )
    .then((pullRes) => {
      if (pullRes) {
        // delete from artist
        User.findOneAndUpdate(
          { _id: req.body.artist_id },
          { $pull: { followers: req.session.userId } },
          { new: true }
        )
          .then((deleteFollower) => {
            res.status(200).send({ userId: req.session.userId });
          })
          .catch((err) => {
            res.status(400).send(err);
          });
      } else {
        // User not found
        res.status(400).send("User not found");
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function following(req, res, next) {
  if (req.session.userId == req.body.artist_id) {
    res.status(400).send("Can not following yourself");
    return;
  }
  // get artist name
  User.findById(req.body.artist_id, { username: 1 })
    .exec()
    .then((result) => {
      // update
      User.findOneAndUpdate(
        { _id: req.session.userId },
        {
          $push: {
            following: {
              artist_id: req.body.artist_id,
              artist_name: result.username,
            },
          },
        },
        {
          new: true,
          safe: true,
          upsert: false,
        }
      )
        .then((update) => {
          if (update) {
            // add into artist's followers
            User.findOneAndUpdate(
              { _id: req.body.artist_id },
              {
                $push: { followers: req.session.userId },
              },
              {
                new: true,
                safe: true,
              }
            )
              .then((success) => {
                res.status(200).send("Add successfully");
              })
              .catch((err) => {
                res.status(400).send(err);
              });
          } else {
            res.status(400).send("Not found");
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
}

function deleteReview(req, res, next) {
  // find user
  User.findOneAndUpdate(
    { _id: req.session.userId },
    { $pull: { reviews: { _id: req.body.id } } },
    { new: true }
  )
    .then((pullRes) => {
      if (pullRes) {
        // delete reviews of artwork
        Artwork.findOneAndUpdate(
          { _id: req.body.artwork_id },
          { $pull: { reviews: { _id: req.body.id } } },
          { new: true }
        )
          .then((suc) => {
            if (suc) {
              res.status(200).send({ userId: req.session.userId });
            } else {
              // Artwork not found
              res.status(400).send("Artwork not found");
            }
          })
          .catch((err) => {
            res.status(400).send(err);
          });
      } else {
        // User not found
        res.status(400).send("User not found");
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function deleteLike(req, res, next) {
  // find user
  User.findOneAndUpdate(
    { _id: req.session.userId },
    { $pull: { likes: { artwork_id: req.body.artwork_id } } },
    { new: true }
  )
    .then((pullRes) => {
      if (pullRes) {
        // decrease the number of artwork
        Artwork.findOneAndUpdate(
          { _id: req.body.artwork_id },
          { $inc: { likes: -1 } },
          { new: true, safe: true }
        )
          .then((suc) => {
            res.status(200).send({ userId: req.session.userId });
          })
          .catch((err) => {
            res.status(400).send(err);
          });
      } else {
        // User not found
        res.status(400).send("User not found");
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function addReview(req, res, next) {
  // check if this its own artwrok
  User.findById(req.session.userId)
    .then((artist) => {
      if (artist) {
        let flag = false;
        artist.artworks.some((a) => {
          if (a.artwork_id.equals(req.body.artwork_id)) {
            flag = true;
          }
        });
        if (flag) {
          res.status(400).send("Can not review your own artworks");
        } else {
          // find artwork
          Artwork.findById(req.body.artwork_id, { Title: 1 })
            .exec()
            .then((result) => {
              // update
              User.findOneAndUpdate(
                { _id: req.session.userId },
                {
                  $push: {
                    reviews: {
                      artwork_id: req.body.artwork_id,
                      artwork_title: result.Title,
                      content: req.body.content,
                    },
                  },
                },
                {
                  new: true,
                  safe: true,
                  upsert: false,
                }
              )
                .then((update) => {
                  let _id = update.reviews[update.reviews.length - 1];
                  // update the artwork reviews
                  Artwork.findOneAndUpdate(
                    { _id: req.body.artwork_id },
                    {
                      $push: {
                        reviews: {
                          user_id: req.session.userId,
                          username: req.session.username,
                          content: req.body.content,
                          _id: _id,
                        },
                      },
                    },
                    { new: true, safe: true }
                  )
                    .then((suc) => {
                      if (suc) {
                        res.status(200).send("Add successfully");
                      } else {
                        res.status(400).send("Not found");
                      }
                    })
                    .catch((err) => {
                      res.status(400).send(err);
                    });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(400).send(err);
                });
            })
            .catch((err) => {
              console.log(err);
              res.status(400).send(err);
            });
        }
      } else {
        res.status(400).send("Not found");
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function addLike(req, res, next) {
  // check if this its own artwrok
  User.findById(req.session.userId)
    .then((artist) => {
      if (artist) {
        let flag = false;
        artist.artworks.some((a) => {
          if (a.artwork_id.equals(req.body.artwork_id)) {
            flag = true;
          }
        });
        if (flag) {
          res.status(400).send("Can not like your own artworks");
        } else {
          // find artwork
          Artwork.findById(req.body.artwork_id, { Title: 1 })
            .exec()
            .then((result) => {
              // update
              User.findOneAndUpdate(
                { _id: req.session.userId },
                {
                  $push: {
                    likes: {
                      artwork_id: req.body.artwork_id,
                      artwork_title: result.Title,
                    },
                  },
                },
                {
                  new: true,
                  safe: true,
                  upsert: false,
                }
              )
                .then((update) => {
                  // update the artwork likes number
                  Artwork.findOneAndUpdate(
                    { _id: req.body.artwork_id },
                    { $inc: { likes: 1 } },
                    { new: true, safe: true }
                  )
                    .then((suc) => {
                      if (suc) {
                        res.status(200).send("Add successfully");
                      } else {
                        res.status(400).send("Not found");
                      }
                    })
                    .catch((err) => {
                      res.status(400).send(err);
                    });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(400).send(err);
                });
            })
            .catch((err) => {
              console.log(err);
              res.status(400).send(err);
            });
        }
      } else {
        res.status(400).send("Not found");
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function getArtists(req, res, next) {
  User.find({}, { username: 1, artist: 1 })
    .exec()
    .then((results) => {
      res.format({
        "text/html": () => {
          res.render("../public/pages/artists", {
            username: req.session.username,
            userId: req.session.userId,
            artists: results,
          });
        },
        "application/json": () => {
          res.status(200).json({ results });
        },
      });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function getArtist(req, res, next) {
  let id = req.params.id;
  User.findById(id, {
    password: 0,
  })
    .exec()
    .then((result) => {
      if (!result) {
        res.status(400).send("Not Found...");
      } else {
        if (id == req.session.userId) {
          res.format({
            "text/html": () => {
              res.render("../public/pages/user", {
                username: req.session.username,
                userId: req.session.userId,
                user: result,
              });
            },
            "application/json": () => {
              res.status(200).json({ result });
            },
          });
        } else {
          // check if user follwing this artist
          User.find({ username: req.session.username })
            .exec()
            .then((u) => {
              let flag = false;
              // check if following
              u[0].following.some((f) => {
                if (f.artist_id.equals(result._id)) {
                  flag = true;
                }
              });

              // cancle part of attributes
              let extractedResult = {
                _id: result._id,
                username: result.username,
                host: result.host,
                artworks: result.artworks,
                following: result.following,
              };

              res.format({
                "text/html": () => {
                  res.render("../public/pages/artists", {
                    username: req.session.username,
                    userId: req.session.userId,
                    artists: [extractedResult],
                    aLinkP: true,
                    artist_id: result._id,
                  });
                },
                "application/json": () => {
                  res
                    .status(200)
                    .json({ result: extractedResult, following: flag });
                },
              });
            })
            .catch();
        }
      }
    })
    .catch((error) => {
      //   console.error("Error finding artwork by id:", error);
    });
}

function createUser(req, res, next) {
  let user = req.body;
  let u = new User(user);
  u.save()
    .then((result) => {
      req.session.userId = result._id;
      req.session.username = result.username;
      req.session.artist = false;
      res.status(201).send();
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

// Export the router object
module.exports = router;
