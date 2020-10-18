import { Client, Message, Collection, MessageEmbed } from 'discord.js';

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
  if (args.length === 0) {
    const embed = new MessageEmbed();
    embed.setTitle('Escolha suas áreas de interesse');
    embed.setDescription(
      `Cada área de interesse possui um emoji, estando representadas abaixo.\n
       Para escolher qual(is) áreas lhe interessam, basta clicar em para reagir com o emoji correspondente
      `,
    );
    embed.setAuthor('Jarvis Discord Bot');
    embed.addFields([
      { name: 'Dev', value: '💻', inline: true },
      { name: 'Among Us', value: '🕵️', inline: true },
      { name: 'Valorant', value: '🔫', inline: true },
    ]);
    msg.member?.send({ embed }).then(async (res) => {
      try {
        await res.react('💻');
        await res.react('🕵️');
        await res.react('🔫');
        const collector = res.createReactionCollector(
          (reaction, user) =>
            ['💻', '🕵️', '🔫'].includes(reaction.emoji.name) && !user.bot,
        );
        collector.on('collect', async (reaction, user) => {
          let role;
          switch (reaction.emoji.name) {
            case '💻':
              role = msg.guild?.roles.cache.find((r) => r.name == 'Dev');
              if (role) {
                await msg.member?.roles.add(role);
              }
              break;
            case '🕵️':
              role = msg.guild?.roles.cache.find((r) => r.name == 'Among Us');
              if (role) {
                await msg.member?.roles.add(role);
              }
              break;
            case '🔫':
              role = msg.guild?.roles.cache.find((r) => r.name == 'Valorant');
              if (role) {
                await msg.member?.roles.add(role);
              }
              break;
          }
        });
      } catch (e) {
        console.error(e);
      }
    });
  } else {
    if (!msg.member?.hasPermission('MANAGE_ROLES')) {
      return msg.reply(
        'Sinto muito, mas você não tem permissão para fazer isso',
      );
    }
    const [mention, roleArg] = args;
    if (!roleArg) {
      return msg.reply('Você precisa escolher um cargo');
    }
    const role = msg.guild?.roles.cache.find((r) => r.name === roleArg);
    if (!role) {
      return msg.reply(`O cargo **${roleArg}** não existe`);
    }

    const member = msg.mentions.members?.first();
    if (!member) {
      return msg.reply('Você precisa mencionar quem receberá o cargo');
    }

    member.roles.add(role);
    msg.reply(`O cargo **${roleArg}** foi dado à ${member}`);
  }
};

export default {
  // name: 'role',
  // help: 'Atribui cargos a um usuário',
  // execute,
};
