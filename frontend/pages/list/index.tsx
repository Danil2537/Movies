import { useEffect, useRef, useState } from 'react';
type FetchMoviesOptions = {
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
  title?: string;
  actor?: string;
};
interface Movie {
  id: number;
  title: string;
  release_year: number;
  format: string;
  actors: string;
}

interface MovieDetail {
  id: number;
  title: string;
  release_year: number;
  format: string;
  actors: { id: number; name: string }[];
}
export default function Home() {
  const API_PORT = process.env.NEXT_PUBLIC_API_PORT || '8050';
  const API_BASE_URL = `http://localhost:${API_PORT}/api/v1`;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [formData, setFormData] = useState<FetchMoviesOptions>({
    sort: '',
    order: 'ASC',
    limit: undefined,
    offset: undefined,
    title: '',
    actor: '',
  });

  let token = '';
  useEffect(() => {
    token = localStorage.getItem('token') ?? '';
    fetchMovies({ sort: 'title' });
  }, []);

  const fetchMovies = async (options: FetchMoviesOptions = {}) => {
    const { sort, order, limit, offset, title, actor } = options;
    token = localStorage.getItem('token') ?? '';
    const params = new URLSearchParams();

    if (sort) params.append('sort', sort);
    if (order) params.append('order', order);
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    if (title) params.append('title', title);
    if (actor) params.append('actor', actor);

    const url = `${API_BASE_URL}/movies?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        authorization: token ?? '',
      },
    });

    const data = await response.json();

    if ('data' in data) {
      setMovies(data.data);
      //alert(`Hit data.data ${movies}`);
    } else {
      setMovies([]);
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, order: checked ? 'DESC' : 'ASC' }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : parseInt(value, 10),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovies(formData);
  };

  const handleDeleteClick = async (id: number) => {
    token = localStorage.getItem('token') ?? '';
    const url = `${API_BASE_URL}/movies/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        authorization: token ?? '',
      },
    });
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];

      if (!file) {
        return;
      }
      const token = localStorage.getItem('token') ?? '';
      const url = `${API_BASE_URL}/movies/import`;

      const formData = new FormData();
      formData.append('movies', file);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: token,
        },
        body: formData,
      });

      const result = await response.json();
    } catch (error) {
      console.log(error);
    }
  };

  const [openMovieDetailsId, setOpenMovieDetailsId] = useState<number | null>(
    null
  );
  const [movieDetails, setMovieDetails] = useState<MovieDetail | null>(null);

  const handleShowDetailsClick = async (id: number) => {
    if (openMovieDetailsId === id) {
      // Clicking again toggles off
      setOpenMovieDetailsId(null);
      setMovieDetails(null);
      return;
    }

    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`/api/v1/movies/${id}`, {
        headers: {
          Authorization: token,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        //alert(`Error fetching movie details: ${err.error || res.statusText}`);
        return;
      }

      const json = await res.json();
      const { data } = json;

      setOpenMovieDetailsId(id);
      setMovieDetails({
        id: data.id,
        title: data.title,
        release_year: data.year,
        format: data.format,
        actors: data.actors,
      });
    } catch (error) {
      //alert('Failed to fetch movie details');
      console.error(error);
    }
  };
  const [addFormData, setAddFormData] = useState<Movie>({
    id: 0,
    title: '',
    release_year: 2025,
    format: '',
    actors: '',
  });
  const addMovie = async (data: Movie) => {
    const token = localStorage.getItem('token') ?? '';
    const actorArray = data.actors
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name);

    return await fetch(`/api/v1/movies`, {
      method: 'POST',
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        year: data.release_year,
        format: data.format,
        actors: actorArray,
      }),
    });
  };
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMovie(addFormData);
  };
  return (
    <div className="min-h-screen bg-gray-600 flex flex-col items-center justify-start p-6 text-white">
      <div className="w-full max-w-3xl space-y-8">
        {/* Import Button */}
        <div className="flex justify-start">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white"
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.json,text/plain,application/json"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSubmitSearch}
          className="bg-gray-700 p-6 rounded shadow space-y-4"
        >
          <h2 className="text-xl font-bold mb-2">Search Movies</h2>
          <div>
            <label className="block font-semibold">Sort by:</label>
            <select
              name="sort"
              value={formData.sort}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full text-black"
            >
              <option value="">-- None --</option>
              <option value="title">Title</option>
              <option value="release_year">Release Year</option>
              <option value="format">Format</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">
              Descending order:
              <input
                type="checkbox"
                checked={formData.order === 'DESC'}
                onChange={handleInputChange}
                name="order"
                className="ml-2"
              />
            </label>
          </div>

          <div>
            <label className="block font-semibold">Limit:</label>
            <input
              type="number"
              name="limit"
              value={formData.limit ?? ''}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-24 text-black"
              min={0}
            />
          </div>

          <div>
            <label className="block font-semibold">Offset:</label>
            <input
              type="number"
              name="offset"
              value={formData.offset ?? ''}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-24 text-black"
              min={0}
            />
          </div>

          <div>
            <label className="block font-semibold">Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full text-black"
            />
          </div>

          <div>
            <label className="block font-semibold">Actor:</label>
            <input
              type="text"
              name="actor"
              value={formData.actor}
              onChange={handleInputChange}
              className="border px-2 py-1 rounded w-full text-black"
            />
          </div>

          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white"
          >
            Search
          </button>
        </form>

        {/* Add Movie Form */}
        <form
          onSubmit={handleSubmitAdd}
          className="bg-gray-700 p-6 rounded shadow space-y-4"
        >
          <h2 className="text-xl font-bold mb-2">Add Movie</h2>
          <div>
            <label htmlFor="title" className="block font-semibold">
              Title:
            </label>
            <input
              type="text"
              id="title"
              value={addFormData.title}
              onChange={(e) =>
                setAddFormData({ ...addFormData, title: e.target.value })
              }
              className="w-full border px-2 py-1 rounded text-black"
              required
            />
          </div>

          <div>
            <label htmlFor="release_year" className="block font-semibold">
              Release Year:
            </label>
            <input
              type="number"
              id="release_year"
              value={addFormData.release_year}
              onChange={(e) =>
                setAddFormData({
                  ...addFormData,
                  release_year: parseInt(e.target.value),
                })
              }
              className="w-full border px-2 py-1 rounded text-black"
              required
            />
          </div>

          <div>
            <label htmlFor="format" className="block font-semibold">
              Format:
            </label>
            <select
              id="format"
              value={addFormData.format}
              onChange={(e) =>
                setAddFormData({ ...addFormData, format: e.target.value })
              }
              className="w-full border px-2 py-1 rounded text-black"
              required
            >
              <option value="">Select format</option>
              <option value="DVD">DVD</option>
              <option value="VHS">VHS</option>
              <option value="Blu-Ray">Blu-Ray</option>
            </select>
          </div>

          <div>
            <label htmlFor="actors" className="block font-semibold">
              Actors (comma-separated):
            </label>
            <input
              type="text"
              id="actors"
              value={addFormData.actors}
              onChange={(e) =>
                setAddFormData({
                  ...addFormData,
                  actors: e.target.value,
                })
              }
              className="w-full border px-2 py-1 rounded text-black"
            />
          </div>

          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white"
          >
            Add Movie
          </button>
        </form>

        {/* Movie List */}
        <ul className="space-y-4">
          {movies.map((movie) => (
            <li
              key={movie.id}
              className="bg-gray-700 p-4 rounded shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{movie.title}</h2>
                <button
                  onClick={() => handleDeleteClick(movie.id)}
                  className="text-sm text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>

              <button
                onClick={() => handleShowDetailsClick(movie.id)}
                className="mt-2 text-blue-300 hover:underline"
              >
                Show Details
              </button>

              {openMovieDetailsId === movie.id && movieDetails && (
                <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-600 text-white space-y-2">
                  <h3 className="text-lg font-bold">{movieDetails.title}</h3>
                  <p>Release Year: {movieDetails.release_year}</p>
                  <p>Format: {movieDetails.format}</p>
                  <div>
                    <h4 className="font-semibold">Actors:</h4>
                    <ul className="space-y-1 mt-2">
                      {movieDetails.actors.map((actor) => (
                        <li
                          key={actor.id}
                          className="bg-gray-700 px-2 py-1 rounded"
                        >
                          {actor.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
