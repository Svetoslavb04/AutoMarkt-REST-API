# eLaden REST API
This is an API for a very basic ecommerce application, built for educational purposes.
It is relies on ExpressJS, MongoDB and AWS S3.

## Getting started
To run the server follow the guide:
1. Set the following environment variables: 
> NODE_ENV, PORT, DB_CONNECTION_STRING, SECRET, ACCESS_TOKEN_EXPIRATION_IN_SECONDS, REFRESH_TOKEN_EXPIRATION_IN_SECONDS, AWS_AccessKeyID, AWS_SecretAccessKey
2. open a command prompt and run `npm install` to install the packages
3. run `npm start` and make requests

## Authentication
The API uses **refresh access tokens** for authentication. On request which requires authentication the API verifies the **access token** if present. If it is not valid or not present the server checks for a refresh token and if so whether it is valid. On valid token the server sets a new cookie with **access token**. If there is no **refresh token**, user should login.

### Register
Register a user by sending a `POST` request to `/register` with body, containing email, username and password `{ email, username, password }`. Upon succesful registration the service responds json object: `{ _id, email, username }`

### Login
Log in by sending a `POST` request with email and password to `/login`. The service will respond with an object that contains user information `{ _id, email, username }` and sets two cookies: one with the **refresh token** and one for a **access token** with short lifetime.

### Logout
Log out by sending `GET` request to `/logout`. The service responds with `{ message: 'Logged out' }` if the user is logged in.

## Get URL for uploading image to AWS S3
You should be logged in to request URL.
Send a `GET` request to the endpoint.

- Method `GET`
- Endpoint `/products/imageUploadUrl`
- Returns `JSON`

## CRUD Operations
Supported request are `GET`,`POST`,`PUT`,`DELETE`

### Create
You should be logged in to create a product!
Send a POST request to the endpoint. The with body, containing `{ brand, model, description, serialNumber, category, price, imageUrl }`. The service will respond with the object, created in the database, which will have an added _id and creator properties, that are automatically generated.

- Method `POST`
- Endpoint `/products/create`
- Headers `Content-Type: application/json`
- Body Format `JSON`
- Returns `JSON`

### Read
Send a `GET` request to the endpoint.

- Method `GET`
- Endpoint for every product `/products`
- Endpoint for specific product `/products/:_id`
- Returns `JSON`

### UPDATE
You should be the creator of the product to edit it!
Send a POST request to the endpoint. The with body, containing and object with the information you want to update. The service will respond with the updated object.

- Method `PUT`
- Endpoint `/products/:_id/edit`
- Headers `Content-Type: application/json`
- Body Format `JSON`
- Returns `JSON`

### Read
Send a `GET` request to the endpoint.
You should be the creator of the product to delete it!

- Method `GET`
- Endpoint `/products/:_id`
- Returns `Product has been deleted`
