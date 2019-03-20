import { getTag, isFunction } from './utils.js';

export const queryTypeName = 'MorseQuery';

export function createQuery ({ data, timeout = 5000, onResolve, onReject } = {}) {
    let isPending = false;
    let isDone = false;
    const query = {
        [Symbol.toStringTag]: queryTypeName,
        getData () {
            return data;
        },
        isDone () {
            return !isPending && isDone;
        },
        isPending () {
            return isPending;
        },
        start () {
            if (!isPending && !isDone) {
                isPending = true;
                setTimeout(query.reject, timeout);
            }
        },
        resolve (response) {
            if (isPending && !isDone) {
                query.done();
                if (isFunction(onResolve)) {
                    onResolve(response);
                }
            }
        },
        reject () {
            if (isPending && !isDone) {
                query.done();
                if (isFunction(onReject)) {
                    onReject(new Error('Query was cancelled by timeout'));
                }
            }
        },
        done () {
            isPending = false;
            isDone = true;
        },
    };
    return query;
}

export function isQuery (value) {
    return getTag(value) === queryTypeName;
}
