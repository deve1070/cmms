import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { maintenanceApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { FileText, Wrench, AlertTriangle, Plus } from 'lucide-react';

interface QuickActionsProps {
  onActionComplete?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportData, setReportData] = useState({
    type: 'Preventive',
    description: '',
    findings: '',
    recommendations: '',
  });

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await maintenanceApi.create({
        ...reportData,
        performedById: user?.id,
        status: 'Completed',
      });

      toast.success('Report submitted successfully');
      setIsReportDialogOpen(false);
      setReportData({
        type: 'Preventive',
        description: '',
        findings: '',
        recommendations: '',
      });
      onActionComplete?.();
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50"
        onClick={() => setIsReportDialogOpen(true)}
      >
        <FileText className="h-6 w-6 text-blue-600" />
        <span>Submit Report</span>
      </Button>

      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-yellow-50"
        onClick={() => navigate('/maintenance/work-orders')}
      >
        <Wrench className="h-6 w-6 text-yellow-600" />
        <span>View Work Orders</span>
      </Button>

      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-red-50"
        onClick={() => navigate('/maintenance/issues')}
      >
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <span>Report Issue</span>
      </Button>

      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-green-50"
        onClick={() => navigate('/maintenance/schedule')}
      >
        <Plus className="h-6 w-6 text-green-600" />
        <span>Schedule Maintenance</span>
      </Button>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Maintenance Report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Maintenance Type</label>
              <Select
                value={reportData.type}
                onValueChange={(value) => setReportData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventive">Preventive</SelectItem>
                  <SelectItem value="Corrective">Corrective</SelectItem>
                  <SelectItem value="Calibration">Calibration</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={reportData.description}
                onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the maintenance work performed"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Findings</label>
              <Textarea
                value={reportData.findings}
                onChange={(e) => setReportData(prev => ({ ...prev, findings: e.target.value }))}
                placeholder="Document any findings or observations"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recommendations</label>
              <Textarea
                value={reportData.recommendations}
                onChange={(e) => setReportData(prev => ({ ...prev, recommendations: e.target.value }))}
                placeholder="Provide any recommendations for future maintenance"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickActions; 