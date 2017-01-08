import Key from './key';

interface Transition {
    [key: string]: any;
    condition?: () => boolean;
    event?: Key;
    from: Key;
    to: Key;
}

export default Transition;
