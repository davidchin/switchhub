import { default as Predicate } from './transition-predicate';
import { matchTransition } from './transition-matcher';
import Event from './event';
import Key from './key';
import Transition from './transition';

/**
 * A class responsible for storing and retrieving a set of transitions.
 */
export default class TransitionSet {
    private transitions: Transition[];

    constructor() {
        this.transitions = [];
    }

    /**
     * Add a transition to itself. If the same transition has been added
     * before, the old one will get removed before adding the new one.
     * @param transition - The transition to add
     */
    addTransition(transition: Transition): void {
        if (this.hasTransition(transition)) {
            this.removeTransition(transition);
        }

        this.transitions.push(transition);
    }

    /**
     * Add multiple transitions to itself.
     * @param transitions - The array of transitions to add
     */
    addTransitions(transitions: Transition[]): void {
        transitions.forEach(transition => this.addTransition(transition));
    }

    /**
     * Add an event to itself. Each event must have at least one transition.
     * @param event - The event to add
     */
    addEvent(event: Event): void {
        if (event.transitions.length === 0) {
            throw new Error(`Event "${event}" must have at least one transition`);
        }

        event.transitions.forEach(transition => {
            this.addTransition({ ...transition, event: event.name });
        });
    }

    /**
     * Add multiple events to itself.
     * @param events - The array of events to add
     */
    addEvents(events: Event[]): void {
        events.forEach(event => this.addEvent(event));
    }

    /**
     * Remove a transition from itself. Ignore the call if the transition has
     * not been added previously.
     * @param transition - The transition to remove
     */
    removeTransition(transition: Transition): void {
        const index = this.findIndex(transition);

        if (index === -1) {
            return;
        }

        this.transitions.splice(index, 1);
    }

    /**
     * Remove multiple transitions from itself.
     * @param transitions - The transitions to remove
     */
    removeTransitions(transitions: Transition[]): void {
        transitions.forEach(transition => this.removeTransition(transition));
    }

    /**
     * Remove an event from itself by its name. If there are multiple
     * transitions registered under the same event, they will all be removed.
     * @param eventName - The name of the event
     */
    removeEvent(eventName: Key): void {
        let index = this.transitions.length;

        while (index--) {
            if (this.transitions[index].event !== eventName) {
                continue;
            }

            this.transitions.splice(index, 1);
        }
    }

    /**
     * Remove multiple events from itself.
     * @param eventNames - The names of the events to remove
     */
    removeEvents(eventNames: Key[]): void {
        eventNames.forEach(eventName => this.removeEvent(eventName));
    }

    /**
     * Check if a transition has been added.
     * @param predicate - The predicate used for filtering
     * @return True if the transition exists
     */
    hasTransition(predicate: Predicate): boolean {
        return this.filterTransitions(predicate).length > 0;
    }

    /**
     * Check if an event has been added.
     * @param eventName - The name of the event to check
     * @return True if the event exists
     */
    hasEvent(eventName: Key): boolean {
        return this.filterTransitions({ event: eventName }).length > 0;
    }

    /**
     * Filter its registered transitions with a set of criteria.
     * @param predicate - The predicate used for filtering
     * @return An array of transitions matching the predicate
     */
    filterTransitions(predicate: Predicate): Transition[] {
        return this.transitions.filter(transition => matchTransition(transition, predicate));
    }

    private findIndex(predicate: Predicate): number {
        for (let index = 0; index < this.transitions.length; index++) {
            const transition = this.transitions[index];

            if (matchTransition(transition, predicate)) {
                return index;
            }
        }

        return -1;
    }
}
