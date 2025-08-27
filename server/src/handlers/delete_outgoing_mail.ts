import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function deleteOutgoingMail(input: DeleteInput): Promise<{ success: boolean }> {
  try {
    // Delete the outgoing mail record
    const result = await db.delete(outgoingMailTable)
      .where(eq(outgoingMailTable.id, input.id))
      .execute();

    // Return success based on whether a record was actually deleted
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Delete outgoing mail failed:', error);
    throw error;
  }
}