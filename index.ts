import * as hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Inert from "@hapi/inert";

import HapiSwagger from "hapi-swagger";
import HapiAuthJwt2 from "hapi-auth-jwt2";

import fs from "fs";

import config from "./config";
import connectDB from "./lib/dbConnect";
import setRoutes from "./routes";

const validateUser = async (decoded, request, h) => {
  return { isValid: true, userId: decoded.userId };
};

const init = async () => {
  await connectDB();
  const server: hapi.Server = new hapi.Server({
    port: 3030,
    routes: { cors: { origin: ["*"] } },
    host: "0.0.0.0",
  });
  await server.register(Inert);
  await server.register(Vision);
  await server.register({
    plugin: HapiSwagger,
    options: {
      info: {
        title: "ShipFinex Backend API",
        version: "1.0.0",
      },
      securityDefinitions: {
        jwt: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
        },
      },
    },
  });
  await server.register(HapiAuthJwt2);

  await server.auth.strategy("jwt", "jwt", {
    key: config.jwtSecret,
    validate: validateUser,
    verifyOptions: { algorithms: ["HS256"] },
  });

  await setRoutes(server);

  await server.start();

  let fileName = __dirname + "/static";
  if (!fs.existsSync(fileName)) {
    fs.mkdirSync(fileName);
  }

  fileName += "/uploads";
  if (!fs.existsSync(fileName)) {
    fs.mkdirSync(fileName);
  }

  const kyc = fileName + "/kyc";
  const project = fileName + "/project";

  if (!fs.existsSync(kyc)) {
    fs.mkdirSync(kyc);
  }
  if (!fs.existsSync(project)) {
    fs.mkdirSync(project);
  }
  console.log(`🚀 Server running on ${server.info.uri} 🚀`);

  return server;
};

init();

export default init;
