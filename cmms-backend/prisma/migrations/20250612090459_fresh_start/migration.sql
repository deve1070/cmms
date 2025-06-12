/*
  Warnings:

  - You are about to drop the column `inventoryNumber` on the `Equipment` table. All the data in the column will be lost.
  - Added the required column `serialNumber` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serialNumber" TEXT NOT NULL,
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
INSERT INTO "new_Equipment" ("category", "createdAt", "department", "id", "installationDate", "locationCode", "locationDescription", "manufacturerName", "manufacturerServiceNumber", "modelNumber", "purchasePrice", "status", "updatedAt", "vendorCode", "vendorName", "warrantyExpirationDate") SELECT "category", "createdAt", "department", "id", "installationDate", "locationCode", "locationDescription", "manufacturerName", "manufacturerServiceNumber", "modelNumber", "purchasePrice", "status", "updatedAt", "vendorCode", "vendorName", "warrantyExpirationDate" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE UNIQUE INDEX "Equipment_serialNumber_key" ON "Equipment"("serialNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
