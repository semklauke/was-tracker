-- Up

CREATE TABLE code_walker (
    rec_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    code_id INTEGER NOT NULL, 
    walker_id INTEGER NOT NULL
);

-- Down

DROP TABLE IF EXISTS code_walker;