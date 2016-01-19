module.exports.schedule = {
  sailsInContext: true, //If sails is not as global and you want to have it in your task
  tasks: {
    firstTask: {
      cron: "* * * 1 1",
      task: function (context, sails) {

        sails.log("[Cron] - Checking stale tanks");
        var now = new Date();

        Tank.find()
          .exec(function (err, tankList) {

            for (tank of tankList) {

              if (tank.state == "online" && (now - tank.lastPing) > 600000) { // if > 10 min
                sails.log("[Cron] - Inactive Tank " + tank.id);
                tank.state = "offline";
                tank.save();
              }
            }
          })
      },
      context: {}
    }
  }
};
