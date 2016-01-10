/**
 * Logged user
 * */
var user = null;

/**
 Get URL Params
 */
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

var userId = getUrlParameter('id');


/**
 *
 * Deletes userId cookie
 * Redirects to login page
 */
function logout() {
  $.removeCookie("userId");
  /// redirect to login
  window.location.replace("/");
}


/**
 * Check if cookie exists
 * if exists check with URL param ID
 */
$(document).ready(function () {
  var loginCookie = $.cookie("userId");
  if (loginCookie != undefined) {
    if (loginCookie != userId) {
      // redirect to proper panel
      window.location.replace("/panel?id=" + loginCookie);
    } else {
      /// ALL is good
      /**
       Check if id is present
       if not redirect to login
       */

      if (userId == undefined) {
        /// redirect to login
        window.location.replace("/");

      } else {
        user = getUserById(userId);
        if (user == undefined) {
          window.location.replace("/");
        }
      }
      /**
       * Set the panel elements
       */
      $('#userEmail').html(user.email);

      /**INIT MAP JS **/
      init()
      /**
       * Update user tank list
       * */
      getAllUserTanks();
      /// \ALL is good
    }
  } else {
    // redirect to login
    window.location.replace("/");
  }
});


/**
 * Get user by id
 */
function getUserById(id) {
  var user = $.ajax({
    url: "/user/" + id,
    async: false,
    dataType: 'json',
    success: function (data) {
      return data;
    }
  });
  return user['responseJSON'];
}


/**
 * Get all user tanks
 * */
function getAllUserTanks() {
  $("#tankList").html("");
  $("#tankMsg").html("");

  user = getUserById(userId);
  if (user.tanks.length == 0) {
    $("#tankMsg").html("You don't have any configured fish-tanks.")
  } else {
    user.tanks.forEach(function (entry) {
        $("#tankList").append("<li onclick='updateFishList(this)' class='tank' id='" + entry.id + "'>" + entry.label + " [" + entry.state + "] " +
          "<button onclick='deleteFishTank(this)' class='deleteTank' id='" + entry.id + "'>[X]</button> </li>");
      }
    );
  }
}

/**
 * Get all fish by tank ID
 * */
function getFishByTank(idTank) {
  $("#fishList").html(""); // empty the list

  var xhrTankResp = $.ajax({
    url: "/tank/" + idTank,
    async: false,
    dataType: 'json',
    success: function (data) {
      return data;
    }
  });
  var tank = xhrTankResp['responseJSON'];
  if (tank.fishInside != undefined) {
    tank.fishInside.forEach(function (fish) {
      $("#fishList").append("<li class='fishInTank' id='" + fish.id + "'>" + fish.name + " [" + fish.code + "] </li>");
    });
  } else {
    $("#fishList").html("You don't have any fish yet.");
  }

}

/**
 * On tank click => get list of fish
 */
function updateFishList(param) {
  var tankId = param.getAttribute("id");
  getFishByTank(tankId);
}
/**
 * On tank click => delete tank
 */
function deleteFishTank(param) {
  var tankId = param.getAttribute("id");
  $.ajax({
    url: '/tank/' + tankId,
    type: 'DELETE',
    success: function (result) {
      getAllUserTanks();
      $("#fishList").html(""); // empty the fish list
    }
  });

}

/**
 *
 * Add a tank form JS
 * */
function addATank() {
  var code = $("#tankCode").val();
  var label = $("#tankLabel").val();
  var latitude = $("#tankLatitude").val();
  var longitude = $("#tankLongitude").val();

  $.post("tank", {code: code, label: label, latitude: latitude, longitude: longitude, owner: userId, sate: 'pending'})
    .done(function (data) {
      /**
       * Update user tank list
       * */
      $("#tankList").append("<li class='tank' id='" + data.id + "'>" + data.label + " [" + data.state + "]</li>");

    });
}


/****************************************************MAP JS *****************************************************************/

OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
  defaultHandlerOptions: {
    'single': true,
    'double': false,
    'pixelTolerance': 0,
    'stopSingle': false,
    'stopDouble': false
  },

  initialize: function (options) {
    this.handlerOptions = OpenLayers.Util.extend(
      {}, this.defaultHandlerOptions
    );
    OpenLayers.Control.prototype.initialize.apply(
      this, arguments
    );
    this.handler = new OpenLayers.Handler.Click(
      this, {
        'click': this.trigger
      }, this.handlerOptions
    );
  },

  trigger: function (e) {
    var lonlat = map.getLonLatFromPixel(e.xy);
    //alert("You clicked near " + lonlat.lat + " N, " + +lonlat.lon + " E");
    $("#tankLatitude").val(lonlat.lat);
    $("#tankLongitude").val(lonlat.lon);

  }

});
var map;
function init() {
  map = new OpenLayers.Map('map');

  var ol_wms = new OpenLayers.Layer.WMS("OpenLayers WMS",
    "http://vmap0.tiles.osgeo.org/wms/vmap0?", {layers: 'basic'});

  var jpl_wms = new OpenLayers.Layer.WMS("NASA Global Mosaic",
    "http://t1.hypercube.telascience.org/cgi-bin/landsat7",
    {layers: "landsat7"});

  jpl_wms.setVisibility(false);

  map.addLayers([ol_wms, jpl_wms]);
  map.addControl(new OpenLayers.Control.LayerSwitcher());
  // map.setCenter(new OpenLayers.LonLat(0, 0), 0);
  map.zoomToMaxExtent();

  var click = new OpenLayers.Control.Click();
  map.addControl(click);
  click.activate();

}


/****************************************************MAP JS *****************************************************************/
