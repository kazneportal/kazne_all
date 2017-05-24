/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/kazne              ->  index
 * POST    /api/kazne              ->  create
 * GET     /api/kazne/:id          ->  show
 * PUT     /api/kazne/:id          ->  upsert
 * PATCH   /api/kazne/:id          ->  patch
 * DELETE  /api/kazne/:id          ->  destroy
 */

'use strict';
import _ from 'lodash';

import jsonpatch from 'fast-json-patch';
import Kazen from './kazen.model';
import Promise from 'bluebird';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

/**
 * verifies that the kazen belongs to the logged in knaz
 */
function verifyUserRef(req, kazen) {
  return new Promise((resolve, reject) => {
    if(req.user.role === 'knaz' && kazen.userRef && kazen.userRef.toString() !== req.user._id.toString()) {
      reject(new Error({message: 'Knaz does not have rights to touch other knaz kazen'}));
    }
    resolve();
  });
}

/**
 * verifies the rights of the moderator to post as knaz
 */
function verifyIsLinkedUser(req, kazen) {
  return new Promise((resolve, reject) => {
    const linkedUsers = _.map(req.user.linkedUsers, user => user.toString());
    if(req.user.role === 'moderator' && kazen.userRef && _.indexOf(linkedUsers, kazen.userRef.toString()) === -1) {
      reject(new Error({message: 'Moderator does not have suffiecient rights for this'}));
    }
    resolve();
  });
}

function verifyTouchedKazen(req, kazen) {
  if(kazen) {
    return verifyUserRef(req, kazen)
    .then(() => verifyIsLinkedUser(req, kazen))
    .then(() => kazen);
  }
  return kazen;
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Kazens
export function index(req, res) {
  return Kazen.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Kazen from the DB
export function show(req, res) {
  return Kazen.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Kazen in the DB
export function create(req, res) {
  return verifyIsLinkedUser(req, req.body)
    .then(() => verifyUserRef(req, req.body))
    .then(() => Kazen.create(req.body))
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Kazen in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Kazen.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Kazen in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Kazen.findById(req.params.id).exec()
    .then(kazen => verifyTouchedKazen(req, kazen))
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Kazen from the DB
export function destroy(req, res) {
  return Kazen.findById(req.params.id).exec()
    .then(kazen => verifyTouchedKazen(req, kazen))
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
