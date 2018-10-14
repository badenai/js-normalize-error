/* global Response, Headers*/
require('isomorphic-fetch');

import ErrorHandler from '../ErrorHandler';

const ResponseWrapper = (body, status, contentType) =>
    new Response(body, {
        status: status,
        headers: new Headers({ 'content-type': contentType }),
        url: 'https://somerandomurl.com',
    });

describe('ErrorHandler --- Method tests', () => {
    let errorHandler;
    beforeEach(() => {
        errorHandler = new ErrorHandler();
    });

    it('> map JSON Response', async () => {
        const response = ResponseWrapper(
            JSON.stringify({
                explanation: 'some error occurred',
                title: 'errorTitle',
            }),
            404,
            'application/json'
        );
        return expect(
            errorHandler.mapJsonResponse(response, await response.json())
        ).resolves.toMatchSnapshot();
    });
});

describe('ErrorHandler --- Get Readable Error Object', () => {
    let errorHandler;
    beforeEach(() => {
        errorHandler = new ErrorHandler(true);
    });

    it('> create instance', () => {
        expect(errorHandler).toBeDefined();
    });
    it('> json response', async () => {
        const response = ResponseWrapper(
            JSON.stringify({
                explanation: 'some error occurred',
                title: 'errorTitle',
            }),
            404,
            'application/json'
        );
        return expect(
            errorHandler.getError(response)
        ).resolves.toMatchSnapshot();
    });
    it('> text response', async () => {
        const response = ResponseWrapper(
            'some error occurred',
            404,
            'text/plain'
        );
        return expect(
            errorHandler.getError(response)
        ).resolves.toMatchSnapshot();
    });
    it('> html response', async () => {
        const response = ResponseWrapper(
            '<html><body></body></html>',
            404,
            'text/html'
        );
        return expect(
            errorHandler.getError(response)
        ).resolves.toMatchSnapshot();
    });
    it('> unknown response', async () => {
        const response = ResponseWrapper('', 404, 'test');
        return expect(
            errorHandler.getError(response)
        ).resolves.toMatchSnapshot();
    });
    it('> Type Error', async () => {
        const error = new TypeError('This is a type error');
        return expect(errorHandler.getError(error)).resolves.toMatchSnapshot();
    });
    it('> Error', async () => {
        const error = new Error('This is a error');
        return expect(errorHandler.getError(error)).resolves.toMatchSnapshot();
    });
    it('> unknown Error', async () => {
        const error = {};
        return expect(errorHandler.getError(error)).resolves.toMatchSnapshot();
    });
    it('> undefined', async () => {
        const error = undefined;
        return expect(errorHandler.getError(error)).resolves.toMatchSnapshot();
    });
});
