class Item {
    /***
     * Creates a new item
     *
     * @constructor
     * @param args
     */
    constructor(args = null) {
        this._selected = false;
        this._name = args && args.name || "Item";
        this._alias = args && args.alias || null;
        this._selected = args && args.selected || false;
    }
    get name() {
        return this._name;
    }
    get alias() {
        return this._alias;
    }
    get selected() {
        return this._selected;
    }
    set selected(selected) {
        this._selected = selected;
    }
    get node() {
        return this._node;
    }
    set node(node) {
        this._node = node;
    }
    /***
     * Toggle selected status on the item.
     */
    toggleSelectedClass() {
        if (this._selected && this._node.className !== "selected")
            this._node.className = "selected";
        else if (!this._selected)
            this._node.className = "";
    }
}
class Column {
    /***
     * Create new column.
     *
     * @constructor
     * @param args
     */
    constructor(args = null) {
        this._title = args && args.title || null;
        this._items = args && args.items && args.items.map(obj => new Item(obj)) || [];
    }
    get title() {
        return this._title;
    }
    set title(title) {
        this._title = title;
    }
    get items() {
        return this._items;
    }
    set items(items) {
        this._items = items.map(obj => new Item(obj));
    }
    get list() {
        return this._list;
    }
    set list(list) {
        this._list = list;
    }
    /***
     * Add item to column.
     *
     * @param item
     */
    addItem(item) {
        this._items.push(item);
    }
    /***
     * Remove item from column.
     *
     * @param item
     */
    removeItem(item) {
        let handle = this;
        handle._items.forEach((current, index) => {
            if (current === item) {
                handle._items.splice(index, 1);
                handle._list.removeChild(current.node);
            }
        });
    }
    /***
     * Find item by either name or alias.
     *
     * @param name: string <p>Either name or alias of the item</p>
     * @returns {Item|boolean}
     */
    findItem(name) {
        let item = false;
        this._items.forEach((_item) => {
            if (_item.alias == name)
                item = _item;
        });
        this._items.forEach((_item) => {
            if (_item.name == name)
                item = _item;
        });
        return item;
    }
    ;
    /***
     * Check if the column has selected items.
     *
     * @returns {boolean}
     */
    hasSelectedItems() {
        let selectedItems = false;
        this._items.forEach((item) => {
            if (item.selected)
                selectedItems = true;
        });
        return selectedItems;
    }
}
class Widget {
    /***
     * Create a new sorting widget class Widget.
     *
     * @class
     * @param wrapper {string | Node} <p>Either pass widget html node ID or Node node. Wrapper node is used to create columns inside.</p>
     * @param args {Widget} <p>Widget options such as title and columns.</p>
     */
    constructor(wrapper, args = null) {
        this._wrapper = (typeof wrapper === "string" ? document.getElementById(wrapper) : wrapper);
        this._title = args && args.title || null;
        this._columns = args && args.columns && args.columns.map(obj => new Column(obj)) || null;
        // Check if wrapper exists
        if (this._wrapper === null || typeof this._wrapper === "undefined")
            throw "Wrapper for class Widget not found.";
        // Add selectable events
        document.addEventListener("keydown", (key) => {
            if (key.key === "Control") {
                Widget.setSelectable(true);
            }
        });
        document.addEventListener("keyup", () => {
            Widget.setSelectable(false);
        });
        // Draw columns
        this.drawWidget();
    }
    /***
     * Get widget wrapper node
     *
     * @returns {Element}
     */
    get wrapper() {
        return this._wrapper;
    }
    /***
     * Get widget title
     *
     * @returns {string}
     */
    get title() {
        return this._title;
    }
    /***
     * Get widget columns
     *
     * @returns {Column[]}
     */
    get columns() {
        return this._columns;
    }
    /***
     * Set widget columns
     *
     * @param columns: Column[]
     */
    set columns(columns) {
        this._columns = columns.map(obj => new Column(obj));
    }
    /***
     * Draw initial widget columns and set items and events
     */
    drawWidget() {
        let handle = this;
        // Clear any current nodes inside wrapper in case we re-draw the widget
        this._wrapper.innerHTML = '';
        // Append title node;
        if (this._title !== null) {
            let titleNode = document.createElement("h1");
            let text = document.createTextNode(handle._title);
            titleNode.appendChild(text);
            handle.wrapper.appendChild(titleNode);
        }
        // Check if enough columns is set (minimum 2 columns)
        if (handle._columns === null || handle._columns instanceof Array) {
            handle._columns = handle._columns || [];
            for (let i = handle._columns.length; i < 2; i++) {
                handle._columns.push(new Column());
            }
        }
        // Draw columns
        handle._columns.forEach((column, index) => {
            handle.drawColumn(handle, column, index);
        });
    }
    ;
    /***
     * Draw single widget column
     *
     * @param handle; Widget
     * @param column: Column <p>Column to be drawn</p>
     * @param index: number <p>Columns index</p>
     */
    drawColumn(handle, column, index) {
        let listWrapper = document.createElement("div");
        let list = document.createElement("ol");
        // Append _title if set
        if (column.title !== null) {
            let titleNode = document.createElement("h2");
            let text = document.createTextNode(column.title);
            titleNode.appendChild(text);
            listWrapper.appendChild(titleNode);
        }
        listWrapper.appendChild(list);
        handle.wrapper.appendChild(listWrapper);
        column.list = list;
        // Create items inside list
        column.items.forEach((item) => {
            let itemNode = document.createElement("li");
            let text = document.createTextNode(item.name);
            itemNode.appendChild(text);
            // Append _alias if set;
            if (item.alias) {
                let aliasNode = document.createElement("span");
                text = document.createTextNode(item.alias);
                aliasNode.appendChild(text);
                aliasNode.className = "alias";
                itemNode.appendChild(aliasNode);
            }
            item.node = itemNode;
            item.toggleSelectedClass();
            // Add on click event to item - makes it selectable
            itemNode.addEventListener("click", function () {
                handle.addSelectionEventToItem(handle, item, column, listWrapper);
            });
            // Finally append newly created node to current list
            column.list.appendChild(itemNode);
        });
        // Add button "Move to left" if possible
        if (typeof handle._columns[index - 1] !== "undefined") {
            handle.initiateMoveButton(handle, listWrapper, column, handle._columns[index - 1], "<<");
        }
        // Add button "Move to right" if possible
        if (typeof handle._columns[index + 1] !== "undefined") {
            handle.initiateMoveButton(handle, listWrapper, column, handle._columns[index + 1], ">>");
        }
    }
    /***
     * Initiate move buttons on a single column
     *
     * @param handle: Widget
     * @param listWrapper: Node <p>List wrapper node</p>
     * @param currentColumn: Column
     * @param nextColumn: Column
     * @param sign: string <p>Button content sign</p>
     */
    initiateMoveButton(handle, listWrapper, currentColumn, nextColumn, sign) {
        let button = document.createElement("button");
        let text = document.createTextNode(sign);
        button.className = "action";
        button.appendChild(text);
        listWrapper.appendChild(button);
        if (!currentColumn.hasSelectedItems()) {
            button.setAttribute("disabled", "disabled");
        }
        button.addEventListener("click", function () {
            currentColumn.items.slice().forEach((item) => {
                if (item.selected) {
                    let clone = item.node.cloneNode();
                    while (item.node.firstChild) {
                        clone.appendChild(item.node.lastChild);
                    }
                    nextColumn.addItem(item);
                    nextColumn.list.appendChild(clone);
                    currentColumn.removeItem(item);
                    clone.addEventListener("click", function () {
                        handle.addSelectionEventToItem(handle, item, nextColumn, nextColumn.list.parentElement);
                    });
                    item.node = clone;
                    item.selected = false;
                    item.toggleSelectedClass();
                }
            });
            // Handle disabling and enabling of buttons
            let buttons = handle.wrapper.getElementsByTagName("button");
            // Disable column buttons
            Array.prototype.forEach.call(buttons, function (btnItem) {
                btnItem.setAttribute("disabled", "disabled");
            });
        });
    }
    /***
     * Add events to enable selection of items
     *
     * @param handle: Widget
     * @param item: Item
     * @param column: Column
     * @param listWrapper: HTMLElement
     */
    addSelectionEventToItem(handle, item, column, listWrapper) {
        if (Widget.getSelectable()) {
            item.selected = !item.selected;
            item.toggleSelectedClass();
            // Remove _selected status from other items in other _columns then the current one
            handle._columns.forEach((col) => {
                if (col !== column) {
                    col.items.forEach((colItem) => {
                        colItem.selected = false;
                        colItem.toggleSelectedClass();
                    });
                }
            });
            // Handle disabling and enabling of buttons
            let buttons = listWrapper.getElementsByTagName("button");
            if (column.hasSelectedItems()) {
                // Disable other buttons
                Array.prototype.forEach.call(handle.wrapper.getElementsByTagName("button"), function (btnItem) {
                    btnItem.setAttribute("disabled", "disabled");
                });
                // Enable column buttons
                Array.prototype.forEach.call(buttons, function (btnItem) {
                    btnItem.removeAttribute("disabled");
                });
            }
            else {
                // Disable column buttons
                Array.prototype.forEach.call(buttons, function (btnItem) {
                    btnItem.setAttribute("disabled", "disabled");
                });
            }
        }
    }
    /***
     * Return item from one of the _olumns of the widget. If the item is not found return false.
     *
     * @param name {string} <p>Item name</p>
     * @returns {boolean | Item} <p>Return either found item or false if not found.</p>
     */
    getItem(name) {
        let foundItem = false;
        this._columns.forEach((column) => {
            let item;
            if (item = column.findItem(name))
                foundItem = item;
        });
        return foundItem;
    }
    ;
    /***
     * Gets the information in which column the item is.
     *
     * @param name {string} <p>Item name</p>
     * @returns {boolean | string} <p>Return column name or false if not found.</p>
     */
    getItemPosition(name) {
        let columnName = false;
        this._columns.forEach((column) => {
            if (column.findItem(name))
                columnName = column.title;
        });
        return columnName;
    }
    /***
     * Find column by name
     * @param name
     * @returns {Column|boolean}
     */
    findColumn(name) {
        let column = false;
        this._columns.forEach((_column) => {
            if (_column.title === name)
                column = _column;
        });
        return column;
    }
    /***
     * When holding down CTRL - mark widget items as selectable.
     *
     * @param selectable {boolean} <p>Set TRUE or FALSE to selectable.</p>
     */
    static setSelectable(selectable) {
        Widget.selectable = selectable;
    }
    /***
     * Get current selectable state.
     *
     * @returns {boolean} <p>Return TRUE if widget is selectable (user is holding down CTRL</p>
     */
    static getSelectable() {
        return Widget.selectable;
    }
}
Widget.selectable = false;
