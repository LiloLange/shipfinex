import dotenv from "dotenv";

dotenv.config();
export default {
  mongoURI: process.env.DATABASE_URI,
  jwtSecret: process.env.JWT_SECRET,
  apiVersion: process.env.API_VERSION,
  sumsubToken: process.env.SUMSUB_TOKEN,
  sumsubSecret: process.env.SUMSUB_SECRET,
};
