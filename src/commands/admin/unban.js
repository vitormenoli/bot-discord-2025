const Discord = require("discord.js");
const cor = require("../../config").discord.color;

module.exports = {
  name: "unban",
  description: "Desbane um membro do servidor.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "membro",
      description: "membro que será desbanido.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "motivo",
      description: "Motivo do desbanimento.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.BanMembers
      )
    ) {
      return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    const member = interaction.options.getUser("membro");
    const motivo = interaction.options.getString("motivo") || "Não informado";

    const buttons = {
      confirm: new Discord.ButtonBuilder()
        .setCustomId("confirm_unban")
        .setLabel("Confirmar")
        .setStyle(Discord.ButtonStyle.Success),
      cancel: new Discord.ButtonBuilder()
        .setCustomId("cancel_unban")
        .setLabel("Cancelar")
        .setStyle(Discord.ButtonStyle.Danger),
    };

    const row = new Discord.ActionRowBuilder().addComponents([
      buttons.confirm,
      buttons.cancel,
    ]);

    const embed = new Discord.EmbedBuilder()
      .setColor(cor)
      .setTitle("Confirmação de Desbanimento")
      .setDescription(
        `> 🔎 Você tem certeza que deseja desbanir **${member.username}** do servidor?\n\n> 📔 **Motivo:** ${motivo}`
      );

    const msg = await interaction.reply({ embeds: [embed], components: [row] });

    const filter = (i) =>
      i.user.id === interaction.user.id &&
      (i.customId === "confirm_unban" || i.customId === "cancel_unban");

    const collector = msg.createMessageComponentCollector({
      filter,
      time: 15_000,
      max: 1,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();

      const embed = new Discord.EmbedBuilder().setColor(cor);

      if (i.customId === "confirm_unban") {
        try {
          await interaction.guild.members.unban(member.id, motivo);

          embed
            .setTitle("Desbanimento Confirmado")
            .setDescription(
              `> ✅ O usuário **${member.username}** foi desbanido com sucesso!\n\n> 📔 **Motivo:** ${motivo}`
            );

          interaction.editReply({ embeds: [embed], components: [] });
        } catch (error) {
          embed
            .setColor("Red")
            .setTitle("Erro ao Desbanir Usuário")
            .setDescription(
              `❌ Não foi possível desbanir o usuário **${member.username}**. Verifique minha permissão e a hierarquia de cargos.`
            );
          interaction.editReply({ embeds: [embed], components: [] });
        }
      } else {
        embed
          .setColor("Red")
          .setTitle("Desbanimento Cancelado")
          .setDescription(
            `> ❌ O desbanimento do usuário **${member.username}** foi cancelado.`
          );
        interaction.editReply({ embeds: [embed], components: [] });
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        const embed = new Discord.EmbedBuilder()
          .setColor("Orange")
          .setTitle("Tempo Esgotado")
          .setDescription("⏰ O tempo para confirmar o desbanimento expirou.");
        interaction.editReply({ embeds: [embed], components: [] });
      }
    });
  },
};
