import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type CreateInventoryInput } from '../schema';
import { createInventory } from '../handlers/create_inventory';
import { eq, gte, between, and } from 'drizzle-orm';

// Simple test input
const testInput: CreateInventoryInput = {
  nama_barang: 'Test Item',
  jumlah: 10,
  deskripsi: 'A test inventory item',
  kode_inventaris: 'TEST001',
  harga: 25000.50,
  tempat: 'Warehouse A'
};

describe('createInventory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an inventory item', async () => {
    const result = await createInventory(testInput);

    // Basic field validation
    expect(result.nama_barang).toEqual('Test Item');
    expect(result.jumlah).toEqual(10);
    expect(result.deskripsi).toEqual('A test inventory item');
    expect(result.kode_inventaris).toEqual('TEST001');
    expect(result.harga).toEqual(25000.50);
    expect(result.tempat).toEqual('Warehouse A');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save inventory item to database', async () => {
    const result = await createInventory(testInput);

    // Query using proper drizzle syntax
    const inventoryItems = await db.select()
      .from(inventoryTable)
      .where(eq(inventoryTable.id, result.id))
      .execute();

    expect(inventoryItems).toHaveLength(1);
    expect(inventoryItems[0].nama_barang).toEqual('Test Item');
    expect(inventoryItems[0].jumlah).toEqual(10);
    expect(inventoryItems[0].deskripsi).toEqual('A test inventory item');
    expect(inventoryItems[0].kode_inventaris).toEqual('TEST001');
    expect(parseFloat(inventoryItems[0].harga)).toEqual(25000.50);
    expect(inventoryItems[0].tempat).toEqual('Warehouse A');
    expect(inventoryItems[0].created_at).toBeInstanceOf(Date);
    expect(inventoryItems[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description', async () => {
    const inputWithNullDesc: CreateInventoryInput = {
      ...testInput,
      deskripsi: null
    };

    const result = await createInventory(inputWithNullDesc);

    expect(result.deskripsi).toBeNull();
    expect(result.nama_barang).toEqual('Test Item');
    expect(result.harga).toEqual(25000.50);
  });

  it('should handle different numeric values correctly', async () => {
    const inputWithDifferentNumbers: CreateInventoryInput = {
      nama_barang: 'Expensive Item',
      jumlah: 5,
      deskripsi: 'High value item',
      kode_inventaris: 'EXP001',
      harga: 999999.99,
      tempat: 'Safe'
    };

    const result = await createInventory(inputWithDifferentNumbers);

    expect(result.jumlah).toEqual(5);
    expect(result.harga).toEqual(999999.99);
    expect(typeof result.harga).toEqual('number');
    expect(typeof result.jumlah).toEqual('number');
  });

  it('should query inventory items by date range correctly', async () => {
    // Create test inventory item
    await createInventory(testInput);

    // Test date filtering - demonstration of correct date handling
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Proper query building with correct date range
    const inventoryItems = await db.select()
      .from(inventoryTable)
      .where(
        and(
          gte(inventoryTable.created_at, yesterday),
          between(inventoryTable.created_at, yesterday, tomorrow)
        )
      )
      .execute();

    expect(inventoryItems.length).toBeGreaterThan(0);
    inventoryItems.forEach(item => {
      expect(item.created_at).toBeInstanceOf(Date);
      expect(item.created_at >= yesterday).toBe(true);
      expect(item.created_at <= tomorrow).toBe(true);
    });
  });

  it('should create multiple inventory items independently', async () => {
    const input1: CreateInventoryInput = {
      nama_barang: 'Item 1',
      jumlah: 5,
      deskripsi: 'First item',
      kode_inventaris: 'ITEM001',
      harga: 100.00,
      tempat: 'Storage A'
    };

    const input2: CreateInventoryInput = {
      nama_barang: 'Item 2',
      jumlah: 15,
      deskripsi: 'Second item',
      kode_inventaris: 'ITEM002',
      harga: 200.50,
      tempat: 'Storage B'
    };

    const result1 = await createInventory(input1);
    const result2 = await createInventory(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.nama_barang).toEqual('Item 1');
    expect(result2.nama_barang).toEqual('Item 2');
    expect(result1.harga).toEqual(100.00);
    expect(result2.harga).toEqual(200.50);

    // Verify both items are in database
    const allItems = await db.select().from(inventoryTable).execute();
    expect(allItems).toHaveLength(2);
  });
});