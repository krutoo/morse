import { register } from './src/index.js';

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
    service.query('get-currency', {
        data: { a: 1, b: 2 },
        // timeout: 1000,
        receive (response, error) {
            console.log('header service received response:', response, error);
        },
        // @todo onFulfil, !!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // @todo onReject, !!!!!!!!!!!!!!!!!!!!!!!!!!!!
    });
    console.log('header service sent query message');
}, 1000);
