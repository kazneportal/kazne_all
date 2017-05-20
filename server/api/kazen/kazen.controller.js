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

function verifyUserRef(req, res) {
  return new Promise((resolve, reject) => {
    if(req.user.role === 'knaz' && req.body.userRef.toString() !== req.user._id.toString()) {
      reject(handleError(res));
    }
    resolve();
  });
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
  return verifyUserRef(req, res)
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
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Kazen from the DB
export function destroy(req, res) {
  return Kazen.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}