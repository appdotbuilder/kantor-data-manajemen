import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type DeleteInput, type CreateOutgoingMailInput } from '../schema';
import { deleteOutgoingMail } from '../handlers/delete_outgoing_mail';
import { eq } from 'drizzle-orm';

// Test input for creating outgoing mail
const testOutgoingMail: CreateOutgoingMailInput = {
  penerima: 'Test Recipient',
  tanggal_surat: new Date('2024-01-15'),
  nomor_surat: 'OUT/001/2024',
  perihal: 'Test Subject',
  lampiran: 'test-attachment.pdf'
};

// Helper function to create test outgoing mail
const createTestOutgoingMail = async (): Promise<number> => {
  const result = await db.insert(outgoingMailTable)
    .values({
      penerima: testOutgoingMail.penerima,
      tanggal_surat: '2024-01-15', // Date field expects string format
      nomor_surat: testOutgoingMail.nomor_surat,
      perihal: testOutgoingMail.perihal,
      lampiran: testOutgoingMail.lampiran
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('deleteOutgoingMail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete existing outgoing mail', async () => {
    // Create test outgoing mail
    const mailId = await createTestOutgoingMail();

    // Delete the outgoing mail
    const deleteInput: DeleteInput = { id: mailId };
    const result = await deleteOutgoingMail(deleteInput);

    // Verify success response
    expect(result.success).toBe(true);
  });

  it('should remove outgoing mail from database', async () => {
    // Create test outgoing mail
    const mailId = await createTestOutgoingMail();

    // Verify outgoing mail exists before deletion
    const beforeDelete = await db.select()
      .from(outgoingMailTable)
      .where(eq(outgoingMailTable.id, mailId))
      .execute();
    expect(beforeDelete).toHaveLength(1);

    // Delete the outgoing mail
    const deleteInput: DeleteInput = { id: mailId };
    await deleteOutgoingMail(deleteInput);

    // Verify outgoing mail is removed from database
    const afterDelete = await db.select()
      .from(outgoingMailTable)
      .where(eq(outgoingMailTable.id, mailId))
      .execute();
    expect(afterDelete).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent outgoing mail', async () => {
    // Try to delete non-existent outgoing mail
    const deleteInput: DeleteInput = { id: 99999 };
    const result = await deleteOutgoingMail(deleteInput);

    // Verify failure response
    expect(result.success).toBe(false);
  });

  it('should not affect other outgoing mails when deleting one', async () => {
    // Create multiple test outgoing mails
    const mail1Id = await createTestOutgoingMail();
    const mail2Id = await db.insert(outgoingMailTable)
      .values({
        penerima: 'Another Recipient',
        tanggal_surat: '2024-02-15', // Date field expects string format
        nomor_surat: 'OUT/002/2024',
        perihal: 'Another Subject',
        lampiran: null
      })
      .returning()
      .execute()
      .then(result => result[0].id);

    // Delete only the first outgoing mail
    const deleteInput: DeleteInput = { id: mail1Id };
    await deleteOutgoingMail(deleteInput);

    // Verify first mail is deleted
    const deletedMail = await db.select()
      .from(outgoingMailTable)
      .where(eq(outgoingMailTable.id, mail1Id))
      .execute();
    expect(deletedMail).toHaveLength(0);

    // Verify second mail still exists
    const remainingMail = await db.select()
      .from(outgoingMailTable)
      .where(eq(outgoingMailTable.id, mail2Id))
      .execute();
    expect(remainingMail).toHaveLength(1);
    expect(remainingMail[0].penerima).toEqual('Another Recipient');
    expect(remainingMail[0].nomor_surat).toEqual('OUT/002/2024');
  });

  it('should handle deletion with null lampiran field', async () => {
    // Create outgoing mail with null lampiran
    const mailId = await db.insert(outgoingMailTable)
      .values({
        penerima: 'Test Recipient No Attachment',
        tanggal_surat: '2024-03-15', // Date field expects string format
        nomor_surat: 'OUT/003/2024',
        perihal: 'No Attachment Subject',
        lampiran: null
      })
      .returning()
      .execute()
      .then(result => result[0].id);

    // Delete the outgoing mail
    const deleteInput: DeleteInput = { id: mailId };
    const result = await deleteOutgoingMail(deleteInput);

    // Verify successful deletion
    expect(result.success).toBe(true);

    // Verify mail is removed from database
    const deletedMail = await db.select()
      .from(outgoingMailTable)
      .where(eq(outgoingMailTable.id, mailId))
      .execute();
    expect(deletedMail).toHaveLength(0);
  });
});