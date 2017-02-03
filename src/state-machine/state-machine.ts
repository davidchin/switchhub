import Event from './event';
import Key from './key';
import Subscriber from './subscriber';
import SubscriberSet from './subscriber-set';
import Transition from './transition';
import Transitioner from './transitioner';
import TransitionSet from './transition-set';

/**
 * A class responsible for handling the transitions between a finite set of
 * states. It can transition to a new state by triggering an event or by
 * a direct assignment.
 */
export default class StateMachine {
    /**
     * Create a `StateMachine` instance.
     * @param initialState - The initial state
     * @return A `StateMachine` instance
     */
    static create(initialState: Key): StateMachine {
        return new StateMachine(initialState);
    }

    private currentState: Key;
    private previousState?: Key;
    private subscribers: SubscriberSet;
    private transitioner: Transitioner;
    private transitions: TransitionSet;

    /**
     * @param initialState - The initial state
     */
    constructor(initialState: Key) {
        this.currentState = initialState;
        this.subscribers = new SubscriberSet();
        this.transitions = new TransitionSet();
        this.transitioner = new Transitioner(this.transitions);
    }

    /**
     * Get the current state.
     * @return The current state
     */
    getState(): Key {
        return this.currentState;
    }

    /**
     * Get the previous state. Return undefined if the state machine hasn't
     * changed from its initial state.
     * @return The previous state
     */
    getPreviousState(): Key | undefined {
        return this.previousState;
    }

    /**
     * Add an event. Each event can have multiple transitions. If the same
     * event is added more than once, transitions will get accumulated instead
     * of being replaced.
     * @param name - The name of an event
     * @param transitions - The transitions of an event
     */
    addEvent(name: Key, transitions: Transition[]): void {
        this.transitions.addEvent({ name, transitions });
    }

    /**
     * Add multiple events.
     * @param events - An array of events
     */
    addEvents(events: Event[]): void {
        this.transitions.addEvents(events);
    }

    /**
     * Remove an event by its name.
     * @param name - The name of an event
     */
    removeEvent(name: Key): void {
        this.transitions.removeEvent(name);
    }

    /**
     * Remove multiple events.
     * @param names - The names of events
     */
    removeEvents(names: Key[]): void {
        this.transitions.removeEvents(names);
    }

    /**
     * Check if an event has been added.
     * @param name - The name of an event
     * @return True if the event has been added
     */
    hasEvent(name: Key): boolean {
        return this.transitions.hasEvent(name);
    }

    /**
     * Add a single transition.
     * @param transition - The transition to add
     */
    addTransition(transition: Transition): void {
        this.transitions.addTransition(transition);
    }

    /**
     * Add multiple transitions.
     * @param transitions - The group of transitions to add
     */
    addTransitions(transitions: Transition[]): void {
        this.transitions.addTransitions(transitions);
    }

    /**
     * Remove a single transition.
     * @param transition - The transition to remove
     */
    removeTransition(transition: Transition): void {
        this.transitions.removeTransition(transition);
    }

    /**
     * Remove multiple transitions.
     * @param transitions - The group of transitions to remove
     */
    removeTransitions(transitions: Transition[]): void {
        this.transitions.removeTransitions(transitions);
    }

    /**
     * Check if a transition has been added.
     * @param transition - The transition to check
     * @return True if the transition has been added
     */
    hasTransition(transition: Transition): boolean {
        return this.transitions.hasTransition(transition);
    }

    /**
     * Check if the state machine can transition to a state
     * @param state - The transition to check
     * @return True if it is possible to transition
     */
    canTransition(state: Key): boolean {
        return this.transitioner.canTransition(state, this.currentState);
    }

    /**
     * Transition to a new state by its name. Notify subscribers once the
     * transition is completed.
     * @param state - The new state
     */
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

    /**
     * Transition to a new state by triggering an event. Notify subscribers
     * once the transition is completed.
     * @param event - The event name
     */
    triggerEvent(event: Key): void {
        this.transitioner.triggerEvent(event, this.currentState, transition => {
            this.previousState = transition.from;
            this.currentState = transition.to;

            this.subscribers.notifySubscribers({
                event,
                from: transition.from,
                to: transition.to,
            });
        });
    }

    /**
     * Subscribe to changes to the current state. When a change occurs, the
     * subscriber will get called.
     * @param subscriber - The subscriber function to add
     */
    subscribe(subscriber: Subscriber): void {
        this.subscribers.addSubscriber(subscriber);
    }

    /**
     * Unsubscribe from changes to the current state.
     * @param subscriber - The subscriber function to remove
     */
    unsubscribe(subscriber: Subscriber): void {
        this.subscribers.removeSubscriber(subscriber);
    }
}
