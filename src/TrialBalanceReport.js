import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import config from './Apiconfig';
import LZString from "lz-string";

const TrialBalance = () => {
    // --- State Management ---
    const [loading, setLoading] = useState(false);
    const [gridApi, setGridApi] = useState(null);

    // Dropdown States
    const [selectedCompany, setSelectedCompany] = useState({ value: "YJK", label: "YJK Technologies" });
    const [selectedFY, setSelectedFY] = useState({ value: "2026-2027", label: "2026 - 2027" });
    const [selectedBranch, setSelectedBranch] = useState({ value: "All Branches", label: "All Branches" });
    const [selectedLedgerType, setSelectedLedgerType] = useState({ value: "All Ledgers", label: "All Ledgers" });
    const [selectedGroup, setSelectedGroup] = useState({ value: "All Groups", label: "All Groups" });
    const [selectedCostCentre, setSelectedCostCentre] = useState({ value: "All Cost Centres", label: "All Cost Centres" });

    // Input States
    const [fromDate, setFromDate] = useState("2026-04-01");
    const [toDate, setToDate] = useState("2026-10-31");
    const [accountFrom, setAccountFrom] = useState("");
    const [accountTo, setAccountTo] = useState("");

    // Checkbox States
    const [includeZeroBalance, setIncludeZeroBalance] = useState(false);
    const [showOpeningBalance, setShowOpeningBalance] = useState(true);
    const [showTransactions, setShowTransactions] = useState(false);

    // Radio State
    const [reportFormat, setReportFormat] = useState("Detailed");

    // Grid Data
    const [rowData, setRowData] = useState([]);
    const [totals, setTotals] = useState({ debit: 0, credit: 0, diff: 0 });

    // Dummy Options for Dropdowns
    const companyOptions = [{ value: "YJK", label: "YJK Technologies" }];
    const fyOptions = [{ value: "2026-2027", label: "2026 - 2027" }];
    const branchOptions = [{ value: "All Branches", label: "All Branches" }];
    const ledgerTypeOptions = [{ value: "All Ledgers", label: "All Ledgers" }];
    const groupOptions = [{ value: "All Groups", label: "All Groups" }];
    const costCentreOptions = [{ value: "All Cost Centres", label: "All Cost Centres" }];

    // For Dropdown 
    const [selectedFinancialYearId, setSelectedFinancialYearId] = useState("");
    const [financialYearIdDrop, setFinancialYearIdDrop] = useState([]);
    const [financialYearId, setFinancialYearId] = useState("");
    const [hasValueChanged, setHasValueChanged] = useState(false);

    const filteredOptionFinancialYear = Array.isArray(financialYearIdDrop)
            ? financialYearIdDrop.map((option) => ({
                value: option.Keyfield,
                label: `${option.Keyfield} - ${option.Financial_Year_Code}`
            }))
            : [];

    const handleChangeFinancialYear = (selectedFinancialYearId) => {
            setSelectedFinancialYearId(selectedFinancialYearId);
            setFinancialYearId(selectedFinancialYearId ? selectedFinancialYearId.value : "");
            setHasValueChanged(true);
        };

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

    // --- Columns Definition ---[cite: 1, 2]
    const columnDefs = useMemo(() => [
        { headerName: "S.No.", field: "s_no", width: 70, pinned: 'left' },
        { headerName: "Account Code", field: "account_code", width: 120, pinned: 'left' },
        { headerName: "Account Name", field: "account_name", minWidth: 200, flex: 1, pinned: 'left' },
        { headerName: "Account Group", field: "account_group", width: 160 },
        {
            headerName: "Opening Debit (₹)", field: "op_debit", width: 150, type: "rightAligned",
            valueFormatter: (params) => formatCurrency(params.value),
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold', backgroundColor: '#e9ecef' } : { backgroundColor: '#f0f8ff' }
        },
        {
            headerName: "Opening Credit (₹)", field: "op_credit", width: 150, type: "rightAligned",
            valueFormatter: (params) => formatCurrency(params.value),
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold', backgroundColor: '#e9ecef' } : { backgroundColor: '#f0f8ff' }
        },
        {
            headerName: "Period Debit (₹)", field: "per_debit", width: 150, type: "rightAligned",
            valueFormatter: (params) => formatCurrency(params.value),
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold', backgroundColor: '#e9ecef' } : { backgroundColor: '#e6f2ff' }
        },
        {
            headerName: "Period Credit (₹)", field: "per_credit", width: 150, type: "rightAligned",
            valueFormatter: (params) => formatCurrency(params.value),
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold', backgroundColor: '#e9ecef' } : { backgroundColor: '#e6f2ff' }
        },
        {
            headerName: "Closing Debit (₹)", field: "cl_debit", width: 150, type: "rightAligned",
            valueFormatter: (params) => formatCurrency(params.value),
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold', backgroundColor: '#e9ecef' } : { backgroundColor: '#f0f8ff' }
        },
        {
            headerName: "Closing Credit (₹)", field: "cl_credit", width: 150, type: "rightAligned",
            valueFormatter: (params) => formatCurrency(params.value),
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold', backgroundColor: '#e9ecef' } : { backgroundColor: '#f0f8ff' }
        }
    ], []);

    // --- Helpers ---[cite: 2]
    const formatCurrency = (val) => {
        if (val === null || val === undefined || val === "") return "";
        return Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // --- Actions ---
    const handleGenerateReport = () => {
        setLoading(true);
        // Simulating data load matching the reference image[cite: 1]
        setTimeout(() => {
            const dummyData = [
                { s_no: 1, account_code: "1001", account_name: "Cash Account", account_group: "Current Assets", op_debit: 50000, op_credit: 0, per_debit: 200000, per_credit: 150000, cl_debit: 100000, cl_credit: 0 },
                { s_no: 2, account_code: "1002", account_name: "Bank Account", account_group: "Current Assets", op_debit: 300000, op_credit: 0, per_debit: 500000, per_credit: 400000, cl_debit: 400000, cl_credit: 0 },
                { s_no: 3, account_code: "1101", account_name: "Accounts Receivable", account_group: "Current Assets", op_debit: 200000, op_credit: 0, per_debit: 600000, per_credit: 550000, cl_debit: 250000, cl_credit: 0 },
                { s_no: 4, account_code: "1102", account_name: "Inventory", account_group: "Current Assets", op_debit: 500000, op_credit: 0, per_debit: 300000, per_credit: 250000, cl_debit: 550000, cl_credit: 0 },
                { s_no: 5, account_code: "2001", account_name: "Accounts Payable", account_group: "Current Liabilities", op_debit: 0, op_credit: 400000, per_debit: 300000, per_credit: 450000, cl_debit: 0, cl_credit: 550000 },
                { s_no: 6, account_code: "2101", account_name: "Statutory Liabilities", account_group: "Current Liabilities", op_debit: 0, op_credit: 100000, per_debit: 120000, per_credit: 140000, cl_debit: 0, cl_credit: 120000 },
                { s_no: 7, account_code: "3001", account_name: "Capital Account", account_group: "Equity", op_debit: 0, op_credit: 1000000, per_debit: 0, per_credit: 0, cl_debit: 0, cl_credit: 1000000 },
                { s_no: 8, account_code: "4001", account_name: "Sales Account", account_group: "Income", op_debit: 0, op_credit: 0, per_debit: 0, per_credit: 800000, cl_debit: 0, cl_credit: 800000 },
                { s_no: 9, account_code: "5001", account_name: "Purchase Account", account_group: "Expense", op_debit: 0, op_credit: 0, per_debit: 400000, per_credit: 0, cl_debit: 400000, cl_credit: 0 },
                { s_no: 10, account_code: "5101", account_name: "Rent Expense", account_group: "Expense", op_debit: 0, op_credit: 0, per_debit: 100000, per_credit: 0, cl_debit: 100000, cl_credit: 0 },
                { s_no: 11, account_code: "5102", account_name: "Salary Expense", account_group: "Expense", op_debit: 0, op_credit: 0, per_debit: 200000, per_credit: 0, cl_debit: 200000, cl_credit: 0 },
                { s_no: 12, account_code: "5103", account_name: "Other Expenses", account_group: "Expense", op_debit: 0, op_credit: 0, per_debit: 50000, per_credit: 0, cl_debit: 50000, cl_credit: 0 }
            ];

            const totalsCalc = dummyData.reduce((acc, row) => {
                acc.op_debit += row.op_debit;
                acc.op_credit += row.op_credit;
                acc.per_debit += row.per_debit;
                acc.per_credit += row.per_credit;
                acc.cl_debit += row.cl_debit;
                acc.cl_credit += row.cl_credit;
                return acc;
            }, { op_debit: 0, op_credit: 0, per_debit: 0, per_credit: 0, cl_debit: 0, cl_credit: 0 });

            setTotals({ debit: totalsCalc.cl_debit, credit: totalsCalc.cl_credit, diff: totalsCalc.cl_debit - totalsCalc.cl_credit });

            const totalRow = {
                s_no: "", account_code: "", account_name: "TOTAL", account_group: "",
                op_debit: totalsCalc.op_debit, op_credit: totalsCalc.op_credit,
                per_debit: totalsCalc.per_debit, per_credit: totalsCalc.per_credit,
                cl_debit: totalsCalc.cl_debit, cl_credit: totalsCalc.cl_credit,
                isTotalRow: true
            };

            setRowData([...dummyData, totalRow]);
            setLoading(false);
            toast.success("Report generated successfully!");
        }, 800);
    };

    const handleClear = () => {
        setRowData([]);
        setTotals({ debit: 0, credit: 0, diff: 0 });
    };

    const handleExportExcel = () => {
        if (rowData.length === 0) return toast.warning("No data to export.");
        const worksheet = XLSX.utils.json_to_sheet(rowData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Trial_Balance');
        XLSX.writeFile(workbook, `Trial_Balance.xlsx`);
    };

    // const handlePrint = () => {
    //     if (rowData.length === 0) {
    //         toast.warning("Please generate the report before printing.");
    //         return;
    //     }

    //     const filtersPayload = {
    //         companyName: selectedCompany?.label || "YJK Technologies",
    //         financialYear: selectedFinancialYearId?.label || selectedFY?.label || "2026 - 2027",
    //         branch: selectedBranch?.label || "All Branches",
    //         ledgerType: selectedLedgerType?.label || "All Ledgers",
    //         fromDate: fromDate,
    //         toDate: toDate,
    //         accountGroup: selectedGroup?.label || "All Groups",
    //         costCentre: selectedCostCentre?.label || "All Cost Centres",
    //         currency: "INR" 
    //     };

    //     // Filter out the AG Grid total row to prevent duplication in the print screen
    //     const rowsToPrint = rowData.filter((row) => !row.isTotalRow);

    //     // Compress and save to localStorage
    //     localStorage.setItem("TrialBalanceFilters", LZString.compressToUTF16(JSON.stringify(filtersPayload)));
    //     localStorage.setItem("TrialBalanceRows", LZString.compressToUTF16(JSON.stringify(rowsToPrint)));
    //     localStorage.setItem("TrialBalanceMetrics", LZString.compressToUTF16(JSON.stringify(totals)));

    //     // Open print view in a new tab (Ensure your routing file matches this URL path)
    //     window.open("/TriBalPrint", "_blank");
    // };


const handlePrint = () => {

    // STEP 1: Prepare dummy data if report has not been generated
    const dummyData = [
        { s_no: 1, account_code: "1001", account_name: "Cash Account", account_group: "Current Assets", op_debit: 50000, op_credit: 0, per_debit: 200000, per_credit: 150000, cl_debit: 100000, cl_credit: 0 },
        { s_no: 2, account_code: "1002", account_name: "Bank Account", account_group: "Current Assets", op_debit: 300000, op_credit: 0, per_debit: 500000, per_credit: 400000, cl_debit: 400000, cl_credit: 0 },
        { s_no: 3, account_code: "1101", account_name: "Accounts Receivable", account_group: "Current Assets", op_debit: 200000, op_credit: 0, per_debit: 600000, per_credit: 550000, cl_debit: 250000, cl_credit: 0 },
        { s_no: 4, account_code: "1102", account_name: "Inventory", account_group: "Current Assets", op_debit: 500000, op_credit: 0, per_debit: 300000, per_credit: 250000, cl_debit: 550000, cl_credit: 0 },
        { s_no: 5, account_code: "2001", account_name: "Accounts Payable", account_group: "Current Liabilities", op_debit: 0, op_credit: 400000, per_debit: 300000, per_credit: 450000, cl_debit: 0, cl_credit: 550000 },
        { s_no: 6, account_code: "2101", account_name: "Statutory Liabilities", op_debit: 0, op_credit: 100000, per_debit: 120000, per_credit: 140000, cl_debit: 0, cl_credit: 120000 },
        { s_no: 7, account_code: "3001", account_name: "Capital Account", account_group: "Equity", op_debit: 0, op_credit: 1000000, per_debit: 0, per_credit: 0, cl_debit: 0, cl_credit: 1000000 },
        { s_no: 8, account_code: "4001", account_name: "Sales Account", account_group: "Income", op_debit: 0, op_credit: 0, per_debit: 0, per_credit: 800000, cl_debit: 0, cl_credit: 800000 },
        { s_no: 9, account_code: "5001", account_name: "Purchase Account", account_group: "Expense", op_debit: 0, op_credit: 0, per_debit: 400000, per_credit: 0, cl_debit: 400000, cl_credit: 0 },
        { s_no: 10, account_code: "5101", account_name: "Rent Expense", account_group: "Expense", op_debit: 0, op_credit: 0, per_debit: 100000, per_credit: 0, cl_debit: 100000, cl_credit: 0 },
        { s_no: 11, account_code: "5102", account_name: "Salary Expense", account_group: "Expense", op_debit: 0, op_credit: 0, per_debit: 200000, per_credit: 0, cl_debit: 200000, cl_credit: 0 },
        { s_no: 12, account_code: "5103", account_name: "Other Expenses", account_group: "Expense", op_debit: 0, op_credit: 0, per_debit: 50000, per_credit: 0, cl_debit: 50000, cl_credit: 0 }
    ];

    // STEP 2: Use existing report data or dummy data
    const rowsToUse = rowData.length > 0
        ? rowData.filter(row => !row.isTotalRow)
        : dummyData;

    // STEP 3: Calculate totals
    const totalsCalc = rowsToUse.reduce((acc, row) => {
        acc.op_debit += Number(row.op_debit) || 0;
        acc.op_credit += Number(row.op_credit) || 0;
        acc.per_debit += Number(row.per_debit) || 0;
        acc.per_credit += Number(row.per_credit) || 0;
        acc.cl_debit += Number(row.cl_debit) || 0;
        acc.cl_credit += Number(row.cl_credit) || 0;
        return acc;
    }, {
        op_debit: 0,
        op_credit: 0,
        per_debit: 0,
        per_credit: 0,
        cl_debit: 0,
        cl_credit: 0
    });

    const calculatedTotals = {
        debit: totalsCalc.cl_debit,
        credit: totalsCalc.cl_credit,
        diff: totalsCalc.cl_debit - totalsCalc.cl_credit
    };

    // STEP 4: Update main screen data if dummy data is used
    if (rowData.length === 0) {
        setRowData([...dummyData, {
            s_no: "",
            account_code: "",
            account_name: "TOTAL",
            account_group: "",
            op_debit: totalsCalc.op_debit,
            op_credit: totalsCalc.op_credit,
            per_debit: totalsCalc.per_debit,
            per_credit: totalsCalc.per_credit,
            cl_debit: totalsCalc.cl_debit,
            cl_credit: totalsCalc.cl_credit,
            isTotalRow: true
        }]);

        setTotals(calculatedTotals);
    }

    // STEP 5: Prepare filter details
    const filtersPayload = {
        companyName: selectedCompany?.label || "YJK Technologies",
        financialYear: selectedFinancialYearId?.label || selectedFY?.label || "2026 - 2027",
        branch: selectedBranch?.label || "All Branches",
        ledgerType: selectedLedgerType?.label || "All Ledgers",
        fromDate: fromDate,
        toDate: toDate,
        accountGroup: selectedGroup?.label || "All Groups",
        costCentre: selectedCostCentre?.label || "All Cost Centres",
        accountFrom: accountFrom,            // <-- Added
        accountTo: accountTo,                // <-- Added
        includeZeroBalance: includeZeroBalance, // <-- Added
        showOpeningBalance: showOpeningBalance, // <-- Added
        showTransactions: showTransactions,     // <-- Added
        currency: "INR"
    };

    // STEP 6: Save data for print screen
    localStorage.setItem(
        "TrialBalanceFilters",
        LZString.compressToUTF16(JSON.stringify(filtersPayload))
    );

    localStorage.setItem(
        "TrialBalanceRows",
        LZString.compressToUTF16(JSON.stringify(rowsToUse))
    );

    localStorage.setItem(
        "TrialBalanceMetrics",
        LZString.compressToUTF16(JSON.stringify(calculatedTotals))
    );

    // STEP 7: Open print screen
    window.open("/TriBalPrint", "_blank");
};


    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    return (
        <div className="container-fluid Topnav-screen">
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            
            {/* Header & Title */}
            <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
                    <div className="d-flex justify-content-between align-items-center">
            <div>
                            <h1 className="purbut mt-3">
                                {/* <i className="fa-solid fa-book-open me-2 text-primary"></i>  */}
                                Trial Balance Report
                            </h1>
                        </div>
                        <div className="mobileview">
                            <div className="d-flex justify-content-between">
                                <div className="d-flex justify-content-start">
                                    <h1 className="h1">Trial Balance Report</h1>
                                </div>
                                <div className="d-flex justify-content-end mt-3 me-4">
                                    <div className="dropdown1">
                                        <button className="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fa-solid fa-list"></i>
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <span className="iconbutton d-flex justify-content-center" onClick={handlePrint}>
                                                    <i className="fa-solid fa-print"></i>
                                                </span>
                                            </li>
                                            <li>
                                                <span className="iconbutton d-flex justify-content-center" onClick={handleExportExcel}>
                                                    <i className="fa-solid fa-file-excel"></i>
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* ---> INSERT THIS NEW BLOCK HERE <--- */}
        <div className="purbut">
            <div className="d-flex justify-content-end me-5 gap-2">
                <button className="btn btn-dark mt-3 mb-3 rounded-3" onClick={handlePrint} title="Print">
                    <i className="fa-solid fa-print"></i>
                </button>
                <button className="btn btn-dark mt-3 mb-3 rounded-3" onClick={handleExportExcel} title="Export Excel">
                    <i className="fa-solid fa-file-excel"></i>
                </button>
            </div>
        </div>
        {/* ---> END OF NEW BLOCK <--- */}
                        </div>
                </div>

            {/* Filter Section[cite: 1, 2] */}
            <div className="shadow-lg p-3 bg-white rounded mb-2">
                {/* Row 1 */}
                <div className="row mb-3">
                    {/* <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>Company <span className="text-danger">*</span></label>
                        <Select options={companyOptions} value={selectedCompany} onChange={setSelectedCompany} classNamePrefix="react-select" />
                    </div> */}
                    <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>Financial Year <span className="text-danger">*</span></label>
                        <Select options={filteredOptionFinancialYear} value={selectedFinancialYearId} onChange={handleChangeFinancialYear} classNamePrefix="react-select" />
                    </div>
                    {/* <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>Branch</label>
                        <Select options={branchOptions} value={selectedBranch} onChange={setSelectedBranch} classNamePrefix="react-select" />
                    </div> */}
                    <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>Ledger Type</label>
                        <Select options={ledgerTypeOptions} value={selectedLedgerType} onChange={setSelectedLedgerType} classNamePrefix="react-select" />
                    </div>
                    <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>From Date <span className="text-danger">*</span></label>
                        <input type="date" className="exp-input-field form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>To Date <span className="text-danger">*</span></label>
                        <input type="date" className="exp-input-field form-control" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>Account From</label>
                        <div className="position-relative">
                            <input type="text" className="exp-input-field form-control" placeholder="Select Account" value={accountFrom} onChange={(e) => setAccountFrom(e.target.value)} />
                            <i className="fa fa-search position-absolute text-muted" style={{ right: '10px', top: '10px', cursor: 'pointer' }}></i>
                        </div>
                    </div>
                    <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>Account To</label>
                        <div className="position-relative">
                            <input type="text" className="exp-input-field form-control" placeholder="Select Account" value={accountTo} onChange={(e) => setAccountTo(e.target.value)} />
                            <i className="fa fa-search position-absolute text-muted" style={{ right: '10px', top: '10px', cursor: 'pointer' }}></i>
                        </div>
                    </div>
                    <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>Account Group</label>
                        <Select options={groupOptions} value={selectedGroup} onChange={setSelectedGroup} classNamePrefix="react-select" />
                    </div>
                    <div className="col-md-3 form-group">
                        <label className="form-label" style={{ fontSize: '13px' }}>Cost Centre</label>
                        <Select options={costCentreOptions} value={selectedCostCentre} onChange={setSelectedCostCentre} classNamePrefix="react-select" />
                    </div>
                    <div className="col-md-6 form-group d-flex gap-4 pt-2">
                        <label className="d-flex align-items-center" style={{ fontSize: '13px' }}>
                            <input type="checkbox" className="me-2" checked={includeZeroBalance} onChange={(e) => setIncludeZeroBalance(e.target.checked)} /> Include Zero Balance Accounts
                        </label>
                        <label className="d-flex align-items-center" style={{ fontSize: '13px' }}>
                            <input type="checkbox" className="me-2" checked={showOpeningBalance} onChange={(e) => setShowOpeningBalance(e.target.checked)} /> Show Opening Balance
                        </label>
                        <label className="d-flex align-items-center" style={{ fontSize: '13px' }}>
                            <input type="checkbox" className="me-2" checked={showTransactions} onChange={(e) => setShowTransactions(e.target.checked)} /> Show Transactions
                        </label>
                    </div>
                </div>

                {/* Row 4 - Report Formats & Actions[cite: 1] */}
                {/* <div className="row mb-3 align-items-center">
                    <div className="col-md-6 d-flex align-items-center gap-4">
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>Report Format</span>
                        {['Detailed', 'Summary', 'Group Wise', 'Comparative'].map((fmt) => (
                            <label key={fmt} className="d-flex align-items-center m-0" style={{ fontSize: '13px', cursor: 'pointer' }}>
                                <input type="radio" name="reportFormat" value={fmt} checked={reportFormat === fmt} onChange={(e) => setReportFormat(e.target.value)} className="me-1" /> {fmt}
                            </label>
                        ))}
                    </div>
                </div> */}

                {/* Action Buttons[cite: 1] */}
                {/* <div className="row mb-2">
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary btn-sm px-3" onClick={handleGenerateReport} disabled={loading}>
                            <i className="fa-solid fa-eye me-2"></i> Generate Report
                        </button>
                        <button className="btn btn-outline-secondary btn-sm px-3 bg-white" onClick={handleClear}>
                            <i className="fa-solid fa-rotate-right me-2"></i> Clear
                        </button>
                        <button className="btn btn-success btn-sm px-3" onClick={handleExportExcel}>
                            <i className="fa-solid fa-file-excel me-2"></i> Export Excel
                        </button>
                        <button className="btn btn-danger btn-sm px-3">
                            <i className="fa-solid fa-file-pdf me-2"></i> Export PDF
                        </button>
                        <button className="btn btn-outline-secondary btn-sm px-3 bg-white">
                            <i className="fa-solid fa-print me-2"></i> Print
                        </button>
                    </div>
                </div> */}
            </div>

            {/* Grid & Report Info Header[cite: 1] */}
            {/* {rowData.length > 0 && (
                <div className="shadow-lg p-3 bg-white rounded"> */}
                    {/* Information Banner */}
                    {/* <div className="row mb-3 border-bottom pb-2">
                        <div className="col-md-4">
                            <h6 className="fw-bold m-0">YJK Technologies</h6>
                            <p className="text-muted m-0" style={{ fontSize: '12px' }}>No. 123, Anna Salai, Chennai - 600001</p>
                            <p className="text-muted m-0" style={{ fontSize: '12px' }}>GSTIN: 33AAAAA0000A1Z5</p>
                        </div>
                        <div className="col-md-4 text-center">
                            <h5 className="fw-bold m-0 text-primary">Trial Balance</h5>
                            <p className="text-muted m-0" style={{ fontSize: '13px', fontWeight: '500' }}>From 01-Apr-2026 To 31-Oct-2026</p>
                        </div>
                        <div className="col-md-4 text-end" style={{ fontSize: '12px' }}>
                            <div><span className="text-muted">Financial Year : </span>2026 - 2027</div>
                            <div><span className="text-muted">Branch : </span>All Branches</div>
                            <div><span className="text-muted">Report Date : </span>27-Oct-2026 10:30 AM</div>
                            <div><span className="text-muted">Currency : </span>INR (₹)</div>
                        </div>
                    </div> */}

                    {/* AG Grid[cite: 2] */}
                    {/* <div className="ag-theme-alpine w-100" style={{ height: '480px' }}>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            headerHeight={40}
                            rowHeight={35}
                            onGridReady={onGridReady}
                            defaultColDef={{ resizable: true, sortable: true }}
                            getRowStyle={(params) => params.data.isTotalRow ? { backgroundColor: '#e9ecef', fontWeight: 'bold' } : null}
                        />
                    </div> */}

                    {/* Bottom Status Bar[cite: 1] */}
                    {/* <div className="mt-3 p-2 rounded d-flex align-items-center" style={{ backgroundColor: '#e6f4ea', border: '1px solid #c3e6cb', color: '#155724', fontSize: '14px', fontWeight: '500' }}>
                        <i className="fa-solid fa-circle-check me-2 text-success"></i> 
                        Balanced <span className="mx-2 text-muted">|</span> 
                        Total Debit = ₹ {formatCurrency(totals.debit)} <span className="mx-2 text-muted">|</span> 
                        Total Credit = ₹ {formatCurrency(totals.credit)} <span className="mx-2 text-muted">|</span> 
                        Difference = ₹ {formatCurrency(totals.diff)}
                    </div> */}
                {/* </div>
            )} */}
        </div>
    );
};

export default TrialBalance;