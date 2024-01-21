Open Gallery

Files:
1.	server.js: contains server-side code that handles various client requests.
2.	package.json: project information
3.	package-lock.json: version control for all project dependencies
4.	data/database-initializer.js: database initialization script to create a new MongoDB database.
5.	data/gallery.json: updated source data.
6.	models/db.js: requires Mongoose and exports it.
7.	models/user.js: Mongoose model defining the structure for a User and exporting it.
8.	models/artwork.js: Mongoose model defining the structure for an Artwork and exporting it.
9.	public/pages/404.pug: page template for the 404 Not Found error.
10.	public/pages/artists.pug: page template for displaying information about artists.
11.	public/pages/artworks.pug: page template for displaying information about artworks.
12.	public/pages/login.pug: page template for the login functionality.
13.	public/pages/user.pug: page template for displaying user account information.
14.	public/partials/footer.pug: page template for the footer section.
15.	public/partials/head.pug: page template for the navbar.
16.	public/partials/header.pug: common header template.
17.	public/static: directory containing all static resources such as JavaScript files, images, and CSS files that pages may utilize.
18.	router/artworks-router.js: router handling all requests starting with "artworks".
19.	router/users-router.js: router handling all requests starting with "users".

Instruction:
on local:
1.	Go to the "data" directory and run "node database-initializer.js" to initialize all data.
2.	Navigate to the "term-project" directory and execute "node server.js" to launch the project.
3.	Next, open Chrome and enter the following URL: http://localhost:3000.

Overall Design and Implementation Quality:
For the client side, I utilize Pug templates to render pages, placing them under the 'public' directory for client exploration. This practice enhances server security. On the server side, I adopt a modular approach, employing separate JavaScript files to fulfill distinct purposes. For example, I organize all routers into two separate files, contributing to project clarity and facilitating scalability.

To manage data transfer, I employ Mongoose, creating separate files to define models for different collections. This strategy ensures ease of scalability for our project in the future. I ensure that only the necessary client data is transmitted, and no additional information, such as passwords, is sent. This practice enhances the security of our server.

In terms of request handling, I adhere to RESTful design principles—utilizing 'GET' to retrieve data, 'POST' to add new data, and 'DELETE' to remove data. I employ HTTP status codes such as 200, 201, 400, 401, and 404 to convey different outcomes.

Throughout the codebase, I implement 'try-catch' functions to gracefully handle errors, enhancing the overall robustness of the project. Additionally, wherever data is transferred between MongoDB and Ajax requests, I ensure asynchronous operations to optimize server responsiveness.

To manage write operations, I leverage session IDs, ensuring users can only modify their own data and preventing unauthorized requests to alter other users' information.
