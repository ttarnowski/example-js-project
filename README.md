# Example Node.js Express project

Simple user app based on express.

## Installation

Clone the repository:

```
git clone git@github.com:ttarnowski/example-js-project.git
```

Install dependencies:

```
npm install
```

## Usage

Run:

```
npm start
```

to start the application

## Endpoints

### GET /users

Get all users:

```
curl localhost:3000/users
```

### GET /user/:id

Get a single user:

```
curl localhost:3000/user/USER_ID
```

where USER_ID should be replaced with the actual user id that you'd like to retrieve

### POST /user

Add new user:

```
curl -X POST -H "Content-type: application/json" -d '{"user":{"name":"Test User", "otherField", "otherValue"}}' localhost:3000/user
```

Any fields under "user" in the JSON are accepted

## Licence

MIT
