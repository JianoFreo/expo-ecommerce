confiure the models and the routes. 

we are using clerkj auth instead of jwt, so we will create a middleware to check if the user is an admin by comparing the email in the clerk auth object with the admin email in the env variables.

download a builit in middleware: multer
cd backend

npm install multer

multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. We will use multer to handle product image uploads in the admin dashboard.