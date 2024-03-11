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
        panel();

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
                    if (db.wl.user.length > 0 && db.wl.bypass.includes('USER')) {
                        text_autorisation += `         ↪ Utilisateur indépendant (${db.wl.user.length})\n`;
                    }
                    if (db.wl.role.length > 0 && db.wl.bypass.includes('ROLE')) {
                        text_autorisation += `         ↪ Rôle indépendant (${db.wl.role.length})\n`;
                    }
                }
            }
      
            switch(db.sanction) {
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

            const embed = new Discord.EmbedBuilder()
            .setColor(client.color)
            .setFooter(client.footer)
            .addFields({
                name: "・Configuration", 
                value: `\`\`\`js\n` +
                    `Etat: ${db.status ? "✅" : "❌"}\n` +
                    `${dbmodule === "AntiSpam" ? `Temps: ${await convertTime(db.temps)}\n` : ""}` +
                    `${dbmodule === "AntiSpam" ? `Salons ignorés: ${db.salon.length}\n` : ""}` +
                    `Autorisé:${text_autorisation ? `\n${text_autorisation}` : " ❌"}\n` +
                    `\`\`\``
                
            }, {
                name: "・Sanction:", 
                value:  `\`\`\`js\n${text_sanction}\`\`\``
            }, {
                name: "・Logs", 
                value: `\`\`\`js\n`+
                `Status: ${db.logs.status ? "✅" : "❌"}${db.logs.status ? `\nSalon: ${client.channels.cache.get(db.logs.channel)?.name || "Non configuré"}` : ""}
                `+ 
                `\`\`\``
            } )

            return message.reply({embeds: [embed]})
        }
        
        async function dbGet(module) {
            const db = (await client.db.get(`antiraid_${message.guildId}`)) || { 
                AntiSpam: {
                    sanction: "None",
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
                        buyers: false,
                        role: [],
                        user: ["233657223190937601", "798973949189947459"]
                    }
                }
            };

            return db[module];
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