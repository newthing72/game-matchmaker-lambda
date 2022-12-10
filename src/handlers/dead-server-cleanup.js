var AWS = require("aws-sdk");

exports.deadServerCleanup = async (event) => {
  const regionName = "us-east-1";
  const clusterName = "game-cluster";

  const ecs = new AWS.ECS({
    region: regionName,
  });

  var params = {
    cluster: clusterName,
  };

  const listTaskResponse = await ecs.listTasks(params).promise();

  const tasksToStop = listTaskResponse.taskArns;

  console.log("tasksToStop", tasksToStop);

  for (const taskARn of tasksToStop) {
    console.log("stopping", taskARn);

    var params = {
      task: taskARn,
      cluster: clusterName,
      reason: "deadServerCleanup",
    };
    await ecs.stopTask(params).promise();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ stopped: tasksToStop }),
  };
};
