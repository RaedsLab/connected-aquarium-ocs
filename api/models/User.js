/**
 * User.js
 *
 * @description :: User of the app
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    email: {
      type: 'string',
      email: true
    },
    password: 'string'
  }
};

