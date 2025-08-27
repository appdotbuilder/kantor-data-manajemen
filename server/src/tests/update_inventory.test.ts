import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type CreateInventoryInput, type UpdateInventoryInput } from '../schema';
import { updateInventory } from '../handlers/update_inventory';
import { eq } from 'drizzle-orm';

// Test data for creating inventory items
const testCreateInput: CreateInventoryInput = {
  nama_barang: 'Original Item',
  jumlah: 50,
  deskripsi: 'Original description',
  kode_inventaris: 'INV-001',
  harga: 100.50,
  tempat: 'Original Location'
};

// Helper function to create an inventory item for testing
const createTestInventory = async (input: CreateInventoryInput = testCreateInput) => {
  const result = await db.insert(inventoryTable)
    .values({
      ...input,
      harga: input.harga.toString() // Convert to string for numeric column
    })
    .returning()
    .execute();
  
  return {
    ...result[0],
    harga: parseFloat(result[0].harga) // Convert back to number
  };
};

describe('updateInventory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of an inventory item', async () => {
    // Create initial inventory item
    const initialItem = await createTestInventory();

    const updateInput: UpdateInventoryInput = {
      id: initialItem.id,
      nama_barang: 'Updated Item',
      jumlah: 75,
      deskripsi: 'Updated description',
      kode_inventaris: 'INV-002',
      harga: 150.75,
      tempat: 'Updated Location'
    };

    const result = await updateInventory(updateInput);

    // Verify all fields are updated
    expect(result.id).toEqual(initialItem.id);
    expect(result.nama_barang).toEqual('Updated Item');
    expect(result.jumlah).toEqual(75);
    expect(result.deskripsi).toEqual('Updated description');
    expect(result.kode_inventaris).toEqual('INV-002');
    expect(result.harga).toEqual(150.75);
    expect(typeof result.harga).toBe('number');
    expect(result.tempat).toEqual('Updated Location');
    expect(result.created_at).toEqual(initialItem.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > initialItem.updated_at).toBe(true);
  });

  it('should update only specified fields', async () => {
    // Create initial inventory item
    const initialItem = await createTestInventory();

    const partialUpdateInput: UpdateInventoryInput = {
      id: initialItem.id,
      nama_barang: 'Partially Updated Item',
      harga: 200.25
    };

    const result = await updateInventory(partialUpdateInput);

    // Verify only specified fields are updated
    expect(result.nama_barang).toEqual('Partially Updated Item');
    expect(result.harga).toEqual(200.25);
    expect(typeof result.harga).toBe('number');
    
    // Verify other fields remain unchanged
    expect(result.jumlah).toEqual(initialItem.jumlah);
    expect(result.deskripsi).toEqual(initialItem.deskripsi);
    expect(result.kode_inventaris).toEqual(initialItem.kode_inventaris);
    expect(result.tempat).toEqual(initialItem.tempat);
    expect(result.created_at).toEqual(initialItem.created_at);
    expect(result.updated_at > initialItem.updated_at).toBe(true);
  });

  it('should update deskripsi to null', async () => {
    // Create initial inventory item
    const initialItem = await createTestInventory();

    const updateInput: UpdateInventoryInput = {
      id: initialItem.id,
      deskripsi: null
    };

    const result = await updateInventory(updateInput);

    expect(result.deskripsi).toBeNull();
    expect(result.updated_at > initialItem.updated_at).toBe(true);
  });

  it('should save updated data to database', async () => {
    // Create initial inventory item
    const initialItem = await createTestInventory();

    const updateInput: UpdateInventoryInput = {
      id: initialItem.id,
      nama_barang: 'Database Updated Item',
      jumlah: 99
    };

    await updateInventory(updateInput);

    // Query database directly to verify changes
    const dbItems = await db.select()
      .from(inventoryTable)
      .where(eq(inventoryTable.id, initialItem.id))
      .execute();

    expect(dbItems).toHaveLength(1);
    expect(dbItems[0].nama_barang).toEqual('Database Updated Item');
    expect(dbItems[0].jumlah).toEqual(99);
    expect(parseFloat(dbItems[0].harga)).toEqual(initialItem.harga);
    expect(dbItems[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when updating non-existent inventory item', async () => {
    const updateInput: UpdateInventoryInput = {
      id: 99999, // Non-existent ID
      nama_barang: 'This should fail'
    };

    await expect(updateInventory(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle numeric precision correctly', async () => {
    // Create initial inventory item
    const initialItem = await createTestInventory();

    const updateInput: UpdateInventoryInput = {
      id: initialItem.id,
      harga: 123.456789 // High precision number
    };

    const result = await updateInventory(updateInput);

    expect(typeof result.harga).toBe('number');
    expect(result.harga).toBeCloseTo(123.46, 2); // Should be rounded to 2 decimal places
  });

  it('should update inventory with minimal input', async () => {
    // Create initial inventory item
    const initialItem = await createTestInventory();

    const minimalUpdateInput: UpdateInventoryInput = {
      id: initialItem.id
    };

    const result = await updateInventory(minimalUpdateInput);

    // All original fields should remain the same except updated_at
    expect(result.nama_barang).toEqual(initialItem.nama_barang);
    expect(result.jumlah).toEqual(initialItem.jumlah);
    expect(result.deskripsi).toEqual(initialItem.deskripsi);
    expect(result.kode_inventaris).toEqual(initialItem.kode_inventaris);
    expect(result.harga).toEqual(initialItem.harga);
    expect(result.tempat).toEqual(initialItem.tempat);
    expect(result.created_at).toEqual(initialItem.created_at);
    expect(result.updated_at > initialItem.updated_at).toBe(true);
  });

  it('should handle zero values correctly', async () => {
    // Create initial inventory item
    const initialItem = await createTestInventory();

    const updateInput: UpdateInventoryInput = {
      id: initialItem.id,
      jumlah: 0, // This should not be allowed by Zod validation, but testing edge case
      harga: 0.01 // Minimum positive value
    };

    // Note: This test assumes the handler receives pre-validated input
    // In real usage, Zod validation would prevent jumlah: 0
    const result = await updateInventory(updateInput);

    expect(result.jumlah).toEqual(0);
    expect(result.harga).toEqual(0.01);
    expect(typeof result.harga).toBe('number');
  });
});