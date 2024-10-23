import {PageContext} from "../PageContext.js";


describe('PageContext', () => {
    let pageContext;

    beforeEach(() => {
        pageContext = new PageContext();
    });

    test('should initialize with a rendered div element with class "appElements"', () => {
        expect(pageContext.html.tagName).toBe('DIV');
        expect(pageContext.html.id).toBe('appElements');
    });

    test('should clear the previous page content when undisplayPreviousPage is called', () => {
        pageContext.html.innerHTML = '<p>Previous content</p>';
        pageContext.undisplayPreviousPage();

        expect(pageContext.html.innerHTML).toBe('');
    });

    test('should replace content in setPage with new functionality page', async () => {
        const mockNewPage = document.createElement('div');
        mockNewPage.textContent = 'New Page';
        const newFunctionalityPage = Promise.resolve(mockNewPage);

        await pageContext.setPage(newFunctionalityPage);

        expect(pageContext.html.innerHTML).toBe('<div>New Page</div>');
    });

    test('should clear previous content before appending new page in setPage', async () => {
        const mockNewPage = document.createElement('div');
        mockNewPage.textContent = 'New Page';
        const newFunctionalityPage = Promise.resolve(mockNewPage);

        pageContext.html.innerHTML = '<p>Old Page</p>';

        await pageContext.setPage(newFunctionalityPage);

        expect(pageContext.html.innerHTML).toBe('<div>New Page</div>');
    });
});