import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { incomingMailTable } from '../db/schema';
import { type CreateIncomingMailInput } from '../schema';
import { createIncomingMail } from '../handlers/create_incoming_mail';
import { eq, gte, between, and } from 'drizzle-orm';

// Simple test input
const testInput: CreateIncomingMailInput = {
  pengirim: 'PT. Contoh Perusahaan',
  tanggal_surat: new Date('2024-01-15'),
  nomor_surat: 'SUK/001/2024',
  perihal: 'Permohonan Kerjasama',
  lampiran: 'Proposal kerjasama.pdf'
};

describe('createIncomingMail', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an incoming mail', async () => {
    const result = await createIncomingMail(testInput);

    // Basic field validation
    expect(result.pengirim).toEqual('PT. Contoh Perusahaan');
    expect(result.tanggal_surat).toEqual(new Date('2024-01-15'));
    expect(result.nomor_surat).toEqual('SUK/001/2024');
    expect(result.perihal).toEqual('Permohonan Kerjasama');
    expect(result.lampiran).toEqual('Proposal kerjasama.pdf');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save incoming mail to database', async () => {
    const result = await createIncomingMail(testInput);

    // Query using proper drizzle syntax
    const incomingMails = await db.select()
      .from(incomingMailTable)
      .where(eq(incomingMailTable.id, result.id))
      .execute();

    expect(incomingMails).toHaveLength(1);
    expect(incomingMails[0].pengirim).toEqual('PT. Contoh Perusahaan');
    expect(incomingMails[0].tanggal_surat).toEqual('2024-01-15'); // Database stores as string
    expect(incomingMails[0].nomor_surat).toEqual('SUK/001/2024');
    expect(incomingMails[0].perihal).toEqual('Permohonan Kerjasama');
    expect(incomingMails[0].lampiran).toEqual('Proposal kerjasama.pdf');
    expect(incomingMails[0].created_at).toBeInstanceOf(Date);
    expect(incomingMails[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create incoming mail with null lampiran', async () => {
    const inputWithoutAttachment: CreateIncomingMailInput = {
      pengirim: 'Dinas Pendidikan',
      tanggal_surat: new Date('2024-02-10'),
      nomor_surat: 'DISDIK/123/2024',
      perihal: 'Undangan Rapat',
      lampiran: null
    };

    const result = await createIncomingMail(inputWithoutAttachment);

    expect(result.pengirim).toEqual('Dinas Pendidikan');
    expect(result.tanggal_surat).toEqual(new Date('2024-02-10'));
    expect(result.nomor_surat).toEqual('DISDIK/123/2024');
    expect(result.perihal).toEqual('Undangan Rapat');
    expect(result.lampiran).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should handle date fields correctly', async () => {
    const dateInput: CreateIncomingMailInput = {
      pengirim: 'Kantor Pajak',
      tanggal_surat: new Date('2024-03-20'),
      nomor_surat: 'KPP/456/2024',
      perihal: 'Pemberitahuan Pajak',
      lampiran: 'Form pajak.pdf'
    };

    const result = await createIncomingMail(dateInput);

    // Verify date handling
    expect(result.tanggal_surat).toEqual(new Date('2024-03-20'));
    expect(result.tanggal_surat).toBeInstanceOf(Date);
    
    // Verify timestamp fields are automatically set
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeCloseTo(new Date().getTime(), -2); // Within 100ms
  });

  it('should query incoming mails by date range correctly', async () => {
    // Create test incoming mail
    await createIncomingMail(testInput);

    // Test date filtering - demonstration of correct date handling
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Proper query building - build the complete query in one go
    const incomingMails = await db.select()
      .from(incomingMailTable)
      .where(
        and(
          gte(incomingMailTable.created_at, today),
          between(incomingMailTable.created_at, today, tomorrow)
        )
      )
      .execute();

    expect(incomingMails.length).toBeGreaterThan(0);
    incomingMails.forEach(mail => {
      expect(mail.created_at).toBeInstanceOf(Date);
      expect(mail.created_at >= today).toBe(true);
      expect(mail.created_at <= tomorrow).toBe(true);
    });
  });

  it('should create multiple incoming mails with different data', async () => {
    const input1: CreateIncomingMailInput = {
      pengirim: 'Bank Central Asia',
      tanggal_surat: new Date('2024-01-01'),
      nomor_surat: 'BCA/001/2024',
      perihal: 'Laporan Bulanan',
      lampiran: 'Laporan.pdf'
    };

    const input2: CreateIncomingMailInput = {
      pengirim: 'Kementerian Keuangan',
      tanggal_surat: new Date('2024-01-02'),
      nomor_surat: 'KEMKEU/002/2024',
      perihal: 'Peraturan Baru',
      lampiran: null
    };

    const result1 = await createIncomingMail(input1);
    const result2 = await createIncomingMail(input2);

    // Verify both records were created with correct data
    expect(result1.pengirim).toEqual('Bank Central Asia');
    expect(result1.nomor_surat).toEqual('BCA/001/2024');
    expect(result1.lampiran).toEqual('Laporan.pdf');

    expect(result2.pengirim).toEqual('Kementerian Keuangan');
    expect(result2.nomor_surat).toEqual('KEMKEU/002/2024');
    expect(result2.lampiran).toBeNull();

    // Verify different IDs
    expect(result1.id).not.toEqual(result2.id);

    // Verify both exist in database
    const allMails = await db.select().from(incomingMailTable).execute();
    expect(allMails).toHaveLength(2);
  });
});