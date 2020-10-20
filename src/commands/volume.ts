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

  const volume = Number(args.join(" "));

  if (isNaN(volume) || volume < 0 || volume > 10) {
    return msg.reply("O volume deve ser um valor entre 0 e 10");
  }
  queue.dispatcher?.setVolume(volume / 10);
  queue.volume = volume;
  client.queues?.set(msg.guild?.id, queue);
};

export default {
  name: "vol",
  help: "Ajustar volume(0-10)",
  execute,
};
