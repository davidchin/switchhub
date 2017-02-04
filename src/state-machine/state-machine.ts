import Event from './event';
import Key from './key';
import Subscriber from './subscriber';
import SubscriberSet from './subscriber-set';
import Transition from './transition';
import Transitioner from './transitioner';
import TransitionHistory from './transition-history';
import TransitionPredicate from './transition-predicate';
import TransitionRecord from './transition-record';
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
     * @param [events] - An array of events
     * @return A `StateMachine` instance
     */
    static create(initialState: Key, events?: Event[]): StateMachine {
        return new StateMachine(initialState, events);
    }

    private history: TransitionHistory;
    private subscribers: SubscriberSet;
    private transitioner: Transitioner;
    private transitions: TransitionSet;

    /**
     * @param initialState - The initial state
     * @param [events] - An array of events
     */
    constructor(initialState: Key, events?: Event[]) {
        this.history = new TransitionHistory(initialState);
        this.subscribers = new SubscriberSet();
        this.transitions = new TransitionSet();
        this.transitioner = new Transitioner(this.transitions, this.history);

        if (events) {
            this.addEvents(events);
        }
    }

    /**
     * Get the current state.
     * @return The current state
     */
    getState(): Key {
        return this.history.getCurrentRecord().state;
    }

    /**
     * Get the previous state. Return undefined if the state machine hasn't
     * changed from its initial state.
     * @return The previous state
     */
    getPreviousState(): Key | undefined {
        const record = this.history.getPreviousRecord();

        return record ? record.state : undefined;
    }

    /**
     * Get the transition history and the current index
     * @return The transition history and the current index
     */
    getHistory(): { index: number, stack: TransitionRecord[] } {
        return this.history.getHistory();
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
    hasTransition(predicate: TransitionPredicate): boolean {
        return this.transitions.hasTransition(predicate);
    }

    /**
     * Check if the state machine can transition to a state
     * @param state - The transition to check
     * @return True if it is possible to transition
     */
    canTransition(state: Key): boolean {
        return this.transitioner.canTransition(state, this.getState());
    }

    /**
     * Transition to a new state by its name. Notify subscribers once the
     * transition is completed.
     * @param state - The new state
     * @param [data] - The meta data associated with the transition
     */
    transition(state: Key, data?: any): void {
        this.transitioner.transition(state, this.getState(), data, ({ from, to }) => {
            this.subscribers.notifySubscribers({ data, from, to });
        });
    }

    /**
     * Transition to a new state by triggering an event. Notify subscribers
     * once the transition is completed.
     * @param event - The event name
     * @param [data] - The meta data associated with the transition
     */
    triggerEvent(event: Key, data?: any): void {
        this.transitioner.triggerEvent(event, this.getState(), data, ({ from, to }) => {
            this.subscribers.notifySubscribers({ data, event, from, to });
        });
    }

    /**
     * Revert to the previous state. Notify subscribers once the transition is
     * completed.
     */
    undoTransition(): void {
        this.transitioner.undoTransition(({ data, event, from, to }) => {
            this.subscribers.notifySubscribers({ data, event, from, to, undo: true });
        });
    }

    /**
     * Replay the reverted state. Notify subscribers once the transition is
     * completed.
     */
    redoTransition(): void {
        this.transitioner.redoTransition(({ data, event, from, to }) => {
            this.subscribers.notifySubscribers({ data, event, from, to, redo: true });
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
