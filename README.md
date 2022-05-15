# DocumentKHH

DocumentKHH is a website used to lookup, track, manage, store documents and reduce paper at Hue university

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

#### Draft

#### Archives

#### Dashboard

## Screenshots

## Guidelines to setup

### Manual Setup

1. Git clone and Open source code via Editor
2. Create `.env` and the format should be as given in `.env.example`
3. Generate a self-signed SSL certificate for https, run command below

```
mkdir security && cd security
openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes \
  -keyout localhost.key -out localhost.crt -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:localhostt,IP:10.0.0.1"
```

- Enter password and verify password
- It will then prompt you for things like "Country Name", but you can just hit Enter and accept the defaults.

4. Run `npm install`
5. Run `npm start`

### Docker setup

The back-end has support for Docker Compose. So if you want to run the back-end in a container, you need do:

1. Setup environment variables in `.env` file. Note when you use Docker setup and run the database in localhost (host machine)
2. Build image

```
docker build -t server-node:latest .
```

3. Run container

```
docker-compose up
```

3. Stop and remove containers and networks

```
docker-compose down
```

5. If you want connecting to MongDB inside docker container with GUI, use connection string below

```
mongodb://*yourUser*:**yourPass**@localhost:27017/**yourDbName**?authSource=**yourDbName**
```
