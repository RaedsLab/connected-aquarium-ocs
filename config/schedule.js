function dump(obj) {
  var out = '';
  for (var i in obj) {
    out += i + ": " + obj[i] + "\n";
  }
  console.log(out);
}


module.exports.schedule = {
  sailsInContext: true, //If sails is not as global and you want to have it in your task
  tasks: {
    firstTask: {
	// sunday
      cron: "* * * * 0",
      task: function (context, sails) {

        sails.log("[Cron] - Checking stale tanks");
        var now = new Date();

        Tank.find().exec(function (err, tankList) {
          if (err != null) {
            console.error("ERROR SCHED !");
          }

          console.log(JSON.stringify(tankList));

           for (tank in tankList) {
            if ((now - tank.lastPing) > 600000) { // if > 10 min
              sails.log("[Cron] - Inactive Tank " + tank.id);
              tank.state = "offline";
            } else {
              tank.state = "online";
            }
           // dump(tank);
          }

        })
      },
      context: {}
    }
  } 
};
