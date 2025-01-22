const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags, Message } = require('discord.js');
const moment = require("moment");
require("moment-duration-format");
const { version } = require('discord.js');
const Guild = require('../../Schemas/guildSchema')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Відкриває налаштування вашої гільдії'),

    // Визначення execute з параметром client
    async execute(interaction) {
        try{
            const guildData = await Guild.findOne({_id: interaction.guild.id})
            // Перевіряємо, чи доступне uptime через переданий client
            if(interaction.guild.ownerId == interaction.member.id) {
                let role_names
                const support_server = await interaction.client.guilds.cache.get(process.env.SUPPORT_SERVER_ID)
                role_names = await format_whitelist(interaction)
                console.log(`Передано список ролей ` + role_names)
                if(!support_server && support_server==null) {
                    console.log('Не вдалось знайти сервер підтримки')
                }
                let userblocking;
                if(!guildData) {
                    console.log('Не знайдено налаштувань')
                    

                }
                console.log(guildData)
                const emoji_park = await get_emojis_for_message(support_server)
                if(guildData.userblocking==true) {
                    userblocking = 'Увімкнено'
                }else if(guildData.userblocking==false) {
                    userblocking ='Вимкнено'
                } 
                if(!guildData.logchannel && guildData.logchannel == null){guildData.logchannel="Немає"}
                if(!guildData.whitelist && guildData.whitelist == null){guildData.logchannel="Немає даних"}
                
                // Створюємо ембед
                const ExampleEmbed = new EmbedBuilder()

                .setColor(0x5e66ff)
                .setTitle(`${emoji_park.settings_emoji}Налаштування спільноти`)
                .setDescription('Ознайомтесь із командами та параметрами нижче.\n**Переглядати та змінювати налаштування може лише __власник серверу__.**')
                .addFields(
                    { name: `${emoji_park.logs_channel_emoji}Канал логів`, value: `<#${guildData.logchannel}>` || "не призначено", inline: true },
                    { name: `${emoji_park.whitelist_emoji}Білий список`, value: `${role_names}` || "Немає даних", inline: true },
                    { name: 'Блокування запрошень та користувачів', value: userblocking || "Вимкнено", inline: false },
                    // { name: 'Розробник', value: `Maksym_Tyvoniuk`, inline: false }
                )
                .setFooter({text: "Напишіть /setup для зміни налаштувань"})

        // Якщо вже є відповідь, редагуємо її

                await interaction.reply({ embeds: [ExampleEmbed], flags: MessageFlags.Ephemeral});
        
            } else {
                await interaction.reply({ content: 'У вас немає прав на використання цієї команди', flags: MessageFlags.Ephemeral})
                console.log('Немає прав власника серверу, неможна використовувати команду')
                return
            }
        }catch(error) {
            console.log('Помилка settings.js: '+error)
        }
        
        
    },
};

async function get_emojis_for_message(support_server) {
    try{
    return{
        settings_emoji: await support_server.emojis.cache.get('1266082934872604745'),
        logs_channel_emoji: await support_server.emojis.cache.get('1266073334030926008'),
        whitelist_emoji: await support_server.emojis.cache.get('1266073332152008704'),
    }
    }catch(error) {
        console.log('Не вдалось отримати емодзі get_emoji_for_message: '+ error)
        
    }
}

async function format_whitelist(interaction) {
    const GuildData = await Guild.findOne({ _id: interaction.guild.id})
    const rolesId = GuildData.whitelist
    const role_names = []
    console.log(`Айді ролей:` +rolesId)
    rolesId.forEach(roleId => {
        const role = interaction.guild.roles.cache.get(roleId);
        if (role) {
            console.log('Роль знайдено: ' + role.name);
            role_names.push(role.name); // додаємо назву ролі до списку
        } else {
            console.log('Роль з ID ' + roleId + ' не знайдена!');
        }
    });
    return role_names
}