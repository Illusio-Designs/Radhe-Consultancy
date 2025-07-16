import React, { useEffect, useState } from "react";
import { renewalAPI } from "../../../services/api";
import Loader from "../../../components/common/Loader/Loader";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Dropdown from "../../../components/common/Dropdown/Dropdown";
import { toast } from "react-toastify";
import { BiErrorCircle } from "react-icons/bi";
import "../../../styles/pages/dashboard/home/CombinedDashboard.css";
import { useAuth } from "../../../contexts/AuthContext";

const typeOptions = [
  { value: "all", label: "All" },
  { value: "ecp", label: "ECP" },
  { value: "health", label: "Health" },
  { value: "fire", label: "Fire" },
  { value: "vehicles", label: "Vehicles" },
  { value: "dsc", label: "DSC" },
];
const periodOptions = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const RenewalList = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const { user, userRoles } = useAuth();
  const isCompany = userRoles.includes("company");
  const isConsumer = userRoles.includes("consumer");
  const companyId = user?.profile?.company_id;
  const consumerId = user?.profile?.consumer_id;

  const filteredRenewals = React.useMemo(() => {
    if (isCompany) {
      return renewals.filter((r) => r.company_id === companyId);
    }
    if (isConsumer) {
      return renewals.filter((r) => r.consumer_id === consumerId);
    }
    return renewals;
  }, [renewals, isCompany, isConsumer, companyId, consumerId]);

  // Disable update/edit for company/consumer users
  const canEdit = !(isCompany || isConsumer);
  const onlyCompanyOrConsumer = (isCompany && !isConsumer && userRoles.length === 1) || (isConsumer && !isCompany && userRoles.length === 1);

  useEffect(() => {
    const fetchRenewals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await renewalAPI.getListByTypeAndPeriod(selectedType, selectedPeriod);
        setRenewals(Array.isArray(res) ? res : []);
      } catch (err) {
        setError("Failed to fetch renewals");
        setRenewals([]);
        toast.error("Failed to fetch renewals");
      } finally {
        setLoading(false);
      }
    };
    fetchRenewals();
  }, [selectedType, selectedPeriod]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const renderDaysLeft = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const today = new Date();
    const renewalDate = new Date(date);
    const daysLeft = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) {
      return <span style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: "#fee2e2", color: "#991b1b" }}>{daysLeft} days</span>;
    } else if (daysLeft <= 15) {
      return <span style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: "#fef3c7", color: "#92400e" }}>{daysLeft} days</span>;
    } else {
      return <span style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: "#dcfce7", color: "#166534" }}>{daysLeft} days</span>;
    }
  };

  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index) => index + 1,
    },
    {
      key: "policy_type",
      label: "Policy Type",
      sortable: true,
      render: (_, item) => (item && item.type) ? item.type.toUpperCase() : selectedType.toUpperCase(),
    },
    {
      key: "holder_details",
      label: "Holder Name",
      sortable: true,
      render: (_, item) => item?.holderName || '-',
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (_, item) => item?.email || '-',
    },
    {
      key: "renewal_date",
      label: "Renewal Date",
      sortable: true,
      render: (_, item) => formatDate(item?.policy_end_date || item?.expiry_date),
    },
    {
      key: "days_left",
      label: "Days Left",
      sortable: true,
      render: (_, item) => renderDaysLeft(item?.policy_end_date || item?.expiry_date),
    },
  ];

  return (
    <div className="dsc">
      <div className="dsc-content">
        <div className="dsc-header">
          <h1 className="dsc-title">Renewals Due</h1>
          <div className="list-container">
            <div className="dashboard-header-dropdown-container">
                <Dropdown
                    options={typeOptions}
                    value={typeOptions.find(opt => opt.value === selectedType)}
                    onChange={(option) => setSelectedType(option ? option.value : 'all')}
                    placeholder="Select Type"
                />
            </div>
            <div className="dashboard-header-dropdown-container">
                <Dropdown
                    options={periodOptions}
                    value={periodOptions.find(opt => opt.value === selectedPeriod)}
                    onChange={(option) => setSelectedPeriod(option ? option.value : 'month')}
                    placeholder="Select Period"
                />
            </div>
          </div>
        </div>

        {error && (
          <div className="dsc-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

        {onlyCompanyOrConsumer ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px 0', fontSize: 20 }}>
            Renewal list is not available for your account.
          </div>
        ) : loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={filteredRenewals}
            columns={columns}
            defaultPageSize={10}
            canEdit={canEdit}
          />
        )}
      </div>
    </div>
  );
};

export default RenewalList; 