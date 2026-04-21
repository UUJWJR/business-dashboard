import { useCallback, useState } from 'react';
import type { PptReport } from '../types/ppt';

const STORAGE_KEY = 'dashboard-ppt-reports';
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB safety limit

function getAllReports(): PptReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PptReport[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function getReportById(id: string): PptReport | undefined {
  return getAllReports().find((r) => r.id === id);
}

function checkSize(report: PptReport): boolean {
  const all = getAllReports().filter((r) => r.id !== report.id);
  const next = [...all, report];
  const size = new Blob([JSON.stringify(next)]).size;
  return size <= MAX_STORAGE_SIZE;
}

function saveReport(report: PptReport): void {
  if (!checkSize(report)) {
    throw new Error('存储空间不足，请删除旧报告后重试');
  }
  const all = getAllReports().filter((r) => r.id !== report.id);
  all.unshift(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function deleteReport(id: string): void {
  const all = getAllReports().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function usePptStorage() {
  const [reports, setReports] = useState<PptReport[]>(getAllReports);

  const refresh = useCallback(() => {
    setReports(getAllReports());
  }, []);

  const save = useCallback((report: PptReport) => {
    saveReport(report);
    setReports(getAllReports());
  }, []);

  const remove = useCallback((id: string) => {
    deleteReport(id);
    setReports(getAllReports());
  }, []);

  const getById = useCallback((id: string) => {
    return getReportById(id);
  }, []);

  return { reports, save, remove, getById, refresh };
}
