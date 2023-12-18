const Snoway = require('../../structures/client/index');
const Discord = require('discord.js');

module.exports = {
    name: 'uptime',
    description: 'Affiche depuis quand le bot est connecté.',
    /**
   * 
   * @param {Snoway} client 
   * @param {Discord.Message} message 
   * @param {Snoway} args 
   * @returns 
   */
    run: async (client, message, args) => {
        const uptime = `<t:${Math.floor(Date.now() / 1000 - client.uptime / 1000)}:F>`;
        message.reply({
            content: `je suis connecté depuis ${uptime}`
        })
    },
};
