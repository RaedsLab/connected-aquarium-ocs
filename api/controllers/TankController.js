/**
 * TankController
 *
 * @description :: Server-side logic for managing tanks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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


    var scraperjs = require('scraperjs');

    var scrapUrl = "http://www.seatemperature.org/africa/tunisia/sidi-bou-said.htm";

    scraperjs.StaticScraper.create(scrapUrl)
      .scrape(function ($) {
        return $("#sea-temperature").map(function () {
          return $(this).text();
        }).get();
      })
      .then(function (tempParse) {

        tempParse = tempParse.join();
        var temp = tempParse.split("°");

        var content = temp[0].toString().replace(/\t/g, '').split('\r\n');
        content = content.toString().replace(/\n/g, '').split('\r\n')[0];

        resp["status"] = "OK";
        resp["temp"] = parseInt(content);
        return res.json(resp);

        //  res.send(JSON.stringify(content));
      })

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
      resp["status"] = "error";
      return res.json(resp);
    }

    if (req.query.tankCode == null || req.query.fishTag == null) {
      resp["status"] = "error";
      return res.json(resp);
    }


    Tank.findOne({code: req.query.tankCode}).exec(function findOneCB(err, tank) {

      //Tank not found
      if (tank == undefined || err != null) {
        resp["status"] = "error";
        return res.json(resp);
      }

      // Find fish
      Fish.findOne({code: req.query.fishTag}).exec(function findOneCB(err, fish) {

        //Fish not found
        if (fish == undefined || err != null) {
          resp["status"] = "error";
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
