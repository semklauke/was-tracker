-- Up

INSERT INTO stations (name, uuid, distance_m) VALUES 
('ST 1', 'cb71b32b-757f-4ea0-aff8-66192008daa6', '25');

INSERT INTO codes (rec_id, uuid, active) VALUES
('1', 'ec2cefb3-0abf-4de8-b051-bba2b716ea75', '1');

INSERT INTO walkers (rec_id, firstname, lastname, class, course) VALUES
('1', 'Sem', 'Klauke', 'Q2', 'MA');

INSERT INTO code_walker (code_id, walker_id) VALUES
('1', '1');

-- Down

DELETE FROM stations;
DELETE FROM code_walker;
DELETE FROM codes;
DELETE FROM walkers;
DELETE FROM sqlite_sequence WHERE name='stations';
DELETE FROM sqlite_sequence WHERE name='code_walker';
DELETE FROM sqlite_sequence WHERE name='codes';
DELETE FROM sqlite_sequence WHERE name='walkers';