/**
 * Anonymize AppBuilder data
 * 
 * $ npm install digi-serve/ab-data-anonymizer
 * 
 * import anonymize from "ab-data-anonymizer"
 * await anonymize(dbInfo, tables);
 */

import crypto from "crypto";
import child_process from "child_process";
import mysql from "promise-mysql";
import randomName from "node-random-name";
import ora from "ora";
import { LoremIpsum } from "lorem-ipsum";


// Wrapper for child_process.exec()
function exec(command) {
    return new Promise((resolve, reject) => {
        child_process.exec(command, (err, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) {
                // Suppress this one specific warning message.
                if (!stderr.match(/Using a password on the command line interface can be insecure.\s*$/)) {
                    console.error(stderr);
                }
            }
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}


/**
 * @param {object} dbInfo
 *     {
 *         source: {
 *             host: <string>, 
 *             port: <integer>, 
 *             user: <string>, 
 *             password: <string>, 
 *             name: <string>,
 *         },
 *         source: {
 *             host: <string>, 
 *             port: <integer>, 
 *             user: <string>, 
 *             password: <string>, 
 *             name: <string>,
 *         }
 *     }
 * @param {object} tables
 *     Details of the tables to anonymize.
 *     See `./data/tables.js`.
 * @param {integer} ROW_LIMIT
 *     Can limit the max number of rows per table to export.
 *     Default is 0, meaning no limit.
 */
export default async function anonymize(dbInfo, tables, ROW_LIMIT=0) {
    const sourceDbName = dbInfo.source.name;
    const sourceDbHost = dbInfo.source.host;
    const sourceDbUser = dbInfo.source.user;
    const sourceDbPassword = dbInfo.source.password;
    const sourceDbPort = dbInfo.source.port;

    const targetDbName = dbInfo.target.name;
    const targetDbHost = dbInfo.target.host;
    const targetDbUser = dbInfo.target.user;
    const targetDbPassword = dbInfo.target.password;
    const targetDbPort = dbInfo.target.port;

    const lorem = new LoremIpsum();
    const db = await mysql.createConnection({
        host: targetDbHost,
        port: targetDbPort,
        user: targetDbUser,
        password: targetDbPassword
    });
    let spinner;

    // Source DB password will be passed to mysqldump using the "-p" option.
    // Target DB password will be passed to mysql using environment variable.
    process.env.MYSQL_PWD = targetDbPassword;

    // Create anon DB
    await db.query(`CREATE DATABASE IF NOT EXISTS ??`, [targetDbName]);

    // Clone DB structure
    spinner = ora(`Cloning DB structure to ${targetDbName}`).start();
    await exec(
        `mysqldump -u"${sourceDbUser}" -h"${sourceDbHost}" -P${sourceDbPort}`
        + ` -p"${sourceDbPassword}"`
        + ` --column-statistics=0 --no-data "${sourceDbName}"`
        + ` SITE_PROCESS_INSTANCE SITE_PROCESS_INSTANCE_temp SITE_ROWLOG`
        + ` | mysql -u"${targetDbUser}" -h"${targetDbHost}" -P${targetDbPort} "${targetDbName}"`
    );
    spinner.succeed();

    // Clone data (excluding gigantic tables)
    spinner = ora(`Cloning data from ${sourceDbName} to ${targetDbName}`).start();
    let rowLimit = "";
    if (ROW_LIMIT > 0 && ROW_LIMIT < Infinity) {
        rowLimit = ` --where="1 LIMIT ${ROW_LIMIT}"`;
    }
    await exec(
        `mysqldump -u"${sourceDbUser}" -h"${sourceDbHost}" -P${sourceDbPort}`
        + ` -p"${sourceDbPassword}"`
        + ` --ignore-table "${sourceDbName}.SITE_PROCESS_INSTANCE"`
        + ` --ignore-table "${sourceDbName}.SITE_PROCESS_INSTANCE_temp"`
        + ` --ignore-table "${sourceDbName}.SITE_ROWLOG"`
        + ` --column-statistics=0`
        + ` "${sourceDbName}"`
        + rowLimit
        + ` | mysql -u"${targetDbUser}" -h"${targetDbHost}" -P${targetDbPort} "${targetDbName}"`
    );
    await db.query(`USE ??`, [targetDbName]);
    spinner.succeed();


    console.log(`1st pass: Anonymizing...`);

    for (let tableName in tables) {
        let tableDetails = tables[tableName];
        let columnNames = [];
        spinner = ora({ text: `${tableName}`, indent: 2 }).start();

        if (tableDetails.truncate === true) {
            await db.query(
                `TRUNCATE TABLE ??`,
                [ tableName ]
            );
        }
        else for (let fieldType in tableDetails) {
            let fields = tableDetails[fieldType];

            for (let field of fields) {
                let columnName = field.column;
                columnNames.push(columnName);

                // Make sure foreign key will ON UPDATE CASCADE
                let foreignKeyResults = await db.query(
                    `
                        SELECT
                            k.TABLE_NAME,
                            k.COLUMN_NAME,
                            k.CONSTRAINT_NAME,
                            k.REFERENCED_TABLE_NAME,
                            k.REFERENCED_COLUMN_NAME,
                            r.DELETE_RULE,
                            r.UPDATE_RULE
                        FROM
                            INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
                            JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS r
                                USING (CONSTRAINT_CATALOG, CONSTRAINT_SCHEMA, CONSTRAINT_NAME)
                        WHERE
                            k.TABLE_SCHEMA = ?
                            AND k.TABLE_NAME IS NOT NULL
                            AND k.REFERENCED_TABLE_NAME = ?
                            AND k.REFERENCED_COLUMN_NAME = ?
                            AND r.UPDATE_RULE != 'CASCADE'
                        ORDER BY k.TABLE_NAME
                    `,
                    [ targetDbName, tableName, columnName ]
                );
                for (let result of foreignKeyResults) {
                    // Nullify invalid foreign key references
                    await db.query(
                        `
                            UPDATE
                                ?? a
                                LEFT JOIN ?? b
                                    ON a.?? = b.??
                            SET a.?? = NULL
                            WHERE b.?? IS NULL
                        `,
                        [ 
                            result.TABLE_NAME,
                            tableName,
                            result.COLUMN_NAME, columnName,
                            result.COLUMN_NAME,
                            columnName
                        ]
                    );
                    // Replace foreign key constraint
                    await db.query(
                        `
                            ALTER TABLE ??
                            DROP FOREIGN KEY ??
                        `,
                        [ result.TABLE_NAME, result.CONSTRAINT_NAME ]
                    );
                    await db.query(
                        `
                            ALTER TABLE ??
                            ADD CONSTRAINT ?? FOREIGN KEY ( ?? )
                            REFERENCES ?? ( ?? )
                                ON DELETE SET NULL
                                ON UPDATE CASCADE
                        `,
                        [ 
                            result.TABLE_NAME, 
                            result.CONSTRAINT_NAME, result.COLUMN_NAME, 
                            tableName, columnName 
                        ]
                    );
                }
            }
        }
        if (columnNames.length == 0) {
            // Nothing for this table
            spinner.succeed();
            continue;
        }

        // Fetch
        let dataList = [];
        try {
            dataList = await db.query(
                `
                    SELECT uuid, ??
                    FROM ??
                `,
                [ columnNames, tableName ]
            );
            spinner.succeed();
        }
        catch (err) {
            spinner.fail();
            if (err.code == "ER_BAD_FIELD_ERROR") {
                console.error("Bad column in tables.js");
                console.error(err.sqlMessage);
            }
            else {
                console.error(err.sqlMessage || err.message || err);
                console.error(err.sql);
            }
        }

        // Process data
        let rowCount = 0;
        spinner = ora({ text: `Anonymizing`, indent: 4 }).start();
        for (let row of dataList) {

            for (let fieldType in tableDetails) {
                let fields = tableDetails[fieldType];
                let warnings = new Set();

                for (let field of fields) {
                    let columnName = field.column;
                    let value = row[columnName];
                    let hash;

                    // Skip blank fields
                    if (!value) continue;

                    // Skip special cases
                    if (Array.isArray(field.skip)) {
                        if (field.skip.includes(value)) continue;
                    }

                    switch (fieldType) {
                        default:
                            if (!warnings.has(fieldType)) {
                                console.warn(`Unknown field type: ${fieldType}`);
                                warnings.add(fieldType);
                            }
                            break;

                        case "numbers":
                            let length = field.length || 1; // zero not accepted
                            value = String(Math.ceil(Math.random() * Math.pow(10, length))).padStart(length, "0");
                            break;

                        case "text":
                            if (field.length == "sentence") {
                                value = lorem.generateSentences(1);
                            }
                            else {
                                value = lorem.generateWords(field.length || 1);
                            }
                            break;

                        case "date":
                            // Randomize month and day only
                            let dateValue = new Date(value);
                            dateValue.setMonth(Math.ceil(Math.random() * 12));
                            dateValue.setDate(Math.ceil(Math.random() * 28));
                            value = dateValue.toLocaleDateString('se'); // ymd
                            break;

                        case "email":
                            hash = crypto.createHash('sha256');
                            hash.update(value);
                            value = hash.digest('hex').substring(0, 10) + "@example.com";
                            break;

                        case "username":
                            // randomname-123ab
                            hash = crypto.createHash('sha256');
                            hash.update(value);
                            value = randomName({ first: true }) + "-" + hash.digest('hex').substring(0, 5);
                            break;

                        case "hash":
                            hash = crypto.createHash('sha256');
                            hash.update(value);
                            value = hash.digest('hex').substring(0, field.length);
                            break;

                        case "name":
                            if (field.type == 'first') {
                                value = randomName({ first: true, random: Math.random });
                            }
                            else if (field.type == 'last') {
                                value = randomName({ last: true, random: Math.random });
                            }
                            else {
                                value = randomName({ random: Math.random });
                            }
                            break;

                        case "json":
                            try {
                                let jsonValue = JSON.parse(value);
                                for (let item of jsonValue) {
                                    if (!item[field.property]) {
                                        // Skip if the value is blank
                                    }
                                    else if (field.length == "sentence") {
                                        item[field.property] =  lorem.generateSentences(1);
                                    } 
                                    else {
                                        item[field.property] =  lorem.generateWords(field.length || 1);
                                    }
                                }
                                value = JSON.stringify(jsonValue);
                            }
                            catch (err) {
                                console.error(`\nProblem with ${tableName}.${columnName} JSON`);
                                console.error(err);
                            }
                            break;

                        case "uuid":
                            value = crypto.randomUUID();
                            break;
                    }

                    row[columnName] = value;
                }
            }

            // Save the randomized row data
            let uuid = row.uuid;
            delete row.uuid;
            for (let columnName in row) {
                let value = row[columnName];
                if (!value || value == 'null') {
                    delete row[columnName];
                }
            }
            if (Object.keys(row).length > 0) {
                try {
                    await db.query(
                        `
                            UPDATE ??
                            SET ?
                            WHERE uuid = ?
                        `,
                        [ tableName, row, uuid ]
                    );
                }
                catch (err) {
                    if (err.code == "ER_NO_REFERENCED_ROW_2") {
                        console.error("\nProblem with foreign key referential integrity.");
                        console.error("Maybe the export row limit was set too low.");
                    }
                    else {
                        throw err;
                    }
                }
            }
            rowCount += 1;
            spinner.text = `Anonymizing [${rowCount}]`;
        }

        spinner.text = `${rowCount} rows`;
        spinner.succeed();
    }

    console.log("2nd pass: Activating triggers...");
    for (let tableName in tables) {
        let triggers = await db.query(
            `SHOW TRIGGERS FROM ?? WHERE ?? = ?`,
            [ targetDbName, "Table", tableName ]
        );
        if (triggers.length > 0) {
            spinner = ora({ text: `${tableName}`, indent: 2 }).start();
            await db.query(
                `UPDATE ?? SET uuid = uuid`,
                [ tableName ]
            );
            spinner.succeed();
        }
    }

    console.log("OK");
    db.destroy();
}
