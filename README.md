

## Bilbeo SQL Agent

This is companion desktop application to the www.bilbeo.com platform. Bilbeo provides a way to query database from the servers,
however, in case if you don't want to share the database credentials, you can use this app to run the queries locally and forward
the processed data to the Bilbeo servers.

## How to use

1. Register in www.bilbeo.com
2. Download desktop application [here](https://github.com/bilbeo/sql-agent/releases/latest)
3. Login to the app by your credentials
4. Create workspace from the application
5. Create indicators and their queries

This should be enough to get you started. The workspace will be updated periodically, based on what is your frequency.

## FAQ

#### What is the purpose of SQL Agent?

You don't provide SQL credentials to Bilbeo. Credentials are stored on your local machine and agent serves as a proxy.

#### What is the technical difference between web workspace and desktop workspace?

The difference is in the way querying and processing is done. From Bilbeo perspective it's Push versus Pull. In case of 
web workspace the Bilbeo server will use the stored credentials to query the database. In case of push, the desktop app will use
locally stored credentials for querying, after which the processed data will be pushed to Bilbeo server.

