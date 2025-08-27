import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type CreateIncomingMailInput, type DeleteInput } from '../schema';
import { deleteIncomingMail } from '../handlers/delete_incoming_mail';
import { eq } from 'drizzle-orm';

// Test input for creating incoming mail
const testIncomingMailInput: CreateIncomingMailInput = {
  pengirim: 'Test Sender',
  tanggal_surat: new Date('2024-01-15'),
  nomor_surat: 'IN/001/2024',
  perihal: 'Test Subject',
  lampiran: 'test-attachment.pdf'
};

describe('deleteIncomingMail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing incoming mail', async () => {
    // Create an incoming mail first
    const createResult = await db.insert(incomingMailTable)
      .values({
        pengirim: testIncomingMailInput.pengirim,
        tanggal_surat: testIncomingMailInput.tanggal_surat.toISOString().split('T')[0],
        nomor_surat: testIncomingMailInput.nomor_surat,
        perihal: testIncomingMailInput.perihal,
        lampiran: testIncomingMailInput.lampiran
      })
      .returning()
      .execute();

    const createdMail = createResult[0];
    const deleteInput: DeleteInput = { id: createdMail.id };

    // Delete the incoming mail
    const result = await deleteIncomingMail(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify the record no longer exists in database
    const remainingMails = await db.select()
      .from(incomingMailTable)
      .where(eq(incomingMailTable.id, createdMail.id))
      .execute();

    expect(remainingMails).toHaveLength(0);
  });

  it('should return false when deleting non-existent incoming mail', async () => {
    const deleteInput: DeleteInput = { id: 999 }; // Non-existent ID

    const result = await deleteIncomingMail(deleteInput);

    // Should return success: false when no record was deleted
    expect(result.success).toBe(false);
  });

  it('should not affect other incoming mail records', async () => {
    // Create two incoming mail records
    const firstMailResult = await db.insert(incomingMailTable)
      .values({
        pengirim: 'First Sender',
        tanggal_surat: '2024-01-15',
        nomor_surat: 'IN/001/2024',
        perihal: 'First Subject',
        lampiran: null
      })
      .returning()
      .execute();

    const secondMailResult = await db.insert(incomingMailTable)
      .values({
        pengirim: 'Second Sender',
        tanggal_surat: '2024-01-16',
        nomor_surat: 'IN/002/2024',
        perihal: 'Second Subject',
        lampiran: 'attachment.pdf'
      })
      .returning()
      .execute();

    const firstMail = firstMailResult[0];
    const secondMail = secondMailResult[0];

    // Delete only the first mail
    const deleteInput: DeleteInput = { id: firstMail.id };
    const result = await deleteIncomingMail(deleteInput);

    expect(result.success).toBe(true);

    // Verify first mail is deleted
    const firstMailCheck = await db.select()
      .from(incomingMailTable)
      .where(eq(incomingMailTable.id, firstMail.id))
      .execute();
    expect(firstMailCheck).toHaveLength(0);

    // Verify second mail still exists
    const secondMailCheck = await db.select()
      .from(incomingMailTable)
      .where(eq(incomingMailTable.id, secondMail.id))
      .execute();
    expect(secondMailCheck).toHaveLength(1);
    expect(secondMailCheck[0].pengirim).toEqual('Second Sender');
  });

  it('should handle deletion with null lampiran field', async () => {
    // Create incoming mail with null lampiran
    const createResult = await db.insert(incomingMailTable)
      .values({
        pengirim: 'Test Sender',
        tanggal_surat: '2024-01-15',
        nomor_surat: 'IN/001/2024',
        perihal: 'Test Subject',
        lampiran: null
      })
      .returning()
      .execute();

    const createdMail = createResult[0];
    const deleteInput: DeleteInput = { id: createdMail.id };

    // Delete the incoming mail
    const result = await deleteIncomingMail(deleteInput);

    expect(result.success).toBe(true);

    // Verify deletion
    const remainingMails = await db.select()
      .from(incomingMailTable)
      .where(eq(incomingMailTable.id, createdMail.id))
      .execute();

    expect(remainingMails).toHaveLength(0);
  });
});