Export data from an AppBuilder DB and anonymize it

# Requirements

`mysql` and `mysqldump` should be accessible from the command line.

# Install
```sh
npm install digi-serve/ab-data-anonymizer
```

# Command Line Usage

## Config
Create `./data/dbInfo.js`.
```js
  export default {
      // Database credentials.
      "user": "root",
      "password": "r00t",
      "host": "127.0.0.1",
      "port": "3306",
      
      // This is the name of the source DB you want to export.
      "name": "appbuilder-admin",
      
      // This is the name of the target DB you are exporting to. 
      // It does not need to exist yet.
      "anonymousName": "appbuilder-anonymous"
  }
```

## Options
```sh
  --limit=[rowLimit]
```
You can set the max number of rows per table to export. Be careful as this may compromise the foreign key referential integrity of the export if you set this too low.

## Run
```sh
  node cli.js
```

## Notes

The list of tables and columns to be anonymized is defined in `./data/tables.js`. This should be customized according to the AppBuilder applications in your database.

All foreign keys will be set to `ON DELETE SET NULL ON UPDATE CASCADE` in the exported DB, even if they are not in the source DB.

All columns that refer to other tables should be defined with foreign key constraints. If not, the anonymizer script has no way of knowing what columns they are referring to, and referential integrity will be lost after anonymizing.

The following tables will always be exported with no data (i.e. truncated):
- `SITE_ROWLOG`
- `SITE_PROCESS_INSTANCE`
- `SITE_PROCESS_INSTANCE_temp`

# API Usage

```js

import anonymize from "ab-data-anonymizer"

anonymize(
  {
    user: "root",
    password: "r00t",
    host: "127.0.0.1",
    port: "3306",
    name: "appbuilder-admin",
    anonymousName: "appbuilder-anonymous"
  },
  {
    AB_TABLE1: {
      text: [
        // Random lorem ipsum
        { column: "COLUMN_A", length: 4 /* number of words */ },
        { column: "COLUMN_B", length: "sentence" }
      ],
      email: [
        // <SHA2 hash 10 chars>@example.com
        { column: "COLUMN_C" }
      ],
      numbers: [
        { column: "COLUMN_D", length: 5 /* number of digits */ }
      ],
      date: [
        // Randomized day and month, yyyy-mm-dd
        { column: "COLUMN_E" }
      ],
      username: [
        // <Random first name>-<SHA2 hash 5 chars>
        { column: "COLUMN_F_a" },
        { 
          column: "COLUMN_F_b", 
          // Skip special cases that should not be anonymized
          skip: ["admin", "developer"]
        }
      ],
      hash: [
        // SHA2 hash
        { column: "COLUMN_G", length: 7 /* number of chars */ }
      ],
      name: [
        { column: "COLUMN_H", type: "first" }
        { column: "COLUMN_I", type: "last" }
        { column: "COLUMN_J" /* both first & last */ }
      ],
      json: [
        // [ { language_code: "en", Description: "THIS WILL BE ANONYMIZED" }, ... ]
        { column: "COLUMN_K", property: "Description", length: 5 /* number of words */ },
        // [ { language_code: "en", Explanation: "THIS WILL BE ANONYMIZED" }, ... ]
        { column: "COLUMN_L", property: "Explanation", length: "sentence" },
      ]
    },

    AB_TABLE2: {
      truncate: true // Delete all the rows from this table
    },

    AB_TABLE3: { ... },

    ...
  }
);
```
