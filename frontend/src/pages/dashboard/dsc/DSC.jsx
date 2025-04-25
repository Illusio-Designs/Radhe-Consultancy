import React from 'react';

const DSC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Digital Signature Certificate (DSC)</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">DSC Management</h2>
            <p className="text-gray-600">
              Comprehensive Digital Signature Certificate management platform.
              Apply, track, and manage DSCs for individuals and organizations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">DSC Services</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>New DSC Application</li>
                <li>DSC Renewal</li>
                <li>Certificate Status</li>
                <li>Document Signing</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Organization Features</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Bulk DSC Management</li>
                <li>Multi-user Access</li>
                <li>Department-wise DSC</li>
                <li>Compliance Tracking</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Administrative Tools</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Access Control</li>
                <li>Activity Monitoring</li>
                <li>System Analytics</li>
                <li>Audit Trails</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSC; 