import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createInventoryInputSchema,
  updateInventoryInputSchema,
  createIncomingMailInputSchema,
  updateIncomingMailInputSchema,
  createOutgoingMailInputSchema,
  updateOutgoingMailInputSchema,
  deleteInputSchema,
  loginInputSchema
} from './schema';

// Import handlers
import { createInventory } from './handlers/create_inventory';
import { getInventory } from './handlers/get_inventory';
import { updateInventory } from './handlers/update_inventory';
import { deleteInventory } from './handlers/delete_inventory';
import { createIncomingMail } from './handlers/create_incoming_mail';
import { getIncomingMail } from './handlers/get_incoming_mail';
import { updateIncomingMail } from './handlers/update_incoming_mail';
import { deleteIncomingMail } from './handlers/delete_incoming_mail';
import { createOutgoingMail } from './handlers/create_outgoing_mail';
import { getOutgoingMail } from './handlers/get_outgoing_mail';
import { updateOutgoingMail } from './handlers/update_outgoing_mail';
import { deleteOutgoingMail } from './handlers/delete_outgoing_mail';
import { login } from './handlers/login';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication
  login: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => login(input)),

  // Inventory management routes
  inventory: router({
    create: publicProcedure
      .input(createInventoryInputSchema)
      .mutation(({ input }) => createInventory(input)),
    getAll: publicProcedure
      .query(() => getInventory()),
    update: publicProcedure
      .input(updateInventoryInputSchema)
      .mutation(({ input }) => updateInventory(input)),
    delete: publicProcedure
      .input(deleteInputSchema)
      .mutation(({ input }) => deleteInventory(input))
  }),

  // Incoming mail management routes
  incomingMail: router({
    create: publicProcedure
      .input(createIncomingMailInputSchema)
      .mutation(({ input }) => createIncomingMail(input)),
    getAll: publicProcedure
      .query(() => getIncomingMail()),
    update: publicProcedure
      .input(updateIncomingMailInputSchema)
      .mutation(({ input }) => updateIncomingMail(input)),
    delete: publicProcedure
      .input(deleteInputSchema)
      .mutation(({ input }) => deleteIncomingMail(input))
  }),

  // Outgoing mail management routes
  outgoingMail: router({
    create: publicProcedure
      .input(createOutgoingMailInputSchema)
      .mutation(({ input }) => createOutgoingMail(input)),
    getAll: publicProcedure
      .query(() => getOutgoingMail()),
    update: publicProcedure
      .input(updateOutgoingMailInputSchema)
      .mutation(({ input }) => updateOutgoingMail(input)),
    delete: publicProcedure
      .input(deleteInputSchema)
      .mutation(({ input }) => deleteOutgoingMail(input))
  })
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();