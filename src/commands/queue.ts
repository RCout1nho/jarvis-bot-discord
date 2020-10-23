import {
  Client,
  Message,
  Collection,
  VoiceConnection,
  StreamDispatcher,
  MessageEmbedOptions,
} from "discord.js";
import { VideoSearchResult } from "yt-search";

interface IClient extends Client {
  commands?: Collection<any, any>;
  queues?: Map<any, any>;
}

interface ICommandProps {
  client: IClient;
  msg: Message;
  args: string[];
}

interface IQueue {
  volume: number;
  connection: VoiceConnection;
  dispatcher?: StreamDispatcher;
  songs: VideoSearchResult[];
  client?: IClient;
}

const execute = async ({ client, msg, args }: ICommandProps): Promise<any> => {
  const queue: IQueue = client.queues?.get(msg.guild?.id);
  if (!queue) {
    return msg.reply("Não há musicas na fila");
  }

  if (args.length > 0) {
    if (args[0] === "-clear") {
      if (!msg.member?.hasPermission("MANAGE_MESSAGES")) {
        return msg.reply(
          'Você precisa ter permissão para "Gerenciar mensagens" para executar essa ação'
        );
      }

      queue.songs = [queue.songs[0]];

      client.queues?.set(msg.guild?.id, queue);

      return msg.reply("A fila de músicas foi apagada!");
    }
  }

  let description = "";
  for (let i = 0; i < queue.songs.length; i++) {
    if (description.length + queue.songs[i].title.length >= 2000 || i == 15) {
      description += `[mais ${queue.songs.length - i + 1} músicas]`;
      break;
    } else {
      description += `${i + 1}. [${queue.songs[i].title}](${
        queue.songs[i].url
      })\n`;
    }
  }

  const embedResponse: MessageEmbedOptions = {
    title: "Fila de reprodução",
    description,
    color: "#C02943",
    footer: {
      text: `Solicitado por ${msg.author.username}#${msg.author.discriminator}`,
      icon_url: msg.author.avatar
        ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/${
            Number(msg.author.discriminator) % 5
          }.png`,
    },
  };
  await msg.channel.send({ embed: embedResponse });
};

export default {
  name: "queue",
  help: "Mostra a fila de músicas",
  execute,
};
