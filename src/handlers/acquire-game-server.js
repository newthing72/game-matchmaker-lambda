// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();

const ecsGameServerTasksUtils = require("../utils/ecsGameServerTasksUtils");

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.acquireGameServerHandler = async (event) => {
  const regionName = "us-east-1";
  const clusterName = "game-cluster";
  let serverList;
  try {
    serverList = await ecsGameServerTasksUtils.getAllTasksPublicIps(
      regionName,
      clusterName
    );
  } catch (error) {
    // create the server
    await ecsGameServerTasksUtils.createGameServer(regionName, clusterName);
    return {
      statusCode: 200,
      body: JSON.stringify("created server"),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(serverList),
  };
};
