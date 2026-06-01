-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "answer" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "subject" TEXT NOT NULL DEFAULT 'その他',
ADD COLUMN     "unit" TEXT;
