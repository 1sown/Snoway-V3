const { EmbedBuilder, Message, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Snoway = require('../../structures/client/index.js');
const { sleep } = require('../../structures/Functions/sleep.js')
const ms = require('../../structures/Utils/ms.js')
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
            rolerequis: [],
            roleinterdit: [],
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
                    { name: "**Salon**", value: `\`\`\`js\n${salon.name || "Aucun"} ${db.messageid && salon.name ? `(Message: ${db.messageid})` : ""}\`\`\``, inline: true },
                    { name: "**Type du ticket**", value: `\`\`\`js\n${modules}\`\`\``, inline: true },
                    { name: "**Max ticket**", value: `\`\`\`js\n${db.maxticket}\`\`\``, inline: true },
                    { name: "**Bouton claim**", value: `\`\`\`js\n${db.claimbutton ? "✅" : "❌"}\`\`\``, inline: true },
                    { name: "**Bouton close**", value: `\`\`\`js\n${db.buttonclose ? "✅" : "❌"}\`\`\``, inline: true },
                    { name: "**Transcript MP**", value: `\`\`\`js\n${db.transcript ? "✅" : "❌"}\`\`\``, inline: true },
                    { name: "**Roles Requis**", value: `\`\`\`js\n${rolesRequis.map(role => role.name).join(', ') || "Aucun"}\`\`\``, inline: true },
                    { name: "**Roles Interdit**", value: `\`\`\`js\n${rolesInterdit.map(role => role.name).join(', ') || "Aucun"}\`\`\``, inline: true },
                    { name: "**Fermer automatiquement**", value: `\`\`\`js\n${db.leaveclose ? "✅" : "❌"} (Fermeture au leave du membre)\`\`\``, inline: true }
                )

            const optionselect = db.option.map(options => ({
                label: options.text,
                description: options.description || undefined,
                value: "option_" + options.value
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
                        label: 'Message Id',
                        emoji: '🆔',
                        value: 'messageid'
                    },
                    {
                        label: 'Type button/selecteur',
                        emoji: '⏺',
                        value: 'type'
                    },
                    {
                        label: 'Max tickets',
                        emoji: "♻",
                        value: 'maxticket'
                    },
                    {
                        label: 'Button Claim',
                        emoji: "🛡",
                        value: 'claim'
                    },
                    {
                        label: 'Button Close',
                        emoji: '🔒',
                        value: 'close'
                    },
                    {
                        label: 'Transcript MP',
                        emoji: "📚",
                        value: 'transcript'
                    },
                    {
                        label: 'Rôles Requis',
                        emoji: '⚙',
                        value: 'rolerequis'
                    },
                    {
                        label: 'Rôles Interdit',
                        emoji:  '⛔',
                        value: 'roleinterdit'
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
                .setCustomId('delete_button')
                .setStyle(2)
                .setEmoji(client.functions.emoji.del)

            const buttonOptions = new ButtonBuilder()
                .setLabel(`${optionsValue.length}/25`)
                .setCustomId('customid_snoway')
                .setDisabled(true)
                .setStyle(2)

            const buttonActive = new ButtonBuilder()
                .setEmoji(client.functions.emoji.valide)
                .setCustomId("valide")
                .setStyle(3)

            const row1 = new ActionRowBuilder().addComponents(SelectOptionEdit)
            const row2 = new ActionRowBuilder().addComponents(selectoption)
            const row3 = new ActionRowBuilder().addComponents(SelectConfig)
            const row4 = new ActionRowBuilder().addComponents(buttonActive, buttonOptions, buttonDel)
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

            if (i.customId === "valide") {
                i.deferUpdate()
                return embedMenu()
            }

            if (i.customId === "retour") {
                i.deferUpdate()
                return embedMenu()
            }

            if (i.customId === "delete_button") {
                i.message.delete()
                return;
            }

            if (i.values[0] === 'type') {
                const currentType = db.type;
                const newType = currentType === 'button' ? 'select' : 'button';
                db.type = newType;
                await client.db.set(`ticket_${i.guild.id}`, db);
                await i.deferUpdate();
                return embedMenu();
            }

            if (i.values[0] === 'claim') {
                db.claimbutton = !db.claimbutton;
                await client.db.set(`ticket_${i.guild.id}`, db);
                await i.deferUpdate();
                return embedMenu();
            }

            if (i.values[0] === 'close') {
                db.buttonclose = !db.buttonclose;
                await client.db.set(`ticket_${i.guild.id}`, db);
                await i.deferUpdate();
                return embedMenu();
            }

            if (i.values[0] === 'transcript') {
                db.transcript = !db.transcript;
                await client.db.set(`ticket_${i.guild.id}`, db);
                await i.deferUpdate();
                return embedMenu();
            }

            if (i.values[0] === 'fermetureleave') {
                db.leaveclose = !db.leaveclose;
                await client.db.set(`ticket_${i.guild.id}`, db);
                await i.deferUpdate();
                return await embedMenu();
            }


            if (i.values[0] === 'rolerequis') {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription("***Quel rôle souhaitez-vous assigner pour les rôels requis ?***")
                    .setFooter(client.footer);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('retour')
                            .setEmoji(client.functions.emoji.retour)
                            .setStyle(4)
                    );

                i.update({
                    content: null,
                    embeds: [embed],
                    components: [row]
                });

                const filter = (response) => response.author.id === i.user.id;
                const response = await i.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });

                if (response && response.first()) {
                    const roleId = response.first().content.replace(/[<@&>|]/g, '');
                    const role = message.guild.roles.cache.get(roleId);

                    if (role) {
                        const roles = db.rolerequis.includes(role.id);

                        if (roles) {
                            const index = db.rolerequis.indexOf(role.id);
                            if (index !== -1) {
                                db.rolerequis.splice(index, 1);
                                await client.db.set(`ticket_${i.guild.id}`, db);
                            }
                        } else {
                            db.rolerequis.push(role.id);
                            await client.db.set(`ticket_${i.guild.id}`, db);
                        }
                    } else {
                        const channel = client.channels.cache.get(response.first().channelId);
                        await channel.send({ content: "***Le rôle mentionné est invalide. Veuillez mentionner un rôle valide.***" });
                    }

                    response.first().delete().catch(() => { });
                    embedMenu()
                    return;
                }
            }

            if (i.values[0] === 'roleinterdit') {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription("***Quel rôle souhaitez-vous assigner pour les rôels interdit ?***")
                    .setFooter(client.footer);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('retour')
                            .setEmoji(client.functions.emoji.retour)
                            .setStyle(4)
                    );

                i.update({
                    content: null,
                    embeds: [embed],
                    components: [row]
                });

                const filter = (response) => response.author.id === i.user.id;
                const response = await i.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });

                if (response && response.first()) {
                    const roleId = response.first().content.replace(/[<@&>|]/g, '');
                    const role = message.guild.roles.cache.get(roleId);

                    if (role) {
                        const roles = db.roleinterdit.includes(role.id);

                        if (roles) {
                            const index = db.roleinterdit.indexOf(role.id);
                            if (index !== -1) {
                                db.roleinterdit.splice(index, 1);
                                await client.db.set(`ticket_${i.guild.id}`, db);
                            }
                        } else {
                            db.roleinterdit.push(role.id);
                            await client.db.set(`ticket_${i.guild.id}`, db);
                        }
                    } else {
                        const channel = client.channels.cache.get(response.first().channelId);
                        await channel.send({ content: "***Le rôle mentionné est invalide. Veuillez mentionner un rôle valide.***" });
                    }

                    response.first().delete().catch(() => { });
                    embedMenu()
                    return;
                }
            }

            if (i.values[0] === 'maxticket') {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription("***Veuillez indiquer le nouveau nombre maximum de tickets par personne.***\n*Exemple:* `1` ou `4`")
                    .setFooter(client.footer);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('retour')
                            .setEmoji(client.functions.emoji.retour)
                            .setStyle(4)
                    );

                i.update({
                    content: null,
                    embeds: [embed],
                    components: [row]
                });

                const filter = response => response.author.id === message.author.id;

                try {
                    const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                    const newMaxTickets = parseInt(collected.first().content.trim());

                    if (!isNaN(newMaxTickets) && newMaxTickets > 0) {
                        db.maxticket = newMaxTickets;
                        await client.db.set(`ticket_${i.guild.id}`, db);
                        await collected.first().delete();
                        return embedMenu();
                    } else {
                        const msg = await message.channel.send("Veuillez entrer un nombre entier positif.");
                        await collected.first().delete();
                        embedMenu();
                        setTimeout(() => {
                            msg.delete().catch(() => { })
                        }, 5000)
                        return;
                    }
                } catch (error) {
                    console.error(error);
                    sentMessage.delete();
                    await embedMenu();
                    message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite : " + error.message);
                }
            }

            if (i.values[0] === "salon") {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription("***Quel salon souhaitez-vous utiliser pour le ticket ?***")
                    .setFooter(client.footer);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('retour')
                            .setEmoji(client.functions.emoji.retour)
                            .setStyle(4)
                    );

                i.update({
                    content: null,
                    embeds: [embed],
                    components: [row]
                });

                const filter = (response) => response.author.id === i.user.id;
                const response = await i.channel.awaitMessages({ filter, max: 1, time: 15000 });

                if (response && response.first()) {
                    const channelId = response.first().content.replace(/[<#>|]/g, '');
                    const channel = client.channels.cache.get(channelId);

                    if (channel) {
                        db.salon = channel.id;
                        await client.db.set(`ticket_${message.guild.id}`, db);
                        embedMenu();
                    } else {
                        const channel = client.channels.cache.get(response.first().channelId);
                        const salon = await channel.send({ content: '***Le salon mentionné est invalide. Veuillez mentionner un salon valide.***' });
                        embedMenu()
                        setTimeout(() => {
                            salon.delete().catch(() => { })
                        }, 8000)

                    }

                    response.first().delete().catch(() => { });
                }

            } else if (i.values[0] === "messageid") {
                const channel = client.channels.cache.get(db.salon)
                if (!channel) {
                    const msg = await i.reply({ content: "***Le salon des tickets est invalide. Veuillez le configurer pour pouvoir continuer.***", flags: 64 });
                    setTimeout(() => {
                        msg.delete().catch(() => { });
                    }, 5000);
                }
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('Veuillez fournir le nouveau **message ID** pour le système de ticket.')
                    .setFooter(client.footer);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('retour')
                            .setEmoji(client.functions.emoji.retour)
                            .setStyle(4)
                    );

                i.update({
                    content: null,
                    embeds: [embed],
                    components: [row]
                });

                const filter = (response) => {
                    const isValidUser = response.author.id === i.user.id;
                    const isValidContent = response.content && response.content.match(/(\d{17,19})/);
                    return isValidUser && isValidContent;
                };

                const response = await i.channel.awaitMessages({
                    filter,
                    max: 1,
                    time: 15000,
                    errors: ['time']
                });

                if (response && response.first()) {
                    const messageId = response.first().content.match(/(\d{17,19})/)[1];
                    const fetchedMessage = await i.channel.messages.fetch(messageId).catch(() => null);

                    if (fetchedMessage) {
                        db.messageid = messageId;
                        await client.db.set(`ticket_${message.guild.id}`, db);
                        response.first().delete().catch(() => { });
                        embedMenu();
                    } else {
                        const invalidMessage = await msg.reply({ content: 'Le message ID fourni est invalide ou introuvable. Veuillez fournir un message ID valide.', ephemeral: true });
                        setTimeout(() => {
                            invalidMessage.delete().catch(() => { });
                        }, 5000);
                        response.first().delete().catch(() => { });
                        embedMenu();
                    }
                } else {
                    const timeoutMessage = await msg.reply({ content: 'Temps écoulé. Opération annulée.', ephemeral: true });
                    setTimeout(() => {
                        timeoutMessage.delete().catch(() => { });
                    }, 5000);
                    response.first().delete().catch(() => { });
                    embedMenu();
                }
            } if (i.values[0] === 'new') {
                if (db.option.length >= 25) {
                    const ireply = await i.reply({ content: 'Vous ne pouvez configurer que 25 options pour les tickets', flags: 64, embeds: [], components: [] })
                    await sleep("4000")
                    ireply.delete()
                    return;
                } else {
                    db.option.push({
                        categorie: null,
                        emoji: null,
                        text: 'Ouvrir un ticket',
                        value: code(10),
                        description: null,
                        message: "Merci d'avoir contacté le support\nDécrivez votre problème puis attendez de recevoir une réponse",
                        logs: null,
                        mention: [],
                        acess: []
                    })
                    await client.db.set(`ticket_${i.guild.id}`, db)
                }
                i.deferUpdate()
                embedMenu()
            } if (i.values[0] === 'delete') {
                if (db.option.length === 0) {
                    const ireply = await i.reply({ content: 'Vous n\'avez pas créé d\'option pour les tickets', flags: 64, embeds: [], components: [] })
                    await sleep("4000")
                    ireply.delete()
                    return;
                }

                const optionselect = db.option.map(options => ({
                    label: options.text,
                    description: options.description || undefined,
                    value: "deleteoption_" + options.value
                }));

                const Button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('retour')
                            .setEmoji(client.functions.emoji.retour)
                            .setStyle(4)
                    );

                const selectoption = new StringSelectMenuBuilder()
                    .setCustomId('select_option_delete')
                    .setPlaceholder('Options du ticket')
                    .addOptions(...optionselect);

                const row = new ActionRowBuilder()
                    .addComponents(selectoption)


                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setFooter(client.footer)
                    .setDescription(`Merci de sélectionner une option à supprimer.`)
                i.update({
                    embeds: [embed],
                    components: [row, Button],
                    content: null
                })
            } else if (i.values[0].startsWith('deleteoption_')) {
                const optionId = i.values[0].split('_')[1];
                const index = db.option.findIndex(option => option.value === optionId);
                if (index !== -1) {
                    db.option.splice(index, 1);
                    await client.db.set(`ticket_${i.guild.id}`, db);
                    i.deferUpdate()
                    return embedMenu();
                }
            } else if (i.values[0].startsWith('option_')) {

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