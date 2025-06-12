require('dotenv').config();
const express = require('express');
const sequelize = require('./sequelize');
const { Op } = require("sequelize");
const { Movie, Star } = require("./models");

const app = express();
const PORT = process.env.APP_PORT || 8050;

app.use(express.json());
app.use(express.text());

sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
});

app.get("/api/v1", (req, res) => {
    res.json({ message: 'Hello from backend!' });
    
    res.status(200);
    return;
});

app.post("/api/v1/users", async (req,res)=> { 
    
    req.status(200);
    return;
});

app.post("/api/v1/sessions", async (req,res)=> { 
    
    req.status(200);
    return;
});

app.post("/api/v1/movies", async (req,res)=>{
    try {
        const { title, year, format, actors } = req.body;

        if (!title || !year || !format || !Array.isArray(actors)) {
            res.status(400).json({ error: "Missing or invalid fields" });
            return;
        }

        const movie = await Movie.create({ title: title, release_year: year, format: format });

        const starInstances = await actors.reduce(async (accP, actorName) => {
        const acc = await accP;
        const [star] = await Star.findOrCreate({ where: { name: actorName } });
        acc.push(star);
        return acc;
        }, Promise.resolve([]));

        await movie.addStars(starInstances);

        res.status(200).json({ message: "Movie created", movieId: movie.id });
        return;
  } catch (error) {
        console.error("Failed to create a movie: ", error);
        res.status(500).json({ error: `Internal Server Error: ${error}` });
        return;
  }
});

app.delete("/api/v1/movies/:id", async (req,res)=>{
    try {
        const movieId = req.params.id;
        await Movie.destroy({where: {id: movieId}});
        res.status(200).json({message: "Movie Deleted Successfuly"});
        return;
    } catch (error) {
        console.log("Failed to delete a movie: ", error);
        res.status(500).json({ error: `Internal Server Error: ${error}` });
        return;
    }
});

app.patch("/api/v1/movies/:id", async (req,res)=> { 
try {
    const movieId = req.params.id;
    const { title, year, format, actors } = req.body;

    if (!title || !year || !format || !Array.isArray(actors)) {
      res.status(400).json({ error: "Missing or invalid fields" });
      return;
    }

    await Movie.update(
      { title, release_year: year, format },
      { where: { id: movieId } }
    );

    const movie = await Movie.findByPk(movieId);
    const starInstances = await Promise.all(
      actors.map(async (actorName) => {
        const [star] = await Star.findOrCreate({ where: { name: actorName } });
        return star;
      })
    );
    await movie.setStars(starInstances);

    res.status(200).json({ message: "Movie updated successfully" });
  } catch (error) {
    console.error("Failed to update a movie: ", error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});

app.get("/api/v1/movies/:id", async (req,res)=> { 
    try {
        const movieId = req.params.id;
        const movie = await Movie.findOne({where: {id: movieId}});
        const stars = await Star.findAll({
            include: [{
                model: Movie,
                where: { id: movieId }
            }]
        });
        res.status(200).json({data: {id: movie.id, title: movie.title, year: movie.release_year, format: movie.format, actors: stars}});
        return;
    } catch (error) {
        console.log("Cannot find specified movie: ", error);
        res.status(500).json({ error: `Internal Server Error: ${error}` });
        return;
    }
});

app.get("/api/v1/movies", async (req, res) => {
    try {
        const { sort, order, limit, offset, title, actor } = req.query;

        if (title) {
            const movie = await Movie.findOne({
                where: {title: title},
                include: Star,
            });

            if (!movie) {
                return res.status(404).json({ error: "Movie not found" });
            }

            const actors = movie.Stars.map((star) => star.name);

            return res.status(200).json({
                data: {
                    id: movie.id,
                    title: movie.title,
                    year: movie.release_year,
                    format: movie.format,
                    actors,
                },
            });
        }

        if (actor) {
            const stars = await Star.findAll({
                where: {name: actor},
                include: Movie,
            });

            if (!stars.length) {
                return res.status(404).json({ error: "No movies found with that actor" });
            }

            const moviesMap = new Map();
            stars.forEach((star) => {
                star.Movies.forEach((movie) => {
                    moviesMap.set(movie.id, movie);
                });
            });

            const movies = Array.from(moviesMap.values());

            return res.status(200).json({ movies });
        }

        const list = await Movie.findAll({
            order: sort ? [[sort || "title", order || "ASC"]] : undefined,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });

        return res.status(200).json({ movies: list });
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

app.post("/api/v1/movies/import", async (req, res) => {
    const rawText = req.body;

    try {
        const movieBlocks = parseMovieText(rawText);
        const createdMovies = [];

        for (const movieData of movieBlocks) {
            const [movie] = await Movie.findOrCreate({
                where: {
                    title: movieData.title,
                    release_year: movieData.year,
                    format: movieData.format,
                }
            });

            for (const starName of movieData.stars) {
                const [star] = await Star.findOrCreate({ where: { name: starName.trim() } });
                await movie.addStar(star);
            }

            createdMovies.push(movie);
        }

        return res.status(201).json({
            message: "Import completed",
            importedCount: createdMovies.length,
        });
    } catch (error) {
        console.error("Import error:", error);
        return res.status(400).json({ error: "Failed to parse or save movies" });
    }
});

function parseMovieText(text) {
    const blocks = text
        .split(/\n\s*\n/)
        .map(b => b.trim())
        .filter(Boolean);

    return blocks.map(block => {
        const lines = block.split('\n').map(l => l.trim());
        const movie = {};

        for (const line of lines) {
            if (line.startsWith("Title:")) {
                movie.title = line.slice(6).trim();
            } else if (line.startsWith("Release Year:")) {
                movie.year = parseInt(line.slice(13).trim(), 10);
            } else if (line.startsWith("Format:")) {
                movie.format = line.slice(7).trim();
            } else if (line.startsWith("Stars:")) {
                movie.stars = line.slice(6).split(",").map(s => s.trim());
            }
        }

        if (!movie.title || !movie.year || !movie.format || !movie.stars?.length) {
            throw new Error(`Invalid movie block:\n${block}`);
        }

        return movie;
    });
}


