import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";

import { executeTransaction } from "../venly";
import User from "../../models/users";

import MANAGER_ABI from "./AbiManager.json";
import PROJECT_ABI from "./AbiProject.json";
import SHIPTOKEN_ABI from "./AbiShipToken.json";

const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const MANAGER_CONTRACT_ADDRESS = process.env.MANAGER_CONTRACT_ADDRESS;
const localKeyProvider = new HDWalletProvider({
  privateKeys: [adminPrivateKey],
  providerOrUrl:
    "https://eth-goerli.g.alchemy.com/v2/KqDagOiXKFQ8T_QzPNpKBk1Yn-3Zgtgl",
});

export const getShipTokenAddress = async (projectId: string) => {
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

    const projectContract = new web3.eth.Contract(
      PROJECT_ABI as any[],
      projectAddress
    );
    const shipTokenAddress = await projectContract.methods
      .shipToken()
      .call({ from: adminAccount.address });
    return shipTokenAddress;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const getFundraising = async (projectId: string) => {
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

    const projectContract = new web3.eth.Contract(
      PROJECT_ABI as any[],
      projectAddress
    );
    const result = await projectContract.methods
      .fundraising()
      .call({ from: adminAccount.address });
    return web3.utils.fromWei(result, "ether").toString();
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const getWithdrawal = async (projectId: string) => {
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

    const projectContract = new web3.eth.Contract(
      PROJECT_ABI as any[],
      projectAddress
    );
    const result = await projectContract.methods
      .withdrawal()
      .call({ from: adminAccount.address });
    return web3.utils.fromWei(result, "ether").toString();
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const getGivenRewards = async (projectId: string) => {
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

    const projectContract = new web3.eth.Contract(
      PROJECT_ABI as any[],
      projectAddress
    );
    const result = await projectContract.methods
      .givenRewards()
      .call({ from: adminAccount.address });
    return web3.utils.fromWei(result, "ether").toString();
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const getClaimableAmount = async (
  projectId: string,
  investorAddress: string
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

    const projectContract = new web3.eth.Contract(
      PROJECT_ABI as any[],
      projectAddress
    );
    const result = await projectContract.methods
      .claimableAmount(investorAddress)
      .call({ from: adminAccount.address });
    return web3.utils.fromWei(result, "ether").toString();
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const getClaimedRewards = async (
  projectId: string,
  investorAddress: string
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

    const projectContract = new web3.eth.Contract(
      PROJECT_ABI as any[],
      projectAddress
    );
    const result = await projectContract.methods
      .claimed(investorAddress)
      .call({ from: adminAccount.address });
    return web3.utils.fromWei(result, "ether").toString();
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const getShipTokenPrice = async (projectId: string) => {
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

    const projectContract = new web3.eth.Contract(
      PROJECT_ABI as any[],
      projectAddress
    );
    const result = await projectContract.methods
      .shipTokenPrice()
      .call({ from: adminAccount.address });
    return web3.utils.fromWei(result, "ether").toString();
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const getBalance = async (
  projectId: string,
  investorAddress: string
) => {
  try {
    const web3 = new Web3(localKeyProvider);
    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

    const shipTokenAddress = await getShipTokenAddress(projectId);

    const shipTokenContract = new web3.eth.Contract(
      SHIPTOKEN_ABI as any[],
      shipTokenAddress
    );
    const result = await shipTokenContract.methods
      .balanceOf(investorAddress)
      .call({ from: adminAccount.address });
    return web3.utils.fromWei(result, "ether").toString();
  } catch (error) {
    console.log(error);
    return 0;
  }
};

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

    if (!response || !response["success"]) return false;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const withdraw = async (projectId: string) => {
  try {
    const web3 = new Web3(localKeyProvider);
    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

    console.log(projectId);

    const managerContract = new web3.eth.Contract(
      MANAGER_ABI as any[],
      MANAGER_CONTRACT_ADDRESS
    );

    const projectAddress = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });

    console.log("withdraw -->", projectAddress);

    const projectContract = new web3.eth.Contract(
      PROJECT_ABI as any[],
      projectAddress
    );

    const fundraising = await projectContract.methods
      .fundraising()
      .call({ from: adminAccount.address });
    const withdrawals = await projectContract.methods
      .withdrawal()
      .call({ from: adminAccount.address });

    console.log("withdraw console -->", fundraising, withdrawals);

    await projectContract.methods
      .withdraw(web3.utils.toBN(fundraising).sub(web3.utils.toBN(withdrawals)))
      .send({ from: adminAccount.address });
    return true;
  } catch (err) {
    console.log(err);
    return false;
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
    console.log("project deposit -->", projectAddress);
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

    if (!response || !response["success"]) return false;

    inputs = [
      {
        type: "uint256",
        value: web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
      },
    ];
    const depositResponse = await executeTransaction(
      projectOwnerId,
      projectAddress,
      "depositRewards",
      inputs
    );

    if (!depositResponse || !depositResponse["success"]) return false;
    return true;
  } catch (error) {
    console.log(error);
    return false;
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
