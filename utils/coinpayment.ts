import Coinpayments from "coinpayments";
import devConfig from "../config";

interface CoinpaymentsCredentials {
  key: string;
  secret: string;
  sandbox: boolean;
}

const credential: CoinpaymentsCredentials = {
  key: devConfig.coinpaymentKey,
  secret: devConfig.coinpaymentSecret,
  sandbox: true,
};
const client = new Coinpayments(credential);

const createTransaction = async (
  ipn_url,
  email,
  currency1,
  currency2,
  amount
) => {
  try {
    const response = await client.createTransaction({
      amount: amount,
      currency1: currency1,
      currency2: currency2,
      buyer_email: email,
      ipn_url,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export { createTransaction };
