const Discord = require('discord.js');
const ms = require('ms');

let spamData = new Map();

module.exports = {
    name: 'messageCreate',

    run: async (client, message) => {
      /*   const channel = message.channel;
          if (!channel || !channel.guild || message.author.id === client.user.id) return;
          const config = {
              sanction: ["Mute"],
              logsstatus: true,
              logs: '1217857016110776430'
          };
  
  
          let userData = (spamData.get(channel.id) || new Map()).get(message.author.id) || { count: 0, messageIds: [] };
  
          userData.count++;
          userData.messageIds.push(message.id);
  
          let channelData = spamData.get(channel.id) || new Map();
          channelData.set(message.author.id, userData);
          spamData.set(channel.id, channelData);
  
          if (userData.count >= 3) {
              await handleSpam(client, channel, message.author, userData, config, message);
          }
      }
  };
  
  async function handleSpam(client, channel, author, userData, config, message) {
    if (!userData.handled) {
        userData.handled = true;

        config.sanction?.forEach(async action => {
            switch (action) {
                case "Mute":
                    if (!author.bot) message.member.timeout(ms('15s'), { reason: "heal - antispam" });
                    break;
                case "Ban":
                    message.member.ban({ reason: "heal - antispam" });
                    break;
                case "Kick":
                    message.member.kick("heal - antispam");
                    break;
                case "Derank":
                    message.member.roles.set([]);
                    break;
                default:
                    break;
            }
        });

        let spamUsers = [author.id];
        for (const [userId, data] of spamData.get(channel.id)) {
            if (data.count >= 3 && userId !== author.id) {
                spamUsers.push(userId);
            }
        }

        let mentionUsers = spamUsers.map(user => `<@${user}>`).join(', ');

        channel.send(`❌ ${mentionUsers}, Le spam est interdit sur ce serveur !`)
            .then((m) => setTimeout(() => m.delete(), 5000))
            .catch(() => { });

        while (userData.count >= 3) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            userData = spamData.get(channel.id)?.get(author.id) || { count: 0, messageIds: [] };
        }
        console.log(spamData)
        await sendLogs(client, channel, spamUsers, config, userData.count);

        for (const userId of spamUsers) {
            spamData.get(channel.id)?.delete(userId);
        }
    }
}



  
  async function deleteMessages(channel, messageIds, spamUsers) {
      try {
          while (messageIds.length > 0) {
              const chunk = messageIds.splice(0, 100);
              await channel.bulkDelete(chunk).catch(() => { });
          }
  
          let spammer = spamUsers.map(user => `<@${user}>`).join(', ')
          channel.send(`❌ ${spammer}, Le spam est interdit sur ce serveur !`)
              .then((m) => setTimeout(() => m.delete(), 5000))
              .catch(() => { });
      } catch (error) {
          console.log(error);
      }
  }
  
  async function sendLogs(client, channel, spamUsers, config, deletedCount) {
      if (config.logsstatus === true || config.logsstatus === "on") {
          let logsChannel = channel.guild.channels.cache.get(config.logs);
  
          let mentionUsers = spamUsers.map(userId => {
              const user = channel.guild.members.cache.get(userId);
              if (user) {
                return `・ ${user.user.username} (ID: ${user.id})`;
              } else {
                return `Utilisateur inconnu (ID: ${userId})`;
              }
            }).join('\n');
  
          let deleteCount = spamUsers.length * deletedCount; 
          let embed = new Discord.EmbedBuilder()
          .setFooter({ text: `${deleteCount} messages supprimés dans ${channel.name}`, iconURL: channel.guild.iconURL() })
              .setTimestamp()
              .setAuthor({name: "・ Actions non autorisées"})
              .addFields({name: "・Utilisateurs", value: `\`\`\`py\n${mentionUsers}\`\`\``})
              .addFields({name: "・Sanction", value: `\`\`\`py\n${config.sanction[0]}\`\`\``})
              .addFields({name: "・Modifications apportées", value: "\`\`\`py\nMessages contenants du spam\`\`\`"})
              .setColor(client.color);
  
          logsChannel?.send({ embeds: [embed] })
              .then(() => {
                  for (const userId of spamUsers) {
                      spamData.get(channel.id)?.delete(userId);
                  }
              })
              .catch(error => console.error("Erreur:", error));*/
      }
  }

