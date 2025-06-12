const { Movie, Star } = require('../models');
const parseMovieText = require('../utils/parseMovieText');
const { Op, Sequelize } = require('sequelize');

exports.createMovie = async (req, res) => {
  const { title, year, format, actors } = req.body;
  if (!title || !year || !format || !Array.isArray(actors)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const movie = await Movie.create({ title, release_year: year, format });
  const stars = await Promise.all(
    actors.map(async (name) => {
      const [star] = await Star.findOrCreate({ where: { name } });
      return star;
    })
  );

  await movie.addStars(stars);
  const movieWithStars = await Movie.findByPk(movie.id, {
    include: {
      model: Star,
      as: 'Stars',
      through: { attributes: [] },
    },
  });

  res.status(200).json({
    data: {
      id: movieWithStars.id,
      title: movieWithStars.title,
      year: movieWithStars.release_year,
      format: movieWithStars.format,
      actors: movieWithStars.Stars,
      createdAt: movieWithStars.createdAt,
      updatedAt: movieWithStars.updatedAt,
    },
    status: 1,
  });
};

exports.deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    console.log(`\n\n\n${movieId}\n\n\n`);
    await Movie.destroy({ where: { id: movieId } });
    res.status(200).json({ status: 1 });
    return;
  } catch (error) {
    console.log('Failed to delete a movie: ', error);
    res.status(500).json({ error: `Internal Server Error: ${error}` });
    return;
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const { title, year, format, actors } = req.body;

    if (!title || !year || !format || !Array.isArray(actors)) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    const [affectedRows] = await Movie.update(
      { title, release_year: year, format },
      { where: { id: movieId } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found after update' });
    }

    const starInstances = await Promise.all(
      actors.map(async (actorName) => {
        const [star] = await Star.findOrCreate({ where: { name: actorName } });
        return star;
      })
    );

    await movie.setStars(starInstances);

    const updatedMovie = await Movie.findByPk(movieId, {
      include: [
        {
          model: Star,
          as: 'Stars',
          through: { attributes: [] },
        },
      ],
    });

    const formatted = {
      data: {
        id: updatedMovie.id,
        title: updatedMovie.title,
        year: updatedMovie.release_year,
        format: updatedMovie.format,
        actors: updatedMovie.Stars.map((star) => ({
          id: star.id,
          name: star.name,
          createdAt: star.createdAt,
          updatedAt: star.updatedAt,
        })),
        createdAt: updatedMovie.createdAt,
        updatedAt: updatedMovie.updatedAt,
      },
      status: 1,
    };

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Failed to update a movie: ', error);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.findByPk(movieId, {
      include: [
        {
          model: Star,
          as: 'Stars',
          through: { attributes: [] },
        },
      ],
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    return res.status(200).json({
      data: {
        id: movie.id,
        title: movie.title,
        year: movie.release_year,
        format: movie.format,
        actors: movie.Stars,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt,
      },
      status: 1,
    });
  } catch (error) {
    console.error('Cannot find specified movie:', error);
    return res
      .status(500)
      .json({ error: `Internal Server Error: ${error.message}` });
  }
};

exports.findMovies = async (req, res) => {
  try {
    const {
      actor,
      title,
      search,
      sort = 'id',
      order = 'ASC',
      limit: limitStr,
      offset: offsetStr,
    } = req.query;

    const limit = parseInt(limitStr, 10) || 20;
    const offset = parseInt(offsetStr, 10) || 0;

    const where = {};
    const include = [];

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        Sequelize.where(Sequelize.col('Stars.name'), {
          [Op.like]: `%${search}%`,
        }),
      ];

      include.push({
        model: Star,
        through: { attributes: [] },
        attributes: [],
        required: false,
      });
    } else {
      if (title) {
        where.title = { [Op.like]: `%${title}%` };
      }

      if (actor) {
        include.push({
          model: Star,
          where: { name: { [Op.like]: `%${actor}%` } },
          through: { attributes: [] },
          attributes: [],
          required: true,
        });
      }
    }

    const { count, rows } = await Movie.findAndCountAll({
      where,
      include,
      distinct: true,
      order: [[sort === 'year' ? 'release_year' : sort, order.toUpperCase()]],
      limit,
      offset,
      attributes: [
        'id',
        'title',
        'release_year',
        'format',
        'createdAt',
        'updatedAt',
      ],
      subQuery: false,
      separate: true,
    });

    const data = rows.map((m) => ({
      id: m.id,
      title: m.title,
      year: m.release_year,
      format: m.format,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    return res.status(200).json({
      data,
      meta: { total: count },
      status: 1,
    });
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      status: 0,
    });
  }
};

exports.importMovies = async (req, res) => {
  try {
    const rawText = req.file.buffer.toString('utf-8');
    const movieBlocks = parseMovieText(rawText);
    const createdMovies = [];

    for (const movieData of movieBlocks) {
      const [movie] = await Movie.findOrCreate({
        where: {
          title: movieData.title,
          release_year: movieData.year,
          format: movieData.format,
        },
      });

      for (const starName of movieData.stars) {
        const [star] = await Star.findOrCreate({
          where: { name: starName.trim() },
        });
        await movie.addStar(star);
      }

      createdMovies.push(movie);
    }

    const responseData = createdMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_year,
      format: movie.format,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
    }));

    return res.status(201).json({
      data: responseData,
      meta: {
        imported: responseData.length,
        total: responseData.length,
      },
      status: 1,
    });
  } catch (error) {
    console.error('Import error:', error);
    return res.status(400).json({
      error: 'Failed to parse or save movies',
      status: 0,
    });
  }
};
