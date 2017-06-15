var Item = (function () {
    function Item(args) {
        if (args === void 0) { args = null; }
        this.selected = false;
        this.name = args.name || "Item";
        this.alias = args.alias || null;
        this.selected = args.selected || false;
    }
    Item.prototype.getName = function () {
        return this.name;
    };
    Item.prototype.getAlias = function () {
        return this.alias;
    };
    Item.prototype.getSelected = function () {
        return this.selected;
    };
    Item.prototype.setNode = function (node) {
        this.node = node;
    };
    Item.prototype.getNode = function () {
        return this.node;
    };
    Item.prototype.setSelected = function (selected) {
        this.selected = selected;
    };
    Item.prototype.setName = function (name) {
        this.name = name;
    };
    Item.prototype.setAlias = function (alias) {
        this.alias = alias;
    };
    Item.prototype.toggleSelectedClass = function () {
        if (this.selected && this.node.className !== "selected")
            this.node.className = "selected";
        else if (!this.selected)
            this.node.className = "";
    };
    return Item;
}());
var Column = (function () {
    function Column(args) {
        if (args === void 0) { args = null; }
        this.title = args.title || "Column";
        this.items = args.items.map(function (obj) { return new Item(obj); }) || [];
    }
    Column.prototype.getTitle = function () {
        return this.title;
    };
    Column.prototype.setTitle = function (title) {
        this.title = title;
    };
    Column.prototype.getItem = function (name) {
        var foundItem = false;
        Array.prototype.forEach.call(this.items, function (item) {
            if (item.getAlias() === name || item.getName() === name) {
                foundItem = item;
            }
        });
        return foundItem;
    };
    ;
    Column.prototype.getList = function () {
        return this.list;
    };
    Column.prototype.setList = function (list) {
        this.list = list;
    };
    Column.prototype.addItem = function (item) {
        this.items.push(item);
    };
    Column.prototype.removeItem = function (item) {
        var handle = this;
        // Find item in column
        Array.prototype.forEach.call(handle.items, function (current, index) {
            if (current === item) {
                // Remove item from column
                handle.items.splice(index, 1);
            }
        });
    };
    Column.prototype.addNodeToList = function (node) {
        // Add node to list
        this.list.appendChild(node);
    };
    Column.prototype.removeNodeFromList = function (node) {
        var handle = this;
        // Find item in column
        Array.prototype.forEach.call(handle.items, function (current) {
            if (current.getNode() === node) {
                // Remove item from column
                handle.list.removeChild(node);
            }
        });
    };
    Column.prototype.hasSelectedItems = function () {
        var selectedItems = false;
        Array.prototype.forEach.call(this.items, function (item) {
            if (item.getSelected())
                selectedItems = true;
        });
        return selectedItems;
    };
    return Column;
}());
var Widget = (function () {
    /***
     * Widget for sorting items left and right.
     *
     * @param wrapper {string | HTMLElement} <p>Either pass widget html node ID or HTMLElement node. Wrapper node is used to create columns inside.</p>
     * @param args {Widget} <p>Widget options such as title and columns.</p>
     */
    function Widget(wrapper, args) {
        if (args === void 0) { args = null; }
        this.wrapper = (typeof wrapper === "string" ? document.getElementById(wrapper) : wrapper);
        this.title = args.title || null;
        this.columns = args.columns.map(function (obj) { return new Column(obj); }) || null;
        // Check if wrapper exists
        if (this.wrapper === null || typeof this.wrapper === "undefined")
            throw "Wrapper for class Widget not found.";
        // Check if more then one columns- else throw exception
        if (this.columns.length < 1)
            throw "Number of columns is invalid.";
        document.addEventListener("keydown", function (key) {
            if (key.key === "Control") {
                Widget.setSelectable(true);
            }
        });
        document.addEventListener("keyup", function () {
            Widget.setSelectable(false);
        });
        // Draw the columns
        this.drawColumns();
    }
    /***
     * Draw initial columns and set items and events
     */
    Widget.prototype.drawColumns = function () {
        var handle = this;
        // Append title;
        if (this.title !== null) {
            var titleNode = document.createElement("h1");
            var text = document.createTextNode(handle.title);
            titleNode.appendChild(text);
            handle.wrapper.appendChild(titleNode);
        }
        if (handle.columns !== null && handle.columns.length > 0) {
            Array.prototype.forEach.call(handle.columns, function (column, index) {
                var listWrapper = document.createElement("div");
                var list = document.createElement("ol");
                // Append title if set
                if (column.getTitle() !== null) {
                    var titleNode = document.createElement("h2");
                    var text = document.createTextNode(column.getTitle());
                    titleNode.appendChild(text);
                    listWrapper.appendChild(titleNode);
                }
                listWrapper.appendChild(list);
                handle.wrapper.appendChild(listWrapper);
                column.setList(list);
                // Create items inside list
                Array.prototype.forEach.call(column.items, function (item) {
                    var itemNode = document.createElement("li");
                    var text = document.createTextNode(item.getName());
                    itemNode.appendChild(text);
                    // Append alias if set;
                    if (item.getAlias() !== null) {
                        var aliasNode = document.createElement("span");
                        text = document.createTextNode(item.getAlias());
                        aliasNode.appendChild(text);
                        aliasNode.className = "alias";
                        itemNode.appendChild(aliasNode);
                    }
                    item.setNode(itemNode);
                    item.toggleSelectedClass();
                    // Add on click event to item - makes it selectable
                    itemNode.addEventListener("click", function () {
                        handle.addSelectionEventToItem(handle, item, column, listWrapper);
                    });
                    // Finally append newly created node to current list
                    column.addNodeToList(itemNode);
                });
                // Add button "Move to left" if possible
                if (typeof handle.columns[index - 1] !== "undefined") {
                    handle.initiateMoveButton(handle, listWrapper, column, handle.columns[index - 1], "<<");
                }
                // Add button "Move to right" if possible
                if (typeof handle.columns[index + 1] !== "undefined") {
                    handle.initiateMoveButton(handle, listWrapper, column, handle.columns[index + 1], ">>");
                }
            });
        }
        else
            throw "No columns set.";
    };
    ;
    Widget.prototype.initiateMoveButton = function (handle, listWrapper, currentColumn, nextColumn, sign) {
        var button = document.createElement("button");
        var text = document.createTextNode(sign);
        button.className = "action";
        button.appendChild(text);
        listWrapper.appendChild(button);
        if (!currentColumn.hasSelectedItems()) {
            button.setAttribute("disabled", "disabled");
        }
        button.addEventListener("click", function () {
            Array.prototype.forEach.call(currentColumn.items.slice(), function (itemToLeft) {
                if (itemToLeft.getSelected()) {
                    var clone = itemToLeft.getNode().cloneNode();
                    while (itemToLeft.getNode().firstChild) {
                        clone.appendChild(itemToLeft.getNode().lastChild);
                    }
                    nextColumn.addItem(itemToLeft);
                    nextColumn.addNodeToList(clone);
                    currentColumn.removeNodeFromList(itemToLeft.getNode());
                    currentColumn.removeItem(itemToLeft);
                    clone.addEventListener("click", function () {
                        handle.addSelectionEventToItem(handle, itemToLeft, nextColumn, nextColumn.getList().parentElement);
                    });
                    itemToLeft.setNode(clone);
                    itemToLeft.setSelected(false);
                    itemToLeft.toggleSelectedClass();
                }
            });
            // Handle disabling and enabling of buttons
            var buttons = handle.wrapper.getElementsByTagName("button");
            // Disable column buttons
            Array.prototype.forEach.call(buttons, function (btnItem) {
                btnItem.setAttribute("disabled", "disabled");
            });
        });
    };
    Widget.prototype.addSelectionEventToItem = function (handle, item, column, listWrapper) {
        if (Widget.getSelectable()) {
            item.setSelected(!item.getSelected());
            item.toggleSelectedClass();
            // Remove selected status from other items in other columns then the current one
            Array.prototype.forEach.call(handle.columns, function (col) {
                if (col !== column) {
                    Array.prototype.forEach.call(col.items, function (colItem) {
                        colItem.setSelected(false);
                        colItem.toggleSelectedClass();
                    });
                }
            });
            // Handle disabling and enabling of buttons
            var buttons = listWrapper.getElementsByTagName("button");
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
    };
    /***
     * Return item from one of the columns of the widget. If the item is not found return false.
     *
     * @param name {string} <p>Item name</p>
     * @returns {boolean | Item} <p>Return either found item or false if not found.</p>
     */
    Widget.prototype.getItem = function (name) {
        var foundItem = false;
        Array.prototype.forEach.call(this.columns, function (column) {
            var item;
            if (item = column.getItem(name))
                foundItem = item;
        });
        return foundItem;
    };
    ;
    /***
     * Gets the information in wich column the item is.
     *
     * @param name {string} <p>Item name</p>
     * @returns {boolean | string} <p>Return column name or false if not found.</p>
     */
    Widget.prototype.getItemPosition = function (name) {
        var columnName = false;
        Array.prototype.forEach.call(this.columns, function (column) {
            if (column.getItem(name))
                columnName = column.getTitle();
        });
        return columnName;
    };
    /***
     * When holding down CTRL - mark widget items as selectable.
     *
     * @param selectable {boolean} <p>Set TRUE or FALSE to selectable.</p>
     */
    Widget.setSelectable = function (selectable) {
        Widget.selectable = selectable;
    };
    /***
     * Get current selectable state.
     *
     * @returns {boolean} <p>Return TRUE if widget is selectable (user is holding down CTRL</p>
     */
    Widget.getSelectable = function () {
        return Widget.selectable;
    };
    return Widget;
}());
Widget.selectable = false;
