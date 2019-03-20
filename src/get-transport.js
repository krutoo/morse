import { createTransport, isTransport } from './transport.js';

export const morseRadioKey = 'MorseRadio';

export default function getTransport () {
    if (!isTransport(window[morseRadioKey])) {
        window[morseRadioKey] = createTransport();
    }
    return window[morseRadioKey];
}
