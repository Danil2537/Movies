const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const movieController = require('../controllers/movieController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', auth, movieController.createMovie);
router.delete('/:id', auth, movieController.deleteMovie);
router.patch('/:id', auth, movieController.updateMovie);
router.get('/:id', auth, movieController.getMovie);
router.get('/', auth, movieController.findMovies);
router.post(
  '/import',
  auth,
  upload.single('movies'),
  movieController.importMovies
);

module.exports = router;
