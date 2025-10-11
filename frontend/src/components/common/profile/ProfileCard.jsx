import React from 'react';
import { Card, Avatar, Divider, Tag } from 'antd';
import { FiMail, FiPhone, FiMapPin, FiBriefcase, FiUser } from 'react-icons/fi';
import '../../../styles/components/common/ProfileCard.css';

const ProfileCard = ({ userData, type }) => {
  const getProfileData = () => {
    switch (type) {
      case 'company':
        return {
          name: userData.company_name || 'N/A',
          email: userData.company_email || 'N/A',
          phone: userData.contact_number || 'N/A',
          address: userData.company_address || 'N/A',
          additionalInfo: [
            { label: 'GST Number', value: userData.gst_number || 'N/A' },
            { label: 'PAN Number', value: userData.pan_number || 'N/A' },
            { label: 'Firm Type', value: userData.firm_type || 'N/A' },
            { label: 'Owner Name', value: userData.owner_name || 'N/A' }
          ]
        };
      case 'consumer':
        return {
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'N/A',
          email: userData.email || 'N/A',
          phone: userData.phone_number || 'N/A',
          address: userData.address || 'N/A',
          additionalInfo: [
            { label: 'Date of Birth', value: userData.dob || 'N/A' },
            { label: 'Gender', value: userData.gender || 'N/A' }
          ]
        };
      default: // Admin/Other users
        return {
          name: userData.username || 'N/A',
          email: userData.email || 'N/A',
          phone: userData.phone || 'N/A',
          address: userData.address || 'N/A',
          additionalInfo: [
            { label: 'Role', value: userData.role_name || 'N/A' },
            { label: 'Status', value: userData.status || 'Active' }
          ]
        };
    }
  };

  const profileData = getProfileData();

  return (
    <Card className="profile-card">
      <div className="profile-header">
        <Avatar 
          size={100} 
          src={userData.profile_image}
          icon={<FiUser />}
          className="profile-avatar"
        />
        <div className="profile-title">
          <h2>{profileData.name}</h2>
          <Tag color={type === 'company' ? 'blue' : type === 'consumer' ? 'green' : 'purple'}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Tag>
        </div>
      </div>

      <Divider />

      <div className="profile-info">
        <div className="info-item">
          <FiMail className="info-icon" />
          <div>
            <label>Email</label>
            <p>{profileData.email}</p>
          </div>
        </div>

        <div className="info-item">
          <FiPhone className="info-icon" />
          <div>
            <label>Phone</label>
            <p>{profileData.phone}</p>
          </div>
        </div>

        <div className="info-item">
          <FiMapPin className="info-icon" />
          <div>
            <label>Address</label>
            <p>{profileData.address}</p>
          </div>
        </div>

        {profileData.additionalInfo.map((info, index) => (
          <div key={index} className="info-item">
            <FiBriefcase className="info-icon" />
            <div>
              <label>{info.label}</label>
              <p>{info.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProfileCard; 
