import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { userRouter } from "../modules/users/user.routes";
import { financialRouter } from "../modules/financial/financial.routes";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "API healthy" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/financial-records", financialRouter);
apiRouter.use("/dashboard", dashboardRouter);
