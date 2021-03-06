/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/volunteers              ->  index
 * POST    /api/volunteers              ->  create
 * GET     /api/volunteers/:id          ->  show
 * PUT     /api/volunteers/:id          ->  upsert
 * PATCH   /api/volunteers/:id          ->  patch
 * DELETE  /api/volunteers/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import jsonpatch from 'fast-json-patch';
import Volunteer from './volunteer.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
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

// Gets a list of Volunteers
export function index(req, res) {
  return Volunteer.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Volunteer from the DB
export function show(req, res) {
  return Volunteer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Volunteer in the DB
export function create(req, res) {
  return Volunteer.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Volunteer in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  //wont emit event
  // return Volunteer.findOneAndUpdate(req.params.id, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
  //
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));

    return Volunteer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));

}

// Updates an existing Volunteer in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Volunteer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Volunteer from the DB
export function destroy(req, res) {
  return Volunteer.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
