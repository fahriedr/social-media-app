/*
  Warnings:

  - Added the required column `link_url` to the `post_media` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_post_media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "post_id" INTEGER NOT NULL,
    "link_url" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    CONSTRAINT "post_media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_post_media" ("id", "post_id", "timestamp") SELECT "id", "post_id", "timestamp" FROM "post_media";
DROP TABLE "post_media";
ALTER TABLE "new_post_media" RENAME TO "post_media";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
