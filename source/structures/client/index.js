const { Client, Collection } = require("discord.js");
const fs = require("fs");
const version = require('../../../version')
const { QuickDB } = require("quick.db")
const db = new QuickDB();
const { Player } = require('discord-player');
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
    this.invite = new Map();
    this.snipeMap = new Map();
    this.player = Player.singleton(this);
    this.player.extractors.loadDefault();

    this.functions = require('../Functions/index')
    this.config = require('../../../config/config');

    this.support = 'https://discord.gg/Snoway'
    this.footer = { text: "Snoway © 2023" }
    this.dev = ["798973949189947459", "233657223190937601", "880376950647054397"]

    this.version = version;
    this.db = db
    this.api = this.functions.api

    this.CommandLoad();
    this.EventLoad();
    this.connect()
  }
  connect() {
    return super.login(this.config.token).catch(async (err) => {
      console.log(err)
    });
  };


  CommandLoad() {
    const subFolders = fs.readdirSync("./source/commands");
    let finale = new Collection();
    for (const category of subFolders) {
      const commandsFiles = fs
        .readdirSync(`./source/commands/${category}`)
        .filter((file) => file.endsWith(".js"));

      for (const commandFile of commandsFiles) {
        const command = require(`../../commands/${category}/${commandFile}`);
        command.category = category;
        command.commandFile = commandFile;

        console.log(`Commande chargée : ${command.name}`);
        if (!finale.has(command.name)) {
          finale.set(command.name, command);
        }

        if (command.aliases && command.aliases.length > 0) {
          command.aliases.forEach((alias) => {
            if (!finale.has(alias)) {
              finale.set(alias, command);
            }
          });
        }
      }
    }
    this.commands = finale;
  }


  EventLoad() {
    const subFolders = fs.readdirSync('./source/events');

    for (const category of subFolders) {
      const eventsFiles = fs
        .readdirSync(`./source/events/${category}`)
        .filter((file) => file.endsWith('.js'));

      for (const eventFile of eventsFiles) {
        const event = require(`../../events/${category}/${eventFile}`);

        const eventHandler = (...args) => event.run(this, ...args);
        this.on(event.name, eventHandler);
        if (category === 'anticrash') {
          process.on(event.name, eventHandler);
        }

        console.log(`EVENT chargé : ${eventFile}`);
      }
    }
  }

};
