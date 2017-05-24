'use strict';

var express = require('express');
var controller = require('./kazen.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', auth.hasOneOfRoles(['admin', 'knaz', 'moderator']), controller.create);
router.put('/:id', auth.hasOneOfRoles(['admin', 'knaz', 'moderator']), controller.upsert);
router.patch('/:id', auth.hasOneOfRoles(['admin', 'knaz', 'moderator']), controller.patch);
router.delete('/:id', auth.hasOneOfRoles(['admin', 'knaz', 'moderator']), controller.destroy);

module.exports = router;
