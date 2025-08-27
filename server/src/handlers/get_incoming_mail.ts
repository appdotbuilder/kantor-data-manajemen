import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type IncomingMail } from '../schema';

export const getIncomingMail = async (): Promise<IncomingMail[]> => {
  try {
    // Fetch all incoming mail records
    const results = await db.select()
      .from(incomingMailTable)
      .execute();

    // Convert date strings to Date objects to match schema expectations
    return results.map(mail => ({
      ...mail,
      tanggal_surat: new Date(mail.tanggal_surat)
    }));
  } catch (error) {
    console.error('Failed to fetch incoming mail:', error);
    throw error;
  }
};