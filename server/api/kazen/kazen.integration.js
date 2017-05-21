'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import User from '../user/user.model';
import request from 'supertest';

var newKazen;

describe('Kazen API:', function() {
  var user;
  var otherKnaz;
  var userId;
  var otherKnazId;
  var token;
  var tokenModerator;
  var tokenKnaz;
  var moderator;
  var oneKazen;
  var otherKazen;

  // Clear users before testing
  before(function(done) {
    return User.remove().then(function() {
      user = new User({
        name: 'Fake User',
        email: 'test@example.com',
        password: 'password',
        role: 'knaz'
      });

      return user.save();
    })
    .then(() => {
      otherKnaz = new User({
        name: 'Fake knaz',
        email: 'knaz@example.com',
        password: 'password',
        role: 'knaz'
      });
      otherKnazId = otherKnaz._id;
      return otherKnaz.save();
    })
    .then(() => {
      moderator = new User({
        name: 'Fake knaz',
        email: 'moderator@example.com',
        password: 'password',
        role: 'moderator',
        linkedUsers: user,
      });
      return moderator.save();
    })
      .then(() => {
        request(app)
          .post('/auth/local')
          .send({
            email: 'test@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if(err) {
              return done(err);
            }
            token = res.body.token;
            request(app)
              .get('/api/users/me')
              .set('authorization', `Bearer ${token}`)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((errLogin, resLogin) => {
                userId = resLogin.body._id;
                expect(resLogin.body._id.toString()).to.equal(user._id.toString());
                // post one kazen
                request(app)
                  .post('/api/kazne')
                  .set('authorization', `Bearer ${token}`)
                  .send({
                    name: 'New Kazen',
                    text: 'This is the brand new kazen!!!',
                    userRef: userId,
                  })
                  .expect(201)
                  .expect('Content-Type', /json/)
                  .end((errPost, resPost) => {
                    if(errPost) {
                      return done(errPost);
                    }
                    oneKazen = resPost.body;
                    // create also a kazen under a different user
                    request(app)
                      .post('/auth/local')
                      .send({
                        email: 'knaz@example.com',
                        password: 'password'
                      })
                      .expect(200)
                      .expect('Content-Type', /json/)
                      .end((error, response) => {
                        tokenKnaz = response.body.token;
                        request(app)
                          .get('/api/users/me')
                          .set('authorization', `Bearer ${tokenKnaz}`)
                          .expect(200)
                          .expect('Content-Type', /json/)
                          .end((errorLogin, responseLogin) => {
                            expect(responseLogin.body._id.toString()).to.equal(otherKnaz._id.toString());
                            // post one kazen
                            request(app)
                              .post('/api/kazne')
                              .set('authorization', `Bearer ${tokenKnaz}`)
                              .send({
                                name: 'New Kazen',
                                text: 'This is the brand new kazen!!!',
                                userRef: otherKnaz._id,
                              })
                              .expect(201)
                              .expect('Content-Type', /json/)
                              .end((errorPost, responsePost) => {
                                if(errorPost) {
                                  return done(errorPost);
                                }
                                otherKazen = responsePost.body;
                                done();
                              });
                          });
                      });
                  });
              });
          });
      });
  });

  // Clear users after testing
  after(function() {
    return User.remove();
  });

  describe('GET /api/kazne', function() {
    var kazens;

    beforeEach(function(done) {
      request(app)
        .get('/api/kazne')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          kazens = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(kazens).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/kazne', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/kazne')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'New Kazen',
          text: 'This is the brand new kazen!!!',
          userRef: userId,
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newKazen = res.body;
          done();
        });
    });

    it('should respond with the newly created kazen', function() {
      expect(newKazen.name).to.equal('New Kazen');
      expect(newKazen.text).to.equal('This is the brand new kazen!!!');
    });
    it('should return an error when creating a kazen with a non-existing user', (done) => {
      request(app)
        .post('/api/kazne')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'New Kazen',
          text: 'This is the brand new kazen!!!',
          userRef: '12345',
        })
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          expect(res.status).to.equal(500);
          done();
        });
    });
    it('should return an error when knaz is creating a kazen of another knaz', (done) => {
      request(app)
        .post('/api/kazne')
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'New Kazen',
          text: 'This is the brand new kazen!!!',
          userRef: otherKnazId,
        })
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          expect(res.status).to.equal(500);
          done();
        });
    });
  });

  describe('GET /api/kazne/:id', function() {
    var kazen;

    beforeEach(function(done) {
      request(app)
        .get(`/api/kazne/${newKazen._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          kazen = res.body;
          done();
        });
    });

    afterEach(function() {
      kazen = {};
    });

    it('should respond with the requested kazen', function() {
      expect(kazen.name).to.equal('New Kazen');
      expect(kazen.text).to.equal('This is the brand new kazen!!!');
    });
  });

  describe('PUT /api/kazne/:id', function() {
    var updatedKazen;

    beforeEach(function(done) {
      request(app)
        .put(`/api/kazne/${newKazen._id}`)
        .set('authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Kazen',
          text: 'This is the updated kazen!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedKazen = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedKazen = {};
    });

    it('should respond with the updated kazen', function() {
      expect(updatedKazen.name).to.equal('Updated Kazen');
      expect(updatedKazen.text).to.equal('This is the updated kazen!!!');
    });

    it('should respond with the updated kazen on a subsequent GET', function(done) {
      request(app)
        .get(`/api/kazne/${newKazen._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let kazen = res.body;

          expect(kazen.name).to.equal('Updated Kazen');
          expect(kazen.text).to.equal('This is the updated kazen!!!');

          done();
        });
    });
  });

  describe('PATCH /api/kazne/:id', function() {
    var patchedKazen;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/kazne/${newKazen._id}`)
        .set('authorization', `Bearer ${token}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Kazen' },
          { op: 'replace', path: '/text', value: 'This is the patched kazen!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedKazen = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedKazen = {};
    });

    it('should respond with the patched kazen', function() {
      expect(patchedKazen.name).to.equal('Patched Kazen');
      expect(patchedKazen.text).to.equal('This is the patched kazen!!!');
    });
  });

  describe('DELETE /api/kazne/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/kazne/${newKazen._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when kazen does not exist', function(done) {
      request(app)
        .delete(`/api/kazne/${newKazen._id}`)
        .set('authorization', `Bearer ${token}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
  describe('Moderator privileges', function() {
    beforeEach(function(done) {
      request(app)
          .post('/auth/local')
          .send({
            email: 'moderator@example.com',
            password: 'password'
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if(err) {
              return done(err);
            }
            tokenModerator = res.body.token;
            request(app)
              .get('/api/users/me')
              .set('authorization', `Bearer ${tokenModerator}`)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((error, response) => {
                expect(response.body._id.toString()).to.equal(moderator._id.toString());
                done();
              });
          });
    });
    it('should allow to create linked knaz`s kazen', function(done) {
      request(app)
        .post('/api/kazne')
        .set('authorization', `Bearer ${tokenModerator}`)
        .send({
          name: 'New Kazen',
          text: 'This is the brand new kazen!!!',
          userRef: userId,
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          expect(res.status).to.equal(201);
          done();
        });
    });
    it('should allow to edit linked knaz`s kazen', function(done) {
      request(app)
        .patch(`/api/kazne/${oneKazen._id}`)
        .set('authorization', `Bearer ${tokenModerator}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Kazen' },
          { op: 'replace', path: '/text', value: 'This is the patched kazen!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('should not allow to create not linked knaz`s kazen', function(done) {
      request(app)
        .post('/api/kazne')
        .set('authorization', `Bearer ${tokenModerator}`)
        .send({
          name: 'New Kazen',
          text: 'This is the brand new kazen!!!',
          userRef: otherKnazId,
        })
        .expect(500)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          expect(res.status).to.equal(500);
          done();
        });
    });
    it('should not allow to edit not linked knaz`s kazen', function(done) {
      request(app)
          .patch(`/api/kazne/${otherKazen._id}`)
          .set('authorization', `Bearer ${tokenModerator}`)
          .send([
            { op: 'replace', path: '/name', value: 'Patched Kazen' },
            { op: 'replace', path: '/text', value: 'This is the patched kazen!!!' }
          ])
          .expect(500)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if(err) {
              return done(err);
            }
            expect(res.status).to.equal(500);
            done();
          });
    });
  });
});
