A node.js web server app for storing movie information, with optional frontend next.js client

INSTALL AND RUN
To download the app to your machine, you must run:
docker pull danilodiedov/movies:latest

Then, in order to run the web server, you can run:
docker run --name movies -p 8000:8050 -e APP_PORT=8050 danilodiedov/movies

Also, you can choose to run the app together with next.js web client with gui. By default the client port is 3000.
docker run -p 3000:3000 -p 8050:8050 -e APP_PORT=8050 -e FRONTEND=true danilodiedov/movies

USIGN THE SERVER
The created web server has the following endpoints:
POST /api/v1/users
Creates a new user. 
Expects { email, name, password, confirmPassword } in request body.
Returns { token, status } on success.

POST /api/v1/sessions
Creates a session for existing user.
Expects { email, password } in request body.
Returns { token, status } on sucess.

All of the following routes require a header containing jwt token from either /users or/sessions

GET /api/v1/movies/
Find a list of movies with given query parameters.
Can (but not require) take request query parameters: { actor, title, search, sort = 'id', order = 'ASC', limit: limitStr, offset: offsetStr,}
Returns {data, meta, status} on success, with data array containing array of movie objects.

POST /api/v1/movies/
Creates a new movie.
Expects { title, year, format, actors } in request body.
Returns { data: {id, title, year, format, actors, createdAt, updatedAt}, status,}); on success.

DELETE /api/v1/movies/:id
Deletes a movie with given id.
Expects an :id request parameter.
Returns {status} on success.

PATCH /api/v1/movies/:id
Updates a movie with given id.
Expects  an :id request parameter.
Returns {data: {id,title,year, format, actors[{id,name,createdAt,updatedAt,}],createdAt: updatedMovie.createdAt,updatedAt: updatedMovie.updatedAt,},status: 1,};

GET /api/v1/movies/:id
Returns full data about a movie with specified id
Expects an :id request parameter.
Returns {data: {id,title,year,format,actors,createdAt,updatedAt,},status,};

POST /api/v1/movies/import
Allows to import a list of movies from a text file into the app database.
Expects a file as input.
Returns {data,meta: {imported,total,},status,}
Below is an example of valid import file:
movies.txt:
Title: Blazing Saddles
Release Year: 1974
Format: VHS
Stars: Mel Brooks, Clevon Little, Harvey Korman, Gene Wilder, Slim Pickens, Madeline Kahn

Title: Casablanca
Release Year: 1942
Format: DVD
Stars: Humphrey Bogart, Ingrid Bergman, Claude Rains, Peter Lorre


USING THE GUI
Opening the localhost:3000/ when running the app with frontend included, the user will see a login page.
Login page contains email and password input fields, as well as "login" button and "register" button.
If user inputs incorrect data into input fields, an error message would be shown on page when "login" is clicked.
On correct input, when clicking "login" user would be redirected to "localhost:3000/list" page.

Register page contains input fields for email, name, password, and repeated password as well as "register" and "login" buttons.
On valid input, "register" button click will return the user to login page.
"login" button will return the user to login page too.

List page contains 4 major sections:
1. Import button. Clicking that button would allow the user to input a file for importing movies. When the movies are imported, they will appear on page reload.
2. Movie search form. Contains fields for sorting movies by title, year, format or no sorting, limit, offset, order (ascendng/descending).
Also contains input fields to search by title, actor name or either.
On clicking "search" button, the movie list below would show the results.
3. Add movie form. Contains input fields for title, year, format, and a list of actors (one string, each actor separated by ", "). Sends request to create a movie with "Add Movie" button.
4. List of movies. Each movie displays title, has "delete" button and "show details" button. 
Delete button results would apper on page reload. 
Show Details button would open a dropdown section with all movie and related actor information. 
