/* eslint-disable no-underscore-dangle */
import express from 'express';
import { catchErrors, ensureLoggedIn } from './utils.js';
import { counter, select, deleteRow } from './db.js';

export const router = express.Router();

/**
 * Route fyrir lista af notendum.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function userRoute(req, res) {
  const { username } = req.user;
  let { offset = 0, limit = 50 } = req.query;
  offset = Number(offset);
  limit = Number(limit);

  const registrations = await select(offset, limit);
  const amount = await counter();

  const errors = [];
  const formData = {
    registrations,
  };

  const result = {
    _links: {
      self: {
        href: `/?offset=${offset}&limit=${limit}`,
      },
    },
  };

  if (offset > 0) {
    result._links.prev = {
      href: `/?offset=${offset - limit}&limit=${limit}`,
    };
  }

  if (registrations.length <= limit) {
    result._links.next = {
      href: `/?offset=${Number(offset) + limit}&limit=${limit}`,
    };
  }

  const pageCount = {
    currentPage: `${(offset / 50) + 1}`,
    lastPage: `${Math.ceil(amount.count / 50)}`,
  };

  return res.render('admin', {
    username, errors, formData, result, amount, pageCount,
  });
}

/**
 * Route til að eyða undirskrift
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function deleteSignatures(req, res) {
  const { id } = req.params;

  await deleteRow([id]);

  return res.redirect('/admin');
}

router.get('/', ensureLoggedIn, catchErrors(userRoute));
router.post('/delete/:id', ensureLoggedIn, catchErrors(deleteSignatures));
