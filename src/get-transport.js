import createTransport from './create-transport.js';

export const morseRadioKey = `MorseRadio-${(1791).toString(2)}`;

export default function getTransport () {
    if (!window[morseRadioKey]) {
        const { createService } = createTransport();
        window[morseRadioKey] = { createService }; // public transport API
    }
    return window[morseRadioKey];
}
