import express from 'express';
import { users } from './users.js';
import { catchErrors, ensureLoggedIn } from './utils.js';

export const router = express.Router();

/**
 * Route fyrir lista af notendum.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function userRoute(req, res) {
  const list = await users();

  const data = {
    title: 'Notendur',
    users: list,
    page: 'admin',
  };

  return res.render('users', data);
}

router.get('/', ensureLoggedIn, catchErrors(userRoute));
