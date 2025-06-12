const Movie = require("./Movie");
const Star = require("./Star");
const User = require("./User");
Movie.belongsToMany(Star, { through: "MovieStars" });
Star.belongsToMany(Movie, { through: "MovieStars" });

module.exports = {
  Movie,
  Star,
  User
};