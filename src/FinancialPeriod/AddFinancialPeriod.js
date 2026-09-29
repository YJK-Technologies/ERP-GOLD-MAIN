import React, { useState, useEffect, useRef } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import LoadingScreen from "../Loading";

const config = require("../Apiconfig");

function AddFinancialPeriod() {
    const [financialYearId, setFinancialYearId] = useState("");
    const [periodCode, setPeriodCode] = useState("");
    const [periodName, setPeriodName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("");
    const [financialPeriodId, setFinancialPeriodId] = useState("");
    const [keyfield, setKeyfield] = useState("");

    // Dropdown States
    const [yearOptions, setYearOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);

    const [statusDrop, setStatusDrop] = useState([]);
    const [financialYearIdDrop, setFinancialYearIdDrop] = useState([]);

    // Layout & Operation States
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);

    // Field Focus Refs
    const yearRef = useRef(null);
    const periodCodeRef = useRef(null);
    const periodNameRef = useRef(null);
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);
    const statusRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { mode, selectedRow } = location.state || {};

    // Fetch Financial Year Dropdown Options
    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        const location_code = sessionStorage.getItem("selectedLocationCode");

        fetch(`${config.apiBaseUrl}/getFinancialYears`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code, location_code }),
        })
            .then((res) => res.json())
            .then((data) => {
                setFinancialYearIdDrop(data);
            })
            .catch((err) => console.error("Error fetching status dropdown:", err));
    }, []);

    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");

        fetch(`${config.apiBaseUrl}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code }),
        })
            .then((res) => res.json())
            .then((data) => {
                setStatusDrop(data);
            })
            .catch((err) => console.error("Error fetching status dropdown:", err));
    }, []);

    const filteredOptionStatus = Array.isArray(statusDrop)
        ? statusDrop.map((option) => ({
            value: option.attributedetails_name,
            label: option.attributedetails_name,
        }))
        : [];

    const filteredOptionFinancialYear = Array.isArray(financialYearIdDrop)
        ? financialYearIdDrop.map((option) => ({
            value: option.Keyfield,
            label: option.Keyfield,
        }))
        : [];

    // Set initial input states when editing existing data
    useEffect(() => {
        if (mode === "update" && selectedRow && !isUpdated) {
            setFinancialPeriodId(selectedRow.Financial_Period_ID || "");
            setPeriodCode(selectedRow.Period_Code || "");
            setPeriodName(selectedRow.Period_Name || "");
            setStartDate(selectedRow.Start_Date ? selectedRow.Start_Date.substring(0, 10) : "");
            setEndDate(selectedRow.End_Date ? selectedRow.End_Date.substring(0, 10) : "");
            setKeyfield(selectedRow.Keyfield || "");

            if (selectedRow.Financial_Year_ID) {
                setSelectedYear({
                    label: selectedRow.Financial_Year_ID,
                    value: selectedRow.Financial_Year_ID,
                });
                setFinancialYearId(selectedRow.Financial_Year_ID);
            }
            if (selectedRow.Status) {
                setSelectedStatus({
                    label: selectedRow.Status,
                    value: selectedRow.Status,
                });
                setStatus(selectedRow.Status);
            }
        } else if (mode === "create") {
            clearInputFields();
        }
    }, [mode, selectedRow, isUpdated]);

    const clearInputFields = () => {
        setFinancialPeriodId("");
        setPeriodCode("");
        setPeriodName("");
        setStartDate("");
        setEndDate("");
        setSelectedYear(null);
        setSelectedStatus(null);
        setFinancialYearId("");
        setStatus("");
        setError(false);
    };

    const handleYearChange = (selected) => {
        setSelectedYear(selected);
        setFinancialYearId(selected ? selected.value : "");
    };

    const handleStatusChange = (selected) => {
        setSelectedStatus(selected);
        setStatus(selected ? selected.value : "");
    };

    // Keyboard navigation helper
    const handleKeyDown = (e, nextRef) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
            }
        }
    };

    // Insert Record Handler
    const handleInsert = async () => {
        if (!financialYearId || !periodCode?.trim() || !periodName?.trim() || !startDate || !endDate || !status) {
            setError(true);
            toast.warning("Error: Missing required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/AddFinancialPeriod`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Financial_Year_ID: financialYearId,
                    Period_Code: periodCode,
                    Period_Name: periodName,
                    Start_Date: startDate,
                    End_Date: endDate,
                    Status: status,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode"),
                    created_by: sessionStorage.getItem("selectedUserCode"),
                }),
            });

            if (response.status === 200) {
                setTimeout(() => {
                    toast.success("Data inserted successfully!", {
                        onClose: () => window.location.reload(),
                    });
                }, 1000);
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to insert record");
            }
        } catch (err) {
            toast.error("Error inserting data: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update Record Handler
    const handleUpdate = async () => {
        if (!financialYearId || !periodCode?.trim() || !periodName?.trim() || !startDate || !endDate || !status) {
            setError(true);
            toast.warning("Error: Missing required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/FinancialPeriodUpdate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Financial_Period_ID: parseInt(financialPeriodId, 10),
                    Financial_Year_ID: financialYearId,
                    Period_Code: periodCode,
                    Period_Name: periodName,
                    Start_Date: startDate,
                    End_Date: endDate,
                    Status: status,
                    Keyfield: keyfield,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode"),
                    modified_by: sessionStorage.getItem("selectedUserCode"),
                    modified_date: new Date().toISOString(),
                }),
            });

            if (response.status === 200) {
                setIsUpdated(true);
                toast.success("Data Updated successfully!");
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to update record");
            }
        } catch (err) {
            toast.error("Error updating data: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = () => {
        navigate("/FinancialPeriod", {
            state: {
                preservedRowData: location.state?.preservedRowData,
                preservedInputs: location.state?.preservedInputs,
            },
        });
    };

    const handlePeriodCodeChange = (e) => {
        const value = e.target.value;

        // Allow only letters, numbers and underscore
        if (/^[A-Za-z0-9_]*$/.test(value)) {
            setPeriodCode(value);
        }
    };

    return (
        <div className="container-fluid Topnav-screen">
            <div>
                {loading && <LoadingScreen />}
                <ToastContainer position="top-right" className="toast-design" theme="colored" />

                {/* Header Action Bar */}
                <div className="shadow-lg p-0 bg-body-tertiary rounded">
                    <div className="mb-0 d-flex justify-content-between">
                        <h1 align="left" className="purbut">
                            {mode === "update" ? "Update Financial Period" : "Add Financial Period"}
                        </h1>
                        <h1 align="left" className="mobileview fs-4">
                            {mode === "update" ? "Update Financial Period" : "Add Financial Period"}
                        </h1>
                        <button
                            type="button"
                            onClick={handleNavigate}
                            className="btn btn-danger shadow-none rounded-0 h-70 fs-5"
                            required
                            title="Close"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                {/* Input Fields Section */}
                <div className="pt-2 mb-4">
                    <div className="shadow-lg p-1 bg-body-tertiary rounded pt-3 pb-3">
                        <div className="row ms-3 me-3">
                            {/* Financial Year ID */}
                            <div className="col-md-3 form-group mb-2">
                                <div className="exp-form-floating">
                                    <label className={`exp-form-labels ${error && !financialYearId ? "text-danger" : ""}`}>
                                        Financial Year ID<span className="text-danger">*</span>
                                    </label>
                                    <div title="Select Financial Year ID">
                                        <Select
                                            ref={yearRef}
                                            value={selectedYear}
                                            onChange={handleYearChange}
                                            options={filteredOptionFinancialYear}
                                            className="exp-input-field"
                                            placeholder=""
                                            isDisabled={mode === "update"}
                                            onKeyDown={(e) => handleKeyDown(e, periodCodeRef)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Period Code */}
                            <div className="col-md-3 form-group mb-2">
                                <div className="exp-form-floating">
                                    <label className={`exp-form-labels ${error && !periodCode.trim() ? "text-danger" : ""}`}>
                                        Period Code<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        ref={periodCodeRef}
                                        className="exp-input-field form-control"
                                        type="text"
                                        placeholder=""
                                        required
                                        title="Please enter the Period Code"
                                        value={periodCode}
                                        readOnly={mode === "update"}
                                        onChange={handlePeriodCodeChange}
                                        onKeyDown={(e) => handleKeyDown(e, periodNameRef)}
                                        maxLength={20}
                                    />
                                </div>
                            </div>

                            {/* Period Name */}
                            <div className="col-md-3 form-group mb-2">
                                <div className="exp-form-floating">
                                    <label className={`exp-form-labels ${error && !periodName.trim() ? "text-danger" : ""}`}>
                                        Period Name<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        ref={periodNameRef}
                                        className="exp-input-field form-control"
                                        type="text"
                                        placeholder=""
                                        required
                                        title="Please enter the Period Name"
                                        value={periodName}
                                        onChange={(e) => setPeriodName(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, startDateRef)}
                                        maxLength={50}
                                    />
                                </div>
                            </div>

                            {/* Start Date */}
                            <div className="col-md-3 form-group mb-2">
                                <div className="exp-form-floating">
                                    <label className={`exp-form-labels ${error && !startDate ? "text-danger" : ""}`}>
                                        Start Date<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        ref={startDateRef}
                                        type="date"
                                        className="exp-input-field form-control"
                                        required
                                        title="Please select Start Date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, endDateRef)}
                                    />
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="col-md-3 form-group mb-2">
                                <div className="exp-form-floating">
                                    <label className={`exp-form-labels ${error && !endDate ? "text-danger" : ""}`}>
                                        End Date<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        ref={endDateRef}
                                        type="date"
                                        className="exp-input-field form-control"
                                        required
                                        title="Please select End Date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, statusRef)}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-md-3 form-group mb-2">
                                <div className="exp-form-floating">
                                    <label className={`exp-form-labels ${error && !status ? "text-danger" : ""}`}>
                                        Status<span className="text-danger">*</span>
                                    </label>
                                    <div title="Select the Status">
                                        <Select
                                            ref={statusRef}
                                            value={selectedStatus}
                                            onChange={handleStatusChange}
                                            options={filteredOptionStatus}
                                            className="exp-input-field"
                                            placeholder=""
                                            required
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    mode === "create" ? handleInsert() : handleUpdate();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Save/Update Button */}
                            <div className="col-md-3 form-group mb-2 d-flex align-items-center">
                                {mode === "create" ? (
                                    <button
                                        type="button"
                                        onClick={handleInsert}
                                        className="mt-4"
                                        title="Save"
                                    >
                                        <i className="fa-solid fa-floppy-disk me-1"></i>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleUpdate}
                                        className="mt-4"
                                        title="Update"
                                    >
                                        <i className="fa-solid fa-pen-to-square me-1"></i>
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

export default AddFinancialPeriod;