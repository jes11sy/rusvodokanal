// Отправка заявок в Telegram - перехват всех fetch запросов к API
(function() {
    // Определяем поддомен
    function getSubdomain() {
        const host = window.location.hostname;
        const parts = host.split('.');
        if (parts.length >= 3) {
            return parts[0]; // sar, eng, uly, tol, pnz, yar, oms
        }
        return 'sar'; // по умолчанию Саратов
    }

    // Отправка в Telegram
    function sendToTelegram(name, phone, type) {
        const subdomain = getSubdomain();
        
        fetch('/api/telegram/send.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                phone: phone,
                type: type || 'Заявка',
                subdomain: subdomain
            })
        }).catch(err => console.error('Telegram error:', err));
    }

    // Перехватываем оригинальный fetch ДО загрузки app.js
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        const urlStr = String(url || '');
        
        // Перехватываем запросы к API лидов
        if (urlStr.includes('api/lead') || urlStr.includes('setLead')) {
            try {
                const body = options?.body;
                if (body) {
                    const data = JSON.parse(body);
                    const name = data.name || '';
                    const phone = data.phone || '';
                    const type = data.services || data.service || data.type || 'Заявка';
                    
                    if (name && phone) {
                        console.log('Telegram: отправка заявки', name, phone, type);
                        sendToTelegram(name, phone, type);
                    }
                }
            } catch (e) {
                console.error('Telegram parse error:', e);
            }
        }
        
        // Вызываем оригинальный fetch
        return originalFetch.apply(this, arguments);
    };

    // Также перехватываем клики по кнопкам напрямую
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.header-form__btn, .modal-form__btn, .about-form__btn, .form__btn, .footer__btn').forEach(btn => {
            btn.addEventListener('click', function() {
                setTimeout(() => {
                    const form = this.closest('form');
                    if (!form) return;
                    
                    const name = form.querySelector('[name="name"], [name="header-name"]')?.value || '';
                    const phone = form.querySelector('[name="phone"], [name="header-phone"]')?.value || '';
                    
                    let type = 'Заявка';
                    const selected = document.querySelector('.modal-form-select__checked, .about-form-select__checked, .application-form-select__checked');
                    if (selected) {
                        type = selected.textContent.trim();
                    } else if (form.id === 'header-form') {
                        type = 'Перезвоните мне';
                    }
                    
                    if (name && phone && phone.length > 5) {
                        sendToTelegram(name, phone, type);
                    }
                }, 100);
            });
        });
    });
})();
