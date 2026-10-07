import { useState, useEffect } from "react";
import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import 'ag-grid-autocomplete-editor/dist/main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from './Loading';
import Select from 'react-select';

const config = require('./Apiconfig');

const columnDefs = [
    {
        checkboxSelection: true,
        headerName: "Note Type",
        field: "Note_Type",
        editable: false,
    },
    {
        headerName: "Transaction No",
        field: "Note_No",
        editable: false,
    },
    {
        headerName: "Date",
        field: "Note_Date",
        editable: false,
        valueFormatter: params => params.value ? format(new Date(params.value), 'yyyy-MM-dd') : '',
    },
    {
        headerName: "Party Type",
        field: "Party_Type",
        editable: false,
    },
    {
        headerName: "Party Name",
        field: "Party_ID",
        editable: false,
    },
    {
        headerName: "Ref. Type",
        field: "Reference_Type",
        editable: false,
    },
    {
        headerName: "Reason",
        field: "Reason_ID",
        editable: false,
    },
    {
        headerName: "Ref. Transaction No",
        field: "Reference_Invoice_No",
        editable: false,
    },
    {
        headerName: "Ref. Transaction Date",
        field: "Reference_Invoice_Date",
        editable: false,
        valueFormatter: params => params.value ? format(new Date(params.value), 'yyyy-MM-dd') : '',
    },
    {
        headerName: "Ref. No",
        field: "Reference_No",
        editable: false,
    },
    {
        headerName: "Narration",
        field: "Narration",
        editable: false,
    },
    {
        headerName: "Total Amount",
        field: "Sub_Total",
        editable: false,
        valueFormatter: params => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
    {
        headerName: "Total Tax",
        field: "Tax_Amount",
        editable: false,
        valueFormatter: params => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
    {
        headerName: "Round Off",
        field: "rounded_off",
        editable: false,
        valueFormatter: params => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
    {
        headerName: "Total Bill Amount",
        field: "Total_Amount",
        editable: false,
        valueFormatter: params => params.value ? parseFloat(params.value).toFixed(2) : '0.00',
    },
];

const defaultColDef = {
    resizable: true,
    wrapText: true,
    sortable: true,
    editable: true,
    filter: true,
};

export default function DebitCreditNoteHelp({ open, handleClose, handleDeleteDebitCreditData }) {

    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form Inputs State
    const [noteType, setNoteType] = useState("");
    const [selectedNoteType, setSelectedNoteType] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [transactionNo, setTransactionNo] = useState("");

    const [partyType, setPartyType] = useState("");
    const [selectedPartyType, setSelectedPartyType] = useState(null);

    const [partyName, setPartyName] = useState("");
    const [selectedPartyName, setSelectedPartyName] = useState(null);

    const [refType, setRefType] = useState("");
    const [selectedRefType, setSelectedRefType] = useState(null);

    const [reason, setReason] = useState("");
    const [selectedReason, setSelectedReason] = useState(null);

    const [refTransactionId, setRefTransactionId] = useState("");
    const [refFromDate, setRefFromDate] = useState("");
    const [refToDate, setRefToDate] = useState("");
    const [narration, setNarration] = useState("");
    const [totalBillAmount, setTotalBillAmount] = useState("");

    // Dropdown Master Options State
    const [noteTypeDrop, setNoteTypeDrop] = useState([]);
    const [partyTypeDrop, setPartyTypeDrop] = useState([]);
    const [vendorCodeDrop, setVendorCodeDrop] = useState([]);
    const [customerCodeDrop, setCustomerCodeDrop] = useState([]);
    const [refTypeDrop, setRefTypeDrop] = useState([]);
    const [reasonOptions, setReasonOptions] = useState([]);

    // Fetch Vendor Dropdown
    useEffect(() => {
        const companyCode = sessionStorage.getItem("selectedCompanyCode");

        fetch(`${config.apiBaseUrl}/vendorcode`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: companyCode }),
        })
            .then((res) => res.json())
            .then((data) => setVendorCodeDrop(data))
            .catch((err) => console.error("Error fetching Vendors:", err));

        // Customer Dropdown
        fetch(`${config.apiBaseUrl}/customerCodeDropdown`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: companyCode }),
        })
            .then((res) => res.json())
            .then((data) => setCustomerCodeDrop(data))
            .catch((err) => console.error("Error fetching Customers:", err));

        // Ref Type Dropdown
        fetch(`${config.apiBaseUrl}/getReferenceType`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_code: companyCode }),
        })
            .then((res) => res.json())
            .then(setRefTypeDrop)
            .catch((err) => console.error('Error fetching Reference Types:', err));

        // Note Type Dropdown
        fetch(`${config.apiBaseUrl}/getNoteType`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: companyCode }),
        })
            .then((res) => res.json())
            .then((data) => {
                setNoteTypeDrop(data);
                if (data.length > 0) {
                    const firstOption = {
                        value: data[0].attributedetails_code,
                        label: data[0].attributedetails_name
                    };
                    setSelectedNoteType(firstOption);
                    setNoteType(firstOption.value);

                    if (firstOption.value === "DN") {
                        setSelectedPartyType({ value: "Vendor", label: "Vendor" });
                        setPartyType("Vendor");
                    } else if (firstOption.value === "CN") {
                        setSelectedPartyType({ value: "Customer", label: "Customer" });
                        setPartyType("Customer");
                    }
                }
            })
            .catch((err) => console.error("Error fetching Note Type:", err));

        // Party Type Master Dropdown
        fetch(`${config.apiBaseUrl}/getPartyName`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: companyCode }),
        })
            .then((res) => res.json())
            .then((data) => {
                setPartyTypeDrop(data);
            })
            .catch((err) => console.error("Error fetching Party Types:", err));
    }, []);

    // Fetch Reason Options based on Note Type
    useEffect(() => {
        if (!noteType) {
            setReasonOptions([]);
            setSelectedReason(null);
            return;
        }

        const fetchReasonOptions = async () => {
            try {
                const apiPath = noteType === "DN" ? "/getDebiteNote" : noteType === "CN" ? "/getCreditNote" : null;

                if (!apiPath) {
                    setReasonOptions([]);
                    setSelectedReason(null);
                    return;
                }

                const response = await fetch(`${config.apiBaseUrl}${apiPath}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ company_code: sessionStorage.getItem("selectedCompanyCode") })
                });

                const data = await response.json();
                const options = data.map((item) => ({
                    value: item.attributedetails_name,
                    label: item.attributedetails_name
                }));

                setReasonOptions(options);
                setSelectedReason(null);
            } catch (error) {
                console.error("Error fetching Reason:", error);
                setReasonOptions([]);
                setSelectedReason(null);
            }
        };

        fetchReasonOptions();
    }, [noteType]);

    // Options Mapping
    const filteredOptionNoteType = noteTypeDrop.map((opt) => ({ value: opt.attributedetails_code, label: opt.attributedetails_name }));
    const filteredOptionPartyType = partyTypeDrop.map((opt) => ({ value: opt.attributedetails_name, label: opt.attributedetails_name }));
    const filteredOptionRefType = refTypeDrop.map((opt) => ({ value: opt.attributedetails_name, label: opt.attributedetails_name }));

    const filteredOptionPartyName = partyType === "Vendor"
        ? vendorCodeDrop.map((opt) => ({
            value: opt.vendor_code,
            label: `${opt.vendor_code} - ${opt.vendor_name}`
        }))
        : partyType === "Customer"
            ? customerCodeDrop.map((opt) => ({
                value: opt.customer_code,
                label: `${opt.customer_code} - ${opt.customer_name}`
            }))
            : [];

    // Handlers
    const handleChangeNoteType = (selectedOption) => {
        setSelectedNoteType(selectedOption);
        const selectedValue = selectedOption?.value || "";
        setNoteType(selectedValue);

        if (selectedValue === "DN") {
            setSelectedPartyType({ value: "Vendor", label: "Vendor" });
            setPartyType("Vendor");
        } else if (selectedValue === "CN") {
            setSelectedPartyType({ value: "Customer", label: "Customer" });
            setPartyType("Customer");
        } else {
            setSelectedPartyType(null);
            setPartyType("");
        }
    };

    const handleChangePartyType = (selectedOption) => {
        setSelectedPartyType(selectedOption);
        setPartyType(selectedOption ? selectedOption.value : "");
        setSelectedPartyName(null);
        setPartyName("");
    };

    const handleChangePartyName = (selectedOption) => {
        setSelectedPartyName(selectedOption);
        setPartyName(selectedOption ? selectedOption.value : "");
    };

    const handleChangeRefType = (selectedOption) => {
        setSelectedRefType(selectedOption);
        setRefType(selectedOption ? selectedOption.value : "");
    };

    const handleChangeReason = (selectedOption) => {
        setSelectedReason(selectedOption);
        setReason(selectedOption ? selectedOption.value : "");
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/getDeletedDebitCreditNoteSearch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode"),
                    Note_Type: noteType,
                    Note_Date_From: fromDate,
                    Note_Date_To: toDate,
                    Note_No: transactionNo,
                    Party_Type: partyType,
                    Party_ID: partyName,
                    Reference_Type: refType,
                    Reason_ID: reason,
                    ref_transaction_id: refTransactionId,
                    Reference_Invoice_Date_From: refFromDate,
                    Reference_Invoice_Date_To: refToDate,
                    Narration: narration,
                    Total_Amount: Number(totalBillAmount) 
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
        setSelectedNoteType(null);
        setNoteType("");
        setFromDate("");
        setToDate("");
        setTransactionNo("");
        setSelectedPartyType(null);
        setPartyType("");
        setSelectedPartyName(null);
        setPartyName("");
        setSelectedRefType(null);
        setRefType("");
        setSelectedReason(null);
        setReason("");
        setRefTransactionId("");
        setRefFromDate("");
        setRefToDate("");
        setNarration("");
        setTotalBillAmount("");
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
            TransactionNo: row.Note_No,
        }));
        handleDeleteDebitCreditData(selectedData);
        handleClose();
        clearInputs();
        setRowData([]);
        setSelectedRows([]);
    };

    const handleRowDoubleClick = (params) => {
        const row = params.data;
        if (!row) return;
        const selectedData = [{
            TransactionNo: row.Note_No,
        }];
        handleDeleteDebitCreditData(selectedData);
        handleClose();
        clearInputs();
        setRowData([]);
        setSelectedRows([]);
    };

    // Render Filter Form Helper Component
    const renderFilterFields = () => (
        <div className="row ms-3 me-3">
            {/* 1. Note Type */}
            <div className="col-md-3 mb-2">
                <div className="exp-form-floating" title="Select Note Type">
                    <Select
                        id="noteType"
                        value={selectedNoteType}
                        onChange={handleChangeNoteType}
                        options={filteredOptionNoteType}
                        className="exp-input-field"
                        placeholder="Note Type"
                    />
                </div>
            </div>

            {/* 2. From Date & To Date */}
            <div className="col-md-3 mb-2">
                <input
                    type='date'
                    id='fromDate'
                    className='exp-input-field form-control'
                    title="Select From Date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <div className="col-md-3 mb-2">
                <input
                    type='date'
                    id='toDate'
                    className='exp-input-field form-control'
                    title="Select To Date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            {/* 3. Transaction No */}
            <div className="col-md-3 mb-2">
                <input
                    type='text'
                    id='transactionNo'
                    className='exp-input-field form-control'
                    placeholder='Transaction No'
                    title="Enter Transaction No"
                    value={transactionNo}
                    onChange={(e) => setTransactionNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete='off'
                />
            </div>

            {/* 4. Party Type */}
            <div className="col-md-3 mb-2">
                <div className="exp-form-floating" title="Select Party Type">
                    <Select
                        id="partyType"
                        value={selectedPartyType}
                        onChange={handleChangePartyType}
                        options={filteredOptionPartyType}
                        className="exp-input-field"
                        placeholder="Party Type"
                    />
                </div>
            </div>

            {/* 5. Party Name */}
            <div className="col-md-3 mb-2">
                <div className="exp-form-floating" title="Select Party Name">
                    <Select
                        id="partyName"
                        value={selectedPartyName}
                        onChange={handleChangePartyName}
                        options={filteredOptionPartyName}
                        className="exp-input-field"
                        placeholder="Party Name"
                    />
                </div>
            </div>

            {/* 6. Ref Type */}
            <div className="col-md-3 mb-2">
                <div className="exp-form-floating" title="Select Ref Type">
                    <Select
                        id="refType"
                        value={selectedRefType}
                        onChange={handleChangeRefType}
                        options={filteredOptionRefType}
                        className="exp-input-field"
                        placeholder="Ref Type"
                    />
                </div>
            </div>

            {/* 7. Reason */}
            <div className="col-md-3 mb-2">
                <div className="exp-form-floating" title="Select Reason">
                    <Select
                        id="reason"
                        value={selectedReason}
                        onChange={handleChangeReason}
                        options={reasonOptions}
                        className="exp-input-field"
                        placeholder="Reason"
                    />
                </div>
            </div>

            {/* 8. Ref Transaction ID */}
            <div className="col-md-3 mb-2">
                <input
                    type='text'
                    id='refTransactionId'
                    className='exp-input-field form-control'
                    placeholder='Ref. Transaction ID'
                    title="Enter Ref. Transaction ID"
                    value={refTransactionId}
                    onChange={(e) => setRefTransactionId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete='off'
                />
            </div>

            {/* 9. Ref Date From & To */}
            <div className="col-md-3 mb-2">
                <input
                    type='date'
                    id='refFromDate'
                    className='exp-input-field form-control'
                    title="Select Ref From Date"
                    value={refFromDate}
                    onChange={(e) => setRefFromDate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>
            <div className="col-md-3 mb-2">
                <input
                    type='date'
                    id='refToDate'
                    className='exp-input-field form-control'
                    title="Select Ref To Date"
                    value={refToDate}
                    onChange={(e) => setRefToDate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            {/* 10. Narration */}
            <div className="col-md-3 mb-2">
                <input
                    type='text'
                    id='narration'
                    className='exp-input-field form-control'
                    placeholder='Narration'
                    title="Enter Narration"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete='off'
                />
            </div>

            {/* 11. Total Bill Amount */}
            <div className="col-md-3 mb-2">
                <input
                    type='number'
                    id='totalBillAmount'
                    className='exp-input-field form-control'
                    placeholder='Total Bill Amount'
                    title="Enter Total Bill Amount"
                    value={totalBillAmount}
                    onChange={(e) => setTotalBillAmount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoComplete='off'
                />
            </div>

            {/* Action Buttons */}
            <div className="mb-2 mt-2 d-flex justify-content-end">
                <icon className="icon popups-btn" onClick={handleSearch} title="Search">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </icon>
                <icon className="icon popups-btn" onClick={handleReload} title="Reload">
                    <i className="fa-solid fa-arrow-rotate-right"></i>
                </icon>
                <icon className="icon popups-btn" onClick={handleConfirm} title="Confirm">
                    <FontAwesomeIcon icon="fa-solid fa-check" />
                </icon>
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
                                                    <div className="purbut mb-0 d-flex justify-content-between" >
                                                        <h1 align="left" className="purbut">Deleted Debit Credit Note Help</h1>
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

                        {/* Mobile View */}
                        <div className="mobileview">
                            <div className="modal mt-5 Topnav-screen" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <div className="modal-dialog modal-xl ps-4 pe-4 p-1" role="document">
                                    <div className="modal-content">
                                        <div className="row justify-content-center">
                                            <div className="col-md-12 text-center">
                                                <div className="mb-0 d-flex justify-content-between">
                                                    <div className="mb-0 d-flex justify-content-start me-4">
                                                        <h1 className="h1">Debit Credit Note Help</h1>
                                                    </div>
                                                    <div className="mb-0 d-flex justify-content-end" >
                                                        <button onClick={handleClose} className="closebtn2" required title="Close">
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