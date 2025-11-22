import { describe, it, expect, jest, beforeAll, beforeEach, afterEach } from '@jest/globals';

// Mock для Telegram Bot
const mockBot = {
  sendMessage: jest.fn(),
  answerCallbackQuery: jest.fn()
};

afterEach;
describe('showCreateAd', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export showCreateAd function', () => {
    expect(typeof botFunctions.showCreateAd).toBe('function');
  });

  it('should call bot.sendMessage with create ad menu', () => {
    const chatId = 12345;
    const mockAnswers = {
      product: 'Test Product',
      one_line: 'Test description', 
      audience: 'Test audience',
      benefit: 'Test benefit',
      cta: 'Test CTA',
      goal: 'Test goal'
    };

    botFunctions.showCreateAd(mockBot, chatId, mockAnswers);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Отлично! Вот что мы узнали о вашем бизнесе'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should include all action buttons', () => {
    const chatId = 12345;
    const mockAnswers = {
      product: 'Test Product',
      one_line: 'Test description',
      audience: 'Test audience', 
      benefit: 'Test benefit',
      cta: 'Test CTA',
      goal: 'Test goal'
    };

    botFunctions.showCreateAd(mockBot, chatId, mockAnswers);

    const callArgs = mockBot.sendMessage.mock.calls[0];
    const inlineKeyboard = callArgs[2].reply_markup.inline_keyboard;

    expect(inlineKeyboard[0][0].callback_data).toBe('generate_text_after_questions');
    expect(inlineKeyboard[1][0].callback_data).toBe('platform_templates_after_questions');
    expect(inlineKeyboard[2][0].callback_data).toBe('rules_check_after_questions');
    expect(inlineKeyboard[3][0].callback_data).toBe('update_business_data');
    expect(inlineKeyboard[4][0].callback_data).toBe('back_to_main_menu');
  });
});

describe('handleTextResponses', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.userSessions.clear();
  });

  it('should handle text check when waitingForTextCheck is true', () => {
    const mockBot = { 
      on: jest.fn(),
      sendMessage: jest.fn() // Добавить это
    };
    
    botFunctions.userSessions.set(12345, { 
      waitingForAnswer: true, 
      waitingForTextCheck: true 
    });
    
    botFunctions.handleTextResponses(mockBot);
    const messageHandler = mockBot.on.mock.calls[0][1];
    const mockMsg = { 
      chat: { id: 12345 }, 
      text: 'test text for check' 
    };
    
    messageHandler(mockMsg);
  });

  it('should handle budget questions', () => {
    const mockBot = { 
      on: jest.fn(),
      sendMessage: jest.fn() // Добавить это
    };
    
    botFunctions.userSessions.set(12345, { 
      waitingForAnswer: true, 
      questionType: 'budget',
      currentQuestionIndex: 0,
      answers: {}
    });
    
    botFunctions.handleTextResponses(mockBot);
    const messageHandler = mockBot.on.mock.calls[0][1];
    const mockMsg = { 
      chat: { id: 12345 }, 
      text: '10000' 
    };
    
    messageHandler(mockMsg);
  });

  it('should handle user answer for platform questions', () => {
    const mockBot = { 
      on: jest.fn(),
      sendMessage: jest.fn()
    };
  
    botFunctions.userSessions.set(12345, { 
      waitingForAnswer: true,
      currentQuestionIndex: 0,
      answers: {}
    });
  
    botFunctions.handleTextResponses(mockBot);
    const messageHandler = mockBot.on.mock.calls[0][1];
    const mockMsg = { 
      chat: { id: 12345 }, 
      text: 'answer for platform question' 
    };
  
    messageHandler(mockMsg);
  });
});

describe('handleUserAnswer', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return early when no session exists', () => {
    const mockBot = { sendMessage: jest.fn() };
    
    botFunctions.handleUserAnswer(mockBot, 12345, 'answer', null);
    
    expect(mockBot.sendMessage).not.toHaveBeenCalled();
  });

  it('should return early when session not waiting for answer', () => {
    const mockBot = { sendMessage: jest.fn() };
    const mockSession = { waitingForAnswer: false };
    
    botFunctions.handleUserAnswer(mockBot, 12345, 'answer', mockSession);
    
    expect(mockBot.sendMessage).not.toHaveBeenCalled();
  });

  it('should save answer and ask next question', () => {
    const mockBot = { sendMessage: jest.fn() };
    const mockSession = {
      waitingForAnswer: true,
      currentQuestionIndex: 0,
      answers: {}
    };
    
    botFunctions.handleUserAnswer(mockBot, 12345, 'test product', mockSession);
    
    expect(mockSession.answers.product).toBe('test product');
    expect(mockSession.currentQuestionIndex).toBe(1);
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should show create ad menu when all questions answered', () => {
    const mockBot = { sendMessage: jest.fn() };
    const mockSession = {
      waitingForAnswer: true,
      currentQuestionIndex: 5,
      answers: { product: 'test' }
    };
    
    botFunctions.handleUserAnswer(mockBot, 12345, 'test audience', mockSession);
    
    expect(mockSession.waitingForAnswer).toBe(false);
    expect(mockSession.hasCompletedQuestions).toBe(true);
  });
});

describe('startPlatformQuestions', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.userSessions.clear();
  });

  it('should export startPlatformQuestions function', () => {
    expect(typeof botFunctions.startPlatformQuestions).toBe('function');
  });

  it('should initialize session and send first question', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;

    botFunctions.startPlatformQuestions(mockBot, chatId);

    const session = botFunctions.userSessions.get(chatId);
    expect(session).toEqual({
      waitingForAnswer: true,
      currentQuestionIndex: 0,
      answers: {},
      questionType: 'platform',
      hasCompletedQuestions: false
    });

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('📝 Давайте создадим эффективное объявление!')
    );
  });
});



describe('showStyleSelection', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.userSessions.clear();
  });

  it('should export showStyleSelection function', () => {
    expect(typeof botFunctions.showStyleSelection).toBe('function');
  });

  it('should show style selection without session data', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;

    botFunctions.showStyleSelection(mockBot, chatId);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('🎨 <b>Выберите стиль сообщения:</b>'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should show style selection with session data', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    
    botFunctions.userSessions.set(chatId, {
      answers: {
        product: 'Test Product',
        audience: 'Test Audience', 
        benefit: 'Test Benefit'
      }
    });

    botFunctions.showStyleSelection(mockBot, chatId);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('📊 <b>Ваши текущие данные:</b>'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });
});

describe('showSizeSelection', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export showSizeSelection function', () => {
    expect(typeof botFunctions.showSizeSelection).toBe('function');
  });

  it('should show size selection with correct style in callback data', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    const style = 'creative';

    botFunctions.showSizeSelection(mockBot, chatId, style);

    const callArgs = mockBot.sendMessage.mock.calls[0];
    const inlineKeyboard = callArgs[2].reply_markup.inline_keyboard;

    expect(inlineKeyboard[0][0].callback_data).toBe('size_creative_small');
    expect(inlineKeyboard[1][0].callback_data).toBe('size_creative_medium');
    expect(inlineKeyboard[2][0].callback_data).toBe('size_creative_large');
    expect(inlineKeyboard[3][0].callback_data).toBe('back_to_style_selection');

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('📏 <b>Выберите размер текста:</b>'),
      expect.objectContaining({
        parse_mode: 'HTML'
      })
    );
  });
});


describe('generateFinalAdText', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.userSessions.clear();
  });

  it('should export generateFinalAdText function', () => {
    expect(typeof botFunctions.generateFinalAdText).toBe('function');
  });

  it('should show error when no session exists', () => {
    const mockBot = { sendMessage: jest.fn() };
    
    botFunctions.generateFinalAdText(mockBot, 12345, 'creative', 'small');
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      12345,
      '❌ Данные не найдены. Пожалуйста, начните заново.'
    );
  });

  it('should show error when templates not found', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    
    botFunctions.userSessions.set(chatId, {
      answers: {
        product: 'Test',
        one_line: 'Test desc',
        audience: 'Test audience',
        benefit: 'Test benefit',
        cta: 'Test cta'
      }
    });

    botFunctions.generateFinalAdText(mockBot, chatId, 'invalid', 'size');
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '❌ Шаблоны не найдены для выбранного стиля и размера.'
    );
  });

  it('should generate ad text with valid data', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    
    botFunctions.userSessions.set(chatId, {
      answers: {
        product: 'Test Product',
        one_line: 'Test Description',
        audience: 'Test Audience',
        benefit: 'Test Benefit', 
        cta: 'Test CTA'
      }
    });

    botFunctions.generateFinalAdText(mockBot, chatId, 'creative', 'small');
    
    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('📝 <b>Сгенерированные варианты:</b>'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });
});

describe('showPlatformTemplatesWithAnswers', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export showPlatformTemplatesWithAnswers function', () => {
    expect(typeof botFunctions.showPlatformTemplatesWithAnswers).toBe('function');
  });

  it('should show platform templates with answers data', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    const mockAnswers = {
      product: 'Test Product',
      audience: 'Test Audience',
      benefit: 'Test Benefit'
    };

    botFunctions.showPlatformTemplatesWithAnswers(mockBot, chatId, mockAnswers);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('⭐ <b>Шаблоны для рекламных площадок</b>'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should include platform buttons with correct callback data', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    const mockAnswers = {
      product: 'Test',
      audience: 'Test',
      benefit: 'Test'
    };

    botFunctions.showPlatformTemplatesWithAnswers(mockBot, chatId, mockAnswers);

    const callArgs = mockBot.sendMessage.mock.calls[0];
    const inlineKeyboard = callArgs[2].reply_markup.inline_keyboard;
    
    // Проверяем что есть кнопки для платформ и кнопка "назад"
    expect(inlineKeyboard.length).toBeGreaterThan(0);
    expect(inlineKeyboard[inlineKeyboard.length - 1][0].callback_data).toBe('back_to_create_ad_menu');
  });
});

describe('showPlatformTemplates', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.userSessions.clear();
  });

  it('should export showPlatformTemplates function', () => {
    expect(typeof botFunctions.showPlatformTemplates).toBe('function');
  });

  it('should show platform templates with filled data', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    
    botFunctions.userSessions.set(chatId, {
      answers: {
        product: 'Test Product',
        one_line: 'Test Description',
        audience: 'Test Audience',
        benefit: 'Test Benefit',
        cta: 'Test CTA'
      }
    });

    botFunctions.showPlatformTemplates(mockBot, chatId, 'Instagram');

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('📱 <b>Шаблоны для Instagram:</b>'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should include correct navigation buttons', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    
    botFunctions.userSessions.set(chatId, {
      answers: {
        product: 'Test',
        one_line: 'Test',
        audience: 'Test',
        benefit: 'Test',
        cta: 'Test'
      }
    });

    botFunctions.showPlatformTemplates(mockBot, chatId, 'TikTok');

    const callArgs = mockBot.sendMessage.mock.calls[0];
    const inlineKeyboard = callArgs[2].reply_markup.inline_keyboard;

    expect(inlineKeyboard[0][0].callback_data).toBe('back_to_platforms_list');
    expect(inlineKeyboard[1][0].callback_data).toBe('back_to_create_ad_menu');
  });
});

describe('startTextCheck', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.userSessions.clear();
  });

  it('should export startTextCheck function', () => {
    expect(typeof botFunctions.startTextCheck).toBe('function');
  });

  it('should create new session when no session exists', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;

    botFunctions.startTextCheck(mockBot, chatId);

    const session = botFunctions.userSessions.get(chatId);
    expect(session).toEqual({
      waitingForAnswer: true,
      waitingForTextCheck: true,
      answers: {}
    });

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('🔍 <b>Проверка соответствия правилам</b>'),
      expect.objectContaining({
        parse_mode: 'HTML'
      })
    );
  });

  it('should update existing session when session exists', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    
    botFunctions.userSessions.set(chatId, {
      waitingForAnswer: false,
      waitingForTextCheck: false,
      answers: { product: 'test' }
    });

    botFunctions.startTextCheck(mockBot, chatId);

    const session = botFunctions.userSessions.get(chatId);
    expect(session.waitingForAnswer).toBe(true);
    expect(session.waitingForTextCheck).toBe(true);
    expect(session.answers).toEqual({ product: 'test' });
  });
});

describe('handleCatalogCallbacks', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.userSessions.clear();
  });

  it('should export handleCatalogCallbacks function', () => {
    expect(typeof botFunctions.handleCatalogCallbacks).toBe('function');
  });

  it('should register callback query handler', () => {
    const mockBot = { on: jest.fn() };
    
    botFunctions.handleCatalogCallbacks(mockBot);
    
    expect(mockBot.on).toHaveBeenCalledWith('callback_query', expect.any(Function));
  });

  it('should handle back_to_main_menu callback', () => {
    const mockBot = { 
      on: jest.fn(),
      sendMessage: jest.fn(),
      answerCallbackQuery: jest.fn()
    };
    
    botFunctions.handleCatalogCallbacks(mockBot);
    
    const callbackHandler = mockBot.on.mock.calls[0][1];
    const mockCallback = {
      id: 'test_id',
      message: { chat: { id: 12345 } },
      data: 'back_to_main_menu'
    };
    
    callbackHandler(mockCallback);
    
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('test_id', { text: '↩️ Главное меню...' });
  });

  it('should handle compare callback', () => {
    const mockBot = { 
      on: jest.fn(),
      sendMessage: jest.fn(),
      answerCallbackQuery: jest.fn()
    };
    
    botFunctions.handleCatalogCallbacks(mockBot);
    
    const callbackHandler = mockBot.on.mock.calls[0][1];
    const mockCallback = {
      id: 'test_id',
      message: { chat: { id: 12345 } },
      data: 'compare'
    };
    
    callbackHandler(mockCallback);
    
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('test_id', { text: 'Сравниваем стоимость...' });
  });

  it('should handle style_ callback', () => {
    const mockBot = { 
      on: jest.fn(),
      sendMessage: jest.fn(),
      answerCallbackQuery: jest.fn()
    };
    
    botFunctions.handleCatalogCallbacks(mockBot);
    
    const callbackHandler = mockBot.on.mock.calls[0][1];
    const mockCallback = {
      id: 'test_id',
      message: { chat: { id: 12345 } },
      data: 'style_creative'
    };
    
    callbackHandler(mockCallback);
    
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('test_id', { text: 'Выбран стиль: creative' });
  });

  it('should handle size_ callback', () => {
    const mockBot = { 
      on: jest.fn(),
      sendMessage: jest.fn(),
      answerCallbackQuery: jest.fn()
    };
  
    botFunctions.userSessions.set(12345, { answers: {} });
    botFunctions.handleCatalogCallbacks(mockBot);
  
    const callbackHandler = mockBot.on.mock.calls[0][1];
    const mockCallback = {
      id: 'test_id',
      message: { chat: { id: 12345 } },
      data: 'size_creative_small'
    };
  
    callbackHandler(mockCallback);
  
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('test_id', { text: 'Генерируем small текст...' });
  });

  it('should handle show_platform_templates with valid platform', () => {
    const mockBot = { 
      on: jest.fn(),
      sendMessage: jest.fn(),
      answerCallbackQuery: jest.fn()
    };
  
    botFunctions.userSessions.set(12345, { answers: {} });
    botFunctions.handleCatalogCallbacks(mockBot);
  
    const callbackHandler = mockBot.on.mock.calls[0][1];
    const mockCallback = {
      id: 'test_id',
      message: { chat: { id: 12345 } },
      data: 'show_instagram_templates'
    };
  
    callbackHandler(mockCallback);
  
    expect(mockBot.answerCallbackQuery).toHaveBeenCalledWith('test_id', { text: 'Показываем шаблоны для Instagram...' });
  });

  it('should handle clear_expense_history callback', () => {
    const mockBot = { 
      on: jest.fn(),
      sendMessage: jest.fn(),
      answerCallbackQuery: jest.fn()
    };
  
    botFunctions.expenseHistory.set(12345, [{ date: 'test' }]);
    botFunctions.handleCatalogCallbacks(mockBot);
  
    const callbackHandler = mockBot.on.mock.calls[0][1];
    const mockCallback = {
      id: 'test_id',
      message: { chat: { id: 12345 } },
      data: 'clear_expense_history'
    };
  
    callbackHandler(mockCallback);
  
    expect(mockBot.sendMessage).toHaveBeenCalledWith(12345, '✅ История расходов очищена.');
  });

});

describe('setupBudgetCommand', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export setupBudgetCommand function', () => {
    expect(typeof botFunctions.setupBudgetCommand).toBe('function');
  });

  it('should register /budget command handler', () => {
    const mockBot = { onText: jest.fn() };
    
    botFunctions.setupBudgetCommand(mockBot);
    
    expect(mockBot.onText).toHaveBeenCalledWith(/\/budget/, expect.any(Function));
  });

  it('should call showBudget when /budget command received', () => {
    const mockBot = { 
      onText: jest.fn(),
      sendMessage: jest.fn() // Добавить эту строку
    };
    
    botFunctions.setupBudgetCommand(mockBot);
    
    const commandHandler = mockBot.onText.mock.calls[0][1];
    const mockMsg = { chat: { id: 12345 } };
    
    commandHandler(mockMsg);
    
    expect(mockBot.onText).toHaveBeenCalledWith(/\/budget/, expect.any(Function));
  });
});

describe('startBudgetQuestions', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.userSessions.clear();
  });

  it('should export startBudgetQuestions function', () => {
    expect(typeof botFunctions.startBudgetQuestions).toBe('function');
  });

  it('should initialize budget session and send first question', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;

    botFunctions.startBudgetQuestions(mockBot, chatId);

    const session = botFunctions.userSessions.get(chatId);
    expect(session).toEqual({
      waitingForAnswer: true,
      currentQuestionIndex: 0,
      answers: {},
      questionType: 'budget'
    });

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('💰 <b>Рассчитаем бюджет!</b>'),
      expect.objectContaining({
        parse_mode: 'HTML'
      })
    );
  });
});


describe('startExpenseControlQuestions', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.userSessions.clear();
  });

  it('should export startExpenseControlQuestions function', () => {
    expect(typeof botFunctions.startExpenseControlQuestions).toBe('function');
  });

  it('should initialize expense control session and send first question', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;

    botFunctions.startExpenseControlQuestions(mockBot, chatId);

    const session = botFunctions.userSessions.get(chatId);
    expect(session).toEqual({
      waitingForAnswer: true,
      currentQuestionIndex: 0,
      answers: {},
      questionType: 'expense_control'
    });

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('♟ <b>Контроль расходов</b>'),
      expect.objectContaining({
        parse_mode: 'HTML'
      })
    );
  });
});

describe('showExpenseControlResults', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.expenseHistory.clear();
  });

  it('should export showExpenseControlResults function', () => {
    expect(typeof botFunctions.showExpenseControlResults).toBe('function');
  });

  it('should save to history and show results with budget data', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    const mockAnswers = {
      total_budget: 10000,
      spent_amount: 3000
    };

    botFunctions.showExpenseControlResults(mockBot, chatId, mockAnswers);

    const history = botFunctions.expenseHistory.get(chatId);
    expect(history).toHaveLength(1);
    expect(history[0].total_budget).toBe(10000);
    expect(history[0].spent_amount).toBe(3000);
    expect(history[0].remaining_budget).toBe(7000);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('💰 <b>Текущее состояние:</b>'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });

  it('should handle zero budget case', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    const mockAnswers = {
      total_budget: 0,
      spent_amount: 0
    };

    botFunctions.showExpenseControlResults(mockBot, chatId, mockAnswers);

    const history = botFunctions.expenseHistory.get(chatId);
    expect(history[0].spent_percentage).toBe(0);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('Общий бюджет: 0 руб.'),
      expect.objectContaining({
        parse_mode: 'HTML'
      })
    );
  });
});


describe('showExpenseHistory', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    botFunctions.expenseHistory.clear();
  });

  it('should export showExpenseHistory function', () => {
    expect(typeof botFunctions.showExpenseHistory).toBe('function');
  });

  it('should show empty message when no history exists', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;

    botFunctions.showExpenseHistory(mockBot, chatId);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      '📊 История расходов пуста.'
    );
  });

  it('should show history with statistics when data exists', () => {
    const mockBot = { sendMessage: jest.fn() };
    const chatId = 12345;
    
    botFunctions.expenseHistory.set(chatId, [
      {
        date: '01.01.2024',
        total_budget: 10000,
        spent_amount: 5000,
        remaining_budget: 5000,
        spent_percentage: 50
      },
      {
        date: '02.01.2024', 
        total_budget: 8000,
        spent_amount: 4000,
        remaining_budget: 4000,
        spent_percentage: 50
      }
    ]);

    botFunctions.showExpenseHistory(mockBot, chatId);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      chatId,
      expect.stringContaining('📊 <b>История контроля расходов (2 записей)</b>'),
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );

    const callArgs = mockBot.sendMessage.mock.calls[0];
    const inlineKeyboard = callArgs[2].reply_markup.inline_keyboard;
    
    expect(inlineKeyboard[0][0].callback_data).toBe('control');
    expect(inlineKeyboard[1][0].callback_data).toBe('clear_expense_history');
    expect(inlineKeyboard[2][0].callback_data).toBe('back_to_budget_menu');
    expect(inlineKeyboard[3][0].callback_data).toBe('back_to_main_menu');
  });
});
describe('handleBudgetAnswer', () => {
  let botFunctions;

  beforeAll(async () => {
    botFunctions = await import('../src/server.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export handleBudgetAnswer function', () => {
    expect(typeof botFunctions.handleBudgetAnswer).toBe('function');
  });

  it('should return early for unknown question type', () => {
    const mockBot = { sendMessage: jest.fn() };
    const mockSession = { questionType: 'unknown' };

    botFunctions.handleBudgetAnswer(mockBot, 12345, '1000', mockSession);

    expect(mockBot.sendMessage).not.toHaveBeenCalled();
  });

  it('should show error for invalid number', () => {
    const mockBot = { sendMessage: jest.fn() };
    const mockSession = {
      questionType: 'budget',
      currentQuestionIndex: 0
    };

    botFunctions.handleBudgetAnswer(mockBot, 12345, 'invalid', mockSession);

    expect(mockBot.sendMessage).toHaveBeenCalledWith(
      12345,
      '❌ Введите корректное положительное число. Например: 80000 или 80,000'
    );
  });

  it('should process budget question and ask next', () => {
    const mockBot = { sendMessage: jest.fn() };
    const mockSession = {
      questionType: 'budget',
      currentQuestionIndex: 0,
      answers: {}
    };

    botFunctions.handleBudgetAnswer(mockBot, 12345, '10000', mockSession);

    expect(mockSession.answers.goal).toBe(10000);
    expect(mockSession.currentQuestionIndex).toBe(1);
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should process expense control question and show results when done', () => {
    const mockBot = { sendMessage: jest.fn() };
    const mockSession = {
      questionType: 'expense_control',
      currentQuestionIndex: 3, // Последний вопрос
      answers: {}
    };

    botFunctions.handleBudgetAnswer(mockBot, 12345, '5000', mockSession);

    expect(mockSession.waitingForAnswer).toBe(false);
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });

  it('should process budget question and show calculations when done', () => {
    const mockBot = { sendMessage: jest.fn() };
    const mockSession = {
      questionType: 'budget',
      currentQuestionIndex: 3, // Последний вопрос
      answers: {}
    };

    botFunctions.handleBudgetAnswer(mockBot, 12345, '1000', mockSession);

    expect(mockSession.waitingForAnswer).toBe(false);
    expect(mockBot.sendMessage).toHaveBeenCalled();
  });
});