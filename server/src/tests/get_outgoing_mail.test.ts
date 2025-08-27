import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type CreateOutgoingMailInput } from '../schema';
import { getOutgoingMail } from '../handlers/get_outgoing_mail';

describe('getOutgoingMail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no outgoing mail exists', async () => {
    const result = await getOutgoingMail();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should fetch all outgoing mail records', async () => {
    // Create test outgoing mail records
    const testMail1: CreateOutgoingMailInput = {
      penerima: 'PT. ABC Company',
      tanggal_surat: new Date('2024-01-15'),
      nomor_surat: 'OUT/001/2024',
      perihal: 'Penawaran Kerjasama',
      lampiran: 'Brosur Perusahaan'
    };

    const testMail2: CreateOutgoingMailInput = {
      penerima: 'Universitas XYZ',
      tanggal_surat: new Date('2024-01-20'),
      nomor_surat: 'OUT/002/2024',
      perihal: 'Undangan Seminar',
      lampiran: null
    };

    // Insert test data
    await db.insert(outgoingMailTable)
      .values([
        {
          penerima: testMail1.penerima,
          tanggal_surat: testMail1.tanggal_surat.toISOString().split('T')[0],
          nomor_surat: testMail1.nomor_surat,
          perihal: testMail1.perihal,
          lampiran: testMail1.lampiran
        },
        {
          penerima: testMail2.penerima,
          tanggal_surat: testMail2.tanggal_surat.toISOString().split('T')[0],
          nomor_surat: testMail2.nomor_surat,
          perihal: testMail2.perihal,
          lampiran: testMail2.lampiran
        }
      ])
      .execute();

    const result = await getOutgoingMail();

    // Verify results
    expect(result).toHaveLength(2);

    // Check first mail
    const mail1 = result.find(m => m.nomor_surat === 'OUT/001/2024');
    expect(mail1).toBeDefined();
    expect(mail1!.penerima).toEqual('PT. ABC Company');
    expect(mail1!.perihal).toEqual('Penawaran Kerjasama');
    expect(mail1!.lampiran).toEqual('Brosur Perusahaan');
    expect(mail1!.tanggal_surat).toEqual(new Date('2024-01-15'));
    expect(mail1!.id).toBeDefined();
    expect(mail1!.created_at).toBeInstanceOf(Date);
    expect(mail1!.updated_at).toBeInstanceOf(Date);

    // Check second mail
    const mail2 = result.find(m => m.nomor_surat === 'OUT/002/2024');
    expect(mail2).toBeDefined();
    expect(mail2!.penerima).toEqual('Universitas XYZ');
    expect(mail2!.perihal).toEqual('Undangan Seminar');
    expect(mail2!.lampiran).toBeNull();
    expect(mail2!.tanggal_surat).toEqual(new Date('2024-01-20'));
    expect(mail2!.id).toBeDefined();
    expect(mail2!.created_at).toBeInstanceOf(Date);
    expect(mail2!.updated_at).toBeInstanceOf(Date);
  });

  it('should return records in database insertion order', async () => {
    // Create test data with different dates
    const oldMail = {
      penerima: 'Old Recipient',
      tanggal_surat: new Date('2024-01-01'),
      nomor_surat: 'OUT/OLD/2024',
      perihal: 'Old Subject',
      lampiran: null
    };

    const newMail = {
      penerima: 'New Recipient',
      tanggal_surat: new Date('2024-02-01'),
      nomor_surat: 'OUT/NEW/2024',
      perihal: 'New Subject',
      lampiran: 'New Attachment'
    };

    // Insert in specific order
    await db.insert(outgoingMailTable)
      .values([
        {
          ...oldMail,
          tanggal_surat: oldMail.tanggal_surat.toISOString().split('T')[0]
        },
        {
          ...newMail,
          tanggal_surat: newMail.tanggal_surat.toISOString().split('T')[0]
        }
      ])
      .execute();

    const result = await getOutgoingMail();

    expect(result).toHaveLength(2);
    // Results should maintain insertion order since no ORDER BY is specified
    expect(result[0].nomor_surat).toEqual('OUT/OLD/2024');
    expect(result[1].nomor_surat).toEqual('OUT/NEW/2024');
  });

  it('should handle nullable lampiran field correctly', async () => {
    // Test with null attachment
    const mailWithoutAttachment = {
      penerima: 'Test Recipient',
      tanggal_surat: new Date('2024-01-15'),
      nomor_surat: 'OUT/TEST/2024',
      perihal: 'Test Subject',
      lampiran: null
    };

    // Test with attachment
    const mailWithAttachment = {
      penerima: 'Test Recipient 2',
      tanggal_surat: new Date('2024-01-16'),
      nomor_surat: 'OUT/TEST2/2024',
      perihal: 'Test Subject 2',
      lampiran: 'Test Attachment'
    };

    await db.insert(outgoingMailTable)
      .values([
        {
          ...mailWithoutAttachment,
          tanggal_surat: mailWithoutAttachment.tanggal_surat.toISOString().split('T')[0]
        },
        {
          ...mailWithAttachment,
          tanggal_surat: mailWithAttachment.tanggal_surat.toISOString().split('T')[0]
        }
      ])
      .execute();

    const result = await getOutgoingMail();

    expect(result).toHaveLength(2);

    const mailNoAttachment = result.find(m => m.nomor_surat === 'OUT/TEST/2024');
    const mailWithAttach = result.find(m => m.nomor_surat === 'OUT/TEST2/2024');

    expect(mailNoAttachment!.lampiran).toBeNull();
    expect(mailWithAttach!.lampiran).toEqual('Test Attachment');
  });
});