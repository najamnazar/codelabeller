```diff
@@ The main branch contains the code for the regular version of CodeLabeller. @@
+ The code for the demo version is available in the demo branch.
```
# CodeLabeller

## Installing Dependencies

A Linux/Unix environment is required to run this application (tested using Ubuntu). The following dependencies must be installed:

Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -

sudo apt-get install -y nodejs
```

Docker:
```bash
sudo apt-get update

sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io

sudo curl -L "https://github.com/docker/compose/releases/download/1.28.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

docker volume create --name=codelabellerdata
```

SSL/HTTPS certificate (fill in domain name and contact email as appropriate):

DNS A Record for specified domain must point to IP address of host machine, and port 80 must be opened for obtaining the SSL certificate.
```bash
sudo apt-get install -y certbot

sudo certbot certonly --standalone --preferred-challenges http -d <DOMAIN_NAME> --non-interactive --agree-tos -m <CONTACT_EMAIL_ADDRESS>
```

PM2 (Process manager)
```bash
npm install pm2 -g
```

## Setting up the app
1. The `package.json` file needs to be copied to the deployment server, and `npm install` command needs to be run when _starting the project for the first time or whenever new npm project dependencies are added_.

2. [Environment variables](#environment-variables-for-api-server) need to be specified in the provided `.env` file.

3. Create a Docker container for the database (MySQL) and Redis servers (if containers are not already running):
    - Copy the `docker-compose.yaml` provided file to the deployment server. In the same directory as this file.

    - For the passwords to be used for the MySQL and Redis servers container instances, change `<ENTER PASSWORD>` to your desired passwords.

    - Then, run the command within the same working directory as the `docker-compose.yaml` file:
    
    ```bash
    docker-compose up -d
    ```

    - Storing persistent data on External Docker volumes is essential to avoid database data loss, as all data within a container is also destroyed when the container is destroyed.

4. Initialise the database (first run only):
    - Make sure a database with the name as given in the DB_DATABASE_NAME environment variable has been created/exists. Case sensitive database collation must be created/used. For example: `CREATE DATABASE codelabeller COLLATE 'utf8_bin';`
    - [Run the server](#useful-commands) with API_DEPLOY_MODE set to "DEV".
    - Once the server is ready and listening, stop the server, change the API_DEPLOY_MODE environment variable to "PROD" and restart the server.
    - Future runs should have API_DEPLOY_MODE set to "PROD".


5. Initialise a CodeLabeller administrator account (first run only - subsequent accounts can be done via the CodeLabeller administration panel):
    - Once the Docker container for MySQL is running, grab its ID:
    ```bash
    docker ps -a
    ```
    
    ```bash
    docker exec -it <CONTAINER ID> /bin/bash

    # now within container
    mysql -p <DB_DATABASE_NAME>

    # enter database user password, should be the same value as the one specified for the DB_PASSWORD environment variable.

    # run the following SQL query. Replace the email and name values accordingly.
    INSERT INTO `user` (`id`, `timeCreated`, `lastSeen`, `isEnabled`, `isAdmin`, `email`, `givenName`, `familyName`, `currentFileId`) VALUES (uuid(), 'CURRENT_TIMESTAMP(6)', NULL, '1', '1', '<EMAIL ADDRESS>', '<GIVEN NAME>', '<FAMILY NAME>', NULL);
    ```

## Useful commands

- Linux/MacOS

The commands below assume that the current working directory is the project's root directory.

Development commands (localhost)
```bash
# install all project dependencies
npm install

# development
npm run start

# develop in production mode
npm run start:prod
```

Production commands (on a remote server)
```bash
# Build application in production mode
npm run build

# run on server
pm2 start node dist/apps/api/main.js --exp-backoff-restart-delay=100 --name api

pm2 start node dist/apps/frontend-server/main.js --exp-backoff-restart-delay=100 --name proxy
```

```bash
# to stop the server
pm2 delete api

pm2 delete proxy
```

## Environment variables for API server

- `API_DEPLOY_MODE`: "DEV" if dev mode, or "PROD" if prod mode.
- `API_DOMAIN_NAME`: The domain name where the API can be accessed. Do not include http://, https://, or a trailing slash in this value. 
- `API_GLOBAL_PREFIX`: The URL path prefix for all API endpoints. Should include a leading slash.
- `API_PORT`: The port number for which the API server should be listening on.

- `SSL_CERT_ABSOLUTE_PATH`: The absolute path to the SSL certificate file. For certificates issued by Let's Encrypt, use the fullchain.pem file.
- `SSL_PRIVATE_KEY_ABSOLUTE_PATH`: The absolute path to the SSL private key file. For certificates issued by Let's Encrypt, use the privkey.pem file.
- `SSL_CA_ABSOLUTE_PATH`: The absolute path to the certificate authority file. For certificates issued by Let's Encrypt, use the chain.pem file.

- `DB_CONN_NAME`: The internal name/identifier string for the connection to the MySQL database.
- `DB_HOST`: The domain name or IP address of the server hosting the MySQL database.
- `DB_PORT`: The port number of the server on which the database is listening on. Usually "3306".
- `DB_DATABASE_NAME`: The name of the MySQL database to connect to.
- `DB_USERNAME`: The username of the user account that will be used to connect to the MySQL database.
- `DB_PASSWORD`: The password of the user account that will be used to connect to the MySQL database.

- `REDIS_HOST`: The domain name or IP address of the server running Redis.
- `REDIS_PORT`: The port number on which the Redis server is listening on. Usually "3789".
- `REDIS_PASSWORD`: The password that will be used to connect to the Redis server.

- `CORPUS_ABSOLUTE_PATH`: The absolute path to the directory where the corpus will be stored on disk.
- `TEMP_UPLOADS_ABSOLUTE_PATH`: The absolute path to the directory where project upload job files that were uploaded to the server will be temporarily stored on disk.

- `GOOGLE_OAUTH_CLIENT_ID`: The Google OAuth 2.0 Client ID required to enable OAuth login for users. Details on how to get one can be found [here](#creating-an-oauth-client-id)

## Environment variables for frontend-serving server
- `DEPLOY_MODE`: "DEV" if dev mode, or "PROD" if prod mode.
- `DOMAIN_NAME`: The domain name where the frontend app can be accessed. Do not include http://, https://, or a trailing slash in this value. 
- `PORT`: The port number for which the frontend server should be listening on.

- `API_GLOBAL_PREFIX`: The URL path prefix for all API endpoints. Should include a leading slash.

- `API_PORT`: The port number for which the API server is listening on.

- `SSL_CERT_ABSOLUTE_PATH`: The absolute path to the SSL certificate file. For certificates issued by Let's Encrypt, use the fullchain.pem file.
- `SSL_PRIVATE_KEY_ABSOLUTE_PATH`: The absolute path to the SSL private key file. For certificates issued by Let's Encrypt, use the privkey.pem file.
- `SSL_CA_ABSOLUTE_PATH`: The absolute path to the certificate authority file. For certificates issued by Let's Encrypt, use the chain.pem file.



## Creating an OAuth Client ID

Steps:
- Navigate to the [Google API console](https://console.developers.google.com/)
- Create a new Google Cloud project or select an existing one.
- Click on "OAuth consent screen", located in the navigation menu on the left of the screen
- Go through the creation process and select the following:
    - User Type - External
    - Add authorised domain (use the same value as the ```API_DOMAIN_NAME``` environment variable)
    - Scopes: email, profile, openid
    - No need to add test users

- Once consent screen is created, go to "Credentials", which is just above the "OAuth consent screen" button from earlier.
    - Click on: Create credentials > OAuth client ID
    - Application type: Web application
    - Add the following Authorised redirect URIs:
        - http://localhost:4200/login
        - https://localhost:4200/login
        - http://```<API_DOMAIN_NAME>```/login
        - https://```<API_DOMAIN_NAME>```/login

- You will now have a client ID to use as the value for the ```GOOGLE_OAUTH_CLIENT_ID``` environment variable.

## Securing the database on the remote server (recommended)
Enabling UFW with Docker:
```
https://stackoverflow.com/a/58098930
```

```bash
sudo ufw enable

shutdown -r now

# Add UFW rules to allow ports 22, 80, 443, and allow/deny other ports to your liking, e.g:
# ufw allow from <IP address> to any port <port number>
# Ports not specified in any rule are blocked by default.
sudo ufw allow proto tcp from any to any port 80,443
sudo ufw allow http
sudo ufw allow https
sudo ufw allow ssh
```
