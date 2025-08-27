import { z } from 'zod';

// Inventory schema
export const inventorySchema = z.object({
  id: z.number(),
  nama_barang: z.string(),
  jumlah: z.number().int(),
  deskripsi: z.string().nullable(),
  kode_inventaris: z.string(),
  harga: z.number(),
  tempat: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Inventory = z.infer<typeof inventorySchema>;

// Input schema for creating inventory
export const createInventoryInputSchema = z.object({
  nama_barang: z.string().min(1, "Nama barang harus diisi"),
  jumlah: z.number().int().positive("Jumlah harus berupa angka positif"),
  deskripsi: z.string().nullable(),
  kode_inventaris: z.string().min(1, "Kode inventaris harus diisi"),
  harga: z.number().positive("Harga harus berupa angka positif"),
  tempat: z.string().min(1, "Tempat harus diisi")
});

export type CreateInventoryInput = z.infer<typeof createInventoryInputSchema>;

// Input schema for updating inventory
export const updateInventoryInputSchema = z.object({
  id: z.number(),
  nama_barang: z.string().min(1).optional(),
  jumlah: z.number().int().positive().optional(),
  deskripsi: z.string().nullable().optional(),
  kode_inventaris: z.string().min(1).optional(),
  harga: z.number().positive().optional(),
  tempat: z.string().min(1).optional()
});

export type UpdateInventoryInput = z.infer<typeof updateInventoryInputSchema>;

// Incoming mail schema
export const incomingMailSchema = z.object({
  id: z.number(),
  pengirim: z.string(),
  tanggal_surat: z.coerce.date(),
  nomor_surat: z.string(),
  perihal: z.string(),
  lampiran: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type IncomingMail = z.infer<typeof incomingMailSchema>;

// Input schema for creating incoming mail
export const createIncomingMailInputSchema = z.object({
  pengirim: z.string().min(1, "Pengirim harus diisi"),
  tanggal_surat: z.coerce.date(),
  nomor_surat: z.string().min(1, "Nomor surat harus diisi"),
  perihal: z.string().min(1, "Perihal harus diisi"),
  lampiran: z.string().nullable()
});

export type CreateIncomingMailInput = z.infer<typeof createIncomingMailInputSchema>;

// Input schema for updating incoming mail
export const updateIncomingMailInputSchema = z.object({
  id: z.number(),
  pengirim: z.string().min(1).optional(),
  tanggal_surat: z.coerce.date().optional(),
  nomor_surat: z.string().min(1).optional(),
  perihal: z.string().min(1).optional(),
  lampiran: z.string().nullable().optional()
});

export type UpdateIncomingMailInput = z.infer<typeof updateIncomingMailInputSchema>;

// Outgoing mail schema
export const outgoingMailSchema = z.object({
  id: z.number(),
  penerima: z.string(),
  tanggal_surat: z.coerce.date(),
  nomor_surat: z.string(),
  perihal: z.string(),
  lampiran: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type OutgoingMail = z.infer<typeof outgoingMailSchema>;

// Input schema for creating outgoing mail
export const createOutgoingMailInputSchema = z.object({
  penerima: z.string().min(1, "Penerima harus diisi"),
  tanggal_surat: z.coerce.date(),
  nomor_surat: z.string().min(1, "Nomor surat harus diisi"),
  perihal: z.string().min(1, "Perihal harus diisi"),
  lampiran: z.string().nullable()
});

export type CreateOutgoingMailInput = z.infer<typeof createOutgoingMailInputSchema>;

// Input schema for updating outgoing mail
export const updateOutgoingMailInputSchema = z.object({
  id: z.number(),
  penerima: z.string().min(1).optional(),
  tanggal_surat: z.coerce.date().optional(),
  nomor_surat: z.string().min(1).optional(),
  perihal: z.string().min(1).optional(),
  lampiran: z.string().nullable().optional()
});

export type UpdateOutgoingMailInput = z.infer<typeof updateOutgoingMailInputSchema>;

// Delete schema (reusable for all entities)
export const deleteInputSchema = z.object({
  id: z.number()
});

export type DeleteInput = z.infer<typeof deleteInputSchema>;