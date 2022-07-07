-- Up

CREATE VIEW checkins_full AS
SELECT 
    ch.rec_id AS `rec_id`,
    ch.code_id AS `code_id`,
    ch.station_id AS `station_id`,
    ch.scanner_id AS `scanner_id`,
    ch.stamp AS `stamp`,
    ch.active AS `active`,
    co.uuid AS `code_uuid`,
    sc.uuid AS `scanner_uuid`,
    st.name AS `station_name`,
    st.uuid AS `station_uuid`,
    st.distance_m AS `stattion_distance_m`
FROM checkins AS ch
LEFT JOIN codes AS co ON ch.code_id = co.rec_id 
LEFT JOIN scanner AS sc ON ch.scanner_id = sc.rec_id 
LEFT JOIN stations AS st ON ch.station_id = st.rec_id 
ORDER BY ch.code_id ASC, ch.stamp DESC; 

CREATE VIEW checkins_station AS
SELECT 
    ch.rec_id AS `rec_id`,
    ch.code_id AS `code_id`,
    ch.station_id AS `station_id`,
    ch.scanner_id AS `scanner_id`,
    ch.stamp AS `stamp`,
    ch.active AS `active`,
    st.name AS `name`,
    st.uuid AS `uuid`,
    st.prev_station AS `prev_station`,
    st.distance_m AS `distance_m`,
    st.position AS `position`
FROM checkins AS ch
LEFT JOIN stations AS st
ON ch.station_id = st.rec_id 
ORDER BY ch.station_id ASC, ch.stamp DESC; 

CREATE VIEW checkins_scanner AS
SELECT 
    ch.rec_id AS `rec_id`,
    ch.code_id AS `code_id`,
    ch.station_id AS `station_id`,
    ch.scanner_id AS `scanner_id`,
    ch.stamp AS `stamp`,
    ch.active AS `active`,
    sc.uuid AS `uuid`,
    sc.stamp AS `scanner_stamp`,
    sc.name AS `name`
FROM checkins AS ch
LEFT JOIN scanner AS sc
ON ch.scanner_id = sc.rec_id 
ORDER BY ch.scanner_id ASC, ch.stamp DESC; 

CREATE VIEW checkins_code AS
SELECT 
    ch.rec_id AS `rec_id`,
    ch.code_id AS `code_id`,
    ch.station_id AS `station_id`,
    ch.scanner_id AS `scanner_id`,
    ch.active AS `active`,
    ch.stamp AS `stamp`,
    co.uuid AS `uuid`,
    co.active AS `active` 
FROM checkins AS ch
LEFT JOIN codes AS co
ON ch.code_id = co.rec_id 
ORDER BY ch.code_id ASC, ch.stamp, DESC; 

-- Down
DROP VIEW IF EXISTS checkins_code;
DROP VIEW IF EXISTS checkins_scanner;
DROP VIEW IF EXISTS checkins_station;
DROP VIEW IF EXISTS checkins_full;