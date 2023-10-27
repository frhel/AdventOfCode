// Set up a PQueue Priority Queue class to use for the BFS algorithm
class PQueue {
    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
        this.count = 0;
        this.max_priority = -Infinity;
    }
    enqueue(element) {
        element.priority = element.priority || 0;
        if (this.count > 0) {
            let prev = this.tail;
            this.tail = this.head > this.tail ? this.head + 1 : this.tail + 1;
            this.elements[prev].next = this.tail;
            this.elements[this.tail] = element;
            this.elements[this.tail].prev = prev;
        } else {
            this.elements[this.tail] = element;
            this.elements[this.tail].prev = null;
            this.elements[this.tail].next = null;
        }
        if (element.priority > this.max_priority) {
            this.max_priority = element.priority;
            if (this.count > 0) {
                this.elements[this.tail].next = this.head;
                this.elements[this.head].prev = this.tail;
                this.head = this.tail;
                this.tail = this.elements[this.tail].prev;
                this.elements[this.tail].next = null;
                this.elements[this.head].prev = null;               
            }
        }
        this.count++;
    }
    dequeue() {
        if (this.count === 0) return undefined;
        let item = this.elements[this.head];
        this.head = item.next;
        this.count--;
        if (this.count === 0) {
            this.head = 0;
            this.tail = 0;
            this.max_priority = -Infinity;
        } else {
            this.max_priority = this.elements[this.head].priority;
        }
        delete this.elements[item];
        return item;        
    }

    peek() {
        return this.elements[this.head];
    }

    get length() {
        return this.count;
    }

    get isEmpty() {
        return this.count === 0;
    }

}
  
  exports.PQueue = PQueue;