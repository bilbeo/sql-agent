

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

#### Which file I should choose for the installation?

If you are on Windows, please download `.exe` format. The app will be automatically installed once you open the file and give the permission to run the app.

If you are on Mac, please download `.dmg` format.

If on Linux, you should select `.AppImage` format. In order to make it work, you will need to right-click on the file, select `Properties`, go to `Permissions` tab and check `Execute` checkbox. Then just open the file. Please avoid renaming or removing `.AppImage` file, the desktop app will stop working. You can move the file to your preferred location, but you will need to launch the app from there once to make it work correctly afterwards.
