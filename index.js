const TelegramApi = require('node-telegram-bot-api');
const token = 'TOKEN';

const bot = new TelegramApi(token, { polling: true });

const { keyboardREV, keyboardREP, keyboardSTART, keyboard, keyboardGOTOVO } = require('./options');

const sequelize = require('./db');
const UserModel = require('./models');

const photoPath = 'https://imgur.com/a/Sj6NKwY';
const jpgFOV_ONE = 'https://imgur.com/a/66BBvjb';
const jpgSens = 'https://imgur.com/a/Sm6I2Z3';
const jpgGyro = 'https://imgur.com/a/8ixJJcg';

const userStates = {};

const ADMIN_USER_ID = 1069237957;
const noteiammm_ID = 1254686047;
const note_uc_ID = 5855215558;



// Обработка команды /sendall
bot.onText(/\/sendall/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.from.id === ADMIN_USER_ID || msg.from.id === noteiammm_ID || msg.from.id === note_uc_ID ) {
      bot.sendMessage(chatId, 'Введите текст для рассылки:');
      bot.once('text', (message) => {
        sendToAllUsers(message.text);
        bot.sendMessage(chatId, 'Сообщение успешно отправлено всем пользователям.');
      });
    } else {
      bot.sendMessage(chatId, 'У вас нет доступа к этой команде.');
    }
  });
  
  // Функция для рассылки сообщения всем пользователям
  async function sendToAllUsers(message) {
    try {
      const users = await UserModel.findAll();
      for (const user of users) {
        await bot.sendMessage(user.chatId, message);
        console.log('Сообщение успешно отправлено пользователю:', user.chatId);
      }
    } catch (error) {
      console.error('Ошибка при рассылке сообщения:', error);
    }
  }
  
  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
  
    if (text === '/start') {
      userStates[chatId] = { step: 'startDialog' };
      await bot.sendMessage(chatId, 'Привет, этот бот поможет тебе настроить сенсу👀');
    }
  
    const state = userStates[chatId];
  
    if (state) {
      switch (state.step) {
        case 'startDialog':
            await sequelize.authenticate();
            await sequelize.sync();
            // Проверка наличия пользователя в базе данных
            const existingUser = await UserModel.findOne({ where: { chatId: chatId.toString() } });
            if (!existingUser) {
              await UserModel.create({ chatId });
            }
            await bot.sendMessage(chatId, 'Для начала подпишись на канал создателя: @noteiam', keyboardGOTOVO);
          break;
            
            case 'start':
                userStates[chatId].step = 'fov_third_person';
                // await bot.sendPhoto(chatId, jpgFOV)
                await bot.sendPhoto(chatId, photoPath, {caption: 'Введите ваш FOV от третьего лица'})

                break;

            case 'fov_third_person':
                if (isNaN(text)) {
                    await bot.sendMessage(chatId, 'Буквы не могут быть использованы в качестве FOV, введите действительное значение');
                } else if (text > 90 || text < 80) {
                    await bot.sendMessage(chatId, 'В FOV от третьего лица не может быть больше 90, но и меньше 80 не может быть, введите действительное значение');
                } else {
                    userStates[chatId].fov = parseFloat(text);
                    userStates[chatId].step = 'fov_first_person';
                    await bot.sendPhoto(chatId, jpgFOV_ONE, {caption: 'Введите ваш FOV от первого лица'})
                }
                break;

            case 'fov_first_person':
                if (isNaN(text)) {
                    await bot.sendMessage(chatId, 'Буквы не могут быть использованы в качестве FOV, введите действительное значение');
                } else if (text > 103 || text < 80) {
                    await bot.sendMessage(chatId, 'В FOV от первого лица не может быть больше 103, но и меньше 80 не может быть, введите действительное значение');
                } else {
                    userStates[chatId].fovOne = parseFloat(text);
                    userStates[chatId].step = 'sensitivity_finger';
                    await bot.sendPhoto(chatId, jpgSens, {caption: 'Введите вашу чувствительность на коллиматоре при наводке пальцем'})
                }
                break;

            case 'sensitivity_finger':
                if (isNaN(text)) {
                    await bot.sendMessage(chatId, 'Буквы не могут быть использованы в качестве чувствительность, введите действительное значение');
                } else if (text > 300 || text < 1) {
                    await bot.sendMessage(chatId, 'Чувствительность на коллиматоре при наводке пальцем может быть только в пределах от 1 до 300, введите действительное значение');
                } else {
                    userStates[chatId].sensitivity = parseFloat(text);
                    userStates[chatId].step = 'sensitivity_gyro';
                    await bot.sendPhoto(chatId, jpgGyro, {caption: 'Введите вашу чувствительность гироскопа для коллиматора'}) //
                }
                break;

            case 'sensitivity_gyro':
                if (isNaN(text)) {
                    await bot.sendMessage(chatId, 'Буквы не могут быть использованы в качестве чувствительность, введите действительное значение');
                } else if (text > 400 || text < 1) {
                    await bot.sendMessage(chatId, 'Чувствительность гироскопа для коллиматора может быть только в пределах от 1 до 400, введите действительное значение');
                } else{
                    
                    
                    userStates[chatId].sensitivityGyro = parseFloat(text);
                    userStates[chatId].step = 'completed';
                    const userData = userStates[chatId];
                    if (userData) {
                        const { fov, fovOne, sensitivity, sensitivityGyro } = userData;        
                    await bot.sendMessage(chatId,  'Отлично, мы ввели все данные, давай их проверим:' +
                    '\n' + '\n' + 'Ваш FOV от третьего лица в игре = ' + fov + 
                    '\n' + '\n' + 'Ваш FOV от первого лица в игре = ' + fovOne + 
                    '\n' + '\n' + 'Ваша чуствительность калиматора на пальце = ' + sensitivity + 
                    '\n' + '\n' + 'Ваша чуствительность калиматора на гироскопе = ' + sensitivityGyro +
                    '\n' + '\n' + 'Все верно?', keyboard)
                    }
                }
                break;

            case 'completed':
                if (text === '/QWERTY') {

                }
                break;

            default:
                await bot.sendMessage(chatId, 'Что-то пошло не так. Пожалуйста, начнем сначала.');
                delete userStates[chatId];
                break;
        }
    }
});





bot.on('callback_query', async msg => {   // Обработчик для кнопок
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === '/NOOO' || data === '/repeat' && userStates[chatId] && userStates[chatId].step === 'completed') {
        userStates[chatId] = { step: 'fov_third_person' };
        await bot.sendMessage(chatId, 'Мишь, давай по новой');
        await bot.sendPhoto(chatId, photoPath, {caption: 'Введите ваш FOV от третьего лица'});
    } else if (data === '/QWERTY' && userStates[chatId] && userStates[chatId].step === 'completed') {
        const userData = userStates[chatId];
        if (userData) {
            const { fov, fovOne, sensitivity, sensitivityGyro } = userData;
            let Gyro_After_Exiting_Scope = 0.42268041237;
            let Medium_FOV_Collimator = 54.966;
            const Aim_Multipliers = [1, 0.76152530655, 0.48238911327, 0.36278790525, 0.29563730306, 0.24764399811];
            let Multiplication_For_The_Camera = Aim_Multipliers.map((multiplier) => Math.round(multiplier * sensitivity)); // выводим пользователю
            let Multiplication_For_The_Camera_Gyro = Aim_Multipliers.map((multiplier) => Math.round(multiplier * sensitivityGyro)); // выводим пользователю
            let Gyroscope_In_Tpp = Math.round(fov / Medium_FOV_Collimator * sensitivityGyro * Gyro_After_Exiting_Scope) // выводим пользователю
            let Gyroscope_In_Fpp = Math.round(fovOne / Medium_FOV_Collimator * sensitivityGyro * Gyro_After_Exiting_Scope) // выводим пользователю
            let Scope_In_Tpp = Math.round(fov / Medium_FOV_Collimator * sensitivity) // выводим пользователю
            let Scope_In_Tpp_Min = Math.min(Scope_In_Tpp, 300) // выводим пользователю
            let Scope_In_Fpp = Math.round(fovOne / Medium_FOV_Collimator * sensitivity) // выводим пользователю
            let Scope_In_Fpp_Min = Math.min(Scope_In_Fpp, 300); // выводим пользователю
            await bot.sendMessage(chatId,  'Вот твои значения')
            await bot.sendMessage(chatId,  'Значения чувствительности на наводку пальцем' +  
            '\n' + '\n' + 'Камера третьего лица = ' + Scope_In_Tpp_Min +  
            '\n' + 'Камера первого лица = ' + Scope_In_Fpp_Min + 
            '\n' + 'Калиматор = ' + Multiplication_For_The_Camera[0] + 
            '\n' + '2x = ' + Multiplication_For_The_Camera[1] +
            '\n' + '3x = ' + Multiplication_For_The_Camera[2] +
            '\n' + '4x = ' + Multiplication_For_The_Camera[3] +
            '\n' + '6x = ' + Multiplication_For_The_Camera[4] +
            '\n' + '8x = ' + Multiplication_For_The_Camera[5])


            await bot.sendMessage(chatId,  'Значения чувствительности гироскопа' +  
            '\n' + '\n' + 'Камера третьего лица = ' + Gyroscope_In_Tpp +  
            '\n' + 'Камера первого лица = ' + Gyroscope_In_Fpp + 
            '\n' + 'Калиматор = ' + Multiplication_For_The_Camera_Gyro[0] + 
            '\n' + '2x = ' + Multiplication_For_The_Camera_Gyro[1] +
            '\n' + '3x = ' + Multiplication_For_The_Camera_Gyro[2] +
            '\n' + '4x = ' + Multiplication_For_The_Camera_Gyro[3] +
            '\n' + '6x = ' + Multiplication_For_The_Camera_Gyro[4] +
            '\n' + '8x = ' + Multiplication_For_The_Camera_Gyro[5], keyboardREV)

            await bot.sendMessage(chatId, 'Приятного использования👀✌️' + 
            '\n' + '\n' + 'Рекомендуем сначала попробовать всё в полигоне.' +              
            '\n' + '\n' + 'Магазин UC от создателей бота: @UCyNOTE !')
        }              
        
    } else {
        if (data === '/GOTOVO') {
            const chatMember = await bot.getChatMember('@noteiam', chatId);
    
            if (chatMember && ['member', 'administrator', 'creator'].includes(chatMember.status)) {
                userStates[chatId] = { step: 'fov_third_person' };
                await bot.sendMessage(chatId, 'Теперь ты подписан на канал. Давай начнем настройку!');
    
            
                await bot.sendPhoto(chatId, photoPath, {caption: 'Введите ваш FOV от третьего лица'});  
            } else {
                await bot.sendMessage(chatId, 'Подпишитесь на канал, чтобы начать настройку.', keyboardGOTOVO);       
            }
        } 
    }  
});











