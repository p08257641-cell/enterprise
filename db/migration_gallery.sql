CREATE TABLE IF NOT EXISTS company_images (
  id TEXT PRIMARY KEY,
  "companyId" TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  "imageData" TEXT,
  "uploadedBy" TEXT,
  "uploadedByName" TEXT,
  "createdAt" TEXT
);
