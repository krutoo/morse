import getTransport from './get-transport.js';

/**
 * Returns a new service interface.
 * @param {(string|number)} id Unique identifier of service.
 * @return {Object} Service interface.
 */
export function register (id) {
    return getTransport().register(id);
}
