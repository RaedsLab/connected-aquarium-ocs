/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  login: function (req, res) {
    console.log("Hi there");
    res.json(req.allParams());
    //    return res.redirect("http://www.sayonara.com");
  }

};

