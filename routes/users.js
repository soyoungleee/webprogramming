var express = require('express'),
    User = require('../models/user');
var router = express.Router();

function needAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/signin');
  }
}

function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  var type = form.type || "";
  name = name.trim();
  email = email.trim();
  type = type.trim();

  if (!name) {
    return 'Name is required.';
  }

  if (!email) {
    return 'Email is required.';
  }

  if (!form.password && options.needPassword) {
    return 'Password is required.';
  }

  if (form.password !== form.password_confirmation) {
    return 'Passsword do not match.';
  }

  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  if (!type) {
    return 'Type is required.';
  }

  return null;
}

/* GET users listing. */
router.get('/', needAuth, (req, res, next) => {
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    console.log("err", err);
    console.log(users);
    
    res.render('users/index', {users: users});
  }); // TODO: pagination?
});

router.get('/new', (req, res, next) => {
  console.log(req.params);
  res.render('users/new', {messages: req.flash()});
});


router.get('/:id/edit', needAuth, (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/edit', {user: user});
  });
});



router.put('/:id', needAuth, (req, res, next) => {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', '존재하지 않는 사용자입니다.');
      return res.redirect('back');
    }

    if (user.password !== req.body.current_password) {
      req.flash('danger', '비밀번호가 일치하지 않습니다.');
      return res.redirect('back');
    }

    user.name = req.body.name;
    
    user.email = req.body.email;
   

    if (req.body.password) {
      user.password = req.body.password;
    }

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '변경이 완료되었습니다.');
      res.redirect('/users');
    });
  });
});

router.delete('/:id', needAuth, (req, res, next) => {
  User.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '탈퇴가 완료되었습니다.');
    res.redirect('/users');
  });
});

router.get('/:id', (req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/show', {user: user});
  });
});

router.post('/', (req, res, next) => {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '이미 존재하는 이메일 주소입니다.');
      return res.redirect('back');
    }
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      type: req.body.type
    });
    newUser.password = req.body.password;

    newUser.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', '회원가입이 완료되었습니다.');
        res.redirect('/');
      }
    });
  });
});





module.exports = router;
