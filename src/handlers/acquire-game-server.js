const ecsGameServerTasksUtils = require("../utils/ecsGameServerTasksUtils");

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.acquireGameServerHandler = async (event) => {
  const regionName = "us-east-1";
  const clusterName = "game-cluster";

  taskMap = await ecsGameServerTasksUtils.getAllTasksPublicIps(
    regionName,
    clusterName
  );

  if (Object.values(taskMap).length == 0) {
    await ecsGameServerTasksUtils.createGameServer(regionName, clusterName);
    taskMap = await ecsGameServerTasksUtils.getAllTasksPublicIps(
      regionName,
      clusterName
    );
  }

  const serverList = Object.values(taskMap).map((task) => task.publicIP);

  const pendingCount = Object.values(taskMap).filter(
    (task) => task.lastStatus != "RUNNING"
  ).length;

  return {
    statusCode: 200,
    body: JSON.stringify({
      serverList: serverList,
      pendingCount: pendingCount,
    }),
  };
};
