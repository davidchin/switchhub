import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SampleEvent, SampleState } from '../mocks';
import { Event, StateMachine } from '../../src';

describe('StateMachine', () => {
    let events: Event[];

    beforeEach(() => {
        events = [
            {
                name: SampleEvent.Park,
                transitions: [
                    { from: SampleState.Idling, to: SampleState.Parked },
                    { from: SampleState.FirstGear, to: SampleState.Parked },
                ],
            },
            {
                name: SampleEvent.Ignite,
                transitions: [
                    { from: SampleState.Stalled, to: SampleState.Stalled },
                    { from: SampleState.Parked, to: SampleState.Idling },
                ],
            },
            {
                name: SampleEvent.Idle,
                transitions: [
                    { from: SampleState.FirstGear, to: SampleState.Idling },
                ],
            },
            {
                name: SampleEvent.ShiftUp,
                transitions: [
                    { from: SampleState.Idling, to: SampleState.FirstGear },
                    { from: SampleState.FirstGear, to: SampleState.SecondGear },
                    { from: SampleState.SecondGear, to: SampleState.ThirdGear },
                ],
            },
            {
                name: SampleEvent.ShiftDown,
                transitions: [
                    { from: SampleState.ThirdGear, to: SampleState.SecondGear },
                    { from: SampleState.SecondGear, to: SampleState.FirstGear },
                ],
            },
            {
                name: SampleEvent.Repair,
                transitions: [
                    { from: SampleState.Stalled, to: SampleState.Parked },
                ],
            },
        ];
    });

    describe('.create', () => {
        it('registers multiple events when creating the instance', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            expect(stateMachine.hasEvent(SampleEvent.Park)).to.equal(true);
            expect(stateMachine.hasEvent(SampleEvent.Ignite)).to.equal(true);
        });
    });

    describe('#triggerEvent', () => {
        it('transitions to a state by event', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            stateMachine.triggerEvent(SampleEvent.Ignite);

            expect(stateMachine.getState()).to.equal(SampleState.Idling);
        });

        it('returns the previous state after a transition', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            stateMachine.triggerEvent(SampleEvent.Ignite);

            expect(stateMachine.getPreviousState()).to.equal(SampleState.Parked);

            stateMachine.triggerEvent(SampleEvent.ShiftUp);

            expect(stateMachine.getPreviousState()).to.equal(SampleState.Idling);
        });

        it('keeps its current state if unable to transition by event', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            stateMachine.triggerEvent(SampleEvent.ShiftDown);

            expect(stateMachine.getState()).to.equal(SampleState.Parked);
        });

        it('transitions to a state when all conditions are met', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            let canCrash = false;

            stateMachine.addEvent(SampleEvent.Crash, [
                { from: SampleState.Parked, to: SampleState.Damaged, condition: () => canCrash },
            ]);

            stateMachine.triggerEvent(SampleEvent.Crash);

            expect(stateMachine.getState()).not.to.equal(SampleState.Damaged);

            canCrash = true;

            stateMachine.triggerEvent(SampleEvent.Crash);

            expect(stateMachine.getState()).to.equal(SampleState.Damaged);
        });

        it('throws an error when trying to dispatch an unknown event', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            expect(() => stateMachine.triggerEvent('UnknownEvent')).to.throw(Error);
        });

        it('throws an error when trying to transition without a valid initial state', () => {
            const stateMachine = StateMachine.create(SampleState.Damaged, events);

            expect(() => stateMachine.triggerEvent(SampleEvent.Park)).to.throw(Error);
        });
    });

    describe('#transition', () => {
        it('transitions to a state directly', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            stateMachine.transition(SampleState.Idling);

            expect(stateMachine.getState()).to.equal(SampleState.Idling);
        });

        it('keeps its current state if unable to transition to the new state', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            stateMachine.transition(SampleState.ThirdGear);

            expect(stateMachine.getState()).to.equal(SampleState.Parked);
        });

        it('throws an error when trying to transition to an unknown state', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            expect(() => stateMachine.transition('UnknownState')).to.throw(Error);
        });

        it('throws an error when trying to transition without a valid initial state', () => {
            const stateMachine = StateMachine.create(SampleState.Damaged, events);

            expect(() => stateMachine.transition(SampleState.Parked)).to.throw(Error);
        });
    });

    describe('#subscribe', () => {
        it('notifies all the subscribers after a successful state transition by event', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            const subscriberA = sinon.spy();
            const subscriberB = sinon.spy();

            stateMachine.subscribe(subscriberA);
            stateMachine.subscribe(subscriberB);

            stateMachine.triggerEvent(SampleEvent.ShiftUp);

            expect(subscriberA.called).to.equal(false);
            expect(subscriberB.called).to.equal(false);

            stateMachine.triggerEvent(SampleEvent.Ignite);

            expect(subscriberA.calledWith({ event: SampleEvent.Ignite, from: SampleState.Parked, to: SampleState.Idling })).to.equal(true);
            expect(subscriberB.calledWith({ event: SampleEvent.Ignite, from: SampleState.Parked, to: SampleState.Idling })).to.equal(true);
        });

        it('passes additional data to all the subscribers after a successful state transition by event', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            const subscriber = sinon.spy();
            const data = { message: 'Hello world' };

            stateMachine.subscribe(subscriber);
            stateMachine.triggerEvent(SampleEvent.Ignite, data);

            expect(subscriber.calledWith(sinon.match({ data }))).to.equal(true);
        });

        it('notifies all the subscribers after a successful direct state transition', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            const subscriberA = sinon.spy();
            const subscriberB = sinon.spy();

            stateMachine.subscribe(subscriberA);
            stateMachine.subscribe(subscriberB);

            stateMachine.transition(SampleState.ThirdGear);

            expect(subscriberA.called).to.equal(false);
            expect(subscriberB.called).to.equal(false);

            stateMachine.transition(SampleState.Idling);

            expect(subscriberA.calledWith({ from: SampleState.Parked, to: SampleState.Idling })).to.equal(true);
            expect(subscriberB.calledWith({ from: SampleState.Parked, to: SampleState.Idling })).to.equal(true);
        });

        it('passes additional data to all the subscribers after a successful direct state transition', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            const subscriber = sinon.spy();
            const data = { message: 'Hello world' };

            stateMachine.subscribe(subscriber);
            stateMachine.transition(SampleState.Idling, data);

            expect(subscriber.calledWith(sinon.match({ data }))).to.equal(true);
        });

        it('does not notify subscribers when transitioning to the same state', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            const subscriber = sinon.spy();

            stateMachine.subscribe(subscriber);
            stateMachine.transition(SampleState.Parked);

            expect(subscriber.called).to.equal(false);
        });

        it('stops notifying subscribers when they are unsubscribed', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            const subscriber = sinon.spy();

            stateMachine.subscribe(subscriber);
            stateMachine.unsubscribe(subscriber);
            stateMachine.triggerEvent(SampleEvent.Ignite);

            expect(subscriber.called).to.equal(false);
        });
    });

    describe('#canTransition', () => {
        it('returns true if there is a known transition between the new and the current state', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            expect(stateMachine.canTransition(SampleState.Idling)).to.equal(true);
            expect(stateMachine.canTransition(SampleState.FirstGear)).to.equal(false);

            stateMachine.transition(SampleState.Idling);

            expect(stateMachine.canTransition(SampleState.FirstGear)).to.equal(true);
        });

        it('returns true if the condition of a transition is met', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            let canCrash = false;

            stateMachine.addEvent(SampleEvent.Crash, [
                { from: SampleState.Parked, to: SampleState.Damaged, condition: () => canCrash },
            ]);

            expect(stateMachine.canTransition(SampleState.Damaged)).to.equal(false);

            canCrash = true;

            expect(stateMachine.canTransition(SampleState.Damaged)).to.equal(true);
        });
    });

    describe('#addTransition', () => {
        it('transitions to a state without registering it with an event', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);

            stateMachine.addTransition({ from: SampleState.Parked, to: SampleState.Damaged });
            stateMachine.transition(SampleState.Damaged);

            expect(stateMachine.getState()).to.equal(SampleState.Damaged);
        });

        it('replaces the transition when adding a transition that is already registered', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            stateMachine.addTransition({ from: SampleState.Parked, to: SampleState.Idling, condition: () => false });

            expect(stateMachine.canTransition(SampleState.Idling)).to.equal(false);
        });
    });

    describe('#addEvent', () => {
        it('appends transitions when adding an event that is already registered', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: 'TestState' },
            ]);

            expect(stateMachine.hasTransition({ from: SampleState.Parked, to: SampleState.Idling })).to.equal(true);
            expect(stateMachine.hasTransition({ from: SampleState.Parked, to: 'TestState' })).to.equal(true);
        });

        it('throws an error when registering an event without at least one transition', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);

            expect(() => stateMachine.addEvent('EventA', [])).to.throw(Error);
        });
    });

    describe('#undoTransition', () => {
        it('undoes a state transition if it is possible to revert', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);
            const subscriber = sinon.spy();

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: SampleState.Idling, undoable: true },
            ]);
            stateMachine.subscribe(subscriber);
            stateMachine.triggerEvent(SampleEvent.Ignite);

            subscriber.reset();
            stateMachine.undoTransition();

            expect(stateMachine.getState()).to.equal(SampleState.Parked);
            expect(subscriber.calledWith(sinon.match({ from: SampleState.Idling, to: SampleState.Parked, undo: true }))).to.equal(true);
        });

        it('does not undo a state transition if there is nothing to undo', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);
            const subscriber = sinon.spy();

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: SampleState.Idling, undoable: true },
            ]);
            stateMachine.subscribe(subscriber);
            stateMachine.triggerEvent(SampleEvent.Ignite);

            subscriber.reset();
            stateMachine.undoTransition();
            stateMachine.undoTransition();

            expect(subscriber.callCount).to.equal(1);
        });
    });

    describe('#redoTransition', () => {
        it('redoes a state transition if there is a reverted state', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);
            const subscriber = sinon.spy();
            const data = { id: 1 };

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: SampleState.Idling, undoable: true },
            ]);
            stateMachine.subscribe(subscriber);
            stateMachine.triggerEvent(SampleEvent.Ignite, data);
            stateMachine.undoTransition();

            subscriber.reset();
            stateMachine.redoTransition();

            expect(stateMachine.getState()).to.equal(SampleState.Idling);
            expect(subscriber.calledWith(sinon.match({ data, from: SampleState.Parked, to: SampleState.Idling, redo: true }))).to.equal(true);
        });

        it('does not redo a state transition if there is nothing to redo', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);
            const subscriber = sinon.spy();

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: SampleState.Idling, undoable: true },
            ]);
            stateMachine.subscribe(subscriber);
            stateMachine.triggerEvent(SampleEvent.Ignite);
            stateMachine.undoTransition();

            subscriber.reset();
            stateMachine.redoTransition();
            stateMachine.redoTransition();

            expect(subscriber.callCount).to.equal(1);
        });
    });

    describe('#canUndo', () => {
        it('returns true if it is possible to undo', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: SampleState.Idling, undoable: true },
            ]);

            expect(stateMachine.canUndo()).to.equal(false);

            stateMachine.triggerEvent(SampleEvent.Ignite);

            expect(stateMachine.canUndo()).to.equal(true);

            stateMachine.undoTransition();

            expect(stateMachine.canUndo()).to.equal(false);
        });

        it('returns false it is configured not to be undoable', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: SampleState.Idling },
            ]);

            stateMachine.triggerEvent(SampleEvent.Ignite);

            expect(stateMachine.canUndo()).to.equal(false);
        });
    });

    describe('#canRedo', () => {
        it('returns true if it is possible to redo', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: SampleState.Idling, undoable: true },
            ]);

            expect(stateMachine.canRedo()).to.equal(false);

            stateMachine.triggerEvent(SampleEvent.Ignite);

            expect(stateMachine.canRedo()).to.equal(false);

            stateMachine.undoTransition();

            expect(stateMachine.canRedo()).to.equal(true);
        });

        it('returns false it is configured not to be redoable', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);
            let canTransition = true;

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: SampleState.Idling, undoable: true, condition: () => canTransition },
            ]);

            stateMachine.triggerEvent(SampleEvent.Ignite);
            stateMachine.undoTransition();

            canTransition = false;

            expect(stateMachine.canRedo()).to.equal(false);
        });

        it('clears all future states when there is a new transition', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);

            stateMachine.addEvent(SampleEvent.Ignite, [
                { from: SampleState.Parked, to: SampleState.Idling, undoable: true },
            ]);
            stateMachine.triggerEvent(SampleEvent.Ignite);
            stateMachine.undoTransition();
            stateMachine.triggerEvent(SampleEvent.Ignite);

            expect(stateMachine.canRedo()).to.equal(false);
        });
    });

    describe('#getHistory', () => {
        it('limits the number of records in the history stack', () => {
            const stateMachine = StateMachine.create('step_0');
            const states = [];

            for (let i = 0; i < 60; i++) {
                states.push({ from: `step_${i}`, to: `step_${i + 1}` });
            }

            stateMachine.addEvent('increment', states);

            for (let i = 0; i < 60; i++) {
                stateMachine.triggerEvent('increment');
            }

            expect(stateMachine.getHistory().stack.length).to.equal(50);
        });
    });

    describe('#addEvents', () => {
        it('registers multiple events', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);

            expect(stateMachine.hasEvent(SampleEvent.Park)).to.equal(false);
            expect(stateMachine.hasEvent(SampleEvent.Ignite)).to.equal(false);

            stateMachine.addEvents([
                {
                    name: SampleEvent.Park,
                    transitions: [
                        { from: SampleState.Idling, to: SampleState.Parked },
                        { from: SampleState.FirstGear, to: SampleState.Parked },
                    ],
                },
                {
                    name: SampleEvent.Ignite,
                    transitions: [
                        { from: SampleState.Stalled, to: SampleState.Stalled },
                        { from: SampleState.Parked, to: SampleState.Idling },
                    ],
                },
            ]);

            expect(stateMachine.hasEvent(SampleEvent.Park)).to.equal(true);
            expect(stateMachine.hasEvent(SampleEvent.Ignite)).to.equal(true);
        });
    });

    describe('#addTransitions', () => {
        it('registers multiple transitions', () => {
            const stateMachine = StateMachine.create(SampleState.Parked);
            const transitions = [
                { from: SampleState.Idling, to: SampleState.Parked },
                { from: SampleState.FirstGear, to: SampleState.Parked },
                { from: SampleState.Stalled, to: SampleState.Stalled },
                { from: SampleState.Parked, to: SampleState.Idling },
            ];

            transitions.forEach(transition => {
                expect(stateMachine.hasTransition(transition)).to.equal(false);
            });

            stateMachine.addTransitions(transitions);

            transitions.forEach(transition => {
                expect(stateMachine.hasTransition(transition)).to.equal(true);
            });
        });
    });

    describe('#removeEvent', () => {
        it('removes a registered event', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            expect(stateMachine.hasEvent(SampleEvent.Ignite)).to.equal(true);

            stateMachine.removeEvent(SampleEvent.Ignite);

            expect(stateMachine.hasEvent(SampleEvent.Ignite)).to.equal(false);
        });

        it('ignores the call when trying to remove an unknown event', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            expect(() => stateMachine.removeEvent('UnknownEvent')).not.to.throw(Error);
        });
    });

    describe('#removeEvents', () => {
        it('removes multiple registered events', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            expect(stateMachine.hasEvent(SampleEvent.Park)).to.equal(true);
            expect(stateMachine.hasEvent(SampleEvent.Park)).to.equal(true);

            stateMachine.removeEvents([SampleEvent.Park, SampleEvent.Ignite]);

            expect(stateMachine.hasEvent(SampleEvent.Park)).to.equal(false);
            expect(stateMachine.hasEvent(SampleEvent.Park)).to.equal(false);
        });
    });

    describe('#removeTransition', () => {
        it('removes a registered transition', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            const transition = { from: SampleState.Parked, to: SampleState.Idling };

            expect(stateMachine.hasTransition(transition)).to.equal(true);

            stateMachine.removeTransition(transition);

            expect(stateMachine.hasTransition(transition)).to.equal(false);
        });

        it('ignores the call when trying to remove an unknown transition', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            const transition = { from: SampleState.Parked, to: 'UnknownState' };

            expect(() => stateMachine.removeTransition(transition)).not.to.throw(Error);
        });
    });

    describe('#removeTransitions', () => {
        it('removes multiple registered transitions', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);
            const transitionA = { from: SampleState.Parked, to: SampleState.Idling };
            const transitionB = { from: SampleState.Idling, to: SampleState.FirstGear };

            expect(stateMachine.hasTransition(transitionA)).to.equal(true);
            expect(stateMachine.hasTransition(transitionB)).to.equal(true);

            stateMachine.removeTransitions([transitionA, transitionB]);

            expect(stateMachine.hasTransition(transitionA)).to.equal(false);
            expect(stateMachine.hasTransition(transitionB)).to.equal(false);
        });
    });

    describe('#unsubscribe', () => {
        it('ignores the call when trying to remove an unknown subscriber', () => {
            const stateMachine = StateMachine.create(SampleState.Parked, events);

            expect(() => stateMachine.unsubscribe(() => {})).not.to.throw(Error);
        });
    });
});
