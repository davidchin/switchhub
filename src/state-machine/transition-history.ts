import Key from './key';
import TransitionRecord from './transition-record';

/**
 * The maximum number of history items
 */
const DEFAULT_LIMIT = 50;

/**
 * A class responsible for keeping a history of transitions
 */
export default class TransitionHistory {
    private stack: TransitionRecord[] = [];
    private index = 0;
    private limit: Number;

    /**
     * @param state - The initial state of the state machine
     * @param [limit] - The history limit
     */
    constructor(state: Key, limit: Number = DEFAULT_LIMIT) {
        this.limit = limit;

        this.stack.unshift({ state });
    }

    /**
     * Get the current record
     * @return The current record
     */
    getCurrentRecord(): TransitionRecord {
        return this.stack[this.index]!;
    }

    /**
     * Get the previous record. Return undefined if there is no previous record.
     * @return The previous record
     */
    getPreviousRecord(): TransitionRecord | undefined {
        return this.stack[this.index + 1];
    }

    /**
     * Get the next record. Return undefined if there is no next record.
     * @return The next record
     */
    getNextRecord(): TransitionRecord | undefined {
        return this.stack[this.index - 1];
    }

    /**
     * Get the transition history and the current index
     * @return The transition history and the current index
     */
    getHistory(): { index: number, stack: TransitionRecord[] } {
        return {
            index: this.index,
            stack: this.stack,
        };
    }

    /**
     * Rewind the transition history.
     */
    rewindHistory(): void {
        this.index = Math.min(this.index + 1, this.stack.length - 1);
    }

    /**
     * Forward the transition history.
     */
    forwardHistory(): void {
        this.index = Math.max(this.index - 1, 0);
    }

    /**
     * Update the transition history with a new item.
     * @param item - A transition history item
     */
    addRecord(record: TransitionRecord): void {
        this.stack.splice(0, this.index);
        this.stack.unshift(record);

        if (this.stack.length > this.limit) {
            this.stack.pop();
        }

        this.index = 0;
    }
}
