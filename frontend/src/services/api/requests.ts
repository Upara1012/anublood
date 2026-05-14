import api from './axios';
import { BloodRequest } from '../../types';

export const getRequests = async (): Promise<BloodRequest[]> => {
  const response = await api.get('/requests');
  return response.data.data.map((req: any) => ({
    id: req._id,
    requesterId: req.requestedBy?._id,
    requesterHospital: req.requestedBy?.hospitalName,
    targetHospitalId: req.targetHospitalId,
    bloodType: req.bloodType,
    units: req.unitsRequired,
    urgency: req.urgency,
    status: req.status,
    date: req.createdAt,
    message: req.message
  }));
};

export const addRequest = async (
  request: Omit<BloodRequest, 'id' | 'status' | 'date' | 'requesterId' | 'requesterHospital'> & { targetHospital?: string, message?: string }
): Promise<BloodRequest> => {
  const response = await api.post('/requests', {
    targetHospital: request.targetHospital,
    targetHospitalId: request.targetHospitalId,
    bloodType: request.bloodType,
    unitsRequired: request.units,
    urgency: request.urgency,
    message: request.message
  });
  const data = response.data.data;
  return {
    id: data._id,
    requesterId: data.requestedBy,
    requesterHospital: '', // Will be filled by populate in list
    targetHospitalId: data.targetHospitalId,
    bloodType: data.bloodType,
    units: data.unitsRequired,
    urgency: data.urgency,
    status: data.status,
    date: data.createdAt
  };
};

export const updateRequestStatus = async (
  id: string,
  status: BloodRequest['status']
): Promise<BloodRequest> => {
  const response = await api.put(`/requests/${id}/respond`, { status });
  const data = response.data.data;
  return {
    id: data._id,
    requesterId: data.requestedBy,
    requesterHospital: '',
    targetHospitalId: data.targetHospitalId,
    bloodType: data.bloodType,
    units: data.unitsRequired,
    urgency: data.urgency,
    status: data.status,
    date: data.createdAt
  };
};

export const deleteRequest = async (id: string): Promise<void> => {
  await api.delete(`/requests/${id}`);
};