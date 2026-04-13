BEGIN;

DROP TRIGGER IF EXISTS ensure_owner_exists_trigger ON users;
DROP INDEX IF EXISTS only_one_owner_idx;

CREATE TYPE access_role AS ENUM ('admin', 'user', 'owner');

ALTER TABLE users 
ALTER COLUMN access TYPE access_role 
USING access::access_role;

CREATE UNIQUE INDEX only_one_owner_idx ON users (access) WHERE access = 'owner';

CREATE OR REPLACE FUNCTION ensure_only_one_owner()
RETURNS TRIGGER AS $$
DECLARE
    owner_count INT;
BEGIN
    IF OLD.access = 'owner' THEN
        SELECT COUNT(*) INTO owner_count FROM users WHERE access = 'owner';
        
        IF owner_count = 0 THEN
            RAISE EXCEPTION 'ERROR: The system must have exactly one owner. You cannot delete or demote the last owner.';
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ensure_owner_exists_trigger
AFTER DELETE OR UPDATE OF access ON users
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION ensure_only_one_owner();

COMMIT;