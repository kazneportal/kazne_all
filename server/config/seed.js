/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Kazen from '../api/kazen/kazen.model';

import config from './environment/';

export default function seedDatabaseIfNeeded() {
  if(config.seedDB) {
    Thing.find({}).remove()
      .then(() => {
        return Thing.create({
          name: 'Development Tools',
          info: 'Integration with popular tools such as Webpack, Gulp, Babel, TypeScript, Karma, '
                + 'Mocha, ESLint, Node Inspector, Livereload, Protractor, Pug, '
                + 'Stylus, Sass, and Less.'
        }, {
          name: 'Server and Client integration',
          info: 'Built with a powerful and fun stack: MongoDB, Express, '
                + 'AngularJS, and Node.'
        }, {
          name: 'Smart Build System',
          info: 'Build system ignores `spec` files, allowing you to keep '
                + 'tests alongside code. Automatic injection of scripts and '
                + 'styles into your index.html'
        }, {
          name: 'Modular Structure',
          info: 'Best practice client and server structures allow for more '
                + 'code reusability and maximum scalability'
        }, {
          name: 'Optimized Build',
          info: 'Build process packs up your templates as a single JavaScript '
                + 'payload, minifies your scripts/css/images, and rewrites asset '
                + 'names for caching.'
        }, {
          name: 'Deployment Ready',
          info: 'Easily deploy your app to Heroku or Openshift with the heroku '
                + 'and openshift subgenerators'
        });
      })
    .then(() => console.log('finished populating things'))
    .catch(err => console.log('error populating things', err));

    Kazen.find({}).remove()
      .then(() => {
        return User.find({}).remove()
          .then(() => {
            return User.create({
              provider: 'local',
              name: 'Test User',
              email: 'test@example.com',
              password: 'test'
            }, {
              provider: 'local',
              role: 'admin',
              name: 'Admin',
              email: 'admin@example.com',
              password: 'admin'
            })
            .then(() => console.log('finished populating users'))
            .catch(err => console.log('error seeding', err));
          })
          .then(() => {
            return User.create({
              provider: 'local',
              name: 'Knaz 1',
              email: 'knaz1@example.com',
              password: 'test',
              role: 'knaz',
            })
            .then(knaz1 => {
              return Kazen.create({
                name: 'bezva kazen',
                text: 'tato kazen je bezva',
                userRef: knaz1._id,
              }, {
                name: 'dalsia bezva kazen',
                text: 'tato kazen je este viac bezv ako ta predosla',
                userRef: knaz1._id,
              });
            })
            .then(() => console.log('created kazne pre knaza 2'))
            .catch(err => console.log('error creating kazne', err));
          })
          .then(() => {
            return User.create({
              provider: 'local',
              name: 'Knaz 2',
              email: 'knaz2@example.com',
              password: 'test',
              role: 'knaz',
            })
            .then(knaz2 => {
              Kazen.create({
                name: 'moja kazen',
                text: 'aj ja pisem bezva kazne',
                userRef: knaz2._id,
              }, {
                name: 'moja druha kazen',
                text: 'ta prva bola bezva, nie?',
                userRef: knaz2._id,
              });
              return User.create({
                provider: 'local',
                name: 'Moderator',
                email: 'moderator@example.com',
                password: 'test',
                role: 'moderator',
                linkedUsers: knaz2.id,
              });
            })
            .then(() => console.log('created kazne pre knaza 2'))
            .catch(err => console.log('error creating kazne', err));
          });
      });
  }
}
