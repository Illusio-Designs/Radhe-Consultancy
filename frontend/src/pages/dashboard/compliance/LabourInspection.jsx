import React from 'react';

const LabourInspection = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Labour Law Inspection</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-4">Labour Law Inspection Management</h2>
            <p className="text-gray-600">
              Streamline your labour law inspection process and maintain compliance.
              Track inspections, manage documentation, and ensure adherence to labour laws.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Inspection Management</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Schedule Inspections</li>
                <li>Inspection Reports</li>
                <li>Compliance Tracking</li>
                <li>Action Item Management</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Documentation</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Labour Law Updates</li>
                <li>Compliance Records</li>
                <li>Audit History</li>
                <li>Report Generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabourInspection; 