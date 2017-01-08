import Subscriber from './subscriber';
import Transition from './transition';

export default class SubscriberSet {
    private subscribers: Subscriber[];

    constructor() {
        this.subscribers = [];
    }

    addSubscriber(subscriber: Subscriber): void {
        this.subscribers.push(subscriber);
    }

    removeSubscriber(subscriber: Subscriber): void {
        const index = this.subscribers.indexOf(subscriber);

        if (index === -1) {
            return;
        }

        this.subscribers.splice(index, 1);
    }

    notifySubscribers(transition: Transition): void {
        this.subscribers.forEach(subscriber => {
            subscriber(transition);
        });
    }
}
