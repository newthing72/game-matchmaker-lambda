// Import all functions from get-all-items.js
const lambda = require("../../../src/handlers/acquire-game-server.js");

const ecsGameServerTasksUtils = require("../../../src/utils/ecsGameServerTasksUtils");

describe("Test acquire-game-server", () => {
  let getAllTasksPublicIpsSpy;

  // Test one-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown
  beforeAll(() => {
    getAllTasksPublicIpsSpy = jest.spyOn(
      ecsGameServerTasksUtils,
      "getAllTasksPublicIps"
    );
  });

  // Clean up mocks
  afterAll(() => {
    getAllTasksPublicIpsSpy.mockRestore();
  });

  it("should return game server", async () => {
    const event = {
      httpMethod: "GET",
    };

    getAllTasksPublicIpsSpy.mockReturnValue(["server1", "server2"]);

    // Invoke helloFromLambdaHandler()
    const result = await lambda.acquireGameServerHandler(event);

    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify(["server1", "server2"]),
    };

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
});
