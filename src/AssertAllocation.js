import React, { useState, useRef, useEffect } from "react";
import "./input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AgGridReact } from 'ag-grid-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as XLSX from 'xlsx';
import PurchaseItemPopup from "./PurchaseItemPopup";
import EmployeeHelp from './EmployeePopup';
import AllocationHelp from "./AssetsHelp";
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import labels from "./Labels";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

function AssertAllocation({ }) {
  const [rowData, setRowData] = useState([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', EmployeeNO: '', serialno: '', qty: '' }]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [Allocationno, setAllocationno] = useState([]);
  const [allocationadate, setallocationadate] = useState("");
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const AlDate = useRef(null);
  const EmployeeNo = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [global, setGlobal] = useState(null)
  const [globalItem, setGlobalItem] = useState(null)
  const [additionalData, setAdditionalData] = useState({
    modified_by: '',
    created_by: '',
    modified_date: '',
    created_date: ''
  });
  const [financialYearStart, setFinancialYearStart] = useState('');
  const [financialYearEnd, setFinancialYearEnd] = useState('');
  const [showAsterisk, setShowAsterisk] = useState(false);
  const [loading, setLoading] = useState(false);

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
    .filter(permission => permission.screen_type === 'AssertAllocation')
    .map(permission => permission.permission_type.toLowerCase());

  console.log(selectedRows);

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  //Item Name Popup
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);


  const handleClickOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber
    setGlobal(GlobalSerialNumber)
    const GlobalItem = params.data.itemCode
    setGlobalItem(GlobalItem)
    setOpen(true);
    console.log('Opening popup...');
  };

  const handleClose = () => {
    setOpen(false);
    setOpen1(false);
    setOpen2(false);
  };

  const handleOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber
    setGlobal(GlobalSerialNumber)
    const GLobalItem = params.data.itemCode
    console.log(GLobalItem)
    setGlobalItem(GLobalItem)
    setOpen1(true);
    console.log('Opening popup...');
  };


  function qtyValueSetter(params) {
    const newValue = parseFloat(params.newValue);

    if (isNaN(newValue) || params.newValue.toString().trim() === '' || params.newValue.toString().match(/[^0-9.]/)) {
      toast.warning('Please enter a valid numeric quantity.');
      return false;
    }

    if (newValue < 0) {
      toast.warning('Quantity cannot be negative.');
      return false;
    }

    params.data.qty = newValue;
    return true;
  }

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

  const handleEmployeeCode = async (params) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/assetsEmployeeId`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ EmployeeId: params.data.EmployeeNO, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode && row.serialNumber === params.data.serialNumber) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                EmployeeNO: matchedItem.EmployeeId,
              };
            }
          }
          return row;
        });
        setRowData(updatedRowData);
        console.log(updatedRowData);
      } else if (response.status === 404) {
        toast.warning('Data not found!', {
          onClose: () => {
            const updatedRowData = rowData.map(row => {
              if (row.itemCode === params.data.itemCode) {
                return {
                  ...row,
                  EmployeeNO: ''
                };
              }
              return row;
            });
            setRowData(updatedRowData);
          }
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemCode = async (params) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getItemCodeSalesData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Item_code: params.data.itemCode, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                itemCode: matchedItem.Item_code,
                itemName: matchedItem.Item_name
              };
            }
          }
          return row;
        });
        setRowData(updatedRowData);
        console.log(updatedRowData);
        return true;
      } else if (response.status === 404) {
        toast.warning('Data not found!', {
          onClose: () => {
            const updatedRowData = rowData.map(row => {
              if (row.item_code === params.data.item_code) {
                return {
                  ...row,
                  item_code: ''
                };
              }
              return row;
            });
            setRowData(updatedRowData);
          }
        });
        return false;
      } else {
        console.log("Bad request");
        toast.error("There was an issue with your request.");
        return false;
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("An error occurred while fetching the item data.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 100,
      sortable: false,
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 40,
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
      editable: !showExcelButton,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleItemCode(params);
      },
      sortable: false
    },
    {
      headerName: 'Item Name',
      field: 'itemName',
      editable: !showExcelButton,
      filter: true,
      maxLength: 40,
      sortable: false,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 30;
        const showSearchIcon = isWideEnough;

        return (
          <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%' }}>
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
                  if (!showExcelButton) {
                    handleClickOpen(params);
                  }
                }}
              >
                <i className="fa fa-search"></i>
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: ' Employee ID',
      field: 'EmployeeNO',
      editable: !showExcelButton,
      filter: true,
      maxLength: 10,
      sortable: false,
      onCellValueChanged: function (params) {
        handleEmployeeCode(params);
      },
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 30;
        const showSearchIcon = isWideEnough;

        return (
          <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%' }}>
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
                  if (!showExcelButton) {
                    handleOpen(params);
                  }
                }}
              >
                <i className="fa fa-search"></i>
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'Serial No',
      field: 'serialno',
      editable: !showExcelButton,
      filter: true,
      maxLength: 40,
      sortable: false
    },
    {
      headerName: 'Quantity',
      field: 'qty',
      editable: !showExcelButton,
      filter: true,
      sortable: false,
      maxLength: 10,
      valueSetter: qtyValueSetter,
    },

  ];

  const handleAssetsHelp = async (data) => {
    if (data && data.length > 0) {
      setSaveButtonVisible(false);
      setShowExcelButton(true);
      setShowAsterisk(true);
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
            EmployeeNO: Emp_no,
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

  const EmployeeInfo = async (selectedData) => {
    console.log("Selected Data:", selectedData);
    let updatedRowDataCopy = [...rowData];
    let highestSerialNumber = updatedRowDataCopy.reduce((max, row) => Math.max(max, row.serialNumber), 0);

    selectedData.map(item => {
      const existingItemWithSameCode = updatedRowDataCopy.find(row => row.serialNumber === global && row.itemCode === globalItem);

      if (existingItemWithSameCode) {
        console.log("if", existingItemWithSameCode);
        existingItemWithSameCode.EmployeeNO = item.EmployeeId;
        return true;
      }
      else {
        console.log("else");
        highestSerialNumber += 1;
        const newRow = {
          serialNumber: highestSerialNumber,
          EmployeeNO: item.EmployeeId,
        };
        updatedRowDataCopy.push(newRow);
        return true;
      }
    });

    setRowData(updatedRowDataCopy);
    return true;
  };

  const handleItem = async (selectedData) => {
    console.log("Selected Data:", selectedData);
    let updatedRowDataCopy = [...rowData];
    let highestSerialNumber = updatedRowDataCopy.reduce((max, row) => Math.max(max, row.serialNumber), 0);

    selectedData.map(item => {
      const existingItemWithSameCode = updatedRowDataCopy.find(row => row.serialNumber === global && row.itemCode === globalItem);

      if (existingItemWithSameCode) {
        console.log("if", existingItemWithSameCode);
        existingItemWithSameCode.itemCode = item.itemCode;
        existingItemWithSameCode.itemName = item.itemName;
        existingItemWithSameCode.unitWeight = item.unitWeight;
        existingItemWithSameCode.purchaseAmt = item.purchaseAmt;
        existingItemWithSameCode.taxType = item.taxType;
        existingItemWithSameCode.taxDetails = item.taxDetails;
        existingItemWithSameCode.taxPer = item.taxPer;
        return true;
      }
      else {
        console.log("else");
        highestSerialNumber += 1;
        const newRow = {
          serialNumber: highestSerialNumber,
          itemCode: item.itemCode,
          itemName: item.itemName,
          unitWeight: item.unitWeight,
          purchaseAmt: item.purchaseAmt,
          taxType: item.taxType,
          taxDetails: item.taxDetails,
          taxPer: item.taxPer
        };
        updatedRowDataCopy.push(newRow);
        return true;
      }
    });

    setRowData(updatedRowDataCopy);
    return true;
  };

  const transformRowData = (data) => {
    return data.map(row => ({
      "S.No": row.serialNumber,
      "Item Code": row.itemCode.toString(),
      "Item Name": row.itemName.toString(),
      "Employee No": row.EmployeeNO.toString(),
      "Quantity": row.qty.toString(),
      "Serial No": row.serialno.toString()
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

  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex } = params;
    const lastRowIndex = rowData.length - 1;

    if (colDef.field === 'qty' && rowIndex === lastRowIndex) {
      const serialNumber = rowData.length + 1;
      const newRowData = {
        serialNumber, delete: '', itemName: null, unitWeight: null, warehouse: null, purchaseQty: 0, totalWeight: null, purchaseAmt: null, totalAmt: null
      };
      setRowData(prevRowData => [...prevRowData, newRowData]);
    }
  };


  const handleExcelDownload = () => {

    const filteredRowData = rowData.filter(row => row.qty > 0);
    if (rowData.length === 0 || !Allocationno || !allocationadate) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [{
      "Company Code": sessionStorage.getItem('selectedCompanyCode'),
      "Allocation No": Allocationno,
      "Allocation Date": allocationadate
    }];

    const transformedData = transformRowData(filteredRowData);
    const rowDataSheet = XLSX.utils.json_to_sheet(transformedData);
    const headerSheet = XLSX.utils.json_to_sheet(headerData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Assets Allocation Header");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Assets Allocation Details");

    XLSX.writeFile(workbook, "Assets_Allocation.xlsx");
  };

  const handleInsert = async () => {
    if (!allocationadate) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    const isAllRowsInvalid = rowData.every(row =>
      !row.itemCode &&
      !row.itemName &&
      !row.EmployeeNO &&
      !row.serialno &&
      (!row.qty || row.qty === "")
    );

    if (isAllRowsInvalid || rowData.length === 0) {
      toast.warning("No valid Assets Allocation details found to save.");
      return;
    }
    let hasError = false;

    for (let i = 0; i < rowData.length; i++) {
      const row = rowData[i];

      const isRowEmpty =
        !row.itemCode && !row.itemName && !row.EmployeeNO && !row.serialno && (!row.qty || row.qty === "");

      if (isRowEmpty) continue;

      const missingFields = [];

      if (!row.itemCode || row.itemCode.trim() === '') missingFields.push("Item Code");
      if (!row.itemName || row.itemName.trim() === '') missingFields.push("Item Name");
      if (!row.EmployeeNO || row.EmployeeNO.trim() === '') missingFields.push("Employee ID");
      if (!row.serialno || row.serialno.trim() === '') missingFields.push("Serial No");
      if (!row.qty || row.qty.toString().trim() === '' || isNaN(row.qty)) missingFields.push("Quantity");

      if (missingFields.length > 0) {
        toast.warning(`Row ${i + 1}: Missing value in ${missingFields.join(", ")}`);
        hasError = true;
      }
    }

    if (hasError) return;
    setLoading(true);

    try {
      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        allocation_date: allocationadate,
        created_by: sessionStorage.getItem('selectedUserCode')
      };

      const response = await fetch(`${config.apiBaseUrl}/addAssetsAllocationheader`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        const [{ allocation_no }] = searchData;
        setAllocationno(allocation_no);

        const detailSuccess = await AssetsAllocationDetails(allocation_no);
        if (detailSuccess) {
          toast.success("Data inserted successfully.");
        } else {
          toast.warning("Header saved, but failed to save all details.");
        }

        setShowExcelButton(true);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const AssetsAllocationDetails = async (allocation_no) => {
    try {
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName
      );

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          allocation_no: allocation_no,
          allocation_date: allocationadate,
          item_SNO: row.serialNumber.toString(),
          item_code: row.itemCode,
          item_name: row.itemName,
          Serial_no: row.serialno,
          Quantity: Number(row.qty),
          Emp_no: row.EmployeeNO,
          created_by: sessionStorage.getItem('selectedUserCode')
        };

        const response = await fetch(`${config.apiBaseUrl}/addAssetsAllocationDeatils`, {
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
    } catch (err) {
      console.error("Error inserting Detail data:", err);
      toast.error('Error inserting data: ' + err.message);
      return false;
    }
  };

  const handleDeleteHeader = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/AssetsAllocationdeletehdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), allocation_no: Allocationno })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", Allocationno);
        return true
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete header.";
      }
    } catch (error) {
      return "Error deleting header: " + error.message;
    }
  };

  const handleDeleteDetail = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/AssetsAllocationdeleteDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), allocation_no: Allocationno })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", Allocationno);
        return true
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete detail.";
      }
    } catch (error) {
      return "Error deleting detail: " + error.message;
    }
  };

  const handleDeleteButton = async () => {
    if (!Allocationno) {
      setDeleteError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to delete the data ?",
      async () => {
        setLoading(true);
        try {
          const detailResult = await handleDeleteDetail();
          const headerResult = await handleDeleteHeader();

          if (headerResult === true && detailResult === true) {
            console.log("All API calls completed successfully");
            toast.success("Data Deleted Successfully", {
              autoClose: true,
              onClose: () => {
                window.location.reload();
              }
            });
          } else {
            const errorMessage =
              headerResult !== true
                ? headerResult
                : detailResult !== true
                  ? detailResult
                  : "An unknown error occurred.";
            toast.error(errorMessage);
          }
        } catch (error) {
          console.error("Error executing API calls:", error);
          toast.error('Error inserting data: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data deleted cancelled.");
      }
    );
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
        setSaveButtonVisible(false);
        setShowExcelButton(true);
        setShowAsterisk(true);
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
              EmployeeNO: item.Emp_no
            };
          });

          setRowData(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setRowData([{ serialNumber: 1, itemCode: '', itemName: '', qty: '', serialno: '', EmployeeNO: '' }]);
        }

        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.warning('Data not found');
        setallocationadate('');
        setAllocationno('');
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', qty: '', serialno: '', EmployeeNO: '' }]);

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

  const handleKeyDown = async (e, nextFieldRef, value, hasValueChanged, setHasValueChanged) => {
    if (e.key === 'Enter') {
      if (hasValueChanged) {
        await handleKeyDownStatus(e);
        setHasValueChanged(false);
      }

      if (value) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault();
      }
    }
  };

  const handleKeyDownStatus = async (e) => {
    if (e.key === 'Enter' && hasValueChanged) {
      setHasValueChanged(false);
    }
  };

  const handleAllocation = () => {
    setOpen2(true);
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

  const requiredFields = ['S.No', 'Item code', 'Item name', 'Employee no', 'Serial no', 'Quantity'];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const excelHeaders = excelData[0];

        const missingFields = requiredFields.filter((field, index) => field !== excelHeaders[index]);

        if (missingFields.length > 0) {
          toast.error(`Invalid Excel Format. Missing required fields: ${missingFields.join(', ')}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          return;
        }

        const formattedData = excelData.slice(1).map((row) => ({
          serialNumber: row[0],
          itemCode: row[1],
          itemName: row[2],
          EmployeeNO: row[3],
          serialno: row[4],
          qty: row[5],
        }));

        setRowData(formattedData);
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setallocationadate(currentDate);
  }, [currentDate]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (selectedDate >= financialYearStart && selectedDate <= financialYearEnd) {
      if (selectedDate !== currentDate) {
        console.log("Date has been changed.");
      }
      setallocationadate(selectedDate);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
          <div className="d-flex justify-content-between">
            <div className=" d-flex justify-content-start">
              <h1 className="purbut me-5">Assets Allocation</h1>
            </div>
            <div className="d-flex justify-content-end purbut me-3">
              {saveButtonVisible && ['add', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                <savebutton className="purbut" onClick={handleInsert} title='Save' >
                  <i class="fa-regular fa-floppy-disk"></i>
                </savebutton>
              )}
              {['delete', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                <delbutton className="purbut " onClick={handleDeleteButton} title='Delete' >
                  <i class="fa-solid fa-trash"></i>
                </delbutton>
              )}
              {showExcelButton && (
                <printbutton className="purbut" title='Excel' onClick={handleExcelDownload}>
                  <i class="fa-solid fa-file-excel"></i>
                </printbutton>
              )}
              <printbutton className="purbut" title='Reload' onClick={handleReload}>
                <i class="fa-solid fa-arrow-rotate-right"></i>
              </printbutton>
            </div>
            <div class="mobileview">
              <div class="d-flex justify-content-between ">
                <div className="d-flex justify-content-start">
                  <h1 className="h1">Assets Allocation</h1>
                </div>
                <div class="dropdown mt-2 me-3">
                  <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-list"></i>
                  </button>
                  <ul class="dropdown-menu menu">
                    <li class="iconbutton  d-flex justify-content-center text-primary ">
                      {saveButtonVisible && ['add', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                        <icon class="icon" onClick={handleInsert}>
                          <i class="fa-regular fa-floppy-disk"></i>
                        </icon>
                      )}
                    </li>
                    <li class="iconbutton  d-flex justify-content-center text-danger">
                      {['delete', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                        <icon class="icon" onClick={handleDeleteButton}>
                          <i class="fa-solid fa-user-minus"></i>
                        </icon>
                      )}
                    </li>
                    {showExcelButton && (
                      <li class="iconbutton  d-flex justify-content-center text-info">
                        <icon class="icon" onClick={handleExcelDownload}>
                          <i class="fa-solid fa-file-excel"></i>
                        </icon>
                      </li>
                    )}
                    <li class="iconbutton  d-flex justify-content-center">
                      <icon class="icon" onClick={handleReload}>
                        <i class="fa-solid fa-arrow-rotate-right"></i>
                      </icon>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded  pt-3 pb-4">
          <div className="row  ms-3 mt-3 me-3">
            <div className="col-md-3 form-group mb-2">
              <label for="rid" className={`${deleteError && !Allocationno ? "red" : ""}`} class="exp-form-labels">Allocation No{showAsterisk && <span className="text-danger">*</span>}</label>
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
                      onClick={handleAllocation} title="Assets Help">
                      <i class="fa fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group mb-2 ">
              <label className={`${error && !allocationadate ? "red" : ""}`} class="exp-form-labels">
                Allocation Date{!showAsterisk && <span className="text-danger">*</span>}
              </label>
              <div className="exp-form-floating">
                <input
                  name="AllocationDate"
                  id="billDate"
                  className="exp-input-field form-control"
                  type="date"
                  placeholder=""
                  required
                  title="please enter the allocation date"
                  value={allocationadate}
                  onChange={handleDateChange}
                  autoComplete="off"
                  ref={AlDate}
                  onKeyDown={(e) => handleKeyDown(e, EmployeeNo, AlDate)}
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label htmlFor="">Excel</label>
                <input
                  className="exp-input-field form-control"
                  type="file"
                  required
                  title="please upload the excel"
                  accept=".xlsx, .xls"
                  autoComplete="off"
                  ref={AlDate}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>
          <div align="right" class="d-flex justify-content-end mb-2" style={{ marginRight: "90px" }}>
            <icon
              type="button"
              className="popups-btn"
              title="Add row"
              onClick={handleAddRow}>
              <FontAwesomeIcon icon={faPlus} />
            </icon>
            <icon
              type="button"
              className="popups-btn"
              title="Less row"
              onClick={handleRemoveRow}>
              <FontAwesomeIcon icon={faMinus} />
            </icon>
          </div>
          <div className="purbut ag-theme-alpine" style={{ height: 437, width: "100%" }}>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={{ editable: true, resizable: true }}
              onGridReady={onGridReady}
              onColumnMoved={onColumnMoved}
              onCellValueChanged={async (event) => {
                handleCellValueChanged(event);
              }}
            />
          </div>
          <div className="mobileview ag-theme-alpine ms-4 pe-4" style={{ height: 437, width: "100%" }}>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={{ editable: true, resizable: true }}
              onCellValueChanged={async (event) => {
                handleCellValueChanged(event);
              }}
              onGridReady={onGridReady}
              onColumnMoved={onColumnMoved}
            />
          </div>
          <PurchaseItemPopup open={open} handleClose={handleClose} handleItem={handleItem} />
          <EmployeeHelp open={open1} handleClose={handleClose} EmployeeInfo={EmployeeInfo} />
          <AllocationHelp open={open2} handleClose={handleClose} handleAssetsHelp={handleAssetsHelp} />
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
export default AssertAllocation;