import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteIncomingMail = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    // Delete the incoming mail record by ID
    const result = await db.delete(incomingMailTable)
      .where(eq(incomingMailTable.id, input.id))
      .returning()
      .execute();

    // Return success based on whether a record was actually deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Incoming mail deletion failed:', error);
    throw error;
  }
};