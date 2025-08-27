import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type UpdateIncomingMailInput, type IncomingMail } from '../schema';
import { eq } from 'drizzle-orm';

export const updateIncomingMail = async (input: UpdateIncomingMailInput): Promise<IncomingMail> => {
  try {
    // First, check if the incoming mail exists
    const existingMail = await db.select()
      .from(incomingMailTable)
      .where(eq(incomingMailTable.id, input.id))
      .execute();

    if (existingMail.length === 0) {
      throw new Error(`Incoming mail with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof incomingMailTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.pengirim !== undefined) {
      updateData.pengirim = input.pengirim;
    }

    if (input.tanggal_surat !== undefined) {
      updateData.tanggal_surat = input.tanggal_surat.toISOString().split('T')[0]; // Convert Date to YYYY-MM-DD string
    }

    if (input.nomor_surat !== undefined) {
      updateData.nomor_surat = input.nomor_surat;
    }

    if (input.perihal !== undefined) {
      updateData.perihal = input.perihal;
    }

    if (input.lampiran !== undefined) {
      updateData.lampiran = input.lampiran;
    }

    // Update the incoming mail record
    const result = await db.update(incomingMailTable)
      .set(updateData)
      .where(eq(incomingMailTable.id, input.id))
      .returning()
      .execute();

    // Convert date string back to Date object for return
    const updatedMail = result[0];
    return {
      ...updatedMail,
      tanggal_surat: new Date(updatedMail.tanggal_surat)
    };
  } catch (error) {
    console.error('Incoming mail update failed:', error);
    throw error;
  }
};