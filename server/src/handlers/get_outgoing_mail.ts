import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type OutgoingMail } from '../schema';

export const getOutgoingMail = async (): Promise<OutgoingMail[]> => {
  try {
    const results = await db.select()
      .from(outgoingMailTable)
      .execute();

    // Convert date strings back to Date objects
    return results.map(mail => ({
      ...mail,
      tanggal_surat: new Date(mail.tanggal_surat) // Convert string back to Date
    }));
  } catch (error) {
    console.error('Failed to fetch outgoing mail:', error);
    throw error;
  }
};