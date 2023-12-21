const Discord = require('discord.js');
const QuickDB = require('quick.db');
const Snoway = require('../../structures/client');

module.exports = {
    name: 'loadembed',
    description: 'Charge et affiche un embed sauvegardé par son nom',
    usage: {
        "loadembed <nom>": "Charge et affiche un embed sauvegardé par son nom"
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @returns 
     */
    run: async (client, message, args) => {
        const savedEmbeds = await client.db.get(`embeds`);
        
        if (!savedEmbeds || savedEmbeds.length === 0) {
            return message.channel.send(`Aucun embed enregistré.`);
        }

        const name = args[0];
        const filteredEmbeds = savedEmbeds.filter(e => e.name === name);

        if (filteredEmbeds.length === 0) {
            return message.channel.send(`Aucun embed enregistré avec le nom \`${name}\`.`);
        }

        const embed = new Discord.EmbedBuilder(filteredEmbeds[0]);
        message.channel.send({ embeds: [embed] });
    },
};
