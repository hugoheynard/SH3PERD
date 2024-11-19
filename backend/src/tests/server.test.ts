
import { Express } from 'express';
import {startServer} from "../server";

jest.mock('express', () => {
    return jest.fn().mockImplementation(() => ({
        listen: jest.fn((port, callback) => {
            callback();
        }),
    }));
});

describe('startServer', () => {
    let app: Express;
    let listenSpy: jest.SpyInstance;

    beforeEach(() => {
        app = new (require('express'))();
        listenSpy = jest.spyOn(app, 'listen');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should start the server successfully', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();

        await startServer(app);

        expect(listenSpy).toHaveBeenCalledWith(
            expect.any(Number),
            expect.any(Function)
        );

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Server is running on port'));
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should log an error if the server fails to start', async () => {
        listenSpy.mockImplementationOnce((port: number, callback: () => void) => {
            throw new Error('Server start failed');
        });

        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();

        await startServer(app);


        expect(listenSpy).toHaveBeenCalledWith(
            expect.any(Number),
            expect.any(Function)
        );


        expect(errorSpy).toHaveBeenCalledWith('Error starting the server:', expect.any(Error));
        expect(logSpy).not.toHaveBeenCalled();
    });
});