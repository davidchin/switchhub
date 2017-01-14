import { default as Predicate } from './transition-predicate';
import { matchTransition } from './transition-matcher';
import Event from './event';
import Key from './key';
import Transition from './transition';

export default class TransitionSet {
    private transitions: Transition[];

    constructor() {
        this.transitions = [];
    }

    addTransition(transition: Transition): void {
        if (this.hasTransition(transition)) {
            this.removeTransition(transition);
        }

        this.transitions.push(transition);
    }

    addTransitions(transitions: Transition[]): void {
        transitions.forEach(transition => this.addTransition(transition));
    }

    addEvent(event: Event): void {
        if (event.transitions.length === 0) {
            throw new Error(`Event "${event}" must have at least one transition`);
        }

        event.transitions.forEach(transition => {
            this.addTransition({ ...transition, event: event.name});
        });
    }

    addEvents(events: Event[]): void {
        events.forEach(event => this.addEvent(event));
    }

    removeTransition(transition: Transition): void {
        const index = this.findIndex(transition);

        if (index === -1) {
            return;
        }

        this.transitions.splice(index, 1);
    }

    removeTransitions(transitions: Transition[]): void {
        transitions.forEach(transition => this.removeTransition(transition));
    }

    removeEvent(eventName: Key): void {
        let index = this.transitions.length;

        while (index--) {
            if (this.transitions[index].event !== eventName) {
                continue;
            }

            this.transitions.splice(index, 1);
        }
    }

    removeEvents(eventNames: Key[]): void {
        eventNames.forEach(eventName => this.removeEvent(eventName));
    }

    hasTransition(predicate: Predicate): boolean {
        return this.filterTransitions(predicate).length > 0;
    }

    hasEvent(eventName: Key): boolean {
        return this.filterTransitions({ event: eventName }).length > 0;
    }

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
