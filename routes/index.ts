import { Server } from "@hapi/hapi";

import config from "../config";

import { kycRoute } from "./kyc";
import { userRoute } from "./user";
import { mileStoneRoute } from "./milestone";
import { projectRoute } from "./project";
import { transactionRoute } from "./transaction";
import { vesselRoute } from "./vessel";

const prefix = `/api/${config.apiVersion}`;

const setRoutes = async (server: Server) => {
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/user`;
  server.route(userRoute);

  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/kyc`;
  server.route(kycRoute);

  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/milestone`;
  server.route(mileStoneRoute);

  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/project`;
  server.route(projectRoute);

  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/transaction`;
  server.route(transactionRoute);

  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/vessel`;
  server.route(vesselRoute);
};
export default setRoutes;
