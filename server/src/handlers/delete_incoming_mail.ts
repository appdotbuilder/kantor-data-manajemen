import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteIncomingMail = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    // Delete incoming mail record
    const result = await db.delete(incomingMailTable)
      .where(eq(incomingMailTable.id, input.id))
      .returning()
      .execute();

    return { success: result.length > 0 };
  } catch (error) {
    console.error('Incoming mail deletion failed:', error);
    throw error;
  }
};