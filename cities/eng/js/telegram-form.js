// Отправка заявок в Telegram
(function() {
    // Определяем поддомен
    function getSubdomain() {
        const host = window.location.hostname;
        const parts = host.split('.');
        if (parts.length >= 3) {
            return parts[0]; // sar, eng, uly, tol, pnz, yar, oms
        }
        return 'rusvodokanal';
    }

    // Отправка в Telegram
    async function sendToTelegram(name, phone, type) {
        const subdomain = getSubdomain();
        
        try {
            const response = await fetch('/api/telegram/send.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    phone: phone,
                    type: type,
                    subdomain: subdomain
                })
            });
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Telegram send error:', error);
            return false;
        }
    }

    // Перехватываем отправку форм
    document.addEventListener('DOMContentLoaded', function() {
        
        // Header form (Перезвоните мне)
        const headerForm = document.getElementById('header-form');
        if (headerForm) {
            headerForm.addEventListener('submit', function(e) {
                const name = headerForm.querySelector('[name="header-name"]')?.value || '';
                const phone = headerForm.querySelector('[name="header-phone"]')?.value || '';
                sendToTelegram(name, phone, 'Перезвоните мне');
            });
        }

        // Modal form (Вызов мастера)
        const modalForm = document.getElementById('modalForm-modal-form');
        if (modalForm) {
            modalForm.addEventListener('submit', function(e) {
                const name = modalForm.querySelector('[name="name"]')?.value || '';
                const phone = modalForm.querySelector('[name="phone"]')?.value || '';
                const selected = document.querySelector('.modal-form-select__checked');
                const type = selected ? selected.textContent.trim() : 'Вызов мастера';
                sendToTelegram(name, phone, type);
            });
        }

        // About form
        const aboutForm = document.getElementById('aboutForm-about');
        if (aboutForm) {
            aboutForm.addEventListener('submit', function(e) {
                const name = aboutForm.querySelector('[name="name"]')?.value || '';
                const phone = aboutForm.querySelector('[name="phone"]')?.value || '';
                const selected = document.querySelector('.about-form-select__checked');
                const type = selected ? selected.textContent.trim() : 'Заявка';
                sendToTelegram(name, phone, type);
            });
        }

        // Application form
        const applicationForm = document.getElementById('applicationForm');
        if (applicationForm) {
            applicationForm.addEventListener('submit', function(e) {
                const name = applicationForm.querySelector('[name="name"]')?.value || '';
                const phone = applicationForm.querySelector('[name="phone"]')?.value || '';
                const selected = document.querySelector('.application-form-select__checked');
                const type = selected ? selected.textContent.trim() : 'Заявка';
                sendToTelegram(name, phone, type);
            });
        }

        // Также перехватываем клики по кнопкам (т.к. формы могут не использовать submit)
        document.querySelectorAll('.header-form__btn, .modal-form__btn, .about-form__btn, .form__btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const form = this.closest('form');
                if (!form) return;
                
                const name = form.querySelector('[name="name"], [name="header-name"]')?.value || '';
                const phone = form.querySelector('[name="phone"], [name="header-phone"]')?.value || '';
                
                // Определяем тип заявки
                let type = 'Заявка';
                const selected = form.querySelector('[class*="select__checked"]');
                if (selected) {
                    type = selected.textContent.trim();
                } else if (form.id === 'header-form') {
                    type = 'Перезвоните мне';
                }
                
                if (name && phone) {
                    sendToTelegram(name, phone, type);
                }
            });
        });
    });
})();
