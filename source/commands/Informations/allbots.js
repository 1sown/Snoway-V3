const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'allbots',
  description: {
    fr: "Liste tous les bots sur le serveur",
    en: "Lists all bots on the server"
},
  run: async (client, message, args, commandName) => {

const botMembers = message.guild.members.cache.filter((member) => member.user.bot);
if (!botMembers.size) return message.reply('Aucun bot trouvé sur ce serveur.');

const PAGE_SIZE = 10;
const pageCount = Math.ceil(botMembers.size / PAGE_SIZE);
let currentPage = 1;
const msg = await message.reply(`Recherche en cours...`);

const sendBotList = async () => {
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const botList = botMembers
    .map((member) => `[\`${member.user.tag}\`](https://discord.com/users/${member.user.id}) | (\`${member.user.id}\`)`)
    .slice(start, end)
    .join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`Liste des bots`)
    .setDescription(botList)
    .setColor(client.color)
    .setFooter({ text: `Page ${currentPage}/${pageCount}\n${message.guild.name}` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`avant_${message.id}`)
      .setLabel('<<<')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 1),
    new ButtonBuilder()
      .setCustomId(`suivant_${message.id}`)
      .setLabel('>>>')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === pageCount)
  );

  await msg.edit({
    embeds: [embed],
    content: null,
    components: [row],
  });
};

await sendBotList();

const collector = msg.createMessageComponentCollector({
  componentType: ComponentType.Button,
  time: 60000,
});

collector.on('collect', async (button) => {
  if(button.user.id !== message.author.id) {
    return button.reply({
        content: "Vous n'êtes pas autorisé à utiliser cette interaction.",
        flags: 64
    })
}
  if (button.customId === `avant_${message.id}` && currentPage > 1) {
    currentPage--;
    button.deferUpdate()
    
  } else if (button.customId === `suivant_${message.id}` && currentPage < pageCount) {
    currentPage++;
    button.deferUpdate()
  }


  await sendBotList();
});

collector.on('end', () => {
  msg.edit({ components: [] });
});
},
};