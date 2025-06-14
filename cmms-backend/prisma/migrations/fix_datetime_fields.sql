-- Fix DateTime fields in User table
UPDATE "User" 
SET "updatedAt" = datetime('now')
WHERE typeof("updatedAt") = 'integer';

UPDATE "User" 
SET "createdAt" = datetime('now')
WHERE typeof("createdAt") = 'integer'; 