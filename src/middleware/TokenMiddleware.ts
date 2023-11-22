import {NextFunction, Response, Request} from "express";
import {Config} from "../core/Config";

export async function authorizationTokenMiddleware(request: Request, response: Response, next: NextFunction)
{
    let token = request.headers?.authorization ?? "";

    const requestIP = request.socket.remoteAddress;

    if (!Config.IP_REGEX_MATCH.test(requestIP ?? "-1"))
    {
        response.status(401).send({message: "Unauthorized - Remote IP"});
        return;
    }

    // Remove the token subsection
    const token_arr = token.split(" ");
    if (token_arr.length < 2)
    {
        response.status(401).send({message: "Malformed token."});
        return;
    }
    token = token_arr[1];

    if (Config.APP_TOKEN != token)
    {
        response.status(401).send({message: "Unauthorized."});
        return;
    }

    next();
}