export function packGenerator (generator) {
    let result;
    return {
        ...generator,
        next () {
            const step = generator.next(result);
            result = step.value
            return step;
        },
    };
}
