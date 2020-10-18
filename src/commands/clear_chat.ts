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

const execute = async ({ client, msg, args }: ICommandProps) => {
  if (msg.member?.hasPermission('MANAGE_MESSAGES')) {
    const messages = await msg.channel.messages.fetch();
    messages.forEach((m) => {
      m.delete();
    });
  }
};

export default {
  name: 'clear_chat',
  help: 'Limpar o chat',
  execute,
};
