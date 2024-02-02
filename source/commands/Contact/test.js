const Discord = require('discord.js');
const Snoway = require('../../structures/client/index.js');

module.exports = {
    name: 'sownnn',
    description: 'test pour sown',
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @returns 
     */
    async run(client, message, args) {
        if (!client.dev.includes(message.author.id)) return;

        const buttons = Array.from({ length: 25 }, (_, index) =>
        new Discord.ButtonBuilder()
            .setCustomId(`code_${index === 26 ? 0 : index + 1}`)
            .setLabel((index === 26 ? 0 : index + 1).toString())
            .setStyle(2)
            .setDisabled(true)
    );

    const groupbutton = [];
    while (buttons.length > 0) {
        groupbutton.push(buttons.splice(0, 5));
    }

    const rowNumber = groupbutton.map(group => new Discord.ActionRowBuilder().addComponents(...group));


    message.reply({
        components: [...rowNumber]
    })

    },
};


