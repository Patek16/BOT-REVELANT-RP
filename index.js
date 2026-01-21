const {
  Client,
  GatewayIntentBits,
  Events
} = require('discord.js');

const roles = require('./roles.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

function getStaffLevel(member) {
  if (member.roles.cache.has(roles.founder)) return 'Founder';
  if (member.roles.cache.has(roles.cofounder)) return 'Co-Founder';
  if (member.roles.cache.has(roles.admin)) return 'Admin';
  if (member.roles.cache.has(roles.moderator)) return 'Moderator';
  if (member.roles.cache.has(roles.helper)) return 'Helper';
  return null;
}

client.once(Events.ClientReady, () => {
  console.log('✅ Bot online – test ruoli staff');
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'menu') return;

  const staff = getStaffLevel(interaction.member);

  await interaction.reply({
    content: staff
      ? `🛠️ Sei riconosciuto come **${staff}**`
      : '👤 Sei un player normale',
    ephemeral: true
  });
});

client.login(process.env.TOKEN);
