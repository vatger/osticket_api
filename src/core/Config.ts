import dotenv from "dotenv";
import path from "path";
import {Dialect, Options} from "sequelize";
import Logger, {LogLevels} from "../utility/Logger";

const fp = __dirname + "/../../.env";

dotenv.config({path: path.resolve(fp)});

console.log(`Loading .env from ${fp}`);

// Validate required environment variables are present before continuing
const required_env: Array<string> =
    [
        "APP_PORT", "APP_TOKEN",
        "DB_HOST_DIALECT", "DB_HOST_HOST", "DB_HOST_PORT", "DB_HOST_DATABASE_NAME", "DB_HOST_USERNAME", "DB_HOST_PASSWORD",
        "DEFAULT_DEPT_ID"
    ];

let env_missing: boolean = false;
required_env.forEach((key) => {
    if (process.env[key] == null)
    {
        Logger.log(LogLevels.LOG_ERROR, `Missing the following .env key [${key}].`)
        env_missing = true;
    }
});
if (env_missing) process.exit(-1);

Logger.log(LogLevels.LOG_SUCCESS, `.env contains all required keys.`)

// If all environment variables are present, we can continue to create the config!
export const Config =
    {
        APP_DEBUG: process.env.APP_DEBUG?.toLowerCase() == 'true',
        APP_LOG_SQL: process.env.APP_LOG_SQL?.toLowerCase() == 'true',
        APP_TOKEN: process.env.APP_TOKEN,

        IP_REGEX_MATCH: new RegExp(process.env.IP_REGEX_MATCH ?? "/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/"),

        DATABASE_CONFIG_HOST: {
            DIALECT: process.env.DB_HOST_DIALECT as Dialect,
            USERNAME: process.env.DB_HOST_USERNAME,
            PASSWORD: process.env.DB_HOST_PASSWORD,
            DATABASE_NAME: process.env.DB_HOST_DATABASE_NAME,
            HOST: process.env.DB_HOST_HOST,
            PORT: Number(process.env.DB_HOST_PORT),
        },

        APP_PORT: Number(process.env.APP_PORT),
        DEFAULT_DEPT_ID: Number(process.env.DEFAULT_DEPT_ID)
    }

export const SequelizeConfigHost: Options =
{
    dialect: Config.DATABASE_CONFIG_HOST.DIALECT,
    username: Config.DATABASE_CONFIG_HOST.USERNAME,
    password: Config.DATABASE_CONFIG_HOST.PASSWORD,
    database: Config.DATABASE_CONFIG_HOST.DATABASE_NAME,
    host: Config.DATABASE_CONFIG_HOST.HOST,
    port: Config.DATABASE_CONFIG_HOST.PORT,

    // Define custom logging function for SQL queries
    logging: (message) => {
        if (!Config.APP_LOG_SQL) return;
        Logger.log(LogLevels.LOG_WARN, message, false, "SQL - HOST")
    }
}