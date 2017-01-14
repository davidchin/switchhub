import Event from './event';
import Key from './key';
import Subscriber from './subscriber';
import SubscriberSet from './subscriber-set';
import Transition from './transition';
import Transitioner from './transitioner';
import TransitionSet from './transition-set';

export default class StateMachine {
    static create(initialState: Key): StateMachine {
        return new StateMachine(initialState);
    }

    private currentState: Key;
    private previousState?: Key;
    private subscribers: SubscriberSet;
    private transitioner: Transitioner;
    private transitions: TransitionSet;

    constructor(initialState: Key) {
        this.currentState = initialState;
        this.subscribers = new SubscriberSet();
        this.transitions = new TransitionSet();
        this.transitioner = new Transitioner(this.transitions);
    }

    getState(): Key {
        return this.currentState;
    }

    getPreviousState(): Key | undefined {
        return this.previousState;
    }

    addEvent(name: Key, transitions: Transition[]): void {
        this.transitions.addEvent({ name, transitions });
    }

    addEvents(events: Event[]): void {
        this.transitions.addEvents(events);
    }

    removeEvent(name: Key): void {
        this.transitions.removeEvent(name);
    }

    removeEvents(names: Key[]): void {
        this.transitions.removeEvents(names);
    }

    hasEvent(name: Key): boolean {
        return this.transitions.hasEvent(name);
    }

    addTransition(transition: Transition): void {
        this.transitions.addTransition(transition);
    }

    addTransitions(transitions: Transition[]): void {
        this.transitions.addTransitions(transitions);
    }

    removeTransition(transition: Transition): void {
        this.transitions.removeTransition(transition);
    }

    removeTransitions(transitions: Transition[]): void {
        this.transitions.removeTransitions(transitions);
    }

    hasTransition(transition: Transition): boolean {
        return this.transitions.hasTransition(transition);
    }

    canTransition(state: Key): boolean {
        return this.transitioner.canTransition(state, this.currentState);
    }

    transition(state: Key): void {
        this.transitioner.transition(state, this.currentState, transition => {
            this.previousState = transition.from;
            this.currentState = transition.to;

            this.subscribers.notifySubscribers({
                from: transition.from,
                to: transition.to,
            });
        });
    }

    transitionByEvent(event: Key): void {
        this.transitioner.transitionByEvent(event, this.currentState, transition => {
            this.previousState = transition.from;
            this.currentState = transition.to;

            this.subscribers.notifySubscribers({
                event,
                from: transition.from,
                to: transition.to,
            });
        });
    }

    subscribe(subscriber: Subscriber): void {
        this.subscribers.addSubscriber(subscriber);
    }

    unsubscribe(subscriber: Subscriber): void {
        this.subscribers.removeSubscriber(subscriber);
    }
}
