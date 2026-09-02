import React from 'react';
import { AppLayout } from './AppLayout';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  return <AppLayout>{children}</AppLayout>;
};
