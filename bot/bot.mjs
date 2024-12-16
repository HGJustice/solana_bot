import { Bot, Keyboard } from "grammy";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

const userWallets = new Map();

const labels = ["Create solana wallet", "Get Balance", "Set Word", "Get Word"];
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

bot.hears("Set Word", async(ctx), async (ctx) => {});

bot.hears("Get Word", async(ctx), async (ctx) => {});

bot.start();
