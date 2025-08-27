import { serial, text, pgTable, timestamp, numeric, integer, date } from 'drizzle-orm/pg-core';

// Inventory table
export const inventoryTable = pgTable('inventory', {
  id: serial('id').primaryKey(),
  nama_barang: text('nama_barang').notNull(),
  jumlah: integer('jumlah').notNull(),
  deskripsi: text('deskripsi'), // Nullable by default
  kode_inventaris: text('kode_inventaris').notNull(),
  harga: numeric('harga', { precision: 12, scale: 2 }).notNull(),
  tempat: text('tempat').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Incoming mail table
export const incomingMailTable = pgTable('incoming_mail', {
  id: serial('id').primaryKey(),
  pengirim: text('pengirim').notNull(),
  tanggal_surat: date('tanggal_surat').notNull(),
  nomor_surat: text('nomor_surat').notNull(),
  perihal: text('perihal').notNull(),
  lampiran: text('lampiran'), // Nullable by default (optional)
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Outgoing mail table
export const outgoingMailTable = pgTable('outgoing_mail', {
  id: serial('id').primaryKey(),
  penerima: text('penerima').notNull(),
  tanggal_surat: date('tanggal_surat').notNull(),
  nomor_surat: text('nomor_surat').notNull(),
  perihal: text('perihal').notNull(),
  lampiran: text('lampiran'), // Nullable by default (optional)
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type Inventory = typeof inventoryTable.$inferSelect;
export type NewInventory = typeof inventoryTable.$inferInsert;

export type IncomingMail = typeof incomingMailTable.$inferSelect;
export type NewIncomingMail = typeof incomingMailTable.$inferInsert;

export type OutgoingMail = typeof outgoingMailTable.$inferSelect;
export type NewOutgoingMail = typeof outgoingMailTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  inventory: inventoryTable,
  incomingMail: incomingMailTable,
  outgoingMail: outgoingMailTable
};