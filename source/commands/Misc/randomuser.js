const Discord = require('discord.js')
const Snoway = require('../../structures/client/index')
module.exports = {
    name: 'randomuser',
    description: 'Tire un membre du serveur au hasard',
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     */
    run: async (client, message, args) => {

        let guildId = message.guild.id;
        const guild = await client.guilds.fetch(guildId);
        const members = await guild.members.fetch();
        const randomMember = members.random();

        message.channel.send({ content: `${randomMember}` });
    }
}