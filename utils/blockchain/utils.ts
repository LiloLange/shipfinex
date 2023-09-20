import FORWARDER_ABI from "./AbiForwarder.json";
import { web3, adminAccount } from "./localKeys";
import { getSignature } from "../venly";

const FORWARDER_CONTRACT_ADDRESS = process.env.FORWARDER_CONTRACT_ADDRESS;

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const types = {
  EIP712Domain,
  ForwardRequest: [
    {
      name: "from",
      type: "address",
    },
    {
      name: "to",
      type: "address",
    },
    {
      name: "value",
      type: "uint256",
    },
    {
      name: "gas",
      type: "uint256",
    },
    {
      name: "nonce",
      type: "uint256",
    },
    {
      name: "data",
      type: "bytes",
    },
  ],
};

const domain = {
  name: "Forwarder",
  version: 1,
  chainId: 5,
  verifyingContract: FORWARDER_CONTRACT_ADDRESS,
};

export async function executeMetaTransaction(
  abi: any,
  params: any[],
  from: string,
  to: string,
  walletId: string
) {
  const forwardContract = new web3.eth.Contract(
    FORWARDER_ABI as any[],
    FORWARDER_CONTRACT_ADDRESS
  );

  const encodedFunctionData = web3.eth.abi.encodeFunctionCall(abi, params);

  const req = {
    from,
    to,
    value: "0",
    gas: "100000",
    nonce: await forwardContract.methods.getNonce(from).call({ from: from }),
    data: encodedFunctionData,
  };

  try {
    domain.chainId = await web3.eth.getChainId();
    const signature = await getSignature(walletId, {
      types: types,
      domain: domain,
      primaryType: "ForwardRequest",
      message: req,
    });
    console.log("execution signature", signature);

    await forwardContract.methods
      .execute(req, signature)
      .send({ from: adminAccount.address });
  } catch (error) {
    console.log(error);
    throw new Error("Execution failed" + error);
  }
}

/**
 * {
      name: "myMethod",
      type: "function",
      inputs: [
        {
          type: "uint256",
          name: "myNumber",
        },
        {
          type: "string",
          name: "myString",
        },
      ],
    },
    ["2345675643", "Hello!%"]
 */