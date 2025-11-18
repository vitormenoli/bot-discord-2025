const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./database/data.json" });

const Discord = require("discord.js");
const cor = require("../../config").discord.color;

module.exports = {
  name: "set_logs",
  description: "Define um canal para logs.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "ver_canais",
      description: "Ver canais configurados para logs.",
      type: Discord.ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "entrada",
      description: "Canal para logs de entrada de membros.",
      type: Discord.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "canal",
          description: "Canal onde os logs de entrada serão enviados.",
          type: Discord.ApplicationCommandOptionType.Channel,
          required: true,
          channelTypes: [Discord.ChannelType.GuildText],
        },
      ],
    },
    {
      name: "saida",
      description: "Canal para logs de saída de membros.",
      type: Discord.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "canal",
          description: "Canal onde os logs de saída serão enviados.",
          type: Discord.ApplicationCommandOptionType.Channel,
          required: true,
          channelTypes: [Discord.ChannelType.GuildText],
        },
      ],
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.ManageChannels
      )
    ) {
      return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "ver_canais") {
      const entradaChannel =
        interaction.guild.channels.cache.get(
          db.get(`logs_entrada_${interaction.guild.id}`)
        ) || "`Nenhum canal configurado`";
      const saidaChannel =
        interaction.guild.channels.cache.get(
          db.get(`logs_saida_${interaction.guild.id}`)
        ) || "`Nenhum canal configurado`";

      const embed = new Discord.EmbedBuilder()
        .setTitle("Canais de Logs Configurados")
        .setDescription(
          `- Veja os canais de logs configurados abaixo:\n  - Entrada: ${entradaChannel}\n  - Saída: ${saidaChannel}`
        )
        .setColor(cor);

      return interaction.reply({ embeds: [embed] });
    }

    if (subcommand === "entrada") {
      const channel = interaction.options.getChannel("canal");
      db.set(`logs_entrada_${interaction.guild.id}`, channel.id);

      const embed = new Discord.EmbedBuilder()
        .setTitle("Canal Configurado")
        .setDescription(
          `> ✅ O canal ${channel} foi configurado com sucesso para logs de entrada.`
        )
        .setColor("Green");

      return interaction.reply({ embeds: [embed] });
    }
    if (subcommand === "saida") {
      const channel = interaction.options.getChannel("canal");
      db.set(`logs_saida_${interaction.guild.id}`, channel.id);

      const embed = new Discord.EmbedBuilder()
        .setTitle("Canal Configurado")
        .setDescription(
          `> ✅ O canal ${channel} foi configurado com sucesso para logs de saída.`
        )
        .setColor("Green");

      return interaction.reply({ embeds: [embed] });
    }
  },
};
