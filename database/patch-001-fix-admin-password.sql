-- Database patch to fix Mr. Somers password hash
-- This will update the existing user with the correct password hash for 'admin123'

UPDATE users 
SET password_hash = '$2a$12$rqw3.A7RcdobsIH5UHV4LeWgtpzIiwTBmMDuXB0PdkKCOeR.KFNdO'
WHERE email = 'mr.somers@school.edu';

-- Log the patch
INSERT INTO activity_logs (
    action,
    resource_type,
    metadata
) VALUES (
    'password_hash_fixed',
    'system',
    '{"user": "mr.somers@school.edu", "reason": "incorrect_hash_in_init_script", "patch_version": "1.0.1"}'
);
