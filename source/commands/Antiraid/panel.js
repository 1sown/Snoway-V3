const Discord = require('discord.js');
const Snoway = require('../../structures/client/index')

module.exports = {
    name: "panel",
    description: {
        fr: "Configure la sécurité du serveur",
        en: "Configures server security"
    },
    /**
     * @param {Snoway} client
     * @param {Discord.Message} message
     */
    run: async (client, message) => {
        const msg = await message.channel.send("** **")
        async function panel(module) {
            let dbmodule = module || "AntiSpam"
            const db = await dbGet(dbmodule);
            let text_autorisation = "";
            let text_sanction = "";
            if (db.wl.wl) {
                text_autorisation += "         ↪ Utilisateur dans la liste blanche\n";
            }

            if (db.wl.buyers) {
                text_autorisation += "         ↪ Utilisateur dans la liste des propriétaires\n";
            }

            if (db.wl.bypass.includes('USER')) {
                text_autorisation += `         ↪ Utilisateur indépendant (${db.wl.user.length})\n`;
            }

            if (db.wl.bypass.includes('ROLE')) {
                text_autorisation += `         ↪ Rôle indépendant (${db.wl.role.length})\n`;

            }


            switch (db.sanction) {
                case "BAN":
                    text_sanction = "・Banissement du membre"
                    break;
                case "KICK":
                    text_sanction = "・Exclusion du membre"
                    break;
                case "MUTE":
                    text_sanction = "・Exclusion temporaire du membre"
                    break;
                default:
                    text_sanction = "・Aucune"
            }
            const db_module_get = await dbGet();

            const SelectModule = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.StringSelectMenuBuilder()
                        .setCustomId('select_module')
                        .addOptions(Object.keys(db_module_get).map(module => ({
                            label: module,
                            emoji: module.status ? client.functions.emoji.power_on : client.functions.emoji.power_off,
                            default: module === dbmodule ? true : false,
                            value: module
                        })))
                )

            const selectSanction = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.StringSelectMenuBuilder()
                        .setCustomId(`select_sanction_${dbmodule}`)
                        .addOptions({
                            label: "Banissement du membre",
                            value: "BAN",
                            default: db.sanction === "BAN" ? true : false,
                            emoji: db.sanction === "BAN" ? client.functions.emoji.sanction_on : client.functions.emoji.sanction_off
                        }, {
                            label: "Exclusion du membre",
                            value: "KICK",
                            default: db.sanction === "KICK" ? true : false,
                            emoji: db.sanction === "KICK" ? client.functions.emoji.sanction_on : client.functions.emoji.sanction_off
                        }, {
                            label: "Exclusion temporaire du membre",
                            value: "MUTE",
                            default: db.sanction === "MUTE" ? true : false,
                            emoji: db.sanction === "MUTE" ? client.functions.emoji.sanction_on : client.functions.emoji.sanction_off
                        }, {
                            label: "Aucune",
                            value: "NONE",
                            default: db.sanction === "NONE" ? true : false,
                            emoji: db.sanction === "NONE" ? client.functions.emoji.sanction_on : client.functions.emoji.sanction_off
                        })
                )

                const SelectWL = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.StringSelectMenuBuilder()
                        .setCustomId('wl-config')
                        .setMinValues(1)
                        .setMaxValues(4)
                        .setPlaceholder("Choisissez les utilisateurs autorisés.")
                        .addOptions([
                            {
                                label: `Utilisateurs dans la liste des propriétaires (${(await client.db.get('owner') || []).length})`,
                                value: 'buyers',
                                default: db.wl.buyers ? true : false,
                                emoji: db.wl.buyers ? client.functions.emoji.user_on : client.functions.emoji.user_off,
                            }, {
                                label: `Utilisateurs dans la liste blanche (${(await client.db.get(`wl_${message.guildId}`) || []).length})`,
                                value: 'wl',
                                default: db.wl.wl ? true : false,
                                emoji: db.wl.buyers ? client.functions.emoji.wl_on : client.functions.emoji.wl_off,
                            }, {
                                label: `Utilisateurs indépendantt (${db.wl.user.length})`,
                                value: 'user',
                                default: db.wl.bypass.includes("USER") ? true : false,
                                emoji: db.wl.buyers ? client.functions.emoji.user_on : client.functions.emoji.user_off,
                            }, {
                                label: `Rôle indépendantt (${db.wl.role.length})`,
                                value: 'role',
                                default: db.wl.bypass.includes("ROLE"),
                                emoji: db.wl.bypass.includes("ROLE") ? client.functions.emoji.role_on : client.functions.emoji.role_off,
                            }
                        ])
                );

             const embed = new Discord.EmbedBuilder()
                .setColor(client.color)
                .setFooter(client.footer)
                .addFields({
                    name: "・Configuration",
                    value: `\`\`\`py\n` +
                        `Module: ${dbmodule}\n` +
                        `Etat: ${db.status ? "✅" : "❌"}\n` +
                        `${dbmodule === "AntiSpam" ? `Temps: ${await convertTime(db.temps)}\n` : ""}` +
                        `${dbmodule === "AntiSpam" ? `Salons ignorés: ${db.salon.length}\n` : ""}` +
                        `Autorisé: ${text_autorisation ? `\n${text_autorisation}` : "❌"}\`\`\``
                }, {
                    name: "・Sanction:",
                    value: `\`\`\`py\n${text_sanction}\`\`\``
                }, {
                    name: "・Logs",
                    value: `\`\`\`py\nStatus: ${db.logs.status ? "✅" : "❌"}${db.logs.status ? `\nSalon: ${client.channels.cache.get(db.logs.channel)?.name || "Non configuré"}` : ""}\`\`\``
                })

                const button_power = new Discord.ButtonBuilder()
                .setCustomId('button_power_' + dbmodule)
                .setStyle(2)
                .setLabel('Status')
                .setEmoji(db.status ? client.functions.emoji.status_on : client.functions.emoji.status_off)
                const button = new Discord.ActionRowBuilder().addComponents(button_power)

            msg.edit({ embeds: [embed], components: [SelectModule, selectSanction, SelectWL, button] })
        }
        panel();

        const collector = msg.createMessageComponentCollector()

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({
                    content: await client.lang('interaction'),
                    flags: 64
                })
            }

            if(i.customId.startsWith("button_power_")) {
                const db = await dbGet()
                const dbmodule = i.customId.split('_')[2];
                db[dbmodule].status = !db[dbmodule].status;
                await client.db.set(`antiraid_${message.guildId}`, db)
                i.deferUpdate();
                panel(dbmodule)
            }

            if (i.customId === "select_module") {
                i.deferUpdate();
                panel(i.values[0])
            }

            if (i.customId.startsWith('select_sanction_')) {
                const db = await dbGet()
                const sanction = i.values[0]
                const dbmodule = i.customId.split('_')[2];
                db[dbmodule].sanction = sanction
                await client.db.set(`antiraid_${message.guildId}`, db)
                i.deferUpdate();
                panel(dbmodule)
            }
        })

        async function dbGet(module) {
            const db = (await client.db.get(`antiraid_${message.guildId}`)) || {
                AntiSpam: {
                    sanction: "NONE",
                    salon: [],
                    temps: 3000,
                    status: false,
                    logs: {
                        status: false,
                        channel: null
                    },
                    wl: {
                        bypass: [],
                        wl: false,
                        buyers: true,
                        role: [],
                        user: []
                    }
                }, AddBot: {
                    sanction: "NONE",
                    salon: [],
                    logs: {
                        status: false,
                        channel: null
                    },
                    wl: {
                        bypass: [],
                        wl: false,
                        buyers: true,
                        role: [],
                        user: []
                    }
                }
            };

            if (module) {
                return db[module];
            } else {
                return db
            }
        }
    }
}


function convertTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    let timeString = '';
    if (hours > 0) {
        timeString += hours + ' heures ';
    }
    if (remainingMinutes > 0) {
        timeString += remainingMinutes + ` minutes `;
    }
    if (remainingSeconds > 0) {
        timeString += remainingSeconds + ' secondes';
    }
    return timeString.trim();
}
