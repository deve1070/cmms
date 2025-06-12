-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "purchaseDate" TEXT NOT NULL,
    "warrantyDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Operational',
    "category" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "lastMaintenance" TEXT,
    "nextMaintenance" TEXT,
    "department" TEXT NOT NULL,
    "cost" REAL
);

-- CreateTable
CREATE TABLE "SparePart" (
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
    "leadTime" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "actions" TEXT,
    "completedAt" TEXT,
    CONSTRAINT "WorkOrder_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendor" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Contract_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "cost" REAL,
    "partsUsed" TEXT,
    CONSTRAINT "MaintenanceHistory_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "generatedAt" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "metrics" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "allocated" REAL NOT NULL,
    "spent" REAL NOT NULL,
    "department" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Compliance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastCheck" TEXT NOT NULL,
    "nextDue" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "Compliance_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "department" TEXT,
    "permissions" TEXT NOT NULL,
    "lastLogin" TEXT,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
