# DocumentKHH

DocumentKHH is a website used to lookup, receive, track, manage and store documents and reduce paper at Hue university

## Table of contents

- [Technologies](#technologies)
- [Endpoints](#Endpoints)
- [Screenshots](#screenshots)
- [Setup](#setup)

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

## Setup Locally

```
MONGO_DB_PASSWORD=
MONGO_DB_HOST=localhost
MONGO_DB_PORT=27017
MONGO_DB_NAME=
MONGO_DB_AUTH_SOURCE=admin

S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
S3_REGION_NAME=ap-southeast-3

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_EXPIRE_IN=2592000
REDIS_CONNECT_TIMEOUT=10000

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=1h

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=10d
```
