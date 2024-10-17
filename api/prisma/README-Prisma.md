# Prisma Merge Information

In order to better organize the Prisma Schema, we use Prisma Merge.  You can read more about prisma merge at the link below.

The basic concept is, create a new file in the schema's folder called whatever.prisma, then add your new file to the prismerge.json file.

Once you call yarn db:migration-create, it will build the schema prisma file before generating a new migration.  Please never edit the schema.prisma file directly as it will be automatically overwritten every time a new migration is generated.

[Prisma Merge Docs](https://github.com/prisma-utils/prisma-utils/blob/main/libs/prismerge/README.md)