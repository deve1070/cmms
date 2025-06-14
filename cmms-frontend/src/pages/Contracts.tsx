import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { contractsApi } from '../services/api';
import { Contract } from '../types/contract';
import { toast } from 'react-hot-toast';
import {
  FileText,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchContracts();
  }, [selectedType]);

  const fetchContracts = async () => {
    try {
      const data = await contractsApi.getAll() as Contract[];
      const filteredData = selectedType === 'all'
        ? data
        : data.filter(
            contract => contract.type === selectedType
          );
      setContracts(filteredData);
    } catch (error) {
      toast.error('Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contract Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchContracts()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Contract
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="type" className="text-sm font-medium text-gray-700">
            Type:
          </label>
          <select
            id="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Types</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="consulting">Consulting</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {contracts.map((contract) => (
            <li key={contract.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {contract.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vendor: {contract.vendor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                      {getStatusIcon(contract.status)}
                      <span className="ml-1">{contract.status}</span>
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ${contract.value.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Start: {new Date(contract.startDate).toLocaleDateString()}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      End: {new Date(contract.endDate).toLocaleDateString()}
                      {isExpiringSoon(contract.endDate) && (
                        <AlertTriangle className="h-4 w-4 ml-1 text-yellow-500" />
                      )}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>Equipment: {contract.equipment.model} ({contract.equipment.serialNumber})</p>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Renewal Terms: {contract.renewalTerms}</p>
                  <p>Payment Terms: {contract.paymentTerms}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Contracts;