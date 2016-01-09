/**
 * Tank.js
 *
 * @description :: The Fish-tank
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    label: 'string',
    latitude: 'float',
    longitude: 'float',
    state: {
      type: 'string',
      enum: ['online', 'offline', 'unreachable']
    }
  }
};

