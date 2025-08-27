import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type OutgoingMail } from '../schema';

export const getOutgoingMail = async (): Promise<OutgoingMail[]> => {
  try {
    // Fetch all outgoing mail records from database
    const results = await db.select()
      .from(outgoingMailTable)
      .execute();

    // Convert date strings to Date objects to match schema expectations
    return results.map(mail => ({
      ...mail,
      tanggal_surat: new Date(mail.tanggal_surat)
    }));
  } catch (error) {
    console.error('Failed to fetch outgoing mail:', error);
    throw error;
  }
};