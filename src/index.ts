import fs from "fs";
import path from "path";
import "dotenv/config";

import Discord, { Client, Collection } from "discord.js";

interface IClient extends Client {
  aliases?: Collection<any, any>;
  commands?: Collection<any, any>;
  queues?: Map<any, any>;
}

const client: IClient = new Discord.Client();

client.login(process.env.DISCORD_TOKEN);

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.queues = new Map();

const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((filename) =>
    filename.endsWith(process.env.ENVIRONMENT === "dev" ? ".ts" : ".js")
  );

commandFiles.forEach(async (filename) => {
  const command = await import(`./commands/${filename}`);
  client.commands?.set(command.default.name, command);
  if (command.default.alias) {
    client.aliases?.set(command.default.alias, command);
  }
});

client.on("message", async (msg) => {
  if (process.env.PREFIX) {
    if (!msg.content.startsWith(process.env.PREFIX) || msg.author.bot) return;

    const args = msg.content.slice(process.env.PREFIX.length).split(" ");
    const command = args.shift();

    try {
      const com = await client.commands
        ?.get(command)
        ?.default.execute({ client, msg, args });

      const alias = await client.aliases
        ?.get(command)
        ?.default.execute({ client, msg, args });
      if (!com && !alias) {
        await msg.reply("Não entendi o que quis dizer :/");
      }
    } catch (e) {
      return msg.reply("Ocorreu um erro, tente novamente mais tarde!");
    }
  }
});
