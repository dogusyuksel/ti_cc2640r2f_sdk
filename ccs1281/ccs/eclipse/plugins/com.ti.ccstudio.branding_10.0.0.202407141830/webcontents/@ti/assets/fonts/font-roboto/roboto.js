const style = document.createElement('style');
style.innerHTML = `
    @font-face {
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 300;
        src: local('Roboto Light'), local('Roboto-Light'), url(components/assets/fonts/font-roboto/Roboto_300_normal.woff) format('woff');
    }
    @font-face {
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 400;
        src: local('Roboto'), local('Roboto-Regular'), url(components/assets/fonts/font-roboto/Roboto_400_normal.woff) format('woff');
    }
    @font-face {
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 500;
        src: local('Roboto Medium'), local('Roboto-Medium'), url(components/assets/fonts/font-roboto/Roboto_500_normal.woff) format('woff');
    }
    @font-face {
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 700;
        src: local('Roboto Bold'), local('Roboto-Bold'), url(components/assets/fonts/font-roboto/Roboto_700_normal.woff) format('woff');
    }
    @font-face {
        font-family: 'Roboto';
        font-style: italic;
        font-weight: 300;
        src: local('Roboto Light Italic'), local('Roboto-LightItalic'), url(components/assets/fonts/font-roboto/Roboto_300_italic.woff) format('woff');
    }
    @font-face {
        font-family: 'Roboto';
        font-style: italic;
        font-weight: 400;
        src: local('Roboto Italic'), local('Roboto-Italic'), url(components/assets/fonts/font-roboto/Roboto_400_italic.woff) format('woff');
    }
    @font-face {
        font-family: 'Roboto';
        font-style: italic;
        font-weight: 500;
        src: local('Roboto Medium Italic'), local('Roboto-MediumItalic'), url(components/assets/fonts/font-roboto/Roboto_500_italic.woff) format('woff');
    }
    @font-face {
        font-family: 'Roboto';
        font-style: italic;
        font-weight: 700;
        src: local('Roboto Bold Italic'), local('Roboto-BoldItalic'), url(components/assets/fonts/font-roboto/Roboto_700_italic.woff) format('woff');
    }
`;
document.head.appendChild(style);
