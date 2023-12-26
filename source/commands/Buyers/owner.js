const Discord = require('discord.js');
const Snoway = require('../../structures/client');
module.exports = {
    name: "owner",
    description: "Ajoute/Retire un owner du bot.",
    usage: {
        "owner clear": "Supprime tous les owners",
        "owner <mention/id>": "Ajoute/Retire un owner du bot",
    },
    /**
     * @param {Snoway} client
     * @param {Discord.Message} message
     * @param {Array} args
     */
    run: async (client, message, args) => {
        if (!client.config.buyers.includes(message.author.id)) return;
        const owner = await client.db.get('owner') || [];

        if (args[0] === 'clear') {
            await client.functions.api.ownerclear(client.user.id).then(async (response) => {
                message.channel.send("Tous les owners ont été supprimés avec succès.");
                await client.db.set('owner', []);
            }).catch(error => {
                console.error('Erreur:', error);
                message.channel.send('une erreur vient de se produire.');
            });
            return;
        }

        if (args.length < 1) {
            const ownerusernames = await Promise.all(owner.map(async (ownerId, index) => {
                try {
                    const user = await client.users.fetch(ownerId);
                    return `${index + 1} • ${user.username} (ID: ${user.id})`;
                } catch (error) {
                    console.error(`Erreur : ${error.message}`);
                    return 'Introuvable';
                }
            }));

            const ownersList = ownerusernames.length > 0 ? ownerusernames.join('\n') : 'Aucun owner défini.';

            const embed = new Discord.EmbedBuilder()
                .setAuthor({ name: 'Owners (' + owner.length + ')', iconURL: message.author.avatarURL() })
                .setColor(client.color)
                .setDescription(`\`\`\`js\n${ownersList}\`\`\``)
                .setFooter(client.footer);

            return message.channel.send({ embeds: [embed] });
        }
        const mention = message.mentions.members.first()
        const member = mention ? mention.user : null || await client.users.fetch(args[0]);
        if (!member) {
            return message.channel.send('Utilisateur introuvable.');
        }

        const ownerId = member.id;
        const owners = await client.db.get('owner') || [];
        const ownerIndex = owners.indexOf(ownerId);

        if (ownerIndex !== -1) {
            owners.splice(ownerIndex, 1);

            await client.functions.api.ownerdel(client.user.id, ownerId).then(async (response) => {
                await client.db.set('owner', owners);
                return message.channel.send(`\`${member.username}\` n'est plus un owner.`);
            }).catch(error => {
                console.error('Erreur:', error);
                message.channel.send('une erreur vient de se produire.');
            });

        } else {
            owners.push(ownerId);
             await client.functions.api.owneradd(client.user.id, ownerId).then(async (response) => {
                await client.db.set('owner', owners);
                return message.channel.send(`\`${member.username}\` est maintenant un owner.`);
            }).catch(error => {
                console.error('Erreur:', error);
                message.channel.send('une erreur vient de se produire.');
            });
        }

    }
};
