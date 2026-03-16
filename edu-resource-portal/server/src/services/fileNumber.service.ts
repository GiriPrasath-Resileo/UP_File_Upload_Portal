import type { PrismaClient } from '@prisma/client';

type PrismaTx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export async function issueFileNumber(tx: PrismaTx): Promise<string> {
  const seq = await tx.fileSequence.update({
    where: { id: 1 },
    data: { lastVal: { increment: 1 } },
  });
  return `UP-${seq.lastVal}`;
}
