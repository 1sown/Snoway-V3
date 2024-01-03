const backup = require('discord-backup');
const fs = require('fs');
const path = require('path');
const Snoway = require('../../structures/client');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Embed, StringSelectMenuBuilder } = require('discord.js');
const fsPromises = require('fs').promises;
module.exports = {
  name: 'backup',
  aliases: ["bk", "bakp"],
  description: {
    fr: "Crée/delete/list/load/clear vos bakups",
    en: "Create/delete/list/load/clear your bakups"
  },
  usage: {
    fr: {
        "backup create <nom>": "Crée une backup pour le serveur",
        "backup delete <nom>": "Permet de supprimer une backup",
        "backup load <nom>": "Permet de charger une backup",
        "backup list": "Affiche toutes les backups",
        "backup clear": "Supprime toute les backups",
    },
    en: {
        "backup create <name>": "Creates a backup for the server",
        "backup delete <name>": "Allows you to delete a backup",
        "backup load <name>": "Allows you to load a backup",
        "backup list": "Displays all backups",
        "backup clear": "Deletes all backups",
    },
},
  /**
   * 
   * @param {Snoway} client 
   * @param {Snoway} message 
   * @param {Snoway} args 
   * @returns 
   */
  run: async (client, message, args) => {
    const module = args[0]
    if (module === "create") {
      try {
        const name = args[1];
        if (!name) return message.reply({ content: "Merci de donner un nom pour la backup" });
        const db = await client.db?.get('backup') || []
        const find = db.find(e => e.name === name)
        if (find) {
          return message.reply({ content: "Une backup de ce nom existe déjà" });
        }
        const start = Date.now();

        const backupData = await backup.create(message.guild, {
          maxMessagesPerChannel: 0,
          doNotBackup: ["messages"]
        });

        const uniqueID = generateUniqueID();
        const backupPath = path.join(__dirname, `../../../backup/backup_${uniqueID}.json`);

        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 4));
        await client.db.push(`backup`, {
          id: uniqueID,
          name: name,
          date: Date.now(),
        });
        const end = Date.now();
        const time = end - start;
        return message.reply({ content: `La backup du serveur \`${message.guild.name}\` a été générée en **${time}ms**.` });
      } catch (error) {
        console.error(error);
        return message.reply(':x: Une erreur s\'est produite.');
      }
    }


    if (module === "delete") {
      const userBackups = await client.db.get(`backup`) || [];
      const backupCode = args[1];
      if (!backupCode) return message.reply({ content: "Merci de donner un nom d'une backup" });

      const selectedBackupIndex = userBackups.findIndex(backup => backup.name === backupCode);

      if (selectedBackupIndex === -1) {
        return message.channel.send({ content: `Le nom de backup invalide ou inexistant..` });
      }

      const selectedBackup = userBackups[selectedBackupIndex];

      const backupFilePath = path.join(__dirname, `../../../backup/backup_${selectedBackup.id}.json`);

      try {
        await fsPromises.rm(backupFilePath);
        userBackups.splice(selectedBackupIndex, 1);
        await client.db.set(`backup`, userBackups);
        return message.channel.send({ content: `👀 La backup \`${selectedBackup.name}\` a été supprimée avec succès.` });

      } catch (error) {
        console.error(error);
        return message.reply(':x: Une erreur s\'est produite.');
      }
    }


    if (module === "clear") {
      try {
        const userBackups = await client.db.get(`backup`)
        if (!userBackups) return message.reply({ content: "Aucune backup trouvée !" });

        await client.db.delete(`backup`);

        for (const backup of userBackups) {
          const backupFilePath = path.join(__dirname, `../../../backup/backup_${backup.id}.json`);
          await fsPromises.rm(backupFilePath).catch(() => { })
        }

        return message.channel.send({ content: "Vos backups ont été supprimées avec succès !" })
      } catch (error) {
        console.error(error);
        return message.reply(':x: Une erreur s\'est produite.');
      }
    }



    if (module === "list") {
      const userBackups = await client.db.get(`backup`) || [];
      if (userBackups.length === 0) {
        return message.reply({ content: "Il n'a aucune backup.", ephemeral: true });
      }
      const itemsPerPage = 5;
      const totalPages = Math.ceil(userBackups.length / itemsPerPage);
      let page = 1;
      const totalBackups = userBackups.length
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const backupsToShow = userBackups.slice(startIndex, endIndex);

      const backupList = backupsToShow.map((backup) => {
        const backupFilePath = path.join(__dirname, `../../../backup/backup_${backup.id}.json`);
        const backupData = fs.readFileSync(backupFilePath, 'utf8');
        const backupObject = JSON.parse(backupData);

        const backupDate = new Date(backup.date);
        const formattedDate = `${backupDate.getDate()}/${backupDate.getMonth() + 1}/${backupDate.getFullYear()}`;

        const fileSizeInBytes = fs.statSync(backupFilePath).size;
        const fileSizeInKB = fileSizeInBytes / 1024;

        const rolesCount = backupObject.roles.length;
        const categoriesCount = backupObject.channels.categories.length;

        let channelCount = 0;
        backupObject.channels.categories.forEach(category => {
          category.children.forEach(channel => {
            if (channel.type === 0 || channel.type === 2) {
              channelCount++;
            }
          });
        });

        return `__**Backup**__ \`${backup.name}\`\n\`\`\`js\nNom du serveur : ${backupObject.name}\nCrée : ${formattedDate}\nChannels : ${channelCount || 0}\nCatégorie : ${categoriesCount || 0}\nRôles : ${rolesCount || 0}\nTaille : ${fileSizeInKB.toFixed(2)} KB\nCode : ${backup.id}\`\`\``;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setFooter({ text: `${client.footer.text} • ${page}/${totalPages} | ${totalBackups} backups` })
        .setDescription(backupList)
        .setTitle("Liste des Backup",)


      const row = {
        type: 1,
        components: [
          {
            type: 2,
            customId: 'previous_' + message.id,
            label: '<<<',
            style: 1,
            disabled: page === 1
          },
          {
            type: 2,
            customId: 'suivant_' + message.id,
            label: '>>>',
            style: 1,
            disabled: page === totalPages
          }
        ]
      };

      const reply = await message.reply({ embeds: [embed], components: [row], ephemeral: true });

      const collector = reply.createMessageComponentCollector({ time: 180000 });

      collector.on('collect', async (button) => {
        if(button.user.id !== message.author.id) {
          return button.reply({
              content: "Vous n'êtes pas autorisé à utiliser cette interaction.",
              flags: 64
          })
      }
        if (button.customId.includes('suivant_') && page < totalPages) {
          page++;
        } else if (button.customId.includes('previous_') && page > 1) {
          page--;
        }

        const updatedBackupList = userBackups.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((backup) => {
          const backupFilePath = path.join(__dirname, `../../../backup/backup_${backup.id}.json`);
          const backupData = fs.readFileSync(backupFilePath, 'utf8');
          const backupObject = JSON.parse(backupData);

          const backupDate = new Date(backup.date);
          const formattedDate = `${backupDate.getDate()}/${backupDate.getMonth() + 1}/${backupDate.getFullYear()}`;

          const fileSizeInBytes = fs.statSync(backupFilePath).size;
          const fileSizeInKB = fileSizeInBytes / 1024;

          const rolesCount = backupObject.roles.length;
          const categoriesCount = backupObject.channels.categories.length;

          let channelCount = 0;
          backupObject.channels.categories.forEach(category => {
            category.children.forEach(channel => {
              if (channel.type === 0 || channel.type === 2) {
                channelCount++;
              }
            });
          });

          return `__**Backup**__ \`${backup.name}\`\n\`\`\`js\nNom du serveur : ${backupObject.name}\nCrée : ${formattedDate}\nChannels : ${channelCount || 0}\nCatégorie : ${categoriesCount || 0}\nRôles : ${rolesCount || 0}\nTaille : ${fileSizeInKB.toFixed(2)} KB\nCode : ${backup.id}\`\`\``;
        }).join('\n');



        const updatedEmbed = new EmbedBuilder()
          .setColor(client.color)
          .setFooter({ text: `${client.footer.text} • ${page}/${totalPages} | ${totalBackups} backups` })
          .setDescription(updatedBackupList)
          .setTitle("Liste des Backup",)
        const updatedRow = {
          type: 1,
          components: [
            {
              type: 2,
              customId: 'previous_',
              label: '<<<',
              style: 1,
              disabled: page === 1
            },
            {
              type: 2,
              customId: 'suivant_',
              label: '>>>',
              style: 1,
              disabled: page === totalPages
            }
          ]
        };

        await button.update({ embeds: [updatedEmbed], components: [updatedRow] });
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          reply.edit({ components: [] });
        }
      });
    }


    if (module === "load") {
      const userBackups = await client.db.get(`backup`) || [];
      const backupCode = args[1];

      if (!backupCode) return message.reply({ content: "Merci de donner un nom d'une backup" });

      const selectedBackupIndex = userBackups.findIndex(backup => backup.name === backupCode);

      if (selectedBackupIndex === -1) {
        return message.channel.send({ content: `Le nom de backup invalide ou inexistant.` });
      }

      async function loadrow() {
        const dboption = await client.db.get(`loadbackup`) || {
          emojis: false,
          roles: true,
          bans: false,
          channels: true,
        };
        const rowbutton = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setStyle(1)
              .setDisabled(false)
              .setEmoji('⚡')
              .setCustomId('start'),
            new ButtonBuilder()
              .setStyle(1)
              .setDisabled(false)
              .setEmoji('❌')
              .setCustomId('stop')
          )
        const row = new ActionRowBuilder()
          .addComponents(

            new StringSelectMenuBuilder()
              .setCustomId('loaddd')
              .setMaxValues(4)
              .setMinValues(1)
              .setPlaceholder('Sélectionnez des options de backup...')
              .addOptions([
                {
                  label: "Load les rôles",
                  value: "load_roles",
                  emoji: "🎭",
                  default: dboption.roles ? dboption.roles : false
                },
                {
                  label: "Load les salons",
                  value: "load_channels",
                  emoji: "📚",
                  default: dboption.channels ? dboption.channels : false
                },
                {
                  label: "Load les bannissements",
                  value: "load_bans",
                  emoji: "☣",
                  default: dboption.bans ? dboption.bans : false
                },
                {
                  label: "Load les emojis",
                  value: "load_emojis",
                  emoji: "👀",
                  default: dboption.emojis ? dboption.emojis : false
                }
              ])
          );

        return {
          row,
          rowbutton
        }
      }
      async function loadembed() {
        const dboption = await client.db.get(`loadbackup`) || {
          emojis: false,
          roles: false,
          bans: false,
          channels: false,
        };
        const db = userBackups.find(backup => backup.name === backupCode);
        const backupPath = path.join(__dirname, `../../../backup/backup_${db.id}.json`);
        const backupObject = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
        const backupDate = new Date(db.date);
        const formattedDate = `${backupDate.getDate()}/${backupDate.getMonth() + 1}/${backupDate.getFullYear()}`;
        let channelCount = 0;
        backupObject.channels.categories.forEach(category => {
          category.children.forEach(channel => {
            if (channel.type === 0 || channel.type === 2) {
              channelCount++;
            }
          });
        });
        const rolesCount = backupObject.roles.length;
        const categoriesCount = backupObject.channels.categories.length;
        const optionsPreview = Object.entries(dboption)
          .filter(([key, value]) => value === true)
          .map(([key, value]) => {
            switch (key) {
              case "roles":
                return "Rôles";
              case "channels":
                return "Channels";
              case "bans":
                return "Bannies";
              case "emojis":
                return "Emojis";
              default:
                return "Aucune";
            }
          })
          .filter(Boolean)
          .join(" / ");
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setTitle("Chargement d'une backup")
          .setFooter(client.footer)
          .setDescription(`**__Chargement option__**\`\`\`js\n${optionsPreview || "Aucune"}\n\`\`\`\n**__Backup Infos__**\`\`\`js\nDate : ${formattedDate}\nChannels : ${channelCount || 0}\nCatégorie : ${categoriesCount || 0}\nRôles : ${rolesCount || 0}\`\`\``);
        return embed;
      }


      const messageOptions = {
        content: null,
        embeds: [await loadembed()],
        components: [(await loadrow()).row, (await loadrow()).rowbutton],
      };

      const messageSelect = await message.reply(messageOptions);


      const collector = messageSelect.createMessageComponentCollector();

      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({
            content: "Vous n'êtes pas autorisé à utiliser cette interaction.",
            flags: 64
          })
        }
        if (interaction.customId === 'stop') {
          interaction.message.delete()
        }
        if (interaction.customId === 'loaddd') {
          const selectedOptions = interaction.values;
          await client.db.set(`loadbackup`, {
            emojis: selectedOptions.includes("load_emojis"),
            roles: selectedOptions.includes("load_roles"),
            bans: selectedOptions.includes("load_bans"),
            channels: selectedOptions.includes("load_channels"),
          })

          await interaction.update({
            embeds: [await loadembed()],
            components: [(await loadrow()).row, (await loadrow()).rowbutton],
          });
        } if (interaction.customId === 'start') {
          const dboption = await client.db.get(`loadbackup`) || {
            emojis: false,
            roles: false,
            bans: false,
            channels: false,
          }
          const db = userBackups.find(backup => backup.name === backupCode);
          const backupPath = path.join(__dirname, `../../../backup/backup_${db.id}.json`);
          const backupJson = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
          const start = Date.now();
          message.author.send({
            embeds: [new EmbedBuilder().setColor((await client.db.get(`color_${message.guild.id}`) || client.config.color)).setDescription(`Votre backup est en cours de chargement. Merci de patienter.`).setFooter(client.footer)]
          }).catch(() => {})
          const backupData = await backup.load(backupJson, message.guild, {
            emojis: dboption.emojis,
            roles: dboption.roles,
            bans: dboption.bans,
            channels: dboption.channels,
            createdTimestamp: Date.now()
          });
          (await backupData)
          
          const stop = Date.now();
          const time = stop - start;
          const timeInSeconds = (time / 1000);
          const timeload = await client.functions.bot.formaTime(timeInSeconds)
          message.author.send({
            embeds: [new EmbedBuilder().setColor((await client.db.get(`color_${message.guild.id}`) || client.config.color)).setDescription(`Votre backup vient d'être chargée en **${timeload}**.`).setFooter(client.footer)]
          }).catch(() => {})
        }
      });
    }
  }
}


function generateUniqueID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const idLength = 16;
  let result = '';
  for (let i = 0; i < idLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}