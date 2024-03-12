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
            let text_autorisation = ""
            let text_sanction = ""
            if (db.wl) {
                if (db.wl.wl) {
                    text_autorisation += "         ↪ Utilisateur dans la liste blanche\n";
                } else if (db.wl.buyers) {
                    text_autorisation += "         ↪ Utilisateur dans la liste des propriétaires\n";
                } else {
                    if (db.wl.bypass.includes('USER')) {
                        text_autorisation += `         ↪ Utilisateur indépendant (${db.wl.user.length})\n`;
                    }
                    if (db.wl.bypass.includes('ROLE')) {
                        text_autorisation += `         ↪ Rôle indépendant (${db.wl.role.length})\n`;
                    }
                }
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
                            emoji: db.status ? client.functions.emoji.power_on : client.functions.emoji.power_off,
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

            const embed = new Discord.EmbedBuilder()
                .setColor(client.color)
                .setFooter(client.footer)
                .addFields({
                    name: "・Configuration",
                    value: `\`\`\`js\n` +
                        `Module: ${dbmodule}\n` +
                        `Etat: ${db.status ? "✅" : "❌"}\n` +
                        `${dbmodule === "AntiSpam" ? `Temps: ${await convertTime(db.temps)}\n` : ""}` +
                        `${dbmodule === "AntiSpam" ? `Salons ignorés: ${db.salon.length}\n` : ""}` +
                        `Autorisé:${text_autorisation ? `\n${text_autorisation}` : " ❌"}\n` +
                        `\`\`\``

                }, {
                    name: "・Sanction:",
                    value: `\`\`\`js\n${text_sanction}\`\`\``
                }, {
                    name: "・Logs",
                    value: `\`\`\`js\nStatus: ${db.logs.status ? "✅" : "❌"}${db.logs.status ? `\nSalon: ${client.channels.cache.get(db.logs.channel)?.name || "Non configuré"}` : ""}\`\`\``
                })

             msg.edit({ embeds: [embed], components: [SelectModule, selectSanction] })
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


        if(i.customId.startsWith('select_sanction_')) {
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
                        bypass: ["ROLE", "USER"],
                        wl: false,
                        buyers: false,
                        role: [],
                        user: ["233657223190937601", "798973949189947459"]
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
                        buyers: false,
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
