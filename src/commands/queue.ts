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

  if (args) {
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
  queue.songs.forEach((song, index) => {
    description += `${index + 1}. [${song.title}](${song.url})\n`;
  });

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
