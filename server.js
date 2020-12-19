const express = require('express');
const app = express();
const port = process.env.port || 3000;

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

const bodyParser = require('body-parser');

const path = require('path');

//mysql connection for adding users/budget
var connection = mysql.createConnection({
    host     : 'sql9.freemysqlhosting.net',
    user     : 'sql9382906',
    password : 'DyicicfBIG',
    database : 'sql9382906'
});


app.get('/api/signup', async (req, res) => {
    const {username, password} = res.body; //Encrypt
    const pwd = password; //transform to MySQL date format
    const date = transformedDate(new Date().toISOString().slice(0, 19).replace('T', ' '));

    connection.connect();
    connection.query('INSERT INTO user VALUES ("", ?, ?)', [username, pwd], function (error, results, fields) {
        connection.end();
        if (error) throw error;
        res.json(results);
    });
});



app.get('/', async (req, res) => {
    connection.connect();

    connection.query('SELECT * FROM user', function (error, results, fields) {
        connection.end();
        if (error) throw error;
        res.json(results);
    });
});


//hard coded preset login information
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'Marcus',
        password: '123'
    },
    {
        id: 2,
        username: 'Pierce',
        password: '456'
    }
];

app.post('/api/login', (req, res) => {

    const { username, password } = req.body;

    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '7d' });
                res.json({
                    success: true,
                    err: null,
                    token
                });
                break;
            }
            else {
                res.status(401).json({
                    success: false,
                    token: null,
                    err: 'Username or password is incorrect'
                });
            }
        }

});

app.get('/api/dashboard', jwtMW, (req, res) => {
    console.log(req);
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see!!!'
    });
});

//Added settings
app.get('/api/settings', jwtMW, (req, res) => {
    console.log(req);
    res.json({
        success: true,
        myContent: 'This is where the settings are!'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.use(function (err, req, res, next) {
    if(err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    }
    else {
        next(err);
    }
});



app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`)
});