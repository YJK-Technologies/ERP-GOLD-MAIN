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
import LoadingScreen from './Loading';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select'
const config = require('./Apiconfig');



const columnDefs = [
  {
    headerCheckboxSelection: true,
    checkboxSelection: true,
    headerName: "Transaction No",
    field: "transaction_no",
    editable: false,
    //minWidth: 250,
    //maxWidth: 250,
  },
  {
    headerName: "Transaction Date",
    field: "transaction_date",
    editable: false,
    //minWidth: 160,
    //maxWidth: 160,
    valueFormatter: params => format(new Date(params.value), 'yyyy-MM-dd'),
  },
  {
    headerName: "Entry Date",
    field: "Entry_date",
    editable: false,
    //minWidth: 160,
    //maxWidth: 160,
    valueFormatter: params => format(new Date(params.value), 'yyyy-MM-dd'),
  },
  {
    headerName: "Vendor Code",
    field: "vendor_code",
    editable: false,
    //minWidth: 135,
    //maxWidth: 200,
  },
  {
    headerName: "Vendor Name",
    field: "vendor_name",
    editable: false,
    //minWidth: 140,
    //maxWidth: 200,
  },
  {
    headerName: "Purchase Type",
    field: "purchase_type",
    editable: false,
    //minWidth: 150,
    //maxWidth: 200,
  },
  {
    headerName: "Pay Type",
    field: "pay_type",
    editable: false,
    //minWidth: 120,
    //maxWidth: 200,
  },
  {
    headerName: " Amount",
    field: "purchase_amount",
    editable: false,
    //minWidth: 110,
    //maxWidth: 200,
    valueFormatter: params => parseFloat(params.value).toFixed(2),
  },
  {
    headerName: "Round Off",
    field: "rounded_off",
    editable: false,
    //minWidth: 140,
    //maxWidth: 140,
  },
  {
    headerName: "Tax Amount",
    field: "tax_amount",
    editable: false,
    //minWidth: 130,
    //maxWidth: 200,
    valueFormatter: params => parseFloat(params.value).toFixed(2),
  },
  {
    headerName: "Key Field",
    field: "keyfield",
    editable: false,
    //minWidth: 120,
    //maxWidth: 200,
    hide: true
  },
  {
    headerName: "Total Amount",
    field: "total_amount",
    editable: false,
    //minWidth: 130,
    //maxWidth: 200,
    valueFormatter: params => parseFloat(params.value).toFixed(2),
  },
];


const defaultColDef = {
  resizable: true,
  wrapText: true,
  sortable: true,
  editable: true,
  // flex: 1,
  filter: true,
};
export default function ItemPopup({ open, handleClose, handleItem }) {

  const [rowData, setRowData] = useState([]);
  const [transaction_no, settransaction_no] = useState("");
  const [transaction_date, settransaction_date] = useState("");
  const [vendor_code, setvendor_code] = useState("");
  const [vendor_name, setvendor_name] = useState("");
  const [purchase_type, setpurchase_type] = useState("");
  const [pay_type, setpay_type] = useState("");
  const [loading, setLoading] = useState(false);

  // For Dropdown field
    const [selected, setSelected] = useState(null);
    const [purchaseType, setPurchaseType] = useState("");
    const [status, setStatus] = useState([]);
    const [purchasedrop, setPurchasedrop] = useState([]);
  
    const [selectedPay, setselectedPay] = useState('');
    const [payType, setPayType] = useState("");
    const [paydrop, setPaydrop] = useState([]);
  
    const handleChangePurchase = (selected) => {
      setSelected(selected);
      setPurchaseType(selected ? selected.value : '');
      setStatus('Typing...');
    };
  
    const filteredOptionPurchase = purchasedrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }));
  
    const handleChangePay = (selectedPay) => {
      setselectedPay(selectedPay);
      setPayType(selectedPay ? selectedPay.value : '');
    };
  
    const filteredOptionPay = paydrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }));
  
    useEffect(() => {
      const companyCode = sessionStorage.getItem('selectedCompanyCode');
  
      fetch(`${config.apiBaseUrl}/paytype`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: companyCode,
        }),
      })
        .then((response) => response.json())
        .then((data) => setPaydrop(data))
        .catch((error) => console.error("Error fetching payment types:", error));
  
      fetch(`${config.apiBaseUrl}/purchasetype`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: companyCode,
        }),
      })
  
        .then((response) => response.json())
        .then((data) => setPurchasedrop(data))
        .catch((error) => console.error("Error fetching purchase types:", error));
  
    }, []);

  const handleSearch = async () => {
        setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/getpursearchdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code:sessionStorage.getItem("selectedCompanyCode"), 
          transaction_no, transaction_date, vendor_code, vendor_name, purchase_type: purchaseType, pay_type: payType }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log(searchData)
        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.warning('Data not found')
        setRowData([]);
        clearInputs([])
        console.log("Data not found");
      } else {
        console.log("Bad request"); 
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }finally {
      setLoading(false);
    }
  };


  const handleReload = () => {
    clearInputs([])
    setRowData([])
  };

  const clearInputs = () => {
    settransaction_no("");
    settransaction_date("");
    setvendor_code("");
    setvendor_name("");
    setpurchase_type("");
    setpay_type("");
  };

  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowSelected = (event) => {
    setSelectedRows(event.api.getSelectedRows());
  };

  const handleConfirm = () => {
    const selectedData = selectedRows.map(row => ({
      TransactionNo: row.transaction_no,
      TransactionDate: row.transaction_date,
      PurchaseType: row.purchase_type,
      PayType: row.pay_type,
      TotalTax: row.tax_amount,
      TotalAmount: row.total_amount,
      VendorName: row.vendor_name,
      Amount: row.purchase_amount,
      Vendorcode: row.vendor_code,
      Entrydate: row.Entry_date
    }));
    console.log('Selected Data:', selectedData);
    handleItem(selectedData);
    handleClose();
    clearInputs([]);
    setRowData([]);
    setSelectedRows([]);
  }

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
                    <div class="row justify-content-center">
                      <div class="col-md-12 text-center">
                        <div className="p-0 bg-body-tertiary">
                          <div className="purbut mb-0 d-flex justify-content-between" >
                            <h1 align="left" className="purbut">Purchase Help</h1>
                            <button onClick={handleClose} className="purbut btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
                            <i class="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                          <div class="d-flex justify-content-between">
                            <div className="d-flex justify-content-start">
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="modal-body">
                        <div className="row ms-3 me-3">
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              id='transaction_no'
                              className='exp-input-field form-control'
                              title='Enter the Transaction No'
                              placeholder='Transaction No'
                              value={transaction_no}
                              onChange={(e) => settransaction_no(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='date'
                              id='transaction_date'
                              className='exp-input-field form-control'
                              title='Enter the Transaction Date'
                              placeholder='Transaction Date'
                              value={transaction_date}
                              onChange={(e) => settransaction_date(e.target.value)}
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              id='vendor_code'
                              className='exp-input-field form-control'
                              title='Enter the Vendor Code'
                              placeholder='Vendor Code'
                              value={vendor_code}
                              onChange={(e) => setvendor_code(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              id='vendor_code'
                              className='exp-input-field form-control'
                              title='Enter the Vendor Name'
                              placeholder='Vendor Name'
                              value={vendor_name}
                              onChange={(e) => setvendor_name(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete="off"
                            />
                          </div>

                          <div className="col-md-2 mb-2">
                            <div class="exp-form-floating">
                              <div title="Select a Purchase Type">
                                <Select
                                  id="purchaseType"
                                  value={selected}
                                  onChange={handleChangePurchase}
                                  options={filteredOptionPurchase}
                                  className="exp-input-field"
                                  placeholder="Purchase"
                                  isClearable
                                />
                              </div>
                            </div>
                          </div>

                          <div className="col-md-2 mb-2">
                            <div class="exp-form-floating">
                              <div title="Select a Pay Type">
                                <Select
                                  id="paytype"
                                  value={selectedPay}
                                  onChange={handleChangePay}
                                  options={filteredOptionPay}
                                  className="exp-input-field"
                                  placeholder="Pay Type"
                                  required
                                  data-tip="Please select a Pay Type"
                                  isClearable
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mb-2 mt-2 d-flex justify-content-end">
                            <icon className="icon popups-btn" title="Search" onClick={handleSearch}>
                              <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </icon>
                            <icon className="icon popups-btn" title="Reload" onClick={handleReload}>
                              <i class="fa-solid fa-arrow-rotate-right"></i>
                            </icon>
                            <icon className="icon popups-btn" title="Confirm" onClick={handleConfirm}>
                              <FontAwesomeIcon icon="fa-solid fa-check" />
                            </icon>
                          </div>
                        </div>
                        <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
                          <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowSelection="multiple"
                            pagination='true'
                            onSelectionChanged={handleRowSelected}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mobileview">
              <div className="modal mt-5 Topnav-screen" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl ps-4 pe-4 p-1" role="document">
                  <div className="modal-content">
                    <div class="row justify-content-center">
                      <div class="col-md-12 text-center">
                        <div className="mb-0 d-flex justify-content-between">
                          <div className="mb-0 d-flex justify-content-start me-4">
                            <h1 className="h1">Purchase Help</h1>
                          </div>
                          <div className="mb-0 d-flex justify-content-end" >
                            <button onClick={handleClose} className="closebtn2" required title="Close">
                            <i class="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        </div>
                        <div class="d-flex justify-content-between">
                          <div className="d-flex justify-content-start">
                          </div>
                        </div>
                      </div>
                      <div className="modal-body">
                        <div className="row ms-3 me-3">
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              id='transaction_no'
                              className='exp-input-field form-control'
                              placeholder='Transaction No'
                              value={transaction_no}
                              onChange={(e) => settransaction_no(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='date'
                              id='transaction_date'
                              className='exp-input-field form-control'
                              placeholder='Transaction Date'
                              value={transaction_date}
                              onChange={(e) => settransaction_date(e.target.value)}
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              id='vendor_code'
                              className='exp-input-field form-control'
                              placeholder='Vendor Code'
                              value={vendor_code}
                              onChange={(e) => setvendor_code(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              id='vendor_code'
                              className='exp-input-field form-control'
                              placeholder='Vendor Name'
                              value={vendor_name}
                              onChange={(e) => setvendor_name(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete="off"
                            />
                          </div>

                          <div className="col-md-2 mb-2">
                            <div class="exp-form-floating">
                              <div title="select a payment type">
                                <Select
                                  id="purchaseType"
                                  value={selected}
                                  onChange={handleChangePurchase}
                                  options={filteredOptionPurchase}
                                  className="exp-input-field"
                                  placeholder="Purchase Type"
                                  isClearable
                                />
                              </div>
                            </div>
                          </div>

                          <div className="col-md-2 mb-2">
                            <div class="exp-form-floating">
                              <div title="select a payment type">
                                <Select
                                  id="paytype"
                                  value={selectedPay}
                                  onChange={handleChangePay}
                                  options={filteredOptionPay}
                                  className="exp-input-field"
                                  placeholder="Pay Type"
                                  required
                                  data-tip="Please select a payment type"
                                  isClearable
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mb-2 mt-2 d-flex justify-content-end">
                            <button className="" onClick={handleSearch}>
                              <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </button>
                            <button className="" onClick={handleReload}>
                              <i class="fa-solid fa-arrow-rotate-right"></i>
                            </button>
                            <button className="" onClick={handleConfirm}>
                              <FontAwesomeIcon icon="fa-solid fa-check" />
                            </button>
                          </div>
                          <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
                            <AgGridReact
                              rowData={rowData}
                              columnDefs={columnDefs}
                              defaultColDef={defaultColDef}
                              rowSelection="multiple"
                              pagination='true'
                              onSelectionChanged={handleRowSelected}
                            />
                          </div>
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
