const { EmbedBuilder } = require('discord.js')
const Snoway = require('../../structures/client/index')

module.exports = {
    name: "userinfo",
    aliases: ["ui"],
    description: "Permet d'obtenir des informations sur un utilisateur",
    usages: "userinfo <id/mention>",
    /**
     * 
     * @param {Snoway} client 
     * @param {Snoway} message 
     * @param {Snoway} args 
     * @returns 
     */
    run: async (client, message, args) => {
        let target;

        if (message.mentions.members.first()) {
            target = message.mentions.members.first();
        } else if (args[0]) {
            try {
                target = await message.guild.members.fetch(args[0]);
            } catch (error) {
                return message.channel.send("Cette Utilisateur est introuvable");
            }
        } else {
            target = message.member;
        }

        const user = target.user;
        const member = target;
        let text = "Aucun rôle";

        if (member) {
            const roles = member.roles.cache
                .filter(role => role.name !== "@everyone")
                .map(role => role.toString());
            if (roles.length <= 3) {
                text = roles.join(', ');
            } else {
                const roleplus = roles.length - 4;
                if (roleplus > 0) {
                    text = roles.slice(0, 3).join(', ') + ` +${roleplus} autre${roleplus > 1 ? 's' : ''} rôle${roleplus > 1 ? 's' : ''}`;
                } else {
                    text = roles.slice(0, 3).join(', ');
                }
            }
        }
        const varsbadge = {
            'HypeSquadOnlineHouse1': "HypeSquad Bravery",
            'HypeSquadOnlineHouse2': "HypeSquad Brilliance",
            'HypeSquadOnlineHouse3': "HypeSquad Balance",
            'HypeSquadEvents': "HypeSquad Event",
            'ActiveDeveloper': 'Active Developer',
            'BugHunterLeve1': 'Bug Hunter Level 1',
            'EarlySupporter': 'Early Supporter',
            'VerifiedBotDeveloper': 'Verified Bot Developer',
            'EarlyVerifiedBotDeveloper': "Early Verified Bot Developer",
            'VerifiedBot': "Verified Bot",
            'PartneredServerOwner': "Partnered Server Owner",
            'Staff': "Discord Staff",
            'System': "Discord System",
            'BugHunterLevel2': 'Bug Hunter Level 2',
            'BugHunterLevel3': 'Bug Hunter Level 3',
        }
        const badges = user.flags.toArray();
        const userBadges = badges
            .filter(badge => varsbadge[badge])
            .map(badge => varsbadge[badge]);

        const nitro = await client.functions.api.nitrotype(user.id)
        switch (nitro) {
            case 0:
                break;
            case 1:
                userBadges.push('Nitro Classic');
                break;
            case 2:
                userBadges.push('Nitro Boost');
                break;
            case 3:
                userBadges.push('Nitro Basic');
                break;
        }
        const activities = member.presence?.activities
            ? member.presence.activities
                .filter(activity => activity.type !== 4)
                .map((activity) => `- \`${activity.name}\``)
            : [];

        let status = member.presence?.status || 'offline';
        switch (status) {
            case 'online':
                status = '🟢';
                break;
            case 'idle':
                status = '🌙';
                break;
            case 'dnd':
                status = '⛔';
                break;
            default:
                status = '⚫';
        }
        let statusperso = member.presence?.activities[0]?.state || null;
        if (statusperso === null) {
            statusperso = "Aucun status personnalisé";
        }
        const platforms = Object.keys(member.presence?.clientStatus || { 'offline': 'offline' }).filter(
            key => ['online', 'dnd', 'idle', 'offline'].includes(member.presence?.clientStatus[key])
        );

        let platfor = platforms.map(platform => {

            if (platform === 'desktop') return '🖥️ Ordinateur';
            if (platform === 'mobile') return '📱 Téléphone';
            if (platform === 'web') return '🌐 Navigateur';
            if (platform === 'offline') return 'Aucune';
            if (platform === null) return 'Aucune';
        }).join(' / ');
        const infomembre = `\n> **Name:** \`${user.username}\` / ${user}\n> **ID:** \`${user.id}\`\n> **Bot:** ${user.bot ? '\`✅\`' : '\`❌\`'}\n> **Badge(s):** \`${userBadges.length ? userBadges.join('\`, \`') : "Aucun"}\`\n> **Création du compte :** <t:${Math.floor(user.createdAt / 1000)}:f>`;
        const infoserv = `\n\n> **Présent sur le serveur depuis:** <t:${Math.floor(member.joinedAt / 1000)}:F>\n> **Booster:** ${member.premiumSince ? `*Depuis le* <t:${Math.floor(member.premiumSince.getTime() / 1000)}:F>` : "*Ne boost pas*"}\n> **Rôle(s):** ${text || "Aucun"}`

        const url = await user.fetch().then((user) => user.bannerURL({ format: "png", dynamic: true, size: 4096 }));
        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`Informations sur ${user.username}`)
            .setThumbnail(user.avatarURL())
            .setDescription(`**__Informations Principales__**\n${infomembre}\n\n**__Activité(s) en cours__**\n\n> **Status:** (\`${status}\`) \`${statusperso}\`\n> **Platforme:** \`${platfor || "Aucune"}\`\n> **Activité:**\n${activities.join('\n') || "> - **Aucune activité**"}\n\n__**Informations sur le serveur**__ ${infoserv}`)
            .setImage(url)
            .setFooter(client.footer)
            .setImage(user.bannerURL({ format: 'png', size: 4096 }))
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
}