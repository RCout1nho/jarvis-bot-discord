import { Client, Message, Collection, MessageEmbedOptions } from "discord.js";

interface IClient extends Client {
  commands?: Collection<any, any>;
  queues?: Map<any, any>;
  aliases?: Collection<any, any>;
}

interface ICommandProps {
  client: IClient;
  msg: Message;
  args: string[];
}

const execute = async ({ client, msg, args }: ICommandProps): Promise<any> => {
  let response = "";
  client?.commands?.forEach((command: any) => {
    if (command.default.help) {
      response += `**${process.env.PREFIX}${command.default.name}**: ${command.default.help}\n`;
    }
  });

  response += "\n**Atalhos**:\n";

  client.aliases?.forEach((alias: any) => {
    response += `${process.env.PREFIX}${alias.default.name} -> ${process.env.PREFIX}${alias.default.alias}`;
  });

  const embed: MessageEmbedOptions = {
    title: "Comandos",
    description: response,
    color: "#0575A9",
  };

  return msg.channel.send({ embed });
};

export default {
  name: "help",
  execute,
};
