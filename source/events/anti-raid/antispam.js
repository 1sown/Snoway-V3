const Discord = require('discord.js');
const map = new Map();
const ms = require('ms');
const logSent = new Set();

module.exports = {
  name: 'messageCreate',
  run: async (client, message) => {
    const channel = message.channel;
    if (!channel || !channel.guild) return;
    const config = {
      status: true,
      logs: "1216394496548278282",
      logsstatus: true,
      sanction: ["None"]
    }
    if (!config || !config.status) return;

    let userData = map.get(message.author.id) || { count: 0, lastMessage: null };
    if (message.author.bot || message.author.id === message.guild.ownerId) return;

    const interval = 5000;

    if (userData.lastMessage && (message.createdTimestamp - userData.lastMessage < interval)) {
      userData.count++;
    } else {
      userData.count = 1;
    }

    userData.lastMessage = message.createdTimestamp;
    map.set(message.author.id, userData);

    console.log("User message count:", map.get(message.author.id));

    if (userData.count > 3 && !logSent.has(message.author.id)) {
      logSent.add(message.author.id);
      console.log("Users count:", map.size);

      if (map.size >= 4) {
        console.log("Four or more users are spamming!");
        const usersToSanction = [];
        map.forEach((count, userId) => {
          if (count >= 3) {
            usersToSanction.push(userId);
          }
        });

        console.log("Users to sanction:", usersToSanction);

        const channelsAffected = new Set();

        usersToSanction.forEach(userId => {
          const member = message.guild.members.cache.get(userId);
          if (!member) return;
          console.log("Sanctioning user:", member.user.tag);

          config.sanction.forEach(async action => {
            switch (action) {
              case "Mute":
                if (!member.user.bot) member.timeout(ms('15m'), { reason: "heal - antispam" });
                break;
              case "Ban":
                member.ban({ reason: "heal - antispam" });
                break;
              case "Kick":
                member.kick("heal - antispam");
                break;
              case "Derank":
                member.roles.set([]);
                break;
              default:
                break;
            }
          });

          const author = member.user;
          const messagesToDelete = channel.messages.cache.filter(m => m.author.id === author.id);
          channelsAffected.add(channel);
          lecacaquireste(channel, messagesToDelete, author, config);
        });

        const combinedChannels = Array.from(channelsAffected).join(', ');
        console.log("Sending warning message to:", message.author.tag, "in channels:", combinedChannels);
        message.channel.send(`<:warn:1216031350159839312> ${message.author}, vous et d'autres utilisateurs envoyez trop de messages rapidement dans les canaux: ${combinedChannels}.`)
          .then((m) => setTimeout(() => m.delete(), 5000))
          .catch(() => {});

        const combinedMessagesToDelete = new Discord.Collection();
        channelsAffected.forEach(ch => {
          const messagesToDelete = ch.messages.cache.filter(m => usersToSanction.includes(m.author.id));
          messagesToDelete.forEach((message, key) => combinedMessagesToDelete.set(key, message));
        });

        lecacaquireste(combinedMessagesToDelete, config);
      }
    }

    setTimeout(() => {
      map.delete(message.author.id);
      logSent.delete(message.author.id);
    }, 2500);
  }
};

function sendLogs(author, channel, config, deletedCount) {
  if (config.logsstatus === true || config.logsstatus === "on") {
    let logsChannel = channel.guild.channels.cache.get(config.logs);

    let embed = new Discord.MessageEmbed()
      .setDescription(`\`\`\`diff\n+ ${author.username} vient de spam.\nUtilisateur: ${author.username} (ID: ${author.id})\nSalon: ${channel.name} (ID: ${channel.id})\nPunition: ${config.sanction || "Aucune"}\nMessages: ${deletedCount}\`\`\``)
      .setColor(3027254);

    logsChannel?.send({ embeds: [embed] })
      .catch(error => console.error("Une erreur s'est produite lors de l'envoi des logs :", error));
  }
}

async function lecacaquireste(channel, messagesToDelete, author, config) {
  try {
    const channels = new Set();
    messagesToDelete.forEach(m => channels.add(m.channel));

    channels.forEach(channel => {
      const messagesArray = Array.from(messagesToDelete.filter(m => m.channel === channel).values());
      const bulkMessages = [];
      while (messagesArray.length > 0) {
        const batch = messagesArray.splice(0, 100);
        bulkMessages.push(batch);
      }
      bulkMessages.forEach(async batch => {
        await channel.bulkDelete(batch).catch(() => {});
      });
    });

    sendLogs(author, channel, config, messagesToDelete.size);
  } catch (error) {
    console.error(error)
  }
}
