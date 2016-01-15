/**
 * TankController
 *
 * @description :: Server-side logic for managing tanks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {

  light: function (req, res) {
    var lightResp = new Object();

    if (req.query.lat == undefined || req.query.lng == undefined) {
      response["status"] = "error";
      return res.json(lightResp);
    }

    if (req.query.lat != null && req.query.lng != null) {

      /// Check if numbers
      if (isNaN(req.query.lat) || isNaN(req.query.lng)) {
        lightResp["status"] = "error";
      } else {
        // all is good
        var request = require('sync-request');

        var apiRes = request(
          'GET',
          "http://api.sunrise-sunset.org/json?lat=" + req.query.lat + "&lng=" + req.query.lng + "&formatted=0"
        );

        var apiLightString = apiRes.getBody();

        var lightData = JSON.parse(apiLightString);

        var lightStart = lightData.results.sunrise; // YYY-MM-DDTHH:MM:SS+00:00
        var lightEnd = lightData.results.sunset;
        var lightMid = lightData.results.solar_noon;
        var lightLength = lightData.results.day_length;

        var apiMoonRes = request(
          'GET',
          "http://api.sunrise-sunset.org/json?lat=" + req.query.lat + "&lng=" + req.query.lng + "&formatted=0"
        );


        // var d = new Date(lightData.results.sunrise);
        // sails.log("Date " + d.getTime());
        var timeAndDate = new Date();
        //  var moonData = SunCalc.getMoonPosition(/*Date*/ timeAndDate, /*Number*/ req.query.lat, /*Number*/ req.query.lng);

	var SunCalc = require('suncalc');

        var lightResp = {
          'lightStart': lightStart,
          'lightEnd': lightEnd,
          'lightMid': lightMid,
          'lightLength': lightLength,
          'moon': SunCalc.getMoonIllumination(timeAndDate).fraction,
          'status': "OK"
        };

        return res.json(lightResp);

      }
    } else {
      // No params
      lightResp["status"] = "error";
    }

    /// return
    return res.json(lightResp);
  }

};

