import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/appError';
import { slugify } from '@/utils/slug';

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export async function list(query: ListQuery) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;
  const where = {
    AND: [
      query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {},
    ],
  } as any;
  const orderBy = [{ [query.sortBy || 'createdAt']: query.sortOrder || 'desc' } as any];

  const [items, total] = await Promise.all([
    prisma.category.findMany({ where, orderBy, skip, take: limit }),
    prisma.category.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  return {
    items,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function getById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw AppError.notFound('Category not found');
  return category;
}

export async function create(input: { name: string; description?: string | null; isActive?: boolean }) {
  const slug = slugify(input.name);
  const category = await prisma.category.create({ data: { ...input, slug } });
  return category;
}

export async function update(id: string, input: { name?: string; description?: string | null; isActive?: boolean }) {
  const data: any = { ...input };
  if (input.name) data.slug = slugify(input.name);
  try {
    const category = await prisma.category.update({ where: { id }, data });
    return category;
  } catch (e) {
    throw AppError.notFound('Category not found');
  }
}

export async function remove(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    return { success: true };
  } catch (e) {
    throw AppError.notFound('Category not found');
  }
}

