import { Request, ResponseToolkit } from "@hapi/hapi";
import Investment from "../models/investments";
import User from "../models/users";
import Project from "../models/projects";

import {
  getBalance,
  getClaimableAmount,
  getClaimedRewards,
  getFundraising,
  getGivenRewards,
  getShipTokenPrice,
  invest,
} from "../utils/blockchain/project";

import { investSchema, getInvestmentSchema } from "../validation/investment";

import { investSwagger, getInvestmentSwagger } from "../swagger/investment";

const options = { abortEarly: false, stripUnknown: true };
export let investmentRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Investment on project",
      plugins: investSwagger,
      tags: ["api", "user"],
      validate: {
        payload: investSchema,
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
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const payload = {
          userId: request.auth.credentials.userId,
          projectId: request.payload["projectId"],
          amount: request.payload["amount"],
        };
        console.log("----investment here----");
        const user = await User.findById(payload.userId);

        const investResult = await invest(
          payload.projectId,
          user.wallet.id,
          user.wallet.address,
          payload.amount
        );

        if (investResult) {
          console.log("investment payload -->", payload);
          const project = await Investment.findOne({
            userId: payload.userId,
            projectId: payload.projectId,
          });
          if (project) {
            project.amount += payload.amount;
            await project.save();
          } else {
            const newInvest = new Investment(payload);
            await newInvest.save();
          }
          return response.response({ msg: "Invest success" }).code(201);
        } else {
          return response.response({ msg: "Invest failed." }).code(400);
        }
      } catch (error) {
        console.log(error);
        return response.response({ msg: "Invest failed" }).code(500);
      }
    },
  },
  {
    method: "GET",
    path: "/",
    options: {
      auth: "jwt",
      description:
        "Get investment with pagination, userId, projectId, status, page",
      plugins: getInvestmentSwagger,
      tags: ["api", "kyc"],
      validate: {
        query: getInvestmentSchema,
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
        const userId = request.auth.credentials.userId;
        const user = await User.findById(userId);
        var totalAmount = 0;
        var totalClaimed = 0;
        var totalClaimable = 0;

        if (user.role === "investor") {
          const projectIds = await Project.find({});
          const investorAddress = user.wallet.address;
          const result: any[] = [];
          for (let i = 0; i < projectIds.length; i++) {
            const row = projectIds[i];

            const amount = await getBalance(
              row._id.toString(),
              investorAddress
            );

            if (Number(amount) === 0) continue;
            const price = await getShipTokenPrice(row._id.toString());

            const claimed = await getClaimedRewards(
              row._id.toString(),
              investorAddress
            );

            const claimable = await getClaimableAmount(
              row._id.toString(),
              investorAddress
            );

            totalAmount += Number(amount) * Number(price);
            totalClaimed += Number(claimed);
            totalClaimable += Number(claimable);

            result.push({
              project: row,
              amount,
              price,
              claimedRewards: claimed,
              claimableRewards: claimable,
            });
          }

          return {
            total: {
              investment: totalAmount,
              claimed: totalClaimed,
              claimable: totalClaimable,
            },
            data: result,
          };
        }
        if (user.role === "prowner") {
          const projectIds = await Project.find({ projectOwner: userId });
          var totalFundraising = 0;
          var totalRewards = 0;
          const result: any[] = [];

          for (let i = 0; i < projectIds.length; i++) {
            const project = projectIds[i];

            const fundraising = await getFundraising(project._id.toString());
            const givenRewards = await getGivenRewards(project._id.toString());

            totalFundraising += Number(fundraising);
            totalRewards += Number(givenRewards);

            result.push({
              project,
              fundraising,
              givenRewards,
            });
          }

          return {
            data: result,
            total: { fundraising: totalFundraising, rewards: totalRewards },
          };
        }
        return response
          .response({ msg: "You have no permission to access." })
          .code(403);
      },
    },
  },
  // {
  //   method: "GET",
  //   path: "/{userId}",
  //   options: {
  //     auth: "jwt",
  //     description: "Get signle user's information",
  //     plugins: getSingleUserSwagger,
  //     tags: ["api", "user"],
  //     handler: async (request: Request, response: ResponseToolkit) => {
  //       const userId = request.auth.credentials.userId;
  //       const authUser = await User.findById(userId);
  //       if (authUser.role === "admin") {
  //         const user = await User.findById(request.params.userId);
  //         if (user) return user;
  //         return response
  //           .response({ msg: "Cannot find the specific user's information." })
  //           .code(400);
  //       }
  //       return response
  //         .response({ msg: "You have no permission to access." })
  //         .code(403);
  //     },
  //   },
  // },
  // {
  //   method: "PUT",
  //   path: "/{userId}",
  //   options: {
  //     auth: "jwt",
  //     description: "Get single user's information",
  //     plugins: getSingleUserSwagger,
  //     tags: ["api", "user"],
  //     validate: {
  //       payload: userUpdateSchema,
  //       options,
  //       failAction: (request, h, error) => {
  //         const details = error.details.map((d) => {
  //           return {
  //             message: d.message,
  //             path: d.path,
  //           };
  //         });
  //         return h.response(details).code(400).takeover();
  //       },
  //     },
  //     handler: async (request: Request, response: ResponseToolkit) => {
  //       const payload = request.payload as UpdateUserPayload;
  //       if (payload.password) {
  //         const hash = await bcrypt.hash(payload.password, 10);
  //         payload.password = hash;
  //       }
  //       const userId = request.auth.credentials.userId;
  //       const authUser = await User.findById(userId);
  //       if (authUser.role === "admin" || request.params.userId === userId) {
  //         const user = await User.findOneAndUpdate(
  //           { _id: request.params.userId },
  //           { $set: payload },
  //           { new: true }
  //         );
  //         return user;
  //       }
  //       return response.response({ msg: "Cannot update" }).code(400);
  //     },
  //   },
  // },
];
