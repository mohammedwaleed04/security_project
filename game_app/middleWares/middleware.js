const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Review = require('../models/review')

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token) {
        jwt.verify(token, 'mohammed04', async (err, decodedToken) => {
            if(err) {
                res.locals.user = null;
                next();
            }
            else {
                const user = await User.findById(decodedToken.id).lean();
                res.locals.user = user;
                if(user) {
                    res.locals.review = await Review.find({user: user.username}).lean();
                }
                next();
            }
        })
    }
    else {
        res.locals.user = null;
        next();
    }
}

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token) {
        jwt.verify(token, 'mohammed04', (err, decodedToken) => {
            if(err) {
                console.log(err);
                res.redirect('/login');
            }
            else {
                next();
            }
        })
    }
    else {
        console.log(token);
        res.redirect('/login');
    }
}

module.exports = {
    requireAuth,
    checkUser
}