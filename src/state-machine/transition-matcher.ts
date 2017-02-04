import TransitionPredicate from './transition-predicate';
import Transition from './transition';

/**
 * Check if a transition matches a set of criteria.
 * @param transition - The transition to match
 * @param predicate - The predicate used for filtering
 * @return True if the transition matches the criteria.
 */
export function matchTransition(transition: Transition, predicate: TransitionPredicate): boolean {
    const props = ['event', 'from', 'to'];

    return props.every(prop => {
        if (predicate[prop] === undefined || predicate[prop] === null) {
            return true;
        }

        return predicate[prop] === transition[prop];
    });
}
