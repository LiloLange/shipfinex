import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import MUSD_ABI from "./AbiMUSD.json";
import PROJECT_ABI from "./AbiProject.json";
import MANAGER_ABI from "./AbiManager.json";

const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const MANAGER_CONTRACT_ADDRESS = process.env.MANAGER_CONTRACT_ADDRESS;
const localKeyProvider = new HDWalletProvider({
  privateKeys: [adminPrivateKey],
  providerOrUrl:
    "https://eth-goerli.g.alchemy.com/v2/KqDagOiXKFQ8T_QzPNpKBk1Yn-3Zgtgl",
});

export const getProjectAddress = async (projectId: string) => {
  const web3 = new Web3(localKeyProvider);
  const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

  const managerContract = new web3.eth.Contract(
    MANAGER_ABI as any[],
    MANAGER_CONTRACT_ADDRESS
  );

  return await managerContract.methods
    .projects(projectId)
    .call({ from: adminAccount.address });
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
    const web3 = new Web3(localKeyProvider);
    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

    const managerContract = new web3.eth.Contract(
      MANAGER_ABI as any[],
      MANAGER_CONTRACT_ADDRESS
    );

    await managerContract.methods
      .createNewProject(
        projectId,
        tokenName,
        tokenSymbol,
        web3.utils.toWei(web3.utils.toBN(supply), "ether").toString(),
        decimals,
        web3.utils.toWei(web3.utils.toBN(price), "ether").toString(),
        projectOwner
      )
      .send({ from: adminAccount.address });

    const projectContract = await managerContract.methods
      .projects(projectId)
      .call({ from: adminAccount.address });
    return { success: true, contract: projectContract };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};
