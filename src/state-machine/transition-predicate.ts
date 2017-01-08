import Key from './key';

interface TransitionPredicate {
    [key: string]: any;
    event?: Key;
    from?: Key;
    to?: Key;
}

export default TransitionPredicate;
