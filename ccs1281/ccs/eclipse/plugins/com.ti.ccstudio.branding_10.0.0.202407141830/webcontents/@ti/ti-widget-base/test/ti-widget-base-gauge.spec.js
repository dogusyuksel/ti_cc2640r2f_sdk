export function TIWidgetBaseGaugeTest(testFixture) {
    suite('ti-widget-base-range-value', () => {
        test('decimalPlaces property works', () => {
            const element = fixture(testFixture);
            assert.equal(element.decimalPlaces, 1);
            element.value = 1.232;
            assert.equal(element.displayValue, 1.2);
        });
        test('titleLabel property works', () => {
            const element = fixture(testFixture);
            assert.equal(element.titleLabel, '');
        });
        test('showWarning property works', () => {
            const element = fixture(testFixture);
            assert.equal(element.showWarning, false);
        });
    });
}
//# sourceMappingURL=ti-widget-base-gauge.spec.js.map