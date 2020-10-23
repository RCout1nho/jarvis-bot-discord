import {
  Client,
  Message,
  Collection,
  VoiceConnection,
  StreamDispatcher,
  MessageEmbedOptions,
} from "discord.js";
import ytSearch from "yt-search";
import ytdl from "ytdl-core-discord";
import queryString from "query-string";
import isUrl from "../utils/isUrl";

interface IClient extends Client {
  commands?: Collection<any, any>;
  queues?: Map<any, any>;
}

interface ICommandProps {
  client: IClient;
  msg: Message;
  args: string[];
}

interface IYtVideoProps {
  url: string;
  type?: string;
  title: string;
  image?: string;
  videoId?: string;
}

interface ICommandMusicProps {
  client: IClient;
  msg: Message;
  args: string[];
  msc?: IYtVideoProps;
}

interface IQueue {
  volume: number;
  connection: VoiceConnection;
  dispatcher?: StreamDispatcher;
  songs: IYtVideoProps[];
  client?: IClient;
}

const execute = async ({ client, msg, args }: ICommandProps): Promise<any> => {
  if (args[0] !== "-playlist") {
    try {
      const musicName = args.join(" ");
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
              await msg.channel.send({ embed: embedResponse });
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
  } else {
    const url = args[1];
    if (!isUrl(url)) {
      return msg.reply("O argumento precisa ser a url da playlist");
    }

    const playlistId =
      typeof queryString.parse(url).list === "string"
        ? queryString.parse(url).list?.toString()
        : null;

    if (playlistId) {
      try {
        await ytSearch({ listId: playlistId }, async (err, result) => {
          if (err) {
            throw new Error();
          } else {
            if (result && result.videos.length > 0) {
              const queue: IQueue = client.queues?.get(msg.guild?.id);
              if (queue) {
                queue.volume = client.queues?.get(msg.guild?.id).volume;
                result.videos.forEach((video) => {
                  const music: IYtVideoProps = {
                    url: video.url,
                    type: "video",
                    title: video.title,
                  };
                  queue?.songs.push(music);
                });
                const embedResponse: MessageEmbedOptions = {
                  color: "#0099ff",
                  title: "Playlist adicionada à fila",
                  thumbnail: {
                    url: result.image,
                  },
                  description: `[${result.title}](${result.url})`,
                  footer: {
                    text: `Adicionado por ${msg.author.username}#${msg.author.discriminator}`,
                    icon_url: msg.author.avatar
                      ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
                      : `https://cdn.discordapp.com/embed/avatars/${
                          Number(msg.author.discriminator) % 5
                        }.png`,
                  },
                };
                await msg.channel.send({ embed: embedResponse });
                client.queues?.set(msg.guild?.id, queue);
              } else {
                const connection = await msg.member?.voice?.channel?.join();
                const music = result.videos.map((video) => {
                  const music: IYtVideoProps = {
                    url: `https://www.youtube.com/watch?v=${video.videoId}`,
                    type: "video",
                    title: video.title,
                  };
                  return music;
                });
                const queue = {
                  volume: 10,
                  connection,
                  dispatcher: undefined,
                  songs: music,
                };
                client.queues?.set(msg.guild?.id, queue);
                await playMusic({ client, msg, args, msc: queue.songs[0] });
              }
            } else {
              return msg.reply(
                "Não encontrei nenhuma playlist com esse nome :("
              );
            }
          }
        });
      } catch {
        return msg.reply("Ocorreu um erro, tente novamente mais tarde!");
      }
    }
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
  let connection;
  if (!msg.guild?.voice?.connection) {
    try {
      connection = await msg.member.voice.channel.join();
    } catch {
      return msg.reply("Desculpe, eu não estou conseguindo me conectar agora");
    }
    if (!queue && msc) {
      queue = {
        volume: 10,
        connection,
        dispatcher: undefined,
        songs: [msc],
      };
    }
  }

  if (queue && msc) {
    queue.volume = client.queues?.get(msg.guild?.id)
      ? client.queues?.get(msg.guild?.id).volume
      : 10;
    try {
      queue.dispatcher = queue?.connection.play(
        await ytdl(msc.url, { highWaterMark: 1 << 25, filter: "audioonly" }),
        {
          type: "opus",
        }
      );
      queue.dispatcher.setVolume(queue.volume);
    } catch {
      return msg.reply("Desculpe, estou com problemas de conexão");
    }
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
    await msg.channel.send({ embed: embedResponse });
    queue?.dispatcher?.on("finish", async () => {
      queue?.songs.shift();
      await playMusic({ client, msg, args, msc: queue?.songs[0] });
    });
    client.queues?.set(msg.member.guild.id, queue);
  }
};

export default {
  name: "play",
  help: "Adicionar música à fila",
  alias: "p",
  execute,
  playMusic,
};
