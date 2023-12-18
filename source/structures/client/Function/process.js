async function refresh() {
    delete this.config;
    delete require.cache[require.resolve("../../../../config/config")];
    this.config = require("../../../../config/config");
  }


  module.exports = {
    refresh,
  }