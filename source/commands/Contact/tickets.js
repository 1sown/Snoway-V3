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



        async function embedOptions(module) {
            const db = await client?.db.get(`ticket_${message.guild.id}`) || {}
            const selectedOption = db.option.find(option => option.value === module);
            const categorie = client.channels.cache.get(selectedOption.categorie)
            const channlog = client.channels.cache.get(selectedOption.logs)
            const rolesMention = await Promise.all(selectedOption.mention.map(roleId => message.guild.roles.cache.get(roleId)));
            const description = selectedOption.description
            const messageTicket = selectedOption.message || "Merci d'avoir contacté le support\nDécrivez votre problème puis attendez de recevoir une réponse"
            const embed = new EmbedBuilder()
                .setTitle('Option Settings')
                .setColor(client.color)
                .setFooter(client.footer)
                .addFields(
                    { name: "**Catégorie**", value: `\`\`\`js\n${categorie?.name || "Aucun"}\`\`\``, inline: true },
                    { name: "**Emoji**", value: `\`\`\`js\n${selectedOption.emoji || 'Aucun'}\`\`\``, inline: true },
                    { name: "**Nom de l'option**", value: `\`\`\`js\n${selectedOption.text}\`\`\``, inline: true },
                    { name: "**Salon des logs**", value: `\`\`\`js\n${channlog?.name || "Aucun"}\`\`\``, inline: true },
                    { name: "**Transcript**", value: `\`\`\`js\n${selectedOption.transcript ? "✅" : "❌"}\`\`\``, inline: true },
                    { name: "**Rôles mentionnés**", value: `\`\`\`js\n${rolesMention.map(role => role?.name).join(', ') || "Aucun"}\`\`\``, inline: true },
                    { name: "**Description (Sélecteur seulement)**", value: `\`\`\`js\n${description || "Aucune"}\`\`\``, inline: true })
                .addFields(
                    { name: "**Message**", value: `\`\`\`js\n${messageTicket}\`\`\`` },
                )


            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('configmenu')
                        .setPlaceholder('Snoway')
                        .addOptions([
                            {
                                label: 'Catégorie',
                                emoji: '📮',
                                value: 'categorie_option_' + selectedOption.value
                            }, {
                                label: 'Emoji',
                                emoji: '🌐',
                                value: 'emoji_option_' + selectedOption.value
                            }, {
                                label: 'Nom de button/selecteur',
                                emoji: '✏',
                                value: 'text_option_' + selectedOption.value
                            }, {
                                label: 'Salon des logs',
                                emoji: "🏷",
                                value: 'salon_option_' + selectedOption.value
                            }, {
                                label: 'Transcript',
                                emoji: "📜",
                                value: 'transcript_option_' + selectedOption.value
                            }, {
                                label: 'Rôle mentionner',
                                emoji: '🔔',
                                value: 'role_option_' + selectedOption.value
                            }, {
                                label: 'Description (Sélecteur seulement)',
                                emoji: "🗨",
                                value: 'description_option_' + selectedOption.value
                            }, {
                                label: 'Message d\'ouverture de ticket',
                                emoji: '📋',
                                value: 'ouvert_option_' + selectedOption.value
                            },
                        ])
                );

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('retour')
                        .setStyle(2)
                        .setEmoji(client.functions.emoji.retour),
                    new ButtonBuilder()
                        .setCustomId('options_delete_' + selectedOption.value)
                        .setStyle(4)
                        .setLabel('❌ Supprimer l\'option')
                )

            return msg.edit({
                components: [row, button],
                embeds: [embed],
                content: null
            })
        }




        async function embedMenu() {
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
                    { name: "**Salon**", value: `\`\`\`js\n${salon?.name || "Aucun"} ${db.messageid && salon?.name ? `(Message: ${db.messageid})` : ""}\`\`\``, inline: true },
                    { name: "**Type du ticket**", value: `\`\`\`js\n${modules}\`\`\``, inline: true },
                    { name: "**Max ticket**", value: `\`\`\`js\n${db.maxticket}\`\`\``, inline: true },
                    { name: "**Bouton claim**", value: `\`\`\`js\n${db.claimbutton ? "✅" : "❌"}\`\`\``, inline: true },
                    { name: "**Bouton close**", value: `\`\`\`js\n${db.buttonclose ? "✅" : "❌"}\`\`\``, inline: true },
                    { name: "**Transcript MP**", value: `\`\`\`js\n${db.transcript ? "✅" : "❌"}\`\`\``, inline: true },
                    { name: "**Roles Requis**", value: `\`\`\`js\n${rolesRequis.map(role => role?.name).join(', ') || "Aucun"}\`\`\``, inline: true },
                    { name: "**Roles Interdit**", value: `\`\`\`js\n${rolesInterdit.map(role => role?.name).join(', ') || "Aucun"}\`\`\``, inline: true },
                    { name: "**Fermer automatiquement**", value: `\`\`\`js\n${db.leaveclose ? "✅" : "❌"} (Fermeture au leave du membre)\`\`\``, inline: true }
                )
                    
                const optionselect = db.option.map(option => {
                    const emojibot = client.emojis.cache.get(option.emoji);
                
                    return {
                        label: option.text,
                        description: option.description || undefined,
                        emoji: emojibot ? option.emoji : undefined,
                        value: "option_" + option.value
                    };
                });

            const SelectOptionEdit = new StringSelectMenuBuilder()
                .setCustomId('select_edit_option')
                .setPlaceholder('Gérer les options')
                .addOptions({
                    label: 'Crée une option',
                    emoji: client.functions.emoji.new,
                    value: 'new'
                }, {
                    label: 'Supprime une option',
                    emoji: client.functions.emoji.del,
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
                    }, {
                        label: 'Message Id',
                        emoji: '🆔',
                        value: 'messageid'
                    }, {
                        label: 'Type button/selecteur',
                        emoji: '⏺',
                        value: 'type'
                    }, {
                        label: 'Max tickets',
                        emoji: "♻",
                        value: 'maxticket'
                    }, {
                        label: 'Button Claim',
                        emoji: "🛡",
                        value: 'claim'
                    }, {
                        label: 'Button Close',
                        emoji: '🔒',
                        value: 'close'
                    }, {
                        label: 'Transcript MP',
                        emoji: "📚",
                        value: 'transcript'
                    }, {
                        label: 'Rôles Requis',
                        emoji: '⚙',
                        value: 'rolerequis'
                    }, {
                        label: 'Rôles Interdit',
                        emoji: '⛔',
                        value: 'roleinterdit'
                    }, {
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

            const buttonDelete = new ButtonBuilder()
                .setEmoji(client.functions.emoji.danger)
                .setCustomId('delete_all_data')
                .setStyle(4)

            const buttonActive = new ButtonBuilder()
                .setEmoji(client.functions.emoji.valide)
                .setCustomId("valide")
                .setStyle(3)

            const row1 = new ActionRowBuilder().addComponents(SelectOptionEdit)
            const row2 = new ActionRowBuilder().addComponents(selectoption)
            const row3 = new ActionRowBuilder().addComponents(SelectConfig)
            const row4 = new ActionRowBuilder().addComponents(buttonActive, buttonOptions, buttonDelete, buttonDel)
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


            if (i.customId === "valide") {
                if (!db || !db.option || db.option.length === 0) {
                    return i.reply({
                        content: "Les options des tickets ne sont pas configurées",
                        flags: 64
                    });
                }

                const salon = client.channels.cache.get(db.salon);
                if (!salon) {
                    return i.reply({
                        content: "Le salon des tickets n'est pas configuré",
                        flags: 64
                    });
                }   
                await i.deferReply({ephemeral: true})
                const fetch = await salon.messages.fetch(db.messageid).catch(() => null);
                if (fetch && fetch.author.id !== client.user.id) {
                    return i.reply({
                        content: "Le message pour les tickets ne vient pas de moi, je ne peux donc pas modifier le message",
                        flags: 64
                    });
                }
           
                const embed = new EmbedBuilder()
                .setTitle('Tickets')
                .setDescription('Utiliser ce menu pour créer un ticket et contacter le staff')
                .setColor(client.color)
                .setFooter(client.footer)

                if (db.type === "select") {
            
                    const options = db.option.map(option => {
                        const emojibot = client.emojis.cache.get(option.emoji);
                        return {
                            label: option.text,
                            emoji: emojibot ?  option.emoji : undefined,
                            description: option.description || undefined,
                            value: `ticket_${option.value}`
                        };
                    });

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('ticket')
                                .setPlaceholder('Snoway')
                                .addOptions(options)
                        );

                    if (fetch) {
                        fetch.edit({ components: [row] });
                    } else {
                       const msg = await salon.send({
                            embeds: [embed],
                            components: [row]
                        })
                        db.messageid = msg.id
                       await client.db.set(`ticket_${i.guild.id}`, db)
                    }
                } else if (db.type === "button") {
                    const buttons = db.option.map((option, index) => {
                        const emoji = client.emojis.cache.get(option.emoji);
                        if(emoji) {
                            return new ButtonBuilder()
                            .setCustomId(`ticket_${option.value}`)
                            .setLabel(option.text)
                            .setEmoji(option.emoji)
                            .setStyle(2);
                        } else {
                            return new ButtonBuilder()
                            .setCustomId(`ticket_${option.value}`)
                            .setLabel(option.text)
                            .setStyle(2);
                        }
                    });
                    
            
                    const groupButtons = [];
                    while (buttons.length > 0) {
                        groupButtons.push(buttons.splice(0, 5));
                    }
            
                    const rowButtons = groupButtons.map(group => new ActionRowBuilder().addComponents(...group));
            
                    if (fetch) {
                        fetch.edit({ components: rowButtons });
                    } else {
                        const msg = await salon.send({
                            embeds: [embed],
                            components: rowButtons
                        });
                        db.messageid = msg.id;
                        await client.db.set(`ticket_${i.guild.id}`, db);
                    }
                }

                msg.edit({
                    components: []
                })
                return i.editReply({content: "Panel des tickets actif"})
            }




            if (i.customId === "retour") {
                i.deferUpdate()
                return embedMenu()
            }

            if (i.customId === "delete_button") {
                i.message.delete()
                return;
            }

            if (i.customId === "delete_all_data") {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription("***Voulez-vous vraiment supprimer toutes les données du système de ticket***")
                    .setFooter(client.footer);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('delete_all_data_yes')
                            .setEmoji(client.functions.emoji.valide)
                            .setStyle(3),
                        new ButtonBuilder()
                            .setCustomId('retour')
                            .setEmoji(client.functions.emoji.no)
                            .setStyle(2)
                    );

                i.update({
                    content: null,
                    embeds: [embed],
                    components: [row]
                });
                return;
            }

            if (i.customId.startsWith('options_delete_')) {
                const optionId = i.customId.split('_')[2];
                const index = db.option.findIndex(option => option.value === optionId);
                if (index !== -1) {
                    db.option.splice(index, 1);
                    await client.db.set(`ticket_${i.guild.id}`, db);
                    i.deferUpdate()
                    embedMenu();
                }
                return;
            }

            if (i.customId === "delete_all_data_yes") {
                await client.db.set(`ticket_${message.guild.id}`, {
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
                })
                await sleep(800)
                await i.deferUpdate()
                embedMenu()
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
                            .setStyle(2)
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
                            .setStyle(2)
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
                            .setStyle(2)
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
                            .setStyle(2)
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
                            .setStyle(2)
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
                    const salon = client.channels.cache.get(db.salon) || message.channel
                    const fetchedMessage = await salon.messages.fetch(messageId).catch(() => null);

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
                        message: null,
                        logs: null,
                        transcript: false,
                        mention: [],
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
                            .setStyle(2)
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
                const optionId = i.values[0].split('_')[1];
                i.deferUpdate()
                return embedOptions(optionId)
            }

            /*
            =================================
                        Options Settings 
            =================================
            */

            if (i.values[0].startsWith('role_option_')) {
                const id = i.values[0].split('_')[2];
                const valideoption = db.option.find(option => option.value === id);
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription("***Quel rôle souhaitez-vous assigner/retire pour les rôels mentionnés ?***")
                    .setFooter(client.footer);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('retour')
                            .setEmoji(client.functions.emoji.retour)
                            .setStyle(2)
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
                        const roles = valideoption.mention.includes(role.id);

                        if (roles) {
                            const index = valideoption.mention.indexOf(role.id);
                            if (index !== -1) {
                                valideoption.mention.splice(index, 1);
                                await client.db.set(`ticket_${i.guild.id}`, db);
                            }
                        } else {
                            valideoption.mention.push(role.id);
                            await client.db.set(`ticket_${i.guild.id}`, db);
                        }
                    } else {
                        const channel = client.channels.cache.get(response.first().channelId);
                        await channel.send({ content: "***Le rôle mentionné est invalide. Veuillez mentionner un rôle valide.***" });
                    }

                    response.first().delete().catch(() => { });
                    embedOptions(id)
                    return;
                }
            }

            if (i.values[0].startsWith('transcript_option_')) {
                const id = i.values[0].split('_')[2];
                const valideoption = db.option.find(option => option.value === id);
                valideoption.transcript = !valideoption.transcript;
                await client.db.set(`ticket_${i.guild.id}`, db);
                await i.deferUpdate();
                return embedOptions(id);
            }

            if (i.values[0].startsWith('salon_option_')) {
                const id = i.values[0].split('_')[2];
                const valideoption = db.option.find(option => option.value === id);

                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription("***Quel salon souhaitez-vous utiliser pour l'option ?***")
                    .setFooter(client.footer);

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('retour')
                            .setEmoji(client.functions.emoji.retour)
                            .setStyle(2)
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
                        valideoption.logs = channel.id;
                        await client.db.set(`ticket_${message.guild.id}`, db);
                        embedOptions(id)
                    } else {
                        const channel = client.channels.cache.get(response.first().channelId);
                        const salon = await channel.send({ content: '***Le salon mentionné est invalide. Veuillez mentionner un salon valide.***' });
                        embedOptions(id)
                        setTimeout(() => {
                            salon.delete().catch(() => { })
                        }, 8000)

                    }

                    response.first().delete().catch(() => { });
                }

            }

            if (i.values[0].startsWith('emoji_option_')) {
                const id = i.values[0].split('_')[2];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {

                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription("***Quel seras l'emoji ?***")
                        .setFooter(client.footer);

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('retour')
                                .setEmoji(client.functions.emoji.retour)
                                .setStyle(2)
                        );

                    i.update({
                        content: null,
                        embeds: [embed],
                        components: [row]
                    });

                    try {
                        const filter = response => response.author.id === message.author.id;
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const emojiInput = collected.first().content.trim();
                        const emojiId = emojiget(client, emojiInput);
                        if (!valide(client, emojiId) && !valide(client, emojiInput)) {
                            message.channel.send('L\'émoji indiqué est invalide.');
                        } else {
                            const emoji = emojiId || emojiInput;
                            valideoption.emoji = emoji;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await collected.first().delete();
                        }
                        await embedOptions(id);
                    } catch (error) {
                        console.error(error);
                        await embedOptions(id);
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")

                    }
                }
            }

            if (i.values[0].startsWith('text_option_')) {
                const id = i.values[0].split('_')[2];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {

                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription("***Veuillez indiquer la text de l'option***")
                        .setFooter(client.footer);

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('retour')
                                .setEmoji(client.functions.emoji.retour)
                                .setStyle(2)
                        );

                    i.update({
                        content: null,
                        embeds: [embed],
                        components: [row]
                    });

                    const filter = response => response.author.id === message.author.id;

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const msgcollect = collected.first().content.trim();
                        const text = msgcollect

                        if (!text) {
                            message.channel.send('Le nom de l\'option indiquée est invalide.');
                        } else {
                            if (text.length >= 80) {
                                return message.channel.send('Le nom de l\'option ne peut pas être supérieur ou égale à 80 caractères.');
                            }

                            valideoption.text = msgcollect;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await collected.first().delete();
                        }
                        await embedOptions(id);
                    } catch (error) {
                        await embedOptions(id);
                        console.error(error);
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")
                    }
                }
            }


            if (i.values[0].startsWith('description_option_')) {
                const id = i.values[0].split('_')[2];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {

                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription("***Veuillez indiquer la description du select menu.***")
                        .setFooter(client.footer);

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('retour')
                                .setEmoji(client.functions.emoji.retour)
                                .setStyle(2)
                        );

                    i.update({
                        content: null,
                        embeds: [embed],
                        components: [row]
                    });

                    const filter = response => response.author.id === message.author.id;

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const msgcollect = collected.first().content.trim();
                        const text = msgcollect

                        if (!text) {
                            message.channel.send('La description de l\'option indiquée est invalide.');
                        } else {
                            if (text.length >= 100) {
                                return message.channel.send('La description de l\'option ne peut pas être supérieur ou égale à 100 caractères.');
                            }

                            valideoption.description = msgcollect;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await collected.first().delete();
                        }
                        await embedOptions(id);
                    } catch (error) {
                        await embedOptions(id);
                        console.error(error);
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")
                    }
                }
            }

            if (i.values[0].startsWith('ouvert_option_')) {
                const id = i.values[0].split('_')[2];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {

                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription("***Veuillez indiquer le texte d'ouverture du ticket.***")
                        .setFooter(client.footer);

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('retour')
                                .setEmoji(client.functions.emoji.retour)
                                .setStyle(2)
                        );

                    i.update({
                        content: null,
                        embeds: [embed],
                        components: [row]
                    });

                    const filter = response => response.author.id === message.author.id;

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const msgcollect = collected.first().content.trim();
                        const text = msgcollect

                        if (!text) {
                            message.channel.send('Le message de l\'embed de l\'option indiquée est invalide.');
                        } else {
                            if (text.length >= 200) {
                                return message.channel.send('Le message de l\'embed ne peut pas être supérieur ou égale à 200 caractères.');
                            }

                            valideoption.message = msgcollect;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await collected.first().delete();
                        }
                        await embedOptions(id);
                    } catch (error) {
                        await embedOptions(id);
                        console.error(error);
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")
                    }
                }
            }

            if (i.values[0].startsWith('categorie_option_')) {
                const id = i.values[0].split('_')[2];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {

                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription("***Quel seras la catégorie des tickets ?***")
                        .setFooter(client.footer);

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('retour')
                                .setEmoji(client.functions.emoji.retour)
                                .setStyle(2)
                        );

                    i.update({
                        content: null,
                        embeds: [embed],
                        components: [row]
                    });

                    const filter = response => response.author.id === message.author.id;

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const msgcollect = collected.first().content.trim();
                        const channels = await message.guild.channels.cache.get(msgcollect);
                        if (channels.type !== 4) {
                            message.channel.send('La catégorie indiquée est invalide.');
                            await collected.first().delete();
                        } else {
                            valideoption.categorie = msgcollect;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await collected.first().delete();

                        }
                        await embedOptions(id);
                    } catch (error) {
                        console.error(error);
                        await embedOptions(id);
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")
                    }
                }
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

function emojiget(client, emoji) {
    const regex = /<a?:\w+:(\d+)>/;
    const match = emoji.match(regex);
    return match ? match[1] : null;
}


function valide(client, emoji) {
    return client.emojis.cache.has(emoji);
}
