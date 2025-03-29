document.addEventListener('DOMContentLoaded', function() {
    // Настройки валют
    const currencyRates = {
        'RUB': { symbol: '₽', rate: 1, name: 'Рубль' },
        'USD': { symbol: '$', rate: 0.011, name: 'Доллар' },
        'EUR': { symbol: '€', rate: 0.010, name: 'Евро' },
        'CNY': { symbol: '¥', rate: 0.079, name: 'Юань' },
        'BYN': { symbol: 'Br', rate: 0.035, name: 'Бел.руб' },
        'KZT': { symbol: '₸', rate: 5.0, name: 'Тенге' }
    };
    
    let currentCurrency = 'RUB';
    let totalAmount = 0;
    let budgetLimit = 0;
    let componentCounter = {
        storage: 1,
        fans: 1
    };
    let currentCoverImage = null;

    // Обработчик загрузки обложки
    document.getElementById('cover-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            currentCoverImage = e.target.result;
            const preview = document.getElementById('coverPreview');
            preview.innerHTML = '';
            
            const img = document.createElement('img');
            img.src = currentCoverImage;
            img.style.maxHeight = '150px';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });

    // Инициализация темы
    function initTheme() {
        const savedTheme = localStorage.getItem('pcBuilderTheme') || 'cyberpunk';
        document.body.className = savedTheme;
        document.getElementById('themeToggle').setAttribute('data-theme', savedTheme);
        
        // Обновляем активную кнопку темы
        document.querySelectorAll('.theme-options button').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === savedTheme);
        });
    }

    // Переключение темы
    document.getElementById('themeToggle').addEventListener('click', function() {
        const options = document.querySelector('.theme-options');
        options.style.display = options.style.display === 'flex' ? 'none' : 'flex';
    });

    document.querySelectorAll('.theme-options button').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            document.body.className = theme;
            document.getElementById('themeToggle').setAttribute('data-theme', theme);
            localStorage.setItem('pcBuilderTheme', theme);
            
            // Обновляем активную кнопку
            document.querySelectorAll('.theme-options button').forEach(b => {
                b.classList.toggle('active', b === this);
            });
            
            document.querySelector('.theme-options').style.display = 'none';
        });
    });

    // Добавление дополнительных накопителей
    document.getElementById('add-storage-btn').addEventListener('click', function() {
        componentCounter.storage++;
        const id = `storage-${componentCounter.storage}`;
        
        const storageGroup = document.createElement('div');
        storageGroup.className = 'component-group additional-component';
        storageGroup.id = `${id}-group`;
        
        storageGroup.innerHTML = `
            <div class="component-header">
                <h3 class="component-title"><i class="component-icon fas fa-hdd"></i> Накопитель (дополнительный)</h3>
                <span class="remove-component" data-id="${id}">×</span>
            </div>
            <div class="input-row">
                <div class="name-link">
                    <input type="text" id="${id}-name" placeholder="Название модели">
                    <input type="url" id="${id}-link" placeholder="Ссылка на товар">
                </div>
                <div class="price-qty">
                    <input type="number" id="${id}-price" placeholder="Цена" min="0" step="100" class="price-input">
                    <div class="qty-control">
                        <span>Кол-во:</span>
                        <input type="number" id="${id}-quantity" value="1" min="1">
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('additional-storage-container').appendChild(storageGroup);
        
        // Добавляем обработчик для кнопки удаления
        storageGroup.querySelector('.remove-component').addEventListener('click', function() {
            document.getElementById('additional-storage-container').removeChild(storageGroup);
            calculateTotal();
        });
        
        // Добавляем обработчики для новых полей ввода
        storageGroup.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', calculateTotal);
            input.addEventListener('change', calculateTotal);
        });
    });

    // Добавление дополнительных вентиляторов
    document.getElementById('add-fans-btn').addEventListener('click', function() {
        componentCounter.fans++;
        const id = `fans-${componentCounter.fans}`;
        
        const fansGroup = document.createElement('div');
        fansGroup.className = 'component-group additional-component';
        fansGroup.id = `${id}-group`;
        
        fansGroup.innerHTML = `
            <div class="component-header">
                <h3 class="component-title"><i class="component-icon fas fa-wind"></i> Вентиляторы (дополнительные)</h3>
                <span class="remove-component" data-id="${id}">×</span>
            </div>
            <div class="input-row">
                <div class="name-link">
                    <input type="text" id="${id}-name" placeholder="Название модели">
                    <input type="url" id="${id}-link" placeholder="Ссылка на товар">
                </div>
                <div class="price-qty">
                    <input type="number" id="${id}-price" placeholder="Цена" min="0" step="100" class="price-input">
                    <div class="qty-control">
                        <span>Кол-во:</span>
                        <input type="number" id="${id}-quantity" value="1" min="1">
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('additional-fans-container').appendChild(fansGroup);
        
        // Добавляем обработчик для кнопки удаления
        fansGroup.querySelector('.remove-component').addEventListener('click', function() {
            document.getElementById('additional-fans-container').removeChild(fansGroup);
            calculateTotal();
        });
        
        // Добавляем обработчики для новых полей ввода
        fansGroup.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', calculateTotal);
            input.addEventListener('change', calculateTotal);
        });
    });

    // Расчет общей стоимости
    function calculateTotal() {
        totalAmount = 0;
        
        // Основные компоненты
        document.querySelectorAll('.price-input').forEach(priceInput => {
            const price = parseFloat(priceInput.value) || 0;
            const idPrefix = priceInput.id.replace('-price', '');
            const qty = parseFloat(document.getElementById(`${idPrefix}-quantity`).value) || 0;
            totalAmount += price * qty;
        });
        
        // Дополнительные компоненты
        document.querySelectorAll('.additional-component .price-input').forEach(priceInput => {
            const price = parseFloat(priceInput.value) || 0;
            const idPrefix = priceInput.id.replace('-price', '');
            const qty = parseFloat(document.getElementById(`${idPrefix}-quantity`).value) || 0;
            totalAmount += price * qty;
        });
        
        updateTotalDisplay();
        updateBudgetProgress();
        updatePriceColors();
    }

    // Обновление отображения итоговой суммы
    function updateTotalDisplay() {
        const convertedAmount = totalAmount * currencyRates[currentCurrency].rate;
        document.getElementById('totalPrice').textContent = 
            convertedAmount.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + 
            ' ' + currencyRates[currentCurrency].symbol;
    }

    // Обновление прогресс-бара бюджета
    function updateBudgetProgress() {
        budgetLimit = parseFloat(document.getElementById('budget-limit').value) || 0;
        const progress = budgetLimit > 0 ? Math.min((totalAmount / budgetLimit) * 100, 100) : 0;
        
        document.getElementById('budgetProgress').style.width = progress + '%';
        document.getElementById('budgetPercent').textContent = Math.round(progress) + '%';
    }

    // Цветовая маркировка цен
    function updatePriceColors() {
        const budgetLimit = parseFloat(document.getElementById('budget-limit').value) || 0;
        
        document.querySelectorAll('.price-input').forEach(input => {
            const price = parseFloat(input.value) || 0;
            const idPrefix = input.id.replace('-price', '');
            const qty = parseFloat(document.getElementById(`${idPrefix}-quantity`).value) || 0;
            const totalPrice = price * qty;
            
            // Сброс классов
            input.classList.remove('within-budget', 'near-budget', 'over-budget');
            
            if (budgetLimit > 0) {
                const percent = (totalPrice / budgetLimit) * 100;
                
                if (percent > 50) {
                    input.classList.add('over-budget');
                } else if (percent > 30) {
                    input.classList.add('near-budget');
                } else if (totalPrice > 0) {
                    input.classList.add('within-budget');
                }
            }
        });
    }

    // Изменение валюты
    document.getElementById('budget-currency').addEventListener('change', function() {
        currentCurrency = this.value;
        updateTotalDisplay();
    });

    // Получение иконки для ссылки
    function getLinkIcon(url) {
        if (!url) return 'fa-link';
        
        try {
            const domain = new URL(url).hostname;
            
            if (domain.includes('aliexpress')) return 'fa-shopping-cart';
            if (domain.includes('amazon')) return 'fa-amazon';
            if (domain.includes('ebay')) return 'fa-ebay';
            if (domain.includes('citilink')) return 'fa-store';
            if (domain.includes('dns-shop')) return 'fa-store';
            if (domain.includes('wildberries')) return 'fa-shopping-bag';
            if (domain.includes('ozon')) return 'fa-shopping-basket';
            if (domain.includes('yandex')) return 'fa-yandex';
            if (domain.includes('market')) return 'fa-shopping-cart';
            
            return 'fa-link';
        } catch {
            return 'fa-link';
        }
    }

    // Сохранение сборки
    document.getElementById('saveBuildBtn').addEventListener('click', function() {
        const buildName = document.getElementById('build-name').value.trim();
        
        if (!buildName) {
            alert('Пожалуйста, укажите название сборки');
            return;
        }
        
        // Собираем данные о сборке
        const buildData = {
            name: buildName,
            budget: parseFloat(document.getElementById('budget-limit').value) || 0,
            description: document.getElementById('build-description').value,
            components: {},
            additionalComponents: {
                storage: [],
                fans: []
            },
            timestamp: new Date().getTime(),
            currency: currentCurrency,
            theme: document.body.className,
            coverImage: currentCoverImage
        };
        
        // Основные компоненты
        const componentIds = [
            'cpu', 'motherboard', 'ram', 'gpu', 'cooling', 
            'storage', 'psu', 'case', 'fans'
        ];
        
        componentIds.forEach(id => {
            buildData.components[id] = {
                name: document.getElementById(`${id}-name`).value,
                link: document.getElementById(`${id}-link`).value,
                price: parseFloat(document.getElementById(`${id}-price`).value) || 0,
                quantity: parseInt(document.getElementById(`${id}-quantity`).value) || 1
            };
        });
        
        // Дополнительные накопители
        document.querySelectorAll('#additional-storage-container .component-group').forEach((group, index) => {
            const id = `storage-${index + 2}`;
            buildData.additionalComponents.storage.push({
                name: document.getElementById(`${id}-name`).value,
                link: document.getElementById(`${id}-link`).value,
                price: parseFloat(document.getElementById(`${id}-price`).value) || 0,
                quantity: parseInt(document.getElementById(`${id}-quantity`).value) || 1
            });
        });
        
        // Дополнительные вентиляторы
        document.querySelectorAll('#additional-fans-container .component-group').forEach((group, index) => {
            const id = `fans-${index + 2}`;
            buildData.additionalComponents.fans.push({
                name: document.getElementById(`${id}-name`).value,
                link: document.getElementById(`${id}-link`).value,
                price: parseFloat(document.getElementById(`${id}-price`).value) || 0,
                quantity: parseInt(document.getElementById(`${id}-quantity`).value) || 1
            });
        });
        
        // Сохраняем сборку в localStorage
        let savedBuilds = JSON.parse(localStorage.getItem('pcBuilds')) || {};
        savedBuilds[buildName] = buildData;
        localStorage.setItem('pcBuilds', JSON.stringify(savedBuilds));
        
        alert(`Сборка "${buildName}" успешно сохранена!`);
        
        // Очищаем форму после сохранения
        document.getElementById('pcConfigForm').reset();
        document.getElementById('additional-storage-container').innerHTML = '';
        document.getElementById('additional-fans-container').innerHTML = '';
        document.getElementById('coverPreview').innerHTML = '';
        document.getElementById('cover-upload').value = '';
        currentCoverImage = null;
        componentCounter.storage = 1;
        componentCounter.fans = 1;
        calculateTotal();
    });

    // Функция для генерации HTML для просмотра сборки
    function generateBuildViewHTML(buildData) {
        let html = `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${buildData.name} - Конфигурация ПК</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        max-width: 1000px;
                        margin: 0 auto;
                        padding: 20px;
                        line-height: 1.6;
                    }
                    
                    ${buildData.theme === 'cyberpunk' ? `
                    body {
                        background-color: #0d0221;
                        color: #d1f7ff;
                    }
                    ` : ''}
                    
                    ${buildData.theme === 'minimal' ? `
                    body {
                        background-color: #f5f6fa;
                        color: #2f3542;
                    }
                    ` : ''}
                    
                    ${buildData.theme === 'anime' ? `
                    body {
                        background: url('https://wallpapers.99px.ru/wallpapers/download/358557/') center/cover no-repeat fixed;
                        color: #5e3d5e;
                        position: relative;
                    }
                    
                    body::before {
                        content: "";
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(255, 255, 255, 0.7);
                        z-index: -1;
                    }
                    ` : ''}
                    
                    h1 {
                        color: ${buildData.theme === 'cyberpunk' ? '#05d9e8' : 
                                 buildData.theme === 'minimal' ? '#3498db' : '#ff6b9a'};
                        border-bottom: 2px solid ${buildData.theme === 'cyberpunk' ? '#05d9e8' : 
                                               buildData.theme === 'minimal' ? '#3498db' : '#ff6b9a'};
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    
                    h2 {
                        color: ${buildData.theme === 'cyberpunk' ? '#ff2a6d' : 
                                buildData.theme === 'minimal' ? '#2ecc71' : '#a37acc'};
                        border-bottom: 1px solid ${buildData.theme === 'cyberpunk' ? '#ff2a6d' : 
                                               buildData.theme === 'minimal' ? '#2ecc71' : '#a37acc'};
                        padding-bottom: 5px;
                        margin: 25px 0 15px;
                    }
                    
                    .component-section {
                        margin-bottom: 15px;
                        padding: 15px;
                        background-color: white;
                        border-radius: 5px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                        border-left: 3px solid ${buildData.theme === 'cyberpunk' ? '#ff2a6d' : 
                                              buildData.theme === 'minimal' ? '#3498db' : '#ff6b9a'};
                        position: relative;
                    }
                    
                    ${buildData.theme === 'cyberpunk' ? `
                    .component-section {
                        background-color: rgba(10, 3, 29, 0.6);
                    }
                    ` : ''}
                    
                    ${buildData.theme === 'anime' ? `
                    .component-section {
                        background-color: rgba(255, 255, 255, 0.9);
                    }
                    ` : ''}
                    
                    .component-title {
                        font-weight: bold;
                        color: ${buildData.theme === 'cyberpunk' ? '#05d9e8' : 
                                buildData.theme === 'minimal' ? '#3498db' : '#5e3d5e'};
                        margin-top: 0;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .component-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                        padding: 8px 0;
                        border-bottom: 1px dashed ${buildData.theme === 'cyberpunk' ? 'rgba(5, 217, 232, 0.3)' : 
                                                  buildData.theme === 'minimal' ? '#eee' : '#f0d6e8'};
                    }
                    
                    .component-row:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                    }
                    
                    .product-link {
                        color: ${buildData.theme === 'cyberpunk' ? '#ff2a6d' : 
                                buildData.theme === 'minimal' ? '#2ecc71' : '#5d9cec'};
                        text-decoration: none;
                        transition: all 0.2s;
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                    }
                    
                    .product-link:hover {
                        text-decoration: underline;
                    }
                    
                    .total-section {
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 2px solid ${buildData.theme === 'cyberpunk' ? '#05d9e8' : 
                                                buildData.theme === 'minimal' ? '#3498db' : '#ff6b9a'};
                        text-align: right;
                        font-size: 1.5em;
                        font-weight: bold;
                    }
                    
                    .description {
                        margin-top: 30px;
                        padding: 15px;
                        background-color: ${buildData.theme === 'cyberpunk' ? 'rgba(5, 217, 232, 0.1)' : 
                                           buildData.theme === 'minimal' ? '#ecf0f1' : '#fff0f5'};
                        border-radius: 5px;
                        border-left: 3px solid ${buildData.theme === 'cyberpunk' ? '#ff2a6d' : 
                                              buildData.theme === 'minimal' ? '#2ecc71' : '#a37acc'};
                    }
                    
                    .buttons {
                        margin-top: 30px;
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    
                    .buttons a {
                        display: inline-block;
                        padding: 10px 15px;
                        background: ${buildData.theme === 'cyberpunk' ? 'linear-gradient(135deg, #ff2a6d, #d300c5)' : 
                                     buildData.theme === 'minimal' ? 'linear-gradient(135deg, #3498db, #2980b9)' : 
                                     'linear-gradient(135deg, #ff6b9a, #a37acc)'};
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        transition: all 0.3s;
                    }
                    
                    .buttons a:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                    
                    .build-cover {
                        height: 250px;
                        background-color: #f0f0f0;
                        margin-bottom: 25px;
                        border-radius: 8px;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    }
                    
                    ${buildData.theme === 'cyberpunk' ? `
                    .build-cover {
                        background-color: rgba(5, 217, 232, 0.1);
                        border: 1px solid rgba(5, 217, 232, 0.3);
                    }
                    ` : ''}
                    
                    ${buildData.theme === 'anime' ? `
                    .build-cover {
                        background-color: #fff0f5;
                        border: 1px solid #ffb6c1;
                    }
                    ` : ''}
                    
                    .build-cover img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    
                    .build-info {
                        margin-bottom: 20px;
                        padding: 15px;
                        background-color: ${buildData.theme === 'cyberpunk' ? 'rgba(5, 217, 232, 0.1)' : 
                                           buildData.theme === 'minimal' ? '#ecf0f1' : '#fff0f5'};
                        border-radius: 5px;
                        border-left: 3px solid ${buildData.theme === 'cyberpunk' ? '#ff2a6d' : 
                                              buildData.theme === 'minimal' ? '#2ecc71' : '#a37acc'};
                    }
                    
                    .build-info p {
                        margin: 5px 0;
                    }
                    
                    .build-info strong {
                        color: ${buildData.theme === 'cyberpunk' ? '#05d9e8' : 
                                buildData.theme === 'minimal' ? '#3498db' : '#5e3d5e'};
                    }
                    
                    @media print {
                        .buttons {
                            display: none;
                        }
                        
                        body::before {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body class="${buildData.theme}">
                <h1>${buildData.name}</h1>
                
                ${buildData.coverImage ? `
                <div class="build-cover">
                    <img src="${buildData.coverImage}" alt="Обложка сборки">
                </div>
                ` : ''}
                
                <div class="build-info">
                    <p><strong>Бюджет:</strong> ${buildData.budget.toLocaleString('ru-RU')} ${currencyRates[buildData.currency].symbol}</p>
                    <p><strong>Дата создания:</strong> ${new Date(buildData.timestamp).toLocaleString()}</p>
                </div>
                
                <h2>Компоненты</h2>
        `;
        
        // Основные компоненты
        for (const [id, component] of Object.entries(buildData.components)) {
            if (component.name) {
                const componentNames = {
                    'cpu': 'Процессор',
                    'motherboard': 'Материнская плата',
                    'ram': 'Оперативная память',
                    'gpu': 'Видеокарта',
                    'cooling': 'Охлаждение',
                    'storage': 'Накопитель (основной)',
                    'psu': 'Блок питания',
                    'case': 'Корпус',
                    'fans': 'Вентиляторы (основные)'
                };
                
                html += `
                    <div class="component-section">
                        <div class="component-title">
                            <i class="fas ${id === 'cpu' ? 'fa-microchip' : 
                                          id === 'motherboard' ? 'fa-project-diagram' : 
                                          id === 'ram' ? 'fa-memory' : 
                                          id === 'gpu' ? 'fa-gamepad' : 
                                          id === 'cooling' ? 'fa-fan' : 
                                          id === 'storage' ? 'fa-hdd' : 
                                          id === 'psu' ? 'fa-plug' : 
                                          id === 'case' ? 'fa-desktop' : 
                                          'fa-wind'}"></i> 
                            ${componentNames[id]}
                        </div>
                        <div class="component-row">
                            <span>${component.name}</span>
                            <span>${(component.price * component.quantity).toLocaleString('ru-RU')} ${currencyRates[buildData.currency].symbol}</span>
                        </div>
                        ${component.link ? `<div class="component-row"><a href="${component.link}" class="product-link" target="_blank"><i class="fas ${getLinkIcon(component.link)}"></i> Ссылка на товар</a></div>` : ''}
                        ${component.quantity > 1 ? `<div class="component-row">Количество: ${component.quantity}</div>` : ''}
                    </div>
                `;
            }
        }
        
        // Дополнительные накопители
        if (buildData.additionalComponents.storage.length > 0) {
            buildData.additionalComponents.storage.forEach((storage, index) => {
                if (storage.name) {
                    html += `
                        <div class="component-section">
                            <div class="component-title">
                                <i class="fas fa-hdd"></i> Накопитель (дополнительный ${index + 1})
                            </div>
                            <div class="component-row">
                                <span>${storage.name}</span>
                                <span>${(storage.price * storage.quantity).toLocaleString('ru-RU')} ${currencyRates[buildData.currency].symbol}</span>
                            </div>
                            ${storage.link ? `<div class="component-row"><a href="${storage.link}" class="product-link" target="_blank"><i class="fas ${getLinkIcon(storage.link)}"></i> Ссылка на товар</a></div>` : ''}
                            ${storage.quantity > 1 ? `<div class="component-row">Количество: ${storage.quantity}</div>` : ''}
                        </div>
                    `;
                }
            });
        }
        
        // Дополнительные вентиляторы
        if (buildData.additionalComponents.fans.length > 0) {
            buildData.additionalComponents.fans.forEach((fans, index) => {
                if (fans.name) {
                    html += `
                        <div class="component-section">
                            <div class="component-title">
                                <i class="fas fa-wind"></i> Вентиляторы (дополнительные ${index + 1})
                            </div>
                            <div class="component-row">
                                <span>${fans.name}</span>
                                <span>${(fans.price * fans.quantity).toLocaleString('ru-RU')} ${currencyRates[buildData.currency].symbol}</span>
                            </div>
                            ${fans.link ? `<div class="component-row"><a href="${fans.link}" class="product-link" target="_blank"><i class="fas ${getLinkIcon(fans.link)}"></i> Ссылка на товар</a></div>` : ''}
                            ${fans.quantity > 1 ? `<div class="component-row">Количество: ${fans.quantity}</div>` : ''}
                        </div>
                    `;
                }
            });
        }
        
        // Рассчитываем общую стоимость
        let total = 0;
        
        // Основные компоненты
        Object.values(buildData.components).forEach(component => {
            total += component.price * component.quantity;
        });
        
        // Дополнительные компоненты
        Object.values(buildData.additionalComponents).forEach(components => {
            components.forEach(component => {
                total += component.price * component.quantity;
            });
        });
        
        // Описание
        html += `
            <div class="total-section">
                Итого: ${total.toLocaleString('ru-RU')} ${currencyRates[buildData.currency].symbol}
            </div>
            
            ${buildData.description ? `
            <div class="description">
                <h3>Описание сборки</h3>
                <p>${buildData.description.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            
            <div class="buttons">
                <a href="index.html"><i class="fas fa-arrow-left"></i> Вернуться к конфигуратору</a>
                <a href="#" onclick="window.print(); return false;"><i class="fas fa-print"></i> Печать</a>
                <a href="#" id="exportPdf"><i class="fas fa-file-pdf"></i> Экспорт в PDF</a>
                <a href="#" id="shareBuild"><i class="fas fa-share-alt"></i> Поделиться</a>
            </div>
            
            <script>
                document.getElementById('exportPdf').addEventListener('click', function() {
                    const element = document.body;
                    const opt = {
                        margin: 10,
                        filename: '${buildData.name.replace(/[^a-zа-яё0-9]/gi, '_')}_конфигурация.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { 
                            scale: 2,
                            logging: true,
                            useCORS: true
                        },
                        jsPDF: { 
                            unit: 'mm', 
                            format: 'a4', 
                            orientation: 'portrait'
                        }
                    };
                    
                    html2pdf().from(element).set(opt).save();
                });
                
                document.getElementById('shareBuild').addEventListener('click', function() {
                    const url = window.location.href.split('?')[0] + '?build=' + encodeURIComponent('${JSON.stringify(buildData)}');
                    
                    if (navigator.share) {
                        navigator.share({
                            title: '${buildData.name} - Конфигурация ПК',
                            text: 'Посмотрите мою сборку ПК',
                            url: url
                        }).catch(err => {
                            console.error('Ошибка при использовании API share:', err);
                            copyToClipboard(url);
                        });
                    } else {
                        copyToClipboard(url);
                    }
                    
                    function copyToClipboard(text) {
                        navigator.clipboard.writeText(text).then(() => {
                            alert('Ссылка на сборку скопирована в буфер обмена!');
                        }).catch(err => {
                            console.error('Ошибка копирования: ', err);
                            prompt('Скопируйте эту ссылку вручную:', text);
                        });
                    }
                });
            </script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            </body>
            </html>
        `;
        // Внутри функции generateBuildViewHTML обновляем стили для кнопок ссылок
html += `
    <style>
        .component-actions {
            margin-top: 10px;
        }
        
        .link-button {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 0.85rem;
            transition: all 0.2s;
        }
        
        body.cyberpunk .link-button {
            background-color: rgba(255, 42, 109, 0.2);
            color: var(--secondary-color);
            border: 1px solid var(--secondary-color);
        }
        
        body.minimal .link-button {
            background-color: rgba(52, 152, 219, 0.2);
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
        }
        
        body.anime .link-button {
            background-color: rgba(255, 107, 154, 0.2);
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
        }
        
        .link-button:hover {
            transform: translateY(-1px);
        }
    </style>
`;
        return html;
    }

    // Загрузка списка сборок
    function loadBuildsList() {
        const buildsList = document.getElementById('buildsList');
        buildsList.innerHTML = '';
        
        const savedBuilds = JSON.parse(localStorage.getItem('pcBuilds')) || {};
        
        if (Object.keys(savedBuilds).length === 0) {
            buildsList.innerHTML = '<p>У вас пока нет сохранённых сборок</p>';
            return;
        }
        
        Object.entries(savedBuilds).forEach(([name, build]) => {
            const buildCard = document.createElement('div');
            buildCard.className = 'build-card';
            
            // Рассчитываем общую стоимость
            let total = 0;
            
            Object.values(build.components).forEach(component => {
                total += component.price * component.quantity;
            });
            
            Object.values(build.additionalComponents).forEach(components => {
                components.forEach(component => {
                    total += component.price * component.quantity;
                });
            });
            
            buildCard.innerHTML = `
                <div class="build-cover">
                    ${build.coverImage ? 
                        `<img src="${build.coverImage}" alt="Обложка сборки">` : 
                        `<div class="placeholder">Нет обложки</div>`}
                </div>
                <h3>${name}</h3>
                <p>Бюджет: ${build.budget.toLocaleString('ru-RU')} ${currencyRates[build.currency].symbol}</p>
                <p class="total">Итого: ${total.toLocaleString('ru-RU')} ${currencyRates[build.currency].symbol}</p>
                <p>${build.description ? build.description.substring(0, 50) + '...' : 'Нет описания'}</p>
                <div class="build-actions">
                    <button class="load-build" data-name="${name}">Загрузить</button>
                    <button class="view-build" data-name="${name}">Просмотр</button>
                    <button class="delete-build" data-name="${name}">Удалить</button>
                </div>
            `;
            
            buildsList.appendChild(buildCard);
        });
        
        // Добавляем обработчики для кнопок
        document.querySelectorAll('.load-build').forEach(button => {
            button.addEventListener('click', function() {
                const buildName = this.getAttribute('data-name');
                loadBuild(buildName);
                document.getElementById('buildsModal').style.display = 'none';
            });
        });
        
        document.querySelectorAll('.view-build').forEach(button => {
            button.addEventListener('click', function() {
                const buildName = this.getAttribute('data-name');
                viewBuild(buildName);
            });
        });
        
        document.querySelectorAll('.delete-build').forEach(button => {
            button.addEventListener('click', function() {
                const buildName = this.getAttribute('data-name');
                if (confirm(`Вы уверены, что хотите удалить сборку "${buildName}"?`)) {
                    deleteBuild(buildName);
                    loadBuildsList();
                }
            });
        });
    }
    
    // Просмотр сборки в новом окне
    function viewBuild(buildName) {
        const savedBuilds = JSON.parse(localStorage.getItem('pcBuilds')) || {};
        const build = savedBuilds[buildName];
        
        if (!build) {
            alert('Сборка не найдена');
            return;
        }
        
        const buildHTML = generateBuildViewHTML(build);
        const newWindow = window.open('', '_blank');
        newWindow.document.write(buildHTML);
        newWindow.document.close();
    }
    
    // Загрузка конкретной сборки
    function loadBuild(buildName) {
        const savedBuilds = JSON.parse(localStorage.getItem('pcBuilds')) || {};
        const build = savedBuilds[buildName];
        
        if (!build) {
            alert('Сборка не найдена');
            return;
        }
        
        // Очищаем форму
        document.getElementById('pcConfigForm').reset();
        document.getElementById('additional-storage-container').innerHTML = '';
        document.getElementById('additional-fans-container').innerHTML = '';
        document.getElementById('coverPreview').innerHTML = '';
        document.getElementById('cover-upload').value = '';
        componentCounter.storage = 1;
        componentCounter.fans = 1;
        
        // Заполняем основные поля
        document.getElementById('build-name').value = build.name;
        document.getElementById('budget-limit').value = build.budget;
        document.getElementById('budget-currency').value = build.currency;
        document.getElementById('build-description').value = build.description || '';
        currentCurrency = build.currency;
        currentCoverImage = build.coverImage || null;
        
        if (currentCoverImage) {
            const preview = document.getElementById('coverPreview');
            const img = document.createElement('img');
            img.src = currentCoverImage;
            img.style.maxHeight = '150px';
            preview.appendChild(img);
        }
        
        // Устанавливаем тему
        if (build.theme) {
            document.body.className = build.theme;
            document.getElementById('themeToggle').setAttribute('data-theme', build.theme);
        }
        
        // Заполняем основные компоненты
        Object.entries(build.components).forEach(([id, component]) => {
            document.getElementById(`${id}-name`).value = component.name || '';
            document.getElementById(`${id}-link`).value = component.link || '';
            document.getElementById(`${id}-price`).value = component.price || 0;
            document.getElementById(`${id}-quantity`).value = component.quantity || 1;
        });
        
        // Добавляем дополнительные накопители
        build.additionalComponents.storage.forEach((storage, index) => {
            if (index > 0) {
                document.getElementById('add-storage-btn').click();
            }
            
            const id = `storage-${index + 2}`;
            document.getElementById(`${id}-name`).value = storage.name || '';
            document.getElementById(`${id}-link`).value = storage.link || '';
            document.getElementById(`${id}-price`).value = storage.price || 0;
            document.getElementById(`${id}-quantity`).value = storage.quantity || 1;
        });
        
        // Добавляем дополнительные вентиляторы
        build.additionalComponents.fans.forEach((fans, index) => {
            if (index > 0) {
                document.getElementById('add-fans-btn').click();
            }
            
            const id = `fans-${index + 2}`;
            document.getElementById(`${id}-name`).value = fans.name || '';
            document.getElementById(`${id}-link`).value = fans.link || '';
            document.getElementById(`${id}-price`).value = fans.price || 0;
            document.getElementById(`${id}-quantity`).value = fans.quantity || 1;
        });
        
        // Обновляем итоговую стоимость
        calculateTotal();
    }
    
    // Удаление сборки
    function deleteBuild(buildName) {
        const savedBuilds = JSON.parse(localStorage.getItem('pcBuilds')) || {};
        delete savedBuilds[buildName];
        localStorage.setItem('pcBuilds', JSON.stringify(savedBuilds));
    }
    
    // Открытие модального окна со списком сборок
    document.getElementById('loadBuildsBtn').addEventListener('click', function() {
        document.getElementById('buildsModal').style.display = 'block';
        loadBuildsList();
    });
    
    // Закрытие модального окна
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('buildsModal').style.display = 'none';
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('buildsModal')) {
            document.getElementById('buildsModal').style.display = 'none';
        }
    });
    
    // Проверяем, есть ли данные сборки в URL
    function checkUrlForBuildData() {
        const urlParams = new URLSearchParams(window.location.search);
        const buildDataParam = urlParams.get('build');
        
        if (buildDataParam) {
            try {
                const buildData = JSON.parse(decodeURIComponent(buildDataParam));
                
                if (confirm('Хотите загрузить сборку из ссылки?')) {
                    // Сохраняем сборку
                    let savedBuilds = JSON.parse(localStorage.getItem('pcBuilds')) || {};
                    savedBuilds[buildData.name] = buildData;
                    localStorage.setItem('pcBuilds', JSON.stringify(savedBuilds));
                    
                    // Загружаем сборку
                    loadBuild(buildData.name);
                }
                
                // Удаляем параметр из URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                console.error('Ошибка загрузки сборки из URL:', e);
            }
        }
    }
    
    // Обработчики событий для полей ввода
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('change', function() {
            if (this.id === 'budget-limit') {
                updateBudgetProgress();
                updatePriceColors();
            } else {
                calculateTotal();
            }
        });
        
        input.addEventListener('input', function() {
            if (this.id === 'budget-limit') {
                updateBudgetProgress();
                updatePriceColors();
            } else if (this.classList.contains('price-input') || this.id.includes('-quantity')) {
                calculateTotal();
            }
        });
    });
    
    // Инициализация приложения
    initTheme();
    calculateTotal();
    checkUrlForBuildData();
});