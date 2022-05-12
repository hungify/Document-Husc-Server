# DocumentKHH

DocumentKHH is a website used to lookup, receive, track, manage and store documents and reduce paper at Hue university

## Table of contents

- [Technologies](#technologies)
- [Endpoints](#endpoints)
- [Screenshots](#screenshots)
- [Guidelines to setup](#guidelines-to-setup)

## Technologies

- Node.js
- Express
- JsonWebToken
- Mongoose
- AWS S3 V3
- Redis
- Multer
- Libraries such as Bcryptjs Compression, Helmet, Joi...
  .

## Endpoints

### `{API_URL}/api`

#### Auths

#### Users

#### Categories

#### Departments

#### Agencies

#### TypesOfDocuments

#### UrgentLevels

#### Inbox

#### Send

#### Dashboard

## Screenshots

## Guidelines to setup

### Manual Setup

1. Git clone and Open source code via Editor
2. Create `env.dev` and the format should be as given in `.env.example`
3. Run `npm install`
4. Run `npm start`

### Docker setup

The back-end has support for Docker Compose. So if you want to run the back-end in a container, you need do:

1. Setup environment variables in `.env.dev` file. Note when you use Docker setup and run the database in localhost (host machine)
2. Build the Docker image and Run container

```
docker-compose --env-file .env.dev up

```

3. Stop and remove containers and networks

```
docker-compose --env-file .env.dev down

```

4. If you want connecting to MongDB inside docker container with GUI. Use connection string below

```
mongodb://*yourUser*:**yourPass**@localhost:27017/**yourDbName**?authSource=**yourDbName**

```
