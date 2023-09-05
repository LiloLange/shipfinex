import crypto from "crypto";
import axios from "axios";

import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import MRN_ABI from "./MRN.json";

import devConfig from "../config";
import qs from "qs";

const sumsubSecret = devConfig.sumsubSecret;
const sumsubToken = devConfig.sumsubToken;

const VENLY_AUTH_BASE_URL = "https://login-staging.venly.io";
const VENLY_WALLET_BASE_URL = "https://api-wallet-sandbox.venly.io";

const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const MRN_CONTRACT_ADDRESS = process.env.MRN_CONTRACT_ADDRESS;

let config: any = {};

// const createSignature = async (config) => {
//   console.log("Creating a signature for the request...");

//   var ts = Math.floor(Date.now() / 1000) + 50;
//   const signature = crypto.createHmac("sha256", sumsubSecret);
//   signature.update(ts + config.method.toUpperCase() + config.url);

//   // if (config.data instanceof FormData) {
//   //   signature.update(config.data.getBuffer());
//   // } else if (config.data) {
//   //   signature.update(config.data);
//   // }

//   config.headers["X-App-Access-Ts"] = ts;
//   config.headers["X-App-Access-Sig"] = signature.digest("hex");
//   config.timeout = 6000;
//   return config;
// };

// axios.interceptors.request.use(createSignature, function (error) {
//   return Promise.reject(error);
// });
const getAccessToken = async () => {
  config.baseURL = VENLY_AUTH_BASE_URL;

  const url = `/auth/realms/Arkane/protocol/openid-connect/token`;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const data = {
    grant_type: "client_credentials",
    client_id: devConfig.venlyclientId,
    client_secret: devConfig.venlyclientSecret,
  };

  config.method = "POST";
  config.url = url;
  config.headers = headers;
  config.data = qs.stringify(data);
  try {
    const response = await axios(config);
    return response.data.access_token;
  } catch (error) {
    // console.log(error);
  }
};

const createWallet = async () => {
  const token = await getAccessToken();
  config.baseURL = VENLY_WALLET_BASE_URL;

  const url = `/api/wallets`;

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
  const data = {
    pincode: "177438",
    secretType: "ETHEREUM",
    walletType: "WHITE_LABEL",
  };
  config.method = "POST";
  config.url = url;
  config.headers = headers;
  config.responseType = "json";
  config.data = data;
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const localKeyProvider = new HDWalletProvider({
  privateKeys: [adminPrivateKey],
  providerOrUrl: "https://ethereum-goerli.publicnode.com",
});

// @ts-ignore
const web3 = new Web3(localKeyProvider);

const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

const mrnContract = new web3.eth.Contract(
  MRN_ABI as any[],
  MRN_CONTRACT_ADDRESS
);

export const mint = async (to: string, amount: string) => {
  await mrnContract.methods
    // @ts-ignore
    .mint(to, amount)
    .send({ from: adminAccount.address })
    .on("transactionHash", (hash: string) => {})
    // @ts-ignore
    .on("confirmation", (confirmationNumber: number, recepit: any) => {})
    .on("error", (error: any) => {});
};

export const burn = async (from: string, amount: string) => {
  await mrnContract.methods
    // @ts-ignore
    .burn(from, amount)
    .send({ from: adminAccount.address })
    .on("transactionHash", (hash: string) => {})
    // @ts-ignore
    .on("confirmation", (confirmationNumber: number, recepit: any) => {})
    .on("error", (error: any) => {});
};

export const getBalance = async (address: string) => {
  const totalBalance = await mrnContract.methods
    // @ts-ignore
    .balanceOf(address)
    .call({ from: adminAccount.address });
  const cryptoBalance = await mrnContract.methods
    // @ts-ignore
    .cryptoBalances(address)
    .call({ from: adminAccount.address });
  const stripeBalance = await mrnContract.methods
    // @ts-ignore
    .stripeBalances(address)
    .call({ from: adminAccount.address });

  return { totalBalance, cryptoBalance, stripeBalance };
};

export { createWallet, getAccessToken };
