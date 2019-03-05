export function makeAutoGenerator (generator) {
    let lastValue;
    return {
        ...generator,
        next (newValue = lastValue) {
            const step = generator.next(lastValue);
            lastValue = step.value
            return step;
        },
    };
}
