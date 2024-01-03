const { EmbedBuilder } = require('discord.js');
const util = require('util');
const Snoway = require('../../structures/client/index.js');

module.exports = {
    name: 'eval',
    description: 'Évalue du code JavaScript',
    /**
     * 
     * @param {Snoway} client 
     * @param {*} message 
     * @param {*} args 
     * @returns 
     */
    async run(client, message, args) {
        if (!client.dev.includes(message.author.id)) return;

        const code = args.join(' ');
        if(!code) return message.reply('Merci de donner un code a eval !')
        try {
            let evaled = await eval(code);

            if (typeof evaled !== 'string') {
                evaled = require('util').inspect(evaled);
            }
            
            message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Évaluation réussie')
                        .addFields({name: 'Entrée 📥', value: `\`\`\`javascript\n${code}\n\`\`\``})
                        .addFields({name:'Sortie 📤', value: `\`\`\`javascript\n${clean(evaled)}\n\`\`\``})
                        .setColor(client.color)
                ]
            });
        } catch (err) {
            message.channel.send("Erreur")
        }
    },
};

function clean(text) {
    if (typeof text === 'string') {
        return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    }
    return text;
}
