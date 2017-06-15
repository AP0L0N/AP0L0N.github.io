
describe("Initialize a widget", function() {


    it("If wrapper is valid it should not throw no exception", function() {

        expect(new Widget("widget")).not.toThrow();

        let existingWrapper = document.getElementById("widget");

        expect(new Widget(existingWrapper)).toThrow();
    });

    it("else if the wrapper is valid it should not throw an exception", function() {

        expect(new Widget("something")).toThrow();

        let nonExistingWrapper = document.getElementById("something");

        expect(new Widget(nonExistingWrapper)).toThrow();
    });
});


