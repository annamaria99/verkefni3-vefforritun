/* eslint-disable no-underscore-dangle */
import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { catchErrors } from './utils.js';
import {
  list, counter, insert, select,
} from './db.js';

export const router = express.Router();

const {
  PORT: port = 3000,
} = process.env;

async function paging(req, res) {
  let { offset = 0, limit = 50 } = req.query;
  offset = Number(offset);
  limit = Number(limit);

  const registrations = await select(offset, limit);
  const amount = await counter();

  const errors = [];
  const formData = {
    name: '',
    nationalId: '',
    anonymous: false,
    comment: '',
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

  const pageCount = {
    currentPage: `${(offset / 50) + 1}`,
    lastPage: `${Math.ceil(amount.count / 50)}`,
  };

  return res.render('index', {
    errors, formData, result, amount, pageCount,
  });
}

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

const validationMiddleware = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 128 })
    .withMessage('Nafn má að hámarki vera 128 stafir'),
  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('nationalId')
    .matches(new RegExp(nationalIdPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  body('comment')
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),
];

// Viljum keyra sér og með validation, ver gegn „self XSS“
const xssSanitizationMiddleware = [
  body('name').customSanitizer((v) => xss(v)),
  body('nationalId').customSanitizer((v) => xss(v)),
  body('comment').customSanitizer((v) => xss(v)),
  body('anonymous').customSanitizer((v) => xss(v)),
];

const sanitizationMiddleware = [
  body('name').trim().escape(),
  body('nationalId').blacklist('-'),
];

async function validationCheck(req, res, next) {
  const {
    name, nationalId, comment, anonymous,
  } = req.body;

  const formData = {
    name, nationalId, comment, anonymous,
  };
  const registrations = await list();

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.render('index', { formData, errors: validation.errors, registrations });
  }

  return next();
}

async function register(req, res) {
  const {
    name, nationalId, comment, anonymous,
  } = req.body;

  let success = true;

  try {
    success = await insert({
      name, nationalId, comment, anonymous,
    });
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect('/');
  }

  return res.render('error', { title: 'Gat ekki skráð!', text: 'Hafðir þú skrifað undir áður?' });
}

router.get('/', catchErrors(paging));

router.post(
  '/',
  validationMiddleware,
  xssSanitizationMiddleware,
  catchErrors(validationCheck),
  sanitizationMiddleware,
  catchErrors(register),
);
