const Discord = require('discord.js');
const Snoway = require('../../structures/client');
module.exports = {
    name: "unowner",
    description: "Retire un owner",
    /**
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: async (client, message, args) => {
        if (!client.config.buyers.includes(message.author.id)) return;
        const owner = await client.db.get('owner') || [];
        const mention = message.mentions.members.first()
        const member = mention ? mention.user : null || await client.users.fetch(args[0]);
        const ownerId = member.id;
        const owners = await client.db.get('owner') || [];
        if (!mention && !args[0]) {
            return message.channel.send('Veuillez mentionner l\'utilisateur ou fournir son ID.');
        }
        if (!owners.includes(ownerId)) {
            return message.channel.send('Cet utilisateur n\'est pas un owner.');
        }

        const ownerIndex = owners.indexOf(ownerId);
        owner.splice(ownerIndex, 1);

        await client.functions.api.ownerdel(client.user.id, ownerId).then(async (response) => {
            await client.db.set('owner', owners);
            return message.channel.send(`\`${member.username}\` n'est plus un owner.`);
        }).catch(error => {
            console.error('Erreur:', error);
            message.channel.send('une erreur vient de se produire.');
        });
    }
}
