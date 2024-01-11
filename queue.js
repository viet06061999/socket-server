class Queue {
    constructor(maxSize) {
      this.maxSize = maxSize;
      this.queue = [];
    }
  
    enqueue(element) {
      if (this.queue.length >= this.maxSize) {
        this.queue.shift(); // Xóa phần tử ở đầu hàng đợi
      }
      this.queue.push(element); // Thêm phần tử vào cuối hàng đợi
    }
  
    dequeue() {
      return this.queue.shift(); // Lấy phần tử ở đầu hàng đợi
    }
  
    size() {
      return this.queue.length;
    }
}
module.exports = Queue;
