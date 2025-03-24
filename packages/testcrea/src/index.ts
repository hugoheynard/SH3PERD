// Entry point for @sh3pherd/testcrea

import type { Request, Response, NextFunction } from 'express';

export function testHandler(req: Request, res: Response, next: NextFunction): void {
    void req;
    void next;
    res.send('Hello from testcrea');
}