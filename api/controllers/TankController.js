/**
 * TankController
 *
 * @description :: Server-side logic for managing tanks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('sync-request');

var scraperjs = require('scraperjs');

var SunCalc = require('suncalc');


function dump(obj) {
  var out = '';
  for (var i in obj) {
    out += i + ": " + obj[i] + "\n";
  }
  console.log(out);
}

module.exports = {


  temp: function (req, res) {

    var resp = new Object();

    if (req.query.tankCode == undefined) {
      resp["status"] = "error";
      return res.json(resp);
    }

    if (req.query.tankCode == null) {
      resp["status"] = "error";
      return res.json(resp);
    }


    Tank.findOne({code: req.query.tankCode}).exec(function findOneCB(err, tank) {

      //Tank not found
      if (tank == undefined || err != null) {
        resp["status"] = "error";
        return res.json(resp);
      }


      /**
       * Get country by lat,lon
       */

      // all is good
      var apiRes = request(
        'GET',
        "https://api.worldweatheronline.com/free/v2/marine.ashx?key=4b3c91c943a3e57d20b7c794a929e&format=json&q=" + tank.latitude + "," + tank.longitude
      );

      var tempString = apiRes.getBody();
      var tempData = JSON.parse(tempString);
      if (tempData.data.weather[0].hourly[0].waterTemp_C == undefined) {
        resp["status"] = "DataError";
        return res.json(resp);
      }
      resp["status"] = "OK";
      resp["temp"] = tempData.data.weather[0].hourly[0].waterTemp_C;

      tank.temperature = tempData.data.weather[0].hourly[0].waterTemp_C;
      tank.save();

      return res.json(resp);
    });

  },

  ping: function (req, res) {

    var resp = new Object();

    if (req.query.tankCode == undefined) {
      resp["status"] = "error";
      return res.json(resp);
    }

    if (req.query.tankCode == null) {
      resp["status"] = "error";
      return res.json(resp);
    }

    Tank.findOne({code: req.query.tankCode}).exec(function findOneCB(err, tank) {

      //Tank not found
      if (tank == undefined || err != null) {
        resp["status"] = "error";
        return res.json(resp);
      }

      tank.lastPing = new Date();
      tank.state = "online";
      tank.save();
      resp["status"] = "ok";
      return res.json(resp);
    });

  },

  removeFish: function (req, res) {

    var resp = new Object();

    if (req.query.tankId == undefined || req.query.fishId == undefined) {
      resp["status"] = "error";
      return res.json(resp);
    }

    if (req.query.tankId == null || req.query.fishId == null) {
      resp["status"] = "error";
      return res.json(resp);
    }


    Tank.findOne({id: req.query.tankId}).exec(function findOneCB(err, tank) {

      //Tank not found
      if (tank == undefined || err != null) {
        resp["status"] = "error";
        return res.json(resp);
      }

      // Find fish
      Fish.findOne({id: req.query.fishId}).exec(function findOneCB(err, fish) {

        //Fish not found
        if (fish == undefined || err != null) {
          resp["status"] = "error";
          return res.json(resp);
        }

        tank.fishInside.remove(fish.id);
        tank.save();

        //tank.fishInside.push(fish);
        resp["status"] = "OK";
        return res.json(resp);
      });
    });


  },

  addFish: function (req, res) {
    var resp = new Object();

    if (req.query.tankCode == undefined || req.query.fishTag == undefined) {
      resp["status"] = "param error";
      return res.json(resp);
    }

    if (req.query.tankCode == null || req.query.fishTag == null) {
      resp["status"] = "null param error";
      return res.json(resp);
    }


    Tank.findOne({code: req.query.tankCode}).exec(function findOneCB(err, tank) {

      //Tank not found
      if (tank == undefined || err != null) {
        resp["status"] = "no tank error ";
        return res.json(resp);
      }

      // Find fish
      Fish.findOne({code: req.query.fishTag}).exec(function findOneCB(err, fish) {

        //Fish not found
        if (fish == undefined || err != null) {
          resp["status"] = "no fish error";
          return res.json(resp);
        }

        // dump(tank.fishInside);

        tank.fishInside.add(fish);
        tank.save();

        resp["status"] = "OK";
        return res.json(resp);
      });
    });
  },


  light: function (req, res) {
    var lightResp = new Object();

    if (req.query.lat == undefined || req.query.lng == undefined) {
      lightResp["status"] = "error";
      return res.json(lightResp);
    }

    if (req.query.lat != null && req.query.lng != null) {

      /// Check if numbers
      if (isNaN(req.query.lat) && isNaN(req.query.lng)) {
        lightResp["status"] = "error";
      } else {
        // all is good

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

        var apiTimeZoneRes = request(
          'GET',
          'https://maps.googleapis.com/maps/api/timezone/json?location=31.10,121.10&timestamp=1331161200&key=AIzaSyBsCkQElzafDkjxRMroi3DDW2DetmCZcto'
        );
        var apiTimeString = apiTimeZoneRes.getBody();

        var TimeData = JSON.parse(apiTimeString);
        var timeZone = TimeData.timeZoneId;
        // var d = new Date(lightData.results.sunrise);
        // sails.log("Date " + d.getTime());
        var timeAndDate = new Date();
        //  var moonData = SunCalc.getMoonPosition(/*Date*/ timeAndDate, /*Number*/ req.query.lat, /*Number*/ req.query.lng);


        var lightResp = {
          'timeZone': timeZone,
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
