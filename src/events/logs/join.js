require("colors");

const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./database/data.json" });

const Discord = require("discord.js");

module.exports = {
  name: "join",
  execute: (client) => {
    client.on("guildMemberAdd", (member) => {
      const channelId = db.get(`logs_entrada_${member.guild.id}`);
      if (!channelId) return;

      const channel = member.guild.channels.cache.get(channelId);
      if (!channel) return;

      const embed = new Discord.EmbedBuilder()
        .setTitle(`Bem Vindo ${member.user.username}!`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `- 👋 Bem-vindo(a) ao servidor, ${member}!\n  - Esperamos que você tenha uma ótima experiência aqui.\n  - Membro número \`${member.guild.memberCount}\`!`
        )
        .setColor("Green");

      channel.send({ embeds: [embed] });
    });
  },
};
