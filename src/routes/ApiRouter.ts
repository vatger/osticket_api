import {Request, Response, Router} from "express";
import {authorizationTokenMiddleware} from "../middleware/TokenMiddleware";
import UserController from "../controller/UserController";
import DepartmentController from "../controller/DepartmentController";

const apiRouter = Router();

apiRouter.use(authorizationTokenMiddleware);

apiRouter.post("/user/syncUserGroups", async (request: Request, response: Response) => {
    try {
        await UserController.syncUserGroups(request, response);
    } catch (e: any) {
        console.error(e.message);
        response.status(500).send({message: "Unknown Error"});
    }
});
apiRouter.get("/dept/getDepartments", async (request: Request, response: Response) => {
    try {
        await DepartmentController.getDepartments(request, response);
    } catch (e: any) {
        console.error(e.message);
        response.status(500).send({message: "Unknown Error"});
    }
});

export {
    apiRouter
}
