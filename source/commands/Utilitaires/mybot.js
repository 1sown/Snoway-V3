const Snoway = require("../../structures/client");
const Discord = require('discord.js');

module.exports = {
    name: 'mybot',
    description: 'Affiche vos bots',
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @returns 
     */
    run: async (client, message, args) => {
        const response = (await client.functions.api.botget(message.author.id)).bots || []

        if (response.length === 0) {
            return message.reply({ content: "Vous n'avez aucun bot !" });
        }
        const embed = new Discord.EmbedBuilder()
            .setTitle('Vos Bots')
            .setColor(client.color)
            .setFooter(client.footer);
        let description = '';

        for (let index = 0; index < response.length; index++) {
            const bot = response[index];

            const botUser = await client.users.fetch(bot.bot);


            description += `**${index + 1} -** [\`${botUser ? botUser.tag : 'Bot introuvable'}\`](https://discord.com/api/oauth2/authorize?client_id=${botUser.id}&permissions=8&scope=bot%20applications.commands): <t:${Math.floor(bot.temps / 1000)}:R> ${bot.buyer ? "👑" : ""}\n`;
        }

        embed.setDescription(description);
        message.channel.send({ embeds: [embed] });
    },
};
