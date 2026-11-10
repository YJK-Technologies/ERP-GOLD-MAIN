// JVPopup.js
import { useState } from "react";
import * as React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify';
import LoadingScreen from './Loading'; 

const config = require('./Apiconfig');

const columnDefs = [
  { headerName: '', field: '', headerCheckboxSelection: true, checkboxSelection: true, maxWidth: 50, sortable: false, filter: false },
  { headerName: "Voucher No", field: "jv_no", editable: false, minWidth: 180 },
  { headerName: "Voucher Date", field: "jv_date", editable: false, minWidth: 150, valueFormatter: params => params.value ? new Date(params.value).toISOString().split('T')[0] : '' },
  { headerName: "Voucher Type", field: "voucher_type", editable: false, minWidth: 150 },
  { headerName: "Currency", field: "currency", editable: false, minWidth: 120 },
  { headerName: "Total Debit", field: "total_dr_amount", editable: false, type: 'rightAligned', minWidth: 150 },
  { headerName: "Total Credit", field: "total_cr_amount", editable: false, type: 'rightAligned', minWidth: 150 },
  { headerName: "Status", field: "status", editable: false, minWidth: 120 }
];

const defaultColDef = { resizable: true, wrapText: true, sortable: true, filter: true };

export default function JVPopup({ open, handleClose, handleJVSelect }) {
  const [rowData, setRowData] = useState([]);
  const [fullJoinedData, setFullJoinedData] = useState([]);
  
  const [jvNo, setJvNo] = useState("");
  const [jvDate, setJvDate] = useState("");
  const [status, setStatus] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getJVData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jv_no: jvNo,
          jv_date: jvDate,
          status: status,
          company_code: sessionStorage.getItem('selectedCompanyCode')
        })
      });
      
      if (response.ok) {
        const searchData = await response.json();
        setFullJoinedData(searchData); 

        // Extract unique headers only for grid display to avoid messy repeated lines
        const uniqueHeaders = [];
        const map = new Map();
        for (const item of searchData) {
            if (!map.has(item.jv_no)) {
                map.set(item.jv_no, true);
                uniqueHeaders.push(item);
            }
        }
        setRowData(uniqueHeaders);
      } else if (response.status === 404) {
        toast.warning("Data Not Found");
        handleReload();
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to fetch JV data");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    setJvNo("");
    setJvDate("");
    setStatus("");
    setRowData([]);
    setFullJoinedData([]);
    setSelectedRows([]);
  };

  const handleRowSelected = (event) => setSelectedRows(event.api.getSelectedRows());

//   const processSelection = (selectedHeader) => {
//     // Filter the full joined array to return the header + all its detail lines
//     const allLinesForJV = fullJoinedData.filter(x => x.jv_no === selectedHeader.jv_no);
//     handleJVSelect(allLinesForJV);
//     closePopup();
//   };
  const processSelection = (selectedHeader) => {
    // Only pass the JV Number string to parent
    handleJVSelect(selectedHeader.jv_no); 
  };

  const handleConfirm = () => {
    if (selectedRows.length === 0) return toast.warning("Please select a Voucher");
    processSelection(selectedRows[0]);
  };

  const handleRowDoubleClick = (params) => {
    if (!params.data) return;
    processSelection(params.data);
  };

  const closePopup = () => {
    handleClose();
    handleReload();
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
                    
                    <div className="row justify-content-center">
                      <div className="col-md-12 text-center">
                        <div className="p-0 bg-body-tertiary">
                          <div className="purbut mb-0 d-flex justify-content-between">
                            <h1 align="left" className="purbut">Journal Voucher Help</h1>
                            <button onClick={closePopup} className="purbut btn btn-danger shadow-none rounded-0 h-70 fs-5" title="Close">
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="modal-body">
                        <div className="row ms-3 me-3">
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              className='exp-input-field form-control'
                              placeholder='Voucher No'
                              value={jvNo}
                              onChange={(e) => setJvNo(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              autoComplete='off'
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='date'
                              className='exp-input-field form-control'
                              value={jvDate}
                              onChange={(e) => setJvDate(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                          </div>
                          <div className="col-md-2 mb-2">
                            <input
                              type='text'
                              className='exp-input-field form-control'
                              placeholder='Status'
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
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
                            <h1 className="h1">Journal Voucher Help</h1>
                          </div>
                          <div className="mb-0 d-flex justify-content-end" >
                            <button onClick={closePopup} className="closebtn2" title="Close">
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="modal-body">
                        <div className="row ms-3 me-3">
                          <div className="col-md-12 mb-2">
                            <input
                              type='text'
                              className='exp-input-field form-control'
                              placeholder='Voucher No'
                              value={jvNo}
                              onChange={(e) => setJvNo(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                          </div>
                          <div className="col-md-12 mb-2">
                            <input
                              type='date'
                              className='exp-input-field form-control'
                              value={jvDate}
                              onChange={(e) => setJvDate(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
          </div>
        </fieldset>
      )}
    </div>
  );
}