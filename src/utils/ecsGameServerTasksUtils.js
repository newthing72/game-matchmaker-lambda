var AWS = require("aws-sdk");

exports.getAllTasksPublicIps = async (regionName, clusterName) => {
  const returnMap = {};

  const ecs = new AWS.ECS({
    region: regionName,
  });

  const ec2 = new AWS.EC2({
    region: regionName,
  });

  var params = {
    cluster: clusterName,
  };

  const listTaskResponse = await ecs.listTasks(params).promise();

  if (listTaskResponse.taskArns.length === 0) return returnMap;

  params = {
    cluster: clusterName,
    tasks: listTaskResponse.taskArns,
  };
  const describeTasksResponse = await ecs.describeTasks(params).promise();

  for (var currentTask of describeTasksResponse.tasks) {
    const taskArn = currentTask.taskArn;

    returnMap[taskArn] = currentTask;

    const currentElasticNetworkInterface = currentTask.attachments[0];

    const currentNetworkInterfaceId =
      currentElasticNetworkInterface.details.find(
        (element) => element.name == "networkInterfaceId"
      );

    if (currentNetworkInterfaceId) {
      returnMap[taskArn].networkInterfaceEni = currentNetworkInterfaceId.value;
    }
  }

  const networkInterfaces = Object.values(returnMap)
    .filter((value) => value.networkInterfaceEni != undefined)
    .map((value) => value.networkInterfaceEni);

  if (networkInterfaces.length == 0) return returnMap;

  params = {
    NetworkInterfaceIds: networkInterfaces,
  };

  const networkInterfacesResponse = await ec2
    .describeNetworkInterfaces(params)
    .promise();

  for (const currentNetowrkInterface of networkInterfacesResponse.NetworkInterfaces) {
    Object.values(returnMap).find(
      (val) =>
        val.networkInterfaceEni == currentNetowrkInterface.NetworkInterfaceId
    ).publicIP = currentNetowrkInterface.Association.PublicIp;
  }

  return returnMap;
};

exports.createGameServer = async (regionName, clusterName) => {
  const ecs = new AWS.ECS({
    region: regionName,
  });

  var paramsTask = {
    cluster: clusterName,
    taskDefinition: "game-task",
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: ["subnet-06c96d569f4a756c8"],
        securityGroups: ["sg-045dd765d4d869c08", "sg-0c39de4a792107160"],
      },
    },
  };

  const runTaskResponse = await ecs.runTask(paramsTask).promise();
  //   const first = runTaskResponse.tasks[0];
  //   const taskArn = first.taskArn;
  //   console.log("create taskArn", taskArn);
  //   var paramsWait = {
  //     cluster: clusterName,
  //     tasks: [taskArn],
  //   };
  //   await ecs.waitFor("tasksRunning", paramsWait).promise();
};

exports.healthyGameFilter = (task) =>
  task.lastStatus == "RUNNING" && task.healthStatus == "HEALTHY";

exports.unhealthyGameFilter = (task) =>
  task.lastStatus != "RUNNING" || task.healthStatus != "HEALTHY";

// const regionName = "us-east-1";
// const clusterName = "game-cluster";
// exports.getAllTasksPublicIps(regionName, clusterName);

// console.log("HI");
