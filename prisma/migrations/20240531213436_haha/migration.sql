-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "TextType" AS ENUM ('H1', 'H2', 'H3', 'P');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'X');

-- CreateTable
CREATE TABLE "sensors_read" (
    "id" TEXT NOT NULL,
    "ec" DOUBLE PRECISION,
    "ph" DOUBLE PRECISION,
    "temperature" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensors_read_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectors_order" (
    "id" TEXT NOT NULL,
    "paymentSuccess" BOOLEAN NOT NULL DEFAULT false,
    "stripeId" TEXT NOT NULL,
    "packeta" JSONB NOT NULL,
    "note" TEXT,
    "customerId" TEXT NOT NULL,
    "discountID" TEXT,

    CONSTRAINT "projectors_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectors_customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT NOT NULL,

    CONSTRAINT "projectors_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectors_order_item" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "projectors_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectors_item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "projectors_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectors_discount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "deliveryDiscount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "projectors_discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotion_page" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "fotion_page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotion_block" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "BlockType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "text_type" "TextType" DEFAULT 'P',
    "pageId" TEXT NOT NULL,

    CONSTRAINT "fotion_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotion_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fotion_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_fotion_pageTofotion_user" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "projectors_order_stripeId_key" ON "projectors_order"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "projectors_order_customerId_key" ON "projectors_order"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "projectors_discount_code_key" ON "projectors_discount"("code");

-- CreateIndex
CREATE UNIQUE INDEX "fotion_user_email_key" ON "fotion_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fotion_user_providerId_key" ON "fotion_user"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "fotion_user_accessToken_key" ON "fotion_user"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "fotion_user_refreshToken_key" ON "fotion_user"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "_fotion_pageTofotion_user_AB_unique" ON "_fotion_pageTofotion_user"("A", "B");

-- CreateIndex
CREATE INDEX "_fotion_pageTofotion_user_B_index" ON "_fotion_pageTofotion_user"("B");

-- AddForeignKey
ALTER TABLE "projectors_order" ADD CONSTRAINT "projectors_order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "projectors_customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectors_order" ADD CONSTRAINT "projectors_order_discountID_fkey" FOREIGN KEY ("discountID") REFERENCES "projectors_discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectors_order_item" ADD CONSTRAINT "projectors_order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "projectors_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectors_order_item" ADD CONSTRAINT "projectors_order_item_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "projectors_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotion_block" ADD CONSTRAINT "fotion_block_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "fotion_page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_fotion_pageTofotion_user" ADD CONSTRAINT "_fotion_pageTofotion_user_A_fkey" FOREIGN KEY ("A") REFERENCES "fotion_page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_fotion_pageTofotion_user" ADD CONSTRAINT "_fotion_pageTofotion_user_B_fkey" FOREIGN KEY ("B") REFERENCES "fotion_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
