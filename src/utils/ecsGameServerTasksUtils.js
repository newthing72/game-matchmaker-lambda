var AWS = require("aws-sdk");

exports.getAllTasksPublicIps = async (regionName, clusterName, serviceName) => {
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

exports.createGameServer = async (region, clusterName, serviceName) => {};
