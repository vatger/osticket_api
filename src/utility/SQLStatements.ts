
const sql_find_user: string = `SELECT *
                               FROM ost_staff
                               WHERE username = ?`;
const sql_find_groups: string = `SELECT dept_id
                                 FROM ost_staff_dept_access
                                 WHERE staff_id = ?`;
const sql_delete_roles: string = `DELETE
                                  FROM ost_staff_dept_access
                                  WHERE staff_id = ?
                                    and dept_id = ?`;
const sql_insert_roles: string = `INSERT INTO ost_staff_dept_access (staff_id, dept_id, role_id, flags)
                                  VALUES (?, ?, ?, ?)`;

const sql_create_user: string = `INSERT INTO ost_staff (dept_id, role_id, username, firstname, lastname,email, phone, mobile, signature, created, updated, passwd, change_passwd, permissions) 
                                                    VALUES (?,"1",?,?,?,?,"","","",NOW(),NOW(),md5(?),"1",?)`;

const sql_user_switch_active: string = `UPDATE ost_staff SET isactive = ? WHERE staff_id = ?`;

const sql = {find_user : sql_find_user,
                                        find_groups: sql_find_groups,
                                        delete_roles: sql_delete_roles,
                                        insert_roles: sql_insert_roles,
                                        create_user: sql_create_user,
                                        switch_active: sql_user_switch_active}

export  {
    sql
}