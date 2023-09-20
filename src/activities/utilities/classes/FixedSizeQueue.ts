export class FixedSizeQueue<T> {
    private queue: T[];
    private maxSize: number;

    constructor(maxSize: number = 10) {
        this.queue = [];
        this.maxSize = maxSize;
    }

    push(item: T): void {
        if (this.queue.length === this.maxSize) {
            this.queue.shift();  // Remove the oldest item
        }
        this.queue.push(item);
    }

    getItems(): T[] {
        return this.queue;
    }

    getLength(): number {
        return this.queue.length;
    }
};