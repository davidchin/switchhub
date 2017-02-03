import Key from './key';
import Transition from './transition';
import TransitionSet from './transition-set';

/**
 * A class responsible for performing the transition between states.
 */
export default class Transitioner {
    private transitions: TransitionSet;

    /**
     * @param transitions - The set of transitions to manage
     */
    constructor(transitions: TransitionSet) {
        this.transitions = transitions;
    }

    /**
     * Check if it is possible to transition to a state from another state
     * @param toState - The state to transition to
     * @param fromState - The state to transition from
     * @return True if it is possible to transition
     */
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

    /**
     * Transition to a state from another state. Fire the callback once the
     * transition is completed. If the to/from state does not exist, an error
     * will be thrown.
     * @param toState - The state to transition to
     * @param fromState - The state to transition from
     * @param callback - The callback to fire once the transition is completed
     */
    transition(toState: Key, fromState: Key, callback: (transition: Transition) => void): void {
        if (!this.transitions.hasTransition({ from: fromState })) {
            throw new Error(`"From" state not found: ${fromState}`);
        }

        if (!this.transitions.hasTransition({ to: toState })) {
            throw new Error(`"To" state not found: ${toState}`);
        }

        if (!this.canTransition(toState, fromState)) {
            return;
        }

        callback({
            from: fromState,
            to: toState,
        });
    }

    /**
     * Transition to a new state by triggering an event. If the event or state
     * does not exist, an error will be thrown.
     * @param event - The event to trigger
     * @param fromState - The state to transition from.
     * @param callback - The callback to fire once the transition is completed
     */
    triggerEvent(event: Key, fromState: Key, callback: (transition: Transition) => void): void {
        if (!this.transitions.hasTransition({ from: fromState })) {
            throw new Error(`"From" state not found: ${fromState}`);
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
