-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "bio" TEXT,
    "avatar" TEXT NOT NULL,
    "last_login" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "bio", "created_at", "email", "id", "last_login", "name", "password", "username") SELECT "avatar", "bio", "created_at", "email", "id", "last_login", "name", "password", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
