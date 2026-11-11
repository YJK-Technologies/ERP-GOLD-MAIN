import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './ItemDash.css';
import * as XLSX from 'xlsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';
import config from './Apiconfig';
import { ToastContainer, toast } from "react-toastify";
import LoadingScreen from './Loading';
import LZString from "lz-string";
import { useNavigate } from 'react-router-dom';
import PurchaseVendorPopup from './PurchaseVendorPopup'; // Assumed equivalent popup for Vendors

const VendorLedger = () => {
    const navigate = useNavigate();

    const formatDate = (isoDateString) => {
        if (!isoDateString) return "";
        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) return isoDateString;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    };

    const [loading, setLoading] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const companyName = sessionStorage.getItem('selectedCompanyName');

    const [activeTab, setActiveTab] = useState("ledger");

    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedFY, setSelectedFY] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [gstin, setGstin] = useState("");
    const [fromDate, setFromDate] = useState("2026-04-01");
    const [toDate, setToDate] = useState("2027-03-31");
    const [selectedBranch, setSelectedBranch] = useState({ value: "All Branches", label: "All Branches" });
    const [selectedVoucherType, setSelectedVoucherType] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState({ value: "Posted", label: "Posted" });
    const [referenceNo, setReferenceNo] = useState("");

    const [vendorCode, setVendorCode] = useState("");
    const [vendorName, setVendorName] = useState("");
    const [openVendorModal, setOpenVendorModal] = useState(false);

    const [company, setCompany] = useState("");
    const [companynodrop, setcompanynodrop] = useState([]);

    const [selectedFinancialYearId, setSelectedFinancialYearId] = useState("");
    const [financialYearId, setFinancialYearId] = useState("");
    const [hasValueChanged, setHasValueChanged] = useState(false);
    const [financialYearIdDrop, setFinancialYearIdDrop] = useState([]);
    
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [currency, setCurrency] = useState("");
    const [currencyDrop, setCurrencyDrop] = useState([]);

    const [selectedscreens, setSelectedscreens] = useState(null);
    const [Screens, setScreens] = useState('');
    const [screensDrop, setScreensDrop] = useState([]);

    const [voucherTypeDrop, setVoucherTypeDrop] = useState([]);
    const [voucherType, setVoucherType] = useState([]);

    // DUMMY DATA: Remove when backend is ready
    const DEMO_TRANSACTIONS = [
        { s_no: 1, date: "01-10-2026", voucher_no: "PUR-INV-001", type: "Purchase Invoice", reference_no: "REF-101", description: "Purchased raw materials", debit: 0, credit: 50000, balance: "50,000.00 Cr" },
        { s_no: 2, date: "05-10-2026", voucher_no: "PAY-001", type: "Payment", reference_no: "CHQ-9921", description: "Payment made via bank", debit: 20000, credit: 0, balance: "30,000.00 Cr" },
        { s_no: 3, date: "15-10-2026", voucher_no: "PUR-INV-002", type: "Purchase Invoice", reference_no: "REF-102", description: "Office supplies", debit: 0, credit: 15000, balance: "45,000.00 Cr" }
    ];

    const handleChangeCompany = (selectedCompany) => {
        setSelectedCompany(selectedCompany);
        setCompany(selectedCompany ? selectedCompany.value : "");
    };

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/Companyno`)
            .then((data) => data.json())
            .then((val) => setcompanynodrop(val));
    }, []);

    const handleChangeFinancialYear = (selectedFinancialYearId) => {
        setSelectedFinancialYearId(selectedFinancialYearId);
        setFinancialYearId(selectedFinancialYearId ? selectedFinancialYearId.value : "");
        setHasValueChanged(true);
    };

    const filteredOptionFinancialYear = Array.isArray(financialYearIdDrop)
        ? financialYearIdDrop.map((option) => ({
            value: option.Keyfield,
            label: `${option.Keyfield} - ${option.Financial_Year_Code}`
        }))
        : [];

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

    const handleChangeCurrency = (selectedOption) => {
        setSelectedCurrency(selectedOption);
        setCurrency(selectedOption ? selectedOption.value : "");
        setHasValueChanged(true);
    };

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

    const handleChangeScreens = (selected) => {
        setSelectedscreens(selected);
        setScreens(selected?.value || "");
    };

    const filteredOptionScreens = (Array.isArray(screensDrop) ? screensDrop : []).map((option) => ({
        value: option.descriptions,
        label: option.descriptions,
    }));

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getEvent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode"),
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setScreensDrop(data);
            })
            .catch((error) => console.error("Error fetching purchase types:", error));
    }, []);

    const filteredOptionVoucherType = voucherTypeDrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const handleChangeVoucherType = (selected) => {
        setSelectedVoucherType(selected);
        setVoucherType(selected ? selected.value : '');
    };

    useEffect(() => {
        const companyCode = sessionStorage.getItem('selectedCompanyCode');
        fetch(`${config.apiBaseUrl}/getVoucherType`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                company_code: companyCode,
            }),
        })
            .then((response) => response.json())
            .then((data) => setVoucherTypeDrop(data))
            .catch((error) => console.error("Error fetching Voucher types:", error));
    }, []);

    const handleVendorKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchVendor(vendorCode);
        }
    };

    const handleSearchVendor = async (code) => {
        if (!code) return;
        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/getAllVendorCode`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    company_code: sessionStorage.getItem('selectedCompanyCode'),
                    vendor_code: code
                })
            });
            if (response.ok) {
                const searchData = await response.json();
                if (searchData.length > 0) {
                    const [{ vendor_code, vendor_name }] = searchData;
                    setVendorCode(vendor_code);
                    setVendorName(vendor_name);
                }
            } else if (response.status === 404) {
                toast.warning('Vendor not found');
                setVendorCode('');
                setVendorName('');
            } else {
                toast.warning('There was an error with your request.');
                setVendorCode('');
                setVendorName('');
            }
        } catch (error) {
            console.error("Error fetching vendor data:", error);
            toast.error('Error fetching vendor: ' + error.message);
            setVendorCode('');
            setVendorName('');
        } finally {
            setLoading(false);
        }
    };

    const handleVendorSelect = (data) => {
        if (data && data.length > 0) {
            const [{ VendorCode, VendorName }] = data;
            setVendorCode(VendorCode);
            setVendorName(VendorName);
        }
        setOpenVendorModal(false);
    };

    const [rowData, setRowData] = useState([]);

    const buildGridRowsWithTotal = (dataList) => {
        const totalDebit = dataList.reduce((sum, r) => sum + (Number(r.debit) || 0), 0);
        const totalCredit = dataList.reduce((sum, r) => sum + (Number(r.credit) || 0), 0);
        const lastRow = dataList[dataList.length - 1];

        const totalRow = {
            s_no: null,
            date: "",
            voucher_no: "",
            type: "",
            reference_no: "",
            description: "Total",
            debit: totalDebit,
            credit: totalCredit,
            balance: lastRow ? lastRow.balance : "0.00",
            isTotalRow: true,
        };
        return [...dataList, totalRow];
    };

    useEffect(() => {
        // setRowData([]);
        setRowData(buildGridRowsWithTotal(DEMO_TRANSACTIONS));
    }, []);

    const handleVoucherClick = (voucherNo, type) => {
        console.log("Navigating for voucher:", voucherNo, type);
        if (type?.toLowerCase().includes("invoice")) {
            navigate("/PurchaseInvoice", {
                state: { transactionNo: voucherNo, invoiceType: type }
            });
        }
    };

    const columnDefs = useMemo(() => [
        {
            headerName: "S.No",
            field: "s_no",
            width: 80,
            cellRenderer: (params) => (params.data?.isTotalRow ? "" : params.value)
        },
        {
            headerName: "Date",
            field: "date",
            width: 120,
        },
        {
            headerName: "Voucher No.",
            field: "voucher_no",
            width: 140,
            cellRenderer: (params) => {
                if (!params.value || params.data?.isTotalRow) return "";
                return (
                    <span
                        style={{
                            color: "#1890ff",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontWeight: "500"
                        }}
                        onClick={() => handleVoucherClick(params.value, params.data?.type)}
                    >
                        {params.value}
                    </span>
                );
            }
        },
        {
            headerName: "Type",
            field: "type",
            width: 140,
        },
        {
            headerName: "Reference No.",
            field: "reference_no",
            width: 140,
        },
        {
            headerName: "Description",
            field: "description",
            minWidth: 220,
            flex: 1,
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold' } : null
        },
        {
            headerName: "Debit (₹)",
            field: "debit",
            width: 130,
            type: "rightAligned",
            valueFormatter: (params) => {
                if (params.value === null || params.value === undefined || params.value === "") return "";
                return Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            },
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold' } : null
        },
        {
            headerName: "Credit (₹)",
            field: "credit",
            width: 130,
            type: "rightAligned",
            valueFormatter: (params) => {
                if (params.value === null || params.value === undefined || params.value === "") return "";
                return Number(params.value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            },
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold' } : null
        },
        {
            headerName: "Balance (₹)",
            field: "balance",
            width: 150,
            type: "rightAligned",
            cellStyle: (params) => params.data?.isTotalRow ? { fontWeight: 'bold' } : null
        },
        {
            headerName: "Action",
            field: "action",
            width: 80,
            cellRenderer: (params) => {
                if (params.data?.isTotalRow) return null;
                return (
                    <span
                        style={{ cursor: "pointer", color: "#1890ff" }}
                        title="View Details"
                        onClick={() => handleVoucherClick(params.data?.voucher_no, params.data?.type)}
                    >
                        <i className="fa-regular fa-eye"></i>
                    </span>
                );
            }
        }
    ], []);

    const fetchLedgerData = async () => {
        setLoading(true);
        try {
            const payload = {
                company_code: sessionStorage.getItem('selectedCompanyCode'),
                location_code: sessionStorage.getItem('selectedLocationCode'),
                Fin_year: financialYearId || selectedFY?.value,
                Tran_type: selectedVoucherType?.value === "All" ? "" : selectedVoucherType?.value,
                vendor_code: vendorCode,
                from_date: fromDate,
                to_date: toDate,
                currency_code: currency || selectedCurrency?.value || "",
                branch: selectedBranch?.value === "All Branches" ? "" : selectedBranch?.value,
                status: Screens || selectedscreens?.value || "",
            };

            const response = await fetch(`${config.apiBaseUrl}/getVendorLedgerReport`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();

                if (Array.isArray(result) && result.length > 0) {
                    let runningBalance = 0;

                    const formatted = result.map((item, idx) => {
                        const debitAmt = Number(item.debit) || 0;
                        const creditAmt = Number(item.credit) || 0;

                        runningBalance += (debitAmt - creditAmt);

                        const balanceFormatted = runningBalance >= 0
                            ? `${runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Dr`
                            : `${Math.abs(runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;

                        return {
                            s_no: idx + 1,
                            date: item.Transaction_date ? formatDate(item.Transaction_date) : "-",
                            voucher_no: item.Tran_no || "-",
                            type: item.Tran_type || "-",
                            reference_no: item.account_no || "-",
                            description: item.remarks || "-",
                            debit: debitAmt,
                            credit: creditAmt,
                            balance: balanceFormatted,
                        };
                    });

                    const finalRows = buildGridRowsWithTotal(formatted);
                    const finalMetrics = {
                        openingBalance: "0.00",
                        totalInvoiced: "0.00",
                        totalReceipts: "0.00",
                        debitNotes: "0.00",
                        creditNotes: "0.00",
                        closingBalance: runningBalance >= 0 ? `${runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Dr` : `${Math.abs(runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`
                    };

                    setRowData(finalRows);
                    return { rows: finalRows, metrics: finalMetrics };
                } else {
                    toast.warning("No records found for the selected criteria.");
                    setRowData([]);
                    return null;
                }
            } else if (response.status === 404) {
                toast.warning("Data not found");
                setRowData([]);
                return null;
            } else {
                toast.error("Failed to fetch vendor ledger data.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching ledger data:", error);
            toast.error("An error occurred while loading data.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedVendor(null);
        setVendorName("");
        setGstin("");
        setReferenceNo("");
        setSelectedVoucherType({ value: "All", label: "All Types" });
        setSelectedStatus({ value: "Posted", label: "Posted" });
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    const handlePrint = async () => {
        if (!vendorCode) {
            toast.warning("Please select a Vendor Code before printing.");
            return;
        }
        if (!selectedFinancialYearId || !selectedFinancialYearId.value) {
            toast.warning("Please select a Financial Year before printing.");
            return;
        }
        if (!fromDate) {
            toast.warning("Please select a From Date before printing.");
            return;
        }
        if (!toDate) {
            toast.warning("Please select a To Date before printing.");
            return;
        }
        if (new Date(fromDate) > new Date(toDate)) {
            toast.warning("From Date cannot be greater than To Date.");
            return;
        }

        // const data = await fetchLedgerData();

        // if (!data || data.rows.length === 0) {
        //     return;
        // }

        // 2. Temporarily use the rowData state (which holds your demo transactions)
        const data = { 
            rows: rowData, 
            metrics: { 
                openingBalance: "0.00", 
                closingBalance: "45,000.00 Cr" 
            } 
        };

        const filtersPayload = {
            companyName: companyName,
            vendorCode: vendorCode,
            vendorName: vendorName,
            financialYear: selectedFinancialYearId?.label || selectedFY?.label || "2026 - 2027",
            currency: selectedCurrency?.value || "INR",
            fromDate: fromDate,
            toDate: toDate,
            branch: selectedBranch?.label || "All Branches",
            voucherType: selectedVoucherType?.label || "All Types",
            status: selectedscreens?.label || "Posted",
        };

        localStorage.setItem("VendorLedgerFilters", LZString.compressToUTF16(JSON.stringify(filtersPayload)));
        localStorage.setItem("VendorLedgerRows", LZString.compressToUTF16(JSON.stringify(data.rows)));
        localStorage.setItem("VendorLedgerMetrics", LZString.compressToUTF16(JSON.stringify(data.metrics)));

        window.open("/VenLedPrint", "_blank");
    };

    const handleExportToExcel = () => {

        if (!vendorCode) {
            toast.warning("Please select a Vendor Code before printing.");
            return;
        }
        if (!selectedFinancialYearId || !selectedFinancialYearId.value) {
            toast.warning("Please select a Financial Year before printing.");
            return;
        }
        if (!fromDate) {
            toast.warning("Please select a From Date before printing.");
            return;
        }
        if (!toDate) {
            toast.warning("Please select a To Date before printing.");
            return;
        }
        if (new Date(fromDate) > new Date(toDate)) {
            toast.warning("From Date cannot be greater than To Date.");
            return;
        }
        if (rowData.length === 0) {
            toast.warning('There is no data to export.');
            return;
        }

        const headerData = [
            ['Vendor Ledger Report'],
            [`Company Name: ${selectedCompany?.label || companyName}`],
            [`Vendor: ${selectedVendor?.label || ''}`],
            [`Date Range: ${formatDate(fromDate)} to ${formatDate(toDate)}`],
            []
        ];

        const exportRows = rowData.map((row) => ({
            "S.No": row.s_no || "",
            "Date": row.date,
            "Voucher No": row.voucher_no,
            "Type": row.type,
            "Reference No": row.reference_no,
            "Description": row.description,
            "Debit (₹)": row.debit,
            "Credit (₹)": row.credit,
            "Balance (₹)": row.balance,
        }));

        const worksheet = XLSX.utils.aoa_to_sheet(headerData);
        XLSX.utils.sheet_add_json(worksheet, exportRows, { origin: 'A6' });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor_Ledger');
        XLSX.writeFile(workbook, `Vendor_Ledger_${selectedVendor?.value || 'Report'}.xlsx`);
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />

            <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="purbut mt-3">
                            Vendor Ledger
                        </h1>
                    </div>
                    <div className="mobileview">
                        <div className="d-flex justify-content-between">
                            <div className="d-flex justify-content-start">
                                <h1 className="h1">Vendor Ledger</h1>
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

            <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2 mt-2">
                <div className="row ms-2 me-2 mb-3">
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
                        <label className="form-label">Vendor Code <span className="text-danger">*</span></label>
                        <div className="exp-form-floating">
                            <div className="d-flex justify-content-end position-relative">
                                <input
                                    className="exp-input-field form-control justify-content-start"
                                    id="vendorcode"
                                    required
                                    value={vendorCode}
                                    maxLength={18}
                                    placeholder="Enter Vendor Code"
                                    onChange={(e) => setVendorCode(e.target.value)}
                                    onKeyPress={handleVendorKeyPress}
                                    autoComplete="off"
                                />
                                <div className="position-absolute mt-1 me-2" style={{ right: "5px", top: "50%", transform: "translateY(-50%)" }}>
                                    <span
                                        className="icon searchIcon"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setOpenVendorModal(true)}
                                    >
                                        <i className="fa fa-search"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-2 form-group text-start">
                        <div className="exp-form-floating">
                            <label className="form-label">Vendor Name</label>
                            <input
                                className="exp-input-field form-control"
                                id="vendorname"
                                required
                                value={vendorName}
                                placeholder="Vendor Name"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="col-md-2 form-group text-start">
                        <label className="form-label">Currency</label>
                        <Select
                            id="currency"
                            className="border-secondary"
                            classNamePrefix="react-select"
                            placeholder="Select Currency"
                            value={selectedCurrency}
                            onChange={handleChangeCurrency}
                            options={filteredOptionCurrency}
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div>
                    <div className="col-12 col-md-2">
                        <label className="form-label">Voucher Type</label>
                        <Select
                            options={filteredOptionVoucherType}
                            value={selectedVoucherType}
                            onChange={handleChangeVoucherType}
                            className="border-secondary"
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div>
                    <div className="col-12 col-md-2">
                        <label className="form-label">Status</label>
                        <Select
                            options={filteredOptionScreens}
                            value={selectedscreens}
                            onChange={handleChangeScreens}
                            className="border-secondary"
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div>
                    <div className="col-12 col-md-2 mt-3">
                        <label className="form-label">From Date <span className="text-danger">*</span></label>
                        <input
                            type="date"
                            className="exp-input-field form-control"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="col-12 col-md-2 mt-3">
                        <label className="form-label">To Date <span className="text-danger">*</span></label>
                        <input
                            type="date"
                            className="exp-input-field form-control"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Optional: Add AG Grid Component Rendering Here */}

                {/* AG Grid Container */}
                {/* <div className="ag-theme-alpine mb-4 ms-2 me-2 mt-4" style={{ height: 460, width: '100%' }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        pagination={true}
                        paginationPageSize={10}
                        onGridReady={onGridReady}
                        getRowStyle={(params) => {
                            if (params.data?.isTotalRow) {
                                return { backgroundColor: '#f8f9fa', fontWeight: 'bold' };
                            }
                            return null;
                        }}
                    />
                </div> */}

                <PurchaseVendorPopup
                    open={openVendorModal}
                    handleClose={() => setOpenVendorModal(false)}
                    handleVendor={handleVendorSelect}
                />
            </div>
        </div>
    );
};

export default VendorLedger;