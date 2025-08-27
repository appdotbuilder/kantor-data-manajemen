import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type UpdateInventoryInput, type Inventory } from '../schema';
import { eq } from 'drizzle-orm';

export const updateInventory = async (input: UpdateInventoryInput): Promise<Inventory> => {
  try {
    // First, check if the inventory item exists
    const existingItem = await db.select()
      .from(inventoryTable)
      .where(eq(inventoryTable.id, input.id))
      .execute();

    if (existingItem.length === 0) {
      throw new Error(`Inventory item with id ${input.id} not found`);
    }

    // Prepare update values, only including defined fields
    const updateValues: any = {
      updated_at: new Date()
    };

    if (input.nama_barang !== undefined) {
      updateValues.nama_barang = input.nama_barang;
    }
    if (input.jumlah !== undefined) {
      updateValues.jumlah = input.jumlah;
    }
    if (input.deskripsi !== undefined) {
      updateValues.deskripsi = input.deskripsi;
    }
    if (input.kode_inventaris !== undefined) {
      updateValues.kode_inventaris = input.kode_inventaris;
    }
    if (input.harga !== undefined) {
      updateValues.harga = input.harga.toString(); // Convert number to string for numeric column
    }
    if (input.tempat !== undefined) {
      updateValues.tempat = input.tempat;
    }

    // Update the inventory item
    const result = await db.update(inventoryTable)
      .set(updateValues)
      .where(eq(inventoryTable.id, input.id))
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const updatedItem = result[0];
    return {
      ...updatedItem,
      harga: parseFloat(updatedItem.harga) // Convert string back to number
    };
  } catch (error) {
    console.error('Inventory update failed:', error);
    throw error;
  }
};