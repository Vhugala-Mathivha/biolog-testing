-- Cleanup script to remove invalid face vectors from the database
-- This sets facevector to NULL for any employee record with incorrect vector dimensions

-- Check current state (optional, for diagnostics)
SELECT 
  employeenumber, 
  CASE 
    WHEN facevector IS NULL THEN 'NULL'
    ELSE CAST(array_length(facevector, 1) AS TEXT) || ' dimensions'
  END as vector_status
FROM employee
WHERE facevector IS NOT NULL
LIMIT 10;

-- Clear any vectors that are not 128-dimensional
UPDATE employee 
SET facevector = NULL 
WHERE facevector IS NOT NULL 
  AND array_length(facevector::float8[], 1) != 128;

-- Confirm the cleanup (optional)
SELECT COUNT(*) as employees_with_valid_vectors
FROM employee
WHERE facevector IS NOT NULL;
