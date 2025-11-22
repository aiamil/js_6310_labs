// node-telegram-bot-api - это популярная библиотека Node.js, которая предоставляет удобный интерфейс для взаимодействия с Telegram Bot API
import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv' // Это безопасный способ хранения конфиденциальных данных (токенов, ключей API и т.д.)
import fs from 'fs'; // Импорт модуля файловой системы Node.js :fs (File System) предоставляет API для работы с файлами и директориями:
import path from 'path'; // Импорт модуля для работы с путями к файлам

// Загружаем шаблоны
const templates = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'templates.json'), 'utf8'));

// Хранилище для временных данных пользователей
export const userSessions = new Map();
export const expenseHistory = new Map();

export const runServer = () => {
  dotenv.config();
  const token = process.env.TELEGRAM_BOT_TOKEN;

  // Создаем экземпляр бота
  const bot = new TelegramBot(token, { polling: true });

  // Настраиваем команды
  setupCreate_adCommand(bot);
  setupBudgetCommand(bot);

  // Настраиваем обработку callback запросов для каталога
  handleCatalogCallbacks(bot);

  // Настраиваем обработку текстовых ответов для вопросов
  handleTextResponses(bot);

  // Обрабатываем команду /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeText = `<b>👋 Привет! Я помощник Sadyr Studio.</b>\n\nЯ --- ваш цифровой помощник для создания эффективной рекламы. Готов помочь вам сгенерировать креативные тексты и рассчитать бюджет.\n\n<i>Выберите команду:</i>\n\n/create_ad --- создать объявление (шаблоны,генерация,проверка правилам)\n\n/budget --- бюджет и управление расходами`;

    bot.sendMessage(chatId, welcomeText, {
      parse_mode: 'HTML'
    });
  });

  console.log('🤖 Бот запущен и готов к работе...');
}

// Обработка текстовых ответов пользователя
export function handleTextResponses(bot) {
  bot.on('message', (msg) => {
    const chatId = msg.chat.id; // Исправлено: chat.id (было chaitd)
    const text = msg.text;

    // Пропускаем команды
    if (text.startsWith('/')) return; // Исправлено: startsWith (было startswith)

    const session = userSessions.get(chatId); // Исправлено: chatId (было chaitd)

    if (session && session.waitingForAnswer) {
      if (session.waitingForTextCheck) {
        // Обработка текста для проверки
        checkTextForRules(bot, chatId, text); // Исправлено: checkTextForRules (было checkTextFormules)
        session.waitingForTextCheck = false;
      } else if (session.questionType === 'budget' || session.questionType === 'expense_control') {
        // Обработка ответов для бюджета И контроля расходов
        handleBudgetAnswer(bot, chatId, text, session); // Исправлено: chatId
      } else {
        // Обработка ответов для создания объявления
        handleUserAnswer(bot, chatId, text, session); // Исправлено: chatId
      }
    }
  });
}
// Обработка ответа пользователя на вопрос
export function handleUserAnswer(bot, chatId, answer, session) {
  // Сначала проверяем существование session и waitingForAnswer
  if (!session || !session.waitingForAnswer) {
    return; // Не обрабатываем ответ если сессии нет или она не ждет ответа
  }

  const currentQuestionIndex = session.currentQuestionIndex;
  const questions = templates.questions.platformQuestions;

  if (currentQuestionIndex < questions.length) {
    const currentQuestion = questions[currentQuestionIndex];

    // Сохраняем ответ
    session.answers[currentQuestion.key] = answer;
    session.currentQuestionIndex++;

    // Если есть следующий вопрос - задаем его
    if (session.currentQuestionIndex < questions.length) {
      const nextQuestion = questions[session.currentQuestionIndex];
      bot.sendMessage(chatId, nextQuestion.text);
    } else {
      // Все вопросы отвечены - показываем меню с кнопками
      session.waitingForAnswer = false;
      session.hasCompletedQuestions = true;
      showCreateAd(bot, chatId, session.answers);
    }
  }
}
// Запуск процесса вопросов
export function startPlatformQuestions(bot, chatId) {
  const questions = templates.questions.platformQuestions;

  userSessions.set(chatId, {
    waitingForAnswer: true,
    currentQuestionIndex: 0,
    answers: {},
    questionType: 'platform',
    hasCompletedQuestions: false
  });

  const firstQuestion = questions[0];
  bot.sendMessage(chatId, `📝 Давайте создадим эффективное объявление! Ответьте на несколько вопросов:\n\n${firstQuestion.text}`);
}

// Показ меню после ответов на вопросы
export function showCreateAd(bot, chatId, answers) {
  const summary = `
✅ <b>Отлично! Вот что мы узнали о вашем бизнесе:</b>

<b>Продукт:</b> ${answers.product}
<b>Описание:</b> ${answers.one_line}
<b>Аудитория:</b> ${answers.audience}
<b>Преимущество:</b> ${answers.benefit}
<b>Призыв к действию:</b> ${answers.cta}
<b>Цель кампании:</b> ${answers.goal}

Теперь выберите, что хотите сделать:
  `;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '📝 Сгенерировать текст объявления',
          callback_data: 'generate_text_after_questions'
        }],
        [{
          text: '⭐ Шаблоны для площадок',
          callback_data: 'platform_templates_after_questions'
        }],
        [{
          text: '⚡ Проверка соответствия правилам',
          callback_data: 'rules_check_after_questions'
        }],
        [{
          text: '🔄 Обновить данные',
          callback_data: 'update_business_data'
        }],
        [{
          text: '↩️ Главное меню',
          callback_data: 'back_to_main_menu'
        }]
      ]
    }
  };

  bot.sendMessage(chatId, summary, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция для обработки команды /create_ad
export function setupCreate_adCommand(bot) {
  bot.onText(/\/create_ad/, (msg) => {
    const chatId = msg.chat.id;
    // Сразу начинаем вопросы
    startPlatformQuestions(bot, chatId);
  });
};

// Показ выбора стиля сообщения
export function showStyleSelection(bot, chatId) {
  const session = userSessions.get(chatId);

  let reminderText = '';
  if (session && session.answers) {
    reminderText = `\n\n📊 <b>Ваши текущие данные:</b>\nПродукт: ${session.answers.product}\nАудитория: ${session.answers.audience}\nПреимущество: ${session.answers.benefit}`;
  }

  const message = `
🎨 <b>Выберите стиль сообщения:</b>

<b>Creative</b> - креативный и вдохновляющий стиль
<b>Formal</b> - формальный и профессиональный стиль  
<b>Playful</b> - игривый и неформальный стиль${reminderText}
  `;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '✨ Creative',
          callback_data: 'style_creative'
        }],
        [{
          text: '👔 Formal',
          callback_data: 'style_formal'
        }],
        [{
          text: '🎉 Playful',
          callback_data: 'style_playful'
        }],
        [{
          text: '↩️ Назад к меню',
          callback_data: 'back_to_create_ad_menu'
        }]
      ]
    }
  };

  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Показ выбора размера текста
export function showSizeSelection(bot, chatId, style) {
  const message = `
📏 <b>Выберите размер текста:</b>

<b>Small</b> - короткое сообщение 
<b>Medium</b> - среднее сообщение  
<b>Large</b> - подробное сообщение 
  `;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🔹 Small',
          callback_data: `size_${style}_small`
        }],
        [{
          text: '🔸 Medium',
          callback_data: `size_${style}_medium`
        }],
        [{
          text: '🔷 Large',
          callback_data: `size_${style}_large`
        }],
        [{
          text: '↩️ Назад к выбору стиля',
          callback_data: 'back_to_style_selection'
        }]
      ]
    }
  };

  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Генерация финального текста объявления
export function generateFinalAdText(bot, chatId, style, size) {
  const session = userSessions.get(chatId);
  if (!session || !session.answers) {
    bot.sendMessage(chatId, '❌ Данные не найдены. Пожалуйста, начните заново.');
    return;
  }

  const answers = session.answers;

  // Преобразуем стиль в правильный формат (с большой буквы)
  const formattedStyle = style.charAt(0).toUpperCase() + style.slice(1);
  const styleTemplates = templates.adTemplates[formattedStyle];

  if (!styleTemplates || !styleTemplates[size]) {
    bot.sendMessage(chatId, `❌ Шаблоны не найдены для выбранного стиля и размера.`);
    return;
  }

  // Берем 3 случайных шаблона из выбранного стиля и размера
  const templatesArray = styleTemplates[size];
  const selectedTemplates = [];
  const usedIndices = new Set();

  // Выбираем 3 уникальных шаблона
  while (selectedTemplates.length < 3 && selectedTemplates.length < templatesArray.length) {
    const randomIndex = Math.floor(Math.random() * templatesArray.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedTemplates.push(templatesArray[randomIndex]);
    }
  }

  // Заменяем плейсхолдеры на реальные данные для всех шаблонов
  let finalTexts = '';
  selectedTemplates.forEach((template, index) => {
    const filledTemplate = template
        .replace(/{product}/g, answers.product || '')
        .replace(/{one_line}/g, answers.one_line || '')
        .replace(/{audience}/g, answers.audience || '')
        .replace(/{benefit}/g, answers.benefit || '')
        .replace(/{cta}/g, answers.cta || '');

    finalTexts += `\n\n<b>Вариант ${index + 1}:</b>\n${filledTemplate}`;
  });

  const message = `
📝 <b>Сгенерированные варианты:</b>
<b>Стиль:</b> ${formattedStyle}
<b>Размер:</b> ${size}
${finalTexts}
  `;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🎨 Выбрать другой стиль',
          callback_data: 'back_to_style_selection'
        }],
        [{
          text: '↩️ Назад к меню',
          callback_data: 'back_to_create_ad_menu'
        }]
      ]
    }
  };

  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

export function showPlatformTemplatesWithAnswers(bot, chatId, answers) {
  const message = `
⭐ <b>Шаблоны для рекламных площадок</b>

На основе ваших данных подготовили адаптированные шаблоны для разных площадок:

<b>📊 Ваши данные:</b>
Продукт: ${answers.product}
Аудитория: ${answers.audience}
Преимущество: ${answers.benefit}

Выберите площадку:
  `;

  // Исправляем создание кнопок - используем правильные callback_data
  const platformButtons = Object.keys(templates.platformTemplates).map(platform => [
    {
      text: `📱 ${platform}`,
      callback_data: `show_${platform.toLowerCase()}_templates`
    }
  ]);

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        ...platformButtons,
        [{
          text: '↩️ Назад к меню',
          callback_data: 'back_to_create_ad_menu'
        }]
      ]
    }
  };

  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}
// Показ шаблонов для конкретной площадки
export function showPlatformTemplates(bot, chatId, platform) {
  console.log('Platform requested:', platform);
  console.log('Available platforms:', Object.keys(templates.platformTemplates));
  const session = userSessions.get(chatId);


  const answers = session.answers;
  const platformTemplates = templates.platformTemplates[platform];

  let templatesText = '';
  platformTemplates.forEach((template, index) => {
    const filledTemplate = template
        .replace(/{product}/g, answers.product || '')
        .replace(/{one_line}/g, answers.one_line || '')
        .replace(/{audience}/g, answers.audience || '')
        .replace(/{benefit}/g, answers.benefit || '')
        .replace(/{cta}/g, answers.cta || '');

    templatesText += `\n\n<b>Вариант ${index + 1}:</b>\n${filledTemplate}`;
  });

  const message = `
📱 <b>Шаблоны для ${platform}:</b>
${templatesText}
  `;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '📱 Другие площадки',
          callback_data: 'back_to_platforms_list'
        }],
        [{
          text: '↩️ Назад к меню',
          callback_data: 'back_to_create_ad_menu'
        }]
      ]
    }
  };

  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Проверка текста на соответствие правилам
// Объявляем функцию проверки текста
export function checkTextForRules(bot, chatId, text) {

  // Переводим весь текст в маленькие буквы для поиска
  const lowerText = text.toLowerCase();

  // Слова которые мы ищем
  const badWords = ['кази', 'xxx', 'наркот', 'наркотик', 'алко'];

  // Ищем какие из этих слов есть в тексте
  const foundWords = badWords.filter(word => lowerText.includes(word));

  let message = '';

  // Если нашли плохие слова
  if (foundWords.length > 0) {
    message = `
❌ <b>Обнаружены проблемные слова:</b>

${foundWords.map(word => `• ${word}`).join('\n')}

💡 <b>Совет:</b> Избегайте этих слов
    `;
  } else {
    // Если не нашли - всё ок
    message = `
✅ <b>Текст соответствует правилам!</b>
    `;
  }

  // Создаем кнопки под сообщением
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔍 Проверить другой текст', callback_data: 'rules_check_after_questions' }],
        [{ text: '↩️ Назад к меню', callback_data: 'back_to_create_ad_menu' }]
      ]
    }
  };

  // Отправляем сообщение пользователю
  bot.sendMessage(chatId, message, { parse_mode: 'HTML', ...inlineKeyboard });
}
// Запуск проверки текста
export function startTextCheck(bot, chatId) {
  const session = userSessions.get(chatId);
  if (!session) {
    userSessions.set(chatId, {
      waitingForAnswer: true,
      waitingForTextCheck: true,
      answers: {}
    });
  } else {
    session.waitingForAnswer = true;
    session.waitingForTextCheck = true;
  }

  bot.sendMessage(chatId, `
🔍 <b>Проверка соответствия правилам</b>

Отправьте текст объявления для проверки на соответствие рекламным правилам.

Я проверю:
• Наличие запрещенных слов и выражений
• Соответствие общим рекомендациям
• Потенциальные проблемы
  `, {
    parse_mode: 'HTML'
  });
}

// Обновляем обработку callback'ов
// Экспортируем функцию для обработки нажатий на кнопки в боте
export function handleCatalogCallbacks(bot) {
  // Слушаем события нажатия на callback-кнопки
  bot.on('callback_query', (callbackQuery) => {
    // Получаем сообщение, к которому привязана кнопка
    const message = callbackQuery.message;
    // ID чата пользователя
    const chatId = message.chat.id;
    // Данные с кнопки (то, что мы передали при создании кнопки)
    const data = callbackQuery.data;

    // Если нажата кнопка "Назад в главное меню"
    if (data.startsWith('back_to_main_menu')) {
      // Показываем главное меню
      showMainMenu(bot, chatId)
      // Показываем всплывающее уведомление пользователю
      bot.answerCallbackQuery(callbackQuery.id, { text: '↩️ Главное меню...' });
    }
    // Если нажата кнопка "Назад к созданию объявления"
    else if (data.startsWith('back_to_create_ad_menu')) {
      // Получаем данные сессии пользователя
      const session = userSessions.get(chatId);
      // Если сессия существует и есть ответы
      if (session && session.answers) {
        // Показываем меню создания объявления с предыдущими ответами
        showCreateAd(bot, chatId, session.answers);
      }
      // Уведомление о возврате
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Возвращаемся к меню...' });
    }
    // Если нажата кнопка сравнения платформ
    else if (data.startsWith('compare')) {
      // Показываем сравнение стоимости на разных платформах
      showPlatformComparison(bot, chatId);
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Сравниваем стоимость...' });
    }
    // Если нажата кнопка контроля расходов
    else if (data.startsWith('control')) {
      // Запускаем вопросы по контролю расходов
      startExpenseControlQuestions(bot, chatId);
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Контроль расходов...' });
    }
    // Если нажата кнопка генерации текста после вопросов
    else if (data.startsWith('generate_text_after_questions')) {
      // Получаем сессию пользователя
      const session = userSessions.get(chatId);
      // Если есть данные сессии
      if (session && session.answers) {
        // Показываем выбор стиля сообщения
        showStyleSelection(bot, chatId);
      }
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбираем стиль сообщения...' });
    }
    // Если нажата кнопка обновления бизнес-данных
    else if (data.startsWith('update_business_data')) {
      // Удаляем старые данные пользователя
      userSessions.delete(chatId);
      // Запускаем вопросы по платформам заново
      startPlatformQuestions(bot, chatId);
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Обновляем данные...' });
    }
    // Если выбран стиль текста (начинается с style_)
    else if (data.startsWith('style_')) {
      // Извлекаем название стиля из данных кнопки
      const style = data.replace('style_', '');
      // Показываем выбор размера текста для этого стиля
      showSizeSelection(bot, chatId, style);
      bot.answerCallbackQuery(callbackQuery.id, { text: `Выбран стиль: ${style}` });
    }
    // Если выбран размер текста (начинается с size_)
    else if (data.startsWith('size_')) {
      // Разделяем данные на части: size_стиль_размер
      const parts = data.split('_');
      const style = parts[1];  // Стиль
      const size = parts[2];   // Размер
      // Генерируем финальный текст объявления
      generateFinalAdText(bot, chatId, style, size);
      bot.answerCallbackQuery(callbackQuery.id, { text: `Генерируем ${size} текст...` });
    }
    // Если нажата кнопка возврата к выбору стиля
    else if (data.startsWith('back_to_style_selection')) {
      // Снова показываем выбор стиля
      showStyleSelection(bot, chatId);
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбираем стиль...' });
    }
    // Если нажата кнопка показа шаблонов после вопросов
    else if (data.startsWith('platform_templates_after_questions')) {
      // Получаем сессию пользователя
      const session = userSessions.get(chatId);
      // Если есть данные
      if (session && session.answers) {
        // Показываем шаблоны для платформ с ответами пользователя
        showPlatformTemplatesWithAnswers(bot, chatId, session.answers);
      }
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Показываем шаблоны для площадок...' });
    }
    // Если нажата кнопка показа шаблонов конкретной платформы
    else if (data.startsWith('show_') && data.includes('_templates')) {
      // Извлекаем ключ платформы из данных кнопки
      const platformKey = data.replace('show_', '').replace('_templates', '');

      // Сопоставляем ключи кнопок с реальными названиями платформ
      const platformMapping = {
        'tiktok': 'TikTok',
        'instagram': 'Instagram', 
        'telegram': 'Telegram',
        'twitch': 'Twitch'
      };

      // Получаем реальное название платформы
      const actualPlatform = platformMapping[platformKey];

      // Если платформа существует и есть шаблоны для нее
      if (actualPlatform && templates.platformTemplates[actualPlatform]) {
        // Показываем шаблоны для этой платформы
        showPlatformTemplates(bot, chatId, actualPlatform);
        bot.answerCallbackQuery(callbackQuery.id, { text: `Показываем шаблоны для ${actualPlatform}...` });
      } else {
        // Если шаблоны не найдены - сообщаем об ошибке
        bot.sendMessage(chatId, `❌ Шаблоны для платформы не найдены`);
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка загрузки шаблонов' });
      }
    }
    // Если нажата кнопка возврата к списку платформ
    else if (data.startsWith('back_to_platforms_list')) {
      // Получаем сессию пользователя
      const session = userSessions.get(chatId);
      // Если есть данные
      if (session && session.answers) {
        // Показываем список платформ с ответами
        showPlatformTemplatesWithAnswers(bot, chatId, session.answers);
      }
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Возвращаемся к списку площадок...' });
    }
    // Если нажата кнопка проверки правил
    else if (data.startsWith('rules_check_after_questions')) {
      // Запускаем проверку текста
      startTextCheck(bot, chatId);
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Начинаем проверку текста...' });
    }
    // Если нажата кнопка калькулятора бюджета
    else if (data.startsWith('calc')) {
      // Запускаем вопросы по бюджету
      startBudgetQuestions(bot, chatId);
    }
    // Если нажата кнопка возврата к меню бюджета
    else if (data.startsWith('back_to_budget_menu')) {
      // Показываем меню бюджета
      showBudget(bot, chatId);
    }
    // Если нажата кнопка очистки истории расходов
    else if (data.startsWith('clear_expense_history')) {
      // Удаляем историю расходов пользователя
      expenseHistory.delete(chatId);
      // Сообщаем об успешной очистке
      bot.sendMessage(chatId, '✅ История расходов очищена.');
      bot.answerCallbackQuery(callbackQuery.id, { text: 'История очищена' });
    }
    // Если нажата кнопка показа истории расходов
    else if (data.startsWith('show_expense_history')) {
      // Показываем историю расходов
      showExpenseHistory(bot, chatId);
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Загружаем историю...' });
    }
    // Если нажата кнопка обновления расходов
    else if (data.startsWith('update_expenses')) {
      // Запускаем вопросы по контролю расходов заново
      startExpenseControlQuestions(bot, chatId);
      bot.answerCallbackQuery(callbackQuery.id, { text: 'Обновляем данные по расходам...' });
    }

    // Подтверждаем обработку callback (убираем часики на кнопке)
    bot.answerCallbackQuery(callbackQuery.id);
  });
}

// Создаем команду /budget для бота
export function setupBudgetCommand(bot) {
  // Регистрируем обработчик команды /budget
  bot.onText(/\/budget/, (msg) => {
    // Получаем ID чата пользователя
    const chatId = msg.chat.id;
    // Показываем меню бюджета
    showBudget(bot, chatId);
  });
};

// Функция показывает меню бюджета пользователю
export function showBudget(bot, chatId) {

  const message = `
<b>Выберите опцию:</b>

<b>1️⃣ Рассчитать бюджет кампании</b> - помогает рассчитать бюджет кампании
<b>2️⃣ Сравнить стоимость площадок</b> - сравнивает стоимость разных рекламных площадок  
<b>3️⃣ Контроль расходов</b> - контролирует расходы в реальном времени
  `;
  
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [  
        [{  
          text: '🪙 Рассчитать бюджет',  
          callback_data: 'calc'  
        }],
        [{   
          text: '⚖️ Сравнить стоимость',
          callback_data: 'compare'
        }],
        [{  
          text: '♟ Контроль расходов', 
          callback_data: 'control'
        }],
        [{  
          text: '↩️ Главное меню',
          callback_data: 'back_to_main_menu'
        }]
      ]
    }
  };

  // Отправляем сообщение с кнопками пользователю
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',  // Разрешаем HTML-разметку в тексте
    ...inlineKeyboard    // Добавляем клавиатуру с кнопками
  });
}

// Функция показывает главное меню бота
export function showMainMenu(bot, chatId) {
  // Текст приветствия с описанием возможностей бота
  const welcomeText = `<b>👋 Привет! Я помощник Sadyr Studio.</b>\n\nЯ --- ваш цифровой помощник для создания эффективной рекламы. Готов помочь вам сгенерировать креативные тексты и рассчитать бюджет.\n\n<i>Выберите команду:</i>\n\n/create_ad --- создать объявление (шаблоны,генерация,проверка правилам)\n\n/budget --- бюджет и управление расходами`;
  
  // Отправляем сообщение с главным меню
  bot.sendMessage(chatId, welcomeText, {
    parse_mode: 'HTML'  // Включаем HTML-разметку для красивого текста
  });
}

// Функция для запуска вопросов по бюджету
export function startBudgetQuestions(bot, chatId) {
  const questions = templates.budget.questions;

  userSessions.set(chatId, {
    waitingForAnswer: true,
    currentQuestionIndex: 0,
    answers: {},
    questionType: 'budget'
  });

  bot.sendMessage(chatId, `💰 <b>Рассчитаем бюджет!</b>\n\n${questions[0].text}`, {
    parse_mode: 'HTML'
  });
}

// Обработка ответов на вопросы бюджета
export function handleBudgetAnswer(bot, chatId, answer, session) {
  let questions;

  if (session.questionType === 'budget') {
    questions = templates.budget.questions;
  } else if (session.questionType === 'expense_control') {
    questions = templates.budget.expenseControlQuestions;
  } else {
    return;
  }

  const currentQuestion = questions[session.currentQuestionIndex];

  const numericAnswer = parseFloat(answer.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (isNaN(numericAnswer) || numericAnswer < 0) {
    bot.sendMessage(chatId, '❌ Введите корректное положительное число. Например: 80000 или 80,000');
    return;
  }

  session.answers[currentQuestion.key] = numericAnswer;
  session.currentQuestionIndex++;

  if (session.currentQuestionIndex < questions.length) {
    bot.sendMessage(chatId, questions[session.currentQuestionIndex].text);
  } else {
    session.waitingForAnswer = false;

    if (session.questionType === 'budget') {
      showBudgetCalculations(bot, chatId, session.answers);
    } else if (session.questionType === 'expense_control') {
      showExpenseControlResults(bot, chatId, session.answers);
    }
  }
}
// Показ расчетов бюджета
export function showBudgetCalculations(bot, chatId, answers) {
  const { goal = 0, kpi = 0, audience = 0 } = answers;

  const grossProfit = goal - kpi;
  const operatingProfit = grossProfit - audience;

  const message = `
💰 <b>Результаты расчета:</b>

1. <b>Валовая прибыль</b>
   ${formatNumber(goal)} - ${formatNumber(kpi)} = ${formatNumber(grossProfit)} руб.

2. <b>Операционная прибыль</b>  
   ${formatNumber(grossProfit)} - ${formatNumber(audience)} = ${formatNumber(operatingProfit)} руб.

3. <b>Чистая прибыль</b>
   ${formatNumber(operatingProfit)} руб.
  `;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '↩️ Назад', callback_data: 'back_to_budget_menu' }]
      ]
    }
  };

  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция для форматирования чисел
export function formatNumber(number) {
  return new Intl.NumberFormat('ru-RU').format(number);
}

export function showPlatformComparison(bot, chatId) {
  const benchmarks = templates.budget.platformBenchmarks;

  let comparisonMessage = `⚖️ <b>Сравнение стоимости рекламных площадок</b>\n\n`;

  Object.entries(benchmarks).forEach(([platform, prices]) => {
    comparisonMessage += `📱 <b>${platform}</b>\n`;
    comparisonMessage += `   • CPA: ${formatNumber(prices.cpa)} руб.\n`;
    comparisonMessage += `   • CPM: ${formatNumber(prices.cpm)} руб.\n\n`;
  });

  comparisonMessage += `💡 <b>Пояснения:</b>\n• <b>CPA</b> - цена за целевое действие (клик, заявка)\n• <b>CPM</b> - цена за 1000 показов рекламы`;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '↩️ Назад к меню бюджета',
          callback_data: 'back_to_budget_menu'
        }]
      ]
    }
  };

  bot.sendMessage(chatId, comparisonMessage, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция для запуска вопросов по контролю расходов
export function startExpenseControlQuestions(bot, chatId) {
  const questions = templates.budget.expenseControlQuestions;

  userSessions.set(chatId, {
    waitingForAnswer: true,
    currentQuestionIndex: 0,
    answers: {},
    questionType: 'expense_control'
  });

  bot.sendMessage(chatId, `♟ <b>Контроль расходов</b>\n\n${questions[0].text}`, {
    parse_mode: 'HTML'
  });
}

// Функция для показа результатов контроля расходов
export function showExpenseControlResults(bot, chatId, answers) {
  const { total_budget = 0, spent_amount = 0 } = answers;

  const remaining_budget = total_budget - spent_amount;
  const spent_percentage = total_budget > 0 ? (spent_amount / total_budget) * 100 : 0;

  // Сохраняем в историю
  if (!expenseHistory.has(chatId)) {
    expenseHistory.set(chatId, []);
  }

  expenseHistory.get(chatId).push({
    date: new Date().toLocaleDateString('ru-RU'),
    total_budget,
    spent_amount,
    remaining_budget,
    spent_percentage: Math.round(spent_percentage)
  });

  const message = `
Готово. Что дальше?  

💰 <b>Текущее состояние:</b>
• Общий бюджет: ${formatNumber(total_budget)} руб.
• Потрачено: ${formatNumber(spent_amount)} руб.  
• Осталось: ${formatNumber(remaining_budget)} руб. (${(100 - spent_percentage).toFixed(0)}% от бюджета)
• Потрачено: ${spent_percentage.toFixed(0)}%
  `;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔄 Обновить расходы', callback_data: 'update_expenses' }],
        [{ text: '📊 Показать историю расходов', callback_data: 'show_expense_history' }],
        [{ text: '💰 К бюджету', callback_data: 'back_to_budget_menu' }],
        [{ text: '↩️ Главное меню', callback_data: 'back_to_main_menu' }]
      ]
    }
  };

  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}

// Функция для показа истории расходов
export function showExpenseHistory(bot, chatId, expenseHistoryMap = expenseHistory) {
  const history = expenseHistoryMap.get(chatId);

  if (!history || history.length === 0) {
    bot.sendMessage(chatId, '📊 История расходов пуста.');
    return;
  }

  let historyMessage = `📊 <b>История контроля расходов (${history.length} записей)</b>\n\n`;

  history.forEach((entry) => {
    historyMessage += `📅 <b>${entry.date}</b>\n`;
    historyMessage += `   • Бюджет: ${formatNumber(entry.total_budget)} руб.\n`;
    historyMessage += `   • Потрачено: ${formatNumber(entry.spent_amount)} руб.\n`;
    historyMessage += `   • Осталось: ${formatNumber(entry.remaining_budget)} руб.\n`;
    historyMessage += `   • Использовано: ${entry.spent_percentage}%\n\n`;
  });

  // Статистика
  const totalSpent = history.reduce((sum, entry) => sum + entry.spent_amount, 0);
  const avgUtilization = history.reduce((sum, entry) => sum + entry.spent_percentage, 0) / history.length;

  historyMessage += `---\n\n`;
  historyMessage += `<b>Статистика:</b>\n`;
  historyMessage += `• Всего потрачено за все время: ${formatNumber(totalSpent)} руб.\n`;
  historyMessage += `• Средняя утилизация бюджета: ${avgUtilization.toFixed(0)}%\n`;
  historyMessage += `• Количество записей: ${history.length}`;

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '➕ Добавить новую запись',
          callback_data: 'control'
        }],
        [{
          text: '🗑️ Очистить историю',
          callback_data: 'clear_expense_history'
        }],
        [{
          text: '💰 К бюджету',
          callback_data: 'back_to_budget_menu'
        }],
        [{
          text: '↩️ Главное меню',
          callback_data: 'back_to_main_menu'
        }]
      ]
    }
  };

  bot.sendMessage(chatId, historyMessage, {
    parse_mode: 'HTML',
    ...inlineKeyboard
  });
}



export default runServer;