const cookieParser = require('cookie-parser');
const User = require('../models/user');
const Review = require('../models/review');
const Game = require('../models/game');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const CryptoJS = require("crypto-js");

// handling errors
const signupErrors = (err) => {
    const errors = {username: '', email: '', password: ''}
    if(err.message.includes('User validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }
    else if(err.message.includes('username') && err.code === 11000){
        errors.username = 'this username is already used';
    }
    else{
        errors.email = 'this email is already registered';
    }
    return errors;
}

const loginErrors = (err) => {
    const errors = {email: '', password: ''}
    if(err.message.includes('Email')){
        errors.email = err.message;
    }
    else{
        errors.password = err.message;
    }
    return errors;
}

const reviewErrors = (err) => {
    const errors = {rating: ''}
    if(err.message){
        if(err.message.includes('Number')) {
            errors.rating = 'Rating must be a number between 0 and 10';
            return errors;
        }
        errors.rating = err.message.slice(34);
    }
    return errors;
}

const articleErrors = (err) => {
    const errors = {game: '', description: '', rating: ''}
    if(!err.message.includes('Number')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }
    else {
        errors.rating = 'Rating must be a number between 0 and 10';
    }
    return errors;
}

// create jwt token
const maxAge = 60*60*0.5;
const createToken = (id) => {
    return jwt.sign({id}, 'mohammed04', {expiresIn: maxAge});
}

// routes
const home_get = (req, res) => {
    Game.find().lean()
    .then(result => res.render('home', {title: 'Home', games: result}))
    .catch(err => console.log(err));
}

const article_get = (req, res) => {
    res.render('article', {title: 'Add Article'});
}

const article_post = async (req, res) => {
    try {
        const game = await Game.create(req.body);
        res.json({redirect: '/home'});
    }
    catch (err) {
        const errors = articleErrors(err);
        res.json({errors});
    }
}

const login_get = (req, res) => {
    res.render('login', {title: 'Login'});
}

const login_post = async (req, res) => {
    const {email, password} = req.body;
    const pass  = CryptoJS.AES.decrypt(password, 'anything').toString(CryptoJS.enc.Utf8);
    try {
        const user = await User.login(email, pass);
        const token = createToken(user._id);
        res.cookie('jwt', token, {maxAge: maxAge*1000, httpOnly: true});
        res.json({user: user._id});
    }
    catch (err) {
        const errors = loginErrors(err);
        res.json({errors});
    }
}

const signup_get = (req, res) => {
    res.render('signup', {title: 'Register'});
}

const signup_post = async (req, res) => {
    const {username, email, password} = req.body;
    const pass  = CryptoJS.AES.decrypt(password, 'anything').toString(CryptoJS.enc.Utf8);
    try {
        const user = await User.create({username, email, password: pass});
        const token = createToken(user._id);
        res.cookie('jwt', token, {maxAge: maxAge*1000, httpOnly: true});
        res.json({user: user._id});
    }
    catch (err) {
        const errors = signupErrors(err);
        res.json({errors});
    }
}

const reviews_get = (req, res) => {
    res.render('userReviews', {title: 'Reviews'});
}

const logout_get = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/home');
}

const game_get = async (req, res) => {
    const id = req.params.id;
    try {
        const game = await Game.findOne({_id: id}).lean()
        const reviews = await Review.find({game: game.game}).lean();
        res.render('game', {title: 'Game', game, reviews});
    }
    catch (err) {
        console.log(err);
    }
}

const review_post = async (req, res) => {
    try {
        const review = await Review.find({game: req.body.game, user: req.body.user});
        if(review[0]) {
            const errors = {rating: 'You can only add one review to an article.'}
            res.json({errors});
        }
        else {
            const rev = await Review.create(req.body);
            const game = await Game.findOne({game: rev.game});
            res.json({redirect: '/home/game/' + game._id});
        }
    }
    catch (err) {
        const errors = reviewErrors(err);
        res.json({errors});
    }
}

const review_get = (req, res) => {
    const id = req.params.id;
    Review.findOne({_id: id}).lean()
    .then(result => res.render('review', {title: 'Update Review', review: result}))
    .catch(err => console.log(err));
}

const review_delete = (req, res) => {
    Review.findOneAndDelete(req.body)
    .then(result => res.json({redirect: '/home/userReviews'}))
    .catch(err => console.log(err));
}

const review_update = (req, res) => {
    Review.findOneAndUpdate({_id: req.body.id}, req.body.update, { new: true })
    .then(result => res.json({redirect: '/home/userReviews'}))
    .catch(err => {
        console.log(err);
    });
}

module.exports = {
    home_get,
    login_get,
    signup_get,
    game_get,
    reviews_get,
    signup_post,
    login_post,
    logout_get,
    review_post,
    article_post,
    review_delete,
    review_get,
    review_update,
    article_get
}