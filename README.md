# AutoMarkt REST API
This is an API for a very basic buy&sell vehicles application, built for educational purposes.
It is relies on ExpressJS, MongoDB and AWS S3.

## Getting started
To run the server follow the guide:
1. Set the following environment variables: 
> NODE_ENV, PORT, DB_CONNECTION_STRING, SECRET, AWS_AccessKeyID, AWS_SecretAccessKey, ORIGIN

`AWS_AccessKeyID, AWS_SecretAccessKey` are optinal if you use AWS S3 for storing images

2. Set your origin in server.js
3. open a command prompt and run `npm install` to install the dependencies
4. run `npm start` and make requests

## Authentication
The API uses **refresh access tokens** for authentication. On request which requires authentication the API verifies the **access token** if present. If it is not valid or not present the server checks for a refresh token and if so whether it is valid. On valid token the server sets a cookie with **access token**. If there is no **refresh token**, user should login.

### Register
Register a user by sending a `POST` request to `/register` with body that contains email, username and password `{ email, username, password }`. Upon succesful registration the service responds json object: `{ _id, email, username }`

### Login
Log in by sending a `POST` request with email and password to `/login`. The service will respond with an object that contains user information `{ _id, email, username }` and sets cookies for the **refresh token** and for the **access token** . The x-token cookie has short lifetime and will be refreshed automatically.

### Logout
Log out by sending `GET` request to `/logout`. The service responds with `{ message: 'Logged out' }` if the user is logged in.

### Check you authentication status
- Method `GET`
- Endpoint `/me`
- Returns `JSON`

## Get URL for uploading image to AWS S3
You should be logged in to request URL.
Send a `GET` request to the endpoint.

- Method `GET`
- Endpoint `/vehicles/imageUploadUrl`
- Returns `JSON`

## CRUD Operations ON Vehicles
Supported request are `GET`,`POST`,`PUT`,`DELETE`

### CREATE
You should be logged in to create a vehicle!
Send a POST request to the endpoint. The with body, containing `{ make, model, description, mileage, year, category, VIN, price, imageUrl }`. The service will respond with the object, created in the database, which will have an added _id and creator properties, that are automatically generated.

- Method `POST`
- Endpoint `/vehicles/create`
- Headers `Content-Type: application/json`
- Body Format `JSON`
- Returns `JSON`

### READ
Send a `GET` request to the endpoint.

- Method `GET`
- Endpoint for every vehicle `/vehicles`
- Endpoint for specific product `/vehicles/:_id`
- Endpoint for vehicles in specific category `/vehicles?category=<category>`
- Endpoint for vehicles in price interval `/vehicles?priceGreaterThan=<price>&priceLowerThan=<price>`
- Endpoint for vehicles from specific make/s `/vehicles?makes=<make>&makes=<make>&makes=<make>`
- Endpoint for vehicles from specific year/s `/vehicles?yearGreaterThan=<year>&yearLowerThan=<year>`
- Endpoint for vehicles with specific mileage `/vehicles?mileageGreaterThan=<mileage>&mileageLowerThan=<mileage>`
- Endpoint for vehicles with sorting `/vehicles?sort=<sorting>`
- Endpoint for paginated vehicles  `/vehicles?page=<currentPage>&pageSize=<sizeOfThePage>`
- You can also mix params `/vehicles?category=<category>&sort=<sorting>&page=<currentPage>&pageSize=<sizeOfThePage>`
- Endpoint for latest vehicles `/vehicles?latest=<number>`
- Endpoint for count of all vehicles `/vehicles/count`
- Endpoint for count of vehicles in category `/vehicles/count?category=<category>`
- Endpoint for vehicle category types that are used now `/vehicles/categories?used=true`
- Endpoint for vehicle available category types `/vehicles/categories?used=false`
- Endpoint for category aggreagated data `/vehicles/categoryData?category=<category>`
- Returns `JSON`

> Available sorting types are ['makeAsc', 'makeDesc', 'priceAsc', 'priceDesc', 'yearAsc', 'yearDesc', 'postedOnAsc', 'postedOnDesc'].

### UPDATE
You should be the creator of the vehicle to edit it!
Send a POST request to the endpoint. The with body, containing and object with the information you want to update. The service will respond with the updated object.

- Method `PUT`
- Endpoint `/vehicles/:_id`
- Headers `Content-Type: application/json`
- Body Format `JSON`
- Returns `JSON`

### DELETE
Send a `GET` request to the endpoint.
You should be the creator of the vehicle to delete it!

- Method `GET`
- Endpoint `/vehicles/:_id`
- Returns `Vehicle has been deleted`

## CRUD Operations On Shopping Cart
Supported request are `GET`,`POST`, `DELETE`

### CREATE
You should be logged in to create a shopping cart!
Send a POST request to the endpoint. The with body, containing `{ items }`. The service will respond with the object, created in the database, which will have an added _id and owner_id automatically generated.

- Method `POST`
- Endpoint `/shoppingCart/create`
- Headers `Content-Type: application/json`
- Body Format `JSON`
- Returns `JSON`

### READ
Send a `GET` request to the endpoint.

- Method `GET`
- Endpoint for every vehicle `/shoppingCart`
- Returns `JSON`

### DELETE
Send a `GET` request to the endpoint.
You should be the creator of the product to delete it!

- Endpoint `/vehicles/:_id`
- Returns `Vehicle has been deleted`
## CRUD Operations On Shopping Cart
Supported request are `GET`,`POST`, `DELETE`

### CREATE
You should be logged in to create a shopping cart!
Send a POST request to the endpoint. The with body, containing `{ items }`. The service will respond with the object, created in the database, which will have an added _id and owner_id automatically generated.

- Method `POST`
- Endpoint `/shoppingCart/create`
- Headers `Content-Type: application/json`
- Body Format `JSON`
- Returns `JSON`

### READ
Send a `GET` request to the endpoint.

- Method `GET`
- Endpoint for every vehicle `/shoppingCart`
- Returns `JSON`

### DELETE
Send a `GET` request to the endpoint.
You should be the creator of the product to delete it!

- Method `GET`
- Endpoint `/shoppingCart`

## The same is for the wish list

## CRUD Operations On Order
Supported request are `GET`,`POST`

### CREATE
Send a POST request to the endpoint. The with body, containing `{ firstName, lastName, country, town, street, zip, phone }`. The service will respond with the object, created in the database, which will have an added _id and owner_id if you are logged in automatically generated.

- Method `POST`
- Endpoint `/orders`
- Headers `Content-Type: application/json`
- Body Format `JSON`
- Returns `JSON`

### READ
Send a `GET` request to the endpoint.

- Method `GET`
- Endpoint for all orders (only for authenticated) `/orders`
- Endpoint for specific order `/orders/:_id`
- Returns `JSON`

# IN THE FIRST COMMITS THERE IS ENV VARIABLES FILE WITH VALUES THAT WERE ONLY FOR TEST PURPOSES