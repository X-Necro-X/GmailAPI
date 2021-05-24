const fs = require('fs');
const axios = require("axios");

exports.auth = function (req, res) {
    fs.readFile('credentials.json', (err, content) => { // reading stored credentials
        creds = JSON.parse(content); // converting to JSON format
        if (err){ // if credentials not found
            console.log(err);
            res.send('Server side error: Please add credentials.json! Refer README.md for more details.');
            return
        }
        const scope = 'https://www.googleapis.com/auth/gmail.send'; // oauth scope for sending mails
        const {
            auth_uri,
            client_id,
            redirect_uris
        } = creds.web; // storing required information from credentials.json
        res.redirect(auth_uri +
            '?client_id=' + encodeURIComponent(client_id) +
            '&redirect_uri=' + encodeURIComponent(redirect_uris[0]) +
            '&response_type=code' +
            '&scope=' + encodeURIComponent(scope) +
            '&access_type=offline'
        ); // google api call for oauth
    });
}

exports.redirect = async function (req, res) {
    fs.readFile('credentials.json', async (err, content) => { // reading stored credentials
        creds = JSON.parse(content); // converting to JSON format
        if (err){ // if credentials not found
            console.log(err);
            res.send('Server side error: Please add credentials.json! Refer README.md for more details.');
            return
        }
        const code = req.query.code; // getting access code from url
        const {
            token_uri,
            client_secret,
            client_id,
            redirect_uris
        } = creds.web;
        const resp = await axios.post(token_uri, {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uris[0],
            'grant_type': 'authorization_code'
        }); // google api call for exchanging code for token
        fs.writeFile('token.json', JSON.stringify(resp.data), (err) => { // storing token for future usage
            if (err) { // error in saving
                console.log("Error", err);
                res.send("Server side error:",err);
                return;
            }
        });
        res.send('Authentication completed!'); // success message
    });
}

exports.send = function (req, res) {
    const {to, subject, message} = req.body; // storing required parameters
    if (to==null || subject==null || message==null){ // checking for incomplete information
        res.send('Please fill all the fields: `To`, `Subject` and `Message`');
        return;
    }
    fs.readFile('token.json', (err, content) => { // if token not found
        if (err){ 
            res.send("Please complete the authentication first!")
            return;
        }
        const access_token = JSON.parse(content).access_token; // converting token to JSON format
        const messageParts = [
            `From: me`,
            `To: <${to}>`,
            `Subject: ${subject}`,
            ``,
            `${message}`
        ]; // compiling raw message
        const encodedRaw = Buffer.from(messageParts.join('\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); // converting message to web safe base64 raw format
        axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            "raw": `${encodedRaw}`,
            "payload": {
                "headers": [{
                        "name": "To",
                        "value": `${to}`
                    },
                    {
                        "name": "From",
                        "value": "me"
                    },
                    {
                        "name": "Subject",
                        "value": `${subject}`
                    }
                ],
                "mimeType": "text/plain"
            }
        }, {
            headers: {
                Authorization: 'Bearer ' + access_token
            }
        });
        res.send('Mail sent!'); // success message
    });
}