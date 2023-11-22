import { Request, Response} from "express";
import {sequelizeHost} from "../core/Sequelize";
import {QueryTypes} from "sequelize";

type OstDeptId = {
    dept_id: number
    name: string
}


/**
 * Adds the Departments and creates the user if necessary
 * @param request
 * @param response
 */

async function getDepartments(request: Request, response: Response): Promise<void>{

    const sql_get_depts: string = `SELECT id, name FROM ost_department`;

    const depts : OstDeptId[] = await sequelizeHost.query(sql_get_depts, {
        type: QueryTypes.SELECT,
    });

    if (depts.length != 0) {
        response.send({message: "OK",
            departments: depts
        });
    } else {
            response.status(500).send({error: "no departments read"});
            return;
    }

}

export default {
    getDepartments,
}
