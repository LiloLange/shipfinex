import Web3 from "web3";
import axios from "axios";
import HDWalletProvider from "@truffle/hdwallet-provider";

import { executeTransaction } from "../venly";
import User from "../../models/users";

import MANAGER_ABI from "./Manager.json";

const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const MANAGER_CONTRACT_ADDRESS = process.env.MANAGER_CONTRACT_ADDRESS;
const localKeyProvider = new HDWalletProvider({
  privateKeys: [adminPrivateKey],
  providerOrUrl:
    "https://eth-goerli.g.alchemy.com/v2/KqDagOiXKFQ8T_QzPNpKBk1Yn-3Zgtgl",
});

export const claim = async (projectId: string, accountId: string) => {
  try {
    const web3 = new Web3(localKeyProvider);
    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

    const managerContract = new web3.eth.Contract(
      MANAGER_ABI as any[],
      MANAGER_CONTRACT_ADDRESS
    );

    const projectAddress = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });

    let inputs = [];
    const response = await executeTransaction(
      accountId,
      projectAddress,
      "claimRewards",
      inputs
    );

    if (!response["success"]) return;
  } catch (error) {
    console.log(error);
  }
};

export const deposit = async (
  projectId: string,
  projectOwnerId: string,
  amount: number
) => {
  try {
    const web3 = new Web3(localKeyProvider);
    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

    const managerContract = new web3.eth.Contract(
      MANAGER_ABI as any[],
      MANAGER_CONTRACT_ADDRESS
    );

    const projectAddress = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });

    let inputs = [
      {
        type: "address",
        value: projectAddress,
      },
      {
        type: "uint256",
        value: web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
      },
    ];
    const response = await executeTransaction(
      projectOwnerId,
      MUSD_CONTRACT_ADDRESS,
      "approve",
      inputs
    );

    if (!response["success"]) return;

    inputs = [
      {
        type: "uint256",
        value: web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
      },
    ];
    await executeTransaction(
      projectOwnerId,
      projectAddress,
      "depositRewards",
      inputs
    );
  } catch (error) {
    console.log(error);
  }
};

export const invest = async (
  projectId: string,
  investorId: string,
  amount: number
) => {
  try {
    const web3 = new Web3(localKeyProvider);
    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

    const managerContract = new web3.eth.Contract(
      MANAGER_ABI as any[],
      MANAGER_CONTRACT_ADDRESS
    );

    const projectAddress = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });

    const user = await User.findById(investorId);

    let inputs = [
      {
        type: "address",
        value: projectAddress,
      },
      {
        type: "uint256",
        value: web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
      },
    ];
    const response = await executeTransaction(
      user.wallet.id,
      MUSD_CONTRACT_ADDRESS,
      "approve",
      inputs
    );

    if (response && response["success"] === true) {
      inputs = [
        {
          type: "uint256",
          value: web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
        },
      ];
      const investResponse = await executeTransaction(
        user.wallet.id,
        projectAddress,
        "invest",
        inputs
      );
      return investResponse && investResponse["success"] === true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};
