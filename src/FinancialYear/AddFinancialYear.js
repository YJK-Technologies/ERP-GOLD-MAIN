import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "../input.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingScreen from '../Loading';
const config = require('../Apiconfig');

const AddFinancial_YearScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Checking if mode is create or update (Defaulting to create)
  const { mode = "create" } = location.state || {};

  // State variables for form fields
  const [financialYearCode, setFinancialYearCode] = useState("");
  const [financialYearName, setFinancialYearName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [financialYearId, setFinancialYearId] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [statusdrop, setStatusdrop] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNavigate = () => {
    navigate(-1); // Go back to the previous screen
  };

    useEffect(() => {
      const company_code = sessionStorage.getItem('selectedCompanyCode');
  
      fetch(`${config.apiBaseUrl}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_code })
      })
        .then((data) => data.json())
        .then((val) => setStatusdrop(val))
        .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : '');
  };

    const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

const handleSave = async () => {
    // Validation
    if (!financialYearCode || !financialYearName || !startDate || !endDate || !status) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/Financial_YearInsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Financial_Year_ID: financialYearId || 0, 
          Financial_Year_Code: financialYearCode,
          Financial_Year_Name: financialYearName,
          Start_Date: startDate,
          End_Date: endDate,
          Status: status,
          Keyfield: "", 
          company_code: companyCode || sessionStorage.getItem("selectedCompanyCode"),
          location_code: sessionStorage.getItem("selectedLocationCode") || "",
          created_by: sessionStorage.getItem("selectedUserCode"),
          created_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Financial Year inserted successfully", {
          onClose: () => handleNavigate(), 
        });
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!financialYearCode || !financialYearName || !startDate || !endDate || !status) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/Financial_YearUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Financial_Year_ID: financialYearId,
          Financial_Year_Code: financialYearCode,
          Financial_Year_Name: financialYearName,
          Start_Date: startDate,
          End_Date: endDate,
          Status: status,
          Keyfield: "",
          company_code: companyCode || sessionStorage.getItem("selectedCompanyCode"),
          location_code: sessionStorage.getItem("selectedLocationCode") || "",
          modified_by: sessionStorage.getItem("selectedUserCode"),
          modified_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Financial Year updated successfully", {
          onClose: () => handleNavigate(), 
        });
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("Error updating data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      <div className="col-md-12 text-center">
        <div>
          {/* HEADER SECTION */}
          <ToastContainer
                      position="top-right"
                      className="toast-design" // Adjust this value as needed
                      theme="colored"
                    />
          <div className="shadow-lg p-0 bg-body-tertiary rounded mb-3">
            <div className="mb-0 d-flex justify-content-between align-items-center">
              <h1 align="left" className="purbut mb-0">
                {mode === "update" ? "Update Financial Year" : "Add Financial Year"}
              </h1>
              <h1 align="left" className="fs-4 mobileview mb-0">
                {mode === "update" ? "Update Financial Year" : "Add Financial Year"}
              </h1>
              <button
                onClick={handleNavigate}
                className="btn btn-danger shadow-none rounded-0 h-70 fs-5"
                required
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* FORM SECTION */}
          <div className="pt-2 mb-4">
            <div className="shadow-lg p-3 bg-body-tertiary rounded">
              <div className="row">
                
                {/* Financial Year Code */}
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <label htmlFor="finYearCode" class="exp-form-labels" className={`${error && !financialYearCode ? "text-danger" : ""}`}>
                        Financial Year Code<span className="text-danger">*</span>
                      </label>
                    </div>
                    <input
                      id="finYearCode"
                      className="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      value={financialYearCode}
                      onChange={(e) => setFinancialYearCode(e.target.value)}
                    />
                  </div>
                </div>

                {/* Financial Year Name */}
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <label htmlFor="finYearName" class="exp-form-labels" className={`${error && !financialYearName ? "text-danger" : ""}`}>
                        Financial Year Name<span className="text-danger">*</span>
                      </label>
                    </div>
                    <input
                      id="finYearName"
                      className="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      value={financialYearName}
                      onChange={(e) => setFinancialYearName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <label htmlFor="startDate" class="exp-form-labels" className={`${error && !startDate ? "text-danger" : ""}`}>
                        Start Date<span className="text-danger">*</span>
                      </label>
                    </div>
                    <input
                      id="startDate"
                      className="exp-input-field form-control"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <label htmlFor="endDate" class="exp-form-labels" className={`${error && !endDate ? "text-danger" : ""}`}>
                        End Date<span className="text-danger">*</span>
                      </label>
                    </div>
                    <input
                      id="endDate"
                      className="exp-input-field form-control"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <label class="exp-form-labels"  className={`${error && !status ? "text-danger" : ""}`}>
                        Status<span className="text-danger">*</span>
                      </label>
                    </div>
                    <div title="Select the Status">
                      <Select
                        value={selectedStatus}
                        onChange={handleChangeStatus}
                        options={filteredOptionStatus}
                        className="exp-input-field"
                        placeholder=""
                        classNamePrefix="react-select"
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-md-3 form-group d-flex justify-content-start mb-4">
                  {mode === "create" ? (
                    <button
                      onClick={handleSave}
                      className="mt-4 btn-save-custom"
                      title="Save"
                    >
                      <i className="fa-solid fa-floppy-disk"></i>
                    </button>
                  ) : (
                    <button
                      onClick={handleUpdate}
                      className="mt-4 btn-update-custom"
                      title="Update"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddFinancial_YearScreen;