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
import SalesVendorPopup from './SalesVendorPopup';

// ==========================================
// DEMO DATA (FOR PREVIEW / INITIAL LOOKUP)
// 👉 Note: To remove demo data later, follow the instructions at the bottom of this file.
// ==========================================
const DEMO_TRANSACTIONS = [
    { s_no: 1, date: "01-04-2026", voucher_no: "OPEN-001", type: "Opening", reference_no: "B/F", description: "Opening Balance", debit: 50000.00, credit: 0.00, balance: "50,000.00 Dr" },
    { s_no: 2, date: "05-04-2026", voucher_no: "SI-001", type: "Sales Invoice", reference_no: "INV-001", description: "Sales Invoice - INV-001", debit: 100000.00, credit: 0.00, balance: "1,50,000.00 Dr" },
    { s_no: 3, date: "10-04-2026", voucher_no: "RC-001", type: "Receipt", reference_no: "BANK-001", description: "Receipt via Bank", debit: 0.00, credit: 60000.00, balance: "90,000.00 Dr" },
    { s_no: 4, date: "15-04-2026", voucher_no: "SI-002", type: "Sales Invoice", reference_no: "INV-002", description: "Sales Invoice - INV-002", debit: 100000.00, credit: 0.00, balance: "1,90,000.00 Dr" },
    { s_no: 5, date: "20-04-2026", voucher_no: "CN-001", type: "Credit Note", reference_no: "CN-001", description: "Sales Credit Note", debit: 0.00, credit: 5000.00, balance: "1,85,000.00 Dr" },
    { s_no: 6, date: "25-04-2026", voucher_no: "DN-001", type: "Debit Note", reference_no: "DN-001", description: "Debit Note for Additional Charges", debit: 10000.00, credit: 0.00, balance: "1,95,000.00 Dr" },
    { s_no: 7, date: "30-04-2026", voucher_no: "RC-002", type: "Receipt", reference_no: "BANK-002", description: "Receipt via Bank", debit: 0.00, credit: 60000.00, balance: "1,35,000.00 Dr" }
];

const DEMO_METRICS = {
    openingBalance: "50,000.00 Dr",
    totalInvoiced: "2,00,000.00",
    totalReceipts: "1,20,000.00",
    debitNotes: "10,000.00",
    creditNotes: "5,000.00",
    closingBalance: "1,35,000.00 Dr",
};

const CustomerLedger = () => {
    const navigate = useNavigate();

    // Helper date formatter
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
    const companyName = sessionStorage.getItem('selectedCompanyName') || "YJK Technologies";

    // Tab State
    const [activeTab, setActiveTab] = useState("ledger"); // 'ledger' | 'outstanding' | 'ageing'

    // Summary Metrics State (Populated with Demo Data by default)
    const [summaryCards, setSummaryCards] = useState(DEMO_METRICS);

    // Filter Form State
    const [selectedCompany, setSelectedCompany] = useState("");
    const [selectedFY, setSelectedFY] = useState({ value: "2026-2027", label: "2026 - 2027" });
    const [selectedCustomer, setSelectedCustomer] = useState({ value: "CUST-0001", label: "CUST-0001 - ABC Industries" });
    //   const [customerName, setCustomerName] = useState("ABC Industries");
    const [gstin, setGstin] = useState("");
    //   const [selectedCurrency, setSelectedCurrency] = useState({ value: "INR", label: "INR - Indian Rupee" });
    const [fromDate, setFromDate] = useState("2026-04-01");
    const [toDate, setToDate] = useState("2027-03-31");
    const [selectedBranch, setSelectedBranch] = useState({ value: "All Branches", label: "All Branches" });
    const [selectedVoucherType, setSelectedVoucherType] = useState({ value: "All", label: "All Types" });
    const [selectedStatus, setSelectedStatus] = useState({ value: "Posted", label: "Posted" });
    const [referenceNo, setReferenceNo] = useState("");

    const [customerCode, setCustomerCode] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [openCustomerModal, setOpenCustomerModal] = useState(false);

    // For Dropdown
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

    const handleChangeCompany = (selectedCompany) => {
        setSelectedCompany(selectedCompany);
        setCompany(selectedCompany ? selectedCompany.value : "");
    };

    const filteredOptionCompany = Array.isArray(companynodrop)
        ? companynodrop.map((option) => ({
            value: option.company_no,
            label: `${option.company_no} - ${option.company_name}`,
        }))
        : [];

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
    setScreens(selected?.value || "");
  };

    const filteredOptionScreens = (Array.isArray(screensDrop) ? screensDrop : []).map((option) => ({
    value: option.descriptions,
    label: option.attributedetails_name,
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
  
          // Automatically set a default option (e.g., "Draft" or the first record)
          const defaultScreen =
            data.find((item) => item.descriptions === "Draft") || data[0];
  
          if (defaultScreen && !selectedscreens) {
            setSelectedscreens({
              value: defaultScreen.descriptions,
              label: defaultScreen.attributedetails_name,
            });
            setScreens(defaultScreen.descriptions);
          }
        })
        .catch((error) => console.error("Error fetching purchase types:", error));
    }, []);


    // Triggered on Enter key press in the Customer Code input
    const handleCustomerKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchCustomer(customerCode);
        }
    };

    // API Call to fetch Customer Name based on Customer Code
    const handleSearchCustomer = async (code) => {
        if (!code) return;
        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/getCustomerCode`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    company_code: sessionStorage.getItem('selectedCompanyCode'),
                    customer_code: code
                })
            });
            if (response.ok) {
                const searchData = await response.json();
                if (searchData.length > 0) {
                    const [{ customer_code, customer_name }] = searchData;
                    setCustomerCode(customer_code);
                    setCustomerName(customer_name);
                }
            } else if (response.status === 404) {
                toast.warning('Customer not found');
                setCustomerCode('');
                setCustomerName('');
            } else {
                toast.warning('There was an error with your request.');
                setCustomerCode('');
                setCustomerName('');
            }
        } catch (error) {
            console.error("Error fetching customer data:", error);
            toast.error('Error fetching customer: ' + error.message);
            setCustomerCode('');
            setCustomerName('');
        } finally {
            setLoading(false);
        }
    };

    // Triggered when selecting a customer from SalesVendorPopup
    const handleVendorSelect = (data) => {
        if (data && data.length > 0) {
            const [{ CustomerCode, CustomerName }] = data;
            setCustomerCode(CustomerCode);
            setCustomerName(CustomerName);
        }
        setOpenCustomerModal(false);
    };

    // Dropdown list options
    const [companyOptions, setCompanyOptions] = useState([
        { value: "YJK Technologies", label: "YJK Technologies" }
    ]);
    const [fyOptions, setFyOptions] = useState([
        { value: "2026-2027", label: "2026 - 2027" },
        { value: "2025-2026", label: "2025 - 2026" }
    ]);
    const [customerOptions, setCustomerOptions] = useState([
        { value: "CUST-0001", label: "CUST-0001 - ABC Industries", name: "ABC Industries", gstin: "33ABCDE1234F1Z5" }
    ]);
    const [currencyOptions, setCurrencyOptions] = useState([
        { value: "INR", label: "INR - Indian Rupee" },
        { value: "USD", label: "USD - US Dollar" }
    ]);
    const [branchOptions, setBranchOptions] = useState([
        { value: "All Branches", label: "All Branches" },
        { value: "Head Office", label: "Head Office" }
    ]);
    const [voucherTypeOptions, setVoucherTypeOptions] = useState([
        { value: "All", label: "All Types" },
        { value: "Opening", label: "Opening" },
        { value: "Sales Invoice", label: "Sales Invoice" },
        { value: "Receipt", label: "Receipt" },
        { value: "Credit Note", label: "Credit Note" },
        { value: "Debit Note", label: "Debit Note" }
    ]);
    const [statusOptions, setStatusOptions] = useState([
        { value: "Posted", label: "Posted" },
        { value: "Draft", label: "Draft" },
        { value: "All", label: "All" }
    ]);

    // Row Data State with Demo Data + Computed Total Row
    const [rowData, setRowData] = useState([]);

    // Calculate and attach Total row
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

    // Initial load with DEMO DATA
    useEffect(() => {
        setRowData(buildGridRowsWithTotal(DEMO_TRANSACTIONS));
        // When ready to fetch master dropdowns from backend, trigger API calls here.
    }, []);

    const handleCustomerChange = (selected) => {
        setSelectedCustomer(selected);
        if (selected) {
            setCustomerName(selected.name || selected.label.split(" - ")[1] || "");
            setGstin(selected.gstin || "");
        } else {
            setCustomerName("");
            setGstin("");
        }
    };

    const handleVoucherClick = (voucherNo, type) => {
        console.log("Navigating for voucher:", voucherNo, type);
        if (type?.toLowerCase().includes("invoice")) {
            navigate("/TaxInvoice", {
                state: { transactionNo: voucherNo, invoiceType: type }
            });
        }
    };

    // AG Grid Column Definitions
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

    // Fetch Ledger Data from backend API
    const fetchLedgerData = async () => {
        setLoading(true);
        try {
            const payload = {
                company_code: sessionStorage.getItem('selectedCompanyCode'),
                financial_year: selectedFY?.value,
                customer_code: selectedCustomer?.value,
                currency: selectedCurrency?.value,
                from_date: fromDate,
                to_date: toDate,
                branch: selectedBranch?.value,
                voucher_type: selectedVoucherType?.value,
                status: selectedStatus?.value,
                reference_no: referenceNo,
            };

            const response = await fetch(`${config.apiBaseUrl}/getCustomerLedger`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                // Assuming result contains { transactions: [...], metrics: { ... } }
                if (result.transactions && result.transactions.length > 0) {
                    const formatted = result.transactions.map((item, idx) => ({
                        s_no: idx + 1,
                        date: formatDate(item.date),
                        voucher_no: item.voucher_no,
                        type: item.voucher_type,
                        reference_no: item.reference_no,
                        description: item.description,
                        debit: Number(item.debit) || 0,
                        credit: Number(item.credit) || 0,
                        balance: item.balance_formatted || item.balance,
                    }));
                    setRowData(buildGridRowsWithTotal(formatted));
                    if (result.metrics) {
                        setSummaryCards(result.metrics);
                    }
                } else {
                    toast.warning("No records found for the selected criteria.");
                    setRowData([]);
                }
            } else if (response.status === 404) {
                toast.warning("Data not found");
                setRowData([]);
            } else {
                toast.error("Failed to fetch customer ledger data.");
            }
        } catch (error) {
            console.error("Error fetching ledger data:", error);
            toast.error("An error occurred while loading data.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedCustomer(null);
        setCustomerName("");
        setGstin("");
        setReferenceNo("");
        setSelectedVoucherType({ value: "All", label: "All Types" });
        setSelectedStatus({ value: "Posted", label: "Posted" });
        // Reset back to demo dataset (or setRowData([]) once demo data is discarded)
        setRowData(buildGridRowsWithTotal(DEMO_TRANSACTIONS));
        setSummaryCards(DEMO_METRICS);
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    // Print Logic matching TaxInvoiceanalysis.js
    const handlePrint = () => {
        if (rowData.length === 0) {
            toast.warning("No data available to print.");
            return;
        }
        window.print();
    };

    // Export to Excel
    const handleExportToExcel = () => {
        if (rowData.length === 0) {
            toast.warning('There is no data to export.');
            return;
        }

        const headerData = [
            ['Customer Ledger Report'],
            [`Company Name: ${selectedCompany?.label || companyName}`],
            [`Customer: ${selectedCustomer?.label || ''}`],
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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer_Ledger');
        XLSX.writeFile(workbook, `Customer_Ledger_${selectedCustomer?.value || 'Report'}.xlsx`);
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />

            {/* Top Header Card */}
            <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="purbut mt-3">
                            <i className="fa-solid fa-book-open me-2 text-primary"></i> Customer Ledger Analysis
                        </h1>
                    </div>
                    <div className="mobileview">
                        <div className="d-flex justify-content-between">
                            <div className="d-flex justify-content-start">
                                <h1 className="h1">Customer Ledger Analysis</h1>
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

            {/* Filter and Content Card */}
            <div className="shadow-lg p-3 bg-body-tertiary rounded mb-2 mt-2">
                {/* ROW 1: Company, Financial Year, Customer */}
                <div className="row ms-2 me-2 mb-3">
                    <div className="col-md-2 form-group text-start">
                        <label className="form-label">Company <span className="text-danger">*</span></label>
                        <Select
                            options={filteredOptionCompany}
                            value={selectedCompany}
                            onChange={handleChangeCompany}
                            className="border-secondary"
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div>
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
                    {/* Customer Code with Search Icon and Enter Key Trigger */}
                    <div className="col-md-2 form-group text-start">
                        <label className="form-label">Customer Code <span className="text-danger">*</span></label>
                        <div className="exp-form-floating">
                            <div className="d-flex justify-content-end position-relative">
                                <input
                                    className="exp-input-field form-control justify-content-start"
                                    id="customercode"
                                    required
                                    value={customerCode}
                                    maxLength={18}
                                    placeholder="Enter Customer Code"
                                    onChange={(e) => setCustomerCode(e.target.value)}
                                    onKeyPress={handleCustomerKeyPress}
                                    autoComplete="off"
                                />
                                <div className="position-absolute mt-1 me-2" style={{ right: "5px", top: "50%", transform: "translateY(-50%)" }}>
                                    <span
                                        className="icon searchIcon"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setOpenCustomerModal(true)}
                                    >
                                        <i className="fa fa-search"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Non-editable Customer Name */}
                    <div className="col-md-2 form-group text-start">
                        <div className="exp-form-floating">
                            <label className="form-label">Customer Name</label>
                            <input
                                className="exp-input-field form-control"
                                id="customername"
                                required
                                value={customerName}
                                placeholder="Customer Name"
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="col-md-2 form-group text-start">
                        <label className="form-label">GSTIN</label>
                        <input
                            className="form-control exp-input-field"
                            value={gstin}
                            placeholder="GSTIN"
                            readOnly
                        />
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
                </div>

                {/* ROW 3: From Date, To Date, Branch, Voucher Type, Status, Reference No */}
                <div className="row ms-2 me-2 mb-3">
                    <div className="col-12 col-md-2">
                        <label className="form-label">From Date <span className="text-danger">*</span></label>
                        <input
                            type="date"
                            className="exp-input-field form-control"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="col-12 col-md-2">
                        <label className="form-label">To Date <span className="text-danger">*</span></label>
                        <input
                            type="date"
                            className="exp-input-field form-control"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="col-12 col-md-2">
                        <label className="form-label">Branch</label>
                        <Select
                            options={branchOptions}
                            value={selectedBranch}
                            onChange={setSelectedBranch}
                            className="border-secondary"
                            classNamePrefix="react-select"
                            styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div>
                    <div className="col-12 col-md-2">
                        <label className="form-label">Voucher Type</label>
                        <Select
                            options={voucherTypeOptions}
                            value={selectedVoucherType}
                            onChange={setSelectedVoucherType}
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
                    <div className="col-12 col-md-2">
                        <label className="form-label">Reference No.</label>
                        <input
                            className="form-control exp-input-field"
                            placeholder="Enter Reference No."
                            value={referenceNo}
                            onKeyDown={(e) => e.key === "Enter" && fetchLedgerData()}
                            onChange={(e) => setReferenceNo(e.target.value)}
                        />
                    </div>
                </div>

                {/* ROW 4: Action Buttons Bar */}
                {/* <div className="d-flex flex-wrap gap-2 ms-3 me-3 mb-4">
                    <button className="btn btn-primary px-3" onClick={fetchLedgerData}>
                        <i className="fa-solid fa-magnifying-glass me-1"></i> Search
                    </button>
                    <button className="btn btn-secondary px-3" onClick={handleReset}>
                        <i className="fa-solid fa-rotate-left me-1"></i> Reset
                    </button>
                    <button className="btn btn-success px-3" onClick={handleExportToExcel}>
                        <i className="fa-solid fa-file-excel me-1"></i> Export Excel
                    </button>
                    <button className="btn btn-danger px-3" onClick={handlePrint}>
                        <i className="fa-solid fa-file-pdf me-1"></i> Export PDF
                    </button>
                    <button className="btn btn-dark px-3" onClick={handlePrint}>
                        <i className="fa-solid fa-print me-1"></i> Print
                    </button>
                    <button className="btn btn-info text-white px-3" onClick={() => navigate("/CustomerStatement")}>
                        <i className="fa-solid fa-file-lines me-1"></i> Customer Statement
                    </button>
                </div> */}

                {/* ROW 5: 6 KPI / Summary Metric Cards */}
                <div className="row g-3 ms-2 me-2 mb-4">
                    {/* Opening Balance */}
                    <div className="col-12 col-sm-6 col-lg-2">
                        <div className="p-3 bg-light border rounded d-flex align-items-center">
                            <div className="p-2 bg-primary bg-opacity-10 text-primary rounded me-3 fs-3">
                                <i className="fa-solid fa-wallet"></i>
                            </div>
                            <div>
                                <small className="text-muted d-block text-truncate">Opening Balance</small>
                                <h6 className="fw-bold mb-0 text-truncate">₹ {summaryCards.openingBalance}</h6>
                            </div>
                        </div>
                    </div>
                    {/* Total Invoiced */}
                    <div className="col-12 col-sm-6 col-lg-2">
                        <div className="p-3 bg-light border rounded d-flex align-items-center">
                            <div className="p-2 bg-success bg-opacity-10 text-success rounded me-3 fs-3">
                                <i className="fa-solid fa-file-invoice-dollar"></i>
                            </div>
                            <div>
                                <small className="text-muted d-block text-truncate">Total Invoiced</small>
                                <h6 className="fw-bold mb-0 text-truncate">₹ {summaryCards.totalInvoiced}</h6>
                            </div>
                        </div>
                    </div>
                    {/* Total Receipts */}
                    <div className="col-12 col-sm-6 col-lg-2">
                        <div className="p-3 bg-light border rounded d-flex align-items-center">
                            <div className="p-2 bg-info bg-opacity-10 text-info rounded me-3 fs-3">
                                <i className="fa-solid fa-hand-holding-dollar"></i>
                            </div>
                            <div>
                                <small className="text-muted d-block text-truncate">Total Receipts</small>
                                <h6 className="fw-bold mb-0 text-truncate">₹ {summaryCards.totalReceipts}</h6>
                            </div>
                        </div>
                    </div>
                    {/* Debit Notes */}
                    <div className="col-12 col-sm-6 col-lg-2">
                        <div className="p-3 bg-light border rounded d-flex align-items-center">
                            <div className="p-2 bg-danger bg-opacity-10 text-danger rounded me-3 fs-3">
                                <i className="fa-solid fa-circle-arrow-up"></i>
                            </div>
                            <div>
                                <small className="text-muted d-block text-truncate">Debit Notes</small>
                                <h6 className="fw-bold mb-0 text-truncate">₹ {summaryCards.debitNotes}</h6>
                            </div>
                        </div>
                    </div>
                    {/* Credit Notes */}
                    <div className="col-12 col-sm-6 col-lg-2">
                        <div className="p-3 bg-light border rounded d-flex align-items-center">
                            <div className="p-2 bg-warning bg-opacity-10 text-warning rounded me-3 fs-3">
                                <i className="fa-solid fa-circle-arrow-down"></i>
                            </div>
                            <div>
                                <small className="text-muted d-block text-truncate">Credit Notes</small>
                                <h6 className="fw-bold mb-0 text-truncate">₹ {summaryCards.creditNotes}</h6>
                            </div>
                        </div>
                    </div>
                    {/* Closing Balance */}
                    <div className="col-12 col-sm-6 col-lg-2">
                        <div className="p-3 bg-light border rounded d-flex align-items-center">
                            <div className="p-2 bg-purple bg-opacity-10 text-dark rounded me-3 fs-3" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                                <i className="fa-solid fa-scale-balanced"></i>
                            </div>
                            <div>
                                <small className="text-muted d-block text-truncate">Closing Balance</small>
                                <h6 className="fw-bold mb-0 text-truncate">₹ {summaryCards.closingBalance}</h6>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 6: Navigation Tabs */}
                <div className="ms-2 me-2 mb-3">
                    <ul className="nav nav-tabs border-bottom">
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold ${activeTab === 'ledger' ? 'active text-primary border-primary border-bottom-0' : 'text-secondary'}`}
                                onClick={() => setActiveTab('ledger')}
                            >
                                Ledger Transactions
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold ${activeTab === 'outstanding' ? 'active text-primary border-primary border-bottom-0' : 'text-secondary'}`}
                                onClick={() => setActiveTab('outstanding')}
                            >
                                Invoice Wise Outstanding
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold ${activeTab === 'ageing' ? 'active text-primary border-primary border-bottom-0' : 'text-secondary'}`}
                                onClick={() => setActiveTab('ageing')}
                            >
                                Ageing Analysis
                            </button>
                        </li>
                    </ul>
                </div>

                {/* ROW 7: AG Grid Container */}
                {activeTab === 'ledger' ? (
                    <div className="ag-theme-alpine mb-4 ms-2 me-2" style={{ height: 460, width: '100%' }}>
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
                    </div>
                ) : (
                    <div className="p-5 text-center text-muted">
                        <i className="fa-solid fa-folder-open fs-1 mb-3"></i>
                        <p>Content for {activeTab === 'outstanding' ? 'Invoice Wise Outstanding' : 'Ageing Analysis'} is under development.</p>
                    </div>
                )}

                {/* Customer Lookup Popup */}
                <SalesVendorPopup
                    open={openCustomerModal}
                    handleClose={() => setOpenCustomerModal(false)}
                    handleVendor={handleVendorSelect}
                />
            </div>
        </div>
    );
};

export default CustomerLedger;