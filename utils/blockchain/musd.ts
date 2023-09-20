import MUSD_ABI from "./AbiMUSD.json";

import { web3, adminAccount } from "./localKeys";
import { executeMetaTransaction } from "./utils";

const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const ADMIN_WALLET_VENLY_ID = process.env.ADMIN_WALLET_VENLY_ID;

const musdContract = new web3.eth.Contract(
  MUSD_ABI as any[],
  MUSD_CONTRACT_ADDRESS
);

export const mint = async (to: string, amount: number) => {
  try {
    console.log("mint-->");

    await executeMetaTransaction(
      {
        name: "mint",
        type: "function",
        inputs: [
          {
            internalType: "address",
            name: "_to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
          },
        ],
      },
      [to, web3.utils.toWei(web3.utils.toBN(amount), "ether").toString()],
      adminAccount.address,
      MUSD_CONTRACT_ADDRESS,
      ADMIN_WALLET_VENLY_ID
    );
  } catch (err) {
    console.log("mint error->", err);
  }
};

export const burn = async (from: string, amount: number, type: boolean) => {
  try {
    console.log("burn-->");

    await executeMetaTransaction(
      {
        name: "burn",
        type: "function",
        inputs: [
          {
            internalType: "address",
            name: "_from",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
          },
        ],
      },
      [from, web3.utils.toWei(web3.utils.toBN(amount), "ether").toString()],
      adminAccount.address,
      MUSD_CONTRACT_ADDRESS,
      ADMIN_WALLET_VENLY_ID
    );
  } catch (err) {
    console.log(err);
  }
};

export const getBalance = async (address: string) => {
  try {
    console.log("getBalance-->");

    const totalBalance = await musdContract.methods
      .balanceOf(address)
      .call({ from: adminAccount.address });

    return totalBalance;
  } catch (error) {
    console.log(error);
  }
};
