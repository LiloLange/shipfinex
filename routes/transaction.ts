import { Request, ResponseToolkit } from "@hapi/hapi";

export let transactionRoute = [
  {
    method: "POST",
    path: "/register",
    handler: (request: Request, response: ResponseToolkit) => {
      return "KYC Hello World!";
    },
  },
  {
    method: "GET",
    path: "/all",
    handler: (request: Request, response: ResponseToolkit) => {
      return "Hello World!";
    },
  },
];
