import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";

const generateWallet = async () => {
  const connection = new Connection(clusterApiUrl("devnet"));

  const wallet = Keypair.generate();

  const balance = await connection.getBalance(wallet.publicKey);

  console.log("New wallet generated:");
  console.log("Public Key:", wallet.publicKey.toString());

  console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");

  return wallet;
};

// Generate and log the wallet
generateWallet().catch(console.error);
