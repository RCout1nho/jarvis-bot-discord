import { Client, Message, Collection, MessageEmbedOptions } from "discord.js";

interface IClient extends Client {
  commands?: Collection<any, any>;
  queues?: Map<any, any>;
}

interface ICommandProps {
  client: IClient;
  msg: Message;
  args: string[];
}

const execute = async ({ client, msg, args }: ICommandProps): Promise<any> => {
  const embed: MessageEmbedOptions = {
    color: "#0099ff",
    title: `Seja bem-vindo, ${msg.author.username}#${msg.author.discriminator}`,
    description: "Sinta-se em casa",
    thumbnail: {
      url: msg.author.avatar
        ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${
            Number(msg.author.discriminator) % 5
          }.png`,
    },
    footer: {
      text: "Jarvis discord bot by RCout1nho, all rights reserved ®",
    },
    fields: [
      {
        name: "Você é o membro nº",
        value: msg.guild?.memberCount.toString() || "0",
        inline: false,
      },
    ],
    timestamp: new Date(),
  };
  await msg.channel.send({ embed });
};

export default {
  // name: "embed",
  // help: "Retorna uma MessageEmbed",
  // execute,
};
