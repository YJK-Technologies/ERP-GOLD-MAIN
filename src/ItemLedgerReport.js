import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Select from "react-select";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./apps.css";
import "./App.css";
import "./test.css";
import LoadingScreen from "./Loading";
import { useNavigate } from "react-router-dom";
import InventoryReturnItemPopup from './InvReturnItemPopup';

const config = require("./Apiconfig");

// =============================================================================
// DEMO / MOCK DATA (Remove or replace with API responses once backend is wired)
// =============================================================================
const DEMO_DROPDOWNS = {
    companies: [{ value: "ABC Pvt Ltd", label: "ABC Pvt Ltd" }],
    branches: [{ value: "All", label: "All" }],
    warehouses: [
        { value: "All", label: "All" },
        { value: "Main WH", label: "Main WH" },
        { value: "Secondary WH", label: "Secondary WH" },
    ],
    categories: [{ value: "All", label: "All" }],
    groups: [{ value: "All", label: "All" }],
    transactionTypes: [
        { value: "All", label: "All" },
        { value: "Opening Stock", label: "Opening Stock" },
        { value: "Purchase Receipt", label: "Purchase Receipt" },
        { value: "Sales Issue", label: "Sales Issue" },
        { value: "Purchase Return", label: "Purchase Return" },
        { value: "Sales Return", label: "Sales Return" },
        { value: "Stock Transfer", label: "Stock Transfer" },
        { value: "Stock Adjustment", label: "Stock Adjustment" },
    ],
    statuses: [
        { value: "Posted", label: "Posted" },
        { value: "Draft", label: "Draft" },
        { value: "Cancelled", label: "Cancelled" },
    ],
};

const INITIAL_SUMMARY_DATA = {
    openingQty: 100.0,
    totalInwardQty: 250.0,
    totalOutwardQty: 180.0,
    closingQty: 170.0,
    openingStockValue: 10000.0,
    totalInwardValue: 27500.0,
    totalOutwardValue: 18600.0,
    closingStockValue: 18900.0,
};

const DEMO_ROW_DATA = [
    {
        sno: 1,
        date: "01-10-2026",
        voucherNo: "OP-001",
        transactionType: "Opening Stock",
        reference: "-",
        warehouse: "Main WH",
        batchNo: "-",
        serialNo: "-",
        inQty: 100.0,
        outQty: 0.0,
        balanceQty: 100.0,
        unitCost: 100.0,
        inValue: 10000.0,
        outValue: 0.0,
        balanceValue: 10000.0,
        createdBy: "Admin",
    },
    {
        sno: 2,
        date: "03-10-2026",
        voucherNo: "PI-001",
        transactionType: "Purchase Receipt",
        reference: "PO-001",
        warehouse: "Main WH",
        batchNo: "B001",
        serialNo: "-",
        inQty: 50.0,
        outQty: 0.0,
        balanceQty: 150.0,
        unitCost: 110.0,
        inValue: 5500.0,
        outValue: 0.0,
        balanceValue: 15500.0,
        createdBy: "Admin",
    },
    {
        sno: 3,
        date: "05-10-2026",
        voucherNo: "SI-001",
        transactionType: "Sales Issue",
        reference: "SO-001",
        warehouse: "Main WH",
        batchNo: "B001",
        serialNo: "-",
        inQty: 0.0,
        outQty: 30.0,
        balanceQty: 120.0,
        unitCost: 103.33,
        inValue: 0.0,
        outValue: 3100.0,
        balanceValue: 12400.0,
        createdBy: "User1",
    },
    {
        sno: 4,
        date: "07-10-2026",
        voucherNo: "PR-001",
        transactionType: "Purchase Return",
        reference: "PI-001",
        warehouse: "Main WH",
        batchNo: "B001",
        serialNo: "-",
        inQty: 0.0,
        outQty: 10.0,
        balanceQty: 110.0,
        unitCost: 103.33,
        inValue: 0.0,
        outValue: 1033.33,
        balanceValue: 11366.67,
        createdBy: "User1",
    },
    {
        sno: 5,
        date: "10-10-2026",
        voucherNo: "SR-001",
        transactionType: "Sales Return",
        reference: "SI-001",
        warehouse: "Main WH",
        batchNo: "B001",
        serialNo: "-",
        inQty: 5.0,
        outQty: 0.0,
        balanceQty: 115.0,
        unitCost: 103.33,
        inValue: 516.67,
        outValue: 0.0,
        balanceValue: 11883.34,
        createdBy: "User2",
    },
    {
        sno: 6,
        date: "12-10-2026",
        voucherNo: "ST-001",
        transactionType: "Stock Transfer (Out)",
        reference: "ST-001",
        warehouse: "Main WH",
        batchNo: "-",
        serialNo: "-",
        inQty: 0.0,
        outQty: 20.0,
        balanceQty: 95.0,
        unitCost: 103.33,
        inValue: 0.0,
        outValue: 2066.6,
        balanceValue: 9816.74,
        createdBy: "Admin",
    },
    {
        sno: 7,
        date: "12-10-2026",
        voucherNo: "ST-001",
        transactionType: "Stock Transfer (In)",
        reference: "ST-001",
        warehouse: "Secondary WH",
        batchNo: "-",
        serialNo: "-",
        inQty: 20.0,
        outQty: 0.0,
        balanceQty: 20.0,
        unitCost: 103.33,
        inValue: 2066.6,
        outValue: 0.0,
        balanceValue: 2066.6,
        createdBy: "Admin",
    },
    {
        sno: 8,
        date: "15-10-2026",
        voucherNo: "ADJ-001",
        transactionType: "Stock Adjustment (+)",
        reference: "-",
        warehouse: "Main WH",
        batchNo: "-",
        serialNo: "-",
        inQty: 10.0,
        outQty: 0.0,
        balanceQty: 105.0,
        unitCost: 103.33,
        inValue: 1033.3,
        outValue: 0.0,
        balanceValue: 10850.04,
        createdBy: "User3",
    },
    {
        sno: 9,
        date: "18-10-2026",
        voucherNo: "ADJ-002",
        transactionType: "Stock Adjustment (-)",
        reference: "-",
        warehouse: "Main WH",
        batchNo: "-",
        serialNo: "-",
        inQty: 0.0,
        outQty: 5.0,
        balanceQty: 100.0,
        unitCost: 103.33,
        inValue: 0.0,
        outValue: 516.65,
        balanceValue: 10333.39,
        createdBy: "User3",
    },
];

const getFirstDayOfMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
};

const getLastDayOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const year = lastDay.getFullYear();
    const month = String(lastDay.getMonth() + 1).padStart(2, '0');
    const day = String(lastDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
// =============================================================================

function ItemLedgerReport() {
    const navigate = useNavigate();

    // Filter Form States
    const [company, setCompany] = useState(DEMO_DROPDOWNS.companies[0]);
    const [branch, setBranch] = useState(DEMO_DROPDOWNS.branches[0]);
    const [warehouse, setWarehouse] = useState(DEMO_DROPDOWNS.warehouses[0]);
    const [category, setCategory] = useState(DEMO_DROPDOWNS.categories[0]);
    const [group, setGroup] = useState(DEMO_DROPDOWNS.groups[0]);
    const [fromDate, setFromDate] = useState(getFirstDayOfMonth());
    const [toDate, setToDate] = useState(getLastDayOfMonth());
    const [transactionType, setTransactionType] = useState(DEMO_DROPDOWNS.transactionTypes[0]);
    const [status, setStatus] = useState(DEMO_DROPDOWNS.statuses[0]);
    const [itemCode, setItemCode] = useState("");
    const [itemName, setItemName] = useState("");
    const [batchNo, setBatchNo] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const [documentNo, setDocumentNo] = useState("");
    const [showZeroQty, setShowZeroQty] = useState(false);

    // Data & AG Grid States
    const [rowData, setRowData] = useState(DEMO_ROW_DATA);
    const [summaryData, setSummaryData] = useState(INITIAL_SUMMARY_DATA);
    const [gridApi, setGridApi] = useState(null);
    const [loading, setLoading] = useState(false);

    // Dropdown Const
    const [companynodrop, setcompanynodrop] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [warehousedrop, setWarehousedrop] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState("");
    const [Transactiondrop, setTransactiondrop] = useState([]);
    const [selectedTransaction, setselectedTransaction] = useState("");
    const [statusDrop, setStatusdrop] = useState([]);
    const [selectedStatus, setselectedStatus] = useState("");

    // Pop up
    const [open1, setOpen1] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);

    const handleItemCodePopUp = () => {
        console.log("Item Code Help clicked");
    setOpen1(true);
  };

    const handleClose = () => {
    setOpen1(false);
    setOpen2(false);
  };

    //   Dropdown
    const filteredOptionCompany = Array.isArray(companynodrop)
        ? companynodrop.map((option) => ({
            value: option.company_no,
            label: `${option.company_no} - ${option.company_name}`,
        }))
        : [];

    const handleChangeCompany = (selectedCompany) => {
        setSelectedCompany(selectedCompany);
        setCompany(selectedCompany ? selectedCompany.value : "");
    };

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/Companyno`)
            .then((data) => data.json())
            .then((val) => setcompanynodrop(val));
    }, []);

    const filteredOptionWarehouse = Array.isArray(warehousedrop)
        ? warehousedrop.map((option) => ({
            value: option.warehouse_code,
            label: `${option.warehouse_code} - ${option.warehouse_name}`,
        }))
        : [];

    const handleChangeWarehouse = (selectedWarehouse) => {
        setSelectedWarehouse(selectedWarehouse);
        setWarehouse(selectedWarehouse ? selectedWarehouse.value : "");
    };

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getWarehouseCodeDrop`)
            .then((data) => data.json())
            .then((val) => setWarehousedrop(val));
    }, []);
    const filteredOptionTransaction = Transactiondrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const handleChangetransaction = (selectedTransaction) => {
        setselectedTransaction(selectedTransaction);
        setTransactionType(selectedTransaction ? selectedTransaction.value : "");
    };

    useEffect(() => {
        const company_code = sessionStorage.getItem("selectedCompanyCode");

        fetch(`${config.apiBaseUrl}/Transaction`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ company_code }),
        })
            .then((data) => data.json())
            .then((val) => setTransactiondrop(val))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const filteredOptionStatus = statusDrop.map((opt) => ({
        value: opt.attributedetails_name,
        label: opt.attributedetails_name
    }));

    const handleChangeStatus = (selectedStatus) => {
        setselectedStatus(selectedStatus);
        setStatus(selectedStatus ? selectedStatus.value : "");
    };

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getEvent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode"),
            }),
        })
            .then((response) => response.json())
            .then((data) => setStatusdrop(data))
            .catch((error) =>
                console.error("Error fetching events:", error)
            );
    }, []);

const handleItemCode = (selectedData) => {
        // The popup passes an array of selected items to handleItem
        if (selectedData && selectedData.length > 0) {
            const selected = selectedData[0];
            setItemCode(selected.itemCode);
            setItemName(selected.itemName); // Optional, since you have the itemName state declared
        }
    };

    // Navigate to document view
    const handleVoucherClick = (voucherNo) => {
        navigate("/ItemLedgerDetail", { state: { voucherNo } });
    };

    const handleSearch = () => {
        setLoading(true);
        /* 
          // Replace with your API service:
          fetch(`${config.apiBaseUrl}/getItemLedgerReport`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company: company?.value,
              branch: branch?.value,
              warehouse: warehouse?.value,
              itemCode,
              itemName,
              category: category?.value,
              group: group?.value,
              fromDate,
              toDate,
              transactionType: transactionType?.value,
              batchNo,
              serialNo,
              documentNo,
              status: status?.value,
              showZeroQty,
            })
          })
          .then(res => res.json())
          .then(data => {
            setRowData(data.records);
            setSummaryData(data.summary);
          })
          .catch(err => toast.error("Failed to fetch report"))
          .finally(() => setLoading(false));
        */
        setTimeout(() => {
            setLoading(false);
            //   toast.success("Ledger updated!");
        }, 400);
    };

    const handleReset = () => {
        setCompany(DEMO_DROPDOWNS.companies[0]);
        setBranch(DEMO_DROPDOWNS.branches[0]);
        setWarehouse(DEMO_DROPDOWNS.warehouses[0]);
        setCategory(DEMO_DROPDOWNS.categories[0]);
        setGroup(DEMO_DROPDOWNS.groups[0]);
        setTransactionType(DEMO_DROPDOWNS.transactionTypes[0]);
        setStatus(DEMO_DROPDOWNS.statuses[0]);
        setItemCode("");
        setItemName("");
        setBatchNo("");
        setSerialNo("");
        setDocumentNo("");
        setShowZeroQty(false);
        setRowData(DEMO_ROW_DATA);
    };

    // AG Grid Column Definitions
    const columnDefs = useMemo(
        () => [
            {
                headerName: "S. No.",
                field: "sno",
                width: 100,
                headerCheckboxSelection: true,
                checkboxSelection: true,
                pinned: "left",
            },
            {
                headerName: "Date",
                field: "date",
                width: 110,
                sortable: true,
            },
            {
                headerName: "Voucher No.",
                field: "voucherNo",
                width: 150,
                cellRenderer: (params) => (
                    <span
                        style={{
                            color: "#007bff",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontWeight: 500,
                        }}
                        onClick={() => handleVoucherClick(params.value)}
                    >
                        {params.value}
                    </span>
                ),
            },
            {
                headerName: "Transaction Type",
                field: "transactionType",
                width: 170,
            },
            {
                headerName: "Reference",
                field: "reference",
                width: 150,
            },
            {
                headerName: "Warehouse",
                field: "warehouse",
                width: 150,
            },
            {
                headerName: "Batch No.",
                field: "batchNo",
                width: 150,
            },
            {
                headerName: "Serial No.",
                field: "serialNo",
                width: 120,
            },
            {
                headerName: "In Qty",
                field: "inQty",
                width: 100,
                type: "numericColumn",
                valueFormatter: (p) => Number(p.value).toFixed(3),
            },
            {
                headerName: "Out Qty",
                field: "outQty",
                width: 100,
                type: "numericColumn",
                valueFormatter: (p) => Number(p.value).toFixed(3),
            },
            {
                headerName: "Balance Qty",
                field: "balanceQty",
                width: 150,
                type: "numericColumn",
                valueFormatter: (p) => Number(p.value).toFixed(3),
            },
            {
                headerName: "Unit Cost (₹)",
                field: "unitCost",
                width: 150,
                type: "numericColumn",
                valueFormatter: (p) => Number(p.value).toFixed(2),
            },
            {
                headerName: "In Value (₹)",
                field: "inValue",
                width: 150,
                type: "numericColumn",
                valueFormatter: (p) => Number(p.value).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
            },
            {
                headerName: "Out Value (₹)",
                field: "outValue",
                width: 150,
                type: "numericColumn",
                valueFormatter: (p) => Number(p.value).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
            },
            {
                headerName: "Balance Value (₹)",
                field: "balanceValue",
                width: 170,
                type: "numericColumn",
                valueFormatter: (p) => Number(p.value).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
            },
            {
                headerName: "Created By",
                field: "createdBy",
                width: 150,
                // visible: false,
            },
        ],
        []
    );

    const defaultColDef = useMemo(
        () => ({
            resizable: true,
            filter: true,
            sortable: true,
        }),
        []
    );

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    // Export handlers
    const handleExportToExcel = () => {
        if (!rowData || rowData.length === 0) {
            toast.warning("No data available to export");
            return;
        }
        const ws = XLSX.utils.json_to_sheet(rowData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ItemLedger");
        XLSX.writeFile(wb, `ItemLedger_${fromDate}_to_${toDate}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    // Reusable custom select styles to match existing app look
    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: "34px",
            height: "34px",
            fontSize: "13px",
            borderColor: "#ced4da",
            borderRadius: "4px",
        }),
        valueContainer: (base) => ({
            ...base,
            height: "34px",
            padding: "0 8px",
        }),
        input: (base) => ({
            ...base,
            margin: "0px",
        }),
        indicatorsContainer: (base) => ({
            ...base,
            height: "34px",
        }),
        menu: (provided) => ({ ...provided, zIndex: 9999, fontSize: "13px" }),
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />

            {/* Breadcrumb & Action Header */}
            {/* <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <div className="text-muted small mb-1" style={{ fontSize: "12px" }}>
            <i className="fa-solid fa-house me-1"></i> Inventory &gt; Reports &gt;{" "}
            <span className="fw-semibold text-dark">Item Ledger</span>
          </div>
          <h4 className="fw-bold m-0 text-dark" style={{ fontSize: "20px" }}>
            Item Ledger
          </h4>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm px-3 shadow-sm d-flex align-items-center" onClick={handleExportToExcel}>
            <i className="fa-solid fa-file-excel me-2"></i> Export Excel
          </button>
          <button className="btn btn-danger btn-sm px-3 shadow-sm d-flex align-items-center" onClick={handlePrint}>
            <i className="fa-solid fa-file-pdf me-2"></i> Export PDF
          </button>
          <button className="btn btn-primary btn-sm px-3 shadow-sm d-flex align-items-center" onClick={handlePrint}>
            <i className="fa-solid fa-print me-2"></i> Print
          </button>
        </div>
      </div> */}

            <div>
                <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
                    <div className="d-flex justify-content-between">
                        <h1 className='purbut mt-3'> Item Ledger Analysis</h1>
                        <div className="mobileview">
                            <div className="d-flex justify-content-between">
                                <div className="d-flex justify-content-start">
                                    <h1 className='h1'>Item Ledger Analysis</h1>
                                </div>
                                <div className="d-flex justify-content-end mt-1 ms-5">
                                    <div className="dropdown">
                                        <button className="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fa-solid fa-list"></i>
                                        </button>
                                        <ul className="dropdown-menu ">
                                            <li>
                                                <icon class="iconbutton d-flex justify-content-center" onClick={handlePrint}>
                                                    <i className="fa-solid fa-print" title="Print"></i>
                                                </icon>
                                            </li>
                                            <li>
                                                <icon class="iconbutton d-flex justify-content-center" onClick={handleExportToExcel}>
                                                    <i class="fa-solid fa-file-excel" title="Excel"></i>
                                                </icon>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="purbut">
                            <div className="d-flex justify-content-end me-5">
                                <button className="btn btn-dark mt-3 mb-3 rounded-3" onClick={handlePrint}>
                                    <i className="fa-solid fa-print" title="Print"></i>
                                </button>
                                <button class="btn btn-dark mt-3 mb-3 rounded-3" onClick={handleExportToExcel}>
                                    <i class="fa-solid fa-file-excel" title="Excel"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Criteria Card */}
            <div className="card shadow-sm border-0 mb-3 rounded-2">
                {/* <div className="card-header bg-white py-2 border-bottom-0">
          <span className="fw-semibold text-secondary" style={{ fontSize: "14px" }}>
            Search Criteria
          </span>
        </div> */}
                <div className="card-body pt-0 pb-3">
                    {/* Row 1 */}
                    <div className="row ms-4 mb-2 me-4 mt-2">
                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Company *</label>
                            <div title="Select Company">
                                <Select
                                    id="company"
                                    value={selectedCompany}
                                    onChange={handleChangeCompany}
                                    options={filteredOptionCompany}
                                    className="exp-input-field"
                                    classNamePrefix="react-select"
                                    placeholder=""
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Branch</label>
                            <div title="Select Branch">
                                <Select
                                    id="branch"
                                    value={branch}
                                    onChange={setBranch}
                                    options={DEMO_DROPDOWNS.branches}
                                    className="exp-input-field"
                                    classNamePrefix="react-select"
                                    placeholder=""
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Warehouse</label>
                            <div title="Select Warehouse">
                                <Select
                                    id="warehouse"
                                    value={selectedWarehouse}
                                    onChange={handleChangeWarehouse}
                                    options={filteredOptionWarehouse}
                                    className="exp-input-field"
                                    classNamePrefix="react-select"
                                    placeholder=""
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Item Code</label>
                            <div className="position-relative" title="Search by item code">
                                <input
                                    id="itemCode"
                                    className="exp-input-field form-control pe-4"
                                    type="text"
                                    placeholder="Search by Item Code"
                                    value={itemCode}
                                    onChange={(e) => setItemCode(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    maxLength={50}
                                />
                                {/* <i
    className="fa-solid fa-magnifying-glass text-muted position-absolute"
    style={{
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        pointerEvents: "auto",
        zIndex: 10
    }}
    title="Item Code Help"
    onClick={ handleItemCodePopUp}
></i> */}
<div className='position-absolute md-2' style={{ right: "8px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", pointerEvents: "auto", zIndex: 10 }}>
                    <span className="icon searchIcon"
                      title='Inventory Return Help'
                      onClick={handleItemCodePopUp}>
                      <i class="fa fa-search"></i>
                    </span>
                  </div>
                            </div>
                        </div>

                        

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Item Category</label>
                            <div title="Select Item Category">
                                <Select
                                    id="category"
                                    value={category}
                                    onChange={setCategory}
                                    options={DEMO_DROPDOWNS.categories}
                                    className="exp-input-field"
                                    classNamePrefix="react-select"
                                    placeholder=""
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                    {/* Row 2 */}
                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Item Group</label>
                            <div title="Select Item Group">
                                <Select
                                    id="group"
                                    value={group}
                                    onChange={setGroup}
                                    options={DEMO_DROPDOWNS.groups}
                                    className="exp-input-field"
                                    classNamePrefix="react-select"
                                    placeholder=""
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">From Date *</label>
                            <input
                                id="fromDate"
                                className="exp-input-field form-control"
                                type="date"
                                required
                                title="Please fill the from date here"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">To Date *</label>
                            <input
                                id="toDate"
                                className="exp-input-field form-control"
                                type="date"
                                required
                                title="Please fill the to date here"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Transaction Type</label>
                            <div title="Select Transaction Type">
                                <Select
                                    id="transactionType"
                                    value={selectedTransaction}
                                    onChange={handleChangetransaction}
                                    options={filteredOptionTransaction}
                                    className="exp-input-field"
                                    classNamePrefix="react-select"
                                    placeholder=""
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Batch No.</label>
                            <div className="position-relative" title="Search Batch No">
                                <input
                                    id="batchNo"
                                    className="exp-input-field form-control pe-4"
                                    type="text"
                                    placeholder="Search batch no..."
                                    value={batchNo}
                                    onChange={(e) => setBatchNo(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                                <i
                                    className="fa-solid fa-magnifying-glass text-muted position-absolute"
                                    style={{ right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                                ></i>
                            </div>
                        </div>

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Serial No.</label>
                            <div className="position-relative" title="Search Serial No">
                                <input
                                    id="serialNo"
                                    className="exp-input-field form-control pe-4"
                                    type="text"
                                    placeholder="Search serial no..."
                                    value={serialNo}
                                    onChange={(e) => setSerialNo(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                                <i
                                    className="fa-solid fa-magnifying-glass text-muted position-absolute"
                                    style={{ right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                                ></i>
                            </div>
                        </div>
                    
                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Document No.</label>
                            <div className="position-relative" title="Search Document No">
                                <input
                                    id="documentNo"
                                    className="exp-input-field form-control pe-4"
                                    type="text"
                                    placeholder="Search document no..."
                                    value={documentNo}
                                    onChange={(e) => setDocumentNo(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                                <i
                                    className="fa-solid fa-magnifying-glass text-muted position-absolute"
                                    style={{ right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                                ></i>
                            </div>
                        </div>

                        <div className="col-md-2 form-group text-start">
                            <label className="form-label">Status</label>
                            <div title="Select Status">
                                <Select
                                    id="status"
                                    value={selectedStatus}
                                    onChange={handleChangeStatus}
                                    options={filteredOptionStatus}
                                    className="exp-input-field"
                                    classNamePrefix="react-select"
                                    placeholder=""
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 d-flex align-items-center pt-3">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="showZeroQty"
                                    checked={showZeroQty}
                                    onChange={(e) => setShowZeroQty(e.target.checked)}
                                />
                                <label className="form-label form-check-label mb-0 ms-1" htmlFor="showZeroQty" style={{ cursor: "pointer" }}>
                                    Show Zero Quantity Transactions
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Search / Reset Action Buttons */}
                    <div className="row ms-4 me-4 mt-2">
                        <div className="col-12 d-flex justify-content-end gap-2">
                            <button className="btn btn-primary btn-sm px-4 shadow-sm" onClick={handleSearch} title="Search">
                                <i className="fa-solid fa-magnifying-glass me-1"></i> Search
                            </button>
                            <button className="btn btn-outline-secondary btn-sm px-3" onClick={handleReset} title="Reset">
                                <i className="fa-solid fa-rotate-right me-1"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="row g-2 mb-3">
                {/* Opening Qty */}
                <div className="col">
                    <div className="card border-0 p-2 rounded-2 h-100" style={{ backgroundColor: "#eef6ff" }}>
                        <span className="text-secondary small fw-medium" style={{ fontSize: "11px" }}>
                            Opening Quantity
                        </span>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <div>
                                <h6 className="fw-bold mb-0 text-dark">{summaryData.openingQty.toFixed(3)}</h6>
                                <small className="text-muted" style={{ fontSize: "10px" }}>Units</small>
                            </div>
                            <i className="fa-solid fa-box text-primary fs-5 opacity-75"></i>
                        </div>
                    </div>
                </div>

                {/* Inward Qty */}
                <div className="col">
                    <div className="card border-0 p-2 rounded-2 h-100" style={{ backgroundColor: "#eef9f2" }}>
                        <span className="text-secondary small fw-medium" style={{ fontSize: "11px" }}>
                            Total Inward Quantity
                        </span>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <div>
                                <h6 className="fw-bold mb-0 text-dark">{summaryData.totalInwardQty.toFixed(3)}</h6>
                                <small className="text-muted" style={{ fontSize: "10px" }}>Units</small>
                            </div>
                            <i className="fa-solid fa-arrow-down text-success fs-5"></i>
                        </div>
                    </div>
                </div>

                {/* Outward Qty */}
                <div className="col">
                    <div className="card border-0 p-2 rounded-2 h-100" style={{ backgroundColor: "#fff1f0" }}>
                        <span className="text-secondary small fw-medium" style={{ fontSize: "11px" }}>
                            Total Outward Quantity
                        </span>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <div>
                                <h6 className="fw-bold mb-0 text-dark">{summaryData.totalOutwardQty.toFixed(3)}</h6>
                                <small className="text-muted" style={{ fontSize: "10px" }}>Units</small>
                            </div>
                            <i className="fa-solid fa-arrow-up text-danger fs-5"></i>
                        </div>
                    </div>
                </div>

                {/* Closing Qty */}
                <div className="col">
                    <div className="card border-0 p-2 rounded-2 h-100" style={{ backgroundColor: "#f3e8ff" }}>
                        <span className="text-secondary small fw-medium" style={{ fontSize: "11px" }}>
                            Closing Quantity
                        </span>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <div>
                                <h6 className="fw-bold mb-0 text-dark">{summaryData.closingQty.toFixed(3)}</h6>
                                <small className="text-muted" style={{ fontSize: "10px" }}>Units</small>
                            </div>
                            <i className="fa-solid fa-boxes-stacked text-purple fs-5" style={{ color: "#7c3aed" }}></i>
                        </div>
                    </div>
                </div>

                {/* Opening Value */}
                <div className="col">
                    <div className="card border-0 p-2 rounded-2 h-100" style={{ backgroundColor: "#eef6ff" }}>
                        <span className="text-secondary small fw-medium" style={{ fontSize: "11px" }}>
                            Opening Stock Value
                        </span>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <h6 className="fw-bold mb-0 text-dark">
                                ₹ {summaryData.openingStockValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </h6>
                            <i className="fa-solid fa-coins text-info fs-5"></i>
                        </div>
                    </div>
                </div>

                {/* Inward Value */}
                <div className="col">
                    <div className="card border-0 p-2 rounded-2 h-100" style={{ backgroundColor: "#eef9f2" }}>
                        <span className="text-secondary small fw-medium" style={{ fontSize: "11px" }}>
                            Total Inward Value
                        </span>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <h6 className="fw-bold mb-0 text-dark">
                                ₹ {summaryData.totalInwardValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </h6>
                            <i className="fa-solid fa-money-bill-trend-up text-success fs-5"></i>
                        </div>
                    </div>
                </div>

                {/* Outward Value */}
                <div className="col">
                    <div className="card border-0 p-2 rounded-2 h-100" style={{ backgroundColor: "#fff1f0" }}>
                        <span className="text-secondary small fw-medium" style={{ fontSize: "11px" }}>
                            Total Outward Value
                        </span>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <h6 className="fw-bold mb-0 text-dark">
                                ₹ {summaryData.totalOutwardValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </h6>
                            <i className="fa-solid fa-money-bill-transfer text-danger fs-5"></i>
                        </div>
                    </div>
                </div>

                {/* Closing Stock Value */}
                <div className="col">
                    <div className="card border-0 p-2 rounded-2 h-100" style={{ backgroundColor: "#f3e8ff" }}>
                        <span className="text-secondary small fw-medium" style={{ fontSize: "11px" }}>
                            Closing Stock Value
                        </span>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                            <h6 className="fw-bold mb-0 text-dark">
                                ₹ {summaryData.closingStockValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </h6>
                            <i className="fa-solid fa-vault text-purple fs-5" style={{ color: "#7c3aed" }}></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Ledger Table Header Bar & Grid */}
            <div className="card shadow-sm border-0 rounded-2 overflow-hidden">
                {/* <div
          className="d-flex justify-content-between align-items-center px-3 py-2 text-white"
          style={{ backgroundColor: "#0266b3" }}
        >
          <span className="fw-semibold" style={{ fontSize: "14px" }}>
            Item Ledger Details
          </span>
          <div className="d-flex align-items-center small">
            <span>Show</span>
            <select
              className="form-select form-select-sm mx-2 py-0"
              style={{ width: "65px", height: "26px", fontSize: "12px" }}
              onChange={(e) => gridApi?.paginationSetPageSize(Number(e.target.value))}
              defaultValue={10}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>
        </div> */}

                <div className="ag-theme-quartz" style={{ height: 455, width: "100%" }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onGridReady={onGridReady}
                        pagination={true}
                        paginationPageSize={10}
                        rowSelection="multiple"
                        suppressRowClickSelection={true}
                    />
                </div>
                <div>
                        <InventoryReturnItemPopup open={open1} handleClose={handleClose} handleItem={handleItemCode} />
                        
                      </div>
            </div>
        </div>
    );
}

export default ItemLedgerReport;