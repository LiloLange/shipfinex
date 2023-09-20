import MANAGER_ABI from "./AbiManager.json";
import { executeMetaTransaction } from "./utils";

import { web3, adminAccount } from "./localKeys";

const MANAGER_CONTRACT_ADDRESS = process.env.MANAGER_CONTRACT_ADDRESS;
const FORWARDER_CONTRACT_ADDRESS = process.env.FORWARDER_CONTRACT_ADDRESS;
const ADMIN_WALLET_VENLY_ID = process.env.ADMIN_WALLET_VENLY_ID;

const managerContract = new web3.eth.Contract(
  MANAGER_ABI as any[],
  MANAGER_CONTRACT_ADDRESS
);

export const getProjectAddress = async (projectId: string) => {
  try {
    console.log("getProjectAddress-->");
    return await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

export const createNewProject = async (
  projectId: string,
  tokenName: string,
  tokenSymbol: string,
  supply: number,
  decimals: number,
  price: number,
  projectOwner: string
) => {
  try {
    console.log("createNewProject-->");

    await executeMetaTransaction(
      {
        name: "createNewProject",
        type: "function",
        inputs: [
          {
            internalType: "string",
            name: "projectId",
            type: "string",
          },
          {
            internalType: "string",
            name: "tokenName",
            type: "string",
          },
          {
            internalType: "string",
            name: "tokenSymbol",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "supply",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "decimals",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "_shipTokenPrice",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "_projectOwner",
            type: "address",
          },
        ],
      },
      [
        projectId,
        tokenName,
        tokenSymbol,
        web3.utils.toWei(web3.utils.toBN(supply), "ether").toString(),
        decimals,
        web3.utils.toWei(web3.utils.toBN(price), "ether").toString(),
        projectOwner,
      ],
      adminAccount.address,
      FORWARDER_CONTRACT_ADDRESS,
      ADMIN_WALLET_VENLY_ID
    );

    const projectContract = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });
    return { success: true, contract: projectContract };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};
