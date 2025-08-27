import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type CreateOutgoingMailInput, type OutgoingMail } from '../schema';

export const createOutgoingMail = async (input: CreateOutgoingMailInput): Promise<OutgoingMail> => {
  try {
    // Insert outgoing mail record
    const result = await db.insert(outgoingMailTable)
      .values({
        penerima: input.penerima,
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
    console.error('Outgoing mail creation failed:', error);
    throw error;
  }
};