const fs = require('fs');
const axios = require("axios");
const creds = require("../../credentials.json");

exports.auth = function (req, res) {
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
}

exports.redirect = async function (req, res) {
    try {
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
                res.send("Error, check console");
            }
        });
        res.send('Authentication completed!');
    } catch (err) {
        console.log("Error", err);
        res.send("Error, check console");
    }
}

exports.send = function (req, res) {
    fs.readFile('token.json', (err, content) => {
        if (err) return exports.auth(req, res);
        const access_token = JSON.parse(content).access_token;
        const messageParts = [
            `From: me`,
            `To: <${req.body.to}>`,
            `Subject: ${req.body.subject}`,
            ``,
            `${req.body.message}`
        ];
        const encodedRaw = Buffer.from(messageParts.join('\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const resp = axios.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            "raw": `${encodedRaw}`,
            "payload": {
                "headers": [{
                        "name": "To",
                        "value": `${req.body.to}`
                    },
                    {
                        "name": "From",
                        "value": "me"
                    },
                    {
                        "name": "Subject",
                        "value": `${req.body.subject}`
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