const { Router } = require('express');
const {requireAuth} = require('../middleWares/middleware');
const { home_get, login_get, signup_get, reviews_get, signup_post, login_post, logout_get, article_post, game_get, review_post, review_delete, review_get, review_update, article_get } = require('../controllers/controller');
const router = Router();

router.get('/home', home_get);
router.post('/home', article_post);
router.get('/login', login_get);
router.post('/login', login_post);
router.get('/signup', signup_get);
router.post('/signup', signup_post);
router.get('/home/userReviews', requireAuth, reviews_get);
router.get('/logout', logout_get);
router.get('/home/article', requireAuth, article_get);
router.get('/home/userReviews/:id', review_get);
router.get('/home/game/:id', game_get);
router.post('/home/game/:id', review_post);
router.delete('/home/userReviews', review_delete);
router.patch('/home/userReviews/:id', review_update);

module.exports = router;