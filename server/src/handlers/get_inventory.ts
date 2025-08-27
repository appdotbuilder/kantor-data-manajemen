import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type Inventory } from '../schema';

export const getInventory = async (): Promise<Inventory[]> => {
  try {
    const results = await db.select()
      .from(inventoryTable)
      .execute();

    // Convert numeric fields back to numbers for proper typing
    return results.map(inventory => ({
      ...inventory,
      harga: parseFloat(inventory.harga) // Convert numeric string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    throw error;
  }
};