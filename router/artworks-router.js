const express = require("express");
const Artwork = require("../models/artwork");
const User = require("../models/user");
const { ObjectId } = require("mongodb");
// Create the router
let router = express.Router();

// handle different request
router.get("/", auth, getArtworks);
router.get("/:id", auth, getArtwork);
router.post("/", auth, createArtwork);

// authorization function
function auth(req, res, next) {
  if (!req.session.userId) {
    res.format({
      "text/html": () => {
        res.render("../public/pages/login", {});
      },
      "application/json": () => {
        res.status(401).send("Unauthorized");
      },
    });
    return;
  }
  next();
}

function createArtwork(req, res, next) {
  req.body.artist_id = req.session.userId;
  req.body.Artist = req.session.username;
  let artwork = new Artwork(req.body);
  artwork
    .save()
    .then((doc) => {
      // update user
      User.findByIdAndUpdate(
        { _id: req.session.userId },
        {
          $push: {
            artworks: {
              artwork_id: doc._id,
              artwork_title: doc.Title,
            },
          },
        },
        {
          new: true,
          safe: true,
          upsert: false,
        }
      )
        .then((add) => {
          if (add) {
            // push notifications
            User.findById(req.session.userId, { followers: 1 })
              .then((f) => {
                const pushNotifications = f.followers.map((notify) => {
                  User.findOneAndUpdate(
                    { _id: notify },
                    {
                      $push: {
                        notifications: {
                          artist_id: req.session.userId,
                          artist_name: req.session.username,
                          content: "I push a new artwork!",
                        },
                      },
                    },
                    {
                      new: true,
                      safe: true,
                      upsert: false,
                    }
                  )
                    .then()
                    .catch((err) => {
                      res.status(400).send("cant find follower");
                    });
                });

                // make sure all do
                Promise.all(pushNotifications)
                  .then(() => {
                    res.status(200).send({ userId: req.session.userId });
                  })
                  .catch((err) => {
                    res.status(400).send("Something wrong");
                  });
              })
              .catch((err) => {
                res.status(400).send(err);
              });
          } else {
            res.status(400).send("Not found user");
          }
        })
        .catch((err) => {
          res.status(400).send("Same Title");
        });
    })
    .catch((err) => res.status(400).send(err));
}

function getArtwork(req, res, next) {
  let id = req.params.id;
  Artwork.findById(id)
    .exec()
    .then((result) => {
      if (!result) {
        res.status(400).send("Not Found...");
      } else {
        // check if this user like this artwork
        User.find({ username: req.session.username })
          .exec()
          .then((u) => {
            let flag = false;
            // check if like
            u[0].likes.some((like) => {
              if (like.artwork_id.equals(new ObjectId(result._id))) {
                flag = true;
              }
            });

            let like = false;
            if (flag) {
              like = true;
            }

            res.format({
              "text/html": () => {
                res.render("../public/pages/artworks", {
                  username: req.session.username,
                  userId: req.session.userId,
                  currentPage: 1,
                  reachLastPage: false,
                  queryString: "",
                  artworks: result,
                  artwork_id: id,
                  aLink: true,
                });
              },
              "application/json": () => {
                res.status(200).json({ result: result, like: like });
              },
            });
          })
          .catch((err) => {
            res.status(400).send(err);
          });
      }
    })
    .catch((error) => {
      //   console.error("Error finding artwork by id:", error);
      res.status(400).send(error);
    });
}

function getArtworks(req, res, next) {
  // parse select search
  let Title = req.query.Title;
  let Artist = req.query.Artist;
  let Category = req.query.Category;
  let queryParams = {};
  let queryString = "";

  if (Title) {
    queryParams.Title = new RegExp(Title, "i");
    queryString += `&Title=${Title}`;
  }
  if (Artist) {
    queryParams.Artist = new RegExp(Artist, "i");
    queryString += `&Artist=${Artist}`;
  }
  if (Category) {
    queryParams.Category = new RegExp(Category, "i");
    queryString += `&Category=${Category}`;
  }

  // count the elements number
  Artwork.countDocuments(queryParams)
    .exec()
    .then((count) => {
      // get total page
      let maxPage = Math.ceil(count / 10);
      // record the last page
      req.reachLastPage = false;
      // check page boundary
      try {
        if (!req.query.page) {
          req.query.page = 1;
        } else {
          req.query.page = Number(req.query.page);
        }
      } catch {
        req.query.page = 1;
      }

      if (req.query.page < 1) {
        req.query.page = 1;
      }
      if (req.query.page >= maxPage || maxPage == 1) {
        req.query.page = maxPage;
        req.reachLastPage = true;
      }

      // get the documets
      Artwork.find(queryParams)
        .skip((req.query.page - 1) * 10)
        .limit(10)
        .exec()
        .then((results) => {
          res.format({
            "text/html": () => {
              res.render("../public/pages/artworks", {
                username: req.session.username,
                userId: req.session.userId,
                currentPage: req.query.page,
                reachLastPage: req.reachLastPage,
                queryString: queryString,
                artworks: results,
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
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

// Export the router object
module.exports = router;
