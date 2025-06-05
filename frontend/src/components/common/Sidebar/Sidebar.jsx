import React from "react";
import { BiCar } from "react-icons/bi";

const menuItems = [
  {
    title: "Insurance",
    icon: <BiCar />,
    children: [
      {
        title: "Vehicle Insurance",
        path: "/dashboard/insurance/vehicle",
      },
      {
        title: "Life Insurance",
        path: "/dashboard/insurance/life",
      },
      {
        title: "Fire Insurance",
        path: "/dashboard/insurance/fire",
      },
      {
        title: "Companies",
        path: "/dashboard/insurance/companies",
      },
    ],
  },
];

export default menuItems; 