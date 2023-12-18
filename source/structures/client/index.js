const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const fs = require("fs");
const version = require('../../../version')
const { QuickDB } = require("quick.db")
const db = new QuickDB();
module.exports = class Snoway extends Client {
  constructor(
    options = {
      intents: [3276799],
      partials: [
        1, 2, 5, 3,
        4, 6, 0
      ]
    }
  ) {
    super(options);
    this.setMaxListeners(0);

    this.commands = new Collection();
    this.aliases = new Collection();
    this.slashCommands = new Collection();
    this.invite = new Map();
    this.snipeMap = new Map();

    this.functions = require('./Function/index')
    this.config = require('../../../config/config');

    this.support = 'https://discord.gg/Snoway'
    this.footer = { "text": "Snoway © 2023"}
    this.dev = ["798973949189947459","1171205236799582289", "233657223190937601"]

    this.version = version.version;
    this.db = db
    this.api = this.functions.api

    this.initCommands();
    this.initEvents();
    this.connectToToken();
    
  }
          

  async connectToToken() {
    this.login(this.config.token).catch(async (err) => {
      console.log(err)
    })
  }


  initCommands() {
    const subFolders = fs.readdirSync("./source/commands");
    for (const category of subFolders) {
      const commandsFiles = fs
        .readdirSync(`./source/commands/${category}`)
        .filter((file) => file.endsWith(".js"));
      for (const commandFile of commandsFiles) {
        const command = require(`../../commands/${category}/${commandFile}`);
        command.category = category;
        command.commandFile = commandFile;
        console.log(`Commande charger : ${command.name}`);
        this.commands.set(command.name, command);
        if (command.aliases && command.aliases.length > 0) {
          command.aliases.forEach((alias) => this.aliases.set(alias, command));
        }
      }
    }
    let finale = new Collection();
    this.commands.map((cmd) => {
      if (finale.has(cmd.name)) return;
      finale.set(cmd.name, cmd);
      this.commands
        .filter((v) => v.name.startsWith(cmd.name) || v.name.endsWith(cmd.name))
        .map((cm) => finale.set(cm.name, cm));
    });
    this.commands = finale;
  }

  initEvents() {
    const subFolders = fs.readdirSync(`./source/events`);
    for (const category of subFolders) {
      const eventsFiles = fs
        .readdirSync(`./source/events/${category}`)
        .filter((file) => file.endsWith(".js"));
      for (const eventFile of eventsFiles) {
        const event = require(`../../events/${category}/${eventFile}`);
        this.on(event.name, (...args) => event.run(this, ...args));
        if (category === "anticrash")
          process.on(event.name, (...args) => event.run(this, ...args));
        console.log(`EVENT charger : ${eventFile}`);
      }
    }
  }
};
