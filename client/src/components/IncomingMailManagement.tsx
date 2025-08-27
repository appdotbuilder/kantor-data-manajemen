import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Plus, Edit2, Trash2, Search, Calendar, User, LogOut } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { IncomingMail, CreateIncomingMailInput, UpdateIncomingMailInput } from '../../../server/src/schema';

interface IncomingMailManagementProps {
  onBackToDashboard: () => void;
  userEmail: string;
  onLogout: () => void;
}

export default function IncomingMailManagement({ onBackToDashboard, userEmail, onLogout }: IncomingMailManagementProps) {
  const [incomingMails, setIncomingMails] = useState<IncomingMail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMail, setEditingMail] = useState<IncomingMail | null>(null);

  // Form state for creating new incoming mail
  const [createFormData, setCreateFormData] = useState<CreateIncomingMailInput>({
    pengirim: '',
    tanggal_surat: new Date(),
    nomor_surat: '',
    perihal: '',
    lampiran: null
  });

  // Form state for editing incoming mail
  const [editFormData, setEditFormData] = useState<UpdateIncomingMailInput>({
    id: 0,
    pengirim: '',
    tanggal_surat: new Date(),
    nomor_surat: '',
    perihal: '',
    lampiran: null
  });

  const loadIncomingMails = useCallback(async () => {
    try {
      const result = await trpc.incomingMail.getAll.query();
      setIncomingMails(result);
    } catch (error) {
      console.error('Failed to load incoming mails:', error);
    }
  }, []);

  useEffect(() => {
    loadIncomingMails();
  }, [loadIncomingMails]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.incomingMail.create.mutate(createFormData);
      setIncomingMails((prev: IncomingMail[]) => [...prev, response]);
      setCreateFormData({
        pengirim: '',
        tanggal_surat: new Date(),
        nomor_surat: '',
        perihal: '',
        lampiran: null
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create incoming mail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.incomingMail.update.mutate(editFormData);
      setIncomingMails((prev: IncomingMail[]) => 
        prev.map((mail: IncomingMail) => mail.id === response.id ? response : mail)
      );
      setIsEditDialogOpen(false);
      setEditingMail(null);
    } catch (error) {
      console.error('Failed to update incoming mail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus surat masuk ini?')) return;
    
    setIsLoading(true);
    try {
      await trpc.incomingMail.delete.mutate({ id });
      setIncomingMails((prev: IncomingMail[]) => prev.filter((mail: IncomingMail) => mail.id !== id));
    } catch (error) {
      console.error('Failed to delete incoming mail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (mail: IncomingMail) => {
    setEditingMail(mail);
    setEditFormData({
      id: mail.id,
      pengirim: mail.pengirim,
      tanggal_surat: mail.tanggal_surat,
      nomor_surat: mail.nomor_surat,
      perihal: mail.perihal,
      lampiran: mail.lampiran
    });
    setIsEditDialogOpen(true);
  };

  const filteredMails = incomingMails.filter((mail: IncomingMail) =>
    mail.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mail.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mail.perihal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto p-6">
        {/* User Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pengelola Surat Masuk</p>
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
              className="hover:bg-blue-50 border-blue-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Surat Masuk</h1>
                <p className="text-gray-600">Kelola arsip surat yang diterima Kwarran Pagerbarang</p>
              </div>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
            {incomingMails.length} Surat
          </Badge>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan pengirim, nomor surat, atau perihal..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-500"
            />
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="ml-4 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Surat Masuk
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Surat Masuk</CardTitle>
            <CardDescription>
              Arsip lengkap surat masuk dengan detail pengirim dan perihal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Tidak ada surat masuk yang sesuai dengan pencarian' : 'Belum ada data surat masuk'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Surat Masuk Pertama
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor Surat</TableHead>
                      <TableHead>Pengirim</TableHead>
                      <TableHead>Tanggal Surat</TableHead>
                      <TableHead>Perihal</TableHead>
                      <TableHead>Lampiran</TableHead>
                      <TableHead>Tanggal Diterima</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMails.map((mail: IncomingMail) => (
                      <TableRow key={mail.id}>
                        <TableCell className="font-medium">{mail.nomor_surat}</TableCell>
                        <TableCell>{mail.pengirim}</TableCell>
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
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
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
              <DialogTitle>Tambah Surat Masuk Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                placeholder="Nomor Surat"
                value={createFormData.nomor_surat}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateIncomingMailInput) => ({ ...prev, nomor_surat: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Pengirim"
                value={createFormData.pengirim}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateIncomingMailInput) => ({ ...prev, pengirim: e.target.value }))
                }
                required
              />
              <Input
                type="date"
                placeholder="Tanggal Surat"
                value={formatDateForInput(createFormData.tanggal_surat)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateIncomingMailInput) => ({ ...prev, tanggal_surat: new Date(e.target.value) }))
                }
                required
              />
              <Input
                placeholder="Perihal"
                value={createFormData.perihal}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateIncomingMailInput) => ({ ...prev, perihal: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Lampiran (opsional)"
                value={createFormData.lampiran || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateFormData((prev: CreateIncomingMailInput) => ({
                    ...prev,
                    lampiran: e.target.value || null
                  }))
                }
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
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
              <DialogTitle>Edit Surat Masuk</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                placeholder="Nomor Surat"
                value={editFormData.nomor_surat || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateIncomingMailInput) => ({ ...prev, nomor_surat: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Pengirim"
                value={editFormData.pengirim || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateIncomingMailInput) => ({ ...prev, pengirim: e.target.value }))
                }
                required
              />
              <Input
                type="date"
                placeholder="Tanggal Surat"
                value={editFormData.tanggal_surat ? formatDateForInput(editFormData.tanggal_surat) : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateIncomingMailInput) => ({ ...prev, tanggal_surat: new Date(e.target.value) }))
                }
                required
              />
              <Input
                placeholder="Perihal"
                value={editFormData.perihal || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateIncomingMailInput) => ({ ...prev, perihal: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Lampiran (opsional)"
                value={editFormData.lampiran || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateIncomingMailInput) => ({
                    ...prev,
                    lampiran: e.target.value || null
                  }))
                }
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
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