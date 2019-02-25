import { register } from './morse.js';

// async register page header service
setTimeout(() => {
    console.log('header service initialized');
    const service = register('header');
    window.headerService = service;
    service.subscribeOnCommand('update-settlement', data => {
        console.log('settlement updated!', data)
    });
    service.query('get-currency', response => {
        console.log(response);
    });
}, 2000);
