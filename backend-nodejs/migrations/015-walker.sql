-- Up

CREATE TABLE walkers (
    rec_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    class VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    firstname VARCHAR NOT NULL,
    participates INTEGER NOT NULL DEFAULT 1,
    distance_m INTEGER NOT NULL DEFAULT 0,
    course VARCHAR NULL DEFAULT NULL,
    CHECK (participates IN (0,1,2))
);

-- Down

DROP TABLE IF EXISTS walkers;