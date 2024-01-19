const { EmbedBuilder } = require('discord.js');
const Snoway = require('../../structures/client/index.js');

module.exports = {
    name: 'blacklist',
    aliases: ['bl'],
    description: {
        fr: "Affiche la liste des utilisateurs blacklistés",
        en: "Displays the list of blacklisted users"
    },
    usage: {
        fr: {
            "bl": "Affiche la liste des utilisateurs blacklistés",
            "bl <mention/id> [raison]": "Ajouter un utilisateur dans la blacklist",
            "bl clear": "Retire tout les utilisateurs blacklistés"
        },
        en: {
            "bl": "Displays the list of blacklisted users",
            "bl <mention/id> [reason]": "Add a user to the blacklist",
            "bl clear": "Remove all blacklisted users"
        },
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {*} message 
     * @param {*} args 
     * @returns 
     */
    run: async (client, message, args) => {
        const blacklist = await client.db.get(`blacklist`) || [];
        let user = message.mentions.users.first();
        let memberId = args[0];

        if (!user && memberId) {
            try {
                user = await client.users.fetch(memberId);
            } catch (error) {
                console.error(error);
            }
        }
        
        if (!user || !memberId) return message.reply({
            content: "Utilisateur invalide !"
        });

        const reason = args.slice(1).join(' ') || "Aucune raison spécifiée";
        const owner = await client.db.get(`owner`) || [];
        if (owner.includes(user.id) || client.config.buyers.includes(user.id)) {
            return message.channel.send(`Je ne peux pas blacklist un owner ou buyer bot`);
        }

        if (args[0] === 'clear') {
            await client.db.delete(`blacklist`);
            return message.reply(`La liste des utilisateurs blacklistés a été effacée.`);
        }

        const member = user;
                
        if (blacklist.some(entry => entry.userId === member.id)) {
            return message.channel.send(`${member.username} est déjà blacklisté.`);
        }

        const messages = await message.channel.send(`Début de la blacklist pour ${member.username}...`);
        let d = "";

        await Promise.all(client.guilds.cache.map(async (guild) => {
            try {
                await guild.members.ban(member.id, { reason: `Blacklisted | by ${message.author.tag} | Reason: ${reason}` });
                saluts += `\nBannie de ${guild.name}`;
                await new Promise(resolve => setTimeout(resolve, 800)); 
            } catch (error) {
                console.error(`Impossible de bannir ${member.username} de ${guild.name}`);
                saluts += `\nImpossible de la bannir sur ${guild.name}`;
            }
        }));

        messages.edit(`${messages.content}${saluts}\n${member.username} a été blacklisté de tous les serveurs (${client.guilds.cache.size}). Raison: ${reason}`);
        
        blacklist.push({ userId: member.id, reason });
        await client.db.set(`blacklist`, blacklist);
    }
}
