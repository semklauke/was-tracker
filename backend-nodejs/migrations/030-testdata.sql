-- Up

INSERT INTO stations (name, uuid, distance_m) VALUES 
('ST 1', 'cb71b32b-757f-4ea0-aff8-66192008daa6', '25');

-- Down

DELETE FROM stations;
DELETE FROM sqlite_sequence WHERE name='stations';