import { Request, ResponseToolkit } from "@hapi/hapi";

import { getTransactionSchema } from "../validation/transaction";
import { getTransactionSwagger } from "../swagger/transaction";
import { getTransaction } from "../utils/etherscan";
import Project from "../models/projects";
import { getShipTokenAddress } from "../utils/blockchain/project";
import User from "../models/users";

const options = { abortEarly: false, stripUnknown: true };
export let transactionRoute = [
  {
    method: "GET",
    path: "/all",
    options: {
      // auth: "jwt",
      description: "Get all transactions by role with pagination",
      plugins: getTransactionSwagger,
      tags: ["api", "transaction"],
      validate: {
        query: getTransactionSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              message: d.message,
              path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
      handler: async (request: Request, response: ResponseToolkit) => {
        const user = await User.findById(request.auth.credentials.userId);
        // const shipTokenAddress = await getShipTokenAddress(
        //   "64fada16159fdbf1e3628d42"
        // );

        // const user = {
        //   role: "investor",
        //   _id: "6500549f75596d3756f73ef2",
        //   wallet: {
        //     address: "0xBf78D8A42D9a9aa73DaAfa6c8fB065d400C90Fa6",
        //   },
        // };
        let { page } = request.query;

        if (page === undefined) {
          page = 1;
        }
        if (user.role === "investor") {
          const result = await getTransaction(user.wallet.address, page);
          return response.response(result).code(200);
        } else if (user.role === "prowner") {
          const projects = await Project.find({ projectOwner: user._id });
          let transactionResult = [];
          console.log("prowner project count", projects.length);
          for (let i = 0; i < projects.length; i++) {
            const project = projects[i];

            const shipTokenAddress = await getShipTokenAddress(
              project._id.toString()
            );
            const result = await getTransaction(shipTokenAddress, page);
            transactionResult.push(result);
            console.log(
              "prowner's project shiptoken address",
              shipTokenAddress,
              result
            );
          }
          return response.response(transactionResult).code(200);
        }
        return response.response({ msg: "failed" }).code(400);
      },
    },
  },
];
