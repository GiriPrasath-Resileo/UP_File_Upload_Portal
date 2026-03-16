import { prisma } from '../config/db';
import type { SchoolMappingData } from '@edu-portal/shared';

export async function getDistricts(): Promise<string[]> {
  const districts = await prisma.district.findMany({ orderBy: { name: 'asc' } });
  return districts.map(d => d.name);
}

export async function getBlocks(districtName: string): Promise<string[]> {
  const district = await prisma.district.findUnique({
    where: { name: districtName },
    include: { blocks: { orderBy: { name: 'asc' } } },
  });
  if (!district) return [];
  return district.blocks.map(b => b.name);
}

export async function getSchools(districtName: string, blockName: string) {
  const district = await prisma.district.findUnique({ where: { name: districtName } });
  if (!district) return [];

  const block = await prisma.block.findUnique({
    where: { name_districtId: { name: blockName, districtId: district.id } },
  });
  if (!block) return [];

  return prisma.school.findMany({
    where: { blockId: block.id },
    select: { id: true, name: true, udiseCode: true, boardCode: true, placeName: true },
    orderBy: { name: 'asc' },
  });
}

export async function getAllSchools(params: {
  page?: number;
  limit?: number;
  search?: string;
  district?: string;
}) {
  const { page = 1, limit = 20, search, district } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { udiseCode: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (district) {
    where.block = { district: { name: district } };
  }

  const [total, schools] = await Promise.all([
    prisma.school.count({ where }),
    prisma.school.findMany({
      where,
      skip,
      take: limit,
      include: { block: { include: { district: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  const data = schools.map(s => ({
    id:           s.id,
    name:         s.name,
    udiseCode:    s.udiseCode,
    boardCode:    s.boardCode,
    placeName:    s.placeName,
    block:        s.block.name,
    district:     s.block.district.name,
    createdAt:    s.createdAt,
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function ingestSchoolMappings(rows: SchoolMappingData[]): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const district = await prisma.district.upsert({
      where: { name: row.districtName },
      update: {},
      create: { name: row.districtName },
    });

    const block = await prisma.block.upsert({
      where: { name_districtId: { name: row.blockName, districtId: district.id } },
      update: {},
      create: { name: row.blockName, districtId: district.id },
    });

    const existing = await prisma.school.findUnique({ where: { udiseCode: row.udiseCode } });
    if (existing) {
      skipped++;
    } else {
      await prisma.school.create({
        data: {
          name: row.schoolName,
          udiseCode: row.udiseCode,
          boardCode: row.boardCode,
          placeName: row.placeName,
          blockId: block.id,
        },
      });
      created++;
    }
  }

  return { created, skipped };
}

export async function createSchool(data: SchoolMappingData) {
  const district = await prisma.district.upsert({
    where: { name: data.districtName },
    update: {},
    create: { name: data.districtName },
  });
  const block = await prisma.block.upsert({
    where: { name_districtId: { name: data.blockName, districtId: district.id } },
    update: {},
    create: { name: data.blockName, districtId: district.id },
  });
  return prisma.school.create({
    data: {
      name: data.schoolName,
      udiseCode: data.udiseCode,
      boardCode: data.boardCode,
      placeName: data.placeName,
      blockId: block.id,
    },
  });
}

export async function updateSchool(id: string, data: Partial<SchoolMappingData>) {
  return prisma.school.update({ where: { id }, data: { name: data.schoolName, boardCode: data.boardCode, placeName: data.placeName } });
}

export async function deleteSchool(id: string): Promise<void> {
  await prisma.school.delete({ where: { id } });
}
