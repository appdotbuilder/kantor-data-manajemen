import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type UpdateOutgoingMailInput, type OutgoingMail } from '../schema';
import { eq } from 'drizzle-orm';

export const updateOutgoingMail = async (input: UpdateOutgoingMailInput): Promise<OutgoingMail> => {
  try {
    // Build the update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.penerima !== undefined) {
      updateData['penerima'] = input.penerima;
    }
    if (input.tanggal_surat !== undefined) {
      updateData['tanggal_surat'] = input.tanggal_surat.toISOString().split('T')[0]; // Convert Date to YYYY-MM-DD string
    }
    if (input.nomor_surat !== undefined) {
      updateData['nomor_surat'] = input.nomor_surat;
    }
    if (input.perihal !== undefined) {
      updateData['perihal'] = input.perihal;
    }
    if (input.lampiran !== undefined) {
      updateData['lampiran'] = input.lampiran;
    }

    // Update outgoing mail record
    const result = await db.update(outgoingMailTable)
      .set(updateData)
      .where(eq(outgoingMailTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Outgoing mail with id ${input.id} not found`);
    }

    // Convert date field back to Date object for return
    const outgoingMail = result[0];
    return {
      ...outgoingMail,
      tanggal_surat: new Date(outgoingMail.tanggal_surat)
    };
  } catch (error) {
    console.error('Outgoing mail update failed:', error);
    throw error;
  }
};