import SubscriberPayload from './subscriber-payload';

interface Subscriber {
    (payload: SubscriberPayload): void;
}

export default Subscriber;
