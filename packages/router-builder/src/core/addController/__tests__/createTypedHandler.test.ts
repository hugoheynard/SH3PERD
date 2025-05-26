import type { Request, Response, NextFunction } from "express";
import {createTypedHandler} from "../createTypedHandler";
import { jest } from "@jest/globals";

describe("createTypedHandler", () => {
    const mockReq = (data: Partial<Request>) => data as Request;
    const mockRes = () => {
        const res = {} as Partial<Response>;
        res.status = jest.fn().mockReturnValue(res) as unknown as Response["status"];
        res.json = jest.fn().mockReturnValue(res) as unknown as Response["json"];
        return res as Response;
    };

    it("calls fn with primitive input", async () => {
        const fn = jest.fn(async (id: string) => "ok");
        const handler = createTypedHandler<typeof fn>(200, {
            fn,
            inputMapper: (req) => req.params.id,
        });

        const req = mockReq({ params: { id: "123" } });
        const res = mockRes();
        const mockNext = jest.fn();

        await handler(req, res, mockNext);

        expect(fn).toHaveBeenCalledWith("123");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith("ok");
    });

    it("calls fn with multiple inputs", async () => {
        const fn = jest.fn(async (id: string, page: number) => [`${id}-page-${page}`]);
        const handler = createTypedHandler<typeof fn>(200, {
            fn,
            inputMapper: (req) => [req.params.id, Number(req.query.page)],
        });

        const req = mockReq({ params: { id: "abc" }, query: { page: "2" } });
        const res = mockRes();
        const mockNext = jest.fn();

        await handler(req, res, mockNext);

        expect(fn).toHaveBeenCalledWith("abc", 2);
        expect(res.json).toHaveBeenCalledWith(["abc-page-2"]);
    });

    it("calls fn with object input", async () => {
        const fn = jest.fn(async ({ name }: { name: string }) => ({ greeting: `Hello, ${name}` }));
        const handler = createTypedHandler<typeof fn>(200, {
            fn,
            inputMapper: (req) => ({ name: req.body.name }),
        });

        const req = mockReq({ body: { name: "Alice" } });
        const res = mockRes();
        const mockNext = jest.fn();

        await handler(req, res, mockNext);

        expect(fn).toHaveBeenCalledWith({ name: "Alice" });
        expect(res.json).toHaveBeenCalledWith({ greeting: "Hello, Alice" });
    });

    it("calls onSuccess when provided", async () => {
        const fn = jest.fn(async () => "ok");
        const onSuccess = jest.fn();
        const handler = createTypedHandler<typeof fn>(201, {
            fn,
            inputMapper: () => [],
            onSuccess,
        });

        const req = mockReq({});
        const res = mockRes();
        const mockNext = jest.fn();

        await handler(req, res, mockNext);

        expect(onSuccess).toHaveBeenCalledWith(res, "ok");
        expect(res.status).not.toHaveBeenCalled();
    });

    it("calls next on success if nextOnSuccess is true", async () => {
        const fn = jest.fn(async () => "done");
        const handler = createTypedHandler<typeof fn>(200, {
            fn,
            inputMapper: () => [],
            nextOnSuccess: true,
        });

        const req = mockReq({});
        const res = mockRes();
        const mockNext = jest.fn();

        await handler(req, res, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    it("calls next(err) on error if nextOnError is true", async () => {
        const fn = jest.fn(async () => {
            throw new Error("fail");
        });
        const handler = createTypedHandler<typeof fn>(200, {
            fn,
            inputMapper: () => [],
            nextOnError: true,
        });

        const req = mockReq({});
        const res = mockRes();
        const mockNext = jest.fn();

        await handler(req, res, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("throws on error if nextOnError is false", async () => {
        const fn = jest.fn(async () => {
            throw new Error("fail");
        });
        const handler = createTypedHandler<typeof fn>(200, {
            fn,
            inputMapper: () => [],
            nextOnError: false,
        });

        const req = mockReq({});
        const res = mockRes();
        const mockNext = jest.fn();

        await expect(() => handler(req, res, mockNext)).rejects.toThrow("fail");
    });
});
