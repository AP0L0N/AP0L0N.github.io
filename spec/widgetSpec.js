
let widgetNode = document.createElement("div");
widgetNode.setAttribute("id", "widget");
document.body.appendChild(widgetNode);

describe("Initialize a widget", function() {

    let existingWrapper = document.getElementById("widget");
    let nonExistingWrapper = document.getElementById("something");

    let validArg = [
        {
            title: "Widget",
            columns: [
                {
                    title: "Column 1",
                    items: []
                },
                {
                    title: "Column 2",
                    items: []
                }
            ]
        },
        {
            columns: [
                {
                    title: "Column 1",
                    items: []
                },
                {
                    title: "Column 2",
                    items: []
                }
            ]
        },
        {
            columns: [
                {
                    title: "Column 1"
                },
                {
                    title: "Column 2"
                }
            ]
        },
        {
            columns: [
                {
                    title: "Column 1"
                },
                {
                    title: "Column 2"
                },
                {
                    title: "Column 3"
                }
            ]
        },
        {
            columns: [
                {
                    title: "Column 1"
                }
            ]
        }
    ];
    let invalidArgs = [];

    it("If wrapper is valid it should not throw no exception", function() {

        let initWidgetWithValidNodeId = function() {
            return new Widget("widget", validArg[0]);
        };

        let initWidgetWithValidNode = function() {
            return new Widget(existingWrapper, validArg[0]);
        };

        expect(initWidgetWithValidNodeId).not.toThrow();
        expect(initWidgetWithValidNode).not.toThrow();
    });

    it("If wrapper is not valid it should throw no exception", function() {

        let initWidgetWithInvalidNodeId = function() {
            return new Widget("something", validArg[0]);
        };

        let initWidgetWithInvalidNode = function() {
            return new Widget(nonExistingWrapper, validArg[0]);
        };

        expect(initWidgetWithInvalidNodeId).toThrow();
        expect(initWidgetWithInvalidNode).toThrow();
    });

    validArg.forEach((validArg) => {

        it("if valid args no exception should be thrown: "+JSON.stringify(validArg), function() {

            let initWidgetWithValidArgs = function() {
                return new Widget("widget", validArg);
            };

            expect(initWidgetWithValidArgs).not.toThrow();
        });
    });

    invalidArgs.forEach((invalidArg) => {

        it("if invalid args exception should be thrown: "+JSON.stringify(invalidArg), function() {

            let initWidgetWithInvalidArgs = function() {
                return new Widget("widget", invalidArg);
            };

            expect(initWidgetWithInvalidArgs).toThrow();
        });
    });

    it("Should re-draw columns", function() {

        let reDraw = () => {

            let widget = new Widget("widget", validArg[0]);

            widget.columns =  [
                {
                    items: [
                        {
                            name: "Item 1"
                        },
                        {
                            name: "Item 2"
                        }
                    ]
                },
                {
                    items: [
                        {
                            name: "Item 3"
                        }
                    ]
                }
            ];

            return widget.drawWidget();
        };

        expect(reDraw).not.toThrow();

    });
});

describe("Find an existing item by name or alias", function() {

    let widget = new Widget("widget", {
        columns: [
            {
                title: "Column A",
                items: [
                    {
                        name: "Item A",
                        alias: "superItem"
                    },
                    {
                        name: "Item B",
                        alias: "superItem"
                    },
                ]
            },
            {
                title: "Column B",
                items: [
                    {
                        name: "Item C"
                    },
                    {
                        name: "Item D"
                    },
                ]
            }
        ]
    });

    it("Should return an item found by the name", function() {

        let item = widget.getItem("Item C");

        expect(item.name).toEqual("Item C");
    });

    it("Should return an item found by an alias", function() {

        let item = widget.getItem("superItem");

        expect(item.name).toEqual("Item B");
    });

});

describe("Return item position (column name) by name or alias", function() {

    let widget = new Widget("widget", {
        columns: [
            {
                title: "Column A",
                items: [
                    {
                        name: "Item A"
                    },
                    {
                        name: "Item B",
                        alias: "superItem"
                    },
                ]
            },
            {
                title: "Column B",
                items: [
                    {
                        name: "Item C"
                    },
                    {
                        name: "Item D"
                    },
                ]
            }
        ]
    });

    it("Should return an item position found by the name", function() {

        let columnName = widget.getItemPosition("Item A");

        expect(columnName).toEqual("Column A");
    });

    it("Should return an item position found by an alias", function() {

        let columnName = widget.getItemPosition("Item D");

        expect(columnName).toEqual("Column B");
    });


});

