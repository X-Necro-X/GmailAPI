const fs = require('fs');
const request = require('request');

exports.auth = function (req, res) {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Credentials not present in the directory!');
        const creds = JSON.parse(content);
        const scope = 'https://www.googleapis.com/auth/gmail.readonly';
        const {
            auth_uri,
            client_id,
            redirect_uris
        } = creds.web;
        res.redirect(auth_uri + '?client_id=' + client_id + '&redirect_uri=' + redirect_uris[0] + '&response_type=code' + '&scope=' + scope);
    });
};

exports.redirect = function (req, res) {
    fs.readFile('credentials.json', (err, content) => {
        const creds = JSON.parse(content);
        const code = req.query.code;
        const {
            token_uri,
            client_secret,
            client_id,
            redirect_uris
        } = creds.web;
        request.post(token_uri, {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uris[0],
            'grant_type': 'authorization_code'
        }, (err, resp)=>{
            if(err) return console.log('ERROR');
            res.send(resp);
        });
    });
}