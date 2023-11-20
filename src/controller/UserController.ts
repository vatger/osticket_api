import {Request, Response} from "express";
import {sequelizeHost} from "../core/Sequelize";
import {QueryTypes} from "sequelize";

/**
 * Adds the badge with id badge_id to the user with id user_id
 * @param request
 * @param response
 */

async function syncUserGroups(request: Request, response: Response): Promise<void>{
    const requstData: {user_id: number; secondaryGroups: number[];} = request.body?.data;

    if ( requstData?.user_id == null )
    {
        response.status(500).send({error: "user_id empty"});
        return;
    }

    const sql_find_user: string = `SELECT * FROM ost_staff WHERE user_id=?`;
    const sql_find_groups: string = `SELECT FROM ost_staff_dept_access WHERE staff_id=?`;
    const sql_delete_roles: string = `DELETE FROM ost_staff_dept_access WHERE staff_id=?`;
    const sql_insert_roles: string = `INSERT INTO ost_staff_dept_access (staff_id, dept_id, role_id, flags) VALUES (?, ?, ?, ?)`;

    const data = await sequelizeHost.query(sql_find_user, {
        type: QueryTypes.SELECT,
        replacements: [requestData.user_id],
    });

    if (data.length == 0)
    {
        response.status(500).send({error: "user_id not exists"});
        return;
    }
}

/**
async function addBadgeToUser(request: Request, response: Response): Promise<void> {
    const requestData: {user_id: number; badge_id: number;} = request.body?.data;

    if (requestData?.user_id == null || requestData?.badge_id == null)
    {
        response.status(500).send({error: "user_id or badge_id are empty"});
        return;
    }

    const sql_find = `SELECT * FROM xf_cmtv_badges_user_badge WHERE user_id=? AND badge_id=?`;
    const sql_insert = `INSERT INTO xf_cmtv_badges_user_badge (user_id, badge_id, award_date, reason) VALUES (?, ?, UNIX_TIMESTAMP(), "")`;

    const data = await sequelizeHost.query(sql_find, {
        type: QueryTypes.SELECT,
        replacements: [requestData.user_id, requestData.badge_id],
    });

    if (data.length != 0)
    {
        response.status(400).send({message: "User already has this badge"});
        return;
    }

    await sequelizeHost.query(sql_insert, {
        type: QueryTypes.INSERT,
        replacements: [requestData.user_id, requestData.badge_id]
    });

    response.send({message: "OK"});
}


**/
export default {
    syncUserGroups,
}
