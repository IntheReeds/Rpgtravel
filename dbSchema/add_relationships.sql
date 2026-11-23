BEGIN;
-- For table restaurant
ALTER TABLE users ADD PRIMARY KEY (username);
 
-- For table address
--ALTER TABLE address ADD PRIMARY KEY (locid, street_addr, zipcode);
--ALTER TABLE address ADD FOREIGN KEY (locid) references restaurant;
CREATE TYPE object_type AS ENUM ('naval_supply', 'land_supply', 'actor', 'npc', 'other');

CREATE TYPE ration_type AS ENUM ('naval_supply', 'land_supply');
COMMIT WORK;

--CREATE INDEX r_loc_idx ON restaurant(locid);
--CREATE INDEX a_loc_idx ON address(locid);