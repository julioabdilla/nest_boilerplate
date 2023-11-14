class QueueIterable {
  private items: IQueueItem[] = [];

  constructor(items?: IQueueItem[]) {
    this.items = items || [];
  }

  public get(i: number): IQueueItem {
    return this.items[i];
  }

  public put(item: IQueueItem) {
    this.items.push(item);
    this.run();
  }

  private run(){
    if(!this.items.find(item => item.isProcessing)) {
      this.items[0].isProcessing = true;
      this.items[0].command();
      this.items.shift();
      this.run();
    }
  }
}

export interface IQueueItem {
  isProcessing?: boolean;
  command: Function;
}

export default class Queue {
  private static queueItems: QueueIterable;
  public static run(command: Function) {
    if (!this.queueItems) {
      this.queueItems = new QueueIterable();
    }
    const item: IQueueItem = {
      isProcessing: false,
      command,
    }
    this.queueItems.put(item);
  }
}
