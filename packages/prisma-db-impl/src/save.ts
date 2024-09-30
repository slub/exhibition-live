import { PrismaClient } from "@prisma/client";
import { getPropertiesAndConnects } from "./helper";

export const save = async (
  typeNameOrigin: string,
  document: any,
  prisma: PrismaClient,
  importError: Set<string>,
) => {
  const { id, properties, connects } = await getPropertiesAndConnects(
    typeNameOrigin,
    document,
    prisma,
    importError,
    "",
  );
  if (!id) {
    console.error("no id");
    return;
  }
  try {
    const upsertResult = await prisma[typeNameOrigin].upsert({
      where: {
        id,
      },
      create: {
        id,
        ...properties,
      },
      update: {
        ...properties,
      },
    });
    const connectKeys = Object.keys(connects);
    if (connectKeys.length === 0) return;
    const connectResult = await prisma[typeNameOrigin].update({
      where: {
        id,
      },
      data: Object.fromEntries(
        Object.entries(connects).map(([key, connect]) => [
          key,
          {
            connect,
          },
        ]),
      ),
      include: Object.fromEntries(connectKeys.map((key) => [key, true])),
    });
    return {
      upsertResult,
      connectResult,
    };
  } catch (error) {
    console.error("could not save document", typeNameOrigin, id);
    console.error(JSON.stringify(connects, null, 2));
    console.error(error);
  }
  return null;
};
