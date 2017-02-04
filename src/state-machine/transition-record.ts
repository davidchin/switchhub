import Key from './key';

interface TransitionRecord {
    data?: any;
    event?: Key;
    state: Key;
}

export default TransitionRecord;
