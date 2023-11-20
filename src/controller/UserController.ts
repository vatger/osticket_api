import { Request, Response} from "express";
import {sequelizeHost} from "../core/Sequelize";
import {QueryTypes} from "sequelize";

type OstStaffId = {
    staff_id: number
}

type OstDeptId = {
    dept_id: number
}

type RequestData = {
    user_id: number
    dept_ids: number[]
    firstname:string
    lastname:string
    email:string
}

/**
 * Adds the Departments and creates the user if necessary
 * @param request
 * @param response
 */

async function syncUserGroups(request: Request, response: Response): Promise<void>{

    let userCreated = false;
    const requestData: RequestData = request.body;

    if ( requestData?.user_id == null )
    {
        response.status(500).send({error: "user_id empty"});
        return;
    }

    const sql_find_user: string = `SELECT * FROM ost_staff WHERE username=?`;
    const sql_find_groups: string = `SELECT dept_id FROM ost_staff_dept_access WHERE staff_id=?`;
    const sql_delete_roles: string = `DELETE FROM ost_staff_dept_access WHERE staff_id=? and dept_id=?`;
    const sql_insert_roles: string = `INSERT INTO ost_staff_dept_access (staff_id, dept_id, role_id, flags) VALUES (?, ?, ?, ?)`;

    const data : OstStaffId[] = await sequelizeHost.query(sql_find_user, {
        type: QueryTypes.SELECT,
        replacements: [requestData.user_id],
    });
    let StaffId: number;

    if (data.length != 0) {
        StaffId = data[0].staff_id;
    } else {
        StaffId = await createUser(requestData);
        if (StaffId == 0) {
            response.status(500).send({error: "user could not be created"});
            return;
        } else {
            userCreated = true;
        }
    }

    const DBCurrentGroups : OstDeptId[] = await sequelizeHost.query(sql_find_groups, {
        type: QueryTypes.SELECT,
        replacements: [StaffId],
    });
    const CurrentGroups = DBCurrentGroups.map(d=>d.dept_id);
    const NewGroups = requestData.dept_ids;

    const GroupsAdd = NewGroups.filter(x => !CurrentGroups.includes(x));
    const GroupsDel = CurrentGroups.filter(x => !NewGroups.includes(x));

    for (const dept_id of GroupsDel) {
        await sequelizeHost.query(sql_delete_roles, {
            type: QueryTypes.DELETE,
            replacements: [StaffId, dept_id,1,1]
        });
    }

    for (const dept_id of GroupsAdd) {
        await sequelizeHost.query(sql_insert_roles, {
            type: QueryTypes.INSERT,
            replacements: [StaffId, dept_id,1,1]
        });
    }

    response.send({message: "OK",
                         usercreated: userCreated });
}

async function createUser(Request : RequestData): Promise<number>{

    type StaffId={
        staff_id: number
    }

    const sql_insert_user: string = `INSERT INTO ost_staff (dept_id, role_id, username, firstname, lastname,email, phone, mobile, signature, created, updated ) 
                                                    VALUES ("1","1",?,?,?,?,"","","",NOW(),NOW())`;


    const sql_find_user: string = `SELECT staff_id FROM ost_staff WHERE username=?`;


    await sequelizeHost.query(sql_insert_user, {
        type: QueryTypes.INSERT,
        replacements: [Request.user_id, Request.firstname, Request.lastname, Request.email]
    });

    const StaffId: StaffId[] = await sequelizeHost.query(sql_find_user, {
        type: QueryTypes.SELECT,
        replacements: [Request.user_id],
    });

    if (StaffId.length != 0) {
        return StaffId[0].staff_id;
    }else{
        return 0;
    }
}
export default {
    syncUserGroups,
}
