// Import all functions from get-all-items.js
const lambda = require("../../../src/handlers/acquire-game-server.js");
// Import dynamodb from aws-sdk

describe("Test acquire-game-server", () => {
  let scanSpy;

  // Test one-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown
  beforeAll(() => {});

  // Clean up mocks
  afterAll(() => {});

  it("should return game server", async () => {
    const event = {
      httpMethod: "GET",
    };

    // Invoke helloFromLambdaHandler()
    const result = await lambda.acquireGameServerHandler(event);

    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify(["game server"]),
    };

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
});
