import { Client, Message, Collection } from 'discord.js';

interface IClient extends Client {
  commands?: Collection<any, any>;
  queues?: Map<any, any>;
}

interface ICommandProps {
  client: IClient;
  msg: Message;
  args: string[];
}

const execute = ({ client, msg, args }: ICommandProps) => {
  let response = '### COMANDOS ###\n';
  client?.commands?.forEach((command: any) => {
    if (command.default.help) {
      response += `**${process.env.PREFIX}${command.default.name}**: ${command.default.help}\n`;
    }
  });

  return msg.channel.send(response);
};

export default {
  name: 'help',
  execute,
};
