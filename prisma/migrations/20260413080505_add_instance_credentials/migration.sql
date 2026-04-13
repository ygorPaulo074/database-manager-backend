-- CreateTable
CREATE TABLE "InstanceCredential" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "database" TEXT,
    "engine" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstanceCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstanceCredential_instanceId_key" ON "InstanceCredential"("instanceId");

-- AddForeignKey
ALTER TABLE "InstanceCredential" ADD CONSTRAINT "InstanceCredential_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
