// COAPopup.js
import { useState, useEffect } from "react";
import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import 'ag-grid-autocomplete-editor/dist/main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

const columnDefs = [
  { headerName: '', field: '', headerCheckboxSelection: true, checkboxSelection: true, maxWidth: 50, sortable: false, filter: false },
  {
    headerName: "Account Code",
    field: "account_code",
    editable: false,
  },
  {
    headerName: "Account Name",
    field: "account_name",
    editable: false,
  },
  {
    headerName: "Account Group",
    field: "account_group",
    editable: false,
  },
  {
    headerName: "Account Class",
    field: "account_class",
    editable: false,
  },
  {
    headerName: "Currency",
    field: "currency_code",
    editable: false,
  },
  {
    headerName: "Control A/c",
    field: "iscontrolaccount",
    editable: false,
    cellRenderer: params => params.value ? 'Yes' : 'No'
  },
  {
    headerName: "Bank A/c",
    field: "isbankaccount",
    editable: false,
    cellRenderer: params => params.value ? 'Yes' : 'No'
  },
  {
    headerName: "Status",
    field: "status",
    editable: false,
  }
];

const defaultColDef = {
  resizable: true,
  wrapText: true,
  sortable: true,
  editable: true,
  filter: true,
};

export default function COAPopup({ open, handleClose, handleCOASelect }) {
  const [rowData, setRowData] = useState([]);
  const [account_code, setAccountCode] = useState("");
  const [account_name, setAccountName] = useState("");
  const [account_group, setAccountGroup] = useState("");
  const [account_class, setAccountClass] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getCOAData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_code,
          account_name,
          account_group,
          account_class,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          location_code: sessionStorage.getItem('selectedLocationCode')
        })
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully");
      } else if (response.status === 404) {
        toast.warning("Data Not Found");
        setRowData([]);
        clearInputs();
        console.log("Data not found");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    clearInputs();
    setRowData([]);
    setSelectedRows([]);
  };

  const clearInputs = () => {
    setAccountCode("");
    setAccountName("");
    setAccountGroup("");
    setAccountClass("");
  };

  const handleRowSelected = (event) => {
    setSelectedRows(event.api.getSelectedRows());
  };

  const handleConfirm = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one Account");
      return;
    }

    const selectedData = selectedRows.map(row => ({
      account_code: row.account_code,
      account_name: row.account_name,
      account_group: row.account_group,
      account_class: row.account_class,
    }));
    
    handleCOASelect(selectedData);
    handleClose();
    clearInputs();
    setRowData([]);
    setSelectedRows([]);
  };

  const handleRowDoubleClick = (params) => {
    const row = params.data;
    if (!row) return;

    const selectedData = [{
      account_code: row.account_code,
      account_name: row.account_name,
      account_group: row.account_group,
      account_class: row.account_class,
    }];

    handleCOASelect(selectedData);
    handleClose();
    clearInputs();
    setRowData([]);
    setSelectedRows([]);
  };

  return (
    <div>
      {open && (
        <fieldset>
          <div>
            <div className="purbut">
              {loading && <LoadingScreen />}
              <div className="modal mt-5 Topnav-screen popup popupadj" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl ps-5 p-1 pe-5" role="document">
                  <div className="modal-content">
                    <div class="row justify-content-center">
                      <div class="col-md-12 text-center">
                        <div className="p-0 bg-body-tertiary">
                          <div className="purbut mb-0 d-flex justify-content-between" >
                            <h1 align="left" className="purbut">Chart of Accounts</h1>
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
                              className='exp-input-field form-control'
                              placeholder='Account Code'
                              value={account_code}
                              onChange={(e) => setAccountCode(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete='off'
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              className='exp-input-field form-control'
                              placeholder='Account Name'
                              value={account_name}
                              onChange={(e) => setAccountName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete='off'
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              className='exp-input-field form-control'
                              placeholder='Account Group'
                              value={account_group}
                              onChange={(e) => setAccountGroup(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete='off'
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              className='exp-input-field form-control'
                              placeholder='Account Class'
                              value={account_class}
                              onChange={(e) => setAccountClass(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete='off'
                            />
                          </div>

                          <div className="mb-2 mt-2 d-flex justify-content-end">
                            <icon className="icon popups-btn" onClick={handleSearch} title="Search">
                              <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </icon>
                            <icon className="icon popups-btn" onClick={handleReload} title="Reload">
                              <i class="fa-solid fa-arrow-rotate-right"></i>
                            </icon>
                            <icon className="icon popups-btn" onClick={handleConfirm} title="Confirm">
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
                            onRowDoubleClicked={handleRowDoubleClick}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile View Replication as per reference */}
            <div className="mobileview">
              <div className="modal mt-5 Topnav-screen" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl ps-4 pe-4 p-1" role="document">
                  <div className="modal-content">
                    <div class="row justify-content-center">
                      <div class="col-md-12 text-center">
                        <div className="mb-0 d-flex justify-content-between">
                          <div className="mb-0 d-flex justify-content-start me-4">
                            <h1 className="h1">Chart of Accounts Help</h1>
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
                              className='exp-input-field form-control'
                              placeholder='Account Code'
                              value={account_code}
                              onChange={(e) => setAccountCode(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete='off'
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              className='exp-input-field form-control'
                              placeholder='Account Name'
                              value={account_name}
                              onChange={(e) => setAccountName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete='off'
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              className='exp-input-field form-control'
                              placeholder='Account Group'
                              value={account_group}
                              onChange={(e) => setAccountGroup(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete='off'
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              className='exp-input-field form-control'
                              placeholder='Account Class'
                              value={account_class}
                              onChange={(e) => setAccountClass(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete='off'
                            />
                          </div>
                          
                          <div className="mb-2 mt-2 d-flex justify-content-end">
                            <button className="" onClick={handleSearch} title="Search">
                              <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </button>
                            <button className="" onClick={handleReload} title="Reload">
                              <i class="fa-solid fa-arrow-rotate-right"></i>
                            </button>
                            <button className="" onClick={handleConfirm} title="Confirm">
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
          </div>
        </fieldset>
      )}
    </div>
  );
}