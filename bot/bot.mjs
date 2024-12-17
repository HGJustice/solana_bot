import { Bot, Keyboard } from "grammy";
import bs58 from "bs58";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { IDL } from "./message.js";
import dotenv from "dotenv";
dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);
const programId = new PublicKey("J5EGAnhY5LRwbRZC5tWXnxjKqtbc6URC88Xnv69yn1Nj");

const userWallets = new Map();
const userStates = new Map();

const labels = [
  "Create solana wallet",
  "Get 1 SOL Airdrop",
  "Get Balance",
  "Set Word",
  "Get Word",
];
const buttonRows = labels.map((label) => [Keyboard.text(label)]);
const keyboard = Keyboard.from(buttonRows);

bot.command("start", async (ctx) => {
  await ctx.reply("Hey please choose one of the following options: ", {
    reply_markup: keyboard,
  });
});

bot.hears("Create solana wallet", async (ctx) => {
  try {
    const wallet = Keypair.generate();
    userWallets.set(ctx.from.id, wallet);
    const connection = new Connection(clusterApiUrl("devnet"));
    const balance = await connection.getBalance(wallet.publicKey);

    await ctx.reply(
      `✅ New Solana wallet created (devnet):\n\n📋 Public Key: \n${wallet.publicKey.toString()}\n Balance: ${
        balance / LAMPORTS_PER_SOL
      } SOL`
    );
  } catch (error) {
    await ctx.reply("❌ Error creating wallet: " + error.message);
  }
});

bot.hears("Get 1 SOL Airdrop", async (ctx) => {
  try {
    // Get user's wallet from our Map
    const userWallet = userWallets.get(ctx.from.id);
    if (!userWallet) {
      return ctx.reply(
        "Please create a wallet first using 'Create solana wallet'!"
      );
    }

    const connection = new Connection(clusterApiUrl("devnet"));

    const payerKeypair = Keypair.fromSecretKey(
      bs58.decode(process.env.PAYMASTER_KEY)
    );

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payerKeypair.publicKey,
        toPubkey: userWallet.publicKey,
        lamports: LAMPORTS_PER_SOL, // 1 SOL
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerKeypair.publicKey;

    const payerBalance = await connection.getBalance(payerKeypair.publicKey);
    if (payerBalance < LAMPORTS_PER_SOL + 5000) {
      return ctx.reply("Insufficient funds in the airdrop wallet!");
    }

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      payerKeypair,
    ]);

    await ctx.reply(
      `✅ Successfully sent 1 SOL!\n\nTransaction signature: ${signature}`
    );
  } catch (error) {
    console.error("Error:", error);
    await ctx.reply("❌ Error processing airdrop: " + error.message);
  }
});

bot.hears("Get Balance", async (ctx) => {
  try {
    const wallet = userWallets.get(ctx.from.id);
    const connection = new Connection(clusterApiUrl("devnet"));
    const balance = await connection.getBalance(wallet.publicKey);

    await ctx.reply(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (error) {
    await ctx.reply("❌ Error getting balance: " + error.message);
  }
});

bot.hears("Set Word", async (ctx) => {
  try {
    const userWallet = userWallets.get(ctx.from.id);
    if (!userWallet) {
      return ctx.reply(
        "Please create a wallet first using 'Create solana wallet'!"
      );
    }

    const connection = new Connection(clusterApiUrl("devnet"));
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: userWallet.publicKey,
        signTransaction: async (tx) => {
          tx.partialSign(userWallet);
          return tx;
        },
        signAllTransactions: async (txs) => {
          return txs.map((tx) => {
            tx.partialSign(userWallet);
            return tx;
          });
        },
      },
      { commitment: "processed" }
    );

    const program = new Program(IDL, programId, provider);

    const [messagePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("message"), userWallet.publicKey.toBuffer()],
      programId
    );

    const message = "Wag 1 pussy!";

    const tx = await program.methods
      .setMessage(message)
      .accounts({
        user: userWallet.publicKey,
        message: messagePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([userWallet])
      .rpc();

    await ctx.reply(`✅ Message set successfully!\nTransaction: ${tx}`);
  } catch (error) {
    console.error("Error:", error);
    await ctx.reply("❌ Error setting message: " + error.message);
  }
});

bot.hears("Get Word", async (ctx) => {});

bot.start();
