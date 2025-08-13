import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import chatRoute from "./routes/ai-coach/chat/route";
import { loginProcedure } from "./routes/auth/login/route";
import { registerProcedure } from "./routes/auth/register/route";
import publicRouter from './routes/public/ping/route';
import { createAccountProcedure } from './routes/accounts/create/route';
import { listAccountsProcedure } from './routes/accounts/list/route';
import { createExpenseProcedure } from './routes/expenses/create/route';
import { listExpensesProcedure } from './routes/expenses/list/route';
import { updateSalarySettingsProcedure } from './routes/salary/update-settings/route';
import { processSalaryDepositProcedure } from './routes/salary/process-deposit/route';
import { createSideIncomeProcedure } from './routes/side-income/create/route';
import { listSideIncomesProcedure } from './routes/side-income/list/route';
import { addMoneyProcedure } from './routes/transactions/add-money/route';
import { createSubscriptionProcedure } from './routes/subscriptions/create/route';
import { updateSubscriptionProcedure } from './routes/subscriptions/update/route';
import { listSubscriptionsProcedure } from './routes/subscriptions/list/route';
import { createDealProcedure } from './routes/deals/create/route';
import { listDealsProcedure } from './routes/deals/list/route';
import { upvoteDealProcedure } from './routes/deals/upvote/route';
import { extractReceiptProcedure } from './routes/receipts/extract/route';

export const appRouter = createTRPCRouter({
  public: publicRouter,
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  aiCoach: createTRPCRouter({
    chat: chatRoute,
  }),
  auth: createTRPCRouter({
    login: loginProcedure,
    register: registerProcedure,
  }),
  accounts: createTRPCRouter({
    create: createAccountProcedure,
    list: listAccountsProcedure,
  }),
  expenses: createTRPCRouter({
    create: createExpenseProcedure,
    list: listExpensesProcedure,
  }),
  salary: createTRPCRouter({
    updateSettings: updateSalarySettingsProcedure,
    processDeposit: processSalaryDepositProcedure,
  }),
  sideIncome: createTRPCRouter({
    create: createSideIncomeProcedure,
    list: listSideIncomesProcedure,
  }),
  transactions: createTRPCRouter({
    addMoney: addMoneyProcedure,
  }),
  subscriptions: createTRPCRouter({
    create: createSubscriptionProcedure,
    update: updateSubscriptionProcedure,
    list: listSubscriptionsProcedure,
  }),
  deals: createTRPCRouter({
    create: createDealProcedure,
    list: listDealsProcedure,
    upvote: upvoteDealProcedure,
  }),
  receipts: createTRPCRouter({
    extract: extractReceiptProcedure,
  }),
});

export type AppRouter = typeof appRouter;