'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var kazenCtrlStub = {
  index: 'kazenCtrl.index',
  show: 'kazenCtrl.show',
  create: 'kazenCtrl.create',
  upsert: 'kazenCtrl.upsert',
  patch: 'kazenCtrl.patch',
  destroy: 'kazenCtrl.destroy'
};

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  },
  hasRole(role) {
    return `authService.hasRole.${role}`;
  },
  hasOneOfRoles(roles) {
    return `authService.hasOneOfRoles.${roles}`;
  }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var kazenIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './kazen.controller': kazenCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Kazen API Router:', function() {
  it('should return an express router instance', function() {
    expect(kazenIndex).to.equal(routerStub);
  });

  describe('GET /api/kazne', function() {
    it('should route to kazen.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'kazenCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/kazne/:id', function() {
    it('should route to kazen.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'kazenCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/kazne', function() {
    it('should route to kazen.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'authService.hasOneOfRoles.admin,knaz,moderator', 'kazenCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/kazne/:id', function() {
    it('should route to kazen.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'authService.hasOneOfRoles.admin,knaz,moderator', 'kazenCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/kazne/:id', function() {
    it('should route to kazen.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'authService.hasOneOfRoles.admin,knaz,moderator', 'kazenCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/kazne/:id', function() {
    it('should route to kazen.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'authService.hasOneOfRoles.admin,knaz,moderator', 'kazenCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
