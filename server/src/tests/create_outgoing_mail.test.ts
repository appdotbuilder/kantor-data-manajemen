import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { outgoingMailTable } from '../db/schema';
import { type CreateOutgoingMailInput } from '../schema';
import { createOutgoingMail } from '../handlers/create_outgoing_mail';
import { eq, gte, between, and } from 'drizzle-orm';

// Simple test input
const testInput: CreateOutgoingMailInput = {
  penerima: 'PT. ABC Corporation',
  tanggal_surat: new Date('2024-01-15'),
  nomor_surat: 'OUT/2024/001',
  perihal: 'Pemberitahuan Kegiatan',
  lampiran: 'Dokumen pendukung'
};

describe('createOutgoingMail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an outgoing mail record', async () => {
    const result = await createOutgoingMail(testInput);

    // Basic field validation
    expect(result.penerima).toEqual('PT. ABC Corporation');
    expect(result.tanggal_surat).toEqual(testInput.tanggal_surat);
    expect(result.nomor_surat).toEqual('OUT/2024/001');
    expect(result.perihal).toEqual('Pemberitahuan Kegiatan');
    expect(result.lampiran).toEqual('Dokumen pendukung');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save outgoing mail to database', async () => {
    const result = await createOutgoingMail(testInput);

    // Query using proper drizzle syntax
    const outgoingMails = await db.select()
      .from(outgoingMailTable)
      .where(eq(outgoingMailTable.id, result.id))
      .execute();

    expect(outgoingMails).toHaveLength(1);
    expect(outgoingMails[0].penerima).toEqual('PT. ABC Corporation');
    expect(outgoingMails[0].tanggal_surat).toEqual('2024-01-15'); // Database stores as string
    expect(outgoingMails[0].nomor_surat).toEqual('OUT/2024/001');
    expect(outgoingMails[0].perihal).toEqual('Pemberitahuan Kegiatan');
    expect(outgoingMails[0].lampiran).toEqual('Dokumen pendukung');
    expect(outgoingMails[0].created_at).toBeInstanceOf(Date);
    expect(outgoingMails[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null lampiran', async () => {
    const inputWithoutLampiran: CreateOutgoingMailInput = {
      penerima: 'PT. XYZ Ltd',
      tanggal_surat: new Date('2024-02-20'),
      nomor_surat: 'OUT/2024/002',
      perihal: 'Undangan Rapat',
      lampiran: null
    };

    const result = await createOutgoingMail(inputWithoutLampiran);

    expect(result.penerima).toEqual('PT. XYZ Ltd');
    expect(result.lampiran).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should query outgoing mails by date range correctly', async () => {
    // Create test outgoing mail
    await createOutgoingMail(testInput);

    // Test date filtering - demonstration of correct date handling
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Direct query building without reassignment to avoid TypeScript issues
    const outgoingMails = await db.select()
      .from(outgoingMailTable)
      .where(
        and(
          gte(outgoingMailTable.created_at, yesterday),
          between(outgoingMailTable.created_at, yesterday, tomorrow)
        )
      )
      .execute();

    expect(outgoingMails.length).toBeGreaterThan(0);
    outgoingMails.forEach(mail => {
      expect(mail.created_at).toBeInstanceOf(Date);
      expect(mail.created_at >= yesterday).toBe(true);
      expect(mail.created_at <= tomorrow).toBe(true);
    });
  });

  it('should create multiple outgoing mails with different data', async () => {
    const input1: CreateOutgoingMailInput = {
      penerima: 'Dinas Pendidikan',
      tanggal_surat: new Date('2024-01-10'),
      nomor_surat: 'OUT/2024/003',
      perihal: 'Laporan Bulanan',
      lampiran: 'Data statistik'
    };

    const input2: CreateOutgoingMailInput = {
      penerima: 'BPKP Regional',
      tanggal_surat: new Date('2024-01-12'),
      nomor_surat: 'OUT/2024/004',
      perihal: 'Permintaan Audit',
      lampiran: null
    };

    const result1 = await createOutgoingMail(input1);
    const result2 = await createOutgoingMail(input2);

    // Verify both records are distinct
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.penerima).toEqual('Dinas Pendidikan');
    expect(result2.penerima).toEqual('BPKP Regional');
    expect(result1.lampiran).toEqual('Data statistik');
    expect(result2.lampiran).toBeNull();

    // Verify database contains both records
    const allMails = await db.select()
      .from(outgoingMailTable)
      .execute();

    expect(allMails).toHaveLength(2);
  });

  it('should handle special characters in text fields', async () => {
    const inputWithSpecialChars: CreateOutgoingMailInput = {
      penerima: 'PT. "Maju Bersama" & Co.',
      tanggal_surat: new Date('2024-03-01'),
      nomor_surat: 'OUT/2024/005-A',
      perihal: 'Kontrak & Perjanjian Kerja - Update 2024',
      lampiran: 'File: kontrak_2024.pdf (size: 2MB)'
    };

    const result = await createOutgoingMail(inputWithSpecialChars);

    expect(result.penerima).toEqual('PT. "Maju Bersama" & Co.');
    expect(result.perihal).toEqual('Kontrak & Perjanjian Kerja - Update 2024');
    expect(result.lampiran).toEqual('File: kontrak_2024.pdf (size: 2MB)');
    expect(result.id).toBeDefined();
  });
});