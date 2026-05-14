import api from './axios';
import { BloodStock } from '../../types';

export const getInventory = async (params?: any): Promise<BloodStock[]> => {
  const response = await api.get('/inventory', { params });
  return response.data.data.map((item: any) => ({
    id: item._id,
    bloodType: item.bloodType,
    units: item.units,
    collectionDate: item.collectionDate,
    expiryDate: item.expiryDate,
    hospitalId: item.addedBy,
    hospitalName: item.hospitalName,
    hospital: item.addedBy && typeof item.addedBy === 'object' ? {
      lat: item.addedBy.lat,
      lng: item.addedBy.lng,
      address: item.addedBy.address,
      phone: item.addedBy.phone
    } : undefined,
    status: item.status,
    location: item.location
  }));
};

export const addInventory = async (
  item: Omit<BloodStock, 'id' | 'hospitalName' | 'status'> & { lat: number; lng: number; address: string }
): Promise<BloodStock> => {
  const response = await api.post('/inventory', item);
  const data = response.data.data;
  return {
    id: data._id,
    bloodType: data.bloodType,
    units: data.units,
    collectionDate: data.collectionDate,
    expiryDate: data.expiryDate,
    hospitalId: data.addedBy,
    hospitalName: data.hospitalName,
    status: data.status,
    location: data.location
  };
};

export const updateInventory = async (
  id: string,
  updates: Partial<BloodStock>
): Promise<BloodStock> => {
  const response = await api.put(`/inventory/${id}`, updates);
  const data = response.data.data;
  return {
    id: data._id,
    bloodType: data.bloodType,
    units: data.units,
    collectionDate: data.collectionDate,
    expiryDate: data.expiryDate,
    hospitalId: data.addedBy,
    hospitalName: data.hospitalName,
    status: data.status,
    location: data.location
  };
};

export const deleteInventory = async (id: string): Promise<void> => {
  await api.delete(`/inventory/${id}`);
};