import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { inventoryTable } from '../db/schema';
import { type CreateInventoryInput, type DeleteInput } from '../schema';
import { deleteInventory } from '../handlers/delete_inventory';
import { eq } from 'drizzle-orm';

// Test input for creating inventory items
const testInventoryInput: CreateInventoryInput = {
  nama_barang: 'Test Item',
  jumlah: 50,
  deskripsi: 'A test inventory item',
  kode_inventaris: 'TEST001',
  harga: 25.99,
  tempat: 'Warehouse A'
};

describe('deleteInventory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should successfully delete an existing inventory item', async () => {
    // First create an inventory item
    const createResult = await db.insert(inventoryTable)
      .values({
        nama_barang: testInventoryInput.nama_barang,
        jumlah: testInventoryInput.jumlah,
        deskripsi: testInventoryInput.deskripsi,
        kode_inventaris: testInventoryInput.kode_inventaris,
        harga: testInventoryInput.harga.toString(),
        tempat: testInventoryInput.tempat
      })
      .returning()
      .execute();

    const createdItem = createResult[0];
    
    // Delete the item
    const deleteInput: DeleteInput = { id: createdItem.id };
    const result = await deleteInventory(deleteInput);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify item no longer exists in database
    const remainingItems = await db.select()
      .from(inventoryTable)
      .where(eq(inventoryTable.id, createdItem.id))
      .execute();

    expect(remainingItems).toHaveLength(0);
  });

  it('should return success false when deleting non-existent item', async () => {
    // Try to delete an item with non-existent ID
    const deleteInput: DeleteInput = { id: 99999 };
    const result = await deleteInventory(deleteInput);

    // Should return false since no item was deleted
    expect(result.success).toBe(false);
  });

  it('should not affect other inventory items when deleting', async () => {
    // Create multiple inventory items
    const item1 = await db.insert(inventoryTable)
      .values({
        nama_barang: 'Item 1',
        jumlah: 10,
        deskripsi: 'First item',
        kode_inventaris: 'ITEM001',
        harga: '15.50',
        tempat: 'Location 1'
      })
      .returning()
      .execute();

    const item2 = await db.insert(inventoryTable)
      .values({
        nama_barang: 'Item 2',
        jumlah: 20,
        deskripsi: 'Second item',
        kode_inventaris: 'ITEM002',
        harga: '30.75',
        tempat: 'Location 2'
      })
      .returning()
      .execute();

    // Delete only the first item
    const deleteInput: DeleteInput = { id: item1[0].id };
    const result = await deleteInventory(deleteInput);

    expect(result.success).toBe(true);

    // Verify first item is deleted
    const deletedItems = await db.select()
      .from(inventoryTable)
      .where(eq(inventoryTable.id, item1[0].id))
      .execute();
    expect(deletedItems).toHaveLength(0);

    // Verify second item still exists
    const remainingItems = await db.select()
      .from(inventoryTable)
      .where(eq(inventoryTable.id, item2[0].id))
      .execute();
    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].nama_barang).toBe('Item 2');
  });

  it('should handle database constraints properly', async () => {
    // Create an inventory item
    const createResult = await db.insert(inventoryTable)
      .values({
        nama_barang: testInventoryInput.nama_barang,
        jumlah: testInventoryInput.jumlah,
        deskripsi: testInventoryInput.deskripsi,
        kode_inventaris: testInventoryInput.kode_inventaris,
        harga: testInventoryInput.harga.toString(),
        tempat: testInventoryInput.tempat
      })
      .returning()
      .execute();

    const itemId = createResult[0].id;

    // Delete the item successfully
    const deleteInput: DeleteInput = { id: itemId };
    const firstDeleteResult = await deleteInventory(deleteInput);
    expect(firstDeleteResult.success).toBe(true);

    // Try to delete the same item again
    const secondDeleteResult = await deleteInventory(deleteInput);
    expect(secondDeleteResult.success).toBe(false);
  });
});