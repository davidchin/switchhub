import Key from './key';
import SubscriberPayload from './subscriber-payload';
import Transition from './transition';
import TransitionHistory from './transition-history';
import TransitionSet from './transition-set';

/**
 * A class responsible for performing the transition between states.
 */
export default class Transitioner {
    private history: TransitionHistory;
    private transitions: TransitionSet;

    /**
     * @param transitions - The set of transitions to manage
     */
    constructor(transitions: TransitionSet, history: TransitionHistory) {
        this.transitions = transitions;
        this.history = history;
    }

    /**
     * Check if it is possible to transition to a state from another state
     * @param toState - The state to transition to
     * @param fromState - The state to transition from
     * @return True if it is possible to transition
     */
    canTransition(toState: Key, fromState: Key): boolean {
        return this.findExecutableTransition(toState, fromState) !== undefined;
    }

    /**
     * Check if it is possible to perform an undo
     * @return True if it is possible to undo
     */
    canUndo(): boolean {
        return this.getTransitionForUndo() !== undefined;
    }

    /**
     * Check if it is possible to perform a redo
     * @return True if it is possible to redo
     */
    canRedo(): boolean {
        return this.getTransitionForRedo() !== undefined;
    }

    /**
     * Transition to a state from another state. Fire the callback once the
     * transition is completed. If the to/from state does not exist, an error
     * will be thrown.
     * @param toState - The state to transition to
     * @param fromState - The state to transition from
     * @param [data] - The meta data associated with the transition
     * @param [callback] - The callback to fire once the transition is completed
     */
    transition(toState: Key, fromState: Key, data?: any, callback?: (payload: SubscriberPayload) => void): void {
        if (!this.transitions.hasTransition({ from: fromState }) ||
            !this.transitions.hasTransition({ to: toState })) {
            throw new Error(`Unable to transition from "${fromState}" to "${toState}"`);
        }

        const transition = this.findExecutableTransition(toState, fromState);

        if (transition) {
            this.history.addRecord({ data, state: transition.to });

            if (callback) {
                callback({ from: transition.from, to: transition.to });
            }
        }
    }

    /**
     * Transition to a new state by triggering an event. If the event or state
     * does not exist, an error will be thrown.
     * @param event - The event to trigger
     * @param fromState - The state to transition from
     * @param [data] - The meta data associated with the transition
     * @param [callback] - The callback to fire once the transition is completed
     */
    triggerEvent(event: Key, fromState: Key, data?: any, callback?: (payload: SubscriberPayload) => void): void {
        if (!this.transitions.hasEvent(event) ||
            !this.transitions.hasTransition({ from: fromState })) {
            throw new Error(`Unable to trigger "${event}" and transition from "${fromState}"`);
        }

        const transition = this.findExecutableTransitionByEvent(event, fromState);

        if (transition) {
            this.history.addRecord({ data, event, state: transition.to });

            if (callback) {
                callback({ event: transition.event, from: transition.from, to: transition.to });
            }
        }
    }

    /**
     * Undo a state transition. Fire the callback if it is possible to undo
     * @param [callback] - The callback to fire once the transition is completed
     */
    undoTransition(callback?: (payload: SubscriberPayload) => void): void {
        const transition = this.getTransitionForUndo();
        const record = this.history.getPreviousRecord();

        if (!transition || !record) {
            return;
        }

        this.history.rewindHistory();

        if (callback) {
            callback({
                data: record.data,
                event: transition.event,
                from: transition.to,
                to: transition.from,
            });
        }
    }

    /**
     * Redo a state transition. Fire the callback if it is possible to redo
     * @param [callback] - The callback to fire once the transition is completed
     */
    redoTransition(callback?: (payload: SubscriberPayload) => void): void {
        const transition = this.getTransitionForRedo();
        const record = this.history.getNextRecord();

        if (!transition || !record) {
            return;
        }

        this.history.forwardHistory();

        if (callback) {
            callback({
                data: record.data,
                event: transition.event,
                from: transition.from,
                to: transition.to,
            });
        }
    }

    /**
     * Find the first executable transition based on to/from state
     * @param toState - The state to transition to
     * @param fromState - The state to transition from
     * @return The executable transition
     */
    private findExecutableTransition(toState: Key, fromState: Key): Transition | undefined {
        const transitions = this.transitions.filterExecutableTransitions({
            from: fromState,
            to: toState,
        });

        return transitions[0];
    }

    /**
     * Find the first executable transition by event
     * @param toState - The state to transition to
     * @param fromState - The state to transition from
     * @return The executable transition
     */
    private findExecutableTransitionByEvent(event: Key, fromState: Key): Transition | undefined {
        const transitions = this.transitions.filterExecutableTransitions({
            event,
            from: fromState,
        });

        return transitions[0];
    }

    /**
     * Get a transition that can undo the current state
     * @return The undoable transition
     */
    private getTransitionForUndo(): Transition | undefined {
        if (!this.history.getPreviousRecord()) {
            return;
        }

        const currentState = this.history.getCurrentRecord().state;
        const { state } = this.history.getPreviousRecord()!;
        const transition = this.findExecutableTransition(currentState, state);

        if (!transition || !transition.undoable) {
            return;
        }

        return transition;
    }

    /**
     * Get a transition that can redo the previous state
     * @return The redoable transition
     */
    private getTransitionForRedo(): Transition | undefined {
        if (!this.history.getNextRecord()) {
            return;
        }

        const currentState = this.history.getCurrentRecord().state;
        const { state } = this.history.getNextRecord()!;
        const transition = this.findExecutableTransition(state, currentState);

        if (!transition || !transition.undoable) {
            return;
        }

        return transition;
    }
}
