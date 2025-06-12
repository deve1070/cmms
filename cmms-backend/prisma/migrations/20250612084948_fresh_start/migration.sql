/*
  Warnings:

  - You are about to drop the column `cost` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `lastMaintenance` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `nextMaintenance` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `warrantyDetails` on the `Equipment` table. All the data in the column will be lost.
  - You are about to alter the column `completedAt` on the `WorkOrder` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `createdAt` on the `WorkOrder` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - Added the required column `installationDate` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventoryNumber` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationCode` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationDescription` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manufacturerName` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manufacturerServiceNumber` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelNumber` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorCode` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorName` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warrantyExpirationDate` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipmentId` to the `SparePart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportedAt` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inventoryNumber" TEXT NOT NULL,
    "manufacturerName" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "manufacturerServiceNumber" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "locationDescription" TEXT NOT NULL,
    "locationCode" TEXT NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "installationDate" DATETIME NOT NULL,
    "warrantyExpirationDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Operational',
    "category" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Equipment" ("category", "department", "id", "status") SELECT "category", "department", "id", "status" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE UNIQUE INDEX "Equipment_inventoryNumber_key" ON "Equipment"("inventoryNumber");
CREATE TABLE "new_SparePart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "lastUpdated" TEXT NOT NULL,
    "alert" TEXT,
    "category" TEXT NOT NULL,
    "unitCost" REAL NOT NULL,
    "supplier" TEXT,
    "location" TEXT NOT NULL,
    "minOrderQty" INTEGER NOT NULL,
    "leadTime" INTEGER NOT NULL,
    "equipmentId" TEXT NOT NULL,
    CONSTRAINT "SparePart_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SparePart" ("alert", "category", "id", "lastUpdated", "leadTime", "location", "minOrderQty", "name", "quantity", "supplier", "threshold", "unitCost") SELECT "alert", "category", "id", "lastUpdated", "leadTime", "location", "minOrderQty", "name", "quantity", "supplier", "threshold", "unitCost" FROM "SparePart";
DROP TABLE "SparePart";
ALTER TABLE "new_SparePart" RENAME TO "SparePart";
CREATE TABLE "new_WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Reported',
    "reportedBy" TEXT NOT NULL,
    "reportedAt" DATETIME NOT NULL,
    "assignedTo" TEXT,
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
    CONSTRAINT "WorkOrder_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkOrder" ("actions", "assignedTo", "completedAt", "createdAt", "equipmentId", "id", "issue", "reportedBy", "status", "type") SELECT "actions", "assignedTo", "completedAt", "createdAt", "equipmentId", "id", "issue", "reportedBy", "status", "type" FROM "WorkOrder";
DROP TABLE "WorkOrder";
ALTER TABLE "new_WorkOrder" RENAME TO "WorkOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
