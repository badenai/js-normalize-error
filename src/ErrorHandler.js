/* global Response */
import isError from 'lodash/isError';

export default class ErrorHandler {
    constructor(isDebug = false, info) {
        this.isDebug = isDebug;
        this.info = info;
    }

    logError = (errorHandlerObject, info) => {
        let msg = 'logging error';
        if (info) msg += ` ${info}:\n`;
        else msg += `:\n`;
        Object.keys(errorHandlerObject).forEach(key => {
            if(key === 'headers') msg += `\t${key}: ${JSON.stringify(errorHandlerObject[key])}\n`;
            else msg += `\t${key}: ${errorHandlerObject[key]}\n`;
        });
        console.log(msg);
        return msg;
    };

    mapReadableError = errorHandlerObject =>
        errorHandlerObject.status
            ? {
                title: errorHandlerObject.title,
                status: errorHandlerObject.status,
                message: errorHandlerObject.message,
            }
            : {
                title: errorHandlerObject.title,
                message: errorHandlerObject.message,
            };

    getError = async error => {
        let errorHandlerObject = await this.handleError(error);
        if (!this.isDebug) {
            errorHandlerObject = this.mapReadableError(errorHandlerObject);
        }
        this.logError(errorHandlerObject, this.info);
        return errorHandlerObject;
    };

    mapJsError = error => ({
        title: error.name || typeof error,
        message: error.message || 'Unknown JS Error',
    });

    mapToObj = (map => {
        const obj = {};
        map.forEach((v, k) => { obj[k] = v });
        return obj;
    });

    getResponseObject = response => {
        let mappedResponse = {};
        Object.keys(response).forEach(key => {
            if (!key.startsWith('_')) mappedResponse[key] = response[key];
            if (key === 'headers') mappedResponse[key] = this.mapToObj(response[key]);
        })
        return mappedResponse;
    };

    mapJsonResponse = (response, json) => {
        const jsonResponse = this.getResponseObject(response);
        const mappedResponse = {
            ...jsonResponse,
            ...json,
            title: json.title || jsonResponse.statusText,
            status: jsonResponse.status,
            message: json.explanation,
        };
        return mappedResponse;
    };

    mapTextResponse = (response, text) => {
        const textResponse = this.getResponseObject(response);
        const mappedResponse = {
            ...textResponse,
            title: response.statusText || 'Response Error',
            status: textResponse.status,
            message: text,
        };
        return mappedResponse;
    };

    mapHtmlResponse = response => {
        const htmlResponse = this.getResponseObject(response);
        const mappedResponse = {
            ...htmlResponse,
            title: response.statusText || 'Response Error',
            status: htmlResponse.status,
            message: 'HTML can not be processed.',
        };
        return mappedResponse;
    };

    mapUnknownResponse = response => {
        const unknownResponse = this.getResponseObject(response);
        const mappedResponse = {
            ...unknownResponse,
            title: response.statusText || 'Unknown Response Error',
            status: unknownResponse.status,
            message: 'Something went wrong.',
        };
        return mappedResponse;
    };

    isJson = type => type.toLowerCase().includes('json');
    isText = type => type.toLowerCase().includes('plain');
    isHtml = type => type.toLowerCase().includes('html');

    handleError = async error => {
        if (isError(error)) {
            return this.mapJsError(error);
        } else if (error instanceof Response) {
            const response = error.clone();
            const contentType = response.headers.get('content-type');

            if (this.isJson(contentType)) {
                const json = await response.json();
                return this.mapJsonResponse(response, json);
            } else if (this.isText(contentType)) {
                const text = await response.text();
                return this.mapTextResponse(response, text);
            } else if (this.isHtml(contentType)) {
                return this.mapHtmlResponse(response);
            } else {
                return this.mapUnknownResponse(response);
            }
        } else {
            return {
                title: 'Unknown Error',
                message: 'Something went wrong.',
            };
        }
    };
}
