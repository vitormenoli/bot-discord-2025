const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./Databases/data.json" });

const Discord = require("discord.js");
const cor = require("../../config").discord.color;

module.exports = {
  name: "set_autorole",
  description: "Define o cargo automático para novos membros.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "cargo",
      description: "O cargo a ser atribuído a novos membros.",
      type: Discord.ApplicationCommandOptionType.Role,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.ManageRoles
      )
    ) {
      return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    const role = interaction.options.getRole("cargo");

    if (!role) {
      let autorole = db.get(`autorole_${interaction.guild.id}`);

      if (!autorole) {
        autorole = "`Não definido`";
      } else {
        autorole = `<@&${autorole}>`;
      }

      const embed = new Discord.EmbedBuilder()
        .setColor(cor)
        .setTitle("Cargo Automático Atual")
        .setDescription(
          `✅ O cargo automático para novos membros é ${autorole}.`
        );

      return interaction.reply({ embeds: [embed] });
    }

    const embed = new Discord.EmbedBuilder()
      .setColor(cor)
      .setTitle("Cargo Automático Definido")
      .setDescription(
        `✅ O cargo automático para novos membros foi definido para ${role}.`
      );

    db.set(`autorole_${interaction.guild.id}`, role.id);

    return interaction.reply({ embeds: [embed] });
  },
};
