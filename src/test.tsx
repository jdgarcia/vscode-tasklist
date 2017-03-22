function noop() {}

interface TasklistStoreConfig {
    todo?: string[];
    complete?: string[];
}

class TasklistStore {
    private todo: string[];
    private complete: string[];
    private changeCallbacks: { (state: TasklistState): void }[];

    constructor(initialState: TasklistStoreConfig = {}) {
        this.todo = initialState.todo || [];
        this.complete = initialState.complete;
        this.changeCallbacks = [];
    }

    private emitChange(): void {
        const { todo, complete } = this;
        this.changeCallbacks.forEach(cb => cb({ todo, complete }));
    }

    public subscribe(callback: { (state: TasklistState): void }) {
        this.changeCallbacks.push(callback);
    }

    public unsubscribe(callback: { (state: TasklistState): void }) {
        const index = this.changeCallbacks.indexOf(callback);
        if (index >= 0) {
            this.changeCallbacks.splice(index, 1);
        }
    }

    public addTodo(item: string) {
        console.log('add');
        this.todo.push(item);
        this.emitChange();
    }

    public markComplete(index: number) {
        console.log('done');
        this.moveItem(this.todo, this.complete, index);
    }

    public unmarkComplete(index: number) {
        console.log('undone');
        this.moveItem(this.complete, this.todo, index);
    }

    public removeTodo(index: number) {
        console.log('remove undone');
        this.todo.splice(index, 1);
        this.emitChange();
    }

    public removeCompleted(index: number) {
        console.log('remove done');
        this.complete.splice(index, 1);
        this.emitChange();
    }

    public removeAllCompleted() {
        console.log('remove all');
        this.complete = [];
        this.emitChange();
    }

    private moveItem(fromList: string[], toList: string[], fromIndex: number) {
        toList.push(fromList[fromIndex]);
        fromList.splice(fromIndex, 1);
        this.emitChange();
    }
}

let store: TasklistStore;

interface ItemRowProps {
    item: string;
    listIndex: number;
    complete: boolean;
}

class ItemRow extends React.Component<ItemRowProps, undefined> {
    constructor(props: ItemRowProps) {
        super(props);

        this.onCheck = this.onCheck.bind(this);
        this.onRemove = this.onRemove.bind(this);
    }

    onCheck() {
        const { complete, listIndex } = this.props;
        complete ? store.unmarkComplete(listIndex) : store.markComplete(listIndex);
    }

    onRemove() {
        const { complete, listIndex } = this.props;
        complete ? store.removeCompleted(listIndex) : store.removeTodo(listIndex);
    }

    render() {
        const { item, complete } = this.props;

        return (
            <div className="item">
                <label className={complete ? 'complete' : ''}>
                    <input type="checkbox" onChange={this.onCheck} checked={complete} />
                    {item}
                </label>
                <span onClick={this.onRemove}>x</span>
            </div>
        );
    }
}

interface ItemListProps {
    complete?: boolean;
    items: string[];
}

class ItemList extends React.Component<ItemListProps, undefined> {
    static defaultProps: ItemListProps = {
        complete: false,
        items: []
    }

    constructor(props: ItemListProps) {
        super(props);

        this.removeAll = this.removeAll.bind(this);
    }

    removeAll() {
        if (this.props.complete) {
            store.removeAllCompleted();
        }
    }

    render() {
        const { complete, items } = this.props;
        const header = complete ? 'Complete' : 'To Do';
        const keyPrefix = complete ? 'complete-' : 'todo-';

        return (
            <div className="items">
                <div>{header}</div>
                {
                    items.map((item, i) =>
                        <ItemRow
                            key={keyPrefix + i}
                            item={item}
                            listIndex={i}
                            complete={complete}
                        />
                    )
                }
                { complete && items.length ? <div onClick={this.removeAll}>Remove All</div> : null }
            </div>
        );
    }
}

interface TasklistState {
    todo: string[];
    complete: string[];
}

class Tasklist extends React.Component<undefined, TasklistState> {
    refs: {
        addInput: HTMLInputElement
    }

    constructor() {
        super();

        const savedState = localStorage.getItem('tasklistState');

        this.state = savedState ? JSON.parse(savedState) : { todo: [], complete: [] };

        store = new TasklistStore(this.state);
        store.subscribe(state => {
            this.setState(state);
            localStorage.setItem('tasklistState', JSON.stringify(this.state));
        });

        this.onInputKeyDown = this.onInputKeyDown.bind(this);
        this.addItem = this.addItem.bind(this);
    }

    componentDidUpdate() {
        this.refs.addInput.focus();
    }

    onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            this.addItem();
        }
    }

    addItem() {
        const { addInput } = this.refs;
        const value = addInput.value.trim();

        if (value) {
            addInput.value = '';
            store.addTodo(value);
        }
    }

    render() {
        /// console.log(JSON.stringify(this.state));
        const { todo, complete } = this.state;

        return (
            <div className="tasklist">
                <input type="text" ref="addInput" onKeyDown={this.onInputKeyDown} autoFocus />
                <button onClick={this.addItem}>Add</button>
                <div className="listContainer">
                    <ItemList items={todo} />
                    <ItemList items={complete} complete />
                </div>
            </div>
        );
    }
}

ReactDOM.render(<Tasklist />, document.getElementById('tasklist'));