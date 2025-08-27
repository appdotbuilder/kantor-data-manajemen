import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type UpdateInventoryInput, type Inventory } from '../schema';
import { eq } from 'drizzle-orm';

export const updateInventory = async (input: UpdateInventoryInput): Promise<Inventory> => {
  try {
    // Build update object with only defined fields
    const updateData: any = {};
    
    if (input.nama_barang !== undefined) updateData.nama_barang = input.nama_barang;
    if (input.jumlah !== undefined) updateData.jumlah = input.jumlah;
    if (input.deskripsi !== undefined) updateData.deskripsi = input.deskripsi;
    if (input.kode_inventaris !== undefined) updateData.kode_inventaris = input.kode_inventaris;
    if (input.harga !== undefined) updateData.harga = input.harga.toString(); // Convert to string
    if (input.tempat !== undefined) updateData.tempat = input.tempat;
    
    // Always update the timestamp
    updateData.updated_at = new Date();

    // Update inventory record
    const result = await db.update(inventoryTable)
      .set(updateData)
      .where(eq(inventoryTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Inventory with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const inventory = result[0];
    return {
      ...inventory,
      harga: parseFloat(inventory.harga) // Convert string back to number
    };
  } catch (error) {
    console.error('Inventory update failed:', error);
    throw error;
  }
};