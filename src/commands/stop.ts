import {
  Client,
  Message,
  Collection,
  VoiceConnection,
  StreamDispatcher,
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
    return msg.reply("Não há musica sendo reproduzida");
  }

  queue.songs = [];
  client.queues?.set(msg.guild?.id, queue);
  queue.dispatcher?.end();

  await msg.reply("A fila de músicas foi excluída");
};

export default {
  name: "stop",
  help: "Parar música",
  execute,
};
