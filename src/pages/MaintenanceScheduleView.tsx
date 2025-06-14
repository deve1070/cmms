import React, { useState } from 'react';
import { Select } from '@/components/ui/select';

const MaintenanceScheduleView: React.FC = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');

  return (
    <div>
 