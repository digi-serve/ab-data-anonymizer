/**
 * Anonymize AppBuilder data
 * 
 * node cli.js --limit=5000
 */

import anonymize from "./anonymize.js";
import dbInfo from "./data/dbInfo.js";
import tables from "./data/tables.js";

var ROW_LIMIT;
for (let arg of process.argv) {
    let match = arg.match(/^--limit=(\d+)$/);
    if (match) {
        ROW_LIMIT = match[1];
        console.log(`Limiting exported rows to ${ROW_LIMIT} per table`);
    }
}

anonymize(dbInfo, tables, ROW_LIMIT);
