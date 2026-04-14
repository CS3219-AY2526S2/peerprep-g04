BEGIN;

CREATE TYPE submission_status AS ENUM ('Accepted', 'Failed', 'Error');

ALTER TABLE submission_attempts 
ALTER COLUMN status TYPE submission_status 
USING status::submission_status;

COMMIT;