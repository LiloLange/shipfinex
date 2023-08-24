import dotenv from "dotenv";

dotenv.config();
export default {
  mongoURI: process.env.DATABASE,
  jwtSecret: process.env.JWTSECRET,
  apiVersion: process.env.APIVERSION,
  sumsubToken: process.env.SUMSUB_TOKEN,
  sumsubSecret: process.env.SUMSUB_SECRET,
};
