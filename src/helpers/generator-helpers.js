export function makeAutoGenerator (generator) {
    // @todo добавить проверку generator
    let lastValue;
    return {
        ...generator,
        next (newValue = lastValue) {
            const step = generator.next(newValue);
            lastValue = step.value;
            return step;
        },
    };
}

export function makeLoopedGenerator (makeGenerator) {
    // @todo добавить проверку makeGenerator
    let generator = makeGenerator();
    return {
        ...generator,
        next () {
            const { value, done } = generator.next();
            if (done) {
                generator = makeGenerator();
            }
            return { value, done };
        },
    };
}
