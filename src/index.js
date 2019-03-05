import { createService } from './service.js';
import getTransport from './get-transport.js';

/**
 * Returns a new service interface.
 * @param {(string|number)} id Unique identifier of service.
 * @return {Object} Service interface.
 */
function register (id) {
    return getTransport().createService(id);
}

export { register, getTransport };
