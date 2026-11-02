import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import SalesVendorPopup from './SalesVendorPopup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';
import { useNavigate } from 'react-router-dom';


const config = require('./Apiconfig');

function CustomerReceipts() {
  // 1. State Variables for all Customer Fields
  const [loading, setLoading] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState(null);
  const [gstin, setGstin] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [outstanding, setOutstanding] = useState("");
  const [currency, setCurrency] = useState(null);
  
  // Example error & showAsterisk states based on your code
  const [error, setError] = useState(false);
  const [showAsterisk, setShowAsterisk] = useState(false);

  // 2. Clear fields function
  const clearCustomerFields = () => {
    setCustomerCode('');
    setCustomerName('');
    setCustomerType(null);
    setGstin('');
    setContactPerson('');
    setCreditLimit('');
    setOutstanding('');
    setCurrency(null);
  };

  const handleShowModal = () => {
    setOpen2(true);
  };

  const handleChange = (e) => {
    setCustomerCode(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchCustomer(customerCode);
    }
  };

  // 3. API Call Function (Enter Key)
  const handleSearchCustomer = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getCustomerCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          company_code: sessionStorage.getItem('selectedCompanyCode'), 
          customer_code: code 
        }) 
      });

      if (response.ok) {
        const searchData = await response.json();
        if (searchData.length > 0) {
          // Backend keys match (example: lowercase)
          const [{ 
            customer_code, customer_name, customer_type, 
            customer_gst_no, contact_person, customer_credit_limit, 
            outstanding_amt, currency_type 
          }] = searchData;

          setCustomerCode(customer_code || '');
          setCustomerName(customer_name || '');
          setCustomerType(customer_type ? { label: customer_type, value: customer_type } : null);
          setGstin(customer_gst_no || '');
          setContactPerson(contact_person || '');
          setCreditLimit(customer_credit_limit || '0.00');
          setOutstanding(outstanding_amt || '0.00');
          setCurrency(currency_type ? { label: currency_type, value: currency_type } : null);
          
          toast.success("Data fetched successfully");
        }
      } else if (response.status === 404) {
        toast.warning('Data not found');
        clearCustomerFields();
      } else {
        toast.warning('There was an error with your request.');
        clearCustomerFields();
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error('Error fetching data: ' + error.message);
      clearCustomerFields();
    } finally {
      setLoading(false);
    }
  };

  // 4. Popup Callback Function (Search Icon Click)
  const handleVendor = async (data) => {
    if (data && data.length > 0) {
      // Popup response keys match (example: PascalCase)
      const [{ 
        CustomerCode, CustomerName, CustomerType, 
        GSTNo, ContactPerson, CreditLimit, 
        Outstanding, Currency 
      }] = data;

      setCustomerCode(CustomerCode || '');
      setCustomerName(CustomerName || '');
      setCustomerType(CustomerType ? { label: CustomerType, value: CustomerType } : null);
      setGstin(GSTNo || '');
      setContactPerson(ContactPerson || '');
      setCreditLimit(CreditLimit || '0.00');
      setOutstanding(Outstanding || '0.00');
      setCurrency(Currency ? { label: Currency, value: Currency } : null);
    } else {
      console.error('Data is empty or undefined');
    }
  };

  const handleClose = () => {
    setOpen2(false);
  };
  
  // Ag-Grid Column Definitions
  const [columnDefs] = useState([
    { 
      headerName: '', 
      field: '',
      headerCheckboxSelection: true, 
      checkboxSelection: true, 
      maxWidth: 50,
      sortable: false,
      filter: false
    },
    { headerName: 'Invoice No.', field: 'invoiceNo', minWidth: 130 },
    { headerName: 'Invoice Date', field: 'invoiceDate', minWidth: 130 },
    { headerName: 'Due Date', field: 'dueDate', minWidth: 130 },
    { headerName: 'Invoice Amount (₹)', field: 'invoiceAmount', type: 'rightAligned', minWidth: 160 },
    { headerName: 'Previous Receipts (₹)', field: 'previousReceipts', type: 'rightAligned', minWidth: 170 },
    { headerName: 'Credit Notes (₹)', field: 'creditNotes', type: 'rightAligned', minWidth: 150 },
    { headerName: 'Outstanding (₹)', field: 'outstanding', type: 'rightAligned', minWidth: 150 },
    { 
      headerName: 'Allocate Amount (₹)', 
      field: 'allocateAmount', 
      editable: true, 
      type: 'rightAligned', 
      minWidth: 160,
    //   cellStyle: { backgroundColor: '#ffffff', border: '1px solid #ced4da', margin: '2px 0' }
    },
    { headerName: 'Balance After (₹)', field: 'balanceAfter', type: 'rightAligned', minWidth: 150 }
  ]);

  // Ag-Grid Row Data
  const [rowData] = useState([
    { invoiceNo: 'INV-00125', invoiceDate: '01-10-2026', dueDate: '31-10-2026', invoiceAmount: '75,000.00', previousReceipts: '0.00', creditNotes: '0.00', outstanding: '75,000.00', allocateAmount: '75,000.00', balanceAfter: '0.00' },
    { invoiceNo: 'INV-00130', invoiceDate: '10-10-2026', dueDate: '09-11-2026', invoiceAmount: '50,000.00', previousReceipts: '0.00', creditNotes: '0.00', outstanding: '50,000.00', allocateAmount: '25,000.00', balanceAfter: '25,000.00' },
    { invoiceNo: 'INV-00140', invoiceDate: '15-10-2026', dueDate: '14-11-2026', invoiceAmount: '30,000.00', previousReceipts: '0.00', creditNotes: '0.00', outstanding: '30,000.00', allocateAmount: '', balanceAfter: '30,000.00' }
  ]);

  // Ag-Grid Footer Total Row
  const pinnedBottomRowData = [
    {
      invoiceNo: 'Total',
      invoiceAmount: '1,55,000.00',
      previousReceipts: '0.00',
      creditNotes: '0.00',
      outstanding: '1,55,000.00',
      allocateAmount: '1,00,000.00',
      balanceAfter: '55,000.00'
    }
  ];

  return (
    <div className="container-fluid Topnav-screen">
      
      {/* Top Action Bar */}
      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="d-flex justify-content-between">
          <div className="d-flex justify-content-start">
            <h1 align="left" className="purbut me-5">Customer Receipts</h1>
          </div>
          <div className="d-flex justify-content-end purbut me-3 align-items-center">
            <div className="exp-form-floating me-3" style={{ width: '150px' }}>
              <Select placeholder="Add" />
            </div>
            <savebutton className="purbut me-2" title='Save'>
              <i className="fa-regular fa-floppy-disk"></i>
            </savebutton>
            <printbutton className="purbut" title='Reload'>
              <i className="fa-solid fa-arrow-rotate-right"></i>
            </printbutton>
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="shadow-lg p-1 bg-body-tertiary rounded pt-3 pb-4" align="left">
        <div className="row ms-3 me-3">
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Receipt No. <span className="text-danger">*</span></label>
              <input type="text" className="exp-input-field form-control bg-light" value="CR-2026-00125" readOnly />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Receipt Date <span className="text-danger">*</span></label>
              <input type="date" className="exp-input-field form-control" />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Financial Year <span className="text-danger">*</span></label>
              <Select className="exp-input-field" classNamePrefix="react-select" placeholder="2026-27" />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Branch <span className="text-danger">*</span></label>
              <Select className="exp-input-field" classNamePrefix="react-select" placeholder="Chennai" />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-2 pb-4" align="left">
            <button className="shadow-lg mb-2 addTab1 text-white" > Customer Details</button>
        <div className="row ms-3 me-3">
          <div className="col-md-2 form-group mb-2">
            <label className={`${error && !customerCode ? 'red' : ''}`}>
              Customer Code{!showAsterisk && <span className="text-danger">*</span>}
            </label>
            <div className="exp-form-floating">
              <div className="d-flex justify-content-end">
                <input 
                  className="exp-input-field form-control justify-content-start" 
                  id='customercode'
                  required
                  maxLength={18}
                  value={customerCode} 
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                />
                <div className="position-absolute mt-1 me-2">
                  <span className="icon searchIcon" style={{ cursor: 'pointer' }} onClick={handleShowModal}>
                    <i className="fa fa-search"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Name */}
          <div className="col-md-3 form-group mb-2">
            <div className="exp-form-floating">
              <label>Customer Name</label>
              <input className="exp-input-field form-control bg-light" value={customerName} readOnly />
            </div>
          </div>

          {/* Customer Type (React-Select) */}
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Customer Type</label>
              <Select 
                className="exp-input-field" 
                classNamePrefix="react-select" 
                value={customerType}
                onChange={setCustomerType}
                placeholder="Select..." 
              />
            </div>
          </div>

          {/* GSTIN */}
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>GSTIN</label>
              <input className="exp-input-field form-control bg-light" value={gstin} readOnly />
            </div>
          </div>

          {/* Contact Person */}
          <div className="col-md-3 form-group mb-2">
            <div className="exp-form-floating">
              <label>Contact Person</label>
              <input 
                className="exp-input-field form-control" 
                value={contactPerson} 
                onChange={(e) => setContactPerson(e.target.value)} 
              />
            </div>
          </div>
        </div>
        
        <div className="row ms-3 me-3 mt-2">
          {/* Credit Limit */}
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Credit Limit (₹)</label>
              <input className="exp-input-field form-control text-end" value={creditLimit} readOnly />
            </div>
          </div>

          {/* Outstanding */}
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Outstanding (₹)</label>
              <input className="exp-input-field form-control text-end" value={outstanding} readOnly />
            </div>
          </div>

          {/* Currency (React-Select) */}
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Currency</label>
              <Select 
                className="exp-input-field" 
                classNamePrefix="react-select" 
                value={currency}
                onChange={setCurrency}
                placeholder="INR" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Details Section */}
      <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-2 pb-4" align="left">
            <button className="shadow-lg mb-2 addTab1 text-white" > Receipt Details</button>
        <div className="row ms-3 me-3">
          <div className="col-md-6 form-group mb-2 d-flex align-items-center">
            <label className="me-3">Receipt Type <span className="text-danger">*</span></label>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="receiptType" id="invoiceBased" defaultChecked />
              <label className="form-check-label" htmlFor="invoiceBased">Invoice Based</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="receiptType" id="accountBased" />
              <label className="form-check-label" htmlFor="accountBased">Account Based</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="receiptType" id="advanceReceipt" />
              <label className="form-check-label" htmlFor="advanceReceipt">Advance Receipt</label>
            </div>
          </div>
          
          <div className="col-md-2 ms-auto form-group mb-2">
            <div className="exp-form-floating">
              <label>Received Amount (₹) <span className="text-danger">*</span></label>
              <input className="exp-input-field form-control text-end" value="1,00,000.00" />
            </div>
          </div>
        </div>

        <div className="row ms-3 me-3 mt-2">
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Payment Mode <span className="text-danger">*</span></label>
              <Select className="exp-input-field" classNamePrefix="react-select" placeholder="Bank Transfer" />
            </div>
          </div>
          <div className="col-md-4 form-group mb-2">
            <div className="exp-form-floating">
              <label>Bank Account <span className="text-danger">*</span></label>
              <Select className="exp-input-field" classNamePrefix="react-select" placeholder="HDFC Bank - Current A/c (XXXX1234)" />
            </div>
          </div>
          <div className="col-md-2 ms-auto form-group mb-2">
            <div className="exp-form-floating">
              <label>TDS Deducted (₹)</label>
              <input className="exp-input-field form-control text-end" value="0.00" />
            </div>
          </div>
        </div>

        <div className="row ms-3 me-3 mt-2">
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Value Date <span className="text-danger">*</span></label>
              <input type="date" className="exp-input-field form-control" />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Transaction Ref No.</label>
              <input className="exp-input-field form-control" value="UTR123456789" />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Instrument No.</label>
              <input className="exp-input-field form-control" />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Instrument Date</label>
              <input type="date" className="exp-input-field form-control" />
            </div>
          </div>
          <div className="col-md-2 ms-auto form-group mb-2">
            <div className="exp-form-floating">
              <label>Bank Charges (₹)</label>
              <input className="exp-input-field form-control text-end" value="0.00" />
            </div>
          </div>
        </div>
      </div>

      <SalesVendorPopup open={open2} handleClose={handleClose} handleVendor={handleVendor} />

      {/* Invoice Allocation Ag-Grid Section */}
      <div className="shadow-lg p-1 mt-2 bg-body-tertiary rounded pt-3 pb-4" align="left">
        <div className="ag-theme-alpine ms-3 me-3 mt-2" style={{ height: 250, width: "100%" }}>
          <AgGridReact 
            rowData={rowData}
            columnDefs={columnDefs}
            // pinnedBottomRowData={pinnedBottomRowData}
            headerHeight={28}
            rowHeight={25}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            defaultColDef={{ resizable: true }}
          />
        </div>
      </div>
      
    </div>
  );
}

export default CustomerReceipts;
