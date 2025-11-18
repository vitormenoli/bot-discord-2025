const Discord = require("discord.js");
const cor = require("../../config").discord.color;

module.exports = {
  name: "kick",
  description: "Expulsa um membro do servidor.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "membro",
      description: "membro que será expulso.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "motivo",
      description: "Motivo da expulsão.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.KickMembers
      )
    ) {
      return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser("membro");
    const member = interaction.guild.members.cache.get(user.id);
    const motivo = interaction.options.getString("motivo") || "Não informado";

    const buttons = {
      confirm: new Discord.ButtonBuilder()
        .setCustomId("confirm_kick")
        .setLabel("Confirmar")
        .setStyle(Discord.ButtonStyle.Success),
      cancel: new Discord.ButtonBuilder()
        .setCustomId("cancel_kick")
        .setLabel("Cancelar")
        .setStyle(Discord.ButtonStyle.Danger),
    };

    const row = new Discord.ActionRowBuilder().addComponents([
      buttons.confirm,
      buttons.cancel,
    ]);

    if (!member)
      return interaction.reply({
        content: "❌ Membro não encontrado no servidor.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    if (member.user.id === interaction.user.id)
      return interaction.reply({
        content: "❌ Você não pode se expulsar.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    if (member.user.id === client.user.id)
      return interaction.reply({
        content: "❌ Você não pode me expulsar.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    if (!member.kickable)
      return interaction.reply({
        content:
          "❌ Não posso expulsar este membro. Verifique minha permissão e a hierarquia de cargos.",
        flags: Discord.MessageFlags.Ephemeral,
      });

    const embed = new Discord.EmbedBuilder()
      .setColor(cor)
      .setTitle("Confirmação de Expulsão")
      .setDescription(
        `> 🔎 Você tem certeza que deseja expulsar ${member} do servidor?\n\n> 📔 **Motivo:** ${motivo}`
      );

    const msg = await interaction.reply({ embeds: [embed], components: [row] });

    const filter = (i) =>
      i.user.id === interaction.user.id &&
      (i.customId === "confirm_kick" || i.customId === "cancel_kick");

    const collector = msg.createMessageComponentCollector({
      filter,
      time: 15_000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();

      const embed = new Discord.EmbedBuilder().setColor(cor);

      if (i.customId === "confirm_kick") {
        try {
          await member.kick(motivo);

          embed
            .setTitle("Expulsão Confirmada")
            .setDescription(
              `> ✅ O membro ${member} foi expulso com sucesso!\n\n> 📔 **Motivo:** ${motivo}`
            );

          interaction.editReply({ embeds: [embed], components: [] });
        } catch (error) {
          embed
            .setColor("Red")
            .setTitle("Erro ao Expulsar Membro")
            .setDescription(
              `❌ Não foi possível expulsar o membro ${member}. Verifique minha permissão e a hierarquia de cargos.`
            );
          interaction.editReply({ embeds: [embed], components: [] });
        }
      } else {
        embed
          .setColor("Red")
          .setTitle("Expulsão Cancelada")
          .setDescription(`> ❌ A expulsão do membro ${member} foi cancelada.`);
        interaction.editReply({ embeds: [embed], components: [] });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        const embed = new Discord.EmbedBuilder()
          .setColor("Orange")
          .setTitle("Tempo Esgotado")
          .setDescription("⏰ O tempo para confirmar a expulsão expirou.");
        interaction.editReply({ embeds: [embed], components: [] });
      }
    });
  },
};
