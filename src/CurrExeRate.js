import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import "./App.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import labels from "./Labels";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showConfirmationToast } from "./ToastConfirmation";
import "./test.css";
import LoadingScreen from "./Loading";

const config = require("./Apiconfig");

function CurrencyExchangeRate() {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // Dropdown states
  const [statusdrop, setStatusdrop] = useState([]);
  const [statusgriddrop, setStatusGriddrop] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Search Criteria States
  const [Exchange_Rate_ID, setExchangeRateId] = useState("");
  const [From_Currency_ID, setFromCurrencyId] = useState("");
  const [To_Currency_ID, setToCurrencyId] = useState("");
  const [Exchange_Rate, setExchangeRate] = useState("");
  const [Effective_Date, setEffectiveDate] = useState("");
  const [Effective_Date_From, setEffectiveDateFrom] = useState("");
  const [Effective_Date_To, setEffectiveDateTo] = useState("");
  const [Status, setStatus] = useState("");

  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  // Audit Trail Footer States
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const location = useLocation();

  // User Permissions
  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || [];
  const screenPermissions = Array.isArray(permissions)
    ? permissions
        .filter((permission) => permission.screen_type === "CurrExeRate")
        .map((permission) => permission.permission_type.toLowerCase())
    : [];

  useEffect(() => {
    if (location.state?.preservedRowData) {
      setRowData(location.state.preservedRowData);
    }

    if (location.state?.preservedInputs) {
      setExchangeRateId(location.state.preservedInputs.Exchange_Rate_ID || "");
      setFromCurrencyId(location.state.preservedInputs.From_Currency_ID || "");
      setToCurrencyId(location.state.preservedInputs.To_Currency_ID || "");
      setExchangeRate(location.state.preservedInputs.Exchange_Rate || "");
      setEffectiveDate(location.state.preservedInputs.Effective_Date || "");
      setEffectiveDateFrom(location.state.preservedInputs.Effective_Date_From || "");
      setEffectiveDateTo(location.state.preservedInputs.Effective_Date_To || "");
      setStatus(location.state.preservedInputs.Status || "");

      if (location.state.preservedInputs.Status) {
        setSelectedStatus({
          label: location.state.preservedInputs.Status,
          value: location.state.preservedInputs.Status,
        });
      }
    }
  }, [location.state]);

  // Fetch Status Dropdown for Grid and Search
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
        setStatusdrop(data);
      })
      .catch((error) => console.error("Error fetching status data:", error));
  }, []);

  const filteredOptionStatus = [
    { value: "All", label: "All" },
    ...statusdrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    })),
  ];

  const handleChangeStatus = (selectedOption) => {
    setSelectedStatus(selectedOption);
    setStatus(selectedOption ? selectedOption.value : "");
    setHasValueChanged(true);
  };

  const handleFromDateChange = (e) => {
    const newFromDate = e.target.value;
    if (Effective_Date_To && newFromDate && new Date(newFromDate) > new Date(Effective_Date_To)) {
      toast.warning("Effective Date From cannot be greater than Effective Date To");
      return;
    }
    setEffectiveDateFrom(newFromDate);
  };

  const handleToDateChange = (e) => {
    const newToDate = e.target.value;
    if (Effective_Date_From && newToDate && new Date(newToDate) < new Date(Effective_Date_From)) {
      toast.warning("Effective Date To cannot be earlier than Effective Date From");
      return;
    }
    setEffectiveDateTo(newToDate);
  };

  const handleSearch = async () => {
    if (
      Effective_Date_From &&
      Effective_Date_To &&
      new Date(Effective_Date_To) < new Date(Effective_Date_From)
    ) {
      toast.warning("Effective Date To cannot be earlier than Effective Date From");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/currencyexchangerateSC`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Exchange_Rate_ID: Exchange_Rate_ID ? Number(Exchange_Rate_ID) : null,
            From_Currency_ID,
            To_Currency_ID,
            // Exchange_Rate,
            Exchange_Rate: Exchange_Rate ? Number(Exchange_Rate) : null,
            Effective_Date,
            Effective_Date_From,
            Effective_Date_To,
            Status,
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            location_code: sessionStorage.getItem("selectedLocationCode"),
          }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to search data");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("Error fetching search data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearInputFields = () => {
    setExchangeRateId("");
    setFromCurrencyId("");
    setToCurrencyId("");
    setExchangeRate("");
    setEffectiveDate("");
    setEffectiveDateFrom("");
    setEffectiveDateTo("");
    setSelectedStatus(null);
    setStatus("");
    setRowData([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleRowClick = (rowData) => {
    setCreatedBy(rowData.created_by);
    setModifiedBy(rowData.modified_by);
    const formattedCreatedDate = formatDate(rowData.created_date);
    const formattedModifiedDate = formatDate(rowData.modified_date);
    setCreatedDate(formattedCreatedDate);
    setModifiedDate(formattedModifiedDate);
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Exchange Rate ID",
      field: "Exchange_Rate_ID",
      cellClass: "ag-link-cell",
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 20,
      },
      cellRenderer: (params) => {
        const handleClick = () => {
          handleNavigateWithRowData(params.data);
        };
        return (
          <span style={{ cursor: "pointer" }} onClick={handleClick}>
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: "From Currency ID",
      field: "From_Currency_ID",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "To Currency ID",
      field: "To_Currency_ID",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: {
        maxLength: 20,
      },
    },
    {
      headerName: "Exchange Rate",
      field: "Exchange_Rate",
      editable: true,
      cellStyle: { textAlign: "right" },
      valueSetter: (params) => {
        const newValue = params.newValue?.toString().trim();
        const isValid = /^\d*(\.\d*)?$/.test(newValue);
        if (isValid) {
          params.data.Exchange_Rate = newValue;
          return true;
        }
        return false;
      },
    },
    {
      headerName: "Effective Date",
      field: "Effective_Date",
      filter: "agDateColumnFilter",
      editable: true,
      cellStyle: { textAlign: "center" },
      valueFormatter: (params) => formatDate(params.value),
    },
    // {
    //   headerName: "Effective Date From",
    //   field: "Effective_Date_From",
    //   filter: "agDateColumnFilter",
    //   editable: true,
    //   cellStyle: { textAlign: "center" },
    //   valueFormatter: (params) => formatDate(params.value),
    // },
    // {
    //   headerName: "Effective Date To",
    //   field: "Effective_Date_To",
    //   filter: "agDateColumnFilter",
    //   editable: true,
    //   cellStyle: { textAlign: "center" },
    //   valueFormatter: (params) => formatDate(params.value),
    // },
    {
      headerName: "Status",
      field: "Status",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: statusgriddrop,
      },
    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return;
    }

    const reportData = selectedRows.map((row) => {
      const formatValue = (val) =>
        val !== undefined && val !== null ? val : "";

      return {
        "Exchange Rate ID": formatValue(row.Exchange_Rate_ID),
        "From Currency ID": formatValue(row.From_Currency_ID),
        "To Currency ID": formatValue(row.To_Currency_ID),
        "Exchange Rate": formatValue(row.Exchange_Rate),
        "Effective Date": formatDate(row.Effective_Date),
        // "Effective Date From": formatDate(row.Effective_Date_From),
        // "Effective Date To": formatDate(row.Effective_Date_To),
        Status: formatValue(row.Status),
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write(
      "<html><head><title>Currency Exchange Rate Report</title>"
    );
    reportWindow.document.write("<style>");
    reportWindow.document.write(`
      body {
          font-family: Arial, sans-serif;
          margin: 20px;
      }
      h1 {
          color: maroon;
          text-align: center;
          font-size: 24px;
          margin-bottom: 30px;
          text-decoration: underline;
      }
      table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
      }
      th, td {
          padding: 10px;
          text-align: left;
          border: 1px solid #ddd;
          vertical-align: top;
      }
      th {
          background-color: maroon;
          color: white;
          font-weight: bold;
      }
      td {
          background-color: #fdd9b5;
      }
      tr:nth-child(even) td {
          background-color: #fff0e1;
      }
      .report-button {
          display: block;
          width: 150px;
          margin: 20px auto;
          padding: 10px;
          background-color: maroon;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
          text-align: center;
          border-radius: 5px;
      }
      .report-button:hover {
          background-color: darkred;
      }
      @media print {
          .report-button {
              display: none;
          }
          body {
              margin: 0;
              padding: 0;
          }
      }
    `);
    reportWindow.document.write("</style></head><body>");
    reportWindow.document.write(
      "<h1><u>Currency Exchange Rate Information</u></h1>"
    );

    reportWindow.document.write("<table><thead><tr>");
    Object.keys(reportData[0]).forEach((key) => {
      reportWindow.document.write(`<th>${key}</th>`);
    });
    reportWindow.document.write("</tr></thead><tbody>");

    reportData.forEach((row) => {
      reportWindow.document.write("<tr>");
      Object.values(row).forEach((value) => {
        reportWindow.document.write(`<td>${value || ""}</td>`);
      });
      reportWindow.document.write("</tr>");
    });

    reportWindow.document.write("</tbody></table>");
    reportWindow.document.write(
      '<button class="report-button" title="Print" onclick="window.print()">Print</button>'
    );
    reportWindow.document.write("</body></html>");
    reportWindow.document.close();
  };

  const handleNavigateToForm = () => {
    navigate("/CurrExeRateInput", { state: { mode: "create" } });
  };

  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/CurrExeRateInput", {
      state: {
        mode: "update",
        selectedRow,
        preservedRowData: rowData,
        preservedInputs: {
          Exchange_Rate_ID,
          From_Currency_ID,
          To_Currency_ID,
          Exchange_Rate,
          Effective_Date,
          Effective_Date_From,
          Effective_Date_To,
          Status,
        },
      },
    });
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.Exchange_Rate_ID === params.data.Exchange_Rate_ID
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);
      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  const saveEditedData = async () => {
    const selectedRowsData = editedData.filter((row) =>
      selectedRows.some(
        (selectedRow) => selectedRow.Exchange_Rate_ID === row.Exchange_Rate_ID
      )
    );

    if (selectedRowsData.length === 0) {
      toast.warning(
        "Please select and modify at least one row to update its data"
      );
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data in the selected rows?",
      async () => {
        try {
          const modified_by = sessionStorage.getItem("selectedUserCode");

          const response = await fetch(
            `${config.apiBaseUrl}/saveEditedExchangeRateData`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Modified-By": modified_by,
              },
              body: JSON.stringify({ editedData: selectedRowsData }),
            }
          );

          if (response.status === 200) {
            toast.success("Data Updated Successfully", {
              onClose: () => handleSearch(),
              autoClose: 1000,
            });
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to update data");
          }
        } catch (error) {
          console.error("Error updating data:", error);
          toast.error("Error updating data: " + error.message);
        }
      },
      () => {
        toast.info("Data update cancelled.");
      }
    );
  };

  const deleteSelectedRows = async () => {
    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
      toast.warning("Please select atleast One Row to Delete");
      return;
    }

    const modified_by = sessionStorage.getItem("selectedUserCode");
    const idsToDelete = selectedRows.map((row) => row.Exchange_Rate_ID);

    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        try {
          const response = await fetch(
            `${config.apiBaseUrl}/deleteExchangeRate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Modified-By": modified_by,
              },
              body: JSON.stringify({ Exchange_Rate_IDs: idsToDelete }),
            }
          );

          if (response.ok) {
            console.log("Rows deleted successfully:", idsToDelete);
            toast.success("Data Deleted successfully", {
              onClose: () => handleSearch(),
              autoClose: 1000,
            });
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to delete data");
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error("Error Deleting Data: " + error.message);
        }
      },
      () => {
        toast.info("Data Delete cancelled.");
      }
    );
  };

  const handleKeyDownStatus = async (e) => {
    if (e.key === "Enter" && hasValueChanged) {
      await handleSearch();
      setHasValueChanged(false);
    }
  };

  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      handleRowClick(event.data);
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      <div>
        {loading && <LoadingScreen />}
        <ToastContainer
          position="top-right"
          className="toast-design"
          theme="colored"
        />
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
          <div className="d-flex justify-content-between">
            <div className="d-flex justify-content-start">
              <h1 align="left" className="purbut">
                Currency Exchange Rate
              </h1>
            </div>
            <div className="d-flex justify-content-end purbut me-3">
              {["add", "all permission"].some((permission) =>
                screenPermissions.includes(permission)
              ) && (
                <addbutton
                  className="purbut"
                  onClick={handleNavigateToForm}
                  title="Add"
                >
                  <i className="fa-solid fa-user-plus"></i>
                </addbutton>
              )}
              {["delete", "all permission"].some((permission) =>
                screenPermissions.includes(permission)
              ) && (
                <delbutton
                  className="purbut"
                  onClick={deleteSelectedRows}
                  required
                  title="Delete"
                >
                  <i className="fa-solid fa-user-minus"></i>
                </delbutton>
              )}
              {["update", "all permission"].some((permission) =>
                screenPermissions.includes(permission)
              ) && (
                <savebutton
                  className="purbut"
                  onClick={saveEditedData}
                  required
                  title="Update"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                </savebutton>
              )}
              {["all permission", "view"].some((permission) =>
                screenPermissions.includes(permission)
              ) && (
                <printbutton
                  className="purbut"
                  onClick={generateReport}
                  required
                  title="Generate Report"
                >
                  <i className="fa-solid fa-print"></i>
                </printbutton>
              )}
            </div>
          </div>

          <div className="mobileview">
            <div className="d-flex justify-content-between">
              <div className="d-flex justify-content-start ms-3">
                <h1 align="left" className="h1">
                  Currency Exchange Rate
                </h1>
              </div>
              <div className="dropdown mt-1">
                <button
                  className="btn btn-primary dropdown-toggle p-1"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fa-solid fa-list"></i>
                </button>
                <ul className="dropdown-menu">
                  <li className="iconbutton d-flex justify-content-center text-success">
                    {["add", "all permission"].some((permission) =>
                      screenPermissions.includes(permission)
                    ) && (
                      <icon className="icon" onClick={handleNavigateToForm}>
                        <i className="fa-solid fa-user-plus"></i>
                      </icon>
                    )}
                  </li>
                  <li className="iconbutton d-flex justify-content-center text-danger">
                    {["delete", "all permission"].some((permission) =>
                      screenPermissions.includes(permission)
                    ) && (
                      <icon className="icon" onClick={deleteSelectedRows}>
                        <i className="fa-solid fa-user-minus"></i>
                      </icon>
                    )}
                  </li>
                  <li className="iconbutton d-flex justify-content-center text-primary">
                    {["update", "all permission"].some((permission) =>
                      screenPermissions.includes(permission)
                    ) && (
                      <icon className="icon" onClick={saveEditedData}>
                        <i className="fa-solid fa-floppy-disk"></i>
                      </icon>
                    )}
                  </li>
                  <li className="iconbutton d-flex justify-content-center">
                    {["all permission", "view"].some((permission) =>
                      screenPermissions.includes(permission)
                    ) && (
                      <icon className="icon" onClick={generateReport}>
                        <i className="fa-solid fa-print"></i>
                      </icon>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="row ms-4 mb-3 me-4 mt-3">
          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label htmlFor="erid" className="exp-form-labels">
                Exchange Rate ID
              </label>
<input
  id="erid"
  className="exp-input-field form-control"
  type="number"
  step="1"
  min="0"
  placeholder=""
  required
  title="Please fill the Exchange Rate ID here"
  value={Exchange_Rate_ID}
  onChange={(e) => {
    const value = e.target.value;

    if (value === "" || /^\d+$/.test(value)) {
      setExchangeRateId(value);
    }
  }}
  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
/>
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label htmlFor="fromcur" className="exp-form-labels">
                From Currency ID
              </label>
              <input
                id="fromcur"
                className="exp-input-field form-control"
                type="text"
                placeholder=""
                required
                title="Please fill the From Currency ID here"
                value={From_Currency_ID}
                onChange={(e) => setFromCurrencyId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                maxLength={20}
              />
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label htmlFor="tocur" className="exp-form-labels">
                To Currency ID
              </label>
              <input
                id="tocur"
                className="exp-input-field form-control"
                type="text"
                placeholder=""
                required
                title="Please fill the To Currency ID here"
                value={To_Currency_ID}
                onChange={(e) => setToCurrencyId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                maxLength={20}
              />
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label htmlFor="exrate" className="exp-form-labels">
                Exchange Rate
              </label>
              <input
                id="exrate"
                className="exp-input-field form-control"
                type="number"
                step="any"
                placeholder=""
                required
                title="Please fill the Exchange Rate here"
                value={Exchange_Rate}
                onChange={(e) => setExchangeRate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label htmlFor="effdate" className="exp-form-labels">
                Effective Date
              </label>
              <input
                id="effdate"
                className="exp-input-field form-control"
                type="date"
                placeholder=""
                required
                title="Please select the Effective Date"
                value={Effective_Date}
                onChange={(e) => setEffectiveDate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label htmlFor="effdatefrom" className="exp-form-labels">
                Effective Date From
              </label>
              <input
                id="effdatefrom"
                className="exp-input-field form-control"
                type="date"
                placeholder=""
                required
                title="Please select the Effective Date From"
                value={Effective_Date_From}
                max={Effective_Date_To || undefined}
                onChange={handleFromDateChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label htmlFor="effdateto" className="exp-form-labels">
                Effective Date To
              </label>
              <input
                id="effdateto"
                className="exp-input-field form-control"
                type="date"
                placeholder=""
                required
                title="Please select the Effective Date To"
                value={Effective_Date_To}
                min={Effective_Date_From || undefined}
                onChange={handleToDateChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label className="exp-form-labels">Status</label>
              <div title="Select the Status">
                <Select
                  id="status"
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                  onKeyDown={handleKeyDownStatus}
                  options={filteredOptionStatus}
                  className="exp-input-field"
                  placeholder=""
                  classNamePrefix="react-select"
                  styles={{
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-md-3 form-group mt-4">
            <div className="exp-form-floating">
              <div className="d-flex justify-content-center">
                <div>
                  <icon
                    className="text-dark popups-btn fs-6"
                    onClick={handleSearch}
                    required
                    title="Search"
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </icon>
                </div>
                <div>
                  <icon
                    className="popups-btn text-dark fs-6"
                    onClick={clearInputFields}
                    required
                    title="Reload"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                  </icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ag-theme-alpine" style={{ height: 455, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            rowSelection="multiple"
            onSelectionChanged={onSelectionChanged}
            pagination={true}
            paginationAutoPageSize={true}
            onRowSelected={onRowSelected}
          />
        </div>
      </div>

      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6">
              {labels.createdBy}: {createdBy}
            </p>
            <p className="col-md-6">
              {labels.createdDate}: {createdDate}
            </p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6">
              {labels.modifiedBy}: {modifiedBy}
            </p>
            <p className="col-md-6">
              {labels.modifiedDate}: {modifiedDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrencyExchangeRate;