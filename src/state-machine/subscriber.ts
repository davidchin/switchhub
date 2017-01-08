import Transition from './transition';

interface Subscriber {
    (transition: Transition): void;
}

export default Subscriber;
