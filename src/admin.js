/* eslint-disable no-underscore-dangle */
import express from 'express';
import { catchErrors, ensureLoggedIn } from './utils.js';
import { select } from './db.js';

export const router = express.Router();

const {
  PORT: port = 3000,
} = process.env;

/**
 * Route fyrir lista af notendum.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function userRoute(req, res) {
  let { offset = 0, limit = 50 } = req.query;
  offset = Number(offset);
  limit = Number(limit);

  const registrations = await select(offset, limit);

  const errors = [];
  const formData = {
    registrations,
  };

  const result = {
    _links: {
      self: {
        href: `http://localhost:${port}/?offset=${offset}&limit=${limit}`,
      },
    },
  };

  if (offset > 0) {
    result._links.prev = {
      href: `http://localhost:${port}/?offset=${offset - limit}&limit=${limit}`,
    };
  }

  if (registrations.length <= limit) {
    result._links.next = {
      href: `http://localhost:${port}/?offset=${Number(offset) + limit}&limit=${limit}`,
    };
  }

  return res.render('admin', { errors, formData, result });
}

router.get('/', ensureLoggedIn, catchErrors(userRoute));
