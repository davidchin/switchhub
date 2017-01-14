import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SampleEvent, SampleState } from './mocks';
import { StateMachine } from '../src';

describe('StateMachine', () => {
    let stateMachine: StateMachine;

    beforeEach(() => {
        stateMachine = StateMachine.create(SampleState.Parked);

        stateMachine.addEvent(SampleEvent.Park, [
            { from: SampleState.Idling, to: SampleState.Parked },
            { from: SampleState.FirstGear, to: SampleState.Parked },
        ]);

        stateMachine.addEvent(SampleEvent.Ignite, [
            { from: SampleState.Stalled, to: SampleState.Stalled },
            { from: SampleState.Parked, to: SampleState.Idling },
        ]);

        stateMachine.addEvent(SampleEvent.Idle, [
            { from: SampleState.FirstGear, to: SampleState.Idling },
        ]);

        stateMachine.addEvent(SampleEvent.ShiftUp, [
            { from: SampleState.Idling, to: SampleState.FirstGear },
            { from: SampleState.FirstGear, to: SampleState.SecondGear },
            { from: SampleState.SecondGear, to: SampleState.ThirdGear },
        ]);

        stateMachine.addEvent(SampleEvent.ShiftDown, [
            { from: SampleState.ThirdGear, to: SampleState.SecondGear },
            { from: SampleState.SecondGear, to: SampleState.FirstGear },
        ]);

        stateMachine.addEvent(SampleEvent.Repair, [
            { from: SampleState.Stalled, to: SampleState.Parked },
        ]);
    });

    it('transitions to a state by event', () => {
        stateMachine.transitionByEvent(SampleEvent.Ignite);

        expect(stateMachine.getState()).to.equal(SampleState.Idling);
    });

    it('returns the previous state after a transition', () => {
        stateMachine.transitionByEvent(SampleEvent.Ignite);

        expect(stateMachine.getPreviousState()).to.equal(SampleState.Parked);

        stateMachine.transitionByEvent(SampleEvent.ShiftUp);

        expect(stateMachine.getPreviousState()).to.equal(SampleState.Idling);
    });

    it('keeps its current state if unable to transition by event', () => {
        stateMachine.transitionByEvent(SampleEvent.ShiftDown);

        expect(stateMachine.getState()).to.equal(SampleState.Parked);
    });

    it('transitions to a state directly', () => {
        stateMachine.transition(SampleState.Idling);

        expect(stateMachine.getState()).to.equal(SampleState.Idling);
    });

    it('keeps its current state if unable to transition to the new state', () => {
        stateMachine.transition(SampleState.ThirdGear);

        expect(stateMachine.getState()).to.equal(SampleState.Parked);
    });

    it('transitions to a state when all conditions are met', () => {
        let canCrash = false;

        stateMachine.addEvent(SampleEvent.Crash, [
            { from: SampleState.Parked, to: SampleState.Damaged, condition: () => canCrash },
        ]);

        stateMachine.transitionByEvent(SampleEvent.Crash);

        expect(stateMachine.getState()).not.to.equal(SampleState.Damaged);

        canCrash = true;

        stateMachine.transitionByEvent(SampleEvent.Crash);

        expect(stateMachine.getState()).to.equal(SampleState.Damaged);
    });

    it('notifies all the subscribers after a successful state transition by event', () => {
        const subscriberA = sinon.spy();
        const subscriberB = sinon.spy();

        stateMachine.subscribe(subscriberA);
        stateMachine.subscribe(subscriberB);

        stateMachine.transitionByEvent(SampleEvent.ShiftUp);

        expect(subscriberA.called).to.equal(false);
        expect(subscriberB.called).to.equal(false);

        stateMachine.transitionByEvent(SampleEvent.Ignite);

        expect(subscriberA.calledWith({ event: SampleEvent.Ignite, from: SampleState.Parked, to: SampleState.Idling })).to.equal(true);
        expect(subscriberB.calledWith({ event: SampleEvent.Ignite, from: SampleState.Parked, to: SampleState.Idling })).to.equal(true);
    });

    it('notifies all the subscribers after a successful direct state transition', () => {
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

    it('does not notify subscribers when transitioning to the same state', () => {
        const subscriber = sinon.spy();

        stateMachine.subscribe(subscriber);
        stateMachine.transition(SampleState.Parked);

        expect(subscriber.called).to.equal(false);
    });

    it('stops notifying subscribers when they are unsubscribed', () => {
        const subscriber = sinon.spy();

        stateMachine.subscribe(subscriber);
        stateMachine.unsubscribe(subscriber);
        stateMachine.transitionByEvent(SampleEvent.Ignite);

        expect(subscriber.called).to.equal(false);
    });

    it('returns true if there is a known transition between the new and the current state', () => {
        expect(stateMachine.canTransition(SampleState.Idling)).to.equal(true);
        expect(stateMachine.canTransition(SampleState.FirstGear)).to.equal(false);

        stateMachine.transition(SampleState.Idling);

        expect(stateMachine.canTransition(SampleState.FirstGear)).to.equal(true);
    });

    it('returns true if the condition of a transition is met', () => {
        let canCrash = false;

        stateMachine.addEvent(SampleEvent.Crash, [
            { from: SampleState.Parked, to: SampleState.Damaged, condition: () => canCrash },
        ]);

        expect(stateMachine.canTransition(SampleState.Damaged)).to.equal(false);

        canCrash = true;

        expect(stateMachine.canTransition(SampleState.Damaged)).to.equal(true);
    });

    it('transitions to a state without registering it with an event', () => {
        stateMachine.addTransition({ from: SampleState.Parked, to: SampleState.Damaged });

        stateMachine.transition(SampleState.Damaged);

        expect(stateMachine.getState()).to.equal(SampleState.Damaged);
    });

    it('replaces the transition when adding a transition that is already registered', () => {
        stateMachine.addTransition({ from: SampleState.Parked, to: SampleState.Idling, condition: () => false });

        expect(stateMachine.canTransition(SampleState.Idling)).to.equal(false);
    });

    it('appends transitions when adding an event that is already registered', () => {
        stateMachine.addEvent(SampleEvent.Ignite, [
            { from: SampleState.Parked, to: 'TestState' },
        ]);

        expect(stateMachine.hasTransition({ from: SampleState.Parked, to: SampleState.Idling })).to.equal(true);
        expect(stateMachine.hasTransition({ from: SampleState.Parked, to: 'TestState' })).to.equal(true);
    });

    it('removes a registered event', () => {
        expect(stateMachine.hasEvent(SampleEvent.Ignite)).to.equal(true);

        stateMachine.removeEvent(SampleEvent.Ignite);

        expect(stateMachine.hasEvent(SampleEvent.Ignite)).to.equal(false);
    });

    it('removes a registered transition', () => {
        const transition = { from: SampleState.Parked, to: SampleState.Idling };

        expect(stateMachine.hasTransition(transition)).to.equal(true);

        stateMachine.removeTransition(transition);

        expect(stateMachine.hasTransition(transition)).to.equal(false);
    });

    it('ignores the call when trying to remove an unknown event', () => {
        expect(() => stateMachine.removeEvent('UnknownEvent')).not.to.throw(Error);
    });

    it('ignores the call when trying to remove an unknown transition', () => {
        const transition = { from: SampleState.Parked, to: 'UnknownState' };

        expect(() => stateMachine.removeTransition(transition)).not.to.throw(Error);
    });

    it('ignores the call when trying to remove an unknown subscriber', () => {
        expect(() => stateMachine.unsubscribe(() => {})).not.to.throw(Error);
    });

    it('throws an error when trying to transition to an unknown state', () => {
        expect(() => stateMachine.transition('UnknownState')).to.throw(Error);
    });

    it('throws an error when trying to dispatch an unknown event', () => {
        expect(() => stateMachine.transitionByEvent('UnknownEvent')).to.throw(Error);
    });

    it('throws an error when trying to transition without a valid initial state', () => {
        stateMachine = StateMachine.create(SampleState.Damaged);

        stateMachine.addEvent(SampleEvent.Park, [
            { from: SampleState.Idling, to: SampleState.Parked },
            { from: SampleState.FirstGear, to: SampleState.Parked },
        ]);

        expect(() => stateMachine.transitionByEvent(SampleEvent.Park)).to.throw(Error);
        expect(() => stateMachine.transition(SampleState.Parked)).to.throw(Error);
    });
});
