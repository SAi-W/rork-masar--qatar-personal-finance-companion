import { createTRPCRouter, publicProcedure } from '../../../create-context';

export default createTRPCRouter({
  ping: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
});