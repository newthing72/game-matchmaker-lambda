const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const grpc_promise = require("grpc-promise");

const PROTO_PATH = __dirname + "/game-proto/NetworkObject.proto";

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

  const listTaskResponse = await ecs.listTasks(params).promise();

  const tasksToStop = listTaskResponse.taskArns;

  console.log("tasksToStop", tasksToStop);

  // get a map of

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

async function callGameHealth(ip) {
  const client = new gameProto.NetworkObjectService(
    ip + ":99",
    grpc.credentials.createInsecure()
  );

  grpc_promise.promisifyAll(client);

  await client.health().sendMessage();
}
