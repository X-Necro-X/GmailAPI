# GmailAPI
API in ExpressJS for sending mails using Gmail REST API without using client libraries
## How to use?
1. Create an OAuth client ID of type- **Web Application** in [Google Developer Console](https://console.cloud.google.com/apis/credentials/) 
2. Save the credentials in the working directory of the app with the name- ***credentials.json***
3. The API can now be accessed.
4. API endpoints:
    - **GET** /auth
        + starts OAuth procedure
    - **POST** /send
        + sends email using authorized credentials
        + POST request will contain 3 parameters:
            * to : Email of the receiver
            * subject : Subject of the Email
            * message : Message to be sent through Email