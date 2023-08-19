import type { UserId } from '$/commonTypesWithClient/branded';
import type { CellModel, PlayerModel, Pos } from '$/commonTypesWithClient/models';
import { cellsRepository } from '$/repository/cellsRepository';
import { playersRepository } from '$/repository/playersRepository';

export const playerActionUseCase = {
  dig: async (cells: CellModel[]) => {
    Promise.all(cells.map((cell) => cellsRepository.create({ ...cell }))).then((results) =>
      results.forEach((result) => {
        result;
      })
    );
    const playerId = cells[0].whoOpened;
    const player = await playersRepository.find(playerId);
    if (player === null) return null;
    const newPlayer = { ...player, score: player.score + cells.length };
    return await playersRepository.save(newPlayer);
  },
  explosion: async (player: PlayerModel) => {
    const res = await cellsRepository.findAllOfPlayer(player.id);
    if (res === null) return null;
    Promise.all(res.map((cell) => cellsRepository.delete(cell.x, cell.y)));
    const newPlayer = { ...player, isLive: false };
    return await playersRepository.save(newPlayer);
  },
  putFrug: async (userId: UserId, focusPos: Pos) => {
    const newCell: CellModel = {
      x: focusPos.x,
      y: focusPos.y,
      cellValue: 9,
      whoOpened: userId,
      whenOpened: new Date().getTime(),
      isUserInput: true,
    };
    return await cellsRepository.create(newCell);
  },
};
