const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = __dirname + "/game-proto/NetworkObject.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const gameProto = grpc.loadPackageDefinition(packageDefinition);

const client = new gameProto.NetworkObjectService(
  "localhost:99",
  grpc.credentials.createInsecure()
);

new Promise((resolve, reject) => {
  client.health({}, function (err, response) {
    resolve(response);
  });
}).then((data) => {
  console.log("the data", data);
});
