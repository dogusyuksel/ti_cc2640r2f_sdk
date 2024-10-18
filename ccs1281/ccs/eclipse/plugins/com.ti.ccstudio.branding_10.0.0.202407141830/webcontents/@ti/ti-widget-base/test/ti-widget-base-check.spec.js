export function TIWidgetBaseCheckTest(testFixture) {
    suite('ti-widget-base-check', () => {
        test('clicking enabled element with default/checked label works', () => {
            const element = fixture(testFixture);
            const checkElement = element.getElement();
            return executeAndWait([
                checkElement.click.bind(checkElement),
                () => {
                    assert.equal(checkElement.textContent, 'checked');
                },
                checkElement.click.bind(checkElement),
                () => {
                    assert.equal(checkElement.textContent, 'default');
                }
            ]);
        });
    });
}
//# sourceMappingURL=ti-widget-base-check.spec.js.map