async function getStatus() {
    const FiveM = require("fivem")
    const srv = new FiveM.Server('87.98.147.55:30134')

    srv.getServerStatus().then(data => {
        return data.online
    })
}
async function getPlayer() {
    const FiveM = require("fivem");
    const srv = new FiveM.Server('87.98.147.55:30134');

    try {
        const data = await srv.getPlayers();
        console.log(data);
        return {
            num: data
        };
    } catch (error) {
        console.error("Erreur:", error);
        return {
            error: "Une erreur s'est produite."
        };
    }
}


async function getPlayerMax() {
    const FiveM = require("fivem");
    const srv = new FiveM.Server('87.98.147.55:30134');

    try {
        const data = await srv.getMaxPlayers();
        console.log(data);
        return {
            max: data
        };
    } catch (error) {
        console.error("Erreur:", error);
        return {
            error: "Une erreur s'est produite."
        };
    }
}

module.exports = {
    getStatus,
    getPlayer,
    getPlayerMax,
}