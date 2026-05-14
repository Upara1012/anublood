import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Filter, Trash2, Edit2 } from 'lucide-react';
import {
  getInventory,
  addInventory,
  deleteInventory,
  updateInventory } from
'../services/api/inventory';
import { BloodStock, BloodType } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
export const Inventory = () => {
  const { user } = useAuth();
  const [data, setData] = useState<BloodStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BloodStock | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    bloodType: 'A+' as BloodType,
    units: 1,
    collectionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).
    toISOString().
    split('T')[0]
  });
  const [editFormData, setEditFormData] = useState({
    bloodType: 'A+' as BloodType,
    units: 1,
    collectionDate: '',
    expiryDate: '',
    status: 'AVAILABLE' as BloodStock['status']
  });
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const inventory = await getInventory();
      // Filtering is now handled by backend if needed, or we filter here for simplicity
      // but without "simulated" logic that might be confusing.
      setData(inventory);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addInventory({
        ...formData,
        hospitalId: user?.id || '',
        lat: user?.lat !== undefined ? user.lat : 7.8731,
        lng: user?.lng !== undefined ? user.lng : 80.7718,
        address: user?.address || user?.hospitalName || 'Central Hospital',
      });
      toast.success('Stock added successfully');
      setIsAddModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to add stock');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteInventory(id);
        toast.success('Record deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };
  const openEditModal = (item: BloodStock) => {
    setEditingItem(item);
    setEditFormData({
      bloodType: item.bloodType,
      units: item.units,
      collectionDate: item.collectionDate,
      expiryDate: item.expiryDate,
      status: item.status
    });
  };
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
      await updateInventory(editingItem.id, editFormData);
      toast.success('Stock updated successfully');
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredData = data.filter(
    (item) =>
    item.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const columns = [
  {
    header: 'Blood Type',
    accessorKey: 'bloodType' as keyof BloodStock,
    className: 'font-bold text-red-600'
  },
  {
    header: 'Units',
    accessorKey: 'units' as keyof BloodStock
  },
  {
    header: 'Collection Date',
    cell: (item: BloodStock) => new Date(item.collectionDate).toISOString().split('T')[0].replace(/-/g, '/')
  },
  {
    header: 'Expiry Date',
    cell: (item: BloodStock) => new Date(item.expiryDate).toISOString().split('T')[0].replace(/-/g, '/')
  },
  {
    header: 'Hospital',
    accessorKey: 'hospitalName' as keyof BloodStock
  },
  {
    header: 'Status',
    cell: (item: BloodStock) =>
    <Badge
      variant={
      item.status === 'AVAILABLE' ?
      'success' :
      item.status === 'LOW' ?
      'warning' :
      'danger'
      }>
      
          {item.status}
        </Badge>

  },
  {
    header: 'Actions',
    cell: (item: BloodStock) =>
    <div className="flex items-center gap-2">
          <button
        onClick={() => openEditModal(item)}
        className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
        
            <Edit2 size={16} />
          </button>
          <button
        onClick={() => handleDelete(item.id)}
        className="p-1 text-gray-400 hover:text-rose-600 transition-colors">
        
            <Trash2 size={16} />
          </button>
        </div>

  }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Inventory</h1>
          <p className="text-gray-500">
            Manage and monitor blood stock levels.
          </p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => setIsAddModalOpen(true)}>
          
          Add Stock
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by type or hospital..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            
          </div>
          <Button variant="secondary" leftIcon={<Filter size={18} />}>
            Filters
          </Button>
        </div>
        <Table
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading} />
        
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Blood Stock">
        
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Type
            </label>
            <select
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={formData.bloodType}
              onChange={(e) =>
              setFormData({
                ...formData,
                bloodType: e.target.value as BloodType
              })
              }>
              
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                (type) =>
                <option key={type} value={type}>
                    {type}
                  </option>

              )}
            </select>
          </div>
          <Input
            label="Units (ml)"
            type="number"
            min="1"
            value={formData.units}
            onChange={(e) =>
            setFormData({
              ...formData,
              units: parseInt(e.target.value)
            })
            }
            required />
          
          <Input
            label="Collection Date"
            type="date"
            value={formData.collectionDate}
            onChange={(e) =>
            setFormData({
              ...formData,
              collectionDate: e.target.value
            })
            }
            required />
          
          <Input
            label="Expiry Date"
            type="date"
            value={formData.expiryDate}
            onChange={(e) =>
            setFormData({
              ...formData,
              expiryDate: e.target.value
            })
            }
            required />
          
          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}>
              
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Record
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Blood Stock">
        
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Type
            </label>
            <select
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={editFormData.bloodType}
              onChange={(e) =>
              setEditFormData({
                ...editFormData,
                bloodType: e.target.value as BloodType
              })
              }>
              
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                (type) =>
                <option key={type} value={type}>
                    {type}
                  </option>

              )}
            </select>
          </div>
          <Input
            label="Units (ml)"
            type="number"
            min="1"
            value={editFormData.units}
            onChange={(e) =>
            setEditFormData({
              ...editFormData,
              units: parseInt(e.target.value)
            })
            }
            required />
          
          <Input
            label="Collection Date"
            type="date"
            value={editFormData.collectionDate}
            onChange={(e) =>
            setEditFormData({
              ...editFormData,
              collectionDate: e.target.value
            })
            }
            required />
          
          <Input
            label="Expiry Date"
            type="date"
            value={editFormData.expiryDate}
            onChange={(e) =>
            setEditFormData({
              ...editFormData,
              expiryDate: e.target.value
            })
            }
            required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={editFormData.status}
              onChange={(e) =>
              setEditFormData({
                ...editFormData,
                status: e.target.value as BloodStock['status']
              })
              }>
              
              <option value="AVAILABLE">Available</option>
              <option value="LOW">Low</option>
              <option value="EXPIRING">Expiring</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditingItem(null)}>
              
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Update Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>);

};