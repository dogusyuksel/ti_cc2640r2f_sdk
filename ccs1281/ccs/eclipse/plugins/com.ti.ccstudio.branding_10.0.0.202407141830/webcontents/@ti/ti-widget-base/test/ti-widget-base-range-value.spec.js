export function TIWidgetBaseRangeValueTest(testFixture) {
    suite('ti-widget-base-range-value', () => {
        test('minValue property works', () => {
            const element = fixture(testFixture);
            element.value = 0;
            element.minValue = 10;
            assert.equal(element.value, element.minValue);
        });
        test('maxValue property works', () => {
            const element = fixture(testFixture);
            element.value = 100;
            element.maxValue = 90;
            assert.equal(element.value, element.maxValue);
        });
    });
}
//# sourceMappingURL=ti-widget-base-range-value.spec.js.map