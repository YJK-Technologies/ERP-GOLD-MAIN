import React, { useState, useRef, useEffect } from "react";
import "./input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from 'ag-grid-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import * as XLSX from 'xlsx';
import labels from "./Labels";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AllocationHelp from "./AssetsHelp";
import AllocationReturnHelp from "./AssetReturnHelp";
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

function AssetsReturn({ }) {
  const [rowData, setRowData] = useState([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', employeeNO: '', serach: '', serialno: '', qty: '', returnQty: '' }]);
  const [Allocationno, setAllocationno] = useState('');
  const [return_no, setreturn_no] = useState('');
  const [return_date, setreturn_date] = useState('');
  const [return_person, setreturn_person] = useState('');
  const [return_reason, setreturn_reason] = useState('');
  const [allocationadate, setallocationadate] = useState('');
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const AlDate = useRef(null);
  const EmployeeNo = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [financialYearStart, setFinancialYearStart] = useState('');
  const [financialYearEnd, setFinancialYearEnd] = useState('');
  const [loading, setLoading] = useState('');

  const handleAllocation = () => {
    setOpen(true);
  };

  const handleReturnAllocation = () => {
    setOpen1(true);
  };

  const handleClose = () => {
    setOpen(false);
    setOpen1(false);
  };

  const [additionalData, setAdditionalData] = useState({
    modified_by: "",
    created_by: "",
    modified_date: "",
    created_date: "",
  });

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    let startYear, endYear;
    if (currentMonth >= 4) {
      startYear = currentYear;
      endYear = currentYear + 1;
    } else {
      startYear = currentYear - 1;
      endYear = currentYear;
    }

    const financialYearStartDate = new Date(startYear, 3, 1).toISOString().split('T')[0];
    const financialYearEndDate = new Date(endYear, 2, 31).toISOString().split('T')[0];

    setFinancialYearStart(financialYearStartDate);
    setFinancialYearEnd(financialYearEndDate);
  }, []);

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const purchasePermission = permissions
    .filter(permission => permission.screen_type === 'AssetsReturn')
    .map(permission => permission.permission_type.toLowerCase());

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber;

    const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);
    setRowData(updatedRowData);

    if (updatedRowData.length === 0) {
      const newRow = {
        serialNumber: 1,
        delete: '',
        itemCode: '',
        itemName: '',
        search: '',
        EmployeeNO: '',
        serialno: '',
        qty: '',
        returnQty: ''
      };
      setRowData([newRow]);

    }
    else {
      const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
        ...row,
        serialNumber: index + 1
      }));
      setRowData(updatedRowDataWithNewSerials);
    }
  };

  function qtyValueSetter(params) {
    const newValue = parseFloat(params.newValue);

    if (isNaN(newValue) || params.newValue.toString().trim() === '' || params.newValue.toString().match(/[^0-9.]/)) {
      toast.warning("Please enter a valid numeric quantity.");
      return false;
    }

    if (isNaN(newValue) || newValue < 0) {
      toast.warning("Return qty cannot be negative!");
      return false;
    }

    if (newValue > params.data.qty) {
      toast.warning("Return qty cannot be greater than the quantity!");
      return false;
    }

    params.data.returnQty = newValue;
    return true;
  }

  const columnDefs = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 80,
      sortable: false,
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 35,
      tooltipValueGetter: (p) =>
        "Delete",
      onCellClicked: handleDelete,
      cellRenderer: function (params) {
        return <FontAwesomeIcon icon="fa-solid fa-trash" style={{ cursor: 'pointer', marginRight: "12px" }} />
      },
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      sortable: false
    },
    {
      headerName: 'Item Code',
      field: 'itemCode',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Item Name',
      field: 'itemName',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: ' Employee No',
      field: 'employeeNO',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Serial No',
      field: 'serialno',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Quantity',
      field: 'qty',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Return Quantity',
      field: 'returnQty',
      editable: true,
      filter: true,
      valueSetter: qtyValueSetter,
      sortable: false
    },
  ];

  const transformRowData = (data) => {
    return data.map(row => ({
      "S.No": row.serialNumber,
      "Item Code": row.itemCode.toString(),
      "Item Name": row.itemName.toString(),
      "Employee No": row.employeeNO.toString(),
      "Quantity": row.qty.toString(),
      "Return Quantity": row.returnQty.toString()
    }));
  };

  const onColumnMoved = (params) => {
    const columnState = JSON.stringify(params.columnApi.getColumnState());
    localStorage.setItem('myColumnState', columnState);
  };

  const onGridReady = (params) => {
    console.log("Grid is ready");
    const columnState = localStorage.getItem('myColumnState');
    if (columnState) {
      params.columnApi.applyColumnState({ state: JSON.parse(columnState) });
    }
  };

  const handleExcelDownload = () => {

    const filteredRowData = rowData.filter(row => row.qty > 0);
    if (rowData.length === 0 || !Allocationno || !allocationadate) {
      toast.warning('No Data Available');
      return;
    }

    const headerData = [{
      "Company Code": sessionStorage.getItem('selectedCompanyCode'),
      "Allocation No": Allocationno,
      "Allocation Date": allocationadate,
      "Return No": return_no,
      "Return Date": return_date,
      "Return Person": return_person,
      "Return Reason": return_reason,
    }];

    const transformedData = transformRowData(filteredRowData);
    const rowDataSheet = XLSX.utils.json_to_sheet(transformedData);
    const headerSheet = XLSX.utils.json_to_sheet(headerData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Assets Allocation Header");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Assets Allocation Details");

    XLSX.writeFile(workbook, "Assets_Allocation_Return.xlsx");
  };

  const handleInsert = async () => {
    if (!allocationadate || !Allocationno || !return_date || !return_person || !return_reason) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    const isAllRowsInvalid = rowData.every(row =>
      !row.itemCode &&
      !row.itemName &&
      !row.employeeNO &&
      !row.serialno &&
      (!row.qty || row.qty === "") &&
      (!row.returnQty || row.returnQty === "")
    );

    if (isAllRowsInvalid || rowData.length === 0) {
      toast.warning("No valid Assets Allocation details found to save.");
      return;
    }
    setLoading(true);

    try {
      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        allocation_date: allocationadate,
        return_date,
        allocation_no: Allocationno,
        return_person,
        return_reason,
        created_by: sessionStorage.getItem('selectedUserCode')
      };

      const response = await fetch(`${config.apiBaseUrl}/addAssertAllocationReturnHdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });
      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ allocation_no }] = searchData;
        setreturn_no(allocation_no);

        const detailSuccess = await AssetsAllocationReturnDetails(allocation_no);
        if (detailSuccess) {
          toast.success("Date inserted successfully.");
        } else {
          toast.warning("Header saved, but failed to save all details.");
        }

        setShowExcelButton(true);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message); // Log error message
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const AssetsAllocationReturnDetails = async (allocation_no) => {
    try {
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName && row.returnQty
      );

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          allocation_no: Allocationno,
          allocation_date: allocationadate,
          return_no: allocation_no,
          return_date,
          return_person,
          return_reason,
          item_SNO: Number(row.serialNumber),
          item_code: row.itemCode,
          item_name: row.itemName,
          Serial_no: row.serialno,
          Quantity: Number(row.qty),
          return_qty: Number(row.returnQty),
          Emp_no: row.employeeNO,
          created_by: sessionStorage.getItem('selectedUserCode')
        };

        const response = await fetch(`${config.apiBaseUrl}/addAssetsAllocationReturnDeatils`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });
        if (!response.ok) {
          const errorResponse = await response.json();
          console.error("Error inserting row:", errorResponse.message);
          toast.warning(errorResponse.message);
          return false;
        }
      }
      console.log("All Assets  Detail Data inserted successfully");
      return true;
    } catch (error) {
      console.error("Error inserting Detail data:", error);
      toast.error('Error inserting data: ' + error.message);
      return false;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlerefno(Allocationno)
    }
  };

  const handlerefno = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getallAssetsAllocation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });
      if (response.ok) {
        setSaveButtonVisible(false)
        setShowExcelButton(true)
        const searchData = await response.json();
        if (searchData.Header && searchData.Header.length > 0) {
          const item = searchData.Header[0];
          setallocationadate(formatDate(item.allocation_date));
          setAllocationno(item.allocation_no);

        } else {
          console.log("Header Data is empty or not found");
          setallocationadate('');
          setAllocationno('');
        }

        if (searchData.Details && searchData.Details.length > 0) {
          const updatedRowData = searchData.Details.map(item => {
            return {
              serialNumber: item.item_SNO,
              itemCode: item.item_code,
              itemName: item.item_name,
              qty: item.Quantity,
              serialno: item.Serial_no,
              employeeNO: item.Emp_no
            };
          });
          setRowData(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', employeeNO: '', serach: '', serialno: '', qty: '', returnQty: '' }]);
        }
        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.warning('Data not found');
        setallocationadate('');
        setAllocationno('');
        setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', employeeNO: '', serach: '', serialno: '', qty: '', returnQty: '' }]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    const serialNumber = rowData.length + 1;
    const newRow = { serialNumber, itemCode: '', itemName: '', serialno: '', warehouse: '', supplier: '', quantityReturned: '', reasonForReturn: '', condition: '', processedBy: '', approvalStatus: '', actionTaken: '', notes: '' };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', serialno: '', warehouse: '', supplier: '', quantityReturned: '', reasonForReturn: '', condition: '', processedBy: '', approvalStatus: '', actionTaken: '', notes: '' }]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };

  const handleAssetsHelp = async (data) => {
    setSaveButtonVisible(false)
    setShowExcelButton(true)
    if (data && data.length > 0) {
      const [{ AllocationNO, AllocationDate }] = data;

      const Allocationno = document.getElementById('rid');
      if (Allocationno) {
        Allocationno.value = AllocationNO;
        setAllocationno(AllocationNO);
      } else {
        console.error('Allocationno element not found');
      }
      const Allocationdate = document.getElementById('billDate');
      if (Allocationdate) {
        Allocationdate.value = AllocationDate;
        setallocationadate(formatDate(AllocationDate));
      } else {
        console.error('Allocationdate  not found');
      }

      await assetsDetails(AllocationNO);

    } else {
      console.log("Data not fetched...!");
    }
  };

  const assetsDetails = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getallassetsdetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: TransactionNo })
      });

      if (response.ok) {
        const searchData = await response.json();

        const newRowData = [];
        searchData.forEach(item => {
          const {
            item_code,
            item_name,
            Serial_no,
            Quantity,
            Emp_no,
            item_SNO

          } = item;

          newRowData.push({
            itemCode: item_code,
            itemName: item_name,
            serialno: Serial_no,
            qty: Quantity,
            employeeNO: Emp_no,
            serialNumber: item_SNO
          });
        });
        setRowData(newRowData);

      } else if (response.status === 404) {
        console.log("Data not found");
        setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', EmployeeNO: '', serialno: '', qty: '' }]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setreturn_date(currentDate);
  }, [currentDate]);

  const handleKeyPressReturn = (e) => {
    if (e.key === 'Enter') {
      handleRefReturn(return_no)
    }
  };

  const handleRefReturn = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getallAssetsAllocationReturn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });
      if (response.ok) {
        setSaveButtonVisible(false);
        setShowExcelButton(true);
        const searchData = await response.json();
        if (searchData.Header && searchData.Header.length > 0) {
          const item = searchData.Header[0];
          setallocationadate(formatDate(item.allocation_date));
          setreturn_date(formatDate(item.return_date));
          setAllocationno(item.allocation_no);
          setreturn_no(item.return_no);
          setreturn_person(item.return_person);
          setreturn_reason(item.return_reason);

        } else {
          console.log("Header Data is empty or not found");
          setallocationadate('');
          setAllocationno('');
          setreturn_date('');
          setreturn_no('');
          setreturn_person('');
          setreturn_reason('');
        }

        if (searchData.Details && searchData.Details.length > 0) {
          const updatedRowData = searchData.Details.map(item => {
            return {
              serialNumber: item.item_SNO,
              itemCode: item.item_code,
              itemName: item.item_name,
              qty: item.Quantity,
              serialno: item.Serial_no,
              employeeNO: item.Emp_no,
              returnQty: item.return_qty
            };
          });
          setRowData(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', employeeNO: '', serach: '', serialno: '', qty: '', returnQty: '' }]);
        }
        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.warning('Data not found');
        setallocationadate('');
        setAllocationno('');
        setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', employeeNO: '', serach: '', serialno: '', qty: '', returnQty: '' }]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const AssetReturnHelp = async (data) => {
    if (data && data.length > 0) {
      setSaveButtonVisible(false);
      setShowExcelButton(true);
      const [{ AllocationNO, AllocationDate, ReturnNo, ReturnDate, ReturnPerson, ReturnReason }] = data;

      const Allocationno = document.getElementById('rid');
      if (Allocationno) {
        Allocationno.value = AllocationNO;
        setAllocationno(AllocationNO);
      } else {
        console.error('Allocationno element not found');
      }

      const Allocationdate = document.getElementById('billDate');
      if (Allocationdate) {
        Allocationdate.value = AllocationDate;
        setallocationadate(formatDate(AllocationDate));
      } else {
        console.error('Allocationdate not found');
      }

      const returnNo = document.getElementById('returnNo');
      if (returnNo) {
        returnNo.value = ReturnNo;
        setreturn_no(ReturnNo);
      } else {
        console.error('ReturnNo not found');
      }

      const returnDate = document.getElementById('returnDate');
      if (returnDate) {
        returnDate.value = ReturnDate;
        setreturn_date(formatDate(ReturnDate));
      } else {
        console.error('returnDate not found');
      }

      const returnPerson = document.getElementById('returnPerson');
      if (returnPerson) {
        returnPerson.value = ReturnPerson;
        setreturn_person(ReturnPerson);
      } else {
        console.error('returnPerson not found');
      }

      const returnReason = document.getElementById('returnReason');
      if (returnReason) {
        returnReason.value = ReturnReason;
        setreturn_reason(ReturnReason);
      } else {
        console.error('returnReason not found');
      }

      await assetsReturnDetails(ReturnNo);

    } else {
      console.log("Data not fetched...!");
    }
  };

  const assetsReturnDetails = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getAssertReturnDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: TransactionNo })
      });

      if (response.ok) {
        const searchData = await response.json();

        const newRowData = [];
        searchData.forEach(item => {
          const {
            item_code,
            item_name,
            Serial_no,
            Quantity,
            Emp_no,
            item_SNO,
            return_qty
          } = item;

          newRowData.push({
            itemCode: item_code,
            itemName: item_name,
            serialno: Serial_no,
            qty: Quantity,
            employeeNO: Emp_no,
            serialNumber: item_SNO,
            returnQty: return_qty
          });
        });
        setRowData(newRowData);

      } else if (response.status === 404) {
        console.log("Data not found");
        setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', EmployeeNO: '', serialno: '', qty: '' }]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  return (
    <div class="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
        <div className="d-flex justify-content-between">
          <div className=" justify-content-start">
            <h1 align="left" className="purbut me-5">
              Asset Allocation Return
            </h1>
          </div>
          <div class="d-flex justify-content-end mb-2 me-3 ">
            {saveButtonVisible && ["add", "all permission"].some((permission) => purchasePermission.includes(permission)) && (
              <savebutton className="purbut" onClick={handleInsert} title="Save">
                <i class="fa-regular fa-floppy-disk"></i>
              </savebutton>
            )}
            <printbutton className="purbut" title="Excel" onClick={handleExcelDownload} style={{ display: showExcelButton ? "block" : "none" }}>
              <i class="fa-solid fa-file-excel"></i>
            </printbutton>
          </div>
          <div className="mobileview">
            <div class=" d-flex justify-content-between ">
              <div className="" style={{ textAlign: "left" }}>
                <h1 className="h1"> Asset Allocation Return</h1>
              </div>
              <div>
                <div class="dropdown mt-2 me-3" >
                  <button class="btn btn-primary dropdown-toggle p-1 ms-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-list"></i>
                  </button>
                  <ul class="dropdown-menu menu">
                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                      {saveButtonVisible && ['add', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                        <icon class="icon" onClick={handleInsert}>
                          <i class="fa-rugular fa-floppy-disk"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton d-flex justify-content-center text-dark">
                      <icon class="icon" onClick={handleExcelDownload} style={{ display: showExcelButton ? 'block' : 'none' }}></icon>
                      <i class="fa-solid fa-file-excel"></i></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow-lg p-1 bg-body-tertiary rounded  pb-4">
        <div class=" mt-4">
          <div className="row ms-3 ">
            <div className="col-md-2 form-group mb-2">
              <label className={`${error && !Allocationno ? "red" : ""}`} class="exp-form-labels"> Allocation No<span className="text-danger">*</span></label>
              <div class="exp-form-floating">
                <div class="d-flex justify-content-end">
                  <input
                    id="rid"
                    class="exp-input-field form-control justify-content-start"
                    type="text"
                    placeholder=""
                    required title="please enter the allocation no"
                    value={Allocationno}
                    onChange={(e) => setAllocationno(e.target.value)}
                    maxLength={20}
                    onKeyPress={handleKeyPress}
                  />
                  <div className='position-absolute mt-1 me-2'>
                    <span className="icon searchIcon"
                      onClick={handleAllocation}>
                      <i class="fa fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-2 form-group mb-2 ">
              <div className="exp-form-floating">
                <label className={`${error && !allocationadate ? "red" : ""}`} class="exp-form-labels">
                  Allocation Date<span className="text-danger">*</span>
                </label>
                <input
                  name="transactionDate"
                  id="billDate"
                  className="exp-input-field form-control"
                  type="date"
                  title="please enter the allocation date"
                  placeholder=""
                  required
                  readOnly
                  value={allocationadate}
                  onChange={(e) => setallocationadate(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="col-md-2 form-group mb-2 ">
              <div className="exp-form-floating">
                <label class="exp-form-labels">Return No</label>
                <div class="d-flex justify-content-end">
                  <input
                    name="transactionDate"
                    id="returnNo"
                    className="exp-input-field form-control justify-content-start"
                    type="text"
                    placeholder=""
                    title="please enter the return no"
                    required
                    value={return_no}
                    onChange={(e) => setreturn_no(e.target.value)}
                    onKeyPress={handleKeyPressReturn}
                    autoComplete="off"
                  />
                  <div className='position-absolute mt-1 me-2'>
                    <span className="icon searchIcon"
                      onClick={handleReturnAllocation}>
                      <i class="fa fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-2 form-group mb-2 ">
              <div className="exp-form-floating">
                <label className={`${error && !return_date ? "red" : ""}`} class="exp-form-labels">
                  Return Date<span className="text-danger">*</span>
                </label>
                <input
                  name="transactionDate"
                  id="returnDate"
                  className="exp-input-field form-control"
                  type="date"
                  placeholder=""
                  title="please enter the return date"
                  required
                  readOnly
                  min={financialYearStart}
                  max={financialYearEnd}
                  value={return_date}
                  onChange={(e) => setreturn_date(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="col-md-2 form-group mb-2 ">
              <div className="exp-form-floating">
                <label className={`${error && !return_person ? "red" : ""}`} class="exp-form-labels">
                  Return Person<span className="text-danger">*</span>
                </label>
                <input
                  name="transactionDate"
                  id="returnPerson"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  title="please enter the return person"
                  required
                  value={return_person}
                  onChange={(e) => setreturn_person(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="col-md-2 form-group mb-2 ">
              <div className="exp-form-floating">
                <label className={`${error && !return_reason ? "red" : ""}`} class="exp-form-labels">
                  Return Reason<span className="text-danger">*</span>
                </label>
                <input
                  name="transactionDate"
                  id="returnReason"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  title="please enter the return reason"
                  required
                  value={return_reason}
                  onChange={(e) => setreturn_reason(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
          <div align="right" class="d-flex justify-content-end mb-2 me-6" style={{ marginRight: "90px" }}>
            <icon type="button" className="popups-btn" onClick={handleAddRow} title="Add row">
              <FontAwesomeIcon icon={faPlus} />
            </icon>
            <icon type="button" className="popups-btn" onClick={handleRemoveRow} title="Less row">
              <FontAwesomeIcon icon={faMinus} />
            </icon>
          </div>
          <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={{ editable: true, resizable: true }}
              onGridReady={onGridReady}
              onColumnMoved={onColumnMoved}
            />
          </div>
          <div>
            <AllocationHelp open={open} handleClose={handleClose} handleAssetsHelp={handleAssetsHelp} />
            <AllocationReturnHelp open={open1} handleClose={handleClose} AssetReturnHelp={AssetReturnHelp} />
          </div>
        </div>
      </div>
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6">{labels.createdBy}: {additionalData.created_by}</p>
            <p className="col-md-6">{labels.createdDate}: {additionalData.created_date}</p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6">{labels.modifiedBy}: {additionalData.modified_by}</p>
            <p className="col-md-6"> {labels.modifiedDate}: {additionalData.modified_date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AssetsReturn;
