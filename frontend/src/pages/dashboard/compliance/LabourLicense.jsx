import React from 'react';

const LabourLicense = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Labour License Management</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Labour License Overview</h2>
            <p className="text-gray-600">
              Efficiently manage your labour licenses and ensure compliance with regulations.
              Track renewals, maintain documentation, and stay updated with labor law requirements.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">License Management</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>License Applications</li>
                <li>Renewal Tracking</li>
                <li>Status Monitoring</li>
                <li>Document Management</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Compliance Tools</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Regulatory Updates</li>
                <li>Compliance Reports</li>
                <li>Audit Preparation</li>
                <li>Alert Notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabourLicense; 