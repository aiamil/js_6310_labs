'use strict';

// Константы цветов
const PINK = '#F9D7E1';
const BROWN = '#8E756E';
const DARK_GREY = '#3B3B3B';
const LIGHT_GREY = '#B0A8A4';
const WHITE = '#FDFFF5';
const ACCENT_PINK = '#fd96cfff';
const BRIGHT_PINK = '#ff259dff';

function PILATES() {
    const style = document.createElement('style');
    style.id = 'PILATES-STYLE'; 
    
    style.textContent = ` 
        /* === ОСНОВНЫЕ СТИЛИ === */
        
        /* 1. Фон страницы */
        body {
            color: ${DARK_GREY} !important;
        }
        
        .page_wrapper {
            background-color: ${PINK} !important;
        }
        
        .main_slider_holder {
            background: ${PINK} !important;
        }
        
        .news_box {
            background: ${PINK} !important;
        }
        
        .tab_items {
            background: ${PINK} !important;
        }
        
        .slick-track {
            background: ${PINK} !important;
        }
        
        .portlet-content {
            background: ${PINK} !important;
        }
        
        .institutes_slider_box.institutes_box.cf.disable-user-actions {
            background: ${PINK} !important;
        }
        
        .inst-slide.prev.cf, .inst-slide.next {
            background: ${PINK} !important;
        }
        
        /* === ШАПКА === */
        
        /* 2. Шапка */
        header, .header, #header {
            background-color: ${BROWN} !important;
            max-width: 1400px !important;
            border: none !important;
        }
        
        /* 3. Навигация в шапке */
        nav, .navigation, .menu {
            background-color: ${ACCENT_PINK} !important;
            box-shadow: 0 0 20px ${ACCENT_PINK} !important;
            border-radius: 10px !important;
            padding: 5px !important;
        }
        
        /* === ЗАГОЛОВКИ === */
        
        /* 4. Основные заголовки */
        h1, h2, h3 {
            color: ${DARK_GREY} !important;
            text-shadow: 0 0 10px ${ACCENT_PINK}, 0 0 10px ${ACCENT_PINK} !important;
            font-weight: 900 !important;
        }
        
        /* === ССЫЛКИ === */
        
        /* 5. Основные ссылки */
        a {
            color: ${DARK_GREY} !important;
            text-shadow: 0 0 10px ${ACCENT_PINK}, 0 0 10px ${BROWN} !important;
            font-weight: 100 !important;
            font-family: "Georgia", serif !important;
        }
        
        /* 6. Ссылки при наведении */
        a:hover {
            color: ${DARK_GREY} !important;
            background-color: ${LIGHT_GREY} !important;
            border: none !important;
            box-shadow: 0 0 10px ${ACCENT_PINK} !important;
        }
        
        /* === КНОПКИ === */
        
        /* 7. Основные кнопки */
        button, .button, input[type="submit"] {
            background-color: ${ACCENT_PINK} !important; 
            border-radius: 1px !important;
            border: 2px solid ${ACCENT_PINK} !important;
            box-shadow: 0 0 20px ${WHITE}, 0 0 40px ${WHITE} !important;
        }
        
        /* 8. Кнопки при наведении */
        button:hover, .button:hover, input[type="submit"]:hover {
            box-shadow: 0 0 20px ${ACCENT_PINK}, 0 0 40px #ffffffff !important;
        }
        
        /* === ФУТЕР === */
        
        /* 9. Футер */
        footer, .footer {
            background-color: ${LIGHT_GREY} !important;
            box-shadow: 0 0 10px ${ACCENT_PINK}, 0 0 10px ${ACCENT_PINK} !important;
            margin-top: 40px !important;
        }
        
        /* 10. Ссылки в футере */
        footer a, .footer a, footer a:visited, .footer a:visited {
            color: ${WHITE} !important;
            box-shadow: 0 0 10px ${ACCENT_PINK} !important, 0 0 10px ${BROWN};
            text-shadow: 0 0 20px #fdcde8ff, 0 0 30px #ff9bd2ff !important;
        }
        
        /* 11. Ссылки при наведении в футере */
        footer a:hover, .footer a:hover {
            color: ${ACCENT_PINK} !important;
            background-color: ${BROWN} !important;
            border: none !important;
            box-shadow: 0 0 20px ${BRIGHT_PINK} !important;
        }
        
        /* === СПЕЦИФИЧЕСКИЕ ЭЛЕМЕНТЫ === */
        
        /* 12. Соц сети */
        .socials a {
            background-color: ${BRIGHT_PINK} !important;
            background-blend-mode: multiply !important;
            mix-blend-mode: multiply !important;
            border-radius: 50% !important;
            margin: 0 2px !important;
        }
        
        /* 13. Вход */
        .login_links {
            color: #EBE9DD !important;
            border: none !important;
            box-shadow: 0 0 60px ${ACCENT_PINK} !important;
        }
        
        /* 14. Четность недели */
        .week_parity {
            background-color: ${ACCENT_PINK} !important;
            border: none !important;
            border-radius: 0px !important;
        }
        
        /* 15. Месяц и год в событиях */
        .events_nav {
            background: ${BROWN} !important;
            box-shadow: 0 0 80px ${ACCENT_PINK} !important;
            margin-top: 100px !important;
        }
        /* 16. цевта кнопок */
        .kai-btn-block {
            background-color:${BROWN} !important;
            color: ${WHITE} !important;
            border: none !important;
        }
        
        /* 17. Учебные подразделения */
        .institutes_slider_box.institutes_box.cf.disable-user-actions {
            box-shadow: 0 0 80px ${ACCENT_PINK} !important;
            margin-bottom: 120px !important;
        }
        
        /* 18. Кнопки навигации */
        .slick-prev, .slick-next {
            background: ${BROWN} !important;
            box-shadow: 0 0 40px ${WHITE} !important;
        }

        /* 19. Стрелки навигации */
        .inst-slide.prev.cf, .inst-slide.next {
            z-index: 9999 !important;
            opacity: 1 !important;
            width: 5% !important;
        }
    `;
    document.head.appendChild(style);
}
/////DOM - это представление веб-страницы в виде структуры, с которой может работать JavaScript.
/// Функция удаления стилей Pilates
function removePilatesStyles() {
    /// Ищем элемент стилей по ID
    const style = document.getElementById('PILATES-STYLE');
    /// Если стиль найден - удаляем его из DOM
    if (style) {
        style.remove();
    }
}


/// Функция демонстрации всех требуемых DOM методов
function demonstrateDOMMethods() {
    console.log(" Демонстрация DOM методов:");

    /// Используем getElementById для поиска элементов страницы
    const header = document.getElementById('header');
    if (header) {
        console.log("✅ getElementById: header найден");
    }

    /// Используем querySelector со сложным селектором (несколько классов)
    const instituteBox = document.querySelector('.institutes_slider_box.institutes_box');
    if (instituteBox) {
        console.log("✅ querySelector (сложный): элемент с двумя классами найден");
        
        /// Используем parentElement для получения родительского элемента
        const parent = instituteBox.parentElement;
        if (parent) {
            console.log("✅ parentElement: родительский элемент найден");
        }
        
        /// Используем children для получения дочерних элементов
        const children = instituteBox.children;
        console.log(`✅ children: найдено ${children.length} дочерних элементов`);
        
        /// Перебираем все дочерние элементы
        for (let i = 0; i < children.length; i++) {
            console.log(`   Дочерний элемент ${i}: ${children[i].tagName}`);
        }
    }

    /// Используем querySelectorAll для поиска всех ссылок
    const links = document.querySelectorAll('a');
    console.log(`✅ querySelectorAll: найдено ${links.length} ссылок`);
}

/// Функция создания кнопки для переключения темы с текстовым статусом
function createToggleButton() {
    /// Если кнопка уже существует - выходим из функции
    if (document.getElementById('pilates-toggle-btn')) {
        return;
    }

    /// Ищем контейнер для размещения кнопки
    const buttonContainer = document.querySelector('.box_links');
    if (!buttonContainer) {
        console.log('Контейнер для кнопки не найден');
        return;
    }

    /// Создаем элемент кнопки
    const button = document.createElement('div');
    button.id = 'pilates-toggle-btn';
    
    /// Добавляем текстовый статус (включен/выключен)
    const isEnabled = localStorage.getItem('pilatesStyle') === 'true';
    button.textContent = isEnabled ? '🎀 Pilates ВКЛ' : '🌙 Pilates ВЫКЛ';
    button.title = isEnabled ? 'Выключить Pilates стиль' : 'Включить Pilates стиль';
    
    /// Применяем стили к кнопке
    Object.assign(button.style, {
        padding: '8px 16px',
        border: `2px solid ${ACCENT_PINK}`,
        backgroundColor: isEnabled ? ACCENT_PINK : 'transparent',
        color: isEnabled ? WHITE : ACCENT_PINK,
        fontSize: '14px',
        cursor: 'pointer',
        margin: '0 0 0 10px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 10px ${BRIGHT_PINK}`,
        transition: 'all 0.3s ease',
        fontWeight: 'bold'
    });
    
    /// Добавляем обработчик события при наведении мыши
    button.addEventListener('mouseenter', function() {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = `0 0 15px ${BRIGHT_PINK}`;
    });
    
    /// Добавляем обработчик события когда мышь уходит
    button.addEventListener('mouseleave', function() {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = `0 0 10px ${BRIGHT_PINK}`;
    });
    
    /// Добавляем обработчик клика - переключает тему
    button.addEventListener('click', togglePilates);
    
    /// Добавляем созданную кнопку в контейнер
    buttonContainer.appendChild(button);
    console.log('Кнопка Pilates добавлена');
}

/// Функция переключения темы (вкл/выкл)
function togglePilates() {
    /// Проверяем, применены ли стили (есть ли элемент с ID)
    const isEnabled = document.getElementById('PILATES-STYLE') !== null;

    if (isEnabled) {
        /// Если стили включены - выключаем их
        removePilatesStyles();
        /// Сохраняем состояние 'выключено' в localStorage
        localStorage.setItem('pilatesStyle', 'false');
    } else {
        /// Если стили выключены - включаем их
        PILATES();
        /// Сохраняем состояние 'включено' в localStorage
        localStorage.setItem('pilatesStyle', 'true');
    }
    
    /// Обновляем текст кнопки
    updateButtonText();
    /// Показываем работу DOM методов после переключения
    demonstrateDOMMethods();
}

/// Функция обновления внешнего вида кнопки-переключателя
function updateButtonText() {
    const button = document.getElementById('pilates-toggle-btn');
    if (button) {
        const isEnabled = localStorage.getItem('pilatesStyle') === 'true';
        /// Обновляем текст и стили кнопки в зависимости от состояния
        button.textContent = isEnabled ? '🎀 Pilates ВКЛ' : '🌙 Pilates ВЫКЛ';
        button.title = isEnabled ? 'Выключить Pilates стиль' : 'Включить Pilates стиль';
        button.style.backgroundColor = isEnabled ? ACCENT_PINK : 'transparent';
        button.style.color = isEnabled ? WHITE : ACCENT_PINK;
    }
}

/// Функция показа информации об элементах страницы
function showDOMUsage() {
    console.log("Pilates запущен");
    
    /// Используем querySelectorAll для поиска всех заголовков
    const allTitles = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    console.log(`Всего заголовков на странице: ${allTitles.length}`);
    
    /// Используем сложные селекторы для поиска заголовков новостей
    const newsTitles = document.querySelectorAll('.portlet-content .title, .news_box .title');
    console.log(`Заголовков новостей: ${newsTitles.length}`);
    
    /// Ищем все кнопки на странице
    const allButtons = document.querySelectorAll('button, .button, .btn, input[type="submit"]');
    console.log(`Найдено кнопок: ${allButtons.length}`);
    
    console.log("Стили успешно применены!");
}

/// Функция проверки работы на других страницах
function checkOtherPages() {
    /// Получаем текущий путь страницы
    const currentPath = window.location.pathname;
    const isMainPage = currentPath === '/' || currentPath.includes('index');
    
    /// Проверяем, на какой странице мы находимся
    if (!isMainPage) {
        console.log(`Pilates стиль работает на странице: ${currentPath}`);
    } else {
        console.log("Pilates стиль работает на главной странице");
    }
}

/// Основная функция инициализации
function init() {
    console.log("Initializing Pilates");
    
    /// Создаем кнопку переключения
    createToggleButton();
    /// Показываем информацию об элементах
    showDOMUsage();
    /// Демонстрируем DOM методы
    demonstrateDOMMethods();
    /// Проверяем работу на других страницах
    checkOtherPages();
    
    /// Проверяем, были ли стили включены ранее
    const isEnabled = localStorage.getItem('pilatesStyle') === 'true';
    if (isEnabled) {
        /// Применяем стили если они были включены
        PILATES();
        /// Обновляем текст кнопки
        updateButtonText();
    }
    
    console.log("Initialization complete");
}

/// Этот блок проверяет состояние загрузки документа
if (document.readyState === 'loading') {
    /// Если документ еще грузится - ждем события DOMContentLoaded
    document.addEventListener('DOMContentLoaded', init);
} else {
    /// Если документ уже загружен - запускаем сразу
    init();
}