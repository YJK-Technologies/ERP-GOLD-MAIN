import { useState, useEffect } from "react";
import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCheck } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from './Loading';
import Select from 'react-select';

const config = require('./Apiconfig');

const columnDefs = [
    {
        checkboxSelection: true,
        headerName: "Payment ID",
        field: "Payment_ID",
        editable: false,
    },
    {
        headerName: "Payment Date",
        field: "Payment_Date",
        editable: false,
        valueFormatter: params => params.value ? format(new Date(params.value), 'yyyy-MM-dd') : '',
    },
    {
        headerName: "Payment Type",
        field: "Payment_Type",
        editable: false,
    },
    {
        headerName: "Party Type",
        field: "Party_Type",
        editable: false,
    },
    {
        headerName: "Party ID",
        field: "Party_ID",
        editable: false,
    },
    {
        headerName: "Payment Mode",
        field: "Payment_Mode",
        editable: false,
    },
    {
        headerName: "Account ID",
        field: "Account_ID",
        editable: false,
    },
    {
        headerName: "Reference No",
        field: "Reference_No",
        editable: false,
    },
    {
        headerName: "Reference Date",
        field: "Reference_Date",
        editable: false,
        valueFormatter: params => params.value ? format(new Date(params.value), 'yyyy-MM-dd') : '',
    },
    {
        headerName: "Amount",
        field: "Amount",
        editable: false,
        valueFormatter: params => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
    {
        headerName: "Narration",
        field: "Narration",
        editable: false,
    },
    {
        headerName: "Status",
        field: "Status",
        editable: false,
    },
];

const defaultColDef = {
    resizable: true,
    wrapText: true,
    sortable: true,
    editable: true,
    filter: true,
};

export default function PaymentHelp({ open, handleClose, handlePaymentData }) {

    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form Inputs State (matching payment search filters)
    const [paymentId, setPaymentId] = useState("");
    const [paymentType, setPaymentType] = useState("");
    const [selectedPaymentType, setSelectedPaymentType] = useState(null);
    
    const [partyType, setPartyType] = useState("");
    const [selectedPartyType, setSelectedPartyType] = useState(null);

    const [partyId, setPartyId] = useState("");
    const [selectedPartyId, setSelectedPartyId] = useState(null);

    const [paymentMode, setPaymentMode] = useState("");
    const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

    const [accountId, setAccountId] = useState("");
    const [selectedAccountId, setSelectedAccountId] = useState(null);

    const [referenceNo, setReferenceNo] = useState("");
    const [status, setStatus] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);

    const [paymentDateFrom, setPaymentDateFrom] = useState("");
    const [paymentDateTo, setPaymentDateTo] = useState("");
    const [referenceDateFrom, setReferenceDateFrom] = useState("");
    const [referenceDateTo, setReferenceDateTo] = useState("");
    
    const [amountFrom, setAmountFrom] = useState("");
    const [amountTo, setAmountTo] = useState("");

    // Dropdown Master Options State
    const [paymentTypeDrop, setPaymentTypeDrop] = useState([]);
    const [partyTypeDrop, setPartyTypeDrop] = useState([]);
    const [vendorCodeDrop, setVendorCodeDrop] = useState([]);
    const [customerCodeDrop, setCustomerCodeDrop] = useState([]);
    const [paymentModeDrop, setPaymentModeDrop] = useState([]);
    const [accountDrop, setAccountDrop] = useState([]);
    const [statusDrop, setStatusDrop] = useState([]);

    // Fetch Dropdowns on Mount
    useEffect(() => {
        const companyCode = sessionStorage.getItem("selectedCompanyCode");

        // Fetch Vendors
        fetch(`${config.apiBaseUrl}/vendorcode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: companyCode }),
        })
            .then((res) => res.json())
            .then((data) => setVendorCodeDrop(data))
            .catch((err) => console.error("Error fetching Vendors:", err));

        // Fetch Customers
        fetch(`${config.apiBaseUrl}/customerCodeDropdown`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: companyCode }),
        })
            .then((res) => res.json())
            .then((data) => setCustomerCodeDrop(data))
            .catch((err) => console.error("Error fetching Customers:", err));

        // Add additional dropdown endpoints as configured in your API router for Payment Type, Mode, Accounts, Status if available:
        // Example: /getPaymentType, /getPaymentMode, /getAccountList, etc.
    }, []);

    // Options Mapping
    const filteredOptionPaymentType = paymentTypeDrop.map((opt) => ({ value: opt.attributedetails_code, label: opt.attributedetails_name }));
    const filteredOptionPartyType = [{ value: "Vendor", label: "Vendor" }, { value: "Customer", label: "Customer" }];
    const filteredOptionPaymentMode = paymentModeDrop.map((opt) => ({ value: opt.code, label: opt.name }));
    const filteredOptionStatus = [{ value: "Active", label: "Active" }, { value: "Cancelled", label: "Cancelled" }];

    const filteredOptionPartyId = partyType === "Vendor"
        ? vendorCodeDrop.map((opt) => ({
            value: opt.vendor_code,
            label: `${opt.vendor_code}\n${opt.vendor_name}`
        }))
        : partyType === "Customer"
            ? customerCodeDrop.map((opt) => ({
                value: opt.customer_code,
                label: `${opt.customer_code}\n${opt.customer_name}`
            }))
            : [];

    // Handlers
    const handleChangePaymentType = (selectedOption) => {
        setSelectedPaymentType(selectedOption);
        setPaymentType(selectedOption ? selectedOption.value : "");
    };

    const handleChangePartyType = (selectedOption) => {
        setSelectedPartyType(selectedOption);
        setPartyType(selectedOption ? selectedOption.value : "");
        setSelectedPartyId(null);
        setPartyId("");
    };

    const handleChangePartyId = (selectedOption) => {
        setSelectedPartyId(selectedOption);
        setPartyId(selectedOption ? selectedOption.value : "");
    };

    const handleChangePaymentMode = (selectedOption) => {
        setSelectedPaymentMode(selectedOption);
        setPaymentMode(selectedOption ? selectedOption.value : "");
    };

    const handleChangeStatus = (selectedOption) => {
        setSelectedStatus(selectedOption);
        setStatus(selectedOption ? selectedOption.value : "");
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/getPaymentSearch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode"),
                    Payment_ID: paymentId,
                    Payment_Type: paymentType,
                    Party_Type: partyType,
                    Party_ID: partyId,
                    Payment_Mode: paymentMode,
                    Account_ID: accountId,
                    Reference_No: referenceNo,
                    Status: status,
                    Payment_Date_From: paymentDateFrom || null,
                    Payment_Date_To: paymentDateTo || null,
                    Reference_Date_From: referenceDateFrom || null,
                    Reference_Date_To: referenceDateTo || null,
                    Amount_From: amountFrom ? Number(amountFrom) : null,
                    Amount_To: amountTo ? Number(amountTo) : null,
                })
            });

            if (response.ok) {
                const searchData = await response.json();
                setRowData(searchData);
            } else if (response.status === 404) {
                toast.warning('Data not found');
                setRowData([]);
            } else {
                toast.error('Failed to fetch search data');
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
        } finally {
            setLoading(false);
        }
    };

    const clearInputs = () => {
        setPaymentId("");
        setSelectedPaymentType(null);
        setPaymentType("");
        setSelectedPartyType(null);
        setPartyType("");
        setSelectedPartyId(null);
        setPartyId("");
        setSelectedPaymentMode(null);
        setPaymentMode("");
        setAccountId("");
        setReferenceNo("");
        setSelectedStatus(null);
        setStatus("");
        setPaymentDateFrom("");
        setPaymentDateTo("");
        setReferenceDateFrom("");
        setReferenceDateTo("");
        setAmountFrom("");
        setAmountTo("");
    };

    const handleReload = () => {
        clearInputs();
        setRowData([]);
    };

    const [selectedRows, setSelectedRows] = useState([]);

    const handleRowSelected = (event) => {
        setSelectedRows(event.api.getSelectedRows());
    };

    const handleConfirm = () => {
        const selectedData = selectedRows.map(row => ({
            PaymentID: row.Payment_ID,
        }));
        handlePaymentData(selectedData);
        handleClose();
        clearInputs();
        setRowData([]);
        setSelectedRows([]);
    };

    const handleRowDoubleClick = (params) => {
        const row = params.data;
        if (!row) return;
        const selectedData = [{
            PaymentID: row.Payment_ID,
        }];
        handlePaymentData(selectedData);
        handleClose();
        clearInputs();
        setRowData([]);
        setSelectedRows([]);
    };

    // Render Filter Form Helper Component
    const renderFilterFields = () => (
        <div className="row ms-3 me-3">
            {/* 1. Payment ID */}
            <div className="col-md-3 mb-2">
                <input
                    type='text'
                    className='exp-input-field form-control'
                    placeholder='Payment ID'
                    title="Enter Payment ID"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete='off'
                />
            </div>

            {/* 2. Payment Type */}
            <div className="col-md-3 mb-2">
                <Select
                    value={selectedPaymentType}
                    onChange={handleChangePaymentType}
                    options={filteredOptionPaymentType}
                    className="exp-input-field"
                    placeholder="Payment Type"
                />
            </div>

            {/* 3. Party Type */}
            <div className="col-md-3 mb-2">
                <Select
                    value={selectedPartyType}
                    onChange={handleChangePartyType}
                    options={filteredOptionPartyType}
                    className="exp-input-field"
                    placeholder="Party Type"
                />
            </div>

            {/* 4. Party ID */}
            <div className="col-md-3 mb-2">
                <Select
                    value={selectedPartyId}
                    onChange={handleChangePartyId}
                    options={filteredOptionPartyId}
                    className="exp-input-field"
                    placeholder="Party Name / ID"
                />
            </div>

            {/* 5. Payment Mode */}
            <div className="col-md-3 mb-2">
                <Select
                    value={selectedPaymentMode}
                    onChange={handleChangePaymentMode}
                    options={filteredOptionPaymentMode}
                    className="exp-input-field"
                    placeholder="Payment Mode"
                />
            </div>

            {/* 6. Account ID */}
            <div className="col-md-3 mb-2">
                <input
                    type='text'
                    className='exp-input-field form-control'
                    placeholder='Account ID'
                    title="Enter Account ID"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete='off'
                />
            </div>

            {/* 7. Reference No */}
            <div className="col-md-3 mb-2">
                <input
                    type='text'
                    className='exp-input-field form-control'
                    placeholder='Reference No'
                    title="Enter Reference No"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete='off'
                />
            </div>

            {/* 8. Status */}
            <div className="col-md-3 mb-2">
                <Select
                    value={selectedStatus}
                    onChange={handleChangeStatus}
                    options={filteredOptionStatus}
                    className="exp-input-field"
                    placeholder="Status"
                />
            </div>

            {/* 9. Payment Date From & To */}
            <div className="col-md-3 mb-2">
                <input
                    type='date'
                    className='exp-input-field form-control'
                    title="Payment Date From"
                    value={paymentDateFrom}
                    onChange={(e) => setPaymentDateFrom(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <div className="col-md-3 mb-2">
                <input
                    type='date'
                    className='exp-input-field form-control'
                    title="Payment Date To"
                    value={paymentDateTo}
                    onChange={(e) => setPaymentDateTo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            {/* 10. Reference Date From & To */}
            <div className="col-md-3 mb-2">
                <input
                    type='date'
                    className='exp-input-field form-control'
                    title="Reference Date From"
                    value={referenceDateFrom}
                    onChange={(e) => setReferenceDateFrom(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <div className="col-md-3 mb-2">
                <input
                    type='date'
                    className='exp-input-field form-control'
                    title="Reference Date To"
                    value={referenceDateTo}
                    onChange={(e) => setReferenceDateTo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            {/* 11. Amount From & To */}
            <div className="col-md-3 mb-2">
                <input
                    type='number'
                    className='exp-input-field form-control'
                    placeholder='Amount From'
                    title="Amount From"
                    value={amountFrom}
                    onChange={(e) => setAmountFrom(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete='off'
                />
            </div>
            <div className="col-md-3 mb-2">
                <input
                    type='number'
                    className='exp-input-field form-control'
                    placeholder='Amount To'
                    title="Amount To"
                    value={amountTo}
                    onChange={(e) => setAmountTo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete='off'
                />
            </div>

            {/* Action Buttons */}
            <div className="mb-2 mt-2 d-flex justify-content-end">
                <span className="icon popups-btn cursor-pointer mx-1" onClick={handleSearch} title="Search">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
                <span className="icon popups-btn cursor-pointer mx-1" onClick={handleReload} title="Reload">
                    <i className="fa-solid fa-arrow-rotate-right"></i>
                </span>
                <span className="icon popups-btn cursor-pointer mx-1" onClick={handleConfirm} title="Confirm">
                    <FontAwesomeIcon icon={faCheck} />
                </span>
            </div>
        </div>
    );

    return (
        <div>
            {open && (
                <fieldset>
                    <div>
                        {loading && <LoadingScreen />}
                        <div className="purbut">
                            <div className="modal mt-5 Topnav-screen popup popupadj" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <div className="modal-dialog modal-xl ps-5 p-1 pe-5" role="document">
                                    <div className="modal-content">
                                        <div className="row justify-content-center">
                                            <div className="col-md-12 text-center">
                                                <div className="p-0 bg-body-tertiary">
                                                    <div className="purbut mb-0 d-flex justify-content-between">
                                                        <h1 align="left" className="purbut">Payment Help</h1>
                                                        <button onClick={handleClose} className="purbut btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="modal-body">
                                                {renderFilterFields()}
                                                <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
                                                    <AgGridReact
                                                        rowData={rowData}
                                                        columnDefs={columnDefs}
                                                        defaultColDef={defaultColDef}
                                                        rowSelection="single"
                                                        pagination={true}
                                                        onSelectionChanged={handleRowSelected}
                                                        onRowDoubleClicked={handleRowDoubleClick}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>
            )}
        </div>
    );
}