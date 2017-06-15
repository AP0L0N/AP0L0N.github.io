interface IItem {
    name: string;
    alias: string;
    selected: boolean;

    getName(): string;
    getAlias(): string;
    getSelected(): boolean;

    setSelected(selected: boolean): void;
    setName(name: string): void;
    setAlias(alias: string): void;
}

class Item implements IItem {

    private node: HTMLElement;
    public selected: boolean = false;
    public name: string;
    public alias: string;

    public constructor(args: IItem = null) {

        this.name = args.name || "Item";
        this.alias = args.alias || null;
        this.selected = args.selected || false;
    }

    public getName() : string {
        return this.name;
    }

    public getAlias() : string {
        return this.alias;
    }

    public getSelected() : boolean {
        return this.selected;
    }

    public setNode(node: HTMLElement) : void {
        this.node = node;
    }

    public getNode() : HTMLElement {
        return this.node;
    }

    public setSelected(selected: boolean) : void {
        this.selected = selected;
    }

    public setName(name: string) : void {
        this.name = name;
    }

    public setAlias(alias: string) : void {
        this.alias = alias;
    }

    public toggleSelectedClass() : void {
        if(this.selected && this.node.className !== "selected") this.node.className = "selected";
        else if(!this.selected) this.node.className = "";
    }
}

interface IColumn {
    title: string;
    items: Item[];

    getTitle() : string;
    setTitle(title: string): void;

    getItem(name: string) : Item | boolean;
    addItem(item: Item) : void;
    removeItem(item: Item) : void;

    addNodeToList(item: HTMLElement): void;
    removeNodeFromList(item: HTMLElement): void;
    setList(list: HTMLElement) : void;
}

class Column implements IColumn {

    private list: HTMLElement;

    public title: string;
    public items: Item[];

    public constructor(args: IColumn = null) {

        this.title = args.title || "Column";
        this.items =  args.items.map(obj => new Item(obj)) || [];
    }

    public getTitle() : string {
        return this.title;
    }

    public setTitle(title: string) : void {
        this.title = title;
    }

    public getItem(name: string) : Item | boolean {

        let foundItem = false;

        Array.prototype.forEach.call(this.items, function(item) {

            if(item.getAlias() === name || item.getName() === name) {

                foundItem = item;
            }
        });

        return foundItem;
    };

    public getList() : HTMLElement {

        return this.list;
    }

    public setList(list: HTMLElement) : void {

        this.list = list;
    }

    public addItem(item: Item) : void {

        this.items.push(item);
    }

    public removeItem(item: Item) : void {
        let handle = this;

        // Find item in column
        Array.prototype.forEach.call(handle.items, function(current, index) {
            if(current === item) {

                // Remove item from column
                handle.items.splice(index, 1);
            }
        });
    }

    public addNodeToList(node: HTMLElement) : void {

        // Add node to list
        this.list.appendChild(node);
    }

    public removeNodeFromList(node: HTMLElement) : void {

        let handle = this;

        // Find item in column
        Array.prototype.forEach.call(handle.items, function(current) {

            if(current.getNode() === node) {



                // Remove item from column
                handle.list.removeChild(node);
            }
        });
    }

    public hasSelectedItems() : boolean {

        let selectedItems = false;

        Array.prototype.forEach.call(this.items, function(item) {

            if(item.getSelected()) selectedItems = true;
        });

        return selectedItems;
    }
}

class Widget {

    private wrapper: Element;

    public title: string;
    public columns: Column[];
    public static selectable: boolean = false;

    /***
     * Widget for sorting items left and right.
     *
     * @param wrapper {string | HTMLElement} <p>Either pass widget html node ID or HTMLElement node. Wrapper node is used to create columns inside.</p>
     * @param args {Widget} <p>Widget options such as title and columns.</p>
     */
    public constructor(wrapper: string | Element, args: Widget = null) {

        this.wrapper = (typeof wrapper === "string" ? document.getElementById(wrapper) : wrapper);
        this.title = args.title || null;
        this.columns = args.columns.map(obj => new Column(obj)) || null;

        // Check if wrapper exists
        if(this.wrapper === null || typeof this.wrapper === "undefined") throw "Wrapper for class Widget not found.";

        // Check if more then one columns- else throw exception
        if(this.columns.length < 1) throw "Number of columns is invalid.";

        document.addEventListener("keydown", function(key) {
            if(key.key === "Control") {
                Widget.setSelectable(true);
            }
        });

        document.addEventListener("keyup", function() {
            Widget.setSelectable(false);
        });

        // Draw the columns
        this.drawColumns();
    }

    /***
     * Draw initial columns and set items and events
     */
    private drawColumns() : void {

        let handle = this;

        // Append title;
        if(this.title !== null) {
            let titleNode = document.createElement("h1");
            let text = document.createTextNode(handle.title);
            titleNode.appendChild(text);
            handle.wrapper.appendChild(titleNode);
        }

        if(handle.columns !== null && handle.columns.length > 0) {

            Array.prototype.forEach.call(handle.columns, function(column, index) {

                let listWrapper = document.createElement("div");
                let list = document.createElement("ol");

                // Append title if set
                if(column.getTitle() !== null) {
                    let titleNode = document.createElement("h2");
                    let text = document.createTextNode(column.getTitle());
                    titleNode.appendChild(text);
                    listWrapper.appendChild(titleNode);
                }

                listWrapper.appendChild(list);
                handle.wrapper.appendChild(listWrapper);
                column.setList(list);

                // Create items inside list
                Array.prototype.forEach.call(column.items, function(item) {

                    let itemNode = document.createElement("li");
                    let text = document.createTextNode(item.getName());
                    itemNode.appendChild(text);

                    // Append alias if set;
                    if(item.getAlias() !== null) {
                        let aliasNode = document.createElement("span");
                        text = document.createTextNode(item.getAlias());
                        aliasNode.appendChild(text);
                        aliasNode.className = "alias";
                        itemNode.appendChild(aliasNode);
                    }

                    item.setNode(itemNode);
                    item.toggleSelectedClass();

                    // Add on click event to item - makes it selectable
                    itemNode.addEventListener("click", function() {

                        handle.addSelectionEventToItem(handle, item, column, listWrapper);
                    });

                    // Finally append newly created node to current list
                    column.addNodeToList(itemNode);
                });

                // Add button "Move to left" if possible
                if(typeof handle.columns[index-1] !== "undefined") {
                    handle.initiateMoveButton(handle, listWrapper, column, handle.columns[index-1], "<<");
                }

                // Add button "Move to right" if possible
                if(typeof handle.columns[index+1] !== "undefined") {
                    handle.initiateMoveButton(handle, listWrapper, column, handle.columns[index+1], ">>");
                }
            });

        } else throw "No columns set.";
    };

    private initiateMoveButton(handle, listWrapper, currentColumn, nextColumn, sign) : void {

        let button = document.createElement("button");
        let text = document.createTextNode(sign);
        button.className = "action";
        button.appendChild(text);
        listWrapper.appendChild(button);

        if(!currentColumn.hasSelectedItems()) {

            button.setAttribute("disabled", "disabled");
        }

        button.addEventListener("click", function() {

            Array.prototype.forEach.call(currentColumn.items.slice(), function(itemToLeft) {

                if(itemToLeft.getSelected()) {

                    let clone = itemToLeft.getNode().cloneNode();
                    while (itemToLeft.getNode().firstChild) {
                        clone.appendChild(itemToLeft.getNode().lastChild);
                    }

                    nextColumn.addItem(itemToLeft);
                    nextColumn.addNodeToList(clone);

                    currentColumn.removeNodeFromList(itemToLeft.getNode());
                    currentColumn.removeItem(itemToLeft);

                    clone.addEventListener("click", function() {

                        handle.addSelectionEventToItem(handle, itemToLeft, nextColumn, nextColumn.getList().parentElement);
                    });

                    itemToLeft.setNode(clone);
                    itemToLeft.setSelected(false);
                    itemToLeft.toggleSelectedClass();
                }
            });

            // Handle disabling and enabling of buttons
            let buttons = handle.wrapper.getElementsByTagName("button");

            // Disable column buttons
            Array.prototype.forEach.call(buttons, function(btnItem) {
                btnItem.setAttribute("disabled", "disabled");
            });
        });
    }

    private addSelectionEventToItem(handle, item, column, listWrapper) {

        if(Widget.getSelectable()) {

            item.setSelected(!item.getSelected());
            item.toggleSelectedClass();

            // Remove selected status from other items in other columns then the current one
            Array.prototype.forEach.call(handle.columns, function(col) {
                if(col !== column) {

                    Array.prototype.forEach.call(col.items, function(colItem) {
                        colItem.setSelected(false);
                        colItem.toggleSelectedClass();
                    })
                }
            });

            // Handle disabling and enabling of buttons
            let buttons = listWrapper.getElementsByTagName("button");

            if(column.hasSelectedItems()) {

                // Disable other buttons
                Array.prototype.forEach.call(handle.wrapper.getElementsByTagName("button"), function(btnItem) {
                    btnItem.setAttribute("disabled", "disabled");
                });

                // Enable column buttons
                Array.prototype.forEach.call(buttons, function(btnItem) {
                    btnItem.removeAttribute("disabled");
                });

            } else {

                // Disable column buttons
                Array.prototype.forEach.call(buttons, function(btnItem) {
                    btnItem.setAttribute("disabled", "disabled");
                });
            }
        }
    }

    /***
     * Return item from one of the columns of the widget. If the item is not found return false.
     *
     * @param name {string} <p>Item name</p>
     * @returns {boolean | Item} <p>Return either found item or false if not found.</p>
     */
    public getItem(name: string) : Item | boolean {

        let foundItem = false;

        Array.prototype.forEach.call(this.columns, function(column) {

            let item;

            if(item = column.getItem(name)) foundItem = item;
        });

        return foundItem;
    };

    /***
     * Gets the information in wich column the item is.
     *
     * @param name {string} <p>Item name</p>
     * @returns {boolean | string} <p>Return column name or false if not found.</p>
     */
    public getItemPosition(name: string) : string | boolean {

        let columnName = false;

        Array.prototype.forEach.call(this.columns, function(column) {

            if(column.getItem(name)) columnName = column.getTitle();
        });

        return columnName;
    }

    /***
     * When holding down CTRL - mark widget items as selectable.
     *
     * @param selectable {boolean} <p>Set TRUE or FALSE to selectable.</p>
     */
    public static setSelectable(selectable: boolean) : void {
        Widget.selectable = selectable;
    }

    /***
     * Get current selectable state.
     *
     * @returns {boolean} <p>Return TRUE if widget is selectable (user is holding down CTRL</p>
     */
    public static getSelectable() : boolean {
        return Widget.selectable;
    }
}