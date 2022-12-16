# ab-data-anonymizer
Export data from an AppBuilder DB and anonymize it

## Install
```
npm install
```

## Config
Create `./data/dbInfo.js`.
```js
  export default {
      // Database credentials.
      "user": "root",
      "password": "r00t",
      "host": "127.0.0.1",
      "port": "3388",
      
      // This is the name of the source DB you want to export.
      "name": "appbuilder-admin",
      
      // This is the name of the target DB you are exporting to. 
      // It does not need to exist yet.
      "anonymousName": "appbuilder-anonymous"
  }
```

## Usage

### Options
```
  --limit=[rowLimit]
```
You can set the max number of rows per table to export. Be careful as this may compromise the foreign key referential integrity of the export if you set this too low.

### Run
```
node anonymize.js
```


# Notes

The list of tables and columns to be anonymized is defined in `./data/tables.js`. This should be customized according to the AppBuilder applications in your database.

All foreign keys will be set to `ON DELETE SET NULL ON UPDATE CASCADE` in the exported DB, even if they are not in the source DB.

All columns that refer to other tables should be defined with foreign key constraints. If not, the anonymizer script has no way of knowing what columns they are referring to, and referential integrity will be lost after anonymizing.
