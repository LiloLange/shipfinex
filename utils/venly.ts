import crypto from "crypto";
import axios from "axios";
import devConfig from "../config";
import qs from "qs";

const sumsubSecret = devConfig.sumsubSecret;
const sumsubToken = devConfig.sumsubToken;

const VENLY_AUTH_BASE_URL = "https://login-staging.venly.io";
const VENLY_WALLET_BASE_URL = "https://api-wallet-sandbox.venly.io";

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

export { createWallet, getAccessToken };
