const Discord = require('discord.js')
const Snoway = require('../../structures/client/index')
module.exports = {
    name: 'ratio',
    description: 'Ratio un membre',
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     */
    run: async (client, message, args) => {

       message.react('✅') 
       message.react('❌')
    }
}