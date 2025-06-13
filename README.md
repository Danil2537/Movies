A node.js web server app for storing movie information, with optional frontend next.js client

Docker Hub Image link:  
[https://hub.docker.com/r/danilodiedov/movies](https://hub.docker.com/r/danilodiedov/movies)


INSTALL AND RUN <br>
To download the app to your machine, you must run: <br>
docker pull danilodiedov/movies:latest

Then, in order to run the web server, you can run: <br>
docker run --name movies -p 8000:8050 -e APP_PORT=8050 danilodiedov/movies <br>
<br>
Also, you can choose to run the app together with next.js web client with gui. By default the client port is 3000. <br>
docker run -p 3000:3000 -p 8050:8050 -e APP_PORT=8050 -e FRONTEND=true danilodiedov/movies<br>
<br>
In order to build the docker image yourself, you can run: <br>
docker build -t danilodiedov/movies -f docker/Dockerfile . <br>
API available at: http://localhost:8050 <br>
Frontend GUI available at: http://localhost:3000<br>
<br>
USIGN THE SERVER<br>
The created web server has the following endpoints:<br>
POST /api/v1/users<br>
Creates a new user. <br>
Expects { email, name, password, confirmPassword } in request body.<br>
Returns { token, status } on success.<br>
<br>
POST /api/v1/sessions<br>
Creates a session for existing user.<br>
Expects { email, password } in request body.<br>
Returns { token, status } on sucess.<br>
<br>
All of the following routes require a header containing jwt token from either /users or/sessions<br>
<br>
GET /api/v1/movies/<br>
Find a list of movies with given query parameters.<br>
Can (but not require) take request query parameters: { actor, title, search, sort = 'id', order = 'ASC', limit: limitStr, offset: offsetStr,}<br>
Returns {data, meta, status} on success, with data array containing array of movie objects.<br>

POST /api/v1/movies/ <br>
Creates a new movie.<br>
Expects { title, year, format, actors } in request body.<br>
Returns { data: {id, title, year, format, actors, createdAt, updatedAt}, status,}); on success.<br>

DELETE /api/v1/movies/:id<br>
Deletes a movie with given id.<br>
Expects an :id request parameter.<br>
Returns {status} on success.<br>

PATCH /api/v1/movies/:id<br>
Updates a movie with given id.<br>
Expects  an :id request parameter.<br>
Returns {data: {id,title,year, format, actors[{id,name,createdAt,updatedAt,}],createdAt: updatedMovie.createdAt,updatedAt: updatedMovie.updatedAt,},status: 1,};<br>
<br>
GET /api/v1/movies/:id<br>
Returns full data about a movie with specified id<br>
Expects an :id request parameter.<br>
Returns {data: {id,title,year,format,actors,createdAt,updatedAt,},status,};<br>
<br>
POST /api/v1/movies/import<br>
Allows to import a list of movies from a text file into the app database.<br>
Expects a file as input.<br>
Returns {data,meta: {imported,total,},status,}<br>
Below is an example of valid import file:<br>
movies.txt:<br>
Title: Blazing Saddles<br>
Release Year: 1974<br>
Format: VHS<br>
Stars: Mel Brooks, Clevon Little, Harvey Korman, Gene Wilder, Slim Pickens, Madeline Kahn<br>
<br>
Title: Casablanca<br>
Release Year: 1942<br>
Format: DVD<br>
Stars: Humphrey Bogart, Ingrid Bergman, Claude Rains, Peter Lorre<br>

<br>
USING THE GUI<br>
Opening the localhost:3000/ when running the app with frontend included, the user will see a login page.<br>
Login page contains email and password input fields, as well as "login" button and "register" button.<br>
If user inputs incorrect data into input fields, an error message would be shown on page when "login" is clicked.<br>
On correct input, when clicking "login" user would be redirected to "localhost:3000/list" page.<br>
<br>
Register page contains input fields for email, name, password, and repeated password as well as "register" and "login" buttons.<br>
On valid input, "register" button click will return the user to login page.<br>
"login" button will return the user to login page too.<br>
<br>
List page contains 4 major sections:<br>
1. Import button. Clicking that button would allow the user to input a file for importing movies. When the movies are imported, they will appear on page reload.<br>
2. Movie search form. Contains fields for sorting movies by title, year, format or no sorting, limit, offset, order (ascendng/descending).<br>
Also contains input fields to search by title, actor name or either.<br>
On clicking "search" button, the movie list below would show the results.<br>
3. Add movie form. Contains input fields for title, year, format, and a list of actors (one string, each actor separated by ", "). Sends request to create a movie with "Add Movie" button.<br>
4. List of movies. Each movie displays title, has "delete" button and "show details" button. <br>
Delete button results would apper on page reload. <br>
Show Details button would open a dropdown section with all movie and related actor information. <br>
