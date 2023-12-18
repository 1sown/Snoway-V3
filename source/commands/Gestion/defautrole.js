const { EmbedBuilder } = require('discord.js');
const Snoway = require('../../structures/client');

module.exports = {
    name: 'defaultrole',
    aliases: ["defaultroles"],
    description: 'Configure le rôle par défaut pour les nouveaux membres.',
    usage: {
        "defaultrole <rôles>": "Permet d'ajouter ou de retirer des rôles dans les rôles défaut",
        "defaultrole": "Affiche la liste des rôles donnés lorsqu'un membre rejoint",
    },
    /**
     * @param {Snoway} client 
     * @param {Snoway} message 
     * @param {Snoway} args 
     */
    run: async (client, message, args) => {
        const roleName = args[0];
        const db = await client.db.get(`defautrole_${message.guild.id}`) || {
            roles: []
        };

        if (!roleName) {
            const role = db.roles.map((role, index) => {
                return `${index + 1}) <@&${role}>`
            }).join("\n")
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setFooter(client.footer)
                .setTitle('Rôle par defaut')
                .setDescription(role || "Aucun rôle")
            return message.channel.send({
                embeds: [embed]
            })
        }

        const role = message.mentions.roles.first() || message.guild.roles.cache.find(r => r.name === roleName) || message.guild.roles.cache.find(r => r.id === roleName);

        if (!role) {
            return message.channel.send(`Le rôle \`${roleName}\` n'existe pas.`);
        }

        const roleIndex = db.roles.indexOf(role.id);

        if (roleIndex !== -1) {
            db.roles.splice(roleIndex, 1);
            message.channel.send(`\`${role.name}\` a été supprimé des rôles par défaut.`);
        } else {
            db.roles.push(role.id);
            message.channel.send(`\`${role.name}\` vient d'être ajouté au rôle par défaut.`);
        }

        await client.db.set(`defautrole_${message.guild.id}`, db);
    }
};
