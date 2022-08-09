-- Up

CREATE TABLE code_walker (
    rec_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    code_id INTEGER NOT NULL, 
    walker_id INTEGER NOT NULL,
    FOREIGN KEY (code_id) REFERENCES codes(rec_id)
    --FOREIGN KEY (walker_id) REFERENCES walkers(rec_id)
);

-- Down

DROP TABLE IF EXISTS code_walker;