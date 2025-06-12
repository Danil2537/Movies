function parseMovieText(text) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split('\n').map((l) => l.trim());
    const movie = {};

    for (const line of lines) {
      if (line.startsWith('Title:')) movie.title = line.slice(6).trim();
      else if (line.startsWith('Release Year:'))
        movie.year = parseInt(line.slice(13).trim());
      else if (line.startsWith('Format:')) movie.format = line.slice(7).trim();
      else if (line.startsWith('Stars:')) {
        movie.stars = line
          .slice(6)
          .split(',')
          .map((s) => s.trim());
      }
    }

    if (!movie.title || !movie.year || !movie.format || !movie.stars?.length) {
      throw new Error(`Invalid movie block:\n${block}`);
    }

    return movie;
  });
}

module.exports = parseMovieText;
