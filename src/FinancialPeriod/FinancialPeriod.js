import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showConfirmationToast } from "../ToastConfirmation";
import LoadingScreen from "../Loading";
import labels from "../Labels";
import "../apps.css";

const config = require("../Apiconfig");

const FinancialPeriodScreen = () => {
    const [rowData, setRowData] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editedData, setEditedData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    // Form Filter States
    const [financialYearIdDrop, setFinancialYearIdDrop] = useState([]);
    const [financialYearId, setFinancialYearId] = useState("");
    const [selectedFinancialYearId, setSelectedFinancialYearId] = useState("");
    const [periodCode, setPeriodCode] = useState("");
    const [periodName, setPeriodName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);

    // Dropdown States
    const [statusDrop, setStatusDrop] = useState([]);
    const [statusGridDrop, setStatusGridDrop] = useState([]);
    const [hasValueChanged, setHasValueChanged] = useState(false);

    // Audit Information Footer States
    const [createdBy, setCreatedBy] = useState("");
    const [modifiedBy, setModifiedBy] = useState("");
    const [createdDate, setCreatedDate] = useState("");
    const [modifiedDate, setModifiedDate] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    // User Permissions Check
    const permissions = JSON.parse(sessionStorage.getItem("permissions")) || [];
    const FinancialPeriodPermissions = permissions
        .filter((permission) => permission.screen_type === "FinancialPeriod")
        .map((permission) => permission.permission_type.toLowerCase());

    // Restore State from Navigation History
    useEffect(() => {
        if (location.state?.preservedRowData) {
            setRowData(location.state.preservedRowData);
        }
        if (location.state?.preservedInputs) {
            const inputs = location.state.preservedInputs;
            setFinancialYearId(inputs.financialYearId || "");
            setPeriodCode(inputs.periodCode || "");
            setPeriodName(inputs.periodName || "");
            setStartDate(inputs.startDate || "");
            setEndDate(inputs.endDate || "");
            setStatus(inputs.status || "");
            if (inputs.status) {
                setSelectedStatus({ label: inputs.status, value: inputs.status });
            }
            if (inputs.financialYearId) {
                setSelectedFinancialYearId({ label: inputs.financialYearId, value: inputs.financialYearId });
            }

        }
    }, [location.state]);

    // Fetch Status Dropdown Data
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
                const statusOption = data.map((option) => option.attributedetails_name);
                setStatusGridDrop(statusOption);
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
            label: `${option.Keyfield} - ${option.Financial_Year_Code}`
        }))
        : [];

    const handleChangeStatus = (selectedOption) => {
        setSelectedStatus(selectedOption);
        setStatus(selectedOption ? selectedOption.value : "");
        setHasValueChanged(true);
    };

    const handleChangeFinancialYear = (selectedFinancialYearId) => {
        setSelectedFinancialYearId(selectedFinancialYearId);
        setFinancialYearId(selectedFinancialYearId ? selectedFinancialYearId.value : "");
        setHasValueChanged(true);
    };

    // Search Logic
    const handleSearch = async () => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        const location_code = sessionStorage.getItem("selectedLocationCode");
        setLoading(true);

        try {
            const response = await fetch(`${config.apiBaseUrl}/FinancialPeriodSearchData`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Financial_Year_ID: financialYearId,
                    Period_Code: periodCode,
                    Period_Name: periodName,
                    Start_Date: startDate,
                    End_Date: endDate,
                    Status: status,
                    company_code,
                    location_code
                }),
            });

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
            toast.error("Error searching data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearInputFields = () => {
        setFinancialYearId("");
        setSelectedFinancialYearId("");
        setPeriodCode("");
        setPeriodName("");
        setStartDate("");
        setEndDate("");
        setStatus("");
        setSelectedStatus(null);
        setRowData([]);
    };

    // Grid Event Handlers
    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    const onSelectionChanged = () => {
        const selectedNodes = gridApi.getSelectedNodes();
        const selectedData = selectedNodes.map((node) => node.data);
        setSelectedRows(selectedData);
    };

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

    // Update Selected Rows
    const saveEditedData = async () => {
        const modified_by = sessionStorage.getItem("selectedUserCode");
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        const location_code = sessionStorage.getItem("selectedLocationCode");

        const selectedRowsData = editedData.filter((row) =>
            selectedRows.some((selectedRow) => selectedRow.Keyfield === row.Keyfield)
        );

        if (selectedRowsData.length === 0) {
            toast.warning("Please select and modify at least one row to update.");
            return;
        }

        showConfirmationToast(
            "Are you sure you want to update the data in the selected rows?",
            async () => {
                setLoading(true);
                try {
                    const payload = selectedRowsData.map((item) => ({
                        ...item,
                        company_code,
                        location_code,
                        modified_by,
                    }));

                    const response = await fetch(`${config.apiBaseUrl}/Financial_PeriodLoopUpdate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ Financial_PeriodData: payload }),
                    });

                    if (response.ok) {
                        toast.success("Data Updated Successfully");
                        handleSearch();
                    } else {
                        const errorResponse = await response.json();
                        toast.warning(errorResponse.message || "Failed to update data");
                    }
                } catch (error) {
                    toast.error("Error Updating Data: " + error.message);
                } finally {
                    setLoading(false);
                }
            },
            () => toast.info("Data update cancelled.")
        );
    };

    // Delete Selected Rows
    const deleteSelectedRows = async () => {
        const selectedGridRows = gridApi.getSelectedRows();
        if (selectedGridRows.length === 0) {
            toast.warning("Please select at least one row to delete.");
            return;
        }

        const company_code = sessionStorage.getItem("selectedCompanyCode");
        const location_code = sessionStorage.getItem("selectedLocationCode") || "";

        showConfirmationToast(
            "Are you sure you want to delete the data in the selected rows?",
            async () => {
                setLoading(true);
                try {
                    const payload = selectedGridRows.map((item) => ({
                        Keyfield: item.Keyfield,
                        company_code,
                        location_code,
                    }));

                    const response = await fetch(`${config.apiBaseUrl}/Financial_PeriodLoopDelete`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ Financial_PeriodData: payload }),
                    });

                    if (response.ok) {
                        toast.success("Data Deleted successfully");
                        handleSearch();
                    } else {
                        const errorResponse = await response.json();
                        toast.warning(errorResponse.message || "Failed to delete data");
                    }
                } catch (error) {
                    toast.error("Error Deleting Data: " + error.message);
                } finally {
                    setLoading(false);
                }
            },
            () => toast.info("Data delete cancelled.")
        );
    };

    // Report Generation
    const generateReport = () => {
        const selectedGridRows = gridApi.getSelectedRows();
        if (selectedGridRows.length === 0) {
            toast.warning("Please select at least one row to generate a report");
            return;
        }

        const reportWindow = window.open("", "_blank");
        reportWindow.document.write("<html><head><title>Financial Period</title>");
        reportWindow.document.write(`
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: maroon; text-align: center; text-decoration: underline; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
        th { background-color: maroon; color: white; }
        td { background-color: #fdd9b5; }
        tr:nth-child(even) td { background-color: #fff0e1; }
        .report-button { display: block; width: 150px; margin: 20px auto; padding: 10px; background-color: maroon; color: white; border: none; cursor: pointer; border-radius: 5px; }
        @media print { .report-button { display: none; } }
      </style>
    `);
        reportWindow.document.write("</head><body><h1>Financial Period</h1><table><thead><tr>");

        const headers = ["Period ID", "Year ID", "Period Code", "Period Name", "Start Date", "End Date", "Status"];
        headers.forEach((h) => reportWindow.document.write(`<th>${h}</th>`));
        reportWindow.document.write("</tr></thead><tbody>");

        selectedGridRows.forEach((row) => {
            reportWindow.document.write(`
        <tr>
          <td>${row.Financial_Period_ID || ""}</td>
          <td>${row.Financial_Year_ID || ""}</td>
          <td>${row.Period_Code || ""}</td>
          <td>${row.Period_Name || ""}</td>
          <td>${formatDate(row.Start_Date)}</td>
          <td>${formatDate(row.End_Date)}</td>
          <td>${row.Status || ""}</td>
        </tr>
      `);
        });

        reportWindow.document.write("</tbody></table>");
        reportWindow.document.write('<button class="report-button" onclick="window.print()">Print</button></body></html>');
        reportWindow.document.close();
    };

    const handleNavigateToForm = () => {
        navigate("/AddFinancialPeriod", { state: { mode: "create" } });
    };

    const handleNavigateWithRowData = (selectedRow) => {
        navigate("/AddFinancialPeriod", {
            state: {
                mode: "update",
                selectedRow,
                preservedRowData: rowData,
                preservedInputs: {
                    financialYearId,
                    periodCode,
                    periodName,
                    startDate,
                    endDate,
                    status,
                },
            },
        });
    };

    // Helper Date Formatter
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    };

    const onRowSelected = (event) => {
        if (event.node.isSelected()) {
            const data = event.data;
            setCreatedBy(data.created_by || "");
            setModifiedBy(data.modified_by || "");
            setCreatedDate(formatDate(data.created_date));
            setModifiedDate(formatDate(data.modified_date));
        }
    };

    // AG Grid Column Configuration
    const columnDefs = [
        {
            headerName: "Financial Period ID",
            field: "Financial_Period_ID",
            headerCheckboxSelection: true,
            checkboxSelection: true,
            cellClass: "ag-link-cell",
            cellRenderer: (params) => (
                <span style={{ cursor: "pointer" }} onClick={() => handleNavigateWithRowData(params.data)}>
                    {params.value}
                </span>
            ),
        },
        {
            headerName: "Financial Year ID",
            field: "Financial_Year_ID",
            editable: false
        },
        {
            headerName: "Period Code",
            field: "Period_Code",
            editable: true
        },
        {
            headerName: "Period Name",
            field: "Period_Name",
            editable: true
        },
        {
            headerName: "Start Date",
            field: "Start_Date",
            editable: true
        },
        {
            headerName: "End Date",
            field: "End_Date",
            editable: true
        },
        {
            headerName: "Status",
            field: "Status",
            editable: true,
            cellEditor: "agSelectCellEditor",
            cellEditorParams: { values: statusGridDrop },
        },
        {
            headerName: "Keyfield",
            field: "Keyfield",
            hide: true
        },
    ];

    const defaultColDef = { resizable: true, wrapText: true };

    return (
        <div className="container-fluid Topnav-screen">
            <div>
                {loading && <LoadingScreen />}
                <ToastContainer position="top-right" className="toast-design" theme="colored" />

                {/* Header Action Bar */}
                <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex justify-content-start">
                            <h1 className="purbut mb-0">Financial Period</h1>
                        </div>

                        {/* Desktop Actions */}
                        <div className="d-flex justify-content-end purbut me-3">
                            {["add", "all permission"].some((p) => FinancialPeriodPermissions.includes(p)) && (
                                <addbutton type="button" className="purbut" onClick={handleNavigateToForm} title="Add Financial Period">
                                    <i className="fa-solid fa-user-plus"></i>
                                </addbutton>
                            )}
                            {["delete", "all permission"].some((p) => FinancialPeriodPermissions.includes(p)) && (
                                <delbutton type="button" className="purbut" onClick={deleteSelectedRows} title="Delete">
                                    <i className="fa-solid fa-user-minus"></i>
                                </delbutton>
                            )}
                            {["update", "all permission"].some((p) => FinancialPeriodPermissions.includes(p)) && (
                                <savebutton type="button" className="purbut" onClick={saveEditedData} title="Update">
                                    <i className="fa-solid fa-floppy-disk"></i>
                                </savebutton>
                            )}
                            {["all permission", "view"].some((p) => FinancialPeriodPermissions.includes(p)) && (
                                <printbutton type="button" className="purbut" onClick={generateReport} title="Generate Report">
                                    <i className="fa-solid fa-print"></i>
                                </printbutton>
                            )}
                        </div>

                        {/* Mobile View Dropdown Actions */}
                        <div className="mobileview">
                            <div class="d-flex justify-content-between">
                                <div className="d-flex justify-content-start">
                                    <h1 align="left" className="h1">Financial Period</h1>
                                </div>
                                <div className="dropdown mt-2 me-5">
                                    <button className="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="fa-solid fa-list"></i>
                                    </button>
                                    <ul className="dropdown-menu menu">
                                        {["add", "all permission"].some((p) => FinancialPeriodPermissions.includes(p)) && (
                                            <li className="iconbutton d-flex justify-content-center text-success">
                                                <button className="icon btn p-0 text-success" onClick={handleNavigateToForm} title="Add Financial Period">
                                                    <i className="fa-solid fa-user-plus"></i>
                                                </button>
                                            </li>
                                        )}
                                        {["delete", "all permission"].some((p) => FinancialPeriodPermissions.includes(p)) && (
                                            <li className="iconbutton d-flex justify-content-center text-danger">
                                                <button className="icon btn p-0 text-danger" onClick={deleteSelectedRows} title="Delete">
                                                    <i className="fa-solid fa-user-minus"></i>
                                                </button>
                                            </li>
                                        )}
                                        {["update", "all permission"].some((p) => FinancialPeriodPermissions.includes(p)) && (
                                            <li className="iconbutton d-flex justify-content-center text-primary">
                                                <button className="icon btn p-0 text-primary" onClick={saveEditedData} title="Update">
                                                    <i className="fa-solid fa-floppy-disk"></i>
                                                </button>
                                            </li>
                                        )}
                                        {["all permission", "view"].some((p) => FinancialPeriodPermissions.includes(p)) && (
                                            <li className="iconbutton d-flex justify-content-center">
                                                <button className="icon btn p-0" onClick={generateReport} title="Generate Report">
                                                    <i className="fa-solid fa-print"></i>
                                                </button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter / Inputs Form Section */}
                <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
                    <div className="row ms-4 mt-3 mb-3 me-4 g-3">
                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Financial Year ID</label>
                                <div title="Select Financial Year ID">
                                    <Select
                                        value={selectedFinancialYearId}
                                        onChange={handleChangeFinancialYear}
                                        options={filteredOptionFinancialYear}
                                        className="exp-input-field"
                                        classNamePrefix="react-select"
                                        placeholder=""
                                        onKeyDown={(e) => e.key === "Enter" && hasValueChanged && handleSearch()}
                                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Period Code</label>
                                <input
                                    className="exp-input-field form-control"
                                    type="text"
                                    placeholder=""
                                    title="Please fill the Period Code here"
                                    value={periodCode}
                                    onChange={(e) => setPeriodCode(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Period Name</label>
                                <input
                                    className="exp-input-field form-control"
                                    type="text"
                                    placeholder=""
                                    title="Please fill the Period Name here"
                                    value={periodName}
                                    onChange={(e) => setPeriodName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Start Date</label>
                                <input
                                    type="date"
                                    className="exp-input-field form-control"
                                    title="Select Start Date"
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
                                    type="date"
                                    className="exp-input-field form-control"
                                    title="Select End Date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Status</label>
                                <div title="Select the Status">
                                    <Select
                                        value={selectedStatus}
                                        onChange={handleChangeStatus}
                                        options={filteredOptionStatus}
                                        className="exp-input-field"
                                        classNamePrefix="react-select"
                                        placeholder=""
                                        onKeyDown={(e) => e.key === "Enter" && hasValueChanged && handleSearch()}
                                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3 form-group mt-4">
                            <div className="exp-form-floating">
                                <div className="d-flex justify-content-center gap-2">
                                    <icon type="button" className="popups-btn fs-6 p-3" onClick={handleSearch} title="Search">
                                        <i className="fas fa-search"></i>
                                    </icon>
                                    <icon type="button" className="popups-btn fs-6 p-3" onClick={clearInputFields} title="Reload">
                                        <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                                    </icon>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AG Grid Section */}
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

            {/* Audit Metadata Footer */}
            <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
                <div className="row ms-2">
                    <div className="d-flex justify-content-start">
                        <p className="col-md-6 mb-1">
                            {labels.createdBy}: {createdBy}
                        </p>
                        <p className="col-md-6 mb-1">
                            {labels.createdDate}: {createdDate}
                        </p>
                    </div>
                    <div className="d-flex justify-content-start">
                        <p className="col-md-6 mb-0">
                            {labels.modifiedBy}: {modifiedBy}
                        </p>
                        <p className="col-md-6 mb-0">
                            {labels.modifiedDate}: {modifiedDate}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialPeriodScreen;