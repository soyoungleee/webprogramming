var express = require('express'),
  User = require('../models/user');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/signin', function(req, res, next) {
  res.render('signin');
});

// 09-1. Session 참고: 세션을 이용한 로그인
router.post('/signin', function(req, res, next) {
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      res.render('error', {message: "Error", error: err});
    } else if (!user || user.password !== req.body.password) {
      req.flash('danger', '아이디나 비밀번호를 다시 확인해주세요 :)');
      res.redirect('back');
    } else {
      req.session.user = user;
      req.flash('success', '환영합니다 ',user.name, '님! 여행 떠날 준비 되셨나요?');
      res.redirect('/');
    }
  });
});

router.get('/signout', function(req, res, next) {
  delete req.session.user;
  req.flash('success', '로그아웃 되셨습니다! 다음에 또 만나요!');
  res.redirect('/');
});

module.exports = router;
