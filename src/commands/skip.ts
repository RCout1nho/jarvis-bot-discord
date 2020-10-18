import {
  Client,
  Message,
  Collection,
  VoiceConnection,
  StreamDispatcher,
} from 'discord.js';
import { VideoSearchResult } from 'yt-search';

import PlayCommand from './play';

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

const execute = ({ client, msg, args }: ICommandProps) => {
  const { playMusic } = PlayCommand;
  const queue: IQueue = client.queues?.get(msg.guild?.id);

  if (!queue) {
    return msg.reply('Não há musica sendo reproduzida');
  }
  queue.songs.shift();
  client.queues?.set(msg.guild?.id, queue);
  playMusic({ client, msg, args, msc: queue.songs[0] });
};

export default {
  name: 'skip',
  help: 'Pular música',
  execute,
};
