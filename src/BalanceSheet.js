import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ItemDash.css';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';
import { ToastContainer, toast } from "react-toastify";
import LZString from "lz-string";
import { useNavigate } from 'react-router-dom';
import config from './Apiconfig';

const BalanceSheet = () => {
    const navigate = useNavigate();
    const companyName = sessionStorage.getItem('selectedCompanyName');

  const getLastFinancialYearEndDate = () => {
  const today = new Date();
  const currentYear = today.getFullYear();

  const financialYearEnd =
    today.getMonth() >= 3
      ? new Date(currentYear, 2, 31)
      : new Date(currentYear - 1, 2, 31);

  const year = financialYearEnd.getFullYear();
  const month = String(financialYearEnd.getMonth() + 1).padStart(2, "0");
  const day = String(financialYearEnd.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


    // Filter Form State
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedFY, setSelectedFY] = useState(null);
    const [asOnDate, setAsOnDate] = useState(getLastFinancialYearEndDate());
    const [selectedCurrency, setSelectedCurrency] = useState("");
    const [reportBasis, setReportBasis] = useState({ value: "Consolidated", label: "Consolidated" });

    // Checkbox States
    const [showLedgerDetails, setShowLedgerDetails] = useState(true);
    const [includeZeroBalances, setIncludeZeroBalances] = useState(false);
    const [compareWithPrevYear, setCompareWithPrevYear] = useState(true);
    const [showSchedule, setShowSchedule] = useState(false);
    const [includeUnpostedEntries, setIncludeUnpostedEntries] = useState(false);

    // For dropdowns
    const [financialYearIdDrop, setFinancialYearIdDrop] = useState([]);
    const [selectedFinancialYearId, setSelectedFinancialYearId] = useState("");
    const [financialYearId, setFinancialYearId] = useState("");
    const [hasValueChanged, setHasValueChanged] = useState(false);

    const [currencyDrop, setCurrencyDrop] = useState([]);
    const [currency, setCurrency] = useState("");

    const [liabilitiesData, setLiabilitiesData] = useState([]);
    const [assetsData, setAssetsData] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const filteredOptionCurrency = Array.isArray(currencyDrop)
        ? currencyDrop.map((option) => {
            const code = option.Currency_Code || option.currency_code || option.CurrencyCode || option.Keyfield;
            const name = option.Currency_Name || option.currency_name || option.CurrencyName || option.CountryName;
            return {
                value: code,
                label: `${code} - ${name}`,
            };
        })
        : [];

    const handleChangeCurrency = (selectedOption) => {
        setSelectedCurrency(selectedOption);
        setCurrency(selectedOption ? selectedOption.value : "");
        setHasValueChanged(true);
    };

    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");
        const location_code = sessionStorage.getItem("selectedLocationCode");

        fetch(`${config.apiBaseUrl}/getCurrencyCodeDrop`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code, location_code }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch currency list");
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setCurrencyDrop(data);
                } else {
                    setCurrencyDrop([]);
                }
            })
            .catch((err) => console.error("Error fetching currency dropdown:", err));
    }, []);

    // Function to group flat SQL data into the UI structure
    const processBalanceSheetData = (rawData, accountClass) => {
        const filteredData = rawData.filter(item => item.account_class === accountClass);
        if (filteredData.length === 0) return [];

        const grouped = {};
        filteredData.forEach(item => {
            if (!grouped[item.report_section]) {
                grouped[item.report_section] = [];
            }
            grouped[item.report_section].push(item);
        });

        const formattedData = [];
        Object.keys(grouped).forEach(section => {
            // 1. Add Header Row
            formattedData.push({ type: "header", name: section });
            
            let sectionCurrentTotal = 0;
            let sectionPrevTotal = 0;

            // 2. Add Detail Rows
            grouped[section].forEach(row => {
                formattedData.push({
                    name: row.report_line,
                    note: row.note_no,
                    current: row.current_amount !== 0 ? Number(row.current_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-",
                    prev: row.prev_amount !== 0 ? Number(row.prev_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-"
                });
                sectionCurrentTotal += Number(row.current_amount) || 0;
                sectionPrevTotal += Number(row.prev_amount) || 0;
            });

            // 3. Add Subtotal Row
            const subtotalName = section.replace(/^\d+\.\s*/, ''); // Removes "1. " from "1. Equity"
            formattedData.push({ 
                type: "subtotal", 
                name: `Total ${subtotalName}`, 
                current: sectionCurrentTotal !== 0 ? sectionCurrentTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-", 
                prev: sectionPrevTotal !== 0 ? sectionPrevTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-" 
            });
        });

        return formattedData;
    };

    // Fetch data from Node.js backend and return it
    const fetchBalanceSheetData = async () => {
        setLoading(true);
        try {
            const payload = {
                company_code: sessionStorage.getItem('selectedCompanyCode'),
                location_code: sessionStorage.getItem('selectedLocationCode') || '',
                Fin_year: selectedFinancialYearId?.value || "",
                as_on_date: asOnDate,
                currency: currency || "",
                report_basis: reportBasis?.value || ""
            };

            const response = await fetch(`${config.apiBaseUrl}/getBalanceSheetReport`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const rawData = await response.json();
                const newLiabilities = processBalanceSheetData(rawData, "Liabilities");
                const newAssets = processBalanceSheetData(rawData, "Assets");
                
                // Return the structured data directly
                return { liabilities: newLiabilities, assets: newAssets };
            } else {
                toast.warning("No records found for the selected criteria.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching balance sheet:", error);
            toast.error("Failed to load Balance Sheet data.");
            return null;
        } finally {
            setLoading(false);
        }
    };
    // Automatically fetch when crucial filters change
    useEffect(() => {
        if (asOnDate && companyName) {
            fetchBalanceSheetData();
        }
    }, [asOnDate, financialYearId, currency, reportBasis]);

    // Combine data for AG Grid side-by-side view
    const [rowData, setRowData] = useState([]);
    
    useEffect(() => {
        const maxLength = Math.max(liabilitiesData.length, assetsData.length);
        const combined = [];
        for (let i = 0; i < maxLength; i++) {
            const l = liabilitiesData[i] || {};
            const a = assetsData[i] || {};
            combined.push({
                liab_name: l.name || '', liab_note: l.note || '', liab_current: l.current || '', liab_prev: l.prev || '', liab_type: l.type || '',
                asset_name: a.name || '', asset_note: a.note || '', asset_current: a.current || '', asset_prev: a.prev || '', asset_type: a.type || ''
            });
        }
        setRowData(combined);
    }, []);

    const getCellStyle = (type) => {
        if (type === 'header') return { fontWeight: 'bold', backgroundColor: '#e9ecef', color: '#0d6efd' };
        if (type === 'subtotal') return { fontWeight: 'bold', backgroundColor: '#cfe2ff' };
        if (type === 'total') return { fontWeight: 'bold', backgroundColor: '#ffe69c' };
        return null;
    };

    // AG Grid Column Definitions (Grouped for side-by-side)
    const columnDefs = useMemo(() => [
        {
            headerName: 'A. EQUITY AND LIABILITIES',
            children: [
                { headerName: "Particulars", field: "liab_name", width: 220, cellStyle: p => getCellStyle(p.data.liab_type) },
                { headerName: "Note No.", field: "liab_note", width: 80, cellStyle: p => getCellStyle(p.data.liab_type) },
                { headerName: `As on ${asOnDate.split('-').reverse().join('-')} (₹)`, field: "liab_current", type: "rightAligned", width: 140, cellStyle: p => getCellStyle(p.data.liab_type) },
                { headerName: "Previous Year (₹)", field: "liab_prev", type: "rightAligned", width: 140, hide: !compareWithPrevYear, cellStyle: p => getCellStyle(p.data.liab_type) }
            ]
        },
        {
            headerName: 'B. ASSETS',
            children: [
                { headerName: "Particulars", field: "asset_name", width: 220, cellStyle: p => getCellStyle(p.data.asset_type) },
                { headerName: "Note No.", field: "asset_note", width: 80, cellStyle: p => getCellStyle(p.data.asset_type) },
                { headerName: `As on ${asOnDate.split('-').reverse().join('-')} (₹)`, field: "asset_current", type: "rightAligned", width: 140, cellStyle: p => getCellStyle(p.data.asset_type) },
                { headerName: "Previous Year (₹)", field: "asset_prev", type: "rightAligned", width: 140, hide: !compareWithPrevYear, cellStyle: p => getCellStyle(p.data.asset_type) }
            ]
        }
    ], [asOnDate, compareWithPrevYear]);

    const validateFilters = (action) => {
        if (!selectedFinancialYearId || !selectedFinancialYearId.value) {
            toast.warning(`Please select a Financial Year before ${action}.`);
            return false;
        }
        if (!asOnDate) {
            toast.warning(`Please select an As on Date before ${action}.`);
            return false;
        }
        if (!selectedCurrency || !selectedCurrency.value) {
            toast.warning(`Please select a Currency before ${action}.`);
            return false;
        }
        return true;
    };

    const handlePrint = async () => {

        if (!validateFilters("printing")) return;

        const data = await fetchBalanceSheetData();
        
        if (!data) return; // Stop if fetch failed

        const filtersPayload = {
            companyName: companyName,
            branch: selectedBranch.label,
            financialYear: selectedFinancialYearId.label,
            asOnDate: asOnDate,
            currency: selectedCurrency.label,
            reportBasis: reportBasis.label,
        };

        localStorage.setItem("BalanceSheetFilters", LZString.compressToUTF16(JSON.stringify(filtersPayload)));
        localStorage.setItem("BalanceSheetData", LZString.compressToUTF16(JSON.stringify(data)));

        window.open("/BalShePrint", "_blank");
    };

    const handleExportToExcel = async () => {

        if (!validateFilters("exporting")) return;
        
        const data = await fetchBalanceSheetData();
        
        if (!data) return; // Stop if fetch failed

        const headerData = [
            ['Balance Sheet'],
            [`Company Name: ${companyName}`],
            // [`Branch: ${selectedBranch.label}`],
            [`Financial Year: ${selectedFinancialYearId.label}`],
            [`As on Date: ${asOnDate}`],
            [`Currency: ${selectedCurrency.label}`],
            []
        ];

        const exportRows = [];
        
        exportRows.push(["A. EQUITY AND LIABILITIES", "Note No.", `As on ${asOnDate} (₹)`, "Previous Year (₹)"]);
        data.liabilities.forEach(row => {
            exportRows.push([row.name, row.note || "", row.current || "", row.prev || ""]);
        });

        exportRows.push([]); // Empty row spacing
        exportRows.push(["B. ASSETS", "Note No.", `As on ${asOnDate} (₹)`, "Previous Year (₹)"]);
        data.assets.forEach(row => {
            exportRows.push([row.name, row.note || "", row.current || "", row.prev || ""]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet([...headerData, ...exportRows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Balance_Sheet');
        XLSX.writeFile(workbook, `Balance_Sheet_${asOnDate}.xlsx`);
    };

    return (
        <div className="container-fluid Topnav-screen">
            <ToastContainer position="top-right" className="toast-design" theme="colored" />

            {/* Top Header Card matching Customer Ledger */}
            <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="purbut mt-3">Balance Sheet</h1>
                    </div>
                    <div className="mobileview">
                        <div className="d-flex justify-content-between">
                            <div className="d-flex justify-content-start">
                                <h1 className="h1">Balance Sheet</h1>
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
                                            <span className="iconbutton d-flex justify-content-center" onClick={handleExportToExcel}>
                                                <i className="fa-solid fa-file-excel"></i>
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="purbut">
                        <div className="d-flex justify-content-end me-5 gap-2">
                            <button className="btn btn-dark mt-3 mb-3 rounded-3" onClick={handlePrint} title="Generate Report">
                                <i className="fa-solid fa-print"></i>
                            </button>
                            <button className="btn btn-dark mt-3 mb-3 rounded-3" onClick={handleExportToExcel} title="Export Excel">
                                <i className="fa-solid fa-file-excel"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and Content Card matching Customer Ledger */}
            <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2 mt-2">
                {/* ROW 1: Filters */}
                <div className="row ms-2 me-2 mb-3">
                    {/* <div className="col-md-2 form-group text-start">
                        <label className="form-label">Company <span className="text-danger">*</span></label>
                        <Select
                            value={selectedCompany}
                            onChange={setSelectedCompany}
                            className="border-secondary"
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div> */}
                    {/* <div className="col-md-2 form-group text-start">
                        <label className="form-label">Branch</label>
                        <Select
                            value={selectedBranch}
                            onChange={setSelectedBranch}
                            className="border-secondary"
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div> */}
                    <div className="col-md-2 form-group text-start">
                        <label className="form-label">Financial Year <span className="text-danger">*</span></label>
                        <Select
                            options={filteredOptionFinancialYear}
                            value={selectedFinancialYearId}
                            onChange={handleChangeFinancialYear}
                            className="border-secondary"
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div>
                    <div className="col-md-2 form-group text-start">
                        <label className="form-label">As on Date <span className="text-danger">*</span></label>
                        <input
                            type="date"
                            className="exp-input-field form-control"
                            value={asOnDate}
                            onChange={(e) => setAsOnDate(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2 form-group text-start">
                        <label className="form-label">Currency <span className="text-danger">*</span></label>
                        <Select
                            value={selectedCurrency}
                            onChange={handleChangeCurrency}
                            options={filteredOptionCurrency}
                            className="border-secondary"
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div>
                    <div className="col-md-2 form-group text-start">
                        <label className="form-label">Report Basis</label>
                        <Select
                            value={reportBasis}
                            onChange={setReportBasis}
                            className="border-secondary"
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div>
                </div>

                {/* Checkboxes Area */}
                <div className="d-flex flex-wrap gap-4 align-items-center ms-2 me-2 mb-3 mt-3" style={{fontSize: '13px'}}>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={showLedgerDetails} onChange={(e) => setShowLedgerDetails(e.target.checked)} id="showLedger" />
                        <label className="form-check-label" htmlFor="showLedger">Show Ledger Details</label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={includeZeroBalances} onChange={(e) => setIncludeZeroBalances(e.target.checked)} id="zeroBal" />
                        <label className="form-check-label" htmlFor="zeroBal">Include Zero Balances</label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={compareWithPrevYear} onChange={(e) => setCompareWithPrevYear(e.target.checked)} id="comparePrev" />
                        <label className="form-check-label" htmlFor="comparePrev">Compare with Previous Year</label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={showSchedule} onChange={(e) => setShowSchedule(e.target.checked)} id="showSch" />
                        <label className="form-check-label" htmlFor="showSch">Show Schedule</label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={includeUnpostedEntries} onChange={(e) => setIncludeUnpostedEntries(e.target.checked)} id="unposted" />
                        <label className="form-check-label" htmlFor="unposted">Include Unposted Entries</label>
                    </div>
                </div>

                {/* AG Grid Container */}
                {/* <div className="ag-theme-alpine mb-4 ms-2 me-2" style={{ height: 500, width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        headerHeight={40}
                        groupHeaderHeight={45}
                        suppressRowHoverHighlight={true}
                    />
                </div> */}
            </div>
        </div>
    );
};

export default BalanceSheet;