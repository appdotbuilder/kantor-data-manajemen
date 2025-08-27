import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteInventory = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    // Delete the inventory item by ID
    const result = await db.delete(inventoryTable)
      .where(eq(inventoryTable.id, input.id))
      .execute();

    // Check if any rows were affected (item existed and was deleted)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Inventory deletion failed:', error);
    throw error;
  }
};