import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteOutgoingMail = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    // Delete outgoing mail record
    const result = await db.delete(outgoingMailTable)
      .where(eq(outgoingMailTable.id, input.id))
      .returning()
      .execute();

    return { success: result.length > 0 };
  } catch (error) {
    console.error('Outgoing mail deletion failed:', error);
    throw error;
  }
};