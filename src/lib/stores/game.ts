import PlinkoEngine from '$lib/components/Plinko/PlinkoEngine';
import { DEFAULT_BALANCE } from '$lib/constants/game';
import {
  RiskLevel,
  type BetAmountOfExistingBalls,
  type RowCount,
  type WinRecord,
} from '$lib/types/game';
import { writable } from 'svelte/store';

export const plinkoEngine = writable<PlinkoEngine | null>(null);

export const betAmount = writable<number>(45);

export const betAmountOfExistingBalls = writable<BetAmountOfExistingBalls>({});

export const rowCount = writable<RowCount>(8);

export const riskLevel = writable<RiskLevel>(RiskLevel.LOW);

export const winRecords = writable<WinRecord[]>([]);

/**
 * History of total profits. Should be updated whenever a new win record is pushed
 * to `winRecords` store.
 *
 * We deliberately don't use `derived(winRecords, ...)` to optimize performance.
 */
export const totalProfitHistory = writable<number[]>([0]);

/**
 * Game balance, which is saved to local storage.
 *
 * We only save the balance to local storage on browser `beforeunload` event instead of
 * on every balance change. This prevents unnecessary writes to local storage, which can
 * be slow on low-end devices.
 */
export const balance = writable<number>(DEFAULT_BALANCE);
