const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Message, EmbedBuilder } = require('discord.js');
const Discord = require('discord.js')
const Snoway = require('../../structures/client/index')
module.exports = {
    name: 'logs',
    description: {
        fr: "Permet d'afficher le statut des salons logs",
        en: "Displays the status of salon logs"
    },
    /**
     *
     * @param {Snoway} client
     * @param {Discord.Message} message
     */
    run: async (client, message) => {
        const logs = await client.db.get(`logs_${message.guild.id}`) || [
            {roles:null},
            {voice:null},
            {message:null},
            {mod:null},
            {raid:null},
            {channel:null},
            {boost:null},
            {flux:null}
        ]
        
        const channelId = logs.find(obj => obj.hasOwnProperty('channel'));
        const channelmsgId = logs.find(obj => obj.hasOwnProperty('message'));
        const channelvoiceId = logs.find(obj => obj.hasOwnProperty('voice'));
        const channelroleId = logs.find(obj => obj.hasOwnProperty('roles'));
        const channelmodId = logs.find(obj => obj.hasOwnProperty('mod'));
        const channelraidId = logs.find(obj => obj.hasOwnProperty('raid'));
        const channelboostId = logs.find(obj => obj.hasOwnProperty('boost'));
        const channelfluxId = logs.find(obj => obj.hasOwnProperty('flux'));
        
        const channelmsg = client.channels.cache.get(channelmsgId.message)
        const channelvoice = client.channels.cache.get(channelvoiceId.voice)
        const channelrole = client.channels.cache.get(channelroleId.roles)
        const channelmod = client.channels.cache.get(channelmodId.mod)
        const channelraid = client.channels.cache.get(channelraidId.raid)
        const channelsalon = client.channels.cache.get(channelId.channel)
        const channelboost = client.channels.cache.get(channelboostId.boost)
        const channelflux = client.channels.cache.get(channelfluxId.flux)


        const embed = new EmbedBuilder()
        .setColor(client.color)
        .setFooter(client.footer)
        .setTitle(`Logs de ${message.guild.name}`)
        .addFields(
        {name: "Logs messages", value: `\`\`\`js\n${channelmsg?.name ? `${channelmsg.name}` : "Aucun"}\`\`\``, inline: true},
        {name: "Logs vocal", value: `\`\`\`js\n${channelvoice?.name ? `${channelvoice.name}` : "Aucun"}\`\`\``, inline: true},
        {name: "Logs rôles", value: `\`\`\`js\n${channelrole?.name ? `${channelrole.name}` : "Aucun"}\`\`\``, inline: true},
        {name: "Logs mods", value: `\`\`\`js\n${channelmod?.name ? `${channelmod.name}` : "Aucun"}\`\`\``, inline: true},
        {name: "Logs raid", value: `\`\`\`js\n${channelraid?.name ? `${channelraid.name}` : "Aucun"}\`\`\``, inline: true},
        {name: "Logs salon", value: `\`\`\`js\n${channelsalon?.name ? `${channelsalon.name}` : "Aucun"}\`\`\``, inline: true},
        {name: "Logs boosts", value: `\`\`\`js\n${channelboost?.name ? `${channelboost.name}` : "Aucun"}\`\`\``, inline: true},
        {name: "Logs flux", value: `\`\`\`js\n${channelflux?.name ? `${channelflux.name}` : "Aucun"}\`\`\``, inline: true}
        )


        return message.channel.send({
            content: null,
            embeds: [embed]
        })
    },
};