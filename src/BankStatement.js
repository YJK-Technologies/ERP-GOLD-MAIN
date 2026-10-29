import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import "./mobile.css";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import labels from "./Labels";
import LoadingScreen from "./Loading";

const BankStatement = () => {
    const [rowData, setRowData] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Layout UI States matching Image Inputs
    const [companyEntity, setCompanyEntity] = useState({ value: "FinEdge", label: "FinEdge Enterprises India Pvt Ltd" });
    const [bankAccount, setBankAccount] = useState({ value: "HDFC9821", label: "HDFC Bank Ltd - 9821 (Current Corporate Account)" });
    const [statementFormat, setStatementFormat] = useState({ value: "CSV", label: "Standard CSV (Universal ERP Format)" });
    const [importMethod, setImportMethod] = useState({ value: "Manual", label: "Direct Manual File Upload" });
    const [startDate, setStartDate] = useState("2024-10-01");
    const [endDate, setEndDate] = useState("2024-10-31");
    const [openingBalance, setOpeningBalance] = useState("14250000");
    const [closingBalance, setClosingBalance] = useState("18432500.5");
    const [enableDuplicateCheck, setEnableDuplicateCheck] = useState(true);
    const [autoMapColumns, setAutoMapColumns] = useState(true);

    // Real File Upload States
    const [uploadedFile, setUploadedFile] = useState(null);

    // Recent Import History State with structured data
    const [importHistory] = useState([
        { date: "2024-10-31", batch: "BSU-2024-3686", bank: "HDFC Bank Ltd", fileName: "HDFC_Corp_Stmt_Oct2024.xlsx", records: "122/124", status: "Completed" },
        { date: "2024-10-31", batch: "BSU-2024-9222", bank: "HDFC Bank Ltd", fileName: "HDFC_Corp_Stmt_Q2.csv", records: "122/124", status: "Completed" },
        { date: "2024-10-31", batch: "BSU-2024-8014", bank: "HDFC Bank Ltd", fileName: "HDFC_Stmt_Sept.xlsx", records: "122/124", status: "Completed" }
    ]);

    const [createdBy, setCreatedBy] = useState("");
    const [modifiedBy, setModifiedBy] = useState("");
    const [createdDate, setCreatedDate] = useState("");
    const [modifiedDate, setModifiedDate] = useState("");

    // Handle File Selection (Browse or Drag & Drop)
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validExtensions = [".csv", ".xlsx", ".xls", ".txt", ".xml"];
            const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

            if (!validExtensions.includes(fileExtension)) {
                toast.error("Please upload a valid CSV, Excel, or Statement file!");
                return;
            }

            setLoading(true);
            setTimeout(() => {
                setUploadedFile({
                    name: file.name,
                    size: (file.size / 1024).toFixed(2) + " KB",
                    status: "Ready"
                });
                setLoading(false);
                toast.success("File uploaded successfully!");
            }, 800);
        }
    };

    const columnDefs = [
        {
            headerCheckboxSelection: true,
            headerName: "Account Code",
            field: "base_accgroup_code",
            cellStyle: { textAlign: "left" },
            checkboxSelection: true,
            cellEditorParams: { maxLength: 18 },
        },
        {
            headerName: "Account Name",
            field: "base_accgroup_name",
            editable: true,
            cellStyle: { textAlign: "left" },
            cellEditorParams: { maxLength: 250 },
        },
        {
            headerName: "Status",
            field: "status",
            editable: true,
            cellStyle: { textAlign: "left" },
            cellEditor: "agSelectCellEditor",
        },
    ];

    const defaultColDef = {
        resizable: true,
        wrapText: true,
        flex: 1,
    };

    const generateReport = () => {
        if (!gridApi) return;
        const selectedRows = gridApi.getSelectedRows();
        if (selectedRows.length === 0) {
            alert("Please select at least one row to generate a report");
            return;
        }

        const reportData = selectedRows.map((row) => ({
            "Account Code": row.base_accgroup_code || "",
            "Account Name": row.base_accgroup_name || "",
            Status: row.status || "",
        }));

        const reportWindow = window.open("", "_blank");
        reportWindow.document.write("<html><head><title>Base Account</title></head><body>");
        reportWindow.document.write("<h1>Base Account Report</h1>");
        reportWindow.document.write("<table><thead><tr><th>Account Code</th><th>Account Name</th><th>Status</th></tr></thead><tbody>");
        reportData.forEach((row) => {
            reportWindow.document.write(`<tr><td>${row["Account Code"]}</td><td>${row["Account Name"]}</td><td>${row.Status}</td></tr>`);
        });
        reportWindow.document.write("</tbody></table></body></html>");
        reportWindow.document.close();
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />

            {/* TOP HEADER */}
            <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2 mt-2">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <h1 align="left" className="purbut m-0 fw-bold">
                            Bank Statement Upload
                        </h1>
                    </div>
                    <div className="d-flex justify-content-end align-items-center gap-2 purbut">
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={generateReport} title="Generate Report">
                            <i className="fa-solid fa-print"></i> Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* PARAMETERS SECTION */}
            <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
                <div className="row g-3 mb-3">
                    <div className="col-md-3 form-group">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Company Entity</label>
                            <Select
                                value={companyEntity}
                                onChange={setCompanyEntity}
                                options={[{ value: "FinEdge", label: "FinEdge Enterprises India Pvt Ltd" }]}
                                className="exp-input-field"
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Bank Account</label>
                            <Select
                                value={bankAccount}
                                onChange={setBankAccount}
                                options={[{ value: "HDFC9821", label: "HDFC Bank Ltd - 9821 (Current Corporate Account)" }]}
                                className="exp-input-field"
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Statement Format</label>
                            <Select
                                value={statementFormat}
                                onChange={setStatementFormat}
                                options={[{ value: "CSV", label: "Standard CSV (Universal ERP Format)" }]}
                                className="exp-input-field"
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Import Method</label>
                            <Select
                                value={importMethod}
                                onChange={setImportMethod}
                                options={[{ value: "Manual", label: "Direct Manual File Upload" }]}
                                className="exp-input-field"
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>
                </div>

                {/* ROW 2: Dates and Balances */}
                <div className="row g-3 mb-3">
                    <div className="col-md-3 form-group">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Statement Period (Start Date)</label>
                            <input
                                type="date"
                                className="exp-input-field form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Statement Period (End Date)</label>
                            <input
                                type="date"
                                className="exp-input-field form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Opening Balance (₹)</label>
                            <input
                                type="number"
                                className="exp-input-field form-control"
                                value={openingBalance}
                                onChange={(e) => setOpeningBalance(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-3 form-group">
                        <div className="exp-form-floating">
                            <label className="exp-form-labels">Closing Balance (₹)</label>
                            <input
                                type="number"
                                className="exp-input-field form-control"
                                value={closingBalance}
                                onChange={(e) => setClosingBalance(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* FILE INGESTION & RULES + SIDE PANELS */}
            <div className="row mb-2">
                {/* STATEMENT FILE INGESTION (Size Reduced Compact Layout) */}
                <div className="col-lg-7">
                    <div className="p-3 bg-body-tertiary rounded h-100 d-flex flex-column justify-content-between">
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <h6 className="fw-bold m-0" style={{ fontSize: "0.85rem" }}>Statement File Ingestion</h6>
                                <span className="text-primary text-decoration-underline" style={{ cursor: "pointer", fontSize: "0.75rem" }}>
                                    Load Sample Bank File
                                </span>
                            </div>

                            {/* Compact Drag & Drop Card with Hidden File Input */}
                            <div 
                                className="border border-dashed p-2 text-center rounded bg-light mb-2 position-relative"
                                style={{ cursor: "pointer" }}
                            >
                                <input 
                                    type="file" 
                                    id="statementFileInput"
                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                                    style={{ cursor: "pointer" }}
                                    accept=".csv, .xlsx, .xls, .txt, .xml"
                                    onChange={handleFileUpload}
                                />
                                <i className="fa-solid fa-cloud-arrow-up text-primary fs-4 mb-1"></i>
                                <p className="fw-semibold m-0" style={{ fontSize: "0.8rem" }}>Drag and drop bank statement here, or browse</p>
                                <small className="text-muted" style={{ fontSize: "0.7rem" }}>Supports CSV, Excel (.xlsx), MT940, and CAMT.053 XML (Up to 25MB)</small>

                                {/* Dynamically Display Uploaded File Info */}
                                {uploadedFile && (
                                    <div className="d-flex justify-content-center mt-1">
                                        <div className="border bg-white rounded p-1 px-2 d-flex align-items-center gap-2 shadow-sm">
                                            <i className="fa-solid fa-file-excel text-success fs-6"></i>
                                            <div className="text-start">
                                                <p className="m-0 fw-bold" style={{ fontSize: "0.75rem" }}>{uploadedFile.name}</p>
                                                <small className="text-muted" style={{ fontSize: "0.65rem" }}>Size: {uploadedFile.size} • <span className="text-primary">Imported</span></small>
                                            </div>
                                            <span className="badge bg-success-subtle text-success border border-success ms-1" style={{ fontSize: "0.65rem" }}>{uploadedFile.status}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rules Toggles */}
                            <div className="border rounded p-2 bg-light mb-2">
                                <h6 className="fw-bold mb-1" style={{ fontSize: "0.75rem" }}>Ingestion & Reconciliation Rules</h6>
                                <div className="row g-1">
                                    <div className="col-md-6 d-flex align-items-center">
                                        <div className="form-check form-switch mb-0">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="dupCheck"
                                                checked={enableDuplicateCheck}
                                                onChange={(e) => setEnableDuplicateCheck(e.target.checked)}
                                            />
                                            <label className="form-check-label fw-bold" style={{ fontSize: "0.75rem" }} htmlFor="dupCheck">
                                                Enable Duplicate Check
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-6 d-flex align-items-center">
                                        <div className="form-check form-switch mb-0">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="autoMap"
                                                checked={autoMapColumns}
                                                onChange={(e) => setAutoMapColumns(e.target.checked)}
                                            />
                                            <label className="form-check-label fw-bold" style={{ fontSize: "0.75rem" }} htmlFor="autoMap">
                                                Auto Map Columns
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ingestion Buttons */}
                        <div className="d-flex justify-content-between pt-1">
                            <button className="btn btn-outline-secondary btn-sm py-1 px-2" style={{ fontSize: "0.75rem" }}>Download Template</button>
                            <div className="d-flex gap-1">
                                <button className="btn btn-outline-primary btn-sm py-1 px-2" style={{ fontSize: "0.75rem" }} onClick={() => toast.info("Validating file structure...")}>Validate File</button>
                                <button className="btn btn-primary btn-sm py-1 px-2" style={{ fontSize: "0.75rem" }} onClick={() => toast.success("Transactions imported successfully!")}>Import Transactions</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIDE PANEL: Recent Import History (Proper UI Design) */}
                <div className="col-lg-5">
                    <div className="p-3 bg-body-tertiary rounded h-100 d-flex flex-column bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
                            <div>
                                <h6 className="fw-bold m-0" style={{ fontSize: "0.85rem" }}>Recent Import History</h6>
                                <small className="text-muted" style={{ fontSize: "0.7rem" }}>Audited statement uploads</small>
                            </div>
                            <span className="badge bg-secondary" style={{ fontSize: "0.65rem" }}>26 Batches</span>
                        </div>

                        <div className="table-responsive flex-grow-1" style={{ maxHeight: "185px", overflowY: "auto" }}>
                            <table className="table table-sm table-borderless align-middle m-0" style={{ fontSize: "0.72rem" }}>
                                <thead className="table-light text-uppercase text-muted" style={{ fontSize: "0.62rem" }}>
                                    <tr>
                                        <th className="py-1">Batch / Date</th>
                                        <th className="py-1">File Name</th>
                                        <th className="py-1 text-center">Records</th>
                                        <th className="py-1 text-end">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {importHistory.map((item, index) => (
                                        <tr key={index} className="border-bottom">
                                            <td className="py-1">
                                                <div className="fw-bold text-dark">{item.date}</div>
                                                <div className="text-muted font-monospace" style={{ fontSize: "0.62rem" }}>{item.batch}</div>
                                            </td>
                                            <td className="py-1">
                                                <div className="text-primary text-truncate" style={{ maxWidth: "100px" }} title={item.fileName}>{item.fileName}</div>
                                            </td>
                                            <td className="py-1 text-center">
                                                <span className="badge bg-light text-dark border" style={{ fontSize: "0.62rem" }}>{item.records}</span>
                                            </td>
                                            <td className="py-1 text-end">
                                                <span className="badge bg-success-subtle text-success border border-success px-1" style={{ fontSize: "0.62rem" }}>{item.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center pt-2 mt-auto border-top">
                            <span className="text-muted" style={{ fontSize: "0.68rem" }}>Showing 5 recent batches</span>
                            <span className="text-primary text-decoration-underline fw-semibold" style={{ cursor: "pointer", fontSize: "0.72rem" }} onClick={() => toast.info("Opening all logs...")}>View All Logs &rarr;</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRID DATA & STAGING GRID */}
            <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <h6 className="fw-bold m-0">Transaction Preview & Staging Grid</h6>
                        <span className="badge bg-secondary fs-8">10 Records</span>
                    </div>
                </div>

                <div className="ag-theme-alpine" style={{ height: 450, width: "100%" }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationAutoPageSize={true}
                        headerHeight={28}
                        rowHeight={25}
                    />
                </div>
            </div>

            {/* FOOTER USER METADATA */}
            <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
                <div className="row ms-2">
                    <div className="d-flex justify-content-start">
                        <p className="col-md-6 mb-0">
                            {labels.createdBy}: {createdBy}
                        </p>
                        <p className="col-md-6 mb-0">
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

export default BankStatement;