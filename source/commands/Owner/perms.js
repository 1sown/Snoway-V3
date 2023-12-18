const Snoway = require('../../structures/client/index');
const Discord = require('discord.js');

module.exports = {
    name: 'perm',
    aliases: ["perm"],
    description: 'Affiche les rôles et les permissions avec.',
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {Snoway} args 
     * @returns 
     */
    run: async (client, message, args) => {
        const db = await client.db.get(`perm_${message.guild.id}`) || [
            {
                perm1: {
                    role: null,
                    commands: []
                }, perm2: {
                    role: null,
                    commands: []
                },  perm3: {
                    role: null,
                    commands: []
                }, perm4: {
                    role: null,
                    commands: []
                }, perm5: {
                    role: null,
                    commands: []
                }, perm6: {
                    role: null,
                    commands: []
                }, perm7: {
                    role: null,
                    commands: []
                }, perm8: {
                    role: null,
                    commands: []
                }, perm9: {
                    role: null,
                    commands: []
                }

            }]

            const embed = new Discord.EmbedBuilder()
            .setTitle('Permissions du serveur')
            .setColor(client.color)
            .addFields(
                {name: `Permission 1`, value:  db[0].perm1.role ? `<@${db[0].perm1.role}` : "Aucun role"},
                {name: `Permission 2`, value:  db[0].perm2.role ? `<@${db[0].perm2.role}` : "Aucun role"},
                {name: `Permission 3`, value:  db[0].perm3.role ? `<@${db[0].perm3.role}` : "Aucun role"},
                {name: `Permission 4`, value:  db[0].perm4.role ? `<@${db[0].perm4.role}` : "Aucun role"},
                {name: `Permission 5`, value:  db[0].perm5.role ? `<@${db[0].perm5.role}` : "Aucun role"},
                {name: `Permission 6`, value:  db[0].perm6.role ? `<@${db[0].perm6.role}` : "Aucun role"},
                {name: `Permission 7`, value:  db[0].perm7.role ? `<@${db[0].perm7.role}` : "Aucun role"},
                {name: `Permission 8`, value:  db[0].perm8.role ? `<@${db[0].perm8.role}` : "Aucun role"},
                {name: `Permission 9`, value:  db[0].perm9.role ? `<@${db[0].perm9.role}` : "Aucun role"},
            )
        
            message.channel.send({ embeds: [embed] });
    }
}