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
    temperature: 'float',
    state: {
      type: 'string',
      enum: ['online', 'offline', 'unreachable', 'pending'],
      defaultsTo: 'pending'
    },
    owner: {
      model: 'user'
    },
    fishInside: {
      collection: 'fish',
      via: 'tanks'
    },
    code: {
      type: 'string',
      required: true
    },
    lastPing: 'datetime'
  }
};

