import {Request, Response, Router} from "express";
import {authorizationTokenMiddleware} from "../middleware/TokenMiddleware";
import BadgeController from "../controller/UserController";

const apiRouter = Router();

apiRouter.use(authorizationTokenMiddleware);

apiRouter.post("/user/syncUserGroups", async (request: Request, response: Response) => {
    try {
        await BadgeController.syncUserGroups(request, response);
    } catch (e: any) {
        console.error(e.message);
        response.status(500).send({message: "Unknown Error"});
    }
});

export {
    apiRouter
}
