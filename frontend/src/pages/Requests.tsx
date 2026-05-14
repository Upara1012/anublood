import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Send, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import {
  getRequests,
  updateRequestStatus,
  addRequest } from
'../services/api/requests';
import { BloodRequest, BloodType, Urgency } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
export const Requests = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'INCOMING' | 'OUTGOING'>(
    'INCOMING'
  );
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: 'O+' as BloodType,
    units: 1,
    urgency: 'NORMAL' as Urgency,
    targetHospital: '',
    message: ''
  });
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleStatusUpdate = async (
  id: string,
  status: 'ACCEPTED' | 'REJECTED') =>
  {
    try {
      await updateRequestStatus(id, status);
      toast.success(`Request ${status.toLowerCase()}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };
  const handleNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addRequest({
        ...formData
      });
      toast.success('Request sent successfully');
      setIsNewModalOpen(false);
      setActiveTab('OUTGOING');
      fetchData();
    } catch (error) {
      toast.error('Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Backend already filters based on user's role and hospital
  const displayedRequests = requests.filter((r) => {
    const isRequester = r.requesterId === user?.id || r.requesterHospital === user?.hospitalName;
    return activeTab === 'INCOMING' ? !isRequester : isRequester;
  });
  const getUrgencyBadge = (urgency: Urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return <Badge variant="danger">Critical</Badge>;
      case 'HIGH':
        return <Badge variant="warning">High</Badge>;
      default:
        return <Badge variant="info">Normal</Badge>;
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge variant="success">Accepted</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'FULFILLED':
        return <Badge variant="default">Fulfilled</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };
  if (isLoading) return <PageLoader />;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
          <p className="text-gray-500">
            Manage incoming and outgoing blood requests.
          </p>
        </div>
        <Button
          leftIcon={<Send size={18} />}
          onClick={() => setIsNewModalOpen(true)}>
          
          New Request
        </Button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['INCOMING', 'OUTGOING'].map((tab) =>
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}>
            
              {tab === 'INCOMING' ? 'Incoming Requests' : 'My Requests'}
            </button>
          )}
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayedRequests.length === 0 ?
        <div className="col-span-full">
            <EmptyState
            icon={Send}
            title={`No ${activeTab.toLowerCase()} requests`}
            description={
            activeTab === 'INCOMING' ?
            "You're all caught up!" :
            "You haven't made any requests yet."
            } />
          
          </div> :

        displayedRequests.map((request) =>
        <Card key={request.id} className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-red-600">
                      {request.bloodType}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="font-medium text-gray-900">
                      {request.units} Units
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(request.date).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex-1">
                <p className="text-xs text-gray-500 mb-1">
                  {activeTab === 'INCOMING' ?
              'Requested by' :
              'Target Hospital'}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {activeTab === 'INCOMING' ?
              request.requesterHospital :
              request.targetHospitalId || 'Any Available'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Urgency:</span>
                  {getUrgencyBadge(request.urgency)}
                </div>
              </div>

              {activeTab === 'INCOMING' && request.status === 'PENDING' &&
          <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                  <Button
              variant="secondary"
              className="flex-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
              leftIcon={<XCircle size={16} />}>
              
                    Reject
                  </Button>
                  <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
              leftIcon={<CheckCircle size={16} />}>
              
                    Accept
                  </Button>
                </div>
          }
            </Card>
        )
        }
      </div>

      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create Blood Request">
        
        <form onSubmit={handleNewRequest} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg flex gap-2 text-sm text-blue-800 mb-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-blue-500" />
            <p>
              This request will be broadcasted to nearby hospitals in the
              network.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              label="Units Required"
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
            
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency Level
            </label>
            <select
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={formData.urgency}
              onChange={(e) =>
              setFormData({
                ...formData,
                urgency: e.target.value as Urgency
              })
              }>
              <option value="NORMAL">Normal (Within 48 hours)</option>
              <option value="HIGH">High (Within 12 hours)</option>
              <option value="CRITICAL">Critical (Immediate)</option>
            </select>
          </div>

          <Input
            label="Target Hospital (Optional)"
            placeholder="Enter hospital name or leave blank for broadcast"
            value={formData.targetHospital || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                targetHospital: e.target.value
              })
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Provide details about the request..."
              value={formData.message}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  message: e.target.value
                })
              }
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsNewModalOpen(false)}>
              
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Send Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>);

};