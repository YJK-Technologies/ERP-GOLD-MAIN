//BankStatement.js
import React, { useState, useEffect } from "react";
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
import Papa from "papaparse";

const config = require("./Apiconfig");

const BankStatement = () => {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [importHistory, setImportHistory] = useState([]);

  // Layout UI States matching Image Inputs
  const [companyEntity, setCompanyEntity] = useState({
    value: "FinEdge",
    label: "FinEdge Enterprises India Pvt Ltd",
  });
  const [bankAccount, setBankAccount] = useState({
    value: "HDFC9821",
    label: "HDFC Bank Ltd - 9821 (Current Corporate Account)",
  });
  const [statementFormat, setStatementFormat] = useState({
    value: "CSV",
    label: "Standard CSV (Universal ERP Format)",
  });
  const [importMethod, setImportMethod] = useState({
    value: "Manual",
    label: "Direct Manual File Upload",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [enableDuplicateCheck, setEnableDuplicateCheck] = useState(true);
  const [autoMapColumns, setAutoMapColumns] = useState(true);

  const [formatDrop, setFormatDrop] = useState([]);
  const [selectedStatementFormat, setSelectedStatementFormat] = useState(null);
  const [statementFormatVal, setStatementFormatVal] = useState("");
  const [methodDrop, setMethodDrop] = useState([]);
  const [selectedImportMethod, setSelectedImportMethod] = useState(null);
  const [importMethodVal, setImportMethodVal] = useState("");

  // Real File Upload States
  const [uploadedFile, setUploadedFile] = useState(null);

  // Recent Import History State with structured data
  //   const [importHistory] = useState([
  //     {
  //       date: "2024-10-31",
  //       batch: "BSU-2024-3686",
  //       bank: "HDFC Bank Ltd",
  //       fileName: "HDFC_Corp_Stmt_Oct2024.xlsx",
  //       records: "122/124",
  //       status: "Completed",
  //     },
  //     {
  //       date: "2024-10-31",
  //       batch: "BSU-2024-9222",
  //       bank: "HDFC Bank Ltd",
  //       fileName: "HDFC_Corp_Stmt_Q2.csv",
  //       records: "122/124",
  //       status: "Completed",
  //     },
  //     {
  //       date: "2024-10-31",
  //       batch: "BSU-2024-8014",
  //       bank: "HDFC Bank Ltd",
  //       fileName: "HDFC_Stmt_Sept.xlsx",
  //       records: "122/124",
  //       status: "Completed",
  //     },
  //   ]);

  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");

    // Fetch Statement Format
    fetch(`${config.apiBaseUrl}/get_StatementFormat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => setFormatDrop(val))
      .catch((error) => console.error("Error fetching statement format:", error));

    // Fetch Import Method
    fetch(`${config.apiBaseUrl}/get_ImportMethod`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code }),
    })
      .then((data) => data.json())
      .then((val) => setMethodDrop(val))
      .catch((error) => console.error("Error fetching import method:", error));
  }, []);

  const handleChangeFormat = (selectedOption) => {
    setSelectedStatementFormat(selectedOption);
    setStatementFormatVal(selectedOption ? selectedOption.value : "");
  };

  const filteredOptionFormat = formatDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeMethod = (selectedOption) => {
    setSelectedImportMethod(selectedOption);
    setImportMethodVal(selectedOption ? selectedOption.value : "");
  };

  const filteredOptionMethod = methodDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  // Handle File Selection (Browse or Drag & Drop)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validExtensions = [".csv", ".xlsx", ".xls", ".txt", ".xml"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        toast.error("Please upload a valid CSV, Excel, or Statement file!");
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setUploadedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + " KB",
          status: "Ready",
        });
        setLoading(false);
        toast.success("File uploaded successfully!");
      }, 800);
    }
  };

  // const columnDefs = [
  //     {
  //         headerCheckboxSelection: true,
  //         headerName: "Account Code",
  //         field: "base_accgroup_code",
  //         cellStyle: { textAlign: "left" },
  //         checkboxSelection: true,
  //         cellEditorParams: { maxLength: 18 },
  //     },
  //     {
  //         headerName: "Account Name",
  //         field: "base_accgroup_name",
  //         editable: true,
  //         cellStyle: { textAlign: "left" },
  //         cellEditorParams: { maxLength: 250 },
  //     },
  //     {
  //         headerName: "Status",
  //         field: "status",
  //         editable: true,
  //         cellStyle: { textAlign: "left" },
  //         cellEditor: "agSelectCellEditor",
  //     },
  // ];

  const historyColumnDefs = [
    {
      headerName: "Batch / Date",
      field: "date",
      flex: 1.2,
      cellRenderer: (params) => (
        <div className="lh-sm" style={{ paddingTop: "4px" }}>
          <div className="fw-bold text-dark" style={{ fontSize: "0.75rem", lineHeight: "1" }}>{params.data.date}</div>
          <div className="text-muted font-monospace" style={{ fontSize: "0.65rem" }}>{params.data.batch}</div>
        </div>
      )
    },
    {
      headerName: "File Name",
      field: "fileName",
      flex: 1.5,
      cellRenderer: (params) => (
        <div className="text-primary text-truncate" title={params.value} style={{ fontSize: "0.75rem", paddingTop: "4px" }}>
          {params.value}
        </div>
      )
    },
    {
      headerName: "Records",
      field: "records",
      width: 90,
      cellStyle: { textAlign: "center" },
      cellRenderer: (params) => (
        <div style={{ paddingTop: "4px" }}>
          <span className="badge bg-light text-dark border" style={{ fontSize: "0.65rem" }}>{params.value}</span>
        </div>
      )
    },
    {
      headerName: "Status",
      field: "status",
      width: 90,
      cellStyle: { textAlign: "right" },
      cellRenderer: (params) => (
        <div style={{ paddingTop: "4px" }}>
          <span className="badge bg-success-subtle text-success border border-success px-1" style={{ fontSize: "0.65rem" }}>{params.value}</span>
        </div>
      )
    }
  ];

  const columnDefs = [
    { headerName: "Date", field: "TransactionDate", flex: 1 },
    { headerName: "Value Date", field: "ValueDate", flex: 1 },
    { headerName: "Bank Ref", field: "BankReference", flex: 1 },
    { headerName: "Description", field: "Description", flex: 2 },
    { headerName: "Debit", field: "DebitAmount", flex: 1 },
    { headerName: "Credit", field: "CreditAmount", flex: 1 },
    { headerName: "Balance", field: "BalanceAmount", flex: 1 },
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
    reportWindow.document.write(
      "<html><head><title>Base Account</title></head><body>",
    );
    reportWindow.document.write("<h1>Base Account Report</h1>");
    reportWindow.document.write(
      "<table><thead><tr><th>Account Code</th><th>Account Name</th><th>Status</th></tr></thead><tbody>",
    );
    reportData.forEach((row) => {
      reportWindow.document.write(
        `<tr><td>${row["Account Code"]}</td><td>${row["Account Name"]}</td><td>${row.Status}</td></tr>`,
      );
    });
    reportWindow.document.write("</tbody></table></body></html>");
    reportWindow.document.close();
  };

  //   const handleImportTransactions = () => {
  //         const fileInput = document.getElementById("statementFileInput").files[0];
  //         if (!fileInput) return toast.warning("Please select a file first");

  //         Papa.parse(fileInput, {
  //             header: true,
  //             complete: async (results) => {
  //                 const payload = {
  //                     company_code: sessionStorage.getItem("selectedCompanyCode"),
  //                     location_code: sessionStorage.getItem("selectedLocationCode"),
  //                     created_by: "admin", // idhai unga session user id-ku maathikonga if needed
  //                     BankAccountId: bankAccount.value,
  //                     OpeningBalance: openingBalance,
  //                     transactions: results.data // Array of row objects from CSV
  //                 };

  //                 try {
  //                     const response = await fetch(`${config.apiBaseUrl}/uploadBankStatement`, {
  //                         method: "POST",
  //                         headers: {
  //                             "Content-Type": "application/json"
  //                         },
  //                         body: JSON.stringify(payload)
  //                     });

  //                     if (!response.ok) {
  //                         throw new Error(`HTTP error! status: ${response.status}`);
  //                     }

  //                     const result = await response.json();
  //                     toast.success("Transactions imported successfully!");

  //                     // Grid data-va update panra line (Backend data illana frontend parsed data use aagum)
  //                     setRowData(result.stagedTransactions || payload.transactions);

  //                 } catch (err) {
  //                     console.error("Error during import:", err);
  //                     toast.error("Import failed. Please check the file or server.");
  //                 }
  //             }
  //         });
  //     };

  const handleImportTransactions = () => {
    const fileInput = document.getElementById("statementFileInput").files[0];
    if (!fileInput) return toast.warning("Please select a file first");

    Papa.parse(fileInput, {
      header: true,
      complete: async (results) => {
        const parsedData = results.data;
        if (parsedData.length === 0) {
          toast.warning("No transactions found in the file.");
          return;
        }
        setLoading(true);

        try {
          // 1. Header Payload
          const Header = {
            company_code:
              sessionStorage.getItem("selectedCompanyCode") || "FinEdge",
            location_code:
              sessionStorage.getItem("selectedLocationCode") || "LOC01",
            created_by: sessionStorage.getItem("selectedUserCode") || "admin",
            BankAccountId: bankAccount.value,
            OpeningBalance: openingBalance,
            ClosingBalance: closingBalance,
            StatementStartDate: startDate,
            StatementEndDate: endDate,
            TotalRecords: parsedData.length,
            StatementFormat: statementFormat.value,
            ImportMethod: importMethod.value,
            TransactionDate: new Date().toISOString().split("T")[0],
          };
          // 2. Call Header API
          const response = await fetch(
            `${config.apiBaseUrl}/BankStatementUploadInsert`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(Header),
            },
          );

          if (response.ok) {
            const searchData = await response.json();
            // Extracting the ID. SPs usually return objects like { "": "BSU-001" } or { BankStatementId: "BSU-001" }
            const rowDataObj = searchData[0];
            const generatedId =
              rowDataObj.BankStatementId || Object.values(rowDataObj)[0];

            if (!generatedId) {
              toast.error("Failed to retrieve generated Bank Statement ID.");
              setLoading(false);
              return;
            }
            // 3. Call Details Function
            await saveBankStatementDetails(generatedId, parsedData);
            toast.success("Bank Statement Data inserted Successfully");
            setRowData(parsedData); // Update AG-Grid
          } else {
            const errorResponse = await response.json();
            toast.warning(
              errorResponse.message || "Failed to insert Header data",
            );
          }
        } catch (error) {
          console.error("Error inserting data:", error);
          toast.error("Error inserting data: " + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // History fetch panra API call
  const fetchImportHistory = async () => {
    try {
      const payload = {
        company_code:
          sessionStorage.getItem("selectedCompanyCode") || "FinEdge",
      };
      const response = await fetch(
        `${config.apiBaseUrl}/getBankStatementHistory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        const data = await response.json();

        const formattedHistory = data.map((item) => ({
          date: item.TransactionDate
            ? item.TransactionDate.split("T")[0]
            : "N/A",
          batch: item.BankStatementId || "N/A",
          bank: item.BankAccountId || "N/A",
          fileName: item.FileName || "Unknown",
          records: `${item.TotalRecords || 0} Records`,
          status: item.ImportStatus || "Completed",
        }));

        // Latest upload first vara mari reverse panrom
        setImportHistory(formattedHistory.reverse());
      }
    } catch (error) {
      console.error("Failed to fetch import history", error);
    }
  };

  useEffect(() => {
    fetchImportHistory();
  }, []);

  // Loop Function to Save Details
  const saveBankStatementDetails = async (bankStatementId, parsedData) => {
    console.log(bankStatementId);
    try {
      // Filter out empty rows generated by blank lines at the end of CSVs
      const validRows = parsedData.filter(
        (row) => row.BankReference || row.Description,
      );

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          location_code: sessionStorage.getItem("selectedLocationCode"),
          created_by: sessionStorage.getItem("selectedUserCode") || "admin",
          BankStatementId: bankStatementId, // The ID retrieved from the header insert
          TransactionDate:
            row.TransactionDate || new Date().toISOString().split("T")[0],
          ValueDate: row.ValueDate || new Date().toISOString().split("T")[0],
          BankReference: row.BankReference || "",
          Description: row.Description || "",
          DebitAmount: parseFloat(row.DebitAmount) || 0,
          CreditAmount: parseFloat(row.CreditAmount) || 0,
          BalanceAmount: parseFloat(row.BalanceAmount) || 0,
          TransactionStatus: "Unmatched",
        };

        const response = await fetch(
          `${config.apiBaseUrl}/BankStatementTransactionInsert`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Details),
          },
        );

        if (!response.ok) {
          const errorResponse = await response.json();
          toast.warning(
            errorResponse.message || "Failed to insert transaction detail",
          );
        }
      }
    } catch (error) {
      console.error("Error inserting details:", error);
      toast.error("Error inserting details: " + error.message);
    }
  };

  const handleDownloadTemplate = () => {
    // Table columns-ku ethapola exact headers
    const headers = [
      "TransactionDate",
      "ValueDate",
      "BankReference",
      "Description",
      "DebitAmount",
      "CreditAmount",
      "BalanceAmount",
    ];
    // User-ku puriyuradhukku oru sample row data
    const sampleRow = [
      "2026-10-01",
      "2026-10-01",
      "UTR123456789",
      "Sample Credit Transaction",
      "0",
      "50000.00",
      "14300000.00",
    ];
    // CSV format-la join panradhu
    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");

    // Blob use panni file-ai download panradhu
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "Bank_Statement_Upload_Template.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.info("Template downloaded successfully!");
  };

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer
        position="top-right"
        className="toast-design"
        theme="colored"
      />

      {/* TOP HEADER */}
      <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2 mt-2">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <h1 align="left" className="purbut m-0 fw-bold">
              Bank Statement Upload
            </h1>
          </div>
          <div className="d-flex justify-content-end align-items-center gap-2 purbut">
            <button
              className="btn btn-outline-primary btn-sm me-2"
              onClick={generateReport}
              title="Generate Report"
            >
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
                options={[
                  {
                    value: "FinEdge",
                    label: "FinEdge Enterprises India Pvt Ltd",
                  },
                ]}
                className="exp-input-field"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label className="exp-form-labels">Statement Format</label>
              <div title="Select Statement Format">
                <Select
                  id="statementFormat"
                  value={selectedStatementFormat}
                  onChange={handleChangeFormat}
                  options={filteredOptionFormat}
                  className="exp-input-field"
                  placeholder="Select Format"
                  classNamePrefix="react-select"
                  styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                />
              </div>
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label className="exp-form-labels">Import Method</label>
              <div title="Select Import Method">
                <Select
                  id="importMethod"
                  value={selectedImportMethod}
                  onChange={handleChangeMethod}
                  options={filteredOptionMethod}
                  className="exp-input-field"
                  placeholder="Select Method"
                  classNamePrefix="react-select"
                  styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                />
              </div>
            </div>
          </div>

          <div className="col-md-3 form-group">
            <div className="exp-form-floating">
              <label className="exp-form-labels">Import Method</label>
              <Select
                value={importMethod}
                onChange={setImportMethod}
                options={[
                  { value: "Manual", label: "Direct Manual File Upload" },
                ]}
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
              <label className="exp-form-labels">
                Statement Period (Start Date)
              </label>
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
              <label className="exp-form-labels">
                Statement Period (End Date)
              </label>
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
        <div className="col-lg-6">
          <div className="p-3 bg-body-tertiary rounded h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h6 className="fw-bold m-0" style={{ fontSize: "0.85rem" }}>
                  Statement File Ingestion
                </h6>
                {/* <span className="text-primary text-decoration-underline" style={{ cursor: "pointer", fontSize: "0.75rem" }} >
                  Load Sample Bank File
                </span> */}
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
                <p className="fw-semibold m-0" style={{ fontSize: "0.8rem" }}>
                  Drag and drop bank statement here, or browse
                </p>
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  Supports CSV & Excel (.xlsx)
                </small>

                {/* Dynamically Display Uploaded File Info */}
                {uploadedFile && (
                  <div className="d-flex justify-content-center mt-1">
                    <div className="border bg-white rounded p-1 px-2 d-flex align-items-center gap-2 shadow-sm">
                      <i className="fa-solid fa-file-excel text-success fs-6"></i>
                      <div className="text-start">
                        <p
                          className="m-0 fw-bold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {uploadedFile.name}
                        </p>
                        <small
                          className="text-muted"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Size: {uploadedFile.size} •{" "}
                          <span className="text-primary">Imported</span>
                        </small>
                      </div>
                      <span
                        className="badge bg-success-subtle text-success border border-success ms-1"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {uploadedFile.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rules Toggles */}
              <div className="border rounded p-3 bg-light mb-2">
                <h6 className="fw-bold mb-1" style={{ fontSize: "0.75rem" }}>
                  Ingestion & Reconciliation Rules
                </h6>
                <div className="row g-1">
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="dupCheck"
                        checked={enableDuplicateCheck}
                        onChange={(e) =>
                          setEnableDuplicateCheck(e.target.checked)
                        }
                      />
                      <label
                        className="form-check-label fw-bold"
                        style={{ fontSize: "0.75rem" }}
                        htmlFor="dupCheck"
                      >
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
                      <label
                        className="form-check-label fw-bold"
                        style={{ fontSize: "0.75rem" }}
                        htmlFor="autoMap"
                      >
                        Auto Map Columns
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingestion Buttons */}
            <div className="d-flex justify-content-between pt-1">
              <button
                className="btn btn-outline-secondary btn-sm py-1 px-2"
                style={{ fontSize: "0.75rem" }}
                onClick={handleDownloadTemplate}
              >
                Download Template
              </button>
              <div className="d-flex gap-1">
                <button
                  className="btn btn-outline-primary btn-sm py-1 px-2"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => toast.info("Validating file structure...")}
                >
                  Validate File
                </button>
                {/* <button className="btn btn-primary btn-sm py-1 px-2" style={{ fontSize: "0.75rem" }} onClick={() => toast.success("Transactions imported successfully!")}>Import Transactions</button> */}
                <button
                  className="btn btn-primary btn-sm py-1 px-2"
                  style={{ fontSize: "0.75rem" }}
                  onClick={handleImportTransactions}
                >
                  Import Transactions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIDE PANEL: Recent Import History (Proper UI Design) */}
        <div className="col-lg-6">
          <div className="p-3 bg-body-tertiary rounded h-100 d-flex flex-column bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom">
              <div>
                <h6 className="fw-bold m-0" style={{ fontSize: "0.85rem" }}>
                  Recent Import History
                </h6>
                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                  Audited statement uploads
                </small>
              </div>
              <span className="badge bg-secondary" style={{ fontSize: "0.65rem" }} >
                {importHistory.length} Batches
              </span>
            </div>

            {/* Ag-Grid for Import History */}
            <div className="ag-theme-alpine position-relative" style={{ height: 210, width: "100%" }}>
              <AgGridReact
                rowData={importHistory}
                columnDefs={historyColumnDefs}
                headerHeight={28}
                rowHeight={30}
                defaultColDef={{ flex: 1 }}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center pt-2 mt-auto border-top">
              <span className="text-muted" style={{ fontSize: "0.68rem" }}>
                Showing {importHistory.length} recent batches
              </span>
              {/* <span
                className="text-primary text-decoration-underline fw-semibold"
                style={{ cursor: "pointer", fontSize: "0.72rem" }}
                onClick={() => toast.info("Opening all logs...")}
              >
                View All Logs &rarr;
              </span> */}
            </div>
          </div>
        </div>
      </div>

      {/* GRID DATA & STAGING GRID */}
      <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold m-0">Transaction Preview & Staging Grid</h6>
            {/* <span className="badge bg-secondary fs-8">10 Records</span> */}
          </div>
        </div>

        <div className="ag-theme-alpine" style={{ height: 280, width: "100%" }}>
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