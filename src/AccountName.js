import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import { showConfirmationToast } from "./ToastConfirmation"; 
import LoadingScreen from "./Loading"; 

const config = require("./Apiconfig");

function Chart_of_accountsScreen() {
  const [editedData, setEditedData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // All 14 Search & Filter States
  const [account_code, setAccountCode] = useState("");
  const [account_name, setAccountName] = useState("");
  const [account_group, setAccountGroup] = useState("");
  const [account_class, setAccountClass] = useState("");
  const [report_section, setReportSection] = useState("");
  const [report_line, setReportLine] = useState("");
  const [report_type, setReportType] = useState("");
  const [currency_code, setCurrencyCode] = useState("");
  const [iscontrolaccount, setIsControlAccount] = useState(false);
  const [isbankaccount, setIsBankAccount] = useState(false);
  const [allowmanualposting, setAllowManualPosting] = useState(false);
  const [effectivefrom, setEffectiveFrom] = useState("");
  const [effectiveto, setEffectiveTo] = useState("");
  const [status, setStatus] = useState("");

  // Dropdown Option States
  const [statusdrop, setStatusdrop] = useState([]);
  const [groupDrop, setGroupDrop] = useState([]);
  const [classDrop, setClassDrop] = useState([]);
  const [sectionDrop, setSectionDrop] = useState([]);
  const [lineDrop, setLineDrop] = useState([]);
  const [typeDrop, setTypeDrop] = useState([]);
  const [currencyDrop, setCurrencyDrop] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const [statusgriddrop, setStatusGriddrop] = useState([]);
  
  // const [selectedStatus, setSelectedStatus] = useState('');

  // Audit Logs
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || [];
  const AccPermission = permissions
    .filter((p) => p.screen_type === "ChartOfAccounts")
    .map((p) => p.permission_type.toLowerCase());

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

    fetch(`${config.apiBaseUrl}/status`, reqOptions)
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
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
      .then((response) => response.json())
      .then((data) => {
        const statusOption = data.map((option) => option.attributedetails_name);
        setStatusGriddrop(statusOption);
      })
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

  // Fetch Dropdowns on Load
  // useEffect(() => {
  //   const company_code = sessionStorage.getItem("selectedCompanyCode");
  //   fetch(`${config.apiBaseUrl}/status`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ company_code }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setStatusDrop(data.map((opt) => opt.attributedetails_name)))
  //     .catch((err) => console.error("Error fetching status:", err));
  // }, []);

  //   const filteredOptionStatus = [
  //   { value: "All", label: "All" },
  //   ...statusDrop.map((option) => ({
  //     value: option.attributedetails_name,
  //     label: option.attributedetails_name,
  //   })),
  // ];

  //   const handleChangeStatus = (selectedStatus) => {
  //   setSelectedStatus(selectedStatus);
  //   setStatus(selectedStatus ? selectedStatus.value : "");
  // };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getChartOfAccountsSC`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          location_code: sessionStorage.getItem("selectedLocationCode"),
          account_code, account_name, account_group, account_class,
          report_section, report_line, report_type, currency_code,
          iscontrolaccount: iscontrolaccount ? 1 : 0, 
          isbankaccount: isbankaccount ? 1 : 0, 
          allowmanualposting: allowmanualposting ? 1 : 0, 
          effectivefrom, effectiveto, status
        }),
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
      } else if (response.status === 404) {
        toast.warning("Data not found");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Search Failed");
      }
    } catch (error) {
      toast.error("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const reloadGridData = () => {
    window.location.reload();
  };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex((row) => row.account_code === params.data.account_code);
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      setEditedData((prev) => {
        const existingIndex = prev.findIndex((item) => item.account_code === params.data.account_code);
        if (existingIndex !== -1) {
          const updatedEdited = [...prev];
          updatedEdited[existingIndex] = updatedRowData[rowIndex];
          return updatedEdited;
        } else {
          return [...prev, updatedRowData[rowIndex]];
        }
      });
    }
  };

  const saveEditedData = async () => {
    const selectedRowsData = editedData.filter((row) =>
      selectedRows.some((selectedRow) => selectedRow.account_code === row.account_code)
    );

    if (selectedRowsData.length === 0) {
      toast.warning("Please select and modify at least one row to update.");
      return;
    }

    showConfirmationToast("Are you sure you want to update the data?", async () => {
      try {
        const modified_by = sessionStorage.getItem("selectedUserCode");
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        const location_code = sessionStorage.getItem("selectedLocationCode");

        
        const payloadData = selectedRowsData.map(row => ({
           ...row, company_code, modified_by, location_code
        }));

        const response = await fetch(`${config.apiBaseUrl}/chart_of_accountsLoopUpdate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chart_of_accountsData: payloadData }),
        });

        if (response.status === 200) {
          toast.success("Data Updated Successfully");
          setEditedData([]);
          handleSearch();
        } else {
          toast.warning("Failed to update data");
        }
      } catch (error) {
        toast.error("Error Updating: " + error.message);
      }
    }, () => toast.info("Update cancelled."));
  };

  const deleteSelectedRows = async () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to delete");
      return;
    }

    const company_code = sessionStorage.getItem("selectedCompanyCode");
    const location_code = sessionStorage.getItem("selectedLocationCode");
    const payloadData = selectedRows.map(row => ({
      account_code: row.account_code,
      company_code: company_code,
      location_code
    }));

    showConfirmationToast("Are you sure you want to Delete?", async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/chart_of_accountsLoopDelete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chart_of_accountsData: payloadData }),
        });

        if (response.ok) {
          toast.success("Data Deleted successfully");
          handleSearch();
        } else {
          toast.warning("Failed to delete data");
        }
      } catch (error) {
        toast.error("Error Deleting: " + error.message);
      }
    }, () => toast.info("Delete cancelled."));
  };

  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      alert("Please select at least one row to generate a report");
      return;
    }
    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Chart of Accounts Report</title>");
    reportWindow.document.write("<style>body{font-family:Arial;} h1{color:maroon;text-align:center;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;} th{background-color:maroon;color:white;} td{background-color:#fdd9b5;} tr:nth-child(even) td{background-color:#fff0e1;} @media print{.btn{display:none;}}</style></head><body>");
    reportWindow.document.write("<h1><u>Chart of Accounts Report</u></h1><table><thead><tr><th>Code</th><th>Name</th><th>Group</th><th>Class</th><th>Section</th><th>Type</th><th>Status</th></tr></thead><tbody>");
    
    selectedRows.forEach(row => {
      reportWindow.document.write(`<tr>
        <td>${row.account_code || ""}</td>
        <td>${row.account_name || ""}</td>
        <td>${row.account_group || ""}</td>
        <td>${row.account_class || ""}</td>
        <td>${row.report_section || ""}</td>
        <td>${row.report_type || ""}</td>
        <td>${row.status || ""}</td>
      </tr>`);
    });
    reportWindow.document.write("</tbody></table><button class='btn' style='margin:20px auto;display:block;padding:10px 20px;background:maroon;color:white;' onclick='window.print()'>Print</button></body></html>");
    reportWindow.document.close();
  };

  const handleNavigateToForm = () => {
    navigate("/AddAccountName", { state: { mode: "create" } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(dateString));
  };

  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      setCreatedBy(event.data.created_by);
      setModifiedBy(event.data.modified_by);
      setCreatedDate(formatDate(event.data.created_date));
      setModifiedDate(formatDate(event.data.modified_date));
    }
  };

  // AG-Grid Columns matching all 14 fields
  const columnDefs = [
    { headerCheckboxSelection: true, checkboxSelection: true, headerName: "Account Code", field: "account_code", editable: false },
    { headerName: "Account Name", field: "account_name", editable: true },
    { headerName: "Account Group", field: "account_group", editable: true },
    { headerName: "Account Class", field: "account_class", editable: true },
    { headerName: "Report Section", field: "report_section", editable: true },
    { headerName: "Report Line", field: "report_line", editable: true },
    { headerName: "Report Type", field: "report_type", editable: true },
    { headerName: "Currency Code", field: "currency_code", editable: true },
    { headerName: "Control Account", field: "iscontrolaccount", editable: true, cellEditor: 'agCheckboxCellEditor' },
    { headerName: "Bank Account", field: "isbankaccount", editable: true, cellEditor: 'agCheckboxCellEditor' },
    { headerName: "Manual Posting", field: "allowmanualposting", editable: true, cellEditor: 'agCheckboxCellEditor' },
    { headerName: "Effective From", field: "effectivefrom", editable: true },
    { headerName: "Effective To", field: "effectiveto", editable: true },
    { headerName: "Status", field: "status", editable: true, cellEditor: "agSelectCellEditor", cellEditorParams: { values: statusgriddrop } },
  ];

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div align="">
        
        {/* Action Header Card */}
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
          <div className="d-flex justify-content-between">
            <div className="d-flex justify-content-start">
              <h1 className="purbut">Chart of Accounts</h1>
            </div>
            
            {/* Desktop Buttons */}
            <div className="d-flex justify-content-end purbut me-3">
               <addbutton className="purbut" onClick={handleNavigateToForm} title="Add"> <i className="fa-solid fa-user-plus"></i> </addbutton>
               <delbutton className="purbut" onClick={deleteSelectedRows} title="Delete"><i className="fa-solid fa-user-minus"></i></delbutton>
               <savebutton className="purbut" onClick={saveEditedData} title="Update"><i className="fa-solid fa-floppy-disk"></i></savebutton>
               <printbutton className="purbut" onClick={generateReport} title="Report"><i className="fa-solid fa-print"></i></printbutton>
            </div>
            
            {/* Mobile Menu Dropdown */}
            <div className="mobileview ">
              <div className="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 className="h1">Chart of Accounts</h1>
                </div>
                <div className="d-flex justify-content-end">
                  <div className="dropdown me-3 mt-3">
                    <button className="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown"><i className="fa-solid fa-list"></i></button>
                    <ul className="dropdown-menu menu">
                      <li className="iconbutton d-flex justify-content-center text-success"><icon className="icon" onClick={handleNavigateToForm}><i className="fa-solid fa-user-plus"></i></icon></li>
                      <li className="iconbutton d-flex justify-content-center text-danger"><icon className="icon" onClick={deleteSelectedRows}><i className="fa-solid fa-user-minus"></i></icon></li>
                      <li className="iconbutton d-flex justify-content-center text-primary"><icon className="icon" onClick={saveEditedData}><i className="fa-solid fa-floppy-disk"></i></icon></li>
                      <li className="iconbutton d-flex justify-content-center"><icon className="icon" onClick={generateReport}><i className="fa-solid fa-print"></i></icon></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Area Card containing all 14 fields */}
        <div className="shadow-lg p-1 pb-4 bg-body-tertiary rounded mb-2">
          <div className="row ms-4 mt-3 mb-3 me-4">

            {/* Account Code */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Account Code</label>
                <input
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  title="Account Code"
                  value={account_code}
                  onChange={(e) => setAccountCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            {/* Account Name */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Account Name</label>
                <input
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  title="Account Name"
                  value={account_name}
                  onChange={(e) => setAccountName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            {/* Account Group */}
<div className="col-md-3 form-group mb-2">
  <div className="exp-form-floating">
    <label className="exp-form-labels">Account Group</label>
    <Select
      id="account_group"
      options={filteredOptionGroup}
      value={selectedGroup}
      onChange={handleChangeGroup}
      className="exp-input-field"
      classNamePrefix="react-select"
      isClearable
      placeholder=""
      title="Account Group"
      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
    />
  </div>
</div>

{/* Account Class */}
<div className="col-md-3 form-group mb-2">
  <div className="exp-form-floating">
    <label className="exp-form-labels">Account Class</label>
    <Select
      id="account_class"
      options={filteredOptionClass}
      value={selectedClass}
      onChange={handleChangeClass}
      className="exp-input-field"
      classNamePrefix="react-select"
      isClearable
      placeholder=""
      title="Account Class"
      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
    />
  </div>
</div>

{/* Report Section */}
<div className="col-md-3 form-group mb-2">
  <div className="exp-form-floating">
    <label className="exp-form-labels">Report Section</label>
    <Select
      id="report_section"
      options={filteredOptionSection}
      value={selectedSection}
      onChange={handleChangeSection}
      className="exp-input-field"
      classNamePrefix="react-select"
      isClearable
      placeholder=""
      title="Report Section"
      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
    />
  </div>
</div>

{/* Report Line */}
<div className="col-md-3 form-group mb-2">
  <div className="exp-form-floating">
    <label className="exp-form-labels">Report Line</label>
    <Select
      id="report_line"
      options={filteredOptionLine}
      value={selectedLine}
      onChange={handleChangeLine}
      className="exp-input-field"
      classNamePrefix="react-select"
      isClearable
      placeholder=""
      title="Report Line"
      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
    />
  </div>
</div>

{/* Report Type */}
<div className="col-md-3 form-group mb-2">
  <div className="exp-form-floating">
    <label className="exp-form-labels">Report Type</label>
    <Select
      id="report_type"
      options={filteredOptionType}
      value={selectedType}
      onChange={handleChangeType}
      className="exp-input-field"
      classNamePrefix="react-select"
      isClearable
      placeholder=""
      title="Report Type"
      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
    />
  </div>
</div>

{/* Currency Code */}
<div className="col-md-3 form-group mb-2">
  <div className="exp-form-floating">
    <label className="exp-form-labels">Currency Code</label>
    <Select
      id="currency_code"
      options={filteredOptionCurrency}
      value={selectedCurrency}
      onChange={handleChangeCurrency}
      className="exp-input-field"
      classNamePrefix="react-select"
      isClearable
      placeholder=""
      title="Currency Code"
      styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
    />
  </div>
</div>

            {/* Is Control Account */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Control Account</label>
                <Select
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" }
                  ]}
                  value={
                    iscontrolaccount === "" || iscontrolaccount === null
                      ? null
                      : {
                          value: String(iscontrolaccount),
                          label: Number(iscontrolaccount) === 1 ? "Yes" : "No"
                        }
                  }
                  onChange={(e) => setIsControlAccount(e ? Number(e.value) : "")}
                  className="exp-input-field"
                  classNamePrefix="react-select"
                  isClearable
                  placeholder=""
                  title="Control Account"
                />
              </div>
            </div>
                
            {/* Is Bank Account */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Bank Account</label>
                <Select
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" }
                  ]}
                  value={
                    isbankaccount === "" || isbankaccount === null
                      ? null
                      : {
                          value: String(isbankaccount),
                          label: Number(isbankaccount) === 1 ? "Yes" : "No"
                        }
                  }
                  onChange={(e) => setIsBankAccount(e ? Number(e.value) : "")}
                  className="exp-input-field"
                  classNamePrefix="react-select"
                  isClearable
                  placeholder=""
                  title="Bank Account"
                />
              </div>
            </div>
                
            {/* Allow Manual Posting */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Manual Posting</label>
                <Select
                  options={[
                    { value: "1", label: "Yes" },
                    { value: "0", label: "No" }
                  ]}
                  value={
                    allowmanualposting === "" || allowmanualposting === null
                      ? null
                      : {
                          value: String(allowmanualposting),
                          label: Number(allowmanualposting) === 1 ? "Yes" : "No"
                        }
                  }
                  onChange={(e) => setAllowManualPosting(e ? Number(e.value) : "")}
                  className="exp-input-field"
                  classNamePrefix="react-select"
                  isClearable
                  placeholder=""
                  title="Allow Manual Posting"
                />
              </div>
            </div>
                
            {/* Effective From */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Effective From</label>
                <input
                  className="exp-input-field form-control"
                  type="date"
                  title="Effective From"
                  value={effectivefrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
                
            {/* Effective To */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Effective To</label>
                <input
                  className="exp-input-field form-control"
                  type="date"
                  title="Effective To"
                  value={effectiveto}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
                
            {/* Status */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Status</label>
                <Select
                  id="status"
                  options={filteredOptionStatus}
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                  className="exp-input-field"
                  classNamePrefix="react-select"
                  isClearable
                  placeholder=""
                  title="Status"
                  styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                />
              </div>
            </div>
                
            {/* Search and Refresh */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating pt-3">
                <div className="d-flex justify-content-center">
                  <button
                    type="button"
                    className="popups-btn fs-6 p-3 me-3"
                    onClick={handleSearch}
                    title="Search"
                  >
                    <i className="fas fa-search"></i>
                  </button>
                
                  <button
                    type="button"
                    className="popups-btn fs-6 p-3"
                    onClick={reloadGridData}
                    title="Refresh"
                  >
                    <i className="fa-solid fa-arrow-rotate-right"></i>
                  </button>
                </div>
              </div>
            </div>
                
          </div>
                
          {/* Data Grid */}
          <div className="ag-theme-alpine" style={{ height: 485, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, wrapText: true }}
              onGridReady={(p) => setGridApi(p.api)}
              onCellValueChanged={onCellValueChanged}
              rowSelection="multiple"
              pagination={true}
              onSelectionChanged={() => setSelectedRows(gridApi.getSelectedNodes().map((n) => n.data))}
              onRowSelected={onRowSelected}
            />
          </div>
        </div>
      </div>
      
      {/* Footer Log Info */}
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6 mb-1">Created By: {createdBy}</p>
            <p className="col-md-6 mb-1">Created Date: {createdDate}</p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6 mb-0">Modified By: {modifiedBy}</p>
            <p className="col-md-6 mb-0">Modified Date: {modifiedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chart_of_accountsScreen;