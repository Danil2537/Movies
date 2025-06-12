const Movie = require("./Movie");
const Star = require("./Star");

// Define associations here to avoid circular require issues
Movie.belongsToMany(Star, { through: "MovieStars" });
Star.belongsToMany(Movie, { through: "MovieStars" });

module.exports = {
  Movie,
  Star,
};