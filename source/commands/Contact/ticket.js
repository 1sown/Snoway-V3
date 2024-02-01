const Discord = require('discord.js');
const Snoway = require('../../structures/client/index')
const ms = require('../../structures/Utils/ms'); 
module.exports = {
    name: 'sddqdqsdq',
    aliases: ["tickets"],
    description: {
        fr: 'Permet de créer/configure le sytème de ticket.',
        en: "Creates/configures the ticket system."
    },
    /**
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     */
    run: async (client, message, args) => {
        const msg = await message.channel.send({ content: 'Chargement...' })
        async function updatefirst() {
            const db = await client?.db.get(`ticket_${message.guild.id}`) || {
                option: [],
                salon: null,
                messageauto: null,
                type: "select",
                Suppauto: true,
                messageid: null,
                maxticket: 1,
                leaveclose: false,
                claimbutton: true,
                buttonclose: true,
                transcript: false,
                rolerequis: null,
                roleinterdit: null,
            }

            let modules = ''
            switch (db.type) {
                case 'select':
                    modules = "Sélecteur"
                    break;
                case "button":
                    modules = "Boutons"
                    break;
            }
            const embed = new Discord.EmbedBuilder()
                .setTitle("Paramètres des tickets")
                .setColor(client.color)
                .setFooter(client.footer)
                .addFields({ name: "Salon", value: `${client.channels.cache.get(db.salon) || "Aucun"}`, inline: true, inline: true })
                .addFields({ name: "Message", value: `${db.messageauto || "Message automatique"}`, inline: true })
                .addFields({ name: "Type", value: `${modules}`, inline: true })
                .addFields({ name: "Claim", value: `${db.claimbutton ? "✅" : "❌"}`, inline: true })
                .addFields({ name: "Nombre maximum de ticket par personne", value: `${db.maxticket}`, inline: true })
                .addFields({ name: "Fermer automatiquement les tickets des membres quittant le serveur", value: `${db.leaveclose ? "✅" : "❌"}`, inline: true })
                .addFields({ name: "Bouton claim", value: `${db.claimbutton ? "✅" : "❌"}`, inline: true })
                .addFields({ name: "Bouton close", value: `${db.buttonclose ? "✅" : "❌"}`, inline: true })
                .addFields({ name: "Transcript MP", value: `${db.transcript ? "✅" : "❌"}`, inline: true })
                .addFields({ name: "Options", value: db.option.map(option => option.text).join('\n') || "Aucune", inline: true })


            const optionselect = db.option.map(options => ({
                label: options.text,
                description: options.description || "Aucune",
                value: options.value
            }));



            const selectoption = new Discord.StringSelectMenuBuilder()
                .setCustomId('selectoption')
                .setPlaceholder('Gérer les options')
                .addOptions([...optionselect, {
                    label: 'Ajouter une option...',
                    emoji: "➕",
                    value: 'addoption'
                }]);

            const buttons = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('activer')
                    .setLabel('✅ Valider et activer')
                    .setStyle(3)
            )
            const selectMenu = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.StringSelectMenuBuilder()
                        .setCustomId('selectconfigticket')
                        .setPlaceholder('Configuration des tickets')
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
                );

            const row = new Discord.ActionRowBuilder().addComponents(selectoption)
            msg.edit({
                embeds: [embed], content: null, components: [row, selectMenu, buttons]
            })
        }
        updatefirst()

        const collector = msg.createMessageComponentCollector()
        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Tu n'es pas autorisé à interagir avec cette interaction !", flags: 64 })
            const dbone = await client?.db.get(`ticket_${message.guild.id}`) || {
                option: [],
                salon: null,
                messageauto: null,
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

            if (i.customId === 'retourmenu') {
                updatefirst()
                i.deferUpdate()
                return;
            }

            if (i.customId === 'activer') {
                if (!dbone || !dbone.option || dbone.option.length === 0) {
                    return i.reply({ content: "Le système de tickets (les options) n'est pas configuré.", flags: 64 });
                }
                if (!dbone.salon) {
                    return i.reply({ content: "Le système de tickets (le salon) n'est pas configuré.", flags: 64 });
                }
                const embed = new Discord.EmbedBuilder()
                    .setTitle('Tickets')
                    .setDescription('Utiliser ce menu pour créer un ticket et contacter le staff')
                    .setColor(client.color)
                    .setFooter(client.footer)
                if (dbone.type === "button") {
                    const buttons = [];
                    dbone.option.forEach(option => {
                        const button = new Discord.ButtonBuilder()
                            .setCustomId(`ticket_${option.value}`)
                            .setLabel(option.text)
                            .setStyle(2)

                        const regex = /<:(.*):(\d+)>/;

                        if (option.emoji) {
                            const match = option.emoji.match(regex);
                            const emojiid = match[2];
                            const emojibot = client.emojis.cache.has(emojiid)
                            if (emojibot) {
                                button?.setEmoji(emojiid)
                            }
                        }
                        buttons.push(button);
                    });

                    const row = new Discord.ActionRowBuilder().addComponents(...buttons);
                    const channel = client.channels.cache.get(dbone.salon)
                    if (channel) {
                        channel.send({ embeds: [embed], components: [row] })
                        msg.edit({ components: [] })
                    }
                }

                if (dbone.type === "select") {
                    const options = [];
                    const regex = /<:(.*):(\d+)>/;
                    
                    dbone.option.forEach(option => {
                        if (option.emoji) {
                            const match = option.emoji.match(regex);
                            if (match) {
                                const emojiid = match[2];
                                const emojibot = client.emojis.cache.get(emojiid);
                                if (emojibot) { 
                                    options.push({
                                        label: option.text,
                                        emoji: emojiid, 
                                        description: option.description,
                                        value: `ticket_${option.value}`
                                    });
                                }
                            }
                        } else {
                            options.push({
                                label: option.text,
                                description: option.description,
                                value: option.value
                            });
                        }
                    });
                
                    const row = new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.StringSelectMenuBuilder()
                                .setCustomId('ticket')
                                .addOptions(options)
                        );
                    const channel = client.channels.cache.get(dbone.salon);                
                    if (channel) {
                        channel.send({ embeds: [embed], components: [row] });
                
                        msg.edit({ components: [] });
                    }
                }
                i.deferUpdate()
                return;
            }

            if (i.customId.startsWith('suppoption_')) {
                const optionId = i.customId.split('_')[1];
                const index = dbone.option.findIndex(option => option.value === optionId);
                if (index !== -1) {
                    dbone.option.splice(index, 1);
                    await client.db.set(`ticket_${i.guild.id}`, dbone);
                    i.deferUpdate()
                    return updatefirst();
                }
            }

            if (i.values[0] === 'type') {
                const currentType = dbone.type;
                const newType = currentType === 'button' ? 'select' : 'button';
                dbone.type = newType;
                await client.db.set(`ticket_${i.guild.id}`, dbone);
                await i.deferUpdate();
                await updatefirst();
            }

            if (i.values[0] === 'claim') {
                dbone.claimbutton = !dbone.claimbutton;
                await client.db.set(`ticket_${i.guild.id}`, dbone);
                await i.deferUpdate();
                await updatefirst();
            }

            if (i.values[0] === 'fermetureleave') {
                dbone.leaveclose = !dbone.leaveclose;
                await client.db.set(`ticket_${i.guild.id}`, dbone);
                await i.deferUpdate();
                await updatefirst();
            }

            if (i.values[0] === 'transcript') {
                dbone.transcript = !dbone.transcript;
                await client.db.set(`ticket_${i.guild.id}`, dbone);
                await i.deferUpdate();
                await updatefirst();
            }

            if (i.values[0] === 'maxticket') {
                const filter = response => response.author.id === message.author.id;
                const sentMessage = await i.reply("Veuillez indiquer le nouveau nombre maximum de tickets par personne.");

                try {
                    const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                    const newMaxTickets = parseInt(collected.first().content.trim());

                    if (!isNaN(newMaxTickets) && newMaxTickets > 0) {
                        dbone.maxticket = newMaxTickets;
                        await client.db.set(`ticket_${i.guild.id}`, dbone);
                        await sentMessage.delete();
                        await collected.first().delete();
                        await updatefirst();
                    } else {
                        message.channel.send("Veuillez entrer un nombre entier positif.");
                        await sentMessage.delete();
                        await collected.first().delete();
                        await updatefirst();
                    }
                } catch (error) {
                    console.error(error);
                    sentMessage.delete();
                    await updatefirst();
                    message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite : " + error.message);
                }
            }

            if (i.values[0] === 'salon') {
                const filter = response => response.author.id === message.author.id;
                const sentMessage = await i.reply("Quel est le **salon **du menu de ticket ?");
                try {
                    const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                    const msgcollect = collected.first().content.trim();
                    const channelID = msgcollect.replace(/[<#>]/g, '') || msgcollect;
                    const channel = message.guild.channels.cache.get(channelID);
                    if (!channel) {
                        message.channel.send('Aucun channel trouvé.');
                        await sentMessage.delete();
                        await collected.first().delete();
                        await updatefirst();
                    } else {
                        dbone.salon = channel.id
                        await client.db.set(`ticket_${i.guild.id}`, dbone);
                        await sentMessage.delete();
                        await collected.first().delete();
                        await updatefirst();
                    }
                } catch (error) {
                    console.error(error);
                    sentMessage.delete();
                    await updatefirst();
                    message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")
                }
            }



            const db = await client?.db.get(`ticket_${i.guild.id}`) || {
                option: [],
                salon: null,
                messageauto: null,
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


            if (i.values[0] === 'addoption') {
                if (db.option.length >= 5) {
                    return msg.edit({ content: 'Vous ne pouvez configurer que 5 options pour les tickets', embeds: [], components: [] });
                } else {
                    db.option.push({
                        categorie: null,
                        emoji: null,
                        text: 'Ouvrir un ticket',
                        value: code(10),
                        description: "Aucune description",
                        message: "Merci d'avoir contacté le support\nDécrivez votre problème puis attendez de recevoir une réponse",
                        logs: null,
                        mention: null,
                        acess: null
                    })
                    await client.db.set(`ticket_${i.guild.id}`, db)
                    updatefirst()
                }
            }


            if (i.values[0].startsWith('categorieoption_')) {
                const id = i.values[0].split('_')[1];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {
                    const filter = response => response.author.id === message.author.id;
                    const sentMessage = await i.reply("Veuillez indiquer une catégorie.");

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const msgcollect = collected.first().content.trim();
                        const channels = await message.guild.channels.cache.get(msgcollect);
                        if (channels.type !== 4) {
                            message.channel.send('La catégorie indiquée est invalide.');
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                        } else {
                            valideoption.categorie = msgcollect;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                        }
                    } catch (error) {
                        console.error(error);
                        sentMessage.delete();
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")
                    }
                }
            }

            if (i.values[0].startsWith('textoption_')) {
                const id = i.values[0].split('_')[1];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {
                    const filter = response => response.author.id === message.author.id;
                    const sentMessage = await i.reply("Veuillez indiquer la text de l'option.");

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const msgcollect = collected.first().content.trim();
                        const text = msgcollect

                        if (!text) {
                            message.channel.send('Le text de l\'option indiquée est invalide.');
                        } else {
                            valideoption.text = msgcollect;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                        }
                    } catch (error) {
                        console.error(error);
                        sentMessage.delete();
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")
                    }
                }
            }

            if (i.values[0].startsWith('roleoption_')) {
                const id = i.values[0].split('_')[1];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {
                    const filter = response => response.author.id === message.author.id;
                    const sentMessage = await i.reply("Veuillez mentionner le rôle.");

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const mentionedRoles = collected.first().mentions.roles;

                        if (mentionedRoles.size === 0) {
                            message.channel.send('Aucun rôle mentionné ou le rôle mentionné est invalide.');
                        } else {
                            const roleId = mentionedRoles.first().id;
                            valideoption.mention = roleId;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                        }
                    } catch (error) {
                        console.error(error);
                        await optionupdate(id);
                        sentMessage.delete();
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.");
                    }
                }
            }

            if (i.values[0].startsWith('salonoption_')) {
                const id = i.values[0].split('_')[1];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {
                    const filter = response => response.author.id === message.author.id;
                    const sentMessage = await i.reply("Veuillez indiquer le salon des logs.");

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const msgcollect = collected.first().content.trim();
                        const channel = client.channels.cache.get(msgcollect);

                        if (!channel) {
                            message.channel.send('Le channel indiquée est invalide.');
                        } else {
                            valideoption.logs = msgcollect;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                        }
                    } catch (error) {
                        console.error(error);
                        sentMessage.delete();
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")
                    }
                }
            }
            if (i.values[0].startsWith('emojioption_')) {
                const id = i.values[0].split('_')[1];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {
                    const filter = response => response.author.id === message.author.id;
                    const sentMessage = await i.reply("Veuillez indiquer un emoji.");

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const emoji = collected.first().content.trim();
                        const customEmoji = emojiget(emoji) || emoji;

                        if (!valide(customEmoji)) {
                            message.channel.send('L\'émoji indiqué est invalide.');
                        } else {
                            valideoption.emoji = emoji;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                        }
                    } catch (error) {
                        console.error(error);
                        await optionupdate(id);
                        sentMessage.delete();
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.")

                    }
                }
            }

            if (i.values[0].startsWith('ouvertoption_')) {
                const id = i.values[0].split('_')[1];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {
                    const filter = response => response.author.id === message.author.id;
                    const sentMessage = await i.reply("Veuillez indiquer le texte d'ouverture du ticket.");

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const text = collected.first().content.trim();

                        if (text.length === 0) {
                            message.channel.send('Le texte d\'ouverture indiqué est invalide.');
                        } else {
                            valideoption.message = text;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                        }
                    } catch (error) {
                        console.error(error);
                        await optionupdate(id);
                        sentMessage.delete();
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.");
                    }
                }
            }
            if (i.values[0].startsWith('descriptionoption_')) {
                const id = i.values[0].split('_')[1];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {
                    const filter = response => response.author.id === message.author.id;
                    const sentMessage = await i.reply("Veuillez indiquer la description du select menu.");
                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const text = collected.first().content.trim();

                        if (text.length === 0) {
                            message.channel.send('La description indiqué est invalide.');
                        }  else if (text.length > 100) {
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                            await i.channel.send('La description doit contenir moins de 100 caractères.');
    
                        } else {
                            valideoption.description = text;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                        }
                    } catch (error) {
                        console.error(error);
                        await optionupdate(id);
                        sentMessage.delete();
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.");
                    }
                }
            }

            if (i.values[0].startsWith('roleacess_')) {
                const id = i.values[0].split('_')[1];
                const valideoption = db.option.find(option => option.value === id);

                if (valideoption) {
                    const filter = response => response.author.id === message.author.id;
                    const sentMessage = await i.reply("Veuillez mentionner le rôle.");

                    try {
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: ms("1m"), errors: ['time'] });
                        const mentionedRoles = collected.first().mentions.roles;

                        if (mentionedRoles.size === 0) {
                            message.channel.send('Aucun rôle mentionné ou le rôle mentionné est invalide.');
                        } else {
                            const roleId = mentionedRoles.first().id;
                            valideoption.acess = roleId;
                            await client.db.set(`ticket_${i.guild.id}`, db);
                            await sentMessage.delete();
                            await collected.first().delete();
                            await optionupdate(id);
                        }
                    } catch (error) {
                        console.error(error);
                        await optionupdate(id);
                        sentMessage.delete();
                        message.channel.send("Le temps de réponse a expiré ou une erreur s'est produite.");
                    }
                }
            }

            if (i.customId === 'selectoption') {
                i.deferUpdate()
                optionupdate(i.values[0])

            }

        })

        async function optionupdate(module) {
            const db = await client?.db.get(`ticket_${message.guild.id}`) || {}
            const selectedOption = db.option.find(option => option.value === module);

            if (selectedOption) {
                const categorie = client.channels.cache.get(selectedOption.categorie)
                const channlog = client.channels.cache.get(selectedOption.logs)
                const role = message.guild.roles.cache.get(selectedOption.mention);
                const roleacess = message.guild.roles.cache.get(selectedOption.acess);
                const optionFields = [
                    { name: 'Catégorie', value: categorie ? `#${categorie.name}` : 'Aucune', inline: true },
                    { name: 'Emoji', value: selectedOption.emoji || 'None', inline: true },
                    { name: 'Texte', value: selectedOption.text, inline: true },
                    { name: 'Description (Sélecteur seulement)', value: selectedOption.description || 'Aucune description', inline: true },
                    { name: 'Salon de logs', value: channlog ? `#${channlog.name}` : 'Aucun', inline: true },
                    { name: 'Rôles mentionnés', value: role?.name || 'Aucun', inline: true },
                    { name: 'Message d\'ouverture de ticket', value: selectedOption.message, inline: true },
                    { name: 'Rôles ayant accès', value: roleacess?.name || 'Aucun', inline: true }
                ];

                const button = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('retourmenu')
                            .setStyle(2)
                            .setEmoji("↩")
                            .setLabel('Retour'),
                        new Discord.ButtonBuilder()
                            .setCustomId('suppoption_' + selectedOption.value)
                            .setStyle(4)
                            .setLabel('❌ Supprimer l\'option')
                    )

                const selectMenu = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.StringSelectMenuBuilder()
                            .setCustomId('configmenu')
                            .setPlaceholder('Sélectionnez un champ à configurer...')
                            .addOptions([
                                {
                                    label: 'Catégorie',
                                    emoji: '📮',
                                    value: 'categorieoption_' + selectedOption.value
                                },
                                {
                                    label: 'Emoji',
                                    emoji: '🌐',
                                    value: 'emojioption_' + selectedOption.value
                                },
                                {
                                    label: 'Text de button/selecteur',
                                    emoji: '✏',
                                    value: 'textoption_' + selectedOption.value
                                },
                                {
                                    label: 'Description (Sélecteur seulement)',
                                    emoji: "🗨",
                                    value: 'descriptionoption_' + selectedOption.value
                                },
                                {
                                    label: 'Salon des logs/transcript',
                                    emoji: "📜",
                                    value: 'salonoption_' + selectedOption.value
                                },
                                {
                                    label: 'Rôle mentionner',
                                    emoji: '🔔',
                                    value: 'roleoption_' + selectedOption.value
                                },
                                {
                                    label: 'Message d\'ouverture de ticket',
                                    emoji: '📋',
                                    value: 'ouvertoption_' + selectedOption.value
                                },
                                {
                                    label: 'Rôles ayant accès',
                                    emoji: '🔑',
                                    value: 'roleacess_' + selectedOption.value
                                }
                            ])
                    );
                const optionEmbed = new Discord.EmbedBuilder()
                    .setTitle(`Paramètres de l'option`)
                    .setColor(client.color)
                    .addFields(optionFields);

                msg.edit({ embeds: [optionEmbed], components: [selectMenu, button] });
            }
        }


        function emojiget(emoji) {
            const regex = /<a?:\w+:(\d+)>/;
            const match = emoji.match(regex);
            return match ? match[1] : null;
        }

        function valide(emoji) {
            return client.emojis.cache.has(emoji);
        }
    }
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