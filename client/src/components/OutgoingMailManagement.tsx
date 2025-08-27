import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, SendHorizontal, Plus, Edit2, Trash2, Search, Calendar, User, LogOut } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { OutgoingMail, CreateOutgoingMailInput, UpdateOutgoingMailInput } from '../../../server/src/schema';

interface OutgoingMailManagementProps {
  onBackToDashboard: () => void;
  userEmail: string;
  onLogout: () => void;
}

export default function OutgoingMailManagement({ onBackToDashboard, userEmail, onLogout }: OutgoingMailManagementProps) {
  const [outgoingMails, setOutgoingMails] = useState<OutgoingMail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMail, setEditingMail] = useState<OutgoingMail | null>(null);

  // Form state for creating new outgoing mail
  const [createFormData, setCreateFormData] = useState<CreateOutgoingMailInput>({
    penerima: '',
    tanggal_surat: new Date(),
    nomor_surat: '',
    perihal: '',
    lampiran: null
  });

  // Form state for editing outgoing mail
  const [editFormData, setEditFormData] = useState<UpdateOutgoingMailInput>({
    id: 0,
    penerima: '',
    tanggal_surat: new Date(),
    nomor_surat: '',
    perihal: '',
    lampiran: null
  });

  const loadOutgoingMails = useCallback(async () => {
    try {
      const result = await trpc.outgoingMail.getAll.query();
      setOutgoingMails(result);
    } catch (error) {
      console.error('Failed to load outgoing mails:', error);
    }
  }, []);

  useEffect(() => {
    loadOutgoingMails();
  }, [loadOutgoingMails]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.outgoingMail.create.mutate(createFormData);
      setOutgoingMails((prev: OutgoingMail[]) => [...prev, response]);
      setCreateFormData({
        penerima: '',
        tanggal_surat: new Date(),
        nomor_surat: '',
        perihal: '',
        lampiran: null
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create outgoing mail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.outgoingMail.update.mutate(editFormData);
      setOutgoingMails((prev: OutgoingMail[]) => 
        prev.map((mail: OutgoingMail) => mail.id === response.id ? response : mail)
      );
      setIsEditDialogOpen(false);
      setEditingMail(null);
    } catch (error) {
      console.error('Failed to update outgoing mail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus surat keluar ini?')) return;
    
    setIsLoading(true);
    try {
      await trpc.outgoingMail.delete.mutate({ id });
      setOutgoingMails((prev: OutgoingMail[]) => prev.filter((mail: OutgoingMail) => mail.id !== id));
    } catch (error) {
      console.error('Failed to delete outgoing mail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (mail: OutgoingMail) => {
    setEditingMail(mail);
    setEditFormData({
      id: mail.id,
      penerima: mail.penerima,
      tanggal_surat: mail.tanggal_surat,
      nomor_surat: mail.nomor_surat,
      perihal: mail.perihal,
      lampiran: mail.lampiran
    });
    setIsEditDialogOpen(true);
  };

  const filteredMails = outgoingMails.filter((mail: OutgoingMail) =>
    mail.penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mail.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mail.perihal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto p-6">
        {/* User Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pengelola Surat Keluar</p>
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
              className="hover:bg-purple-50 border-purple-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <SendHorizontal className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Surat Keluar</h1>
                <p className="text-gray-600">Kelola arsip surat yang dikirim dari Kwarran Pagerbarang</p>
              </div>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
            {outgoingMails.length} Surat
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan penerima, nomor surat, atau perihal..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 border-purple-200 focus:border-purple-500"
            />
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="ml-4 bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Surat Keluar
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Surat Keluar</CardTitle>
            <CardDescription>
              Arsip lengkap surat keluar dengan detail penerima dan perihal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMails.length === 0 ? (
              <div className="text-center py-12">
                <SendHorizontal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Tidak ada surat keluar yang sesuai dengan pencarian' : 'Belum ada data surat keluar'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Surat Keluar Pertama
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Surat</TableHead>
                      <TableHead>Penerima</TableHead>
                      <TableHead>Tanggal Surat</TableHead>
                      <TableHead>Perihal</TableHead>
                      <TableHead>Lampiran</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMails.map((mail: OutgoingMail) => (
                      <TableRow key={mail.id}>
                        <TableCell className="font-medium">{mail.nomor_surat}</TableCell>
                        <TableCell>{mail.penerima}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {mail.tanggal_surat.toLocaleDateString('id-ID')}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{mail.perihal}</TableCell>
                        <TableCell>{mail.lampiran || '-'}</TableCell>
                        <TableCell>{mail.created_at.toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(mail)}
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(mail.id)}
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
              <DialogTitle>Tambah Surat Keluar Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                placeholder="Nomor Surat"
                value={createFormData.nomor_surat}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateOutgoingMailInput) => ({ ...prev, nomor_surat: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Penerima"
                value={createFormData.penerima}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateOutgoingMailInput) => ({ ...prev, penerima: e.target.value }))
                }
                required
              />
              <Input
                type="date"
                placeholder="Tanggal Surat"
                value={formatDateForInput(createFormData.tanggal_surat)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateOutgoingMailInput) => ({ ...prev, tanggal_surat: new Date(e.target.value) }))
                }
                required
              />
              <Input
                placeholder="Perihal"
                value={createFormData.perihal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateOutgoingMailInput) => ({ ...prev, perihal: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Lampiran (opsional)"
                value={createFormData.lampiran || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateOutgoingMailInput) => ({
                    ...prev,
                    lampiran: e.target.value || null
                  }))
                }
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
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
              <DialogTitle>Edit Surat Keluar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                placeholder="Nomor Surat"
                value={editFormData.nomor_surat || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateOutgoingMailInput) => ({ ...prev, nomor_surat: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Penerima"
                value={editFormData.penerima || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateOutgoingMailInput) => ({ ...prev, penerima: e.target.value }))
                }
                required
              />
              <Input
                type="date"
                placeholder="Tanggal Surat"
                value={editFormData.tanggal_surat ? formatDateForInput(editFormData.tanggal_surat) : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateOutgoingMailInput) => ({ ...prev, tanggal_surat: new Date(e.target.value) }))
                }
                required
              />
              <Input
                placeholder="Perihal"
                value={editFormData.perihal || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateOutgoingMailInput) => ({ ...prev, perihal: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Lampiran (opsional)"
                value={editFormData.lampiran || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateOutgoingMailInput) => ({
                    ...prev,
                    lampiran: e.target.value || null
                  }))
                }
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
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