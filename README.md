# SwitchHub

SwitchHub is a finite state machine written for JavaScript. It can help you manage the state of an object declaratively. It can determine and transition to its future state by looking at its current state and your actions. Also, it can undo and redo transitions.

[![Build Status](https://travis-ci.org/davidchin/switchhub.svg?branch=master)](https://travis-ci.org/davidchin/switchhub)

## Installation

You can use npm to install this library.

```
npm install --save switchhub
```

## Usage

### Add transitions

To create an instance and register a list of states and events.

```js
import { StateMachine } from 'switchhub';

const stateMachine = StateMachine.create('inactive');

stateMachine.addEvent('activate', [
    { from: 'inactive', to: 'active' },
]);

stateMachine.addEvent('deactivate', [
    { from: 'active', to: 'inactive' },
    { from: 'paused', to: 'inactive' },
]);

stateMachine.addEvent('pause', [
    { from: 'active', to: 'paused' },
]);

stateMachine.addEvent('resume', [
    { from: 'paused', to: 'active' },
]);
```

You can also add a transition without an event.

```js
stateMachine.addTransition({ from: 'inactive', to: 'active' });
```

If you want to make a transition conditional, you can add a `condition` property to it.

```js
let canPause = false;

stateMachine.addEvent('pause', [
    { from: 'active', to: 'paused', condition: () => canPause }, // `condition` function should return true or false
]);
```

### Transition to states

To transition to a new state by triggering an event.

```js
// Given the initial state is 'inactive'
stateMachine.triggerEvent('activate');
// stateMachine.getState() === 'active'

stateMachine.triggerEvent('pause');
// stateMachine.getState() === 'paused'

stateMachine.triggerEvent('deactivate');
// stateMachine.getState() === 'inactive'
```

You can also directly transition to a new state, if it is related to the current state.

```js
// Given the current state is 'inactive', you can transition to 'active'
stateMachine.transition('active');
// stateMachine.getState() === 'active'

// Given the current state is 'paused', you cannot transition to 'inactive'
stateMachine.transition('inactive');
// stateMachine.getState() !== 'inactive'
```

You can optionally pass meta data to subscribers when you transition to a new state.

```js
stateMachine.subscribe(transition) => {
    // transition.data.message === 'Hello world'
});

stateMachine.triggerEvent('activate', { message: 'Hello world' });
```

### Undo transitions

You can undo / redo a transition if it is marked as undoable.

```js
stateMachine.addEvent('activate', [
    { from: 'inactive', to: 'active', undoable: true },
]);

stateMachine.triggerEvent('activate');
stateMachine.undoTransition();
stateMachine.redoTransition();
```

When passing data to `triggerEvent` or `transition`, make sure it is immutable. Otherwise, when you redo a transition, your subscribers might not get the same value.

### Subscribe to changes

You can subscribe to state changes.

```js
stateMachine.subscribe(transition => {
    // transition.event === 'activate'
    // transition.from === 'inactive'
    // transition.to === 'active'
});

stateMachine.subscribe(transition => {
    // You can have more than one subscriber
});

stateMachine.transition('activate');
```

### Remove transitions

To remove an event, transition or subscriber.

```js
stateMachine.removeEvent('pause');
stateMachine.removeTransition({ from: 'active', to: 'paused' });
stateMachine.unsubscribe(subscriber);
```

### Manage object state

There are different ways you can use the state machine to manage the state of an object. Here's one example.

```js
class Device {
    constructor() {
        this._stateMachine = StateMachine.create('inactive');

        // Configure your state machine here... i.e.:
        this._stateMachine.addEvent('activate', [
            { from: 'inactive', to: 'active' },
        ]);

        this._stateMachine.subscribe(this.handleChange.bind(this));
    }

    getState() {
        return this._stateMachine.getState();
    }

    activate() {
        this._stateMachine.triggerEvent('activate');
    }

    handleChange(transition) {
        // Do more things after a successful transition
    }
}
```

## Development

To build distribution files, please run

```
npm run build
```

To run tests, please run

```
npm test
```

To see a test coverage report, please run

```
npm run coverage
```

To lint your code, please run

```
npm run lint
```

## Contribution

If you like to contribute, please make a pull request explaining your changes. If you want to make a suggestion or file a bug report, please create a GitHub issue.

## License

ISC
