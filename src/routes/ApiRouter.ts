import {Request, Response, Router} from "express";
import {authorizationTokenMiddleware} from "../middleware/TokenMiddleware";
import BadgeController from "../controller/BadgeController";

const apiRouter = Router();

apiRouter.use(authorizationTokenMiddleware);

apiRouter.post("/badge/add", async (request: Request, response: Response) => {
    try {
        await BadgeController.addBadgeToUser(request, response);
    } catch (e: any) {
        response.status(500).send({message: "Unknown Error"});
    }
});

apiRouter.post("/badge/remove", async (request: Request, response: Response) => {
    try {
        await BadgeController.removeBadgeFromUser(request, response);
    } catch (e) {
        response.status(500).send({message: "Unknown Error"});
    }
})

export {
    apiRouter
}