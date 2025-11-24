const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const InsuranceCompany = require("./insuranceCompanyModel");
const Company = require("./companyModel");
const Consumer = require("./consumerModel");

const VehiclePolicy = sequelize.define(
  "VehiclePolicy",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    business_type: {
      type: DataTypes.ENUM("Fresh/New", "Renewal/Rollover", "Endorsement"),
      allowNull: false,
    },
    customer_type: {
      type: DataTypes.ENUM("Organisation", "Individual"),
      allowNull: false,
    },
    insurance_company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InsuranceCompany,
        key: "id",
      },
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // For Organisation
      references: {
        model: "Companies",
        key: "company_id",
      },
    },
    consumer_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // For Individual
      references: {
        model: "Consumers",
        key: "consumer_id",
      },
    },
    organisation_or_holder_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    policy_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true, // Auto fetch
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: true, // Auto fetch
    },
    policy_start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    policy_end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sub_product: {
      type: DataTypes.ENUM(
        "Two Wheeler",
        "Private car",
        "Passanger Vehicle",
        "Goods Vehicle",
        "Misc - D Vehicle",
        "Standalone CPA"
      ),
      allowNull: false,
    },
    vehicle_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    segment: {
      type: DataTypes.ENUM("Comprehensive", "TP Only", "SAOD"),
      allowNull: false,
    },
    manufacturing_company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manufacturing_year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idv: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    net_premium: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gst: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gross_premium: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    policy_document_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "expired", "cancelled"),
      defaultValue: "active",
    },
    previous_policy_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "PreviousVehiclePolicies",
        key: "id",
      },
      comment:
        "Reference to the previous policy ID that was renewed (if this is a renewal)",
    },
  },
  {
    tableName: "VehiclePolicies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    modelName: "VehiclePolicy",
    indexes: [
      {
        unique: true,
        fields: ["policy_number"],
      },
      {
        fields: ["previous_policy_id"],
      },
    ],
  }
);

module.exports = VehiclePolicy;
