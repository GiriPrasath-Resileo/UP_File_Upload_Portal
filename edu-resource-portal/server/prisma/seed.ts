import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed FileSequence
  await prisma.fileSequence.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, lastVal: 100000 },
  });

  // Seed Admin user
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.upsert({
    where: { userId: 'admin' },
    update: {},
    create: {
      userId: 'admin',
      passwordHash: adminHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Seed sample uploader
  const uploaderHash = await bcrypt.hash('Upload@1234', 12);
  await prisma.user.upsert({
    where: { userId: 'uploader1' },
    update: {},
    create: {
      userId: 'uploader1',
      passwordHash: uploaderHash,
      role: Role.UPLOADER,
      districtScope: 'Lucknow',
      isActive: true,
    },
  });

  // Seed districts and schools for UP
  const districts = [
    {
      name: 'Lucknow',
      blocks: [
        {
          name: 'Chinhat',
          schools: [
            { name: 'Government Primary School Chinhat', udiseCode: '09150101001', boardCode: 'UP_BOARD', placeName: 'Chinhat' },
            { name: 'Government Inter College Chinhat', udiseCode: '09150101002', boardCode: 'UP_BOARD', placeName: 'Chinhat' },
          ],
        },
        {
          name: 'Bakshi Ka Talab',
          schools: [
            { name: 'Primary School Bakshi Ka Talab', udiseCode: '09150102001', boardCode: 'UP_BOARD', placeName: 'Bakshi Ka Talab' },
          ],
        },
      ],
    },
    {
      name: 'Agra',
      blocks: [
        {
          name: 'Etmadpur',
          schools: [
            { name: 'Government Primary School Etmadpur', udiseCode: '09010201001', boardCode: 'UP_BOARD', placeName: 'Etmadpur' },
          ],
        },
        {
          name: 'Khandoli',
          schools: [
            { name: 'Government Inter College Khandoli', udiseCode: '09010202001', boardCode: 'CBSE', placeName: 'Khandoli' },
          ],
        },
      ],
    },
    {
      name: 'Varanasi',
      blocks: [
        {
          name: 'Arajiline',
          schools: [
            { name: 'Primary School Arajiline', udiseCode: '09190301001', boardCode: 'UP_BOARD', placeName: 'Arajiline' },
          ],
        },
      ],
    },
  ];

  for (const dist of districts) {
    const district = await prisma.district.upsert({
      where: { name: dist.name },
      update: {},
      create: { name: dist.name },
    });

    for (const blk of dist.blocks) {
      const block = await prisma.block.upsert({
        where: { name_districtId: { name: blk.name, districtId: district.id } },
        update: {},
        create: { name: blk.name, districtId: district.id },
      });

      for (const sch of blk.schools) {
        await prisma.school.upsert({
          where: { udiseCode: sch.udiseCode },
          update: {},
          create: {
            name: sch.name,
            udiseCode: sch.udiseCode,
            boardCode: sch.boardCode,
            placeName: sch.placeName,
            blockId: block.id,
          },
        });
      }
    }
  }

  console.log('Seed complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
