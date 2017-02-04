import Key from './key';

interface Transition {
    [key: string]: any;
    condition?: () => boolean;
    data?: any;
    event?: Key;
    from: Key;
    to: Key;
}

export default Transition;
