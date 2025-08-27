import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Plus, Edit2, Trash2, Search, User, LogOut } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Inventory, CreateInventoryInput, UpdateInventoryInput } from '../../../server/src/schema';

interface InventoryManagementProps {
  onBackToDashboard: () => void;
  userEmail: string;
  onLogout: () => void;
}

export default function InventoryManagement({ onBackToDashboard, userEmail, onLogout }: InventoryManagementProps) {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);

  // Form state for creating new inventory
  const [createFormData, setCreateFormData] = useState<CreateInventoryInput>({
    nama_barang: '',
    jumlah: 0,
    deskripsi: null,
    kode_inventaris: '',
    harga: 0,
    tempat: ''
  });

  // Form state for editing inventory
  const [editFormData, setEditFormData] = useState<UpdateInventoryInput>({
    id: 0,
    nama_barang: '',
    jumlah: 0,
    deskripsi: null,
    kode_inventaris: '',
    harga: 0,
    tempat: ''
  });

  const loadInventory = useCallback(async () => {
    try {
      const result = await trpc.inventory.getAll.query();
      setInventory(result);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.inventory.create.mutate(createFormData);
      setInventory((prev: Inventory[]) => [...prev, response]);
      setCreateFormData({
        nama_barang: '',
        jumlah: 0,
        deskripsi: null,
        kode_inventaris: '',
        harga: 0,
        tempat: ''
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create inventory item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.inventory.update.mutate(editFormData);
      setInventory((prev: Inventory[]) => 
        prev.map((item: Inventory) => item.id === response.id ? response : item)
      );
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update inventory item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item inventaris ini?')) return;
    
    setIsLoading(true);
    try {
      await trpc.inventory.delete.mutate({ id });
      setInventory((prev: Inventory[]) => prev.filter((item: Inventory) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (item: Inventory) => {
    setEditingItem(item);
    setEditFormData({
      id: item.id,
      nama_barang: item.nama_barang,
      jumlah: item.jumlah,
      deskripsi: item.deskripsi,
      kode_inventaris: item.kode_inventaris,
      harga: item.harga,
      tempat: item.tempat
    });
    setIsEditDialogOpen(true);
  };

  const filteredInventory = inventory.filter((item: Inventory) =>
    item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode_inventaris.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tempat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto p-6">
        {/* User Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pengelola Inventaris</p>
              <p className="font-semibold text-gray-900">{userEmail}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBackToDashboard}
              variant="outline"
              size="sm"
              className="hover:bg-emerald-50 border-emerald-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Inventaris</h1>
                <p className="text-gray-600">Kelola data barang dan aset Kwarran Pagerbarang</p>
              </div>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1">
            {inventory.length} Item
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama, kode, atau tempat..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 border-emerald-200 focus:border-emerald-500"
            />
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="ml-4 bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Inventaris
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Inventaris</CardTitle>
            <CardDescription>
              Data lengkap inventaris Kwarran Pagerbarang dengan informasi detail setiap item
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Tidak ada inventaris yang sesuai dengan pencarian' : 'Belum ada data inventaris'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Inventaris Pertama
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Inventaris</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Tempat</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item: Inventory) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.kode_inventaris}</TableCell>
                        <TableCell>{item.nama_barang}</TableCell>
                        <TableCell>{item.jumlah}</TableCell>
                        <TableCell>Rp {item.harga.toLocaleString('id-ID')}</TableCell>
                        <TableCell>{item.tempat}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.deskripsi || '-'}
                        </TableCell>
                        <TableCell>{item.created_at.toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Inventaris Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                placeholder="Nama Barang"
                value={createFormData.nama_barang}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateInventoryInput) => ({ ...prev, nama_barang: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Kode Inventaris"
                value={createFormData.kode_inventaris}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateInventoryInput) => ({ ...prev, kode_inventaris: e.target.value }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Jumlah"
                  value={createFormData.jumlah}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateInventoryInput) => ({ ...prev, jumlah: parseInt(e.target.value) || 0 }))
                  }
                  min="0"
                  required
                />
                <Input
                  type="number"
                  placeholder="Harga"
                  value={createFormData.harga}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCreateFormData((prev: CreateInventoryInput) => ({ ...prev, harga: parseFloat(e.target.value) || 0 }))
                  }
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <Input
                placeholder="Tempat"
                value={createFormData.tempat}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateInventoryInput) => ({ ...prev, tempat: e.target.value }))
                }
                required
              />
              <Textarea
                placeholder="Deskripsi (opsional)"
                value={createFormData.deskripsi || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCreateFormData((prev: CreateInventoryInput) => ({
                    ...prev,
                    deskripsi: e.target.value || null
                  }))
                }
                rows={3}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Inventaris</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                placeholder="Nama Barang"
                value={editFormData.nama_barang || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateInventoryInput) => ({ ...prev, nama_barang: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Kode Inventaris"
                value={editFormData.kode_inventaris || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateInventoryInput) => ({ ...prev, kode_inventaris: e.target.value }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Jumlah"
                  value={editFormData.jumlah || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateInventoryInput) => ({ ...prev, jumlah: parseInt(e.target.value) || 0 }))
                  }
                  min="0"
                  required
                />
                <Input
                  type="number"
                  placeholder="Harga"
                  value={editFormData.harga || 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: UpdateInventoryInput) => ({ ...prev, harga: parseFloat(e.target.value) || 0 }))
                  }
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <Input
                placeholder="Tempat"
                value={editFormData.tempat || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateInventoryInput) => ({ ...prev, tempat: e.target.value }))
                }
                required
              />
              <Textarea
                placeholder="Deskripsi (opsional)"
                value={editFormData.deskripsi || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditFormData((prev: UpdateInventoryInput) => ({
                    ...prev,
                    deskripsi: e.target.value || null
                  }))
                }
                rows={3}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}