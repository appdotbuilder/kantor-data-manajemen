import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type CreateInventoryInput, type Inventory } from '../schema';

export const createInventory = async (input: CreateInventoryInput): Promise<Inventory> => {
  try {
    // Insert inventory record
    const result = await db.insert(inventoryTable)
      .values({
        nama_barang: input.nama_barang,
        jumlah: input.jumlah,
        deskripsi: input.deskripsi,
        kode_inventaris: input.kode_inventaris,
        harga: input.harga.toString(), // Convert number to string for numeric column
        tempat: input.tempat
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const inventory = result[0];
    return {
      ...inventory,
      harga: parseFloat(inventory.harga) // Convert string back to number
    };
  } catch (error) {
    console.error('Inventory creation failed:', error);
    throw error;
  }
};