import Key from './key';

interface SubscriberPayload {
    [key: string]: any;
    data?: any;
    event?: Key;
    from: Key;
    redo?: boolean;
    to: Key;
    undo?: boolean;
}

export default SubscriberPayload;
