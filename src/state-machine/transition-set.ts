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

    addEvent(event: Event): void {
        event.transitions.forEach(transition => {
            this.addTransition({ ...transition, event: event.name});
        });
    }

    removeTransition(transition: Transition): void {
        const index = this.findIndex(transition);

        if (index === -1) {
            return;
        }

        this.transitions.splice(index, 1);
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
