import React, { useState, useEffect } from "react";
import {
  BiPlus,
  BiEdit,
  BiTrash,
  BiErrorCircle,
  BiUpload,
} from "react-icons/bi";
import { consumerAPI } from "../../../services/api";
import TableWithControl from "../../../components/common/Table/TableWithControl";
import Button from "../../../components/common/Button/Button";
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import "../../../styles/pages/dashboard/companies/Vendor.css";
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";

const ConsumerForm = ({ consumer, onClose, onConsumerUpdated }) => {
  const [formData, setFormData] = useState({
    name: consumer?.name || "",
    email: consumer?.email || "",
    phone_number: consumer?.phone_number || "",
    contact_address: consumer?.contact_address || "",
    profile_image: consumer?.profile_image || "",
  });

  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (consumer) {
      setFormData({
        name: consumer.name || "",
        email: consumer.email || "",
        phone_number: consumer.phone_number || "",
        contact_address: consumer.contact_address || "",
        profile_image: consumer.profile_image || "",
      });
      // Set filename if profile image exists
      if (consumer.profile_image) {
        const imageName = consumer.profile_image.split("/").pop();
        setFileName(imageName);
      }
    }
  }, [consumer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      console.log("[ConsumerList] Starting form submission");
      console.log("[ConsumerList] Form data:", formData);

      // Validate required fields
      const requiredFields = [
        "name",
        "email",
        "phone_number",
        "contact_address",
      ];
      const missingFields = requiredFields.filter(
        (field) => !formData[field] || formData[field].trim() === ""
      );

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(", ")}`);
        return;
      }

      // Create FormData object
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone_number", formData.phone_number);
      formDataToSend.append("contact_address", formData.contact_address);

      // Append profile image if it exists and is a File
      if (formData.profile_image instanceof File) {
        console.log("[ConsumerList] Appending profile image:", {
          name: formData.profile_image.name,
          type: formData.profile_image.type,
          size: formData.profile_image.size,
        });
        formDataToSend.append("profile_image", formData.profile_image);
      }

      console.log("[ConsumerList] Sending data to API");

      let response;
      if (consumer) {
        response = await consumerAPI.updateConsumer(
          consumer.consumer_id,
          formDataToSend
        );
        setSuccess("Consumer updated successfully!");
      } else {
        response = await consumerAPI.createConsumer(formDataToSend);
        setSuccess("Consumer created successfully!");
      }

      console.log("[ConsumerList] API Response:", response);

      // Refresh the consumer list
      await onConsumerUpdated();

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone_number: "",
        contact_address: "",
        profile_image: null,
      });
      setFileName("");
    } catch (error) {
      console.error("[ConsumerList] Error during submission:", error);
      if (error.message && error.message !== "An error occurred") {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5 MB limit.");
        return;
      }

      setFileName(file.name);
      setFormData((prev) => ({
        ...prev,
        profile_image: file,
      }));
    }
  };

  return (
    <>
      {/* Removed inline error display */}
      {success && <div className="vendor-management-success">{success}</div>}

      <form onSubmit={handleSubmit} className="vendor-management-form">
        <div className="vendor-management-form-grid">
          <div className="vendor-management-form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Consumer Name"
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="vendor-management-form-input"
            />
          </div>

          <div className="vendor-management-form-group">
            <PhoneInput
              international
              defaultCountry="IN"
              value={formData.phone_number}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, phone_number: value }))
              }
              placeholder="Enter phone number"
              required
              className="vendor-management-form-input phone-input-custom"
              flags={flags}
              countrySelectProps={{
                className: "phone-input-country-select",
              }}
            />
          </div>

          <div className="vendor-management-form-group">
            <textarea
              name="contact_address"
              value={formData.contact_address}
              onChange={handleChange}
              placeholder="Contact Address"
              required
              className="vendor-management-form-input"
              rows="3"
            />
          </div>

          <div className="vendor-management-form-group file-upload-group">
            <label className="file-upload-label">
              <span>Profile Image</span>
              <div className="file-upload-container">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-upload-input"
                />
                <div className="file-upload-button">
                  <BiUpload /> {fileName || "Upload Profile Image"}
                </div>
              </div>
              <small className="file-upload-helper">
                Max file size: 5MB. Supported formats: JPG, PNG, GIF
              </small>
            </label>
          </div>
        </div>

        <div className="vendor-management-form-actions">
          <Button type="button" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {consumer ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </>
  );
};

function ConsumerList({ searchQuery = "" }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      handleSearchConsumers(searchQuery);
    } else {
      fetchConsumers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await consumerAPI.getAllConsumers();

      // Check if response is an array directly
      if (Array.isArray(response)) {
        setConsumers(response);
        setError(null);
      }
      // Check if response has data property and it's an array
      else if (response && response.data && Array.isArray(response.data)) {
        setConsumers(response.data);
        setError(null);
      }
      // Check if response has data property and it's an object with data array
      else if (
        response &&
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setConsumers(response.data.data);
        setError(null);
      } else {
        console.error("Invalid response format:", response);
        setError("Invalid data format received from server");
        setConsumers([]);
      }
    } catch (err) {
      setError("Failed to fetch consumers");
      console.error(err);
      setConsumers([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000); // Ensure loader is displayed for at least 2000ms
    }
  };

  const handleSearchConsumers = async (query) => {
    try {
      setLoading(true);
      const response = await consumerAPI.searchConsumers({ q: query });
      if (Array.isArray(response)) {
        setConsumers(response);
        setError(null);
      } else if (response && response.data && Array.isArray(response.data)) {
        setConsumers(response.data);
        setError(null);
      } else if (
        response &&
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setConsumers(response.data.data);
        setError(null);
      } else {
        setError("Invalid data format received from server");
        setConsumers([]);
      }
    } catch (err) {
      setError("Failed to search consumers");
      setConsumers([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handleDelete = async (consumerId) => {
    if (window.confirm("Are you sure you want to delete this consumer?")) {
      try {
        await consumerAPI.deleteConsumer(consumerId);
        await fetchConsumers();
        toast.success("Consumer deleted successfully!");
      } catch (err) {
        setError("Failed to delete consumer");
        console.error(err);
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  const handleEdit = (consumer) => {
    setSelectedConsumer(consumer);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedConsumer(null);
    setShowModal(false);
  };

  const handleConsumerUpdated = async () => {
    await fetchConsumers();
    handleModalClose();
    toast.success("Consumer updated successfully!");
  };

  const columns = [
    {
      key: "sr_no",
      label: "Sr No.",
      sortable: true,
      render: (_, __, index, pagination = {}) => {
        const { currentPage = 1, pageSize = 10 } = pagination;
        const serialNumber = (currentPage - 1) * pageSize + index + 1;
        return serialNumber;
      },
    },
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone_number", label: "Phone Number", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (_, consumer) => (
        <div className="vendor-management-actions">
          <ActionButton
            onClick={() => handleEdit(consumer)}
            variant="secondary"
            size="small"
          >
            <BiEdit />
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="vendor-management">
      <div className="vendor-management-content">
        <div className="vendor-management-header">
          <h1 className="vendor-management-title">Consumers</h1>
          <Button
            variant="contained"
            onClick={() => setShowModal(true)}
            icon={<BiPlus />}
          >
            Add Consumer
          </Button>
        </div>

        {error && (
          <div className="vendor-management-error">
            <BiErrorCircle className="inline mr-2" /> {error}
          </div>
        )}

        {success && <div className="vendor-management-success">{success}</div>}

        {loading ? (
          <Loader size="large" color="primary" />
        ) : (
          <TableWithControl
            data={consumers}
            columns={columns}
            defaultPageSize={10}
          />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedConsumer ? "Edit Consumer" : "Add New Consumer"}
      >
        <ConsumerForm
          consumer={selectedConsumer}
          onClose={handleModalClose}
          onConsumerUpdated={handleConsumerUpdated}
        />
      </Modal>
    </div>
  );
}

export default ConsumerList;
