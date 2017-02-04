import Subscriber from './subscriber';
import SubscriberPayload from './subscriber-payload';
import { omitNil } from '../utils';

/**
 * A class responsible for managing and notifying subscribers. It can add,
 * remove and notify subscribers.
 */
export default class SubscriberSet {
    private subscribers: Subscriber[];

    constructor() {
        this.subscribers = [];
    }

    /**
     * Add a subscriber to itself. If the subscriber has been added previously,
     * you can add it again.
     * @param subscriber - The subscriber to add
     */
    addSubscriber(subscriber: Subscriber): void {
        this.subscribers.push(subscriber);
    }

    /**
     * Remove a subscriber from itself. Ignore the call if the subscriber has
     * not been added previously.
     * @param subscriber - The subscriber to remove
     */
    removeSubscriber(subscriber: Subscriber): void {
        const index = this.subscribers.indexOf(subscriber);

        if (index === -1) {
            return;
        }

        this.subscribers.splice(index, 1);
    }

    /**
     * Notify all registered subscribers about a transition.
     * @param payload - The payload to transmit
     */
    notifySubscribers(payload: SubscriberPayload): void {
        this.subscribers.forEach(subscriber => {
            subscriber(omitNil(payload));
        });
    }
}
