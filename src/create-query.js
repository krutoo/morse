export default function createQuery () {
    let isPending = false;
    let isResolved = false;
    return {
        isResolved () {
            return !isPending && isResolved;
        },
        isPending () {
            return isPending;
        },
        start () {
            isPending = true;
        },
        resolve () {
            isPending = false;
            isResolved = true;
        },
    };
}
