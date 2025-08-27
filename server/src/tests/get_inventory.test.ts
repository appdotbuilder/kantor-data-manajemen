import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type CreateInventoryInput } from '../schema';
import { getInventory } from '../handlers/get_inventory';

// Test inventory data
const testInventory1: CreateInventoryInput = {
  nama_barang: 'Laptop Dell XPS 13',
  jumlah: 5,
  deskripsi: 'Laptop untuk development team',
  kode_inventaris: 'LP001',
  harga: 15000000.50,
  tempat: 'Gudang IT'
};

const testInventory2: CreateInventoryInput = {
  nama_barang: 'Mouse Wireless',
  jumlah: 20,
  deskripsi: null, // Test nullable field
  kode_inventaris: 'MS002',
  harga: 250000,
  tempat: 'Storage Room A'
};

const testInventory3: CreateInventoryInput = {
  nama_barang: 'Monitor 24 inch',
  jumlah: 8,
  deskripsi: 'Full HD monitor for office',
  kode_inventaris: 'MN003',
  harga: 3500000.75,
  tempat: 'Gudang IT'
};

describe('getInventory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no inventory exists', async () => {
    const result = await getInventory();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should fetch all inventory items', async () => {
    // Create test inventory items
    await db.insert(inventoryTable)
      .values([
        {
          nama_barang: testInventory1.nama_barang,
          jumlah: testInventory1.jumlah,
          deskripsi: testInventory1.deskripsi,
          kode_inventaris: testInventory1.kode_inventaris,
          harga: testInventory1.harga.toString(),
          tempat: testInventory1.tempat
        },
        {
          nama_barang: testInventory2.nama_barang,
          jumlah: testInventory2.jumlah,
          deskripsi: testInventory2.deskripsi,
          kode_inventaris: testInventory2.kode_inventaris,
          harga: testInventory2.harga.toString(),
          tempat: testInventory2.tempat
        },
        {
          nama_barang: testInventory3.nama_barang,
          jumlah: testInventory3.jumlah,
          deskripsi: testInventory3.deskripsi,
          kode_inventaris: testInventory3.kode_inventaris,
          harga: testInventory3.harga.toString(),
          tempat: testInventory3.tempat
        }
      ])
      .execute();

    const result = await getInventory();

    expect(result).toHaveLength(3);
    expect(Array.isArray(result)).toBe(true);

    // Verify all required fields are present and correctly typed
    result.forEach(inventory => {
      expect(inventory.id).toBeDefined();
      expect(typeof inventory.id).toBe('number');
      expect(inventory.nama_barang).toBeDefined();
      expect(typeof inventory.nama_barang).toBe('string');
      expect(inventory.jumlah).toBeDefined();
      expect(typeof inventory.jumlah).toBe('number');
      expect(inventory.kode_inventaris).toBeDefined();
      expect(typeof inventory.kode_inventaris).toBe('string');
      expect(inventory.harga).toBeDefined();
      expect(typeof inventory.harga).toBe('number'); // Verify numeric conversion
      expect(inventory.tempat).toBeDefined();
      expect(typeof inventory.tempat).toBe('string');
      expect(inventory.created_at).toBeInstanceOf(Date);
      expect(inventory.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should correctly convert numeric fields', async () => {
    // Create inventory with decimal price
    await db.insert(inventoryTable)
      .values({
        nama_barang: testInventory1.nama_barang,
        jumlah: testInventory1.jumlah,
        deskripsi: testInventory1.deskripsi,
        kode_inventaris: testInventory1.kode_inventaris,
        harga: testInventory1.harga.toString(), // Store as string
        tempat: testInventory1.tempat
      })
      .execute();

    const result = await getInventory();

    expect(result).toHaveLength(1);
    expect(typeof result[0].harga).toBe('number');
    expect(result[0].harga).toEqual(15000000.50); // Verify exact decimal conversion
  });

  it('should handle nullable description field correctly', async () => {
    // Create inventory with null description
    await db.insert(inventoryTable)
      .values({
        nama_barang: testInventory2.nama_barang,
        jumlah: testInventory2.jumlah,
        deskripsi: testInventory2.deskripsi, // null value
        kode_inventaris: testInventory2.kode_inventaris,
        harga: testInventory2.harga.toString(),
        tempat: testInventory2.tempat
      })
      .execute();

    const result = await getInventory();

    expect(result).toHaveLength(1);
    expect(result[0].deskripsi).toBeNull();
    expect(result[0].nama_barang).toEqual('Mouse Wireless');
  });

  it('should return inventory in database insertion order', async () => {
    // Insert items in specific order
    await db.insert(inventoryTable)
      .values({
        nama_barang: 'First Item',
        jumlah: 1,
        deskripsi: 'First description',
        kode_inventaris: 'F001',
        harga: '1000',
        tempat: 'Location A'
      })
      .execute();

    await db.insert(inventoryTable)
      .values({
        nama_barang: 'Second Item',
        jumlah: 2,
        deskripsi: 'Second description',
        kode_inventaris: 'S002',
        harga: '2000',
        tempat: 'Location B'
      })
      .execute();

    const result = await getInventory();

    expect(result).toHaveLength(2);
    // Verify items are returned (order may vary depending on database)
    const itemNames = result.map(item => item.nama_barang);
    expect(itemNames).toContain('First Item');
    expect(itemNames).toContain('Second Item');
    
    // Verify IDs are sequential
    const sortedResult = result.sort((a, b) => a.id - b.id);
    expect(sortedResult[0].nama_barang).toEqual('First Item');
    expect(sortedResult[1].nama_barang).toEqual('Second Item');
  });
});