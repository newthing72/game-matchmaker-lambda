// const grpc = require("grpc");
// const protoLoader = require("@grpc/proto-loader");
// const grpc_promise = require("grpc-promise");

// const PROTO_PATH = __dirname + "/game-proto/NetworkObject.proto";

// const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
//   keepCase: true,
//   longs: String,
//   enums: String,
//   defaults: true,
//   oneofs: true,
// });

// const gameProto = grpc.loadPackageDefinition(packageDefinition);

// const client = new gameProto.NetworkObjectService(
//   "44.193.18.182:99",
//   grpc.credentials.createInsecure()
// );

// grpc_promise.promisifyAll(client);

// client
//   .health()
//   .sendMessage()
//   .then((res) => {
//     console.log("Client: Simple Message Received = ", res); // Client: Simple Message Received = {id: 1}
//   })
//   .catch((err) => {
//     console.log("errro");
//     console.error(err);
//   });
