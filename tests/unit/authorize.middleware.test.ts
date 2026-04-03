import { NextFunction, Request, Response } from "express";
import { authorize } from "../../src/common/middleware/authorize";
import { UserRole } from "../../src/types/enums";

describe("authorize middleware", () => {
  it("allows permitted roles", () => {
    const req = {
      user: {
        id: "1",
        email: "analyst@test.com",
        name: "Analyst",
        role: UserRole.ANALYST,
        status: "active"
      }
    } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    authorize(UserRole.ANALYST, UserRole.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("blocks disallowed roles", () => {
    const req = {
      user: {
        id: "2",
        email: "viewer@test.com",
        name: "Viewer",
        role: UserRole.VIEWER,
        status: "active"
      }
    } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    authorize(UserRole.ANALYST, UserRole.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalled();
    const firstCallArg = (next as jest.Mock).mock.calls[0][0];
    expect(firstCallArg.message).toContain("Insufficient role permissions");
  });
});
