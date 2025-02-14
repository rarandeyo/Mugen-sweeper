import type { UserId } from '$/commonTypesWithClient/branded';
import type { CellModel } from '$/commonTypesWithClient/models';
import { userIdParser } from '$/service/idParsers';
import { prismaClient } from '$/service/prismaClient';
import type { Cell } from '@prisma/client';
import { z } from 'zod';
const toCellModel = (prismaCell: Cell): CellModel => ({
  x: z.number().min(0).parse(prismaCell),
  y: z.number().min(0).parse(prismaCell.y),
  cellValue: z.number().min(0).parse(prismaCell.cellValue),
  whoOpened: userIdParser.parse(prismaCell.whoOpened),
  whenOpened: prismaCell.whenOpened.getTime(),
  isUserInput: z.boolean().parse(prismaCell.isUserInput),
});

export const cellsRepository = {
  create: async (cell: CellModel): Promise<CellModel> => {
    const newCell = { ...cell, whenOpened: new Date(cell.whenOpened) };
    const prismaCell = await prismaClient.cell.create({
      data: newCell,
    });
    return toCellModel(prismaCell);
  },
  findAll: async (): Promise<CellModel[]> => {
    const prismaCells = await prismaClient.cell.findMany({
      orderBy: { x: 'asc', y: 'asc' },
    });
    return prismaCells.map(toCellModel);
  },
  findWithPlayer: async (userId: UserId) => {
    const prismaCells = await prismaClient.cell.findMany({ where: { whoOpened: userId } });
    return prismaCells !== null ? prismaCells.map(toCellModel) : null;
  },
  findOlder: async () => {
    const prismaCells = await prismaClient.cell.findMany({ orderBy: { whenOpened: 'desc' } });
    return prismaCells !== null ? prismaCells.map(toCellModel) : null;
  },
  findAllUserInputted: async () => {
    const prismaCells = await prismaClient.cell.findMany({ where: { isUserInput: true } });
    return prismaCells !== null ? prismaCells.map(toCellModel) : null;
  },
  delete: async (x: number, y: number, whoOpened: UserId) => {
    await prismaClient.cell.delete({ where: { uniquePos: { x, y, whoOpened } } });
    return null;
  },
  deleteWithPlayer: async (userId: UserId) => {
    await prismaClient.cell.deleteMany({ where: { whenOpened: userId } });
    return null;
  },
};
