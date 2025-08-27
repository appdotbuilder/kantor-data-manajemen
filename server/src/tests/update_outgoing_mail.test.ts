import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type UpdateOutgoingMailInput, type CreateOutgoingMailInput } from '../schema';
import { updateOutgoingMail } from '../handlers/update_outgoing_mail';
import { eq } from 'drizzle-orm';

// Helper function to create a test outgoing mail record
const createTestOutgoingMail = async (): Promise<number> => {
  const testMail = {
    penerima: 'Original Recipient',
    tanggal_surat: '2024-01-01', // Use string format for date field
    nomor_surat: 'SK-001/2024',
    perihal: 'Original Subject',
    lampiran: 'original-attachment.pdf',
    created_at: new Date(),
    updated_at: new Date()
  };

  const result = await db.insert(outgoingMailTable)
    .values(testMail)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateOutgoingMail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of outgoing mail', async () => {
    const mailId = await createTestOutgoingMail();

    const updateInput: UpdateOutgoingMailInput = {
      id: mailId,
      penerima: 'Updated Recipient',
      tanggal_surat: new Date('2024-02-01'),
      nomor_surat: 'SK-002/2024',
      perihal: 'Updated Subject',
      lampiran: 'updated-attachment.pdf'
    };

    const result = await updateOutgoingMail(updateInput);

    expect(result.id).toEqual(mailId);
    expect(result.penerima).toEqual('Updated Recipient');
    expect(result.tanggal_surat).toEqual(new Date('2024-02-01'));
    expect(result.tanggal_surat).toBeInstanceOf(Date);
    expect(result.nomor_surat).toEqual('SK-002/2024');
    expect(result.perihal).toEqual('Updated Subject');
    expect(result.lampiran).toEqual('updated-attachment.pdf');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    const mailId = await createTestOutgoingMail();

    const updateInput: UpdateOutgoingMailInput = {
      id: mailId,
      penerima: 'Partially Updated Recipient',
      perihal: 'Partially Updated Subject'
    };

    const result = await updateOutgoingMail(updateInput);

    expect(result.id).toEqual(mailId);
    expect(result.penerima).toEqual('Partially Updated Recipient');
    expect(result.perihal).toEqual('Partially Updated Subject');
    // These should remain unchanged
    expect(result.tanggal_surat).toEqual(new Date('2024-01-01'));
    expect(result.tanggal_surat).toBeInstanceOf(Date);
    expect(result.nomor_surat).toEqual('SK-001/2024');
    expect(result.lampiran).toEqual('original-attachment.pdf');
  });

  it('should set lampiran to null when explicitly provided', async () => {
    const mailId = await createTestOutgoingMail();

    const updateInput: UpdateOutgoingMailInput = {
      id: mailId,
      lampiran: null
    };

    const result = await updateOutgoingMail(updateInput);

    expect(result.id).toEqual(mailId);
    expect(result.lampiran).toBeNull();
    // Other fields should remain unchanged
    expect(result.penerima).toEqual('Original Recipient');
    expect(result.perihal).toEqual('Original Subject');
  });

  it('should update the updated_at timestamp', async () => {
    const mailId = await createTestOutgoingMail();

    // Get original timestamp
    const originalMail = await db.select()
      .from(outgoingMailTable)
      .where(eq(outgoingMailTable.id, mailId))
      .execute();

    const originalUpdatedAt = originalMail[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateOutgoingMailInput = {
      id: mailId,
      penerima: 'Updated Recipient'
    };

    const result = await updateOutgoingMail(updateInput);

    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should persist changes to database', async () => {
    const mailId = await createTestOutgoingMail();

    const updateInput: UpdateOutgoingMailInput = {
      id: mailId,
      penerima: 'Database Test Recipient',
      nomor_surat: 'SK-DB-001/2024'
    };

    await updateOutgoingMail(updateInput);

    // Verify changes in database
    const updatedMail = await db.select()
      .from(outgoingMailTable)
      .where(eq(outgoingMailTable.id, mailId))
      .execute();

    expect(updatedMail).toHaveLength(1);
    expect(updatedMail[0].penerima).toEqual('Database Test Recipient');
    expect(updatedMail[0].nomor_surat).toEqual('SK-DB-001/2024');
    expect(updatedMail[0].perihal).toEqual('Original Subject'); // Should remain unchanged
    // Note: tanggal_surat is stored as string in DB but converted to Date in handler response
  });

  it('should throw error for non-existent outgoing mail', async () => {
    const updateInput: UpdateOutgoingMailInput = {
      id: 999999, // Non-existent ID
      penerima: 'Test Recipient'
    };

    await expect(updateOutgoingMail(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle date updates correctly', async () => {
    const mailId = await createTestOutgoingMail();

    const newDate = new Date('2024-12-25');
    const updateInput: UpdateOutgoingMailInput = {
      id: mailId,
      tanggal_surat: newDate
    };

    const result = await updateOutgoingMail(updateInput);

    expect(result.tanggal_surat).toEqual(newDate);
    expect(result.tanggal_surat).toBeInstanceOf(Date);
  });

  it('should handle empty string updates', async () => {
    const mailId = await createTestOutgoingMail();

    const updateInput: UpdateOutgoingMailInput = {
      id: mailId,
      lampiran: ''
    };

    const result = await updateOutgoingMail(updateInput);

    expect(result.lampiran).toEqual('');
    expect(result.penerima).toEqual('Original Recipient'); // Should remain unchanged
  });
});