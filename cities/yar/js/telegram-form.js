// Перехват fetch для отправки в Telegram - ДОЛЖЕН ЗАГРУЖАТЬСЯ ДО app.js!
(function() {
    // Определяем поддомен
    function getSubdomain() {
        const host = window.location.hostname;
        const parts = host.split('.');
        if (parts.length >= 3) {
            return parts[0];
        }
        return 'sar';
    }

    // Отправка в Telegram
    function sendToTelegram(name, phone, type) {
        if (!name || !phone || phone.length < 6) return;
        
        const subdomain = getSubdomain();
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/telegram/send.php', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            name: name,
            phone: phone,
            type: type || 'Заявка',
            subdomain: subdomain
        }));
    }

    // Сохраняем оригинальный fetch
    const _fetch = window.fetch;
    
    // Перехватываем fetch
    window.fetch = function(url, options) {
        const urlStr = String(url || '');
        
        // Ловим запросы к API лидов
        if (urlStr.indexOf('api/lead') !== -1 || urlStr.indexOf('setLead') !== -1) {
            try {
                if (options && options.body) {
                    const data = JSON.parse(options.body);
                    const name = data.name || '';
                    const phone = data.phone || '';
                    const type = data.services || data.service || data.type || 'Заявка';
                    
                    sendToTelegram(name, phone, type);
                }
            } catch (e) {
                console.log('TG parse error:', e);
            }
        }
        
        // Вызываем оригинальный fetch
        return _fetch.apply(this, arguments);
    };
    
    console.log('Telegram form interceptor loaded');
})();
