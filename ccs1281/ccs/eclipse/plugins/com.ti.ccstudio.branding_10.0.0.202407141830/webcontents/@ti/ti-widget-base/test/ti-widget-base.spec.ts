export function TIWidgetBaseTest(testFixture: string, pathFromElemToText: string | undefined) {
    suite('ti-widget-base', () => {
        const textClass: string = '.text-element-style';
        let textElement: any;
        let element: any;
        if (!pathFromElemToText) { // use default path to text element
            pathFromElemToText = 'element.shadowRoot.querySelector(textClass)'
        }
        setup((done) => {
            // setup callback is called before each test()
            element = fixture(testFixture);
            textElement = null;

            // attempt to find the inner text element
            try {
                textElement = eval(pathFromElemToText as string);
            } catch (e) { }

            if (textElement) done();
            else {
                // wait for dom-change event before trying to find the text element again
                let ready = false;
                element.addEventListener('dom-change', () => {
                    if (!ready) {
                        textElement = eval(pathFromElemToText as string);
                        if (textElement) {
                            ready = true;
                            done();
                        }
                    }
                });
            }

        });

        test('text-align css var works', () => {
            element.style.setProperty('--ti-widget-text-align', 'right');
            let computedStyles: any = window.getComputedStyle(textElement);
            assert.equal(computedStyles['text-align'], 'right');
        });

        test('text-decoration css var works', () => {
            const underline: string = 'underline dotted rgb(255, 0, 0)';

            element.style.setProperty('--ti-widget-text-decoration', underline);
            let computedStyles: any = window.getComputedStyle(textElement);
            assert.equal(computedStyles['text-decoration'], underline);
        });

        test('font-weight css var works', () => {
            const bold: string = '700';

            element.style.setProperty('--ti-widget-font-weight', bold);
            let computedStyles: any = window.getComputedStyle(textElement);
            assert.equal(computedStyles['font-weight'], bold);
        });

        test('font-style css var works', () => {
            element.style.setProperty('--ti-widget-font-style', 'italic');
            let computedStyles: any = window.getComputedStyle(textElement);
            assert.equal(computedStyles['font-style'], 'italic');
        });

        test('font-size css var works', () => {
            const large: string = '18px'

            element.style.setProperty('--ti-widget-font-size', large);
            let computedStyles: any = window.getComputedStyle(textElement);
            assert.equal(computedStyles['font-size'], large);
        });

        test('color css var works', () => {
            const red: string = 'rgb(255, 0, 0)';

            element.style.setProperty('--ti-widget-color', red);
            let computedStyles: any = window.getComputedStyle(textElement);
            assert.equal(computedStyles['color'], red);
        });

        test('white-space css var works', () => {
            element.style.setProperty('--ti-widget-white-space', 'normal');
            let computedStyles: any = window.getComputedStyle(textElement);
            assert.equal(computedStyles['white-space'], 'normal');
        });
    });
}
