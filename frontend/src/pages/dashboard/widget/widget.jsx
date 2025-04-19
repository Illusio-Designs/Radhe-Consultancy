import React, { useState } from "react";
import DatePicker from "react-datepicker"; // Import the DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import the DatePicker styles
import "../../../styles/pages/dashboard/widget/widget.css"; // Import the CSS file
import ActionButton from "../../../components/common/ActionButton/ActionButton";
import Button from "../../../components/common/Button/Button";
import Dropdown from "../../../components/common/Dropdown/Dropdown";
import Input from "../../../components/common/Input/Input";
import Loader from "../../../components/common/Loader/Loader";
import Modal from "../../../components/common/Modal/Modal";
import Pagination from "../../../components/common/Pagination/Pagination";
import ProfileCard from "../../../components/common/profile/ProfileCard";
import SearchBar from "../../../components/common/SearchBar/SearchBar";
import Table from "../../../components/common/Table/Table";
import TableWithControl from "../../../components/common/Table/TableWithControl";

const WidgetPage = () => {
  const [selectedDate, setSelectedDate] = useState(null); // State for the selected date
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    alert(`Selected Date Range: ${start?.toLocaleDateString()} - ${end?.toLocaleDateString()}`);
  };

  return (
    <div className="widget-page">
      <h1>Common Components Showcase</h1>

      {/* ActionButton */}
      <section>
        <h2>ActionButton</h2>
        <ActionButton variant="primary" onClick={() => alert("Action Button Clicked!")}>
          Click Me
        </ActionButton>
      </section>

      {/* Button */}
      <section>
        <h2>Button</h2>
        <Button size="medium" onClick={() => alert("Button Clicked!")}>
          Default Button
        </Button>
      </section>

      {/* Dropdown */}
      <section>
        <h2>Dropdown</h2>
        <Dropdown
          options={[
            { value: "1", label: "Option 1" },
            { value: "2", label: "Option 2" },
          ]}
          placeholder="Select an option"
        />
      </section>

      {/* Input */}
      <section>
        <h2>Input</h2>
        <Input placeholder="Enter your name" />
      </section>

      {/* Loader */}
      <section>
        <h2>Loader</h2>
        <div className="loader-container">
          <Loader size="large" color="primary" />
        </div>
      </section>

      {/* DatePicker */}
      <section>
        <h2>DatePicker</h2>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)} // Update the selected date
          placeholderText="Select a date"
          className="datepicker-input" // Optional: Add custom styling
        />
        {selectedDate && (
          <p>Selected Date: {selectedDate.toLocaleDateString()}</p>
        )}
      </section>

      {/* Pagination */}
      <section>
        <h2>Pagination</h2>
        <Pagination
          currentPage={1}
          totalPages={5}
          onPageChange={(page) => alert(`Page changed to ${page}`)}
        />
      </section>

      {/* ProfileCard */}
      <section>
        <h2>ProfileCard</h2>
        <ProfileCard
          userData={{
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
            phone_number: "123-456-7890",
            address: "123 Main St, City, Country",
          }}
          type="consumer"
        />
      </section>

      {/* SearchBar */}
      <section>
        <h2>SearchBar</h2>
        <SearchBar placeholder="Search..." onSearch={(value) => alert(`Search: ${value}`)} />
      </section>

      {/* Table */}
      <section>
        <h2>Table</h2>
        <Table
          data={[
            { id: 1, name: "John Doe", email: "john.doe@example.com" },
            { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
          ]}
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
          ]}
        />
      </section>

      {/* TableWithControl */}
      <section>
        <h2>TableWithControl</h2>
        <TableWithControl
          data={[
            { id: 1, name: "John Doe", email: "john.doe@example.com" },
            { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
          ]}
          columns={[
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
          ]}
          onRowClick={(row) => alert(`Row clicked: ${row.name}`)}
        />
      </section>
    </div>
  );
};

export default WidgetPage;