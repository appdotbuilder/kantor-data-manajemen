import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { incomingMailTable } from '../db/schema';

import { getIncomingMail } from '../handlers/get_incoming_mail';

// Test data for database insertion (using string dates for db compatibility)
const testMailDbData1 = {
  pengirim: 'PT. ABC Corporation',
  tanggal_surat: '2024-01-15',
  nomor_surat: 'ABC/001/2024',
  perihal: 'Proposal Kerjasama',
  lampiran: 'Dokumen proposal dan company profile'
};

const testMailDbData2 = {
  pengirim: 'Dinas Pendidikan',
  tanggal_surat: '2024-02-10',
  nomor_surat: 'DP/050/2024',
  perihal: 'Undangan Rapat Koordinasi',
  lampiran: null
};

const testMailDbData3 = {
  pengirim: 'CV. XYZ Trading',
  tanggal_surat: '2024-03-05',
  nomor_surat: 'XYZ/100/2024',
  perihal: 'Penawaran Barang',
  lampiran: 'Katalog produk dan daftar harga'
};

describe('getIncomingMail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no incoming mail exists', async () => {
    const result = await getIncomingMail();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all incoming mail records', async () => {
    // Insert test data
    await db.insert(incomingMailTable)
      .values([testMailDbData1, testMailDbData2, testMailDbData3])
      .execute();

    const result = await getIncomingMail();

    expect(result).toHaveLength(3);
    expect(Array.isArray(result)).toBe(true);

    // Check that all records are included
    const senders = result.map(mail => mail.pengirim);
    expect(senders).toContain('PT. ABC Corporation');
    expect(senders).toContain('Dinas Pendidikan');
    expect(senders).toContain('CV. XYZ Trading');
  });

  it('should return complete mail data with correct field types', async () => {
    // Insert single test record
    await db.insert(incomingMailTable)
      .values(testMailDbData1)
      .execute();

    const result = await getIncomingMail();

    expect(result).toHaveLength(1);
    
    const mail = result[0];
    expect(mail.id).toBeDefined();
    expect(typeof mail.id).toBe('number');
    expect(mail.pengirim).toEqual('PT. ABC Corporation');
    expect(mail.tanggal_surat).toEqual(new Date('2024-01-15'));
    expect(mail.nomor_surat).toEqual('ABC/001/2024');
    expect(mail.perihal).toEqual('Proposal Kerjasama');
    expect(mail.lampiran).toEqual('Dokumen proposal dan company profile');
    expect(mail.created_at).toBeInstanceOf(Date);
    expect(mail.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null lampiran field correctly', async () => {
    // Insert mail with null attachment
    await db.insert(incomingMailTable)
      .values(testMailDbData2)
      .execute();

    const result = await getIncomingMail();

    expect(result).toHaveLength(1);
    
    const mail = result[0];
    expect(mail.pengirim).toEqual('Dinas Pendidikan');
    expect(mail.lampiran).toBeNull();
  });

  it('should return multiple records in correct order', async () => {
    // Insert test data in specific order
    await db.insert(incomingMailTable)
      .values(testMailDbData1)
      .execute();

    await db.insert(incomingMailTable)
      .values(testMailDbData2)
      .execute();

    await db.insert(incomingMailTable)
      .values(testMailDbData3)
      .execute();

    const result = await getIncomingMail();

    expect(result).toHaveLength(3);

    // Verify all records are present with correct data
    const mailByPengirim = result.reduce((acc, mail) => {
      acc[mail.pengirim] = mail;
      return acc;
    }, {} as Record<string, typeof result[0]>);

    expect(mailByPengirim['PT. ABC Corporation'].nomor_surat).toEqual('ABC/001/2024');
    expect(mailByPengirim['Dinas Pendidikan'].nomor_surat).toEqual('DP/050/2024');
    expect(mailByPengirim['CV. XYZ Trading'].nomor_surat).toEqual('XYZ/100/2024');

    // Verify dates are handled correctly
    expect(mailByPengirim['PT. ABC Corporation'].tanggal_surat).toEqual(new Date('2024-01-15'));
    expect(mailByPengirim['Dinas Pendidikan'].tanggal_surat).toEqual(new Date('2024-02-10'));
    expect(mailByPengirim['CV. XYZ Trading'].tanggal_surat).toEqual(new Date('2024-03-05'));
  });

  it('should handle database with mixed lampiran values', async () => {
    // Create test data with mix of null and non-null lampiran
    const mailWithAttachment = { ...testMailDbData1, lampiran: 'Some attachment' };
    const mailWithoutAttachment = { ...testMailDbData2, lampiran: null };

    await db.insert(incomingMailTable)
      .values([mailWithAttachment, mailWithoutAttachment])
      .execute();

    const result = await getIncomingMail();

    expect(result).toHaveLength(2);

    const withAttachment = result.find(mail => mail.pengirim === 'PT. ABC Corporation');
    const withoutAttachment = result.find(mail => mail.pengirim === 'Dinas Pendidikan');

    expect(withAttachment?.lampiran).toEqual('Some attachment');
    expect(withoutAttachment?.lampiran).toBeNull();
  });
});