import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type UpdateOutgoingMailInput, type OutgoingMail } from '../schema';
import { eq } from 'drizzle-orm';

export const updateOutgoingMail = async (input: UpdateOutgoingMailInput): Promise<OutgoingMail> => {
  try {
    // Build update object with only defined fields
    const updateData: any = {};
    
    if (input.penerima !== undefined) updateData.penerima = input.penerima;
    if (input.tanggal_surat !== undefined) updateData.tanggal_surat = input.tanggal_surat.toISOString().split('T')[0];
    if (input.nomor_surat !== undefined) updateData.nomor_surat = input.nomor_surat;
    if (input.perihal !== undefined) updateData.perihal = input.perihal;
    if (input.lampiran !== undefined) updateData.lampiran = input.lampiran;
    
    // Always update the timestamp
    updateData.updated_at = new Date();

    // Update outgoing mail record
    const result = await db.update(outgoingMailTable)
      .set(updateData)
      .where(eq(outgoingMailTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Outgoing mail with id ${input.id} not found`);
    }

    // Convert date string back to Date object
    const record = result[0];
    return {
      ...record,
      tanggal_surat: new Date(record.tanggal_surat) // Convert string back to Date
    };
  } catch (error) {
    console.error('Outgoing mail update failed:', error);
    throw error;
  }
};