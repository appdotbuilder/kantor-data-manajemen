import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type CreateIncomingMailInput, type IncomingMail } from '../schema';

export const createIncomingMail = async (input: CreateIncomingMailInput): Promise<IncomingMail> => {
  try {
    // Insert incoming mail record
    const result = await db.insert(incomingMailTable)
      .values({
        pengirim: input.pengirim,
        tanggal_surat: input.tanggal_surat.toISOString().split('T')[0], // Convert Date to string
        nomor_surat: input.nomor_surat,
        perihal: input.perihal,
        lampiran: input.lampiran
      })
      .returning()
      .execute();

    // Convert date string back to Date object
    const record = result[0];
    return {
      ...record,
      tanggal_surat: new Date(record.tanggal_surat) // Convert string back to Date
    };
  } catch (error) {
    console.error('Incoming mail creation failed:', error);
    throw error;
  }
};