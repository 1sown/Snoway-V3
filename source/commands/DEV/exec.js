const Discord = require('discord.js');
const Snoway = require('../../structures/client/index.js');
const { exec } = require('child_process');

module.exports = {
    name: "exec",
    description: "exec un code",
    /**
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: async (client, message, args) => {

        const code = args.join(' ');
        if(!code) return message.reply('Donne un code !')

        exec(code, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur: ${error}`);
                return message.channel.send(`Erreur: \`\`\`js\n${error.message}\`\`\``);
            }

            message.channel.send(`Réponse: \`\`\`js\n${stdout}\`\`\``);
            if (stderr) message.channel.send(`Erreur: \`\`\`js\n${stderr}\`\`\``);
        });
    }
};