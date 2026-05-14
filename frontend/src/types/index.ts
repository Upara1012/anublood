export type Role = 'ADMIN' | 'STAFF';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'FULFILLED';
export type Urgency = 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  hospitalName: string;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  phone?: string;
  lat?: number;
  lng?: number;
  address?: string;
}

export interface BloodStock {
  id: string;
  bloodType: BloodType;
  units: number;
  collectionDate: string;
  expiryDate: string;
  hospitalId: string;
  hospitalName: string;
  hospital?: {
    lat: number;
    lng: number;
    address: string;
    phone: string;
  };
  status: 'AVAILABLE' | 'LOW' | 'EXPIRING';
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  contact: string;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterHospital: string;
  targetHospitalId?: string;
  bloodType: BloodType;
  units: number;
  urgency: Urgency;
  status: RequestStatus;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ALERT' | 'WARNING' | 'INFO';
  read: boolean;
  date: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  date: string;
}