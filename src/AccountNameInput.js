import React, { useState, useEffect, useRef } from "react";
import "./input.css";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from './Loading';

const config = require("./Apiconfig");

function AddChart_of_accountsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode = "create", selectedData = {} } = location.state || {};

  // Form Field States
  const [account_code, setAccountCode] = useState(selectedData.account_code || "");
  const [account_name, setAccountName] = useState(selectedData.account_name || "");
  const [account_group, setAccountGroup] = useState(selectedData.account_group || "");
  const [account_class, setAccountClass] = useState(selectedData.account_class || "");
  const [report_section, setReportSection] = useState(selectedData.report_section || "");
  const [report_line, setReportLine] = useState(selectedData.report_line || "");
  const [report_type, setReportType] = useState(selectedData.report_type || "");
  const [currency_code, setCurrencyCode] = useState(selectedData.currency_code || "");
  const [iscontrolaccount, setIsControlAccount] = useState(selectedData.iscontrolaccount || false);
  const [isbankaccount, setIsBankAccount] = useState(selectedData.isbankaccount || false);
  const [allowmanualposting, setAllowManualPosting] = useState(selectedData.allowmanualposting || false);
  const [effectivefrom, setEffectiveFrom] = useState(selectedData.effectivefrom ? selectedData.effectivefrom.split('T')[0] : "");
  const [effectiveto, setEffectiveTo] = useState(selectedData.effectiveto ? selectedData.effectiveto.split('T')[0] : "");
  const [status, setStatus] = useState(selectedData.status || "");

  // Selected Option States for react-select
  const [selectedStatus, setSelectedStatus] = useState(selectedData.status ? { label: selectedData.status, value: selectedData.status } : null);
  const [selectedGroup, setSelectedGroup] = useState(selectedData.account_group ? { label: selectedData.account_group, value: selectedData.account_group } : null);
  const [selectedClass, setSelectedClass] = useState(selectedData.account_class ? { label: selectedData.account_class, value: selectedData.account_class } : null);
  const [selectedSection, setSelectedSection] = useState(selectedData.report_section ? { label: selectedData.report_section, value: selectedData.report_section } : null);
  const [selectedLine, setSelectedLine] = useState(selectedData.report_line ? { label: selectedData.report_line, value: selectedData.report_line } : null);
  const [selectedType, setSelectedType] = useState(selectedData.report_type ? { label: selectedData.report_type, value: selectedData.report_type } : null);
  const [selectedCurrency, setSelectedCurrency] = useState(selectedData.currency_code ? { label: selectedData.currency_code, value: selectedData.currency_code } : null);

  // Dropdown Data States
  const [statusdrop, setStatusdrop] = useState([]);
  const [groupDrop, setGroupDrop] = useState([]);
  const [classDrop, setClassDrop] = useState([]);
  const [sectionDrop, setSectionDrop] = useState([]);
  const [lineDrop, setLineDrop] = useState([]);
  const [typeDrop, setTypeDrop] = useState([]);
  const [currencyDrop, setCurrencyDrop] = useState([]);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs for Enter-Key Navigation Flow
  const RefCode = useRef(null);
  const RefName = useRef(null);
  const RefGroup = useRef(null);
  const RefClass = useRef(null);
  const RefSection = useRef(null);
  const RefLine = useRef(null);
  const RefType = useRef(null);
  const RefCurrency = useRef(null);
  const RefEffFrom = useRef(null);
  const RefEffTo = useRef(null);
  const RefStatus = useRef(null);

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    const location_code = sessionStorage.getItem("selectedLocationCode");
    const reqOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code, location_code }),
    };

    fetch(`${config.apiBaseUrl}/getAccountGroup`, reqOptions)
      .then((data) => data.json())
      .then((val) => setGroupDrop(val))
      .catch((error) => console.error("Error fetching Account Group:", error));

    fetch(`${config.apiBaseUrl}/getAccountClass`, reqOptions)
      .then((data) => data.json())
      .then((val) => setClassDrop(val))
      .catch((error) => console.error("Error fetching Account Class:", error));

    fetch(`${config.apiBaseUrl}/getReportSection`, reqOptions)
      .then((data) => data.json())
      .then((val) => setSectionDrop(val))
      .catch((error) => console.error("Error fetching Report Section:", error));

    fetch(`${config.apiBaseUrl}/getReportLine`, reqOptions)
      .then((data) => data.json())
      .then((val) => setLineDrop(val))
      .catch((error) => console.error("Error fetching Report Line:", error));

    fetch(`${config.apiBaseUrl}/getFSR`, reqOptions)
      .then((data) => data.json())
      .then((val) => setTypeDrop(val))
      .catch((error) => console.error("Error fetching Report Type:", error));

    // Assuming a standard route for currency
    fetch(`${config.apiBaseUrl}/getCurrencyCode`, reqOptions)
      .then((data) => data.json())
      .then((val) => setCurrencyDrop(val))
      .catch((error) => console.error("Error fetching Currency Code:", error));
  }, []);

    useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");

    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Filtered Options mapping (removed "All" object to prevent DB insert errors)
  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.descriptions,
  }));

  const filteredOptionGroup = groupDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.descriptions,
  }));

  const filteredOptionClass = classDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.descriptions,
  }));

  const filteredOptionSection = sectionDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.descriptions,
  }));

  const filteredOptionLine = lineDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.descriptions,
  }));

  const filteredOptionType = typeDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.descriptions,
  }));

  const filteredOptionCurrency = currencyDrop.map((option) => ({
    value: option.Currency_Code,
    label: option.Currency_Code,
  }));

  // Handle Changes
  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : "");
  };

  const handleChangeGroup = (selected) => {
    setSelectedGroup(selected);
    setAccountGroup(selected ? selected.value : "");
  };

  const handleChangeClass = (selected) => {
    setSelectedClass(selected);
    setAccountClass(selected ? selected.value : "");
  };

  const handleChangeSection = (selected) => {
    setSelectedSection(selected);
    setReportSection(selected ? selected.value : "");
  };

  const handleChangeLine = (selected) => {
    setSelectedLine(selected);
    setReportLine(selected ? selected.value : "");
  };

  const handleChangeType = (selected) => {
    setSelectedType(selected);
    setReportType(selected ? selected.value : "");
  };

  const handleChangeCurrency = (selected) => {
    setSelectedCurrency(selected);
    setCurrencyCode(selected ? selected.value : "");
  };

  const handleKeyDown = (e, nextFieldRef, currentValue) => {
    if (e.key === 'Enter') {
      if (currentValue || currentValue === false) {
        if (nextFieldRef && nextFieldRef.current) {
          nextFieldRef.current.focus();
        }
      } else {
        e.preventDefault();
      }
    }
  };

  const handleNavigate = () => {
    navigate("/AccountName");
  };

  const handleSave = async () => {
    if (!account_code || !account_name || !status) {
      setError(true);
      toast.warning("Error: Missing required fields (Code, Name, Status)");
      return;
    }

    setLoading(true);
    const endpoint = mode === "create" ? "chart_of_accountsInsert" : "chart_of_accountsUpdate";

    try {
      const response = await fetch(`${config.apiBaseUrl}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          location_code: sessionStorage.getItem("selectedLocationCode"),
          created_by: mode === "create" ? sessionStorage.getItem('selectedUserCode') : undefined,
          modified_by: mode === "update" ? sessionStorage.getItem('selectedUserCode') : undefined,
          created_date: new Date().toISOString(),
          modified_date: new Date().toISOString(),
          account_code, account_name, account_group, account_class, report_section,
          report_line, report_type, currency_code,
          iscontrolaccount: iscontrolaccount ? 1 : 0,
          isbankaccount: isbankaccount ? 1 : 0,
          allowmanualposting: allowmanualposting ? 1 : 0,
          effectivefrom, effectiveto, status
        }),
      });

      if (response.ok) {
        toast.success(`Data ${mode === "create" ? "inserted" : "updated"} successfully!`, {
          onClose: () => handleNavigate()
        });
      } else {
        const errorResponse = await response.json();
        toast.error(errorResponse.message || "Failed to process data");
      }
    } catch (error) {
      toast.error("Error saving data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="purbut">
        <div>
          {/* Header Layout */}
          <div className="shadow-lg p-0 bg-body-tertiary rounded mb-2">
            <div className="purbut mb-0 d-flex justify-content-between">
              <h1 align="left" className="purbut">
                {mode === "update" ? "Update Chart of Accounts" : "Add Chart of Accounts"}
              </h1>
              <button onClick={handleNavigate} className="purbut btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Form Layout */}
          <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
            <div className="row">
              
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className={`exp-form-labels ${error && !account_code ? 'text-danger' : ''}`}>
                        Account Code<span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    title="Account Code"
                    value={account_code}
                    onChange={(e) => setAccountCode(e.target.value)}
                    readOnly={mode === "update"}
                    maxLength={100}
                    ref={RefCode}
                    onKeyDown={(e) => handleKeyDown(e, RefName, account_code)}
                  />
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className={`exp-form-labels ${error && !account_name ? 'text-danger' : ''}`}>
                        Account Name<span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    title="Account Name"
                    value={account_name}
                    onChange={(e) => setAccountName(e.target.value)}
                    maxLength={100}
                    ref={RefName}
                    onKeyDown={(e) => handleKeyDown(e, RefGroup, account_name)}
                  />
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Account Group</label>
                    </div>
                  </div>
                  <div title="Select the Account Group">
                    <Select
                      id="account_group"
                      value={selectedGroup}
                      onChange={handleChangeGroup}
                      onKeyDown={(e) => handleKeyDown(e, RefClass, account_group)}
                      options={filteredOptionGroup}
                      className="exp-input-field"
                      placeholder=""
                      classNamePrefix="react-select"
                      ref={RefGroup}
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Account Class</label>
                    </div>
                  </div>
                  <div title="Select the Account Class">
                    <Select
                      id="account_class"
                      value={selectedClass}
                      onChange={handleChangeClass}
                      onKeyDown={(e) => handleKeyDown(e, RefSection, account_class)}
                      options={filteredOptionClass}
                      className="exp-input-field"
                      placeholder=""
                      classNamePrefix="react-select"
                      ref={RefClass}
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Report Section</label>
                    </div>
                  </div>
                  <div title="Select the Report Section">
                    <Select
                      id="report_section"
                      value={selectedSection}
                      onChange={handleChangeSection}
                      onKeyDown={(e) => handleKeyDown(e, RefLine, report_section)}
                      options={filteredOptionSection}
                      className="exp-input-field"
                      placeholder=""
                      classNamePrefix="react-select"
                      ref={RefSection}
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Report Line</label>
                    </div>
                  </div>
                  <div title="Select the Report Line">
                    <Select
                      id="report_line"
                      value={selectedLine}
                      onChange={handleChangeLine}
                      onKeyDown={(e) => handleKeyDown(e, RefType, report_line)}
                      options={filteredOptionLine}
                      className="exp-input-field"
                      placeholder=""
                      classNamePrefix="react-select"
                      ref={RefLine}
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Report Type</label>
                    </div>
                  </div>
                  <div title="Select the Report Type">
                    <Select
                      id="report_type"
                      value={selectedType}
                      onChange={handleChangeType}
                      onKeyDown={(e) => handleKeyDown(e, RefCurrency, report_type)}
                      options={filteredOptionType}
                      className="exp-input-field"
                      placeholder=""
                      classNamePrefix="react-select"
                      ref={RefType}
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Currency Code</label>
                    </div>
                  </div>
                  <div title="Select the Currency Code">
                    <Select
                      id="currency_code"
                      value={selectedCurrency}
                      onChange={handleChangeCurrency}
                      onKeyDown={(e) => handleKeyDown(e, RefEffFrom, currency_code)}
                      options={filteredOptionCurrency}
                      className="exp-input-field"
                      placeholder=""
                      classNamePrefix="react-select"
                      ref={RefCurrency}
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-1 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Control</label>
                    </div>
                  </div>
                  <div className="form-check form-switch pt-2 d-flex ms-3" title="Is Control Account?">
                    <input 
                      className="form-check-input fs-4" 
                      type="checkbox" 
                      role="switch" 
                      checked={iscontrolaccount} 
                      onChange={(e) => setIsControlAccount(e.target.checked)} 
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-1 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Bank</label>
                    </div>
                  </div>
                  <div className="form-check form-switch pt-2 d-flex ms-3" title="Is Bank Account?">
                    <input 
                      className="form-check-input fs-4" 
                      type="checkbox" 
                      role="switch" 
                      checked={isbankaccount} 
                      onChange={(e) => setIsBankAccount(e.target.checked)} 
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-1 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Manual</label>
                    </div>
                  </div>
                  <div className="form-check form-switch pt-2 d-flex ms-3" title="Allow Manual Posting?">
                    <input 
                      className="form-check-input fs-4" 
                      type="checkbox" 
                      role="switch" 
                      checked={allowmanualposting} 
                      onChange={(e) => setAllowManualPosting(e.target.checked)} 
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Effective From</label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="date"
                    required
                    title="Effective From"
                    value={effectivefrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    ref={RefEffFrom}
                    onKeyDown={(e) => handleKeyDown(e, RefEffTo, effectivefrom)}
                  />
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className="exp-form-labels">Effective To</label>
                    </div>
                  </div>
                  <input
                    className="exp-input-field form-control"
                    type="date"
                    required
                    title="Effective To"
                    value={effectiveto}
                    onChange={(e) => setEffectiveTo(e.target.value)}
                    ref={RefEffTo}
                    onKeyDown={(e) => handleKeyDown(e, RefStatus, effectiveto)}
                  />
                </div>
              </div>

              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label className={`exp-form-labels ${error && !status ? 'text-danger' : ''}`}>
                        Status<span className="text-danger">*</span>
                      </label>
                    </div>
                  </div>
                  <div title="Select the Status">
                    <Select
                      id="status"
                      value={selectedStatus}
                      onChange={handleChangeStatus}
                      onKeyDown={(e) => handleKeyDown(e, null, status)}
                      options={filteredOptionStatus}
                      className="exp-input-field"
                      placeholder=""
                      classNamePrefix="react-select"
                      ref={RefStatus}
                      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-3 form-group mt-4">
                <button onClick={handleSave} className="" required title={mode === "update" ? "Update" : "Save"}>
                  {mode === "update" ? <i className="fa-solid fa-pen-to-square"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile View Structure */}
      <div className="mobileview">
        <div>
          <div className="shadow-lg p-0 bg-body-tertiary rounded mb-2">
            <div className="mb-0 d-flex justify-content-between">
              <h1 align="left" className="h1">
                {mode === "update" ? "Update Chart of Accounts" : "Add Chart of Accounts"}
              </h1>
              <button onClick={handleNavigate} className="btn btn-danger shadow-none borde-shape h-70 fs-5" required title="Close">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
            <div className="row">
              <div className="col-md-12 form-group mt-2">
                <p className="text-center text-muted">Use standard responsive views or duplicate inputs here as needed per AccountNameInput reference.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddChart_of_accountsScreen;