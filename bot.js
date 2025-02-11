const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();
const mongoose = require('mongoose');
const { load_translations, getTransation } = require('./utils/helper')
const mongoURI = process.env.MONGODB_TOKEN;

async function mongodbConnect() {
	try {
		await mongoose.connect(mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('Successfully connected to MongoDB');
	} catch (error) {
		console.error('MongoDB connection error:', error);
		process.exit(1);
	}
}

// Токен бота та ID
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID; // Ваш client ID
const guildId = process.env.GUILD_ID; // ID сервера (guild) для реєстрації команд

// Ініціалізація клієнта DiscordА
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	try {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
		console.log(`Successfully loaded event: ${event.name}`);
	} catch (error) {
		console.error(`Error loading event ${file}:`, error);
	}
}

async function start_bot(client, token, mongoURI) {
	try {
		await mongodbConnect();
		await client.login(token);
		console.log('Bot successfully started and logged in');
	} catch (error) {
		console.error('Error starting bot:', error);
		process.exit(1);
	}
}

process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});

start_bot(client, token, mongoURI)