import { register } from '../src/index.js';

// async register of page header service
setTimeout(() => {
    console.log('header service initialized');
    const service = register('header');
    window.headerService = service;

    // subscribe on command
    service.subscribeOnCommand('update-settlement', data => {
        console.log('header service handle command "update-settlement" with data:', data);
    });

    // send query
    console.log('header service sent query "get-currency"');
    service.query('get-currency', { data: { a: 1, b: 2 }, timeout: 5000 })
        .then(response => console.log('query "get-currency" was resolved with response:', response))
        .catch(error => console.error('query "get-currency" was rejected with error:', error));
}, 2000);
