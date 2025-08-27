import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteInventory = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    // Delete inventory record
    const result = await db.delete(inventoryTable)
      .where(eq(inventoryTable.id, input.id))
      .returning()
      .execute();

    return { success: result.length > 0 };
  } catch (error) {
    console.error('Inventory deletion failed:', error);
    throw error;
  }
};