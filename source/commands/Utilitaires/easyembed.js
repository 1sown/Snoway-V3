const Discord = require('discord.js');
const Snoway = require('../../structures/client');

module.exports = {
    name: 'easyembed',
    description: 'Crée un embed simple',
    usage: {
        'easyembed <couleur> <texte>': "Crée un embed simple"
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {args[]} args 
     * @returns 
     */
    run: async (client, message, args) => {
        if (args.length < 2) {
            return message.channel.send(`Usage: ${client.prefix}easyembed <couleur> <texte>`);
        }

        const colorArg = args[0].toLowerCase();
        const textArg = args.slice(1).join(' ');

        if (!client.functions.bot.color(colorArg)) {
            return message.channel.send("Couleur non valide.");
        }
        const embed = new Discord.EmbedBuilder()
            .setColor(colorArg)
            .setDescription(textArg);

        message.channel.send({embeds: [embed]});
    },
};
