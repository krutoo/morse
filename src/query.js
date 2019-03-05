import { isFunction } from './utils.js';

const queryTypeSymbol = Symbol('query-type');

export function createQuery ({ data, timeout = 5000, onResolve } = {}) {
    let isPending = false;
    let isResolved = false;
    const query = {
        type: queryTypeSymbol,
        getData () {
            return data;
        },
        isResolved () {
            return !isPending && isResolved;
        },
        isPending () {
            return isPending;
        },
        start () {
            if (!isPending && !isResolved) {
                isPending = true;
                setTimeout(() => {
                    if (!query.isResolved()) {
                        query.resolve(undefined, new Error('Query was cancelled by timeout'));
                    }
                }, timeout);
            }
        },
        resolve (response, error) {
            if (isPending && !isResolved) {
                isPending = false;
                isResolved = true;
                if (isFunction(onResolve)) {
                    onResolve(response, error);
                }
            }
        },
    };
    return query;
}

export function isQuery (value) {
    return value && value.type === queryTypeSymbol;
}
