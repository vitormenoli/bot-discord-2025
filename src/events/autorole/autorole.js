require("colors");

const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./database/data.json" });

module.exports = {
  name: "autorole",
  execute: (client) => {
    client.on("guildMemberAdd", (member) => {
      const autorole = db.get(`autorole_${member.guild.id}`);
      if (!autorole) return;

      const role = member.guild.roles.cache.get(autorole);
      if (!role) return;

      member.roles.add(role).catch(console.error);
    });
  },
};
