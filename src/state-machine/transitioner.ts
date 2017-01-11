import Key from './key';
import Transition from './transition';
import TransitionSet from './transition-set';

export default class Transitioner {
    private transitions: TransitionSet;

    constructor(transitions: TransitionSet) {
        this.transitions = transitions;
    }

    canTransition(toState: Key, fromState: Key): boolean {
        const transitions = this.transitions.filterTransitions({
            from: fromState,
            to: toState,
        });

        return transitions.some(transition => {
            if (transition.condition) {
                return transition.condition() !== false;
            }

            return true;
        });
    }

    transition(toState: Key, fromState: Key, callback: (transition: Transition) => void): void {
        if (!this.transitions.hasTransition({ from: fromState })) {
            throw new Error(`State not found: ${fromState}`);
        }

        if (!this.transitions.hasTransition({ to: toState })) {
            throw new Error(`State not found: ${toState}`);
        }

        if (!this.canTransition(toState, fromState)) {
            return;
        }

        callback({
            from: fromState,
            to: toState,
        });
    }

    transitionByEvent(event: Key, fromState: Key, callback: (transition: Transition) => void): void {
        if (!this.transitions.hasTransition({ from: fromState })) {
            throw new Error(`State not found: ${fromState}`);
        }

        if (!this.transitions.hasEvent(event)) {
            throw new Error(`Event not found: ${event}`);
        }

        const transitions = this.transitions.filterTransitions({
            event,
            from: fromState,
        });

        for (let index = 0; index < transitions.length; index++) {
            const transition = transitions[index];

            if (this.canTransition(transition.to, fromState)) {
                return callback({
                    from: fromState,
                    to: transition.to,
                });
            }
        }
    }
}
