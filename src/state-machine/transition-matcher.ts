import { default as Predicate } from './transition-predicate';
import Transition from './transition';

export function matchTransition(transition: Transition, predicate: Predicate): boolean {
    const props = ['event', 'from', 'to'];

    return props.every(prop => {
        if (!predicate[prop]) {
            return true;
        }

        return predicate[prop] === transition[prop];
    });
}
