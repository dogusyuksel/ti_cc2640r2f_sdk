export function TIWidgetBaseSelectorTest(testFixture: string) {
    suite('ti-widget-base-selector', () => {
        test('selectedIndex property works', () => {
            const element = fixture(testFixture);

            for (let i = 0; i < element._options.length; i++) {
                element.selectedIndex = i;
                assert.equal(element.selectedText, element._options[element.selectedIndex].text);
                assert.equal(element.selectedValue, element._options[element.selectedIndex].value);
            }
        });

        test('selectedText property works', () => {
            const element = fixture(testFixture);

            for (let i = 0; i < element._options.length; i++) {
                element.selectedText = element._options[i].text;
                assert.equal(element.selectedIndex, i);
                assert.equal(element.selectedValue, element._options[element.selectedIndex].value);
            }
        });

        test('selectedValue property works', () => {
            const element = fixture(testFixture);

            for (let i = 0; i < element._options.length; i++) {
                element.selectedValue = element._options[i].value;
                assert.equal(element.selectedIndex, i);
                assert.equal(element.selectedText, element._options[element.selectedIndex].text);
            }
        });

        test('sorted property works', () => {
            const element = fixture(testFixture);
            element.labels = "f|a|e|b|d|c";
            element.values = "f|a|e|b|d|c";
            element.sorted = true;

            let expected = ['a', 'b', 'c', 'd', 'e', 'f'];
            for (let i = 0; i < element._options.length; i++) {
                assert.equal(element._options[i].text, expected[i]);
            }
        });

        test('sortNumerically property works', () => {
            const element = fixture(testFixture);
            element.labels = "5|0|4|1|3|2";
            element.values = "5|0|4|1|3|2";
            element.sortNumerically = true;
            element.sorted = true;

            for (let i = 0; i < element._options.length; i++) {
                assert.equal(element._options[i].text, i);
            }
        });
    });
}
