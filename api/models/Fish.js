/**
 * Fish.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    name: 'string',
    country: 'string',
    latitude: 'float',
    longitude: 'float',
    code: 'string',
    tanks: {
      collection: 'tank',
      via: 'fishInside'
    }
  }
};

