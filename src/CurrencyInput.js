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

function CurrencyInput({}) {
  // Input fields state
  const [Currency_ID, setCurrencyId] = useState("");
  const [Currency_Code, setCurrencyCode] = useState("");
  const [Currency_Name, setCurrencyName] = useState("");
  const [Currency_Symbol, setCurrencySymbol] = useState("");
  const [Decimal_Places, setDecimalPlaces] = useState("");
  const [Currency_Type, setCurrencyType] = useState("");
  const [typeDrop, setTypeDrop] = useState([]);
  const [selectedCurrencyType, setSelectedCurrencyType] = useState("");
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
  const refCode = useRef(null);
  const refName = useRef(null);
  const refSymbol = useRef(null);
  const refDecimal = useRef(null);
  const refType = useRef(null);
  const refStatus = useRef(null);

  const clearInputFields = () => {
    setCurrencyId("");
    setCurrencyCode("");
    setCurrencyName("");
    setCurrencySymbol("");
    setDecimalPlaces("");
    setCurrencyType("");
    setStatus("");
    setselectedStatus("");
    setCurrencyType("");
    setSelectedCurrencyType("");
  };

  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setCurrencyId(selectedRow.Currency_ID || "");
      setCurrencyCode(selectedRow.Currency_Code || "");
      setCurrencyName(selectedRow.Currency_Name || "");
      setCurrencySymbol(selectedRow.Currency_Symbol || "");
      setDecimalPlaces(selectedRow.Decimal_Places || "");
      setSelectedCurrencyType({
        label: selectedRow.Currency_Type,
        value: selectedRow.Currency_Type,
      });
      setCurrencyType(selectedRow.Currency_Type || "");
      setselectedStatus({
        label: selectedRow.Status,
        value: selectedRow.Status,
      });
      setStatus(selectedRow.Status || "");
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
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");

    fetch(`${config.apiBaseUrl}/CurrencyType`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code }),
    })
      .then((response) => response.json())
      .then((data) => setTypeDrop(Array.isArray(data) ? data : []))
      .catch((error) =>
        console.error("Error fetching Currency Type:", error)
      );
  }, []);

  const filteredOptionCurrencyType = typeDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));
  
  const handleChangeCurrencyType = (selectedOption) => {
    setSelectedCurrencyType(selectedOption);
    setCurrencyType(selectedOption ? selectedOption.value : "");
  };

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeStatus = (selectedStatus) => {
    setselectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : "");
  };

  const handleInsert = async () => {
    if (!Currency_Code || !Currency_Name || !Status || !Currency_Type || !Decimal_Places) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Currency_Code,
        Currency_Name,
        Currency_Symbol,
        Decimal_Places,
        Currency_Type,
        Status,
        created_by: sessionStorage.getItem("selectedUserCode"),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        location_code: sessionStorage.getItem("selectedLocationCode"),
      };

      const response = await fetch(`${config.apiBaseUrl}/CurrencyInsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 200) {
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => handleNavigate(),
          });
        }, 1000);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      toast.error("Error inserting data: " + error.message, {});
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!Currency_Code || !Currency_Name || !Status || !Currency_Type || !Decimal_Places) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Currency_ID,
        Currency_Code,
        Currency_Name,
        Currency_Symbol,
        Decimal_Places,
        Currency_Type,
        Status,
        modified_by: sessionStorage.getItem("selectedUserCode"),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        location_code: sessionStorage.getItem("selectedLocationCode"),
      };

      const response = await fetch(`${config.apiBaseUrl}/CurrencyUpdate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
    navigate("/CurrencyMaster", {
      state: {
        preservedRowData: location.state?.preservedRowData,
        preservedInputs: location.state?.preservedInputs,
      },
    });
  };

  const handleKeyDown = async (e, nextFieldRef, hasValueChanged, setHasValueChanged) => {
    if (e.key === "Enter") {
      if (hasValueChanged && typeof setHasValueChanged === 'function') {
        setHasValueChanged(false);
      }
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault();
      }
    }
  };

  return (
    <div class="container-fluid Topnav-screen ">
      <div className="">
        <div class="">
          {loading && <LoadingScreen />}
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          
          <div className="shadow-lg p-0 bg-body-tertiary rounded">
            <div className=" mb-0 d-flex justify-content-between">
              <h1 align="left" class="purbut">
                {mode === "update" ? "Update Currency Details" : "Add Currency Details"}
              </h1>
              <h1 align="left" class="fs-4 mobileview">
                {mode === "update" ? "Update Currency" : "Add Currency"}
              </h1>
              <button
                onClick={handleNavigate}
                className=" btn btn-danger shadow-none rounded-0 h-70 fs-5"
                required
                title="Close"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          
          <div class="pt-2 mb-4">
            <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
              <div class="row">
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label class="exp-form-labels" className={`${error && !Currency_Code ? "text-danger" : ""}`}>
                          Currency Code<span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <input
                      class="exp-input-field form-control"
                      type="text"
                      required
                      title="Please enter the currency code"
                      value={Currency_Code}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      maxLength={10}
                      ref={refCode}
                      onKeyDown={(e) => handleKeyDown(e, refName)}
                      readOnly={mode === "update"}
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label class="exp-form-labels" className={`${error && !Currency_Name ? "text-danger" : ""}`}>
                          Currency Name<span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <input
                      class="exp-input-field form-control"
                      type="text"
                      required
                      title="Please enter the currency name"
                      value={Currency_Name}
                      onChange={(e) => setCurrencyName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, refSymbol)}
                      maxLength={150}
                      ref={refName}
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label class="exp-form-labels">Currency Symbol</label>
                      </div>
                    </div>
                    <input
                      class="exp-input-field form-control"
                      type="text"
                      value={Currency_Symbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      maxLength={5}
                      ref={refSymbol}
                      onKeyDown={(e) => handleKeyDown(e, refDecimal)}
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label class="exp-form-labels" className={`${error && !Decimal_Places ? "text-danger" : ""}`}>
                        Decimal Places<span className="text-danger">*</span></label>
                      </div>
                    </div>
                    <input
                      class="exp-input-field form-control"
                      type="number"
                      value={Decimal_Places}
                      onChange={(e) => setDecimalPlaces(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      ref={refDecimal}
                      onKeyDown={(e) => handleKeyDown(e, refType)}
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label class="exp-form-labels" className={`${error && !Currency_Type ? "text-danger" : ""}`}>
                        Currency Type<span className="text-danger">*</span></label>
                      </div>
                    </div>
                    <Select
                      value={selectedCurrencyType}
                      onChange={handleChangeCurrencyType}
                      options={filteredOptionCurrencyType}
                      className="exp-input-field"
                      placeholder=""
                      ref={refType}
                      onKeyDown={(e) => handleKeyDown(e, refStatus)}
                      isClearable
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

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label class="exp-form-labels" className={`${error && !Status ? "text-danger" : ""}`}>
                          Status<span className="text-danger">*</span>
                        </label>
                      </div>
                    </div>
                    <div title="Select the Status ">
                      <Select
                        value={selectedStatus}
                        onChange={handleChangeStatus}
                        options={filteredOptionStatus}
                        className="exp-input-field"
                        placeholder=""
                        ref={refStatus}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (mode === "update") handleUpdate();
                            else handleInsert();
                          } 
                        }}
                        classNamePrefix="react-select"
                        isClearable
                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                      />
                    </div>
                  </div>
                </div>

                <div class="col-md-12 form-group d-flex justify-content-end mb-4">
                  {mode === "create" ? (
                    <button onClick={handleInsert} className="mt-4" title="Save">
                      <i class="fa-solid fa-floppy-disk"></i>
                    </button>
                  ) : (
                    <button className="mt-4" title="Update" onClick={handleUpdate}>
                      <i class="fa-solid fa-pen-to-square"></i>
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

export default CurrencyInput;