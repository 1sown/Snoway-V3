const { EmbedBuilder, Message, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Snoway = require('../../structures/client/index.js');

module.exports = {
    name: 'ticket',
    description: {
        fr: 'Permet de créer/configure le sytème de ticket.',
        en: "Creates/configures the ticket system."
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @returns 
     */
    run: async (client, message, args) => {
        const msg = await message.channel.send({ content: "Je charge les options !" })
        const db = await client?.db.get(`ticket_${message.guild.id}`) || {
            option: [],
            salon: null,
            messageid: null,
            type: "select",
            Suppauto: true,
            maxticket: 1,
            leaveclose: false,
            claimbutton: true,
            buttonclose: true,
            transcript: false,
            rolerequis: ["1202716478722543647", "1202729209621913620"],
            roleinterdit: ["1202729167477800980"],
        }


        async function embedMenu() {
            const optionsValue = db.option.map(option => option.text) || []
            const salon = client.channels.cache.get(db.salon) || "Aucun"
            let modules = ''
            switch (db.type) {
                case 'select':
                    modules = "Sélecteur"
                    break;
                case "button":
                    modules = "Boutons"
                    break;
            }
             const rolesRequis = await Promise.all(db.rolerequis.map(roleId => message.guild.roles.cache.get(roleId)));
             const rolesInterdit = await Promise.all(db.roleinterdit.map(roleId => message.guild.roles.cache.get(roleId)));

            const embed = new EmbedBuilder()
                .setTitle('Ticket Settings')
                .setColor(client.color)
                .setFooter(client.footer)
                .addFields(
                    {name: "**Salon**", value: `\`\`\`js\n${salon.name || "Aucun"} ${db.messageid ? `(Message: ${db.messageid})` : ""}\`\`\``, inline: true},
                    {name: "**Type du ticket**", value: `\`\`\`js\n${modules}\`\`\``, inline: true},
                    {name: "**Max ticket**", value: `\`\`\`js\n${db.maxticket}\`\`\``, inline: true},
                    {name: "**Bouton claim**", value: `\`\`\`js\n${db.claimbutton ? "✅" : "❌"}\`\`\``, inline: true},
                    {name: "**Bouton close**", value: `\`\`\`js\n${db.buttonclose ? "✅" : "❌"}\`\`\``, inline: true},
                    {name: "**Transcript MP**", value: `\`\`\`js\n${db.transcript ? "✅" : "❌"}\`\`\``, inline: true},
                    {name: "**Roles Requis**", value: `\`\`\`js\n${rolesRequis.map(role => role.name).join(', ') || "Aucun"}\`\`\``, inline: true},
                    {name: "**Roles Interdit**", value: `\`\`\`js\n${rolesInterdit.map(role => role.name).join(', ') || "Aucun"}\`\`\``, inline: true},
                    {name: "**Fermer automatiquement**", value: `\`\`\`js\n${db.leaveclose ? "✅" : "❌"} (Fermeture au leave du membre)\`\`\``, inline: true}
                )
                
            const optionselect = db.option.map(options => ({
                label: options.text,
                description: options.description || undefined,
                value: options.value
            }));

            const SelectOptionEdit = new StringSelectMenuBuilder()
                .setCustomId('select_edit_option')
                .setPlaceholder('Gérer les options')
                .addOptions({
                    label: 'Crée une option',
                    emoji: "🛠",
                    value: 'new'
                }, {
                    label: 'Supprime une option',
                    emoji: "🗑",
                    value: 'delete'
                });


            const SelectConfig = new StringSelectMenuBuilder()
                .setCustomId('selec_config')
                .setPlaceholder('Gérer les tickets')
                .addOptions([
                    {
                        label: 'Modifier le salon',
                        emoji: '🏷',
                        value: 'salon'
                    },
                    {
                        label: 'Message automatique',
                        emoji: '💬',
                        value: 'automessage'
                    },
                    {
                        label: 'Type button/selecteur',
                        emoji: '⏺',
                        value: 'type'
                    },
                    {
                        label: 'Claim',
                        emoji: "🛡",
                        value: 'claim'
                    },
                    {
                        label: 'Transcript MP',
                        emoji: "📚",
                        value: 'transcript'
                    },
                    {
                        label: 'Max tickets',
                        emoji: "♻",
                        value: 'maxticket'
                    },
                    {
                        label: 'Fermeture au leave',
                        emoji: '🔒',
                        value: 'fermetureleave'
                    }
                ])

            if (optionselect.length === 0) {
                optionselect.push({
                    label: 'Snoway Prime',
                    value: 'snowayv3ticketsettings'
                });
            }

            const selectoption = new StringSelectMenuBuilder()
                .setCustomId('select_option')
                .setPlaceholder('Vos options')
                .setDisabled(optionsValue.length <= 0)
                .addOptions(...optionselect);

            const buttonDel = new ButtonBuilder()
                .setCustomId('report')
                .setStyle(2)
                .setEmoji(client.functions.emoji.del)

            const buttonSupport = new ButtonBuilder()
                .setLabel("Mon support")
                .setURL(client.support)
                .setStyle(5)

            const row1 = new ActionRowBuilder().addComponents(SelectOptionEdit)
            const row2 = new ActionRowBuilder().addComponents(selectoption)
            const row3 = new ActionRowBuilder().addComponents(SelectConfig)
            const row4 = new ActionRowBuilder().addComponents(buttonDel, buttonSupport)
            await msg.edit({
                content: null,
                embeds: [embed],
                components: [row1, row2, row3, row4]
            });
        }
        embedMenu()

        const collector = msg.createMessageComponentCollector()
        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: await client.lang('interaction'), flags: 64 })

            if (i.values[0] === 'new') {
                if (db.option.length >= 5) {
                    return msg.edit({ content: 'Vous ne pouvez configurer que 5 options pour les tickets', embeds: [], components: [] });
                } else {
                    db.option.push({
                        categorie: null,
                        emoji: null,
                        text: 'Ouvrir un ticket',
                        value: code(10),
                        description: null,
                        message: "Merci d'avoir contacté le support\nDécrivez votre problème puis attendez de recevoir une réponse",
                        logs: null,
                        mention: null,
                        acess: null
                    })
                    await client.db.set(`ticket_${i.guild.id}`, db)
                }
                i.deferUpdate()
                embedMenu()

            }
        })
    },
};


function code(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
}