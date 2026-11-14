//JournalVoucher.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Select from 'react-select';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// IMPORT YOUR POPUP HERE
import COAPopup from './COAPopup';
import JVPopup from './JVPopup';
const config = require('./Apiconfig'); 

function JournalVoucher() {
  const gridRef = useRef(null);

  // 1. Header State Variables
  const [voucherNo, setVoucherNo] = useState("");
  const [voucherDate, setVoucherDate] = useState("");
  const [voucherType, setVoucherType] = useState({ label: 'Journal', value: 'Journal' });
  const [currency, setCurrency] = useState({ label: 'INR', value: 'INR' });
  const [exchangeRate, setExchangeRate] = useState(1);
  const [refNo, setRefNo] = useState("");
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAsterisk, setShowAsterisk] = useState(false);

  // Popup State Variables
  const [openCOAPopup, setOpenCOAPopup] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);

  const [openJVPopup, setOpenJVPopup] = useState(false);

  // Live Totals State
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });

  // Status Dropdown State Variables
  const [screensDrop, setScreensDrop] = useState([]);
  const [Screens, setScreens] = useState("");
  const [selectedscreens, setSelectedscreens] = useState(null);

  const companyCode = sessionStorage.getItem('selectedCompanyCode');
  const createdBy = sessionStorage.getItem('selectedUserCode') || 'Admin';
  const locationCode = sessionStorage.getItem('selectedLocationCode');

  // Dropdown Options
  const currencyOptions = [{ label: 'INR', value: 'INR' }, { label: 'USD', value: 'USD' }];
  const voucherTypeOptions = [{ label: 'Journal', value: 'Journal' }, { label: 'Adjustment', value: 'Adjustment' }];
  const costCenterOptions = ['Head Office', 'Branch', 'Select'];

    const [rowData, setRowData] = useState([
    { accountCode: '', accountName: '', description: '', drCrFlag: 'Dr', amount: '', costCenter: 'Select' }
  ]);

  // 2. Fetch Status Events (Dropdown Options)
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code: companyCode }),
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
  }, [companyCode]);

  const handleChangeScreens = (selected) => {
    setSelectedscreens(selected);
    setScreens(selected.value);
  };

  const filteredOptionScreens = screensDrop.map((option) => ({
    value: option.descriptions,
    label: option.attributedetails_name,
  }));

  // 3. Grid Columns & Calculations
  const calculateTotals = useCallback(() => {
    let drTotal = 0;
    let crTotal = 0;
    
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.forEachNode((node) => {
        const amt = parseFloat(node.data.amount) || 0;
        if (node.data.drCrFlag === 'Dr') drTotal += amt;
        if (node.data.drCrFlag === 'Cr') crTotal += amt;
      });
    } else {
      rowData.forEach(row => {
        const amt = parseFloat(row.amount) || 0;
        if (row.drCrFlag === 'Dr') drTotal += amt;
        if (row.drCrFlag === 'Cr') crTotal += amt;
      });
    }

    setTotals({ debit: drTotal, credit: crTotal });
  }, [rowData]);

  // const accountCodeRenderer = (params) => {
  //   return (
  //     <div className="position-relative d-flex align-items-center" style={{ minHeight: "100%" }}>
  //       <div className="flex-grow-1">
  //         <input 
  //           type="text" 
  //           className="form-control" 
  //           value={params.value || ""}
  //           onChange={(e) => params.setValue(e.target.value)}
  //           style={{ width: "100%", height: "28px", fontSize: "13px" }}
  //         />
  //       </div>
  //       <span
  //         className="icon searchIcon"
  //         style={{ position: "absolute", right: "5px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
  //         onClick={() => {
  //           // Store the row index so we know which row to update later
  //           setCurrentRowIndex(params.node.rowIndex);
  //           setOpenCOAPopup(true);
  //         }}
  //       >
  //         <i className="fa fa-search text-secondary"></i>
  //       </span>
  //     </div>
  //   );
  // };

  // Handle COA Selection from Popup


const accountCodeRenderer = (params) => {
  const cellWidth = params.column.getActualWidth();
  const isWideEnough = cellWidth > 30;
  const showSearchIcon = isWideEnough;

  return (
    <div
      className="position-relative d-flex align-items-center"
      style={{ minHeight: '100%' }}
    >
      <div className="flex-grow-1">
        {params.editing ? (
          <input
            type="text"
            className="form-control"
            value={params.value || ''}
            onChange={(e) => params.setValue(e.target.value)}
            style={{ width: '100%' }}
          />
        ) : (
          params.value
        )}
      </div>

      {showSearchIcon && (
        <span
          className="icon searchIcon"
          style={{
            position: 'absolute',
            right: '-10px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
          onClick={() => {
            setCurrentRowIndex(params.node.rowIndex);
            setOpenCOAPopup(true);
          }}
        >
          <i className="fa fa-search"></i>
        </span>
      )}
    </div>
  );
};

const handleCOASelect = (selectedData) => {
    if (selectedData && selectedData.length > 0 && currentRowIndex !== null) {
      const selectedAccount = selectedData[0]; 
      
      const updatedRowData = [...rowData];
      updatedRowData[currentRowIndex] = {
        ...updatedRowData[currentRowIndex],
        accountCode: selectedAccount.account_code,
        accountName: selectedAccount.account_name,
      };
      
      setRowData(updatedRowData);
    }
  };

  const handleAddRow = () => {
    const newRow = {
      accountCode: '', 
      accountName: '', 
      description: '', 
      drCrFlag: 'Dr', 
      amount: '', 
      costCenter: 'Select'
    };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([
          { accountCode: '', accountName: '', description: '', drCrFlag: 'Dr', amount: '', costCenter: 'Select' }
        ]);
      } else {
        setRowData(updatedRowData);
      }
      setTimeout(calculateTotals, 50); 
    }
  };

  const columnDefs = [
    { headerName: 'S.No', valueGetter: "node.rowIndex + 1", maxWidth: 70, sortable: false, filter: false },
    { headerName: 'Account Code', field: 'accountCode', minWidth: 160, cellRenderer: accountCodeRenderer },
    { headerName: 'Account Name', field: 'accountName', minWidth: 180, editable: true },
    { headerName: 'Description (Remarks)', field: 'description', minWidth: 200, editable: true },
    { 
      headerName: 'Dr/Cr', 
      field: 'drCrFlag', 
      minWidth: 90, 
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['Dr', 'Cr'] }
    },
    { headerName: 'Amount (₹)', field: 'amount', type: 'rightAligned', minWidth: 120, editable: true },
    { 
      headerName: 'Cost Center', 
      field: 'costCenter', 
      minWidth: 130, 
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: costCenterOptions }
    }
  ];

  // 4. Save & Update Master Actions
  const handleMasterAction = () => {
    if (Screens === "Draft") {
      handleSaveButtonClick();
    } else if (Screens && Screens.trim() !== "") {
      handleUpdateButtonClick();
    } else {
      toast.warning("Please select a valid transaction event from the dropdown.");
    }
  };

  const validatePayload = () => {
    if (!voucherDate) {
      setError(" ");
      toast.warning("Error: Missing required fields (Voucher Date)");
      return null;
    }
    const validRows = rowData.filter((row) => row.accountCode && parseFloat(row.amount) > 0);
    if (validRows.length === 0) {
      toast.warning("No valid line items found. Enter Account Code and Amount.");
      return null;
    }
    if (totals.debit !== totals.credit) {
      toast.warning(`Total Debit (${totals.debit}) and Total Credit (${totals.credit}) must be equal.`);
      return null;
    }
    return validRows;
  };

  const handleSaveButtonClick = async () => {
    const validRows = validatePayload();
    if (!validRows) return;

    setLoading(true);
    try {
      const Header = {
        company_code: companyCode,
        location_code: locationCode,
        jv_date: voucherDate,
        fin_year: "", 
        fin_period: "", 
        voucher_type: voucherType?.value,
        currency: currency?.value,
        exch_rate: Number(exchangeRate),
        reference_no: refNo,
        narration: narration,
        total_dr_amount: totals.debit,
        total_cr_amount: totals.credit,
        status: Screens === "Modified" ? "Draft" : Screens,
        created_by: createdBy
      };

      const response = await fetch(`${config.apiBaseUrl}/addJournalVoucherHeader`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        const generatedJVNo = searchData[0].transaction_no;
        setVoucherNo(generatedJVNo);

        await saveJournalVoucherDetails(generatedJVNo, validRows);
        toast.success("Journal Voucher Inserted Successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert JV data");
      }
    } catch (error) {
      toast.error("Error inserting data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateButtonClick = async () => {
    if (!voucherNo) {
      toast.warning("Error: Missing JV number for Update");
      return;
    }
    const validRows = validatePayload();
    if (!validRows) return;

    const actionLabel = selectedscreens?.label || "data";

    showConfirmationToast(
      `Are you sure you want to ${actionLabel} the data?`,
      async () => {
        setLoading(true);
        try {
          const Header = {
            company_code: companyCode,
            location_code: locationCode,
            jv_no: voucherNo,
            jv_date: voucherDate,
            fin_year: "",
            fin_period: "",
            voucher_type: voucherType?.value,
            currency: currency?.value,
            exch_rate: Number(exchangeRate),
            reference_no: refNo,
            narration: narration,
            total_dr_amount: totals.debit,
            total_cr_amount: totals.credit,
            status: Screens === "Modified" ? "Draft" : Screens,
            modified_by: createdBy
          };

          const response = await fetch(`${config.apiBaseUrl}/updJournalVoucherHeader`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Header),
          });

          if (response.ok) {
            await fetch(`${config.apiBaseUrl}/deleteJournalVoucherDetailByJvNo`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ company_code: companyCode, jv_no: voucherNo })
            });

            await saveJournalVoucherDetails(voucherNo, validRows);
            toast.success(`Journal Voucher Data ${selectedscreens?.value || "Updated"} Successfully`);
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

  const saveJournalVoucherDetails = async (transaction_no, validRows) => {
    try {
      let lineCounter = 1;
      for (const row of validRows) {
        const Details = {
          company_code: companyCode,
          location_code: locationCode,
          jv_no: transaction_no,
          line_no: lineCounter++,
          account_no: row.accountCode,
          drcr_flag: row.drCrFlag,
          tran_amount: parseFloat(row.amount),
          base_amount: parseFloat(row.amount) * Number(exchangeRate),
          cost_center: row.costCenter !== 'Select' ? row.costCenter : '',
          remarks: row.description,
          created_by: createdBy
        };

        const response = await fetch(`${config.apiBaseUrl}/addJournalVoucherDetail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Details)
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || `Failed to insert detail line ${lineCounter - 1}`);
        }
      }
    } catch (error) {
      console.error("Error inserting details data:", error);
      toast.error("Error inserting detail data: " + error.message);
    }
  };

  const handleReload = () => {
    setLoading(true);
    setVoucherNo("");
    setVoucherDate("");
    setRefNo("");
    setNarration("");
    setExchangeRate(1);
    setTotals({ debit: 0, credit: 0 });
    setRowData([{ accountCode: '', accountName: '', description: '', drCrFlag: 'Dr', amount: '', costCenter: 'Select' }]);
    setLoading(false);
  };

  // Centralized Fetch Function
  const handleJVSelect = async (selectedVoucherNo) => {
    if (!selectedVoucherNo) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getJVData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jv_no: selectedVoucherNo,
          jv_date: "",
          status: "",
          company_code: companyCode
        })
      });

      if (response.ok) {
        const searchData = await response.json();
        // Exact match filter to avoid partial SQL matches
        const data = searchData.filter(item => item.jv_no === selectedVoucherNo);
        
        if (data && data.length > 0) {
          const header = data[0]; 
          
          setVoucherNo(header.jv_no || "");
          setVoucherDate(header.jv_date ? new Date(header.jv_date).toISOString().split('T')[0] : "");
          setVoucherType({ label: header.voucher_type, value: header.voucher_type });
          setCurrency({ label: header.currency, value: header.currency });
          setExchangeRate(header.exch_rate || 1);
          setRefNo(header.reference_no || "");
          setNarration(header.hdr_narration || "");
          
          const matchedScreen = filteredOptionScreens.find(opt => opt.value === header.status);
          if (matchedScreen) setSelectedscreens(matchedScreen);

          const detailsGridRows = data.map((item) => ({
            accountCode: item.account_no || '',
            accountName: item.account_name || '', 
            description: item.dtl_remarks || '',
            drCrFlag: item.drcr_flag || 'Dr',
            amount: item.tran_amount || 0,
            costCenter: item.cost_center || 'Select'
          }));

          setRowData(detailsGridRows);
          setTimeout(calculateTotals, 100);
          setOpenJVPopup(false); // Close popup if it was open
          toast.success("Journal Voucher Fetched Successfully");
        } else {
          toast.warning("Voucher Number not found");
          handleReload();
        }
      } else {
        toast.warning("Data Not Found");
        handleReload();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Trigger for Enter Key
  const handleKeyPressVoucherNo = (e) => {
    if (e.key === "Enter") {
      handleJVSelect(voucherNo);
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      
      {/* Top Header Section */}
      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="d-flex justify-content-between">
          <div className="d-flex justify-content-start">
            <h1 align="left" className="purbut me-5 ms-2 mt-1">Journal Voucher</h1>
          </div>
          <div className="d-flex justify-content-end purbut me-3 align-items-center">
            
            <div className="exp-form-floating mt-2" style={{ minWidth: '150px' }}>
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
            
            <savebutton className="purbut ms-3" title='Save / Update' onClick={handleMasterAction} disabled={loading}>
              <i className="fa-regular fa-floppy-disk"></i>
            </savebutton>
            
            <printbutton className="purbut ms-3" title='Reload' onClick={handleReload}>
              <i className="fa-solid fa-arrow-rotate-right"></i>
            </printbutton>
            
          </div>
        </div>
      </div>

      {/* Form Fields Section */}
      <div className="shadow-sm p-3 bg-white rounded pt-3 pb-2" align="left">
        <div className="row ms-1 me-1 mb-3">
          
          <div className="col-md-2 mb-2">
            <div className="exp-form-floating">
              {/* <label>
                Voucher No <span className="text-danger">*</span>
              </label> */}
              <label
                          for="cno"
                          class="exp-form-labels"
                          className={`${error && !voucherNo ? "text-danger" : ""}`}
                        >
                          Voucher No<span className="text-danger">*</span>
                        </label>
              <div className="d-flex justify-content-end position-relative">
                <input 
                  type="text" 
                  className="exp-input-field form-control bg-light" 
                  value={voucherNo} 
                  onChange={(e) => setVoucherNo(e.target.value)}
                  onKeyPress={handleKeyPressVoucherNo}
                  placeholder="" 
                  autoComplete="off"
                />
                <div className="position-absolute mt-1 me-2">
                  <span 
                    className="icon searchIcon" 
                    style={{ cursor: "pointer" }} 
                    title="Search Voucher"
                    onClick={() => setOpenJVPopup(true)}
                  >
                    <i className="fa fa-search"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-2 mb-2">
            <div className="exp-form-floating">
              {/* <label>Voucher Date <span className="text-danger">*</span></label> */}
              <label htmlFor="" className={`${error && !voucherDate ? 'red' : ''}`}>Voucher Date{!showAsterisk && <span className="text-danger">*</span>}</label>
              <input type="date" className="exp-input-field form-control" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} />
            </div>
          </div>

          <div className="col-md-2 mb-2">
            <div className="exp-form-floating">
              <label>Voucher Type</label>
              <Select 
                className="exp-input-field" 
                classNamePrefix="react-select" 
                value={voucherType} 
                onChange={setVoucherType} 
                options={voucherTypeOptions} 
                isClearable
              />
            </div>
          </div>
          
          <div className="col-md-2 mb-2">
            <div className="exp-form-floating">
              <label>Reference No</label>
              <input type="text" className="exp-input-field form-control" value={refNo} onChange={(e) => setRefNo(e.target.value)} />
            </div>
          </div>

          <div className="col-md-2 mb-2">
            <div className="exp-form-floating">
              <label>Currency</label>
              <Select 
                className="exp-input-field" 
                classNamePrefix="react-select" 
                value={currency} 
                onChange={setCurrency} 
                options={currencyOptions} 
                isClearable
              />
            </div>
          </div>

          <div className="col-md-2 mb-2">
            <div className="exp-form-floating">
              <label>Exchange Rate</label>
              <input 
                type="number" 
                step="0.01"
                className="exp-input-field form-control" 
                value={exchangeRate} 
                onChange={(e) => setExchangeRate(e.target.value)} 
              />
            </div>
          </div>

        </div>

        <div className="row ms-1 me-1 mb-2">
          <div className="col-md-6">
            <div className="exp-form-floating">
              <label>Narration (Header)</label>
              <input type="text" className="exp-input-field form-control" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Overall voucher description" />
            </div>
          </div>
        </div>
      </div>

      {/* AG-Grid Section */}
      <div className="shadow-sm p-3 mt-3 bg-white rounded" align="left">
        
        <div className="d-flex justify-content-between mb-2 align-items-center">
          <h5 className="mb-0 text-secondary">Line Items</h5>
          
          <div className="d-flex justify-content-end align-items-center" style={{ marginRight: "15px" }}>
            <icon
              type="button"
              className="popups-btn m-0 me-2"
              title="Add Row"
              onClick={handleAddRow}
              style={{ cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </icon>
            
            <icon
              type="button"
              className="popups-btn m-0"
              title="Remove Row"
              onClick={handleRemoveRow}
              style={{ cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={faMinus} />
            </icon>
          </div>
        </div>

        <div className="ag-theme-alpine" style={{ height: 250, width: "100%" }}>
          <AgGridReact 
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            headerHeight={28}
            rowHeight={25}
            rowSelection="multiple"
            suppressRowClickSelection={true}
            defaultColDef={{ resizable: true }}
            onCellValueChanged={calculateTotals}
            onRowDataUpdated={calculateTotals}
            stopEditingWhenCellsLoseFocus={true}
          />
        </div>

        {/* Live Totals Display */}
        <div className="d-flex justify-content-end mt-3 border-top pt-2 pe-3">
          <div className="me-5">
            <span className="text-secondary fw-bold me-2">Total Debit :</span>
            <span className={`fw-bold fs-5 ${totals.debit !== totals.credit ? 'text-danger' : 'text-success'}`}>
              {totals.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-secondary fw-bold me-2">Total Credit :</span>
            <span className={`fw-bold fs-5 ${totals.debit !== totals.credit ? 'text-danger' : 'text-success'}`}>
              {totals.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
      
      {/* Chart of Accounts Popup Component */}
      <COAPopup 
        open={openCOAPopup} 
        handleClose={() => setOpenCOAPopup(false)} 
        handleCOASelect={handleCOASelect} 
      />

      <JVPopup 
        open={openJVPopup} 
        handleClose={() => setOpenJVPopup(false)} 
        handleJVSelect={handleJVSelect} 
      />

    </div>
  );
}

export default JournalVoucher;