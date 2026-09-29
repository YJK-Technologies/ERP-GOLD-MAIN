import React, { useState, useEffect, useRef } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import LoadingScreen from "../Loading";

const config = require("../Apiconfig");

function AddFinancial_YearScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode and Row Data passed from Grid
  const { mode = "create", selectedRow } = location.state || {};

  // Form Field States
  const [financialYearId, setFinancialYearId] = useState(0);
  const [financialYearCode, setFinancialYearCode] = useState("");
  const [financialYearName, setFinancialYearName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [keyfield, setKeyfield] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [locationCode, setLocationCode] = useState("");

  // Dropdown & UI States
  const [statusdrop, setStatusdrop] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  // Field References for Keyboard Navigation
  const finYearCodeRef = useRef(null);
  const finYearNameRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const statusRef = useRef(null);

  // Helper to format ISO dates to YYYY-MM-DD for <input type="date" />
  const formatDateForInput = (dateVal) => {
    if (!dateVal) return "";
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) {
        return String(dateVal).split("T")[0];
      }
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Navigate back preserving Grid state
  const handleNavigate = () => {
    navigate(-1);
  };

  // Fetch Status Options from API
  useEffect(() => {
    const sessionCompany = sessionStorage.getItem("selectedCompanyCode");

    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code: sessionCompany }),
    })
      .then((res) => res.json())
      .then((val) => setStatusdrop(val))
      .catch((err) => console.error("Error fetching status dropdown:", err));
  }, []);

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeStatus = (selected) => {
    setSelectedStatus(selected);
    setStatus(selected ? selected.value : "");
  };

  const clearInputFields = () => {
    setFinancialYearId(0);
    setFinancialYearCode("");
    setFinancialYearName("");
    setStartDate("");
    setEndDate("");
    setStatus("");
    setSelectedStatus(null);
    setKeyfield("");
    setError(false);
  };

  // Populate data when Mode is Update
  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setFinancialYearId(
        selectedRow.Financial_Year_ID || selectedRow.financial_year_id || 0
      );
      setFinancialYearCode(
        selectedRow.Financial_Year_Code || selectedRow.financial_year_code || ""
      );
      setFinancialYearName(
        selectedRow.Financial_Year_Name || selectedRow.financial_year_name || ""
      );
      setStartDate(
        formatDateForInput(selectedRow.Start_Date || selectedRow.start_date)
      );
      setEndDate(
        formatDateForInput(selectedRow.End_Date || selectedRow.end_date)
      );
      setKeyfield(selectedRow.Keyfield || selectedRow.keyfield || "");
      setCompanyCode(selectedRow.company_code || "");
      setLocationCode(
        selectedRow.Location_Code || selectedRow.location_code || ""
      );

      const statusVal = selectedRow.Status || selectedRow.status;
      if (statusVal) {
        setStatus(statusVal);
        setSelectedStatus({
          label: statusVal,
          value: statusVal,
        });
      }
    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  // Insert Handler
  const handleInsert = async () => {
    if (
      !financialYearCode.trim() ||
      !financialYearName.trim() ||
      !startDate ||
      !endDate ||
      !status
    ) {
      setError(true);
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
          Keyfield: keyfield,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          location_code: sessionStorage.getItem("selectedLocationCode"),
          created_by: sessionStorage.getItem("selectedUserCode"),
          created_date: new Date().toISOString(),
        }),
      });

      if (response.status === 200 || response.ok) {
        toast.success("Financial Year inserted successfully!");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert Financial Year");
      }
    } catch (err) {
      console.error("Error inserting data:", err);
      toast.error("Error inserting data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Handler
  const handleUpdate = async () => {
    if (
      !financialYearCode.trim() ||
      !financialYearName.trim() ||
      !startDate ||
      !endDate ||
      !status
    ) {
      setError(true);
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
          Keyfield: keyfield,
          company_code:  sessionStorage.getItem("selectedCompanyCode"),
          location_code: sessionStorage.getItem("selectedLocationCode"),
          modified_by: sessionStorage.getItem("selectedUserCode"),
          modified_date: new Date().toISOString(),
        }),
      });

      if (response.status === 200 || response.ok) {
        setIsUpdated(true);
        toast.success("Financial Year updated successfully!");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to update Financial Year");
      }
    } catch (err) {
      console.error("Error updating data:", err);
      toast.error("Error updating data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard Enter navigation
  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextFieldRef?.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      <div>
        {loading && <LoadingScreen />}
        <ToastContainer position="top-right" className="toast-design" theme="colored"/>
        {/* Top Header Card */}
        <div className="shadow-lg p-0 bg-body-tertiary rounded">
          <div className="mb-0 d-flex justify-content-between align-items-center">
            <h1 align="left" className="purbut">
              {mode === "update"? "Update Financial Year": "Add Financial Year"}
            </h1>
            <h1 align="left" className="mobileview fs-4">
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

        {/* Form Input Card */}
        <div className="pt-2 mb-4">
          <div className="shadow-lg p-1 bg-body-tertiary rounded pt-3 pb-3">
            <div className="row ms-3 me-3">
              {/* Financial Year Code */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <label htmlFor="finYearCode" className={`exp-form-labels ${error && !financialYearCode.trim() ? "text-danger" : "" }`}>
                      Financial Year Code<span className="text-danger">*</span>
                    </label>
                  </div>
                  <input
                    id="finYearCode"
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    title="Please enter the Financial Year Code"
                    value={financialYearCode}
                    onChange={(e) => setFinancialYearCode(e.target.value)}
                    maxLength={20}
                    ref={finYearCodeRef}
                    readOnly={mode === "update"}
                    onKeyDown={(e) => handleKeyDown(e, finYearNameRef)}
                  />
                </div>
              </div>

              {/* Financial Year Name */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <label htmlFor="finYearName" className={`exp-form-labels ${ error && !financialYearName.trim() ? "text-danger" : "" }`}>
                      Financial Year Name<span className="text-danger">*</span>
                    </label>
                  </div>
                  <input
                    id="finYearName"
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    title="Please enter the Financial Year Name"
                    value={financialYearName}
                    onChange={(e) => setFinancialYearName(e.target.value)}
                    maxLength={100}
                    ref={finYearNameRef}
                    onKeyDown={(e) => handleKeyDown(e, startDateRef)}
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <label htmlFor="startDate" className={`exp-form-labels ${ error && !startDate ? "text-danger" : "" }`} >
                      Start Date<span className="text-danger">*</span>
                    </label>
                  </div>
                  <input
                    id="startDate"
                    className="exp-input-field form-control"
                    type="date"
                    required
                    title="Select the Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    ref={startDateRef}
                    onKeyDown={(e) => handleKeyDown(e, endDateRef)}
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <label htmlFor="endDate" className={`exp-form-labels ${ error && !endDate ? "text-danger" : "" }`} >
                      End Date<span className="text-danger">*</span>
                    </label>
                  </div>
                  <input
                    id="endDate"
                    className="exp-input-field form-control"
                    type="date"
                    required
                    title="Select the End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    ref={endDateRef}
                    onKeyDown={(e) => handleKeyDown(e, statusRef)}
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <label
                      htmlFor="status"
                      className={`exp-form-labels ${ error && !selectedStatus?.value ? "text-danger" : "" }`} >
                      Status<span className="text-danger">*</span>
                    </label>
                  </div>
                  <div title="Select the Status">
                    <Select
                      id="status"
                      value={selectedStatus}
                      onChange={handleChangeStatus}
                      options={filteredOptionStatus}
                      className="exp-input-field"
                      placeholder=""
                      required
                      ref={statusRef}
                      classNamePrefix="react-select"
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (mode === "create") {
                            handleInsert();
                          } else {
                            handleUpdate();
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="col-md-3 form-group">
                {mode === "create" ? (
                  <button
                    onClick={handleInsert}
                    className="mt-4"
                    title="Save"
                  >
                    <i className="fa-solid fa-floppy-disk"></i>
                  </button>
                ) : (
                  <button
                    onClick={handleUpdate}
                    className="mt-4"
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
  );
}

export default AddFinancial_YearScreen;