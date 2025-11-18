const Discord = require("discord.js");
const cor = require("../../config").discord.color;

module.exports = {
  name: "clear",
  description: "Limpa o chat atual.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "quantidade",
      description: "Quantidade de mensagens a serem limpas (1-100).",
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.ManageMessages
      )
    ) {
      return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    const number = interaction.options.getInteger("quantidade");

    const embed = new Discord.EmbedBuilder().setColor(cor);

    if (number < 1 || number > 100) {
      embed.setColor("Red");
      embed.setDescription(`❌ A quantidade deve estar entre 1 e 100.`);

      return interaction.reply({
        embeds: [embed],
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    interaction.channel
      .bulkDelete(number, true)
      .then((deletedMessages) => {
        embed.setDescription(
          `🧹 Limpei \`${deletedMessages.size}\` mensagens do chat.`
        );
        interaction.reply({ embeds: [embed] });
      })
      .catch((err) => {
        console.error("Erro ao limpar mensagens: ", err);
        embed.setColor("Red");
        embed.setDescription(
          `❌ Não foi possível limpar as mensagens neste canal.`
        );
        interaction.reply({
          embeds: [embed],
          flags: Discord.MessageFlags.Ephemeral,
        });
      });
  },
};
