import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";
import MUSD_ABI from "./AbiMUSD.json";

const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const localKeyProvider = new HDWalletProvider({
  privateKeys: [adminPrivateKey],
  providerOrUrl:
    "https://eth-goerli.g.alchemy.com/v2/KqDagOiXKFQ8T_QzPNpKBk1Yn-3Zgtgl",
});

export const mint = async (to: string, amount: number) => {
  try {
    const web3 = new Web3(localKeyProvider);
    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

    const musdContract = new web3.eth.Contract(
      MUSD_ABI as any[],
      MUSD_CONTRACT_ADDRESS
    );
    await musdContract.methods
      .mint(to, web3.utils.toWei(web3.utils.toBN(amount), "ether").toString())
      .send({ from: adminAccount.address });
  } catch (err) {
    console.log("mint error->", err);
  }
};

export const burn = async (from: string, amount: number, type: boolean) => {
  try {
    const web3 = new Web3(localKeyProvider);
    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

    const musdContract = new web3.eth.Contract(
      MUSD_ABI as any[],
      MUSD_CONTRACT_ADDRESS
    );
    await musdContract.methods
      .burn(
        from,
        web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
        type
      )
      .send({ from: adminAccount.address })
      .on("transactionHash", (hash: string) => {})
      .on("confirmation", (confirmationNumber: number, recepit: any) => {})
      .on("error", (error: any) => {});
  } catch (err) {
    console.log(err);
  }
};

export const getBalance = async (address: string) => {
  try {
    const web3 = new Web3(localKeyProvider);
    const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);

    const musdContract = new web3.eth.Contract(
      MUSD_ABI as any[],
      MUSD_CONTRACT_ADDRESS
    );
    const totalBalance = await musdContract.methods
      .balanceOf(address)
      .call({ from: adminAccount.address });

    return totalBalance;
  } catch (error) {
    console.log(error);
  }
};
