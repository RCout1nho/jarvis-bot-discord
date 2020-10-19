import {
  Client,
  Message,
  Collection,
  VoiceConnection,
  StreamDispatcher,
  MessageEmbedOptions,
} from "discord.js";
import ytSearch, { VideoSearchResult } from "yt-search";
import ytdl from "ytdl-core-discord";

interface IClient extends Client {
  commands?: Collection<any, any>;
  queues?: Map<any, any>;
}

interface ICommandProps {
  client: IClient;
  msg: Message;
  args: string[];
}

interface ICommandMusicProps {
  client: IClient;
  msg: Message;
  args: string[];
  msc?: VideoSearchResult;
}

interface IQueue {
  volume: number;
  connection: VoiceConnection;
  dispatcher?: StreamDispatcher;
  songs: VideoSearchResult[];
  client?: IClient;
}

const execute = ({ client, msg, args }: ICommandProps) => {
  const musicName = args.join(" ");
  try {
    ytSearch(musicName, async (err, result) => {
      if (err) {
        throw new Error();
      } else {
        if (result && result.videos.length > 0) {
          const music = result.videos[0];
          const queue: IQueue = client.queues?.get(msg.guild?.id);
          if (queue) {
            queue.songs.push(music);
            const embedResponse: MessageEmbedOptions = {
              color: "#0099ff",
              title: "Adicionado à fila",
              thumbnail: {
                url: music.image,
              },
              description: `[${music.title}](${music.url})`,
              footer: {
                text: `Adicionado por ${msg.author.username}#${msg.author.discriminator}`,
                icon_url: msg.author.avatar
                  ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
                  : `https://cdn.discordapp.com/embed/avatars/${
                      Number(msg.author.discriminator) % 5
                    }.png`,
              },
            };
            msg.channel.send({ embed: embedResponse });
            client.queues?.set(msg.guild?.id, queue);
          } else {
            await playMusic({ client, msg, args, msc: music });
          }
        } else {
          return msg.reply("Não encontrei nenhuma música com esse nome :(");
        }
      }
    });
  } catch {
    return msg.reply("Ocorreu um erro, tente novamente mais tarde!");
  }
};

const playMusic = async ({ client, msg, args, msc }: ICommandMusicProps) => {
  let queue: IQueue | undefined = client?.queues?.get(msg.member?.guild.id);
  if (!msc) {
    if (queue) {
      queue.connection.disconnect();
      return client.queues?.delete(msg.member?.guild.id);
    }
  }

  if (!msg.member?.voice.channel) {
    return msg.reply(
      "Você deve estar em um canal de voz para reproduzir uma música"
    );
  }

  if (!queue && msc) {
    const connection = await msg.member.voice.channel.join();

    queue = {
      volume: 10,
      connection,
      dispatcher: undefined,
      songs: [msc],
    };
  }

  if (queue && msc) {
    const embedResponse: MessageEmbedOptions = {
      color: "#0099ff",
      title: "Tocando Agora",
      thumbnail: {
        url: msc.image,
      },
      description: `[${msc.title}](${msc.url})`,
      footer: {
        text: `Adicionado por ${msg.author.username}#${msg.author.discriminator}`,
        icon_url: msg.author.avatar
          ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${
              Number(msg.author.discriminator) % 5
            }.png`,
      },
    };
    msg.channel.send({ embed: embedResponse });

    queue.dispatcher = await queue?.connection.play(
      await ytdl(msc.url, { highWaterMark: 1 << 25, filter: "audioonly" }),
      {
        type: "opus",
      }
    );
    queue?.dispatcher?.on("finish", () => {
      queue?.songs.shift();
      playMusic({ client, msg, args, msc: queue?.songs[0] });
    });
    client.queues?.set(msg.member.guild.id, queue);
  }
};

export default {
  name: "play",
  help: "Adicionar música à fila",
  execute,
  playMusic,
};
