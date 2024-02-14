const Snoway = require("../../structures/client");
const Discord = require('discord.js');

module.exports = {
    name: 'giveaway',
    aliases: ["giveaways", "gsart", "gw"],
    description: {
        fr: 'Permet de lancer un giveaway',
        en: "Launch a giveaway"
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @returns 
     */
    run: async (client, message, args) => {

        async function update() {
            const db = await client.db.get(`gwconfig_${message.guildId}`) || {
                prix: "Bonbon x1",
                dure: 600000,
                emoji: "🎉",
                salon: null,
                roleinterdit: [],
                rolerequis: [],
                vocal: false
            }

            const rolesRequis = await Promise.all(db.rolerequis.map(roleId => message.guild.roles.cache.get(roleId)));
            const rolesInterdit = await Promise.all(db.roleinterdit.map(roleId => message.guild.roles.cache.get(roleId)));
            const salon = client.channels.cache.get(db.salon) || "Aucun"

            const embed = new Discord.EmbedBuilder()
                .setColor(client.color)
                .setTitle('Paramètre du giveaway')
                .addFields(
                    { name: "Gain", value: `\`\`\`js\n${db.prix}\`\`\``, inline: true },
                    { name: "Durée", value: `\`\`\`js\n${db.dure}\`\`\``, inline: true },
                    { name: "Salon", value: `\`\`\`js\n${salon?.name || "Aucun"}\`\`\``, inline: true },
                    { name: "Emoji", value: `\`\`\`js\n${db.emoji}\`\`\``, inline: true },
                    { name: "Rôle interdit", value: `\`\`\`js\n${rolesInterdit.map(role => role?.name).join(', ') || "Aucun"}\`\`\``, inline: true },
                    { name: "Rôle obligatoire", value: `\`\`\`js\n${rolesRequis.map(role => role?.name).join(', ') || "Aucun"}\`\`\``, inline: true },
                    { name: "Présence en vocal", value: `\`\`\`js\n${db.vocal ? "✅" : "❌"}\`\`\``, inline: true },
                )

                const select = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.StringSelectMenuBuilder()
                    .setCustomId('select')
                    .addOptions({
                        label: 'Modifier le gain',
                        emoji: "🎁",
                        value: "gain"
                    }, {
                        label: 'Modifier la durée',
                        emoji: "⏱",
                        value: "duree"
                    }, {
                        label: 'Modifier le salon',
                        emoji: "🏷",
                        value: "salon"
                    }, {
                        label: 'Modifier l\'emoji',
                        emoji: "🎉",
                        value: "emoji"
                    }, {
                        label: 'Modifier le rôle obligatoire',
                        emoji: "⛓",
                        value: "obligatoire" 
                    }, {
                        label: 'Modifier le rôle interdit',
                        emoji: "🚫",
                        value: "interdit" 
                    }, {
                        label: 'Modifier l\'obligation d\'être en vocal',
                        emoji: "🔊",
                        value: "vocal" 
                    })
                )

                const button = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId('start')
                    .setStyle(2)
                    .setLabel('Lancer le giveaway')
                    .setEmoji('🚀')
                )

            return {
                embed,
                select, 
                button
            }
        }

        const msg = await message.channel.send({
            embeds: [(await update()).embed],
            components: [(await update()).select, (await update()).embed]
        })


    },
};
