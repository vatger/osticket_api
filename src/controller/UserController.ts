import { Request, Response} from "express";
import {sequelizeHost} from "../core/Sequelize";
import {QueryTypes} from "sequelize";
import {Config} from "../core/Config";
import {sql} from "../utility/SQLStatements";

type RequestData = {
    user_id: string
    dept_ids: number[]
    firstname:string
    lastname:string
    email:string
}

type User = {
    username: string
    staff_id: number
    isactive: number
    pwd: string
    iscreated?: boolean
}

type OstDeptId = {
    dept_id: number
}

function send_success_response(response: Response, user: User) {
    response.send({
        message: "OK",
        usercreated: user.iscreated ?? false,
        password: user.pwd
    });
}

/**
 * Adds the Departments and creates the user if necessary
 * @param request
 * @param response
 */

async function syncUserGroups(request: Request, response: Response): Promise<void>{

    let user: User = {  username: "",
                        isactive: 0,
                        pwd: "",
                        iscreated: false,
                        staff_id: 0};

    const requestData: RequestData = request.body;

    // no user id in request
    if ( requestData?.user_id == null || requestData?.user_id == ""  )
    {
        response.status(500).send({error: "user_id empty"});
        return;
    }

    // find user in osticket table
    const users: User[] = await sequelizeHost.query(sql.find_user, {
        type: QueryTypes.SELECT,
        replacements: ["v".concat(requestData.user_id)],
    });

    if (users.length != 0) {
        // user found => assign
        user = users[0];

    } else {

        if (requestData.dept_ids.length != 0) {
            // depts assigned => create user
            user = await createUser(requestData);
            console.log(user);
            if (user.staff_id == 0) {
                // user could not be created
                response.status(500).send({error: "user could not be created"});
                return;
            } else {
                user.iscreated = true;
            }
        }else{
            // no depts assigned => return
            response.status(200).send({error: "Empty Groups - no user created"});
            return ;
        }
    }

    // User is inactive and groups assigned => activate user
    if( user.isactive == 0 && requestData.dept_ids.length != 0)
    {
        await sequelizeHost.query(sql.switch_active, {
            type: QueryTypes.UPDATE,
            replacements: [1, user.staff_id]});
    }
    // User is active and no groups assigned => inactivate user
    if(  requestData.dept_ids.length == 0)
    {
        if ( user.isactive == 1 ) {
            await sequelizeHost.query(sql.switch_active, {
                type: QueryTypes.UPDATE,
                replacements: [0, user.staff_id]
            });

            send_success_response(response, user);
            return;
        } else {
            send_success_response(response, user);
            return;
        }
    }

    // select current department assignments
    const DBCurrentGroups : OstDeptId[] = await sequelizeHost.query(sql.find_groups, {
        type: QueryTypes.SELECT,
        replacements: [user.staff_id],
    });

    // intersect currently assigned with new assigned depts
    const CurrentGroups = DBCurrentGroups.map(d=>d.dept_id);
    const NewGroups = requestData.dept_ids;
    const GroupsAdd = NewGroups.filter(x => !CurrentGroups.includes(x));
    const GroupsDel = CurrentGroups.filter(x => !NewGroups.includes(x));

    // delete groups
    for (const dept_id of GroupsDel) {
        await sequelizeHost.query(sql.delete_roles, {
            type: QueryTypes.DELETE,
            replacements: [user.staff_id, dept_id,1,1]
        });
    }

    // insert groups
    for (const dept_id of GroupsAdd) {
        await sequelizeHost.query(sql.insert_roles, {
            type: QueryTypes.INSERT,
            replacements: [user.staff_id, dept_id,1,1]
        });
    }
    send_success_response(response, user);
}

async function createUser(Request : RequestData): Promise<User> {

    // gen init pwd
    let crypto = require("crypto");
    let pwd = crypto.randomBytes(10).toString('hex');
    let permissions = "{\"user.create\":1,\"user.dir\":1,\"faq.manage\":1,\"visibility.departments\":1}";

    // insert user into osticket table
    await sequelizeHost.query(sql.create_user, {
        type: QueryTypes.INSERT,
        replacements: [Config.DEFAULT_DEPT_ID, "v".concat(Request.user_id), Request.firstname, Request.lastname, Request.email, pwd, permissions]
    });

    // check if user creation successful and get additional fields
    const users: User[] = await sequelizeHost.query(sql.find_user, {
        type: QueryTypes.SELECT,
        replacements: ["v".concat(Request.user_id)],
    });

    if (users.length != 0) {
        let user: User = users[0];
        user.iscreated = true;
        user.pwd = pwd;
        return user;
    }
    return { staff_id: 0, username: "", iscreated: false, isactive: 0, pwd: "" };
}
export default {
    syncUserGroups,
}
