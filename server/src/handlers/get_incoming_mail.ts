import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type IncomingMail } from '../schema';

export const getIncomingMail = async (): Promise<IncomingMail[]> => {
  try {
    const results = await db.select()
      .from(incomingMailTable)
      .execute();

    // Convert date strings back to Date objects
    return results.map(mail => ({
      ...mail,
      tanggal_surat: new Date(mail.tanggal_surat) // Convert string back to Date
    }));
  } catch (error) {
    console.error('Failed to fetch incoming mail:', error);
    throw error;
  }
};