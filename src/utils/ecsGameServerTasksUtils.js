var AWS = require("aws-sdk");

exports.getAllTasksPublicIps = async (regionName, clusterName) => {
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

  // console.log("listTaskResponse.taskArns", listTaskResponse.taskArns);

  params = {
    cluster: clusterName,
    tasks: listTaskResponse.taskArns,
  };
  const describeTasksResponse = await ecs.describeTasks(params).promise();

  // console.log("describeTasksResponse.tasks", describeTasksResponse.tasks);

  const networkInterfaceEniList = [];

  for (var currentTask of describeTasksResponse.tasks) {
    const currentElasticNetworkInterface = currentTask.attachments[0];

    const currentNetworkInterfaceId =
      currentElasticNetworkInterface.details.find(
        (element) => element.name == "networkInterfaceId"
      );

    if (currentNetworkInterfaceId)
      networkInterfaceEniList.push(currentNetworkInterfaceId.value);
  }

  console.log("networkInterfaceEniList", networkInterfaceEniList);

  params = {
    NetworkInterfaceIds: networkInterfaceEniList,
  };

  const networkInterfacesResponse = await ec2
    .describeNetworkInterfaces(params)
    .promise();

  console.log("networkInterfacesResponse", networkInterfacesResponse);

  const publicIpList = [];

  for (const currentNetowrkInterface of networkInterfacesResponse.NetworkInterfaces) {
    publicIpList.push(currentNetowrkInterface.Association.PublicIp);
  }

  console.log("publicIpList", publicIpList);

  return publicIpList;
};

exports.createGameServer = async (regionName, clusterName) => {
  const ecs = new AWS.ECS({
    region: regionName,
  });

  var paramsTask = {
    cluster: clusterName,
    taskDefinition: "game-task:219",
    launchType: "FARGATE",
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
