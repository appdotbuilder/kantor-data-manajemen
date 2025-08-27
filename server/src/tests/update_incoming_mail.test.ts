import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type CreateIncomingMailInput, type UpdateIncomingMailInput } from '../schema';
import { updateIncomingMail } from '../handlers/update_incoming_mail';
import { eq } from 'drizzle-orm';

// Test input for creating initial incoming mail
const testCreateInput = {
  pengirim: 'PT ABC',
  tanggal_surat: '2024-01-15', // Use string format for database insertion
  nomor_surat: 'SM-001/2024',
  perihal: 'Pengajuan Proposal',
  lampiran: 'Dokumen Proposal'
};

// Test input for updating incoming mail
const testUpdateInput: UpdateIncomingMailInput = {
  id: 1,
  pengirim: 'PT XYZ Updated',
  perihal: 'Pengajuan Proposal - Revised',
  lampiran: null
};

describe('updateIncomingMail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update incoming mail successfully', async () => {
    // Create initial incoming mail
    const createdMail = await db.insert(incomingMailTable)
      .values(testCreateInput)
      .returning()
      .execute();

    const mailId = createdMail[0].id;
    
    // Update the incoming mail
    const updateData = {
      id: mailId,
      pengirim: 'PT XYZ Updated',
      perihal: 'Pengajuan Proposal - Revised',
      lampiran: null
    };

    const result = await updateIncomingMail(updateData);

    // Verify updated fields
    expect(result.id).toEqual(mailId);
    expect(result.pengirim).toEqual('PT XYZ Updated');
    expect(result.perihal).toEqual('Pengajuan Proposal - Revised');
    expect(result.lampiran).toBeNull();
    
    // Verify unchanged fields
    expect(result.tanggal_surat).toEqual(new Date('2024-01-15'));
    expect(result.nomor_surat).toEqual(testCreateInput.nomor_surat);
    
    // Verify timestamps
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
  });

  it('should save updated incoming mail to database', async () => {
    // Create initial incoming mail
    const createdMail = await db.insert(incomingMailTable)
      .values(testCreateInput)
      .returning()
      .execute();

    const mailId = createdMail[0].id;
    
    // Update the incoming mail
    const updateData = {
      id: mailId,
      pengirim: 'Updated Sender',
      nomor_surat: 'NEW-002/2024'
    };

    await updateIncomingMail(updateData);

    // Query database to verify update
    const updatedMails = await db.select()
      .from(incomingMailTable)
      .where(eq(incomingMailTable.id, mailId))
      .execute();

    expect(updatedMails).toHaveLength(1);
    const updatedMail = updatedMails[0];
    
    expect(updatedMail.pengirim).toEqual('Updated Sender');
    expect(updatedMail.nomor_surat).toEqual('NEW-002/2024');
    // Verify unchanged fields remain the same
    expect(updatedMail.perihal).toEqual(testCreateInput.perihal);
    expect(updatedMail.tanggal_surat).toEqual('2024-01-15'); // Database stores as string
    expect(updatedMail.lampiran).toEqual(testCreateInput.lampiran);
  });

  it('should update only provided fields', async () => {
    // Create initial incoming mail
    const createdMail = await db.insert(incomingMailTable)
      .values(testCreateInput)
      .returning()
      .execute();

    const mailId = createdMail[0].id;
    const originalCreatedAt = createdMail[0].created_at;
    
    // Update only perihal field
    const partialUpdateData = {
      id: mailId,
      perihal: 'Only Perihal Updated'
    };

    const result = await updateIncomingMail(partialUpdateData);

    // Verify only perihal was updated
    expect(result.perihal).toEqual('Only Perihal Updated');
    
    // Verify other fields remain unchanged
    expect(result.pengirim).toEqual(testCreateInput.pengirim);
    expect(result.tanggal_surat).toEqual(new Date('2024-01-15'));
    expect(result.nomor_surat).toEqual(testCreateInput.nomor_surat);
    expect(result.lampiran).toEqual(testCreateInput.lampiran);
    
    // Verify timestamps
    expect(result.created_at).toEqual(originalCreatedAt);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
  });

  it('should handle nullable lampiran field correctly', async () => {
    // Create initial incoming mail with lampiran
    const createdMail = await db.insert(incomingMailTable)
      .values({
        ...testCreateInput,
        lampiran: 'Initial Lampiran'
      })
      .returning()
      .execute();

    const mailId = createdMail[0].id;
    
    // Update to set lampiran to null
    const updateData = {
      id: mailId,
      lampiran: null
    };

    const result = await updateIncomingMail(updateData);

    expect(result.lampiran).toBeNull();
    
    // Update to set lampiran back to a string
    const updateDataWithLampiran = {
      id: mailId,
      lampiran: 'Updated Lampiran'
    };

    const resultWithLampiran = await updateIncomingMail(updateDataWithLampiran);
    expect(resultWithLampiran.lampiran).toEqual('Updated Lampiran');
  });

  it('should throw error when incoming mail not found', async () => {
    const nonExistentUpdateData = {
      id: 999,
      pengirim: 'Non-existent Mail'
    };

    await expect(updateIncomingMail(nonExistentUpdateData))
      .rejects.toThrow(/incoming mail with id 999 not found/i);
  });

  it('should update all fields when all are provided', async () => {
    // Create initial incoming mail
    const createdMail = await db.insert(incomingMailTable)
      .values(testCreateInput)
      .returning()
      .execute();

    const mailId = createdMail[0].id;
    
    // Update all fields
    const fullUpdateData = {
      id: mailId,
      pengirim: 'Completely New Sender',
      tanggal_surat: new Date('2024-02-20'),
      nomor_surat: 'FULL-999/2024',
      perihal: 'Completely New Subject',
      lampiran: 'New Attachment'
    };

    const result = await updateIncomingMail(fullUpdateData);

    expect(result.pengirim).toEqual('Completely New Sender');
    expect(result.tanggal_surat).toEqual(new Date('2024-02-20'));
    expect(result.nomor_surat).toEqual('FULL-999/2024');
    expect(result.perihal).toEqual('Completely New Subject');
    expect(result.lampiran).toEqual('New Attachment');
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});