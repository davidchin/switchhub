import Key from './key';
import Transition from './transition';

interface Event {
    name: Key;
    transitions: Transition[];
}

export default Event;
