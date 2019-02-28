import { register } from './src/index.js';

// async register of page content service
setTimeout(() => {
    console.log('content service initialized');
    const service = register('content');
    window.contentService = service;

    service.command('update-settlement', { name: 'Екатеринбург', id: 162 });
    service.command('update-settlement', { name: 'Москва', id: 32 });
    service.command('update-settlement', { name: 'Нижний Новгород', id: 432 });
    service.command('update-settlement', { name: 'Алапаевск', id: 52 });
    service.command('update-settlement', { name: 'Санкт-петербург', id: 120 });
    service.command('update-settlement', { name: 'Краснодар', id: 41 });
    service.command('update-settlement', { name: 'Нижний Тагил', id: 8022 });
    setTimeout(() => {
        service.command('update-settlement', { name: 'Кировград', id: 439 });
    }, 5000);

    service.subscribeOnQuery('get-currency', sendResponse => {
        setTimeout(() => {
            sendResponse('RUB');
        }, 1000);
    });
}, 1000);
