/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `reportedBy` on the `WorkOrder` table. All the data in the column will be lost.
  - Added the required column `reportedById` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "MaintenanceReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "cost" REAL,
    "partsUsed" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Completed',
    "findings" TEXT,
    "recommendations" TEXT,
    "nextDueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaintenanceReport_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceReport_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create default user for existing work orders
INSERT INTO "User" ("id", "username", "email", "role", "password", "permissions", "createdAt", "updatedAt")
VALUES (
    'default-user',
    'system',
    'system@example.com',
    'Admin',
    '$2a$10$defaultpasswordhash',
    '["all"]',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Reported',
    "reportedById" TEXT NOT NULL,
    "reportedAt" DATETIME NOT NULL,
    "assignedToId" TEXT,
    "assignedAt" DATETIME,
    "estimatedCompletion" DATETIME,
    "description" TEXT NOT NULL,
    "symptoms" TEXT,
    "impact" TEXT,
    "actions" TEXT,
    "notes" TEXT,
    "sparePartsNeeded" TEXT,
    "partsUsed" TEXT,
    "completionNotes" TEXT,
    "completedAt" DATETIME,
    "cost" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkOrder_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy existing data and set default user for reportedBy
INSERT INTO "new_WorkOrder" (
    "actions", "assignedAt", "completedAt", "completionNotes", "cost", "createdAt",
    "description", "equipmentId", "estimatedCompletion", "id", "impact", "issue",
    "notes", "partsUsed", "priority", "reportedAt", "sparePartsNeeded", "status",
    "symptoms", "type", "updatedAt", "reportedById"
)
SELECT 
    "actions", "assignedAt", "completedAt", "completionNotes", "cost", "createdAt",
    "description", "equipmentId", "estimatedCompletion", "id", "impact", "issue",
    "notes", "partsUsed", "priority", "reportedAt", "sparePartsNeeded", "status",
    "symptoms", "type", "updatedAt", 'default-user'
FROM "WorkOrder";

DROP TABLE "WorkOrder";
ALTER TABLE "new_WorkOrder" RENAME TO "WorkOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
