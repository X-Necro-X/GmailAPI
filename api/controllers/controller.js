const fs = require('fs');
const axios = require("axios");

exports.auth = function (req, res) {
    fs.readFile('credentials.json', (err, content) => {
        creds = JSON.parse(content);
        if (err){
            console.log(err);
            res.send('Server side error: Please add credentials.json! Refer README.md for more details.');
            return
        }
        const scope = 'https://www.googleapis.com/auth/gmail.send';
        const {
            auth_uri,
            client_id,
            redirect_uris
        } = creds.web;
        res.redirect(auth_uri +
            '?client_id=' + encodeURIComponent(client_id) +
            '&redirect_uri=' + encodeURIComponent(redirect_uris[0]) +
            '&response_type=code' +
            '&scope=' + encodeURIComponent(scope) +
            '&access_type=offline'
        );
    });
}

exports.redirect = async function (req, res) {
    fs.readFile('credentials.json', async (err, content) => {
        creds = JSON.parse(content);
        if (err){
            console.log(err);
            res.send('Server side error: Please add credentials.json! Refer README.md for more details.');
            return
        }
        const code = req.query.code;
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
        });
        fs.writeFile('token.json', JSON.stringify(resp.data), (err) => {
            if (err) {
                console.log("Error", err);
                res.send("Server side error:",err);
                return;
            }
        });
        res.send('Authentication completed!');
    });
}

exports.send = function (req, res) {
    const {to, subject, message} = req.body;
    if (to==null || subject==null || message==null){
        res.send('Please fill all the fields: `To`, `Subject` and `Message`');
        return;
    }
    fs.readFile('token.json', (err, content) => {
        if (err){ 
            res.send("Please complete the authentication first!")
            return;
        }
        const access_token = JSON.parse(content).access_token;
        const messageParts = [
            `From: me`,
            `To: <${to}>`,
            `Subject: ${subject}`,
            ``,
            `${message}`
        ];
        const encodedRaw = Buffer.from(messageParts.join('\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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
        res.send('Mail sent!');
    });
}