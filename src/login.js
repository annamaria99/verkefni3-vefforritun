/**
import passport from 'passport';
import { Strategy } from 'passport-local';
import express from 'express';
import session from 'express-session';
import { userStrategy, serializeUser, deserializeUser } from './users.js';

export const router = express.Router();

const sessionSecret = 'leyndarmál';

// Erum að vinna með form, verðurm að nota body parser til að fá aðgang
// að req.body
router.use(express.urlencoded({ extended: true }));

// Passport mun verða notað með session
router.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 30 * 24 * 60 * 1000, // 30 dagar
}));

passport.use(new Strategy(userStrategy));

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

// Látum express nota passport með session
router.use(passport.initialize());
router.use(passport.session());

// Gott að skilgreina eitthvað svona til að gera user hlut aðgengilegan í
// viewum ef við erum að nota þannig
router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }
  return res.render('login', { page: 'login', title: 'Innskráning', message });
}

router.post(
    '/login',

    // Þetta notar strat að ofan til að skrá notanda inn
    passport.authenticate('local', {
      failureMessage: 'Notandanafn eða lykilorð vitlaust.',
      failureRedirect: '/login',
    }),

    // Ef við komumst hingað var notandi skráður inn, senda á /admin
    (req, res) => {
      res.redirect('/admin');
    },
  ));

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  router.get('/admin', ensureLoggedIn);
  */
