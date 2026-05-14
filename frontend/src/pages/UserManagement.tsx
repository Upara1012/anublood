import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import {
  getUsers,
  addUser,
  deleteUser,
  updateUser } from
'../services/api/users';
import { User, Role } from '../types';
import { toast } from 'sonner';
export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hospitalName: '',
    phone: '',
    lat: 7.8731,
    lng: 80.7718,
    address: '',
    role: 'STAFF' as Role
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    hospitalName: '',
    phone: '',
    lat: 0,
    lng: 0,
    address: '',
    role: 'STAFF' as Role
  });
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        hospitalName: formData.hospitalName,
        phone: formData.phone,
        lat: formData.lat,
        lng: formData.lng,
        address: formData.address
      });
      toast.success('User created successfully');
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        hospitalName: '',
        phone: '',
        lat: 7.8731,
        lng: 80.7718,
        address: '',
        role: 'STAFF'
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (
    window.confirm(
      'Are you sure you want to delete this user? This action cannot be undone.'
    ))
    {
      try {
        await deleteUser(id);
        toast.success('User deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };
  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditFormData({
      name: u.name,
      email: u.email,
      hospitalName: u.hospitalName,
      phone: u.phone || '',
      lat: u.lat || 0,
      lng: u.lng || 0,
      address: u.address || '',
      role: u.role
    });
  };
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await updateUser(editingUser.id, editFormData);
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredUsers = users.filter(
    (u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const columns = [
  {
    header: 'User',
    cell: (item: User) =>
    <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium shrink-0">
            {item.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </div>

  },
  {
    header: 'Hospital',
    accessorKey: 'hospitalName' as keyof User
  },
  {
    header: 'Phone',
    accessorKey: 'phone' as keyof User
  },
  {
    header: 'Location',
    cell: (item: User) => (
      <div className="text-xs">
        <p>{item.address || 'N/A'}</p>
        <p className="text-gray-400">({item.lat}, {item.lng})</p>
      </div>
    )
  },
  {
    header: 'Role',
    cell: (item: User) =>
    <Badge variant={item.role === 'ADMIN' ? 'danger' : 'info'}>
          {item.role}
        </Badge>

  },
  {
    header: 'Actions',
    cell: (item: User) =>
    <div className="flex items-center gap-2">
          <button
        onClick={() => openEditModal(item)}
        className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
        
            <Edit2 size={16} />
          </button>
          {item.role !== 'ADMIN' &&
      <button
        onClick={() => handleDelete(item.id)}
        className="p-1 text-gray-400 hover:text-rose-600 transition-colors">
        
              <Trash2 size={16} />
            </button>
      }
        </div>

  }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">
            Add and manage staff access across hospitals.
          </p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => setIsAddModalOpen(true)}>
          
          Add User
        </Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="w-full sm:w-96">
            <Input
              placeholder="Search users by name, email or hospital..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            
          </div>
        </div>
        <Table
          data={filteredUsers}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No users found matching your search." />
        
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New User">
        
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value
            })
            }
            required />
          
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value
            })
            }
            required />
          
          <Input
            label="Temporary Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value
            })
            }
            required />
          
          <Input
            label="Hospital Name"
            value={formData.hospitalName}
            onChange={(e) =>
            setFormData({
              ...formData,
              hospitalName: e.target.value
            })
            }
            required />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) =>
            setFormData({
              ...formData,
              phone: e.target.value
            })
            }
            required />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={formData.lat}
              onChange={(e) =>
              setFormData({
                ...formData,
                lat: e.target.value === '' ? 0 : parseFloat(e.target.value)
              })
              }
              required />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={formData.lng}
              onChange={(e) =>
              setFormData({
                ...formData,
                lng: e.target.value === '' ? 0 : parseFloat(e.target.value)
              })
              }
              required />
          </div>

          <Input
            label="Full Hospital Address"
            value={formData.address}
            onChange={(e) =>
            setFormData({
              ...formData,
              address: e.target.value
            })
            }
            required />
          
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) =>
            setFormData({
              ...formData,
              phone: e.target.value
            })
            }
            required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={formData.role}
              onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as Role
              })
              }>
              
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {formData.role === 'ADMIN' &&
          <div className="bg-rose-50 p-3 rounded-lg flex gap-2 text-sm text-rose-800">
              <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
              <p>
                Warning: Administrators have full access to system settings and
                user management.
              </p>
            </div>
          }

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}>
              
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User">
        
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Full Name"
            value={editFormData.name}
            onChange={(e) =>
            setEditFormData({
              ...editFormData,
              name: e.target.value
            })
            }
            required />
          
          <Input
            label="Email Address"
            type="email"
            value={editFormData.email}
            onChange={(e) =>
            setEditFormData({
              ...editFormData,
              email: e.target.value
            })
            }
            required />
          
          <Input
            label="Hospital Name"
            value={editFormData.hospitalName}
            onChange={(e) =>
            setEditFormData({
              ...editFormData,
              hospitalName: e.target.value
            })
            }
            required />
          
          <Input
            label="Phone Number"
            value={editFormData.phone}
            onChange={(e) =>
            setEditFormData({
              ...editFormData,
              phone: e.target.value
            })
            }
            required />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={editFormData.lat}
              onChange={(e) =>
              setEditFormData({
                ...editFormData,
                lat: e.target.value === '' ? 0 : parseFloat(e.target.value)
              })
              }
              required />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={editFormData.lng}
              onChange={(e) =>
              setEditFormData({
                ...editFormData,
                lng: e.target.value === '' ? 0 : parseFloat(e.target.value)
              })
              }
              required />
          </div>

          <Input
            label="Full Hospital Address"
            value={editFormData.address}
            onChange={(e) =>
            setEditFormData({
              ...editFormData,
              address: e.target.value
            })
            }
            required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={editFormData.role}
              onChange={(e) =>
              setEditFormData({
                ...editFormData,
                role: e.target.value as Role
              })
              }>
              
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {editFormData.role === 'ADMIN' && editingUser?.role !== 'ADMIN' &&
          <div className="bg-rose-50 p-3 rounded-lg flex gap-2 text-sm text-rose-800">
              <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
              <p>
                Warning: Promoting this user to Administrator grants full system
                access.
              </p>
            </div>
          }

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditingUser(null)}>
              
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>);

};