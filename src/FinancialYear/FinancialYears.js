import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import "../apps.css";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import labels from "../Labels";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showConfirmationToast } from "../ToastConfirmation";
import LoadingScreen from "../Loading";
const config = require("../Apiconfig");

function Financial_YearScreen() {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Search & Filter States
  const [financialYearCode, setFinancialYearCode] = useState("");
  const [financialYearName, setFinancialYearName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const StatusRef = useRef(null);

  // Dropdown & Selection States
  const [statusdrop, setStatusdrop] = useState([]);
  const [statusgriddrop, setStatusGriddrop] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editedData, setEditedData] = useState([]);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  // Audit Footer States
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  // Permissions configuration
  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || [];
  const screenPermissions = Array.isArray(permissions)
    ? permissions
        .filter(
          (p) =>
            p.screen_type === "Financial_Year" || p.screen_type === "Company"
        )
        .map((p) => p.permission_type?.toLowerCase())
    : ["add", "delete", "update", "view", "all permission"];

  // Restore state if navigating back from Add/Update Form
  useEffect(() => {
    if (location.state?.preservedRowData) {
      setRowData(location.state.preservedRowData);
    }

    if (location.state?.preservedInputs) {
      const inputs = location.state.preservedInputs;
      setFinancialYearCode(inputs.financialYearCode || "");
      setFinancialYearName(inputs.financialYearName || "");
      setStartDate(inputs.startDate || "");
      setEndDate(inputs.endDate || "");
      setStatus(inputs.status || "");

      if (inputs.status) {
        setSelectedStatus({
          label: inputs.status,
          value: inputs.status,
        });
      }
    }
  }, [location.state]);

  // Fetch Status Dropdown Options for Filter & Grid Editor
  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");

    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code }),
    })
      .then((res) => res.json())
      .then((data) => {
        setStatusdrop(data);
        const statusOption = data.map((option) => option.attributedetails_name);
        setStatusGriddrop(statusOption);
      })
      .catch((error) => console.error("Error fetching status options:", error));
  }, []);

  const filteredOptionStatus = [
    { value: "All", label: "All" },
    ...statusdrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    })),
  ];

  const handleChangeStatus = (selected) => {
    setSelectedStatus(selected);
    setStatus(selected ? selected.value : "");
    setHasValueChanged(true);
  };

  const handleKeyDownStatus = async (e) => {
    if (e.key === "Enter" && hasValueChanged) {
      await handleSearch();
      setHasValueChanged(false);
    }
  };

  const handleSearch = async () => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    const location_code = sessionStorage.getItem("selectedLocationCode");
    setLoading(true);

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/Financial_YearSearch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            financial_year_code: financialYearCode,
            financial_year_name: financialYearName,
            start_date: startDate,
            end_date: endDate,
            status: status === "All" ? "" : status,
            company_code,
            location_code
          }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
      } else if (response.status === 404) {
        toast.warning("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error searching data:", error);
      toast.error("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearInputFields = () => {
    setFinancialYearCode("");
    setFinancialYearName("");
    setStartDate("");
    setEndDate("");
    setStatus("");
    setSelectedStatus(null);
    setRowData([]);
  };

  // Cell Editing Handler
  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.Keyfield === params.data.Keyfield
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);
      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  // Update Functionality with Confirmation Toast
  const saveEditedData = async () => {
    const modified_by = sessionStorage.getItem("selectedUserCode");

    const selectedRowsData = editedData.filter((row) =>
      selectedRows.some((selectedRow) => selectedRow.Keyfield === row.Keyfield)
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
        setLoading(true);
        try {
          const response = await fetch(
            `${config.apiBaseUrl}/Financial_YearLoopUpdate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "modified-by": modified_by,
              },
              body: JSON.stringify({ Financial_YearData: selectedRowsData }),
            }
          );

          if (response.status === 200) {
            setTimeout(() => {
              toast.success("Data Updated Successfully");
              handleSearch();
            }, 1000);
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to update data");
          }
        } catch (error) {
          console.error("Error saving data:", error);
          toast.error("Error Updating Data: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data update cancelled.");
      }
    );
  };

  // Delete Functionality with Confirmation Toast
const deleteSelectedRows = async () => {
    const rowsToDelete = gridApi.getSelectedRows();

    if (rowsToDelete.length === 0) {
      toast.warning("Please select at least one row to delete");
      return;
    }

    const modified_by = sessionStorage.getItem("selectedUserCode");

    const Financial_YearData = rowsToDelete.map((row) => ({
      Keyfield: row.Keyfield || row.Keyfield,
      company_code: row.company_code || sessionStorage.getItem("selectedCompanyCode") || "",
      location_code: row.location_code || row.Location_Code || sessionStorage.getItem("selectedLocationCode") || "",
    }));
    if (Financial_YearData.some((item) => !item.Keyfield)) {
      toast.error("Invalid Keyfield found in selected rows.");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to delete the data in the selected rows?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${config.apiBaseUrl}/Financial_YearLoopDelete`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Modified-By": modified_by,
              },
              body: JSON.stringify({ Financial_YearData }),
            }
          );

          if (response.ok) {
            setTimeout(() => {
              toast.success("Data Deleted successfully");
              handleSearch();
            }, 1000);
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || errorResponse || "Failed to delete data");
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error("Error Deleting Data: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data delete cancelled.");
      }
    );
  };

  // Generate Report / Print Handler
  const generateReport = () => {
    const selected = gridApi.getSelectedRows();
    if (selected.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return;
    }

    const reportData = selected.map((row) => ({
      "Financial Year Code": row.Financial_Year_Code || row.financial_year_code,
      "Financial Year Name": row.Financial_Year_Name || row.financial_year_name,
      "Start Date": formatDate(row.Start_Date || row.start_date),
      "End Date": formatDate(row.End_Date || row.end_date),
      Status: row.Status || row.status,
    }));

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write(
      "<html><head><title>Financial Year Info</title>"
    );
    reportWindow.document.write(`
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: maroon; text-align: center; font-size: 24px; margin-bottom: 30px; text-decoration: underline; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border: 1px solid #ddd; vertical-align: top; }
        th { background-color: maroon; color: white; font-weight: bold; }
        td { background-color: #fdd9b5; }
        tr:nth-child(even) td { background-color: #fff0e1; }
        .report-button { display: block; width: 150px; margin: 20px auto; padding: 10px; background-color: maroon; color: white; border: none; cursor: pointer; font-size: 16px; text-align: center; border-radius: 5px; }
        .report-button:hover { background-color: darkred; }
        @media print { .report-button { display: none; } body { margin: 0; padding: 0; } }
      </style>
    `);
    reportWindow.document.write("</head><body>");
    reportWindow.document.write("<h1><u>Financial Year Information</u></h1>");
    reportWindow.document.write("<table><thead><tr>");
    Object.keys(reportData[0]).forEach((key) => {
      reportWindow.document.write(`<th>${key}</th>`);
    });
    reportWindow.document.write("</tr></thead><tbody>");
    reportData.forEach((row) => {
      reportWindow.document.write("<tr>");
      Object.values(row).forEach((value) => {
        reportWindow.document.write(`<td>${value}</td>`);
      });
      reportWindow.document.write("</tr>");
    });
    reportWindow.document.write("</tbody></table>");
    reportWindow.document.write(
      '<button class="report-button" onclick="window.print()">Print</button>'
    );
    reportWindow.document.write("</body></html>");
    reportWindow.document.close();
  };

  const handleNavigateToForm = () => {
    navigate("/AddFinancialYear", { state: { mode: "create" } });
  };

  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/AddFinancialYear", {
      state: {
        mode: "update",
        selectedRow,
        preservedRowData: rowData,
        preservedInputs: {
          financialYearCode,
          financialYearName,
          startDate,
          endDate,
          status,
        },
      },
    });
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
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

  const handleRowClick = (data) => {
    setCreatedBy(data.created_by || "");
    setModifiedBy(data.modified_by || "");
    setCreatedDate(formatDate(data.created_date));
    setModifiedDate(formatDate(data.modified_date));
  };

  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      handleRowClick(event.data);
    }
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      headerName: "Financial Year Code",
      field: "Financial_Year_Code",
      cellClass: "ag-link-cell",
      cellStyle: { textAlign: "left" },
      checkboxSelection: true,
      cellEditorParams: { maxLength: 20 },
      cellRenderer: (params) => {
        return (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => handleNavigateWithRowData(params.data)}
            title="Click to view/update details"
          >
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: "Financial Year Name",
      field: "Financial_Year_Name",
      editable: true,
      cellStyle: { textAlign: "left" },
      cellEditorParams: { maxLength: 100 },
    },
    {
      headerName: "Start Date",
      field: "Start_Date",
      editable: true,
      cellStyle: { textAlign: "left" },
    },
    {
      headerName: "End Date",
      field: "End_Date",
      editable: true,
      cellStyle: { textAlign: "left" },
    },
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
    {
      headerName: "Company Code",
      field: "company_code",
      cellStyle: { textAlign: "left" },
      hide: true,
    },
    {
      headerName: "Location Code",
      field: "Location_Code",
      cellStyle: { textAlign: "left" },
      hide: true,
    },
    {
      headerName: "Keyfield",
      field: "Keyfield",
      editable: true,
      filter: true,
      hide: true,
      sortable: false,
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

  return (
    <div className="container-fluid Topnav-screen">
      <div>
        {loading && <LoadingScreen />}
        <ToastContainer position="top-right" className="toast-design" theme="colored" />
        {/* Top Header Card */}
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
          <div className="mb-0 d-flex justify-content-between align-items-center">
            <div className="d-flex justify-content-start">
              <h1 align="left" className="purbut">
                Financial Year
              </h1>
            </div>

            {/* Desktop Action Buttons */}
            <div className="d-flex justify-content-end purbut me-3">
              {["add", "all permission"].some((permission) =>
                screenPermissions.includes(permission)
              ) && (
                <addbutton
                  className="purbut"
                  onClick={handleNavigateToForm}
                  required
                  title="Add Financial Year"
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
                  title="Delete Selected Rows"
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
                  title="Save / Update Modified Rows"
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
                  title="Generate & Print Report"
                >
                  <i className="fa-solid fa-print"></i>
                </printbutton>
              )}
            </div>

            {/* Mobile View Dropdown Menu */}
            <div className="mobileview">
              <div className="d-flex justify-content-between me-4">
                <div className="d-flex justify-content-start">
                  <h1 className="h1">Financial Year</h1>
                </div>
                <div className="dropdown mt-2 me-5">
                  <button
                    className="btn btn-primary dropdown-toggle p-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    title="Menu Actions"
                  >
                    <i className="fa-solid fa-list"></i>
                  </button>
                  <ul className="dropdown-menu menu">
                    {["add", "all permission"].some((permission) =>
                      screenPermissions.includes(permission)
                    ) && (
                      <li className="iconbutton d-flex justify-content-center text-success">
                        <icon
                          className="icon"
                          onClick={handleNavigateToForm}
                          title="Add Financial Year"
                        >
                          <i className="fa-solid fa-user-plus"></i>
                        </icon>
                      </li>
                    )}
                    {["delete", "all permission"].some((permission) =>
                      screenPermissions.includes(permission)
                    ) && (
                      <li className="iconbutton d-flex justify-content-center text-danger">
                        <icon
                          className="icon"
                          onClick={deleteSelectedRows}
                          title="Delete Selected"
                        >
                          <i className="fa-solid fa-user-minus"></i>
                        </icon>
                      </li>
                    )}
                    {["update", "all permission"].some((permission) =>
                      screenPermissions.includes(permission)
                    ) && (
                      <li className="iconbutton d-flex justify-content-center text-primary">
                        <icon
                          className="icon"
                          onClick={saveEditedData}
                          title="Update Selected"
                        >
                          <i className="fa-solid fa-floppy-disk"></i>
                        </icon>
                      </li>
                    )}
                    {["all permission", "view"].some((permission) =>
                      screenPermissions.includes(permission)
                    ) && (
                      <li className="iconbutton d-flex justify-content-center">
                        <icon
                          className="icon"
                          onClick={generateReport}
                          title="Generate Report"
                        >
                          <i className="fa-solid fa-print"></i>
                        </icon>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter / Search Form Card */}
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
          <div className="row ms-4 mt-3 mb-3 me-4">
            <div className="col-md-3 form-group">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Financial Year Code</label>
                <input
                  id="finYearCode"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  title="Please enter the Financial Year Code"
                  value={financialYearCode}
                  onChange={(e) => setFinancialYearCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  maxLength={20}
                />
              </div>
            </div>

            <div className="col-md-3 form-group">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Financial Year Name</label>
                <input
                  id="finYearName"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  title="Please enter the Financial Year Name"
                  value={financialYearName}
                  onChange={(e) => setFinancialYearName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="col-md-3 form-group">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  className="exp-input-field form-control"
                  title="Select the Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <div className="col-md-3 form-group">
              <div className="exp-form-floating">
                <label className="exp-form-labels">End Date</label>
                <input
                  id="endDate"
                  type="date"
                  className="exp-input-field form-control"
                  title="Select the End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            <div className="col-md-3 form-group mt-3">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Status</label>
                <div title="Select the Status">
                  <Select
                    id="status"
                    value={selectedStatus}
                    onChange={handleChangeStatus}
                    options={filteredOptionStatus}
                    className="exp-input-field"
                    placeholder=""
                    onKeyDown={handleKeyDownStatus}
                    ref={StatusRef}
                    classNamePrefix="react-select"
                    styles={{
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-3 form-group mt-4 pt-2">
              <div className="exp-form-floating">
                <div className="d-flex justify-content-start">
                  <div>
                    <icon
                      className="popups-btn fs-6 p-3 me-2"
                      onClick={handleSearch}
                      required
                      title="Search Financial Year"
                    >
                      <i className="fas fa-search"></i>
                    </icon>
                  </div>
                  <div>
                    <icon
                      className="popups-btn fs-6 p-3"
                      onClick={clearInputFields}
                      required
                      title="Reload / Clear Filters"
                    >
                      <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                    </icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ag-Grid Data Table */}
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
      </div>

      {/* Audit Logs Bottom Card */}
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6 mb-1">
              {labels.createdBy || "Created By"}: {createdBy}
            </p>
            <p className="col-md-6 mb-1">
              {labels.createdDate || "Created Date"}: {createdDate}
            </p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6 mb-0">
              {labels.modifiedBy || "Modified By"}: {modifiedBy}
            </p>
            <p className="col-md-6 mb-0">
              {labels.modifiedDate || "Modified Date"}: {modifiedDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Financial_YearScreen;