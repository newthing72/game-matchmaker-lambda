const ecsGameServerTasksUtils = require("../utils/ecsGameServerTasksUtils");

var AWS = require("aws-sdk");

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const grpc_promise = require("grpc-promise");

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

  for (const task of Object.values(taskMap)) {
    const address = task.publicIP;
    console.log("call ", address);
    const healthValue = await callGameHealth(task.publicIP);

    console.log("healthValue", healthValue);

    const taskArn = task.taskArn;

    if (healthValue.inactive_time > 1 * 60 * 1000) {
      console.log("KILLING", taskArn);
      var params = {
        task: taskArn,
        cluster: clusterName,
        reason: "deadServerCleanup",
      };
      await ecs.stopTask(params).promise();
    } else {
      console.log("NOT KILLING", taskArn);
    }
  }

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

  grpc_promise.promisifyAll(client);

  return await client.health().sendMessage();
}
