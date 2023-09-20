import User from "../../models/users";
import { executeMetaTransaction } from "./utils";

import MANAGER_ABI from "./AbiManager.json";
import PROJECT_ABI from "./AbiProject.json";
import SHIPTOKEN_ABI from "./AbiShipToken.json";

import { web3, adminAccount } from "./localKeys";

const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const MANAGER_CONTRACT_ADDRESS = process.env.MANAGER_CONTRACT_ADDRESS;
const ADMIN_WALLET_VENLY_ID = process.env.ADMIN_WALLET_VENLY_ID;

const managerContract = new web3.eth.Contract(
  MANAGER_ABI as any[],
  MANAGER_CONTRACT_ADDRESS
);

export const getShipTokenAddress = async (projectId: string) => {
  try {
    console.log("getShipTokenAddress--->", projectId);

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
    console.log("getFundraising--->", projectId);

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
    console.log("getWithdrawal--->", projectId);

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
    console.log("getGivenRewards--->", projectId);

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
    console.log("getClaimableAmount--->", projectId, investorAddress);

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
    console.log("getClaimedRewards--->", projectId, investorAddress);

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
    console.log("getShipTokenPrice--->", projectId);

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
    console.log("getBalance--->", projectId, investorAddress);

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

export const claim = async (projectId: string, accountId: string, account) => {
  try {
    console.log("claim--->", projectId, accountId);

    const projectAddress = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });

    await executeMetaTransaction(
      {
        type: "function",
        inputs: [],
        name: "claimRewards",
      },
      [],
      account,
      projectAddress,
      accountId
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const withdraw = async (projectId: string) => {
  try {
    console.log("withdraw--->", projectId);

    const projectAddress = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });

    console.log("withdraw -->", projectAddress);

    await executeMetaTransaction(
      {
        type: "function",
        inputs: [],
        name: "withdraw",
      },
      [],
      adminAccount.address,
      projectAddress,
      ADMIN_WALLET_VENLY_ID
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const deposit = async (
  projectId: string,
  projectOwnerId: string,
  projectOwnerAddress: string,
  amount: number
) => {
  try {
    console.log("deposit--->", projectId, projectOwnerId, amount);

    const projectAddress = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });
    console.log("project deposit -->", projectAddress);

    await executeMetaTransaction(
      {
        type: "function",
        inputs: [
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "approve",
      },
      [
        projectAddress,
        web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
      ],
      projectOwnerAddress,
      MUSD_CONTRACT_ADDRESS,
      projectOwnerId
    );
    await executeMetaTransaction(
      {
        type: "function",
        inputs: [
          {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
          },
        ],
        name: "depositRewards",
      },
      [web3.utils.toWei(web3.utils.toBN(amount), "ether").toString()],
      projectOwnerAddress,
      projectAddress,
      projectOwnerId
    );
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const invest = async (
  projectId: string,
  investorId: string,
  investorAddress: string,
  amount: number
) => {
  try {
    console.log("deposit--->", projectId, investorId, amount);

    const projectAddress = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });

    console.log("On investment project address-->", projectAddress);

    const user = await User.findById(investorId);

    await executeMetaTransaction(
      {
        type: "function",
        inputs: [
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "approve",
      },
      [
        projectAddress,
        web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
      ],
      investorAddress,
      MUSD_CONTRACT_ADDRESS,
      investorId
    );

    await executeMetaTransaction(
      {
        type: "function",
        inputs: [
          {
            internalType: "uint256",
            name: "_amount",
            type: "uint256",
          },
        ],
        name: "invest",
      },
      [web3.utils.toWei(web3.utils.toBN(amount), "ether").toString()],
      investorAddress,
      projectAddress,
      investorId
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
