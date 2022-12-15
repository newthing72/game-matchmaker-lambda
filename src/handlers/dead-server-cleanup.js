const ecsGameServerTasksUtils = require("../utils/ecsGameServerTasksUtils");

var AWS = require("aws-sdk");

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = __dirname + "../../../game-proto/NetworkObject.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const gameProto = grpc.loadPackageDefinition(packageDefinition);

exports.deadServerCleanup = async (event) => {
  const regionName = "us-east-1";
  const clusterName = "game-cluster";

  const ecs = new AWS.ECS({
    region: regionName,
  });

  var params = {
    cluster: clusterName,
  };

  const taskMap = await ecsGameServerTasksUtils.getAllTasksPublicIps(
    regionName,
    clusterName
  );

  console.log("taskMap", JSON.stringify(taskMap, null, 4));

  const killed = [];
  const ignored = [];

  for (const task of Object.values(taskMap)) {
    const taskArn = task.taskArn;

    if (task.lastStatus != "RUNNING") {
      ignored.push(taskArn);
      continue;
    }

    const address = task.publicIP;
    const healthValue = await callGameHealth(task.publicIP);

    console.log("healthValue", taskMap, healthValue);

    if (healthValue.inactive_time > 1 * 60 * 1000) {
      var params = {
        task: taskArn,
        cluster: clusterName,
        reason: "deadServerCleanup",
      };
      await ecs.stopTask(params).promise();
      killed.push(taskArn);
    } else {
      ignored.push(taskArn);
    }
  }

  const returnData = { killed: killed, ignored: ignored };

  return {
    statusCode: 200,
    body: JSON.stringify(returnData),
  };

  // const listTaskResponse = await ecs.listTasks(params).promise();

  // const tasksToStop = listTaskResponse.taskArns;

  // // stop each task
  // for (const taskARn of tasksToStop) {
  //   console.log("stopping", taskARn);

  //   var params = {
  //     task: taskARn,
  //     cluster: clusterName,
  //     reason: "deadServerCleanup",
  //   };
  //   await ecs.stopTask(params).promise();
  // }

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({ stopped: tasksToStop }),
  // };
};

async function callGameHealth(ip) {
  const address = ip + ":99";

  const client = new gameProto.NetworkObjectService(
    address,
    grpc.credentials.createInsecure()
  );

  return new Promise((resolve, reject) => {
    client.health({}, function (error, result) {
      if (error) reject(error);
      else resolve(result);
    });
  });
}
