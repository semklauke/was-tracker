-- Up

CREATE VIEW code_walker_full AS
SELECT 
    cw.rec_id AS `rec_id`,
    wa.rec_id AS `walker_id`,
    co.rec_id AS `code_id`,
    co.uuid AS `code_uuid`,
    co.active AS `active`,
    wa.class AS `class`,
    wa.lastname AS `lastname`,
    wa.firstname AS `firstname`,
    wa.participates AS `participates`,
    wa.distance_m AS `distance_m`,
    wa.course AS `course`
FROM code_walker AS cw
LEFT JOIN codes AS co ON cw.code_id = co.rec_id 
LEFT JOIN walkers AS wa ON cw.walker_id = wa.rec_id 
WHERE active = 1 OR active = 2;



-- Down
DROP VIEW IF EXISTS code_walker_full;