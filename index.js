require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config/entrata.json', 'utf8'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

client.once('ready', async () => {
  console.log(`✅ Bot online come ${client.user.tag}`);

  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) return console.log('❌ Server non trovato');

  const channel = guild.channels.cache.get(config.verifyChannelId);
  if (!channel) return console.log('❌ Canale verifica non trovato');

  const embed = new EmbedBuilder()
    .setTitle(config.embed.title)
    .setDescription(config.embed.description)
    .setColor(config.embed.color);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('verify_button')
      .setLabel(config.button.label)
      .setStyle(ButtonStyle.Success)
  );

  await channel.bulkDelete(10).catch(() => {});
  channel.send({ embeds: [embed], components: [row] });
});

client.on('guildMemberAdd', async member => {
  try {
    await member.roles.add(config.verifyRoleId);
  } catch (err) {
    console.log('Errore ruolo verifica');
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verify_button') {
    try {
      await interaction.member.roles.remove(config.verifyRoleId);
      await interaction.member.roles.add(config.memberRoleId);

      await interaction.reply({
        content: '✅ **Verifica completata!** Benvenuto nel server.',
        ephemeral: true
      });
    } catch (err) {
      await interaction.reply({
        content: '❌ Errore durante la verifica.',
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
