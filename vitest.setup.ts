// The site picks its language from the browser when the visitor hasn't chosen
// one (LanguageContext). jsdom reports en-US, and the component tests are
// written against the Portuguese copy, so pin the browser to pt-BR.
Object.defineProperty(window.navigator, 'languages', { value: ['pt-BR', 'pt'], configurable: true });
Object.defineProperty(window.navigator, 'language', { value: 'pt-BR', configurable: true });
