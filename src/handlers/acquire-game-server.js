const ecsGameServerTasksUtils = require("../utils/ecsGameServerTasksUtils");

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.acquireGameServerHandler = async (event) => {
  const headers = event.headers;

  if (headers.authorization != "libgdx-game")
    return {
      statusCode: 401,
      body: JSON.stringify({ msg: "Dont like that authorization" }),
    };

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

  const serverList = Object.values(taskMap)
    .filter(ecsGameServerTasksUtils.healthyGameFilter)
    .map((task) => task.publicIP);

  const pendingCount = Object.values(taskMap).filter(
    ecsGameServerTasksUtils.unhealthyGameFilter
  ).length;

  return {
    statusCode: 200,
    body: JSON.stringify({
      serverList: serverList,
      pendingCount: pendingCount,
    }),
  };
};
