const Discord = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js")
const Valory = require('../../structures/client/index');

module.exports = {
    name: 'servers',
    aliases: ['server', 'servers'],
    description: 'Affiche la liste des serveurs sur lesquels le bot est présent',
    /**
     * 
     * @param {Valory} client 
     * @param {Discord.Message} message
     * 
     **/
    run: async (client, message) => {
        const msg = await message.channel.send({content: "Recherche en cours..."})
        const guilds = client.guilds.cache;
        const guildInvites = await Promise.all(guilds.map(async (guild) => {
            const invite = await guild.channels.cache.find(ch => ch.type === 0)?.createInvite({
                maxAge: 0,
                maxUses: 0,
            });
            return `[\`${guild.name}\`](${invite ? invite.url : client.support}) (\`${guild.id}\`) | [${guild.memberCount}]`;

        }));


        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`Liste de mes serveurs`)
            .setDescription(`> Voici la liste de mes serveurs\n` + guildInvites.join('\n'))
            .setFooter({ text: client.footer.text + ` | ${client.prefix}leave <guild id>` });

        await msg.edit({ embeds: [embed], content: null });
    },
};



