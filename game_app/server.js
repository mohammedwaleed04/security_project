const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const exhb = require('express-handlebars');
const routes = require('./routes/route');
const { checkUser } = require('./middleWares/middleware');

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/static'));

// view engine
app.engine('hbs', exhb.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}))
app.set('view engine', 'hbs');

// database connection
const url = 'mongodb://127.0.0.1:27017/game-app';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to the db...');
        const hostname = '192.168.1.3';
        const port = process.env.PORT || 3000;
        app.listen(port, hostname, () => console.log(`server is running on port ${port}`));
    })
    .catch((err) => console.log(err));

// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.redirect('/home'));
app.use(routes);