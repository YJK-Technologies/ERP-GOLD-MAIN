import React, { useState, useEffect, useRef } from "react";
import "./input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import "./apps.css";
import Select from "react-select";
import LoadingScreen from "./Loading";

const config = require("./Apiconfig");

function CurrencyExchangeRateInput({}) {
  // Input fields state
  const [Exchange_Rate_ID, setExchangeRateId] = useState("");
  const [From_Currency_ID, setFromCurrencyId] = useState("");
  const [To_Currency_ID, setToCurrencyId] = useState("");
  const [Exchange_Rate, setExchangeRate] = useState("");
  const [Effective_Date, setEffectiveDate] = useState("");
  const [Status, setStatus] = useState("");

  const [error, setError] = useState("");
  const [statusdrop, setStatusdrop] = useState([]);
  const [selectedStatus, setselectedStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};

  // Refs for Enter-Key Navigation
  const refExchangeRateId = useRef(null);
  const refFromCurrencyId = useRef(null);
  const refToCurrencyId = useRef(null);
  const refExchangeRate = useRef(null);
  const refEffectiveDate = useRef(null);
  const refStatus = useRef(null);

  const clearInputFields = () => {
    setExchangeRateId("");
    setFromCurrencyId("");
    setToCurrencyId("");
    setExchangeRate("");
    setEffectiveDate("");
    setStatus("");
    setselectedStatus("");
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setExchangeRateId(selectedRow.Exchange_Rate_ID || "");
      setFromCurrencyId(selectedRow.From_Currency_ID || "");
      setToCurrencyId(selectedRow.To_Currency_ID || "");
      setExchangeRate(selectedRow.Exchange_Rate || "");

      if (selectedRow.Effective_Date) {
        const formattedDate = new Date(selectedRow.Effective_Date)
          .toISOString()
          .split("T")[0];
        setEffectiveDate(formattedDate);
      } else {
        setEffectiveDate("");
      }

      const rowStatus = selectedRow.Status || selectedRow.status || "";
      setselectedStatus(
        rowStatus
          ? {
              label: rowStatus,
              value: rowStatus,
            }
          : ""
      );
      setStatus(rowStatus);
    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  // Fetch Status Dropdown
  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error("Error fetching status data:", error));
  }, []);

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeStatus = (selectedOption) => {
    setselectedStatus(selectedOption);
    setStatus(selectedOption ? selectedOption.value : "");
  };

  const handleInsert = async () => {
    if (
    //   !Exchange_Rate_ID ||
      !From_Currency_ID ||
      !To_Currency_ID ||
      !Exchange_Rate ||
      !Effective_Date ||
      !Status
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Exchange_Rate_ID,
        From_Currency_ID,
        To_Currency_ID,
        Exchange_Rate,
        Effective_Date,
        Status,
        created_by: sessionStorage.getItem("selectedUserCode"),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        location_code: sessionStorage.getItem("selectedLocationCode"),
      };

      const response = await fetch(
        `${config.apiBaseUrl}/CurrencyExchangeRateInsert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 200) {
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(),
          });
        }, 1000);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (
    //   !Exchange_Rate_ID ||
      !From_Currency_ID ||
      !To_Currency_ID ||
      !Exchange_Rate ||
      !Effective_Date ||
      !Status
    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Exchange_Rate_ID,
        From_Currency_ID,
        To_Currency_ID,
        Exchange_Rate,
        Effective_Date,
        Status,
        modified_by: sessionStorage.getItem("selectedUserCode"),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        location_code: sessionStorage.getItem("selectedLocationCode"),
      };

      const response = await fetch(
        `${config.apiBaseUrl}/CurrencyExchangeRateUpdate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 200) {
        setIsUpdated(true);
        toast.success("Data Updated successfully!");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      toast.error("Error updating data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    navigate("/CurrExeRate", {
      state: {
        preservedRowData: location.state?.preservedRowData,
        preservedInputs: location.state?.preservedInputs,
      },
    });
  };

  const handleKeyDown = async (
    e,
    nextFieldRef,
    value,
    hasValueChanged,
    setHasValueChanged
  ) => {
    if (e.key === "Enter") {
      if (hasValueChanged && typeof setHasValueChanged === "function") {
        setHasValueChanged(false);
      }
      if (value && nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      <div>
        <div>
          {loading && <LoadingScreen />}
          <ToastContainer
            position="top-right"
            className="toast-design"
            theme="colored"
          />

          <div className="shadow-lg p-0 bg-body-tertiary rounded">
            <div className="mb-0 d-flex justify-content-between">
              <h1 align="left" className="purbut">
                {mode === "update"
                  ? "Update Currency Exchange Rate Details"
                  : "Add Currency Exchange Rate Details"}
              </h1>
              <h1 align="left" className="fs-4 mobileview">
                {mode === "update"
                  ? "Update Exchange Rate"
                  : "Currency Exchange Rate Details"}
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

          <div className="pt-2 mb-4">
            <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
              <div className="row">
                {/* <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <div>
                        <label htmlFor="erid" className={`exp-form-labels ${ error && !Exchange_Rate_ID ? "text-danger" : "" }`} >
                          Exchange Rate ID<span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <input
                      id="erid"
                      className="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required
                      title="Please enter the Exchange Rate ID"
                      value={Exchange_Rate_ID}
                      onChange={(e) => setExchangeRateId(e.target.value)}
                      maxLength={20}
                      ref={refExchangeRateId}
                      onKeyDown={(e) =>
                        handleKeyDown(
                          e,
                          refFromCurrencyId,
                          Exchange_Rate_ID,
                          hasValueChanged,
                          setHasValueChanged
                        )
                      }
                      readOnly={mode === "update"}
                    />
                  </div>
                </div> */}

                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <div>
                        <label htmlFor="fromcur" className={`exp-form-labels ${ error && !From_Currency_ID ? "text-danger" : "" }`} >
                          From Currency ID<span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <input
                      id="fromcur"
                      className="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required
                      title="Please enter the From Currency ID"
                      value={From_Currency_ID}
                      onChange={(e) => setFromCurrencyId(e.target.value)}
                      maxLength={20}
                      ref={refFromCurrencyId}
                      onKeyDown={(e) =>
                        handleKeyDown(
                          e,
                          refToCurrencyId,
                          From_Currency_ID,
                          hasValueChanged,
                          setHasValueChanged
                        )
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <div>
                        <label
                          htmlFor="tocur"
                          className={`exp-form-labels ${
                            error && !To_Currency_ID ? "text-danger" : ""
                          }`}
                        >
                          To Currency ID<span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <input
                      id="tocur"
                      className="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required
                      title="Please enter the To Currency ID"
                      value={To_Currency_ID}
                      onChange={(e) => setToCurrencyId(e.target.value)}
                      maxLength={20}
                      ref={refToCurrencyId}
                      onKeyDown={(e) =>
                        handleKeyDown(
                          e,
                          refExchangeRate,
                          To_Currency_ID,
                          hasValueChanged,
                          setHasValueChanged
                        )
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <div>
                        <label
                          htmlFor="exrate"
                          className={`exp-form-labels ${
                            error && !Exchange_Rate ? "text-danger" : ""
                          }`}
                        >
                          Exchange Rate<span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <input
                      id="exrate"
                      className="exp-input-field form-control"
                      type="number"
                      step="any"
                      placeholder=""
                      required
                      title="Please enter the Exchange Rate"
                      value={Exchange_Rate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      ref={refExchangeRate}
                      onKeyDown={(e) =>
                        handleKeyDown(
                          e,
                          refEffectiveDate,
                          Exchange_Rate,
                          hasValueChanged,
                          setHasValueChanged
                        )
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <div>
                        <label
                          htmlFor="effdate"
                          className={`exp-form-labels ${
                            error && !Effective_Date ? "text-danger" : ""
                          }`}
                        >
                          Effective Date<span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <input
                      id="effdate"
                      className="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required
                      title="Please enter the Effective Date"
                      value={Effective_Date}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      ref={refEffectiveDate}
                      onKeyDown={(e) =>
                        handleKeyDown(
                          e,
                          refStatus,
                          Effective_Date,
                          hasValueChanged,
                          setHasValueChanged
                        )
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <div className="d-flex justify-content-start">
                      <div>
                        <label
                          htmlFor="status"
                          className={`exp-form-labels ${
                            error && !Status ? "text-danger" : ""
                          }`}
                        >
                          Status<span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <div title="Select the Status">
                      <Select
                        id="status"
                        value={selectedStatus}
                        onChange={handleChangeStatus}
                        options={filteredOptionStatus}
                        className="exp-input-field"
                        placeholder=""
                        ref={refStatus}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (mode === "update") {
                              handleUpdate();
                            } else {
                              handleInsert();
                            }
                          }
                        }}
                        classNamePrefix="react-select"
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-3 form-group d-flex justify-content-start mb-4">
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
                      className="mt-4"
                      title="Update"
                      onClick={handleUpdate}
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
}

export default CurrencyExchangeRateInput;