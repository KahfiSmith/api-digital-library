import { Request, Response } from 'express';
import { ResponseUtil } from '@/utils/response';
import * as LoansService from '@/services/loans.service';

export async function checkDueLoans(req: Request, res: Response) {
  const result = await LoansService.checkDueLoans();
  return ResponseUtil.success(res, 'Due loans checked', result);
}

export async function checkOverdueLoans(req: Request, res: Response) {
  const result = await LoansService.checkOverdueLoans();
  return ResponseUtil.success(res, 'Overdue loans processed', result);
}

export async function runDailyTasks(req: Request, res: Response) {
  const [dueResult, overdueResult] = await Promise.all([
    LoansService.checkDueLoans(),
    LoansService.checkOverdueLoans(),
  ]);

  return ResponseUtil.success(res, 'Daily tasks completed', {
    dueLoans: dueResult,
    overdueLoans: overdueResult,
  });
}