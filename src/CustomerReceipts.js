// CustomerReceipts.js
import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import SalesVendorPopup from './SalesVendorPopup';
import CustomerReceiptPopup from "./CustomerReceiptPopup";
import CRInvoicePopup from './CRInvoicePopup'; // Import added
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';
import { useNavigate } from 'react-router-dom';

const config = require('./Apiconfig');

function CustomerReceipts() {
  const navigate = useNavigate();

  // 1. State Variables for Customer Fields
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
  
  const [error, setError] = useState(false);
  const [showAsterisk, setShowAsterisk] = useState(false);

  // 2. State Variables for Receipt Header Fields
  const [receiptNo, setReceiptNo] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [financialYear, setFinancialYear] = useState(null);
  const [branch, setBranch] = useState(null);
  const [receiptType, setReceiptType] = useState("Invoice Based");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState(null);
  const [bankAccCode, setBankAccCode] = useState(null);
  const [tdsDeducted, setTdsDeducted] = useState("0.00");
  const [valueDate, setValueDate] = useState("");
  const [transactionRefNo, setTransactionRefNo] = useState("");
  const [instrumentNo, setInstrumentNo] = useState("");
  const [instrumentDate, setInstrumentDate] = useState("");
  const [bankCharges, setBankCharges] = useState("0.00");
  const [narration, setNarration] = useState("");

  const companyCode = sessionStorage.getItem('selectedCompanyCode');
  const createdBy = sessionStorage.getItem('selectedUserCode') || 'Admin';

  // State Variables for Status Dropdown
  const [screensDrop, setScreensDrop] = useState([]);
  const [Screens, setScreens] = useState("");
  const [selectedscreens, setSelectedscreens] = useState(null);

  // State for Invoice Popup
  const [openInvoicePopup, setOpenInvoicePopup] = useState(false);
  const [currentRowNode, setCurrentRowNode] = useState(null);
  // State for Receipt Popup
  const [openReceiptPopup, setOpenReceiptPopup] = useState(false);

  // Options for Dropdowns
  const financialYearOptions = [{ label: '2026-27', value: '2026-27' }, { label: '2025-26', value: '2025-26' }];
  const branchOptions = [{ label: 'Chennai', value: 'CHN' }, { label: 'Mumbai', value: 'MUM' }];
  const paymentModeOptions = [{ label: 'Bank Transfer', value: 'Bank Transfer' }, { label: 'Cheque', value: 'Cheque' }, { label: 'Cash', value: 'Cash' }];
  const bankAccOptions = [{ label: 'HDFC Bank - Current A/c (XXXX1234)', value: 'HDFC1234' }];

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
        const defaultScreen = data.find((item) => item.descriptions === "Draft") || data[0];
        if (defaultScreen && !selectedscreens) {
          setSelectedscreens({
            value: defaultScreen.descriptions,
            label: defaultScreen.attributedetails_name,
          });
          setScreens(defaultScreen.descriptions);
        }
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const handleChangeScreens = (selected) => {
    setSelectedscreens(selected);
    setScreens(selected.value);
  };

  const filteredOptionScreens = screensDrop.map((option) => ({
    value: option.descriptions,
    label: option.attributedetails_name,
  }));

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

  const clearAllFields = () => {
    clearCustomerFields();
    setReceiptNo("");
    setReceiptDate("");
    setFinancialYear(null);
    setBranch(null);
    setReceiptType("Invoice Based");
    setPaymentMode(null);
    setBankAccCode(null);
    setReceivedAmount("");
    setTdsDeducted("0.00");
    setValueDate("");
    setTransactionRefNo("");
    setInstrumentNo("");
    setInstrumentDate("");
    setBankCharges("0.00");
    setNarration("");
    setSelectedscreens(null);
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

const formatReceiptDate = (dateValue) => {
  if (!dateValue || dateValue === "1900-01-01T00:00:00.000Z") {
    return "";
  }

  // API date format: dd/MM/yyyy
  if (dateValue.includes("/")) {
    const [day, month, year] = dateValue.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // API date format: ISO
  return dateValue.substring(0, 10);
};

const handleReceiptSelect = async (selectedReceiptNo) => {
    try {
        setLoading(true);

        const response = await fetch(
            `${config.apiBaseUrl}/getCustomerReceiptByNo`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    receipt_no: selectedReceiptNo,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode")
                })
            }
        );

        if (!response.ok) {
            throw new Error("Receipt data not found");
        }

        const result = await response.json();

        if (!result || result.length === 0) {
            throw new Error("Receipt data not found");
        }

        const data = result[0];

        // Header Details
        setReceiptNo(data.receipt_no || "");
        setReceiptDate(formatReceiptDate(data.receipt_date));

        setCustomerCode(data.customer_code || "");
        setReceiptType(data.receipt_type || "");

        setPaymentMode({
            label: data.payment_mode,
            value: data.payment_mode
        });

        setBankAccCode(
            bankAccOptions.find(
                item => item.value === data.bank_acc_code
            ) || {
                label: data.bank_acc_code,
                value: data.bank_acc_code
            }
        );

        setValueDate(formatReceiptDate(data.value_date));
        setTransactionRefNo(data.transaction_ref_no || "");
        setInstrumentNo(data.instrument_no || "");
        setInstrumentDate(formatReceiptDate(data.instrument_date));

        setReceivedAmount(Number(data.received_amount || 0).toFixed(2));
        setTdsDeducted(Number(data.tds_deducted || 0).toFixed(2));
        setBankCharges(Number(data.bank_charges || 0).toFixed(2));
        setNarration(data.narration || "");

        // Invoice Details - Same JOIN Response
        const invoiceRows = result
            .filter(item => item.invoice_no)
            .map(item => ({
                invoiceNo: item.invoice_no || "",
                invoiceDate: formatReceiptDate(item.invoice_date),
                dueDate: formatReceiptDate(item.due_date),
                invoiceAmount: Number(item.invoice_amount || 0).toFixed(2),
                previousReceipts: Number(item.previous_receipts || 0).toFixed(2),
                creditNotes: Number(item.credit_notes || 0).toFixed(2),
                outstanding: Number(item.outstanding_amount || 0).toFixed(2),
                allocateAmount: Number(item.allocate_amount || 0).toFixed(2),
                balanceAfter: Number(item.balance_after || 0).toFixed(2)
            }));

        setRowData(invoiceRows);

        // Customer Master Details
        if (data.customer_code) {
            await handleSearchCustomer(data.customer_code);
        }

        setOpenReceiptPopup(false);

    } catch (error) {
        console.error("Error fetching receipt:", error);
        toast.error(error.message || "Failed to fetch receipt details");
    } finally {
        setLoading(false);
    }
};

  const handleVendor = async (data) => {
    if (data && data.length > 0) {
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
    }
  };

  const handleClose = () => {
    setOpen2(false);
  };
  
  // Custom Cell Renderer for Invoice No
  const invoiceCellRenderer = (params) => {
    return (
      <div className="position-relative d-flex align-items-center" style={{ minHeight: "100%" }}>
        <div className="flex-grow-1">
          {params.editing ? (
            <input 
              type="text" 
              className="form-control" 
              value={params.value || ""}
              onChange={(e) => params.setValue(e.target.value)}
              style={{ width: "100%" }}
            />
          ) : (
            params.value || ""
          )}
        </div>
        <span
          className="icon searchIcon"
          style={{ position: "absolute", right: "5px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
          onClick={() => {
            setCurrentRowNode(params.node);
            setOpenInvoicePopup(true);
          }}
        >
          <i className="fa fa-search"></i>
        </span>
      </div>
    );
  };

  // Popup confirmation handler mapping
  // const handleInvoiceSelect = (selectedData) => {
  //   if (currentRowNode && selectedData && selectedData.length > 0) {
  //     const data = selectedData[0];
      
  //     const updatedRow = {
  //       ...currentRowNode.data,
  //       invoiceNo: data.billno,
  //       invoiceDate: data.billdate,
  //       invoiceAmount: data.Billamt,
  //       outstanding: data.balAmount || data.Billamt, 
  //       balanceAfter: data.balAmount || data.Billamt
  //     };

  //     currentRowNode.setData(updatedRow);
  //   }
  //   setOpenInvoicePopup(false);
  // };

  const handleInvoiceSelect = (selectedData) => {
  if (selectedData && selectedData.length > 0) {

    const updatedRows = selectedData.map((data) => ({
      invoiceNo: data.billno || '',
      invoiceDate: data.billdate
        ? new Date(data.billdate).toISOString().split('T')[0]
        : '',
      dueDate: '',
      invoiceAmount: Number(data.Billamt || 0).toFixed(2),
      previousReceipts: '0.00',
      creditNotes: '0.00',
      outstanding: Number(
        data.balAmount || data.Billamt || 0
      ).toFixed(2),
      allocateAmount: '0.00',
      balanceAfter: Number(
        data.balAmount || data.Billamt || 0
      ).toFixed(2)
    }));

    setRowData(updatedRows);

    // First selected invoice customer details
    const firstInvoice = selectedData[0];

    setCustomerCode(firstInvoice.billtocustomercode || '');
    setCustomerName(firstInvoice.billtocustomername || '');

    toast.success(`${selectedData.length} Invoices selected successfully`);
  }

  setOpenInvoicePopup(false);
};

  const columnDefs = [
    { headerName: '', field: '', headerCheckboxSelection: true, checkboxSelection: true, maxWidth: 50, sortable: false, filter: false },
    { headerName: 'Invoice No.', field: 'invoiceNo', minWidth: 160, editable:true, cellRenderer: invoiceCellRenderer },
    { headerName: 'Invoice Date', field: 'invoiceDate', minWidth: 130, editable:true },
    { headerName: 'Due Date', field: 'dueDate', minWidth: 130, editable:true },
    { headerName: 'Invoice Amount (₹)', field: 'invoiceAmount', type: 'rightAligned', minWidth: 160, editable:true },
    { headerName: 'Previous Receipts (₹)', field: 'previousReceipts', type: 'rightAligned', minWidth: 170, editable:true },
    { headerName: 'Credit Notes (₹)', field: 'creditNotes', type: 'rightAligned', minWidth: 150, editable:true },
    { headerName: 'Outstanding (₹)', field: 'outstanding', type: 'rightAligned', minWidth: 150, editable:true },
    { headerName: 'Allocate Amount (₹)', field: 'allocateAmount', editable: true, type: 'rightAligned', minWidth: 160 },
    { headerName: 'Balance After (₹)', field: 'balanceAfter', type: 'rightAligned', minWidth: 150, editable: true }
  ];

  const [rowData, setRowData] = useState([
    { invoiceNo: '', invoiceDate: '', dueDate: '', invoiceAmount: '0.00', previousReceipts: '0.00', creditNotes: '0.00', outstanding: '0.00', allocateAmount: '0.00', balanceAfter: '0.00' },
  ]);

  const handleMasterAction = () => {
    if (Screens === "Draft") {
      handleSaveButtonClick();
    } else if (Screens && Screens.trim() !== "") {
      handleUpdateButtonClick();
    } else {
      toast.warning("Please select a valid transaction event from the dropdown.");
    }
  };

  const handleSaveButtonClick = async () => {
    if (!receiptDate || !customerCode  || !paymentMode ) {
      setError(true);
      toast.warning("Error: Missing required fields");
      return;
    }

    setLoading(true);
    try {
      const Header = {
        company_code: companyCode,
        receipt_date: receiptDate ? receiptDate:null,
        customer_code: customerCode,
        financial_year: financialYear,
        receipt_type: receiptType,
        payment_mode: paymentMode.value,
        bank_acc_code: bankAccCode ? bankAccCode.value : null,
        value_date: valueDate ? valueDate:null,
        transaction_ref_no: transactionRefNo,
        instrument_no: instrumentNo,
        instrument_date: instrumentDate ? instrumentDate:null,
        received_amount: parseFloat(receivedAmount.toString().replace(/,/g, '')),
        tds_deducted: parseFloat(tdsDeducted.toString().replace(/,/g, '')) || 0,
        bank_charges: parseFloat(bankCharges.toString().replace(/,/g, '')) || 0,
        narration: narration,
        status: "Draft",
        gl_status: "Unposted",
        location_code: sessionStorage.getItem('selectedLocationCode'),
        created_by: createdBy
      };

      const response = await fetch(`${config.apiBaseUrl}/addCustomerReceiptHdr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        const generatedReceiptNo = searchData[0].transaction_no || searchData[0].receipt_no;
        setReceiptNo(generatedReceiptNo);

        await saveReceiptDetails(generatedReceiptNo);
        toast.success("Customer Receipt Data Inserted Successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert receipt data");
      }
    } catch (error) {
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const InvoiceFsPosting = async (receiptNo) => {
      try {
        const Header = {
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          Tran_type: "CR",
          Tran_no: receiptNo,
          Tran_date: receiptDate,
          created_by: sessionStorage.getItem("selectedUserCode"),
          modified_by: sessionStorage.getItem("selectedUserCode"),
        };
  
        const response = await fetch(`${config.apiBaseUrl}/InvoiceFsPosting`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Header),
        });
  
        if (response.ok) {
          console.log("Invoice Posting Successfully");
        } else {
          const errorResponse = await response.json();
          console.error(errorResponse.message);
          toast.error("Error inserting data" + errorResponse.message);
        }
      } catch (error) {
        console.error("Error inserting data:", error);
        toast.error("Error inserting data: " + error.message);
      } finally {
        setLoading(false);
      }
  };

  const handleUpdateButtonClick = async () => {
    if (!receiptNo || !receiptDate) {
      toast.warning("Error: Missing receipt number or required fields");
      return;
    }

    const actionLabel = selectedscreens?.label || "data";
    const actionValue = selectedscreens?.value || "data";

    showConfirmationToast(
      `Are you sure you want to ${actionLabel} the data ?`,
      async () => {
        setLoading(true);
        try {
          const Header = {
            company_code: companyCode,
            receipt_no: receiptNo,
            receipt_date: receiptDate ? receiptDate:null,
            customer_code: customerCode,
            financial_year: financialYear,
            receipt_type: receiptType,
            payment_mode: paymentMode.value,
            bank_acc_code: bankAccCode ? bankAccCode.value : null,
            value_date: valueDate ? valueDate:null,
            transaction_ref_no: transactionRefNo,
            instrument_no: instrumentNo,
            instrument_date: instrumentDate ? instrumentDate:null,
            received_amount: parseFloat(receivedAmount.toString().replace(/,/g, '')),
            tds_deducted: parseFloat(tdsDeducted.toString().replace(/,/g, '')) || 0,
            bank_charges: parseFloat(bankCharges.toString().replace(/,/g, '')) || 0,
            narration: narration,
            status: Screens === "Modified" ? "Draft" : Screens,
            authroization_status: Screens === "Modified" ? "Draft" : Screens,
            gl_status: "Unposted",
            location_code: sessionStorage.getItem('selectedLocationCode'),
            modified_by: createdBy
          };

          const response = await fetch(`${config.apiBaseUrl}/updCustomerReceiptHdr`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Header),
          });

          if (response.ok) {
            await saveReceiptDetails(receiptNo);
            toast.success(`Customer Receipt Data ${actionValue} Successfully`);

            if (Screens === "Authorized") {
              await InvoiceFsPosting(receiptNo);
            }

          } else {
            const errorResponse = await response.json();
            toast.error("Error updating data: " + errorResponse.message);
          }
        } catch (error) {
          toast.error("Error updating data: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => toast.info(`Data ${actionLabel} cancelled.`)
    );
  };

  const saveReceiptDetails = async (transaction_no) => {
    if (receiptType === 'Invoice Based' && rowData.length > 0) {
      const validRows = rowData.filter(row => row.allocateAmount && parseFloat(row.allocateAmount) > 0);
      
      for (const row of validRows) {
        const detailData = {
          receipt_no: transaction_no,
          invoice_no: row.invoiceNo,
          invoice_date: row.invoiceDate,
          due_date: row.dueDate || null,
          invoice_amount: parseFloat(row.invoiceAmount),
          previous_receipts: parseFloat(row.previousReceipts),
          credit_notes: parseFloat(row.creditNotes),
          outstanding_amount: parseFloat(row.outstanding),
          allocate_amount: parseFloat(row.allocateAmount),
          balance_after: parseFloat(row.balanceAfter),
          company_code: companyCode,
          location_code: sessionStorage.getItem('selectedLocationCode'),
          keyfield_header: `${transaction_no}-${customerCode}-${receiptDate}`,
          keyfield: `${transaction_no}-${row.invoiceNo}`,
          created_by: createdBy
        };

        await fetch(`${config.apiBaseUrl}/addCustomerReceiptInvDet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detailData)
        });
      }
    }
  };

  const handleReload = () => {
    setLoading(true);
    clearAllFields();
    setLoading(false);
  };

  const handleKeyPressReceiptNo = (e) => {
    if (e.key === "Enter") {
        handleReceiptSelect(receiptNo);
    }
};

  return (
    <div className="container-fluid Topnav-screen">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="d-flex justify-content-between">
          <div className="d-flex justify-content-start">
            <h1 align="left" className="purbut me-5">Customer Receipts</h1>
          </div>
          <div className="d-flex justify-content-end purbut me-3 align-items-center">
            
            <div className="exp-form-floating mt-2">
              <Select
                id="returnType"
                className="exp-input-field"
                placeholder="Select Status"
                required
                value={selectedscreens}
                onChange={handleChangeScreens}
                options={filteredOptionScreens}
                classNamePrefix="react-select"
                styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
              />
            </div>
            
            <savebutton className="purbut" title='Save / Update' onClick={handleMasterAction} disabled={loading}>
              <i class="fa-regular fa-floppy-disk"></i>
            </savebutton>
            
            <printbutton className="purbut" title='Reload' onClick={handleReload}>
              <i class="fa-solid fa-arrow-rotate-right"></i>
            </printbutton>
            
          </div>
        </div>
      </div>

      <div className="shadow-lg p-1 bg-body-tertiary rounded pt-3 pb-4" align="left">
        <div className="row ms-3 me-3">
          {/* <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Receipt No <span className="text-danger">*</span></label>
              <input type="text" className="exp-input-field form-control bg-light" value={receiptNo || "Auto Generated"} readOnly />
            </div>
          </div> */}
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>
                Receipt No. <span className="text-danger">*</span>
              </label>

              <div className="d-flex justify-content-end position-relative">
                <input
                    type="text"
                    className="exp-input-field form-control bg-light"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    onKeyPress={handleKeyPressReceiptNo}
                    placeholder="Enter Receipt No"
                    autoComplete="off"
                />

                <div className="position-absolute mt-1 me-2">
                  <span
                    className="icon searchIcon"
                    style={{ cursor: "pointer" }}
                    title="Search Receipt"
                    onClick={() => setOpenReceiptPopup(true)}
                  >
                    <i className="fa fa-search"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label className={`${error && !receiptDate ? 'text-danger' : ''}`}>Receipt Date <span className="text-danger">*</span></label>
              <input type="date" className="exp-input-field form-control" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
            </div>
          </div>
          {/* <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label className={`${error && !financialYear ? 'text-danger' : ''}`}>Financial Year <span className="text-danger">*</span></label>
              <Select className="exp-input-field" classNamePrefix="react-select" value={financialYear} onChange={setFinancialYear} options={financialYearOptions} placeholder="Select..." />
            </div>
          </div> */}
        </div>
      </div>

      <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-2 pb-4" align="left">
        <button className="shadow-lg mb-2 addTab1 text-white border-0" > Customer Details</button>
        <div className="row ms-3 me-3">
          <div className="col-md-2 form-group mb-2">
            <label className={`${error && !customerCode ? 'text-danger' : ''}`}>
              Customer Code {!showAsterisk && <span className="text-danger">*</span>}
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

          <div className="col-md-3 form-group mb-2">
            <div className="exp-form-floating">
              <label>Customer Name</label>
              <input className="exp-input-field form-control bg-light" value={customerName} readOnly />
            </div>
          </div>

          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Customer Type</label>
              <Select className="exp-input-field" classNamePrefix="react-select" value={customerType} onChange={setCustomerType} isDisabled placeholder="Select..." />
            </div>
          </div>

          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>GSTIN</label>
              <input className="exp-input-field form-control bg-light" value={gstin} readOnly />
            </div>
          </div>

          <div className="col-md-3 form-group mb-2">
            <div className="exp-form-floating">
              <label>Contact Person</label>
              <input className="exp-input-field form-control bg-light" value={contactPerson} readOnly />
            </div>
          </div>
        </div>
        
        <div className="row ms-3 me-3 mt-2">
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Credit Limit (₹)</label>
              <input className="exp-input-field form-control text-end bg-light" value={creditLimit} readOnly />
            </div>
          </div>

          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Outstanding (₹)</label>
              <input className="exp-input-field form-control text-end bg-light" value={outstanding} readOnly />
            </div>
          </div>

          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Currency</label>
              <Select className="exp-input-field" classNamePrefix="react-select" value={currency} onChange={setCurrency} isDisabled placeholder="INR" />
            </div>
          </div>
        </div>
      </div>

      <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-2 pb-4" align="left">
        <button className="shadow-lg mb-2 addTab1 text-white border-0" > Receipt Details</button>
        <div className="row ms-3 me-3">
          <div className="col-md-6 form-group mb-2 d-flex align-items-center">
            <label className="me-3">Receipt Type <span className="text-danger">*</span></label>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="receiptType" value="Invoice Based" checked={receiptType === "Invoice Based"} onChange={(e) => setReceiptType(e.target.value)} />
              <label className="form-check-label">Invoice Based</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="receiptType" value="Account Based" checked={receiptType === "Account Based"} onChange={(e) => setReceiptType(e.target.value)} />
              <label className="form-check-label">Account Based</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="receiptType" value="Advance Receipt" checked={receiptType === "Advance Receipt"} onChange={(e) => setReceiptType(e.target.value)} />
              <label className="form-check-label">Advance Receipt</label>
            </div>
          </div>
          
          <div className="col-md-2 ms-auto form-group mb-2">
            <div className="exp-form-floating">
              <label className={`${error && !receivedAmount ? 'text-danger' : ''}`}>Received Amount (₹) <span className="text-danger">*</span></label>
              <input type="number" className="exp-input-field form-control text-end" value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="row ms-3 me-3 mt-2">
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label className={`${error && !paymentMode ? 'text-danger' : ''}`}>Payment Mode <span className="text-danger">*</span></label>
              <Select className="exp-input-field" classNamePrefix="react-select" value={paymentMode} onChange={setPaymentMode} options={paymentModeOptions} placeholder="Select..." />
            </div>
          </div>
          <div className="col-md-4 form-group mb-2">
            <div className="exp-form-floating">
              <label>Bank Account</label>
              <Select className="exp-input-field" classNamePrefix="react-select" value={bankAccCode} onChange={setBankAccCode} options={bankAccOptions} placeholder="Select..." />
            </div>
          </div>
          <div className="col-md-2 ms-auto form-group mb-2">
            <div className="exp-form-floating">
              <label>TDS Deducted (₹)</label>
              <input type="number" className="exp-input-field form-control text-end" value={tdsDeducted} onChange={(e) => setTdsDeducted(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="row ms-3 me-3 mt-2">
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label >Value Date</label>
              <input type="date" className="exp-input-field form-control" value={valueDate} onChange={(e) => setValueDate(e.target.value)} />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Transaction Ref No.</label>
              <input type="text" className="exp-input-field form-control" value={transactionRefNo} onChange={(e) => setTransactionRefNo(e.target.value)} />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Instrument No.</label>
              <input type="text" className="exp-input-field form-control" value={instrumentNo} onChange={(e) => setInstrumentNo(e.target.value)} />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div className="exp-form-floating">
              <label>Instrument Date</label>
              <input type="date" className="exp-input-field form-control" value={instrumentDate} onChange={(e) => setInstrumentDate(e.target.value)} />
            </div>
          </div>
          <div className="col-md-2 ms-auto form-group mb-2">
            <div className="exp-form-floating">
              <label>Bank Charges (₹)</label>
              <input type="number" className="exp-input-field form-control text-end" value={bankCharges} onChange={(e) => setBankCharges(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <SalesVendorPopup open={open2} handleClose={handleClose} handleVendor={handleVendor} />
      <CustomerReceiptPopup
        open={openReceiptPopup}
        handleClose={() => setOpenReceiptPopup(false)}
        handleReceiptSelect={handleReceiptSelect}
      />
      {/* Search Invoice Popup Rendering */}
      <CRInvoicePopup 
        open={openInvoicePopup} 
        handleClose={() => setOpenInvoicePopup(false)} 
        handletaxinvoice={handleInvoiceSelect} 
        invoicetype="Tax Invoice" 
        customerCode={customerCode}
      />

      {receiptType === 'Invoice Based' && (
        <div className="shadow-lg p-1 mt-2 bg-body-tertiary rounded pt-3 pb-4" align="left">
          <div className="ag-theme-alpine ms-3 me-3 mt-2" style={{ height: 250, width: "100%" }}>
            <AgGridReact 
              rowData={rowData}
              columnDefs={columnDefs}
              headerHeight={28}
              rowHeight={25}
              rowSelection="multiple"
              suppressRowClickSelection={true}
              defaultColDef={{ resizable: true }}
            />
          </div>
        </div>
      )}
      
    </div>
  );
}

export default CustomerReceipts;