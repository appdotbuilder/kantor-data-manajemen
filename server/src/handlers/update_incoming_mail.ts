import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type UpdateIncomingMailInput, type IncomingMail } from '../schema';
import { eq } from 'drizzle-orm';

export const updateIncomingMail = async (input: UpdateIncomingMailInput): Promise<IncomingMail> => {
  try {
    // Build update object with only defined fields
    const updateData: any = {};
    
    if (input.pengirim !== undefined) updateData.pengirim = input.pengirim;
    if (input.tanggal_surat !== undefined) updateData.tanggal_surat = input.tanggal_surat.toISOString().split('T')[0];
    if (input.nomor_surat !== undefined) updateData.nomor_surat = input.nomor_surat;
    if (input.perihal !== undefined) updateData.perihal = input.perihal;
    if (input.lampiran !== undefined) updateData.lampiran = input.lampiran;
    
    // Always update the timestamp
    updateData.updated_at = new Date();

    // Update incoming mail record
    const result = await db.update(incomingMailTable)
      .set(updateData)
      .where(eq(incomingMailTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Incoming mail with id ${input.id} not found`);
    }

    // Convert date string back to Date object
    const record = result[0];
    return {
      ...record,
      tanggal_surat: new Date(record.tanggal_surat) // Convert string back to Date
    };
  } catch (error) {
    console.error('Incoming mail update failed:', error);
    throw error;
  }
};