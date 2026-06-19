import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import "./apps.css";
import "./input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import 'ag-grid-autocomplete-editor/dist/main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select'
import "./mobile.css";
import './mobile.css';
import * as XLSX from 'xlsx';
import InventoryReturnItemPopup from './InvReturnItemPopup';
import InventoryReturnWarehousePopup from './InvReturnWarehousePopup';
import InvReturnPopup from './InvReturnPopup';
import labels from './Labels';
import { ToastContainer, toast } from 'react-toastify';
import { showConfirmationToast } from './ToastConfirmation';
import 'react-toastify/dist/ReactToastify.css';
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

const UnplannedReturn = () => {

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const returnPermission = permissions
    .filter(permission => permission.screen_type === 'UnplannedReturn')
    .map(permission => permission.permission_type.toLowerCase());

  const [rowData, setRowData] = useState([{ serialNumber: 1, itemCode: '', itemName: '', serialno: '', warehouse: '', supplier: '', quantityReturned: '', reasonForReturn: '', condition: '', processedBy: '', approvalStatus: '', actionTaken: '', notes: '' }]);
  const [rowDataTax, setRowDataTax] = useState([]);
  const [activeTable, setActiveTable] = useState('myTable');
  const [global, setGlobal] = useState(null)
  const [globalItem, setGlobalItem] = useState(null)
  const [returnType, setReturnType] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnId, setReturnId] = useState('');
  const [returnDrop, setReturnDrop] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
  const [warehouseType, setWarehouseType] = useState('');
  const [warehouseDrop, setWarehouseDrop] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [conddropdown, setconddropdown] = useState(null);
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
  const [warehouse, setWarehouse] = useState('');

  useEffect(() => {
    const companyCode = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/Condition`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_code: companyCode,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const dpt = data.map(option => option.attributedetails_name);
        setconddropdown(dpt);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const companyCode = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/getInventoryTransaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_code: companyCode,
      }),
    })
      .then((response) => response.json())
      .then((data) => setReturnDrop(data))
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

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

    const financialYearStartDate = new Date(startYear, 3, 1).toISOString().split('T')[0]; // April 1
    const financialYearEndDate = new Date(endYear, 2, 31).toISOString().split('T')[0]; // March 31

    setFinancialYearStart(financialYearStartDate);
    setFinancialYearEnd(financialYearEndDate);
  }, []);

  const filteredOptionReturn = returnDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getwarehousedrop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(setWarehouseDrop)
      .catch((error) => console.error("Error fetching warehouse:", error));
  }, []);

  const filteredOptionWarehouse = warehouseDrop.map((option) => ({
    value: option.warehouse_code,
    label: option.warehouse_code,
  }));

  const handleChangeReturn = (selected) => {
    setSelectedReturn(selected);
    setReturnType(selected ? selected.value : '');
  };

  const handleChangeWarehouse = (selectedOption) => {
    setSelectedWarehouse(selectedOption);
    setWarehouse(selectedOption ? selectedOption.value : '');
  };

  const handleToggleTable = (table) => {
    setActiveTable(table);
  };

  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber;

    const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);

    setRowData(updatedRowData);

    if (updatedRowData.length === 0) {
      const newRow = {
        serialNumber: 1,
        itemCode: '',
        itemName: '',
        warehouse: '',
        supplier: '',
        quantityReturned: '',
        reasonForReturn: '',
        condition: '',
        processedBy: '',
        approvalStatus: '',
        actionTaken: '',
        notes: '',
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


  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex, newValue } = params;
    const lastRowIndex = rowData.length - 1;

    if (colDef.field === 'quantityReturned') {
      const quantity = parseFloat(newValue);

      if (quantity > 0 && rowIndex === lastRowIndex) {
        const serialNumber = rowData.length + 1;
        const newRowData = {
          serialNumber,
          itemCode: '',
          itemName: '',
          warehouse: '',
          supplier: '',
          quantityReturned: 0,
          reasonForReturn: '',
          condition: '',
          processedBy: '',
          approvalStatus: '',
          actionTaken: '',
          notes: '',
        };

        setRowData(prevRowData => [...prevRowData, newRowData]);
      }
    }
  };

  //ITEM CODE TO SEARCH IN AG GRID
  const handleItemCode = async (params) => {
    setLoading(true);
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    try {
      const response = await fetch(`${config.apiBaseUrl}/getitemcodepurdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code, Item_code: params.data.itemCode })
      });


      if (response.ok) {
        const searchData = await response.json();
        const updatedRow = rowData.map(row => {
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                itemCode: matchedItem.Item_code,
                itemName: matchedItem.Item_name,
                unitWeight: matchedItem.Item_wigh,
                purchaseAmt: matchedItem.Item_std_purch_price,
                taxType: matchedItem.Item_purch_tax_type,
                taxDetails: matchedItem.combined_tax_details,
                taxPer: matchedItem.combined_tax_percent,
                warehouse: selectedWarehouse ? selectedWarehouse.value : '',
              };
            }
          }
          return row;
        });
        setRowData(updatedRow);
        console.log(updatedRow);
      } else if (response.status === 404) {
        toast.warning('Data not found!', {
          onClose: () => {
            const updatedRowData = rowData.map(row => {
              if (row.itemCode === params.data.itemCode) {
                return {
                  ...row,
                  itemCode: '',
                  itemName: '',
                  unitWeight: 0,
                  purchaseAmt: 0,
                  taxType: '',
                  taxDetails: '',
                  taxPer: '',
                  warehouse: ''
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

  //WAREHOUSE CODE TO SEARCH IN AG GRID
  const handleWarehouseCode = async (params) => {
    const itemDetailsSet = rowData.some(
      (row) => row.itemCode === params.data.itemCode && row.itemName
    );

    if (!itemDetailsSet) {
      toast.warning("Please fetch item details first before setting the warehouse.")
      const updatedRowData = rowData.map((row) => {
        if (row.itemCode === params.data.itemCode) {
          return {
            ...row,
            warehouse: "",
          };
        }
        return row;
      });
      setRowData(updatedRowData);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/getWarehouseCodeData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ warehouse_code: params.data.warehouse, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                warehouse: matchedItem.warehouse_code,
              };
            }
          }
          return row;
        });
        setRowData(updatedRowData);
        console.log(updatedRowData);
      } else if (response.status === 404) {
        toast.warning('Data not found!')
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode) {
            return {
              ...row,
              warehouse: ''
            };
          }
          return row;
        });
        setRowData(updatedRowData);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  //Item Popup
  const handleClickOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber
    setGlobal(GlobalSerialNumber)
    const GlobalItem = params.data.itemCode
    setGlobalItem(GlobalItem)
    setOpen(true);
    console.log('Opening popup...');
  };

  //Warehouse Popup
  const handleOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber
    setGlobal(GlobalSerialNumber)
    const GLobalItem = params.data.itemCode
    console.log(GLobalItem)
    setGlobalItem(GLobalItem)
    setOpen1(true);
    console.log('Opening popup...');
  };

  //Item Name Popup
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
    setOpen1(false);
    setOpen2(false);
  };


  const columnDefs = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 80,
      sortable: false
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 25,
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
      // maxWidth: 140,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleItemCode(params);
      },
      sortable: false,
    },
    {
      headerName: 'Item Name',
      field: 'itemName',
      editable: false,
      // maxwidth: 150,
      filter: true,
      cellEditorParams: {
        maxLength: 40,
      },
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
                onClick={() => handleClickOpen(params)}
              >
                <i className="fa fa-search"></i>
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'Warehouse',
      field: 'warehouse',
      editable: !showExcelButton,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleWarehouseCode(params);
      },
      sortable: false,
      autoComplete: false,
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
                onClick={() => handleOpen(params)}
              >
                <i className="fa fa-search"></i>
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'Supplier',
      field: 'supplier',
      editable: true,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Serial No',
      field: 'SerialNo',
      editable: true,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Qty',
      field: 'quantityReturned',
      editable: true,
      filter: true,
      sortable: false,
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: 'Reason',
      field: 'reasonForReturn',
      editable: true,
      filter: true,
      sortable: false
    },
    // {
    //   headerName: 'Condition',
    //   field: 'condition',
    //   editable: true,
    //   maxWidth: 315,
    //   filter: true,
    //   sortable: false,
    //   cellEditor: "agSelectCellEditor",
    //   cellEditorParams: {
    //     maxLength: 18,
    //     values: conddropdown
    //   },
    // },
    {
      headerName: 'Processed By',
      field: 'processedBy',
      editable: true,
      filter: true,
      sortable: false
    },
    // {
    //   headerName: 'Approval Status',
    //   field: 'approvalStatus',
    //   editable: true,
    //   filter: true,
    //   maxWidth: 315,
    //   sortable: false,
    // },
    // {
    //   headerName: 'Action Taken',
    //   field: 'actionTaken',
    //   editable: true,
    //   maxWidth: 315,
    //   filter: true,
    //   sortable: false
    // },
    // {
    //   headerName: 'Notes',
    //   field: 'notes',
    //   editable: true,
    //   maxWidth: 315,
    //   filter: true,
    //   sortable: false
    // },
  ];

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
        existingItemWithSameCode.warehouse = selectedWarehouse ? selectedWarehouse.value : '';
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
          taxPer: item.taxPer,
          warehouse: selectedWarehouse ? selectedWarehouse.value : '',
        };
        updatedRowDataCopy.push(newRow); // Push the new row to the updatedRowDataCopy
        return true;
      }
    });

    setRowData(updatedRowDataCopy);
    return true;
  };


  const handleWarehouse = (data) => {
    console.log('Data received by handleWarehouse:', data);

    const itemDetailsSet = rowData.some(
      (row) => row.itemCode === globalItem && row.itemName
    );

    if (!itemDetailsSet) {
      toast.warning("Please fetch item details first before setting the warehouse.")

      const updatedRowData = rowData.map((row) => {
        if (row.itemCode === globalItem) {
          return {
            ...row,
            warehouse: "",
          };
        }
        return row;
      });
      setRowData(updatedRowData);
      return;
    }

    const updatedRowData = rowData.map(row => {
      if (row.serialNumber === global) {
        console.log('1st if condition met, row:', row);
        const matchedItem = data.find(item => item.id === row.id);

        if (matchedItem) {
          console.log('2nd if condition met, matchedItem:', matchedItem);
          return {
            ...row,
            warehouse: matchedItem.warehouse
          };
        } else {
          console.log('No matching item found for row.id:', row.id);
        }
      } else {
        console.log('No match for row.serialNumber:', row.serialNumber, global);
      }
      return row;
    });

    setRowData(updatedRowData);
  };


  const handleSaveButtonClick = async () => {
    if (!returnDate || !returnType) {
      setError(" ");
      toast.warning("Missing required fields");
      return;
    }

    if (rowData.length === 0) {
      toast.warning("No Inventory Return Details found to save.");
      return;
    }

    const filteredRowData = rowData.filter(
      (row) => Number(row.quantityReturned) > 0
    );

    if (filteredRowData.length === 0) {
      toast.warning("Please check Quantity Returned");
      return;
    }

    const invalidRowExists = filteredRowData.some(
      (row) =>
        !row.itemCode?.trim() ||
        !row.warehouse?.trim() ||
        row.quantityReturned === "" ||
        isNaN(Number(row.quantityReturned))
    );

    if (invalidRowExists) {
      toast.warning("Some rows contain missing or invalid data. Please fix them before saving.");
      return;
    }
    setLoading(true);

    try {
      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        DateReturned: returnDate,
        Return_Type: returnType,
        created_by: sessionStorage.getItem('selectedUserCode')
      };

      const response = await fetch(`${config.apiBaseUrl}/addInventoryReturnheader`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ ReturnID }] = searchData;
        setReturnId(ReturnID);
        setShowExcelButton(true);
        await InventoryReturnDetails(ReturnID);
        toast.success("Data Inserted Successfully")
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message); // Log error message
        toast.error(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const InventoryReturnDetails = async (ReturnID) => {
    try {
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName && row.quantityReturned > 0
      );

      for (const row of validRows) {
        const Details = {
          created_by: sessionStorage.getItem('selectedUserCode'),
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          ReturnID: ReturnID,
          DateReturned: returnDate,
          Warehouse: row.warehouse,
          Supplier: row.supplier,
          ItemSNo: row.serialNumber,
          ItemCode: row.itemCode,
          ItemName: row.itemName,
          Serial_no: row.serialno,
          QuantityReturned: Number(row.quantityReturned),
          ReasonForReturn: row.reasonForReturn,
          Condition: row.condition,
          ProcessedBy: row.processedBy,
          ApprovalStatus: row.approvalStatus,
          ActionTaken: row.actionTaken,
          Notes: row.notes,
        };

        const response = await fetch(`${config.apiBaseUrl}/addInventoryReturndetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          console.error(errorResponse.message); // Log error message
          toast.error(errorResponse.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  const handleDeleteButtonClick = async () => {
    if (!returnId) {
      setDeleteError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }

    showConfirmationToast(
      "Are you sure you want to delete the data ?",
      async () => {
        setLoading(true);
        try {
          const detailResult = await InventoryDetailDelete();
          const headerResult = await InventoryHeaderDelete();

          if (headerResult = true && detailResult === true) {
            console.log("All API calls completed successfully");
            toast.success("Successfully Deleted", {
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

  const InventoryHeaderDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/inventoryReturnHeaderDelete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ReturnID: returnId, company_code: sessionStorage.getItem("selectedCompanyCode") })

      });
      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete header.";
      }
    } catch (error) {
      return "Error deleting header: " + error.message;
    }
  };

  const InventoryDetailDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/InventoryReturnDeleteDetailData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ReturnID: returnId, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });
      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete detail.";
      }
    } catch (error) {
      return "Error deleting detail: " + error.message;
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleReturnId(returnId)
    }
  };

  const handleReturnId = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getInventoryReturn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        setSaveButtonVisible(false);
        setShowExcelButton(true);
        setShowAsterisk(true)
        const searchData = await response.json();
        if (searchData.Header && searchData.Header.length > 0) {
          const item = searchData.Header[0];
          setReturnDate(formatDate(item.DateReturned));
          setReturnId(item.ReturnID);
          const selectedReturn = filteredOptionReturn.find(option => option.value === item.Return_Type);
          setSelectedReturn(selectedReturn);

        } else {
          console.log("Header Data is empty or not found");
          setReturnDate('');
          setReturnId('');
          setReturnType('')
        }

        if (searchData.Detail && searchData.Detail.length > 0) {
          const updatedRowData = searchData.Detail.map(item => {

            return {
              serialNumber: item.ItemSNo,
              itemCode: item.ItemCode,
              itemName: item.ItemName,
              warehouse: item.Warehouse,
              supplier: item.Supplier,
              quantityReturned: item.QuantityReturned,
              reasonForReturn: item.ReasonForReturn,
              condition: item.Condition,
              processedBy: item.ProcessedBy,
              approvalStatus: item.ApprovalStatus,
              actionTaken: item.ActionTaken,
              notes: item.Notes,
              SerialNo: item.Serial_No
            };
          });

          setRowData(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setRowData([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', purchaseQty: '', ItemTotalWight: '', purchaseAmt: '', TotalTaxAmount: '', TotalItemAmount: '' }]);
        }

        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.warning('Data not found');

        setReturnDate('');
        setReturnId('');
        setReturnType('');
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', purchaseQty: '', ItemTotalWight: '', purchaseAmt: '', TotalTaxAmount: '', TotalItemAmount: '' }]);

      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!returnId) {
      setDeleteError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    setLoading(true);

    try {
      const headerData = await PrintHeaderData();
      const detailData = await PrintDetailData();

      if (headerData && detailData) {
        console.log("All API calls completed successfully");

        sessionStorage.setItem('IRheaderData', JSON.stringify(headerData));
        sessionStorage.setItem('IRdetailData', JSON.stringify(detailData));

        window.open('/InvReturnPrint', '_blank');
      } else {
        console.log("Failed to fetch some data");
        toast.warning("Transaction ID Does Not Exits");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const PrintHeaderData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/InventoryReturnHeaderPrint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: returnId, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        return searchData;
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const PrintDetailData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/InventoryReturnDetailPrint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: returnId, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        return searchData;
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleInvReturn = () => {
    setOpen2(true);
  };

  const InvReturnData = async (data) => {
    setSaveButtonVisible(false)
    setShowExcelButton(true)
    setShowAsterisk(true)
    if (data && data.length > 0) {
      const [{ ReturnID, DateReturned, Return_Type }] = data;

      const returnID = document.getElementById('returnId');
      if (returnID) {
        returnID.value = ReturnID;
        setReturnId(ReturnID);
      } else {
        console.error('ReturnID element not found');
      }

      const dateReturned = document.getElementById('returnDate');
      if (dateReturned) {
        dateReturned.value = DateReturned;
        setReturnDate(formatDate(DateReturned));
      } else {
        console.error('returnDate element not found');
      }

      const returnType = document.getElementById('returnType');
      if (returnType) {
        const selectedReturn = filteredOptionReturn.find(option => option.value === Return_Type);
        setSelectedReturn(selectedReturn); // You can choose to use `formattedDate` instead if required
      } else {
        console.error('returnType element not found');
      }

      await InventoryReturn(ReturnID);

    } else {
      console.log("Data not fetched...!");
    }
  };

  const InventoryReturn = async (ReturnID) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getInventoryReturnDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: ReturnID })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];
        searchData.forEach(item => {
          const { Warehouse, Supplier, ItemSNo, ItemCode, ItemName, QuantityReturned, ReasonForReturn, Condition, ProcessedBy, ApprovalStatus, ActionTaken, Serial_no, Notes } = item;
          newRowData.push({
            serialNumber: ItemSNo,
            itemCode: ItemCode,
            itemName: ItemName,
            warehouse: Warehouse,
            supplier: Supplier,
            quantityReturned: QuantityReturned,
            reasonForReturn: ReasonForReturn,
            condition: Condition,
            processedBy: ProcessedBy,
            approvalStatus: ApprovalStatus,
            actionTaken: ActionTaken,
            notes: Notes,
            SerialNo: Serial_no

          });
        });
        setRowData(newRowData)
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  // const handleUpdateButtonClick = async () => {

  //   if (!returnId || !returnDate || !selectedReturn) {
  //     setError(" ");
  //     toast.warning("Please select the Atlest one row to update ");
  //     return;
  //   }

  //   if (rowData.length === 0) {
  //     toast.warning("No Inventory Return found to save.");
  //     return;
  //   }

  //   const filteredRowData = rowData.filter((row) => row.quantityReturned > 0);

  //   const hasNullWarehouse = filteredRowData.some((row) => !row.warehouse || row.warehouse.trim() === "");
  //   if (hasNullWarehouse) {
  //     toast.warning("One or more rows have a null or empty warehouse.");
  //     return;
  //   }

  //   if (filteredRowData.length === 0) {
  //     toast.warning("Please check Quantity Returned");
  //     return;
  //   }

  //   try {

  //     const [detailResult] = await Promise.all([
  //       handleDeleteUpdateDetail()
  //     ]);

  //     if (!detailResult) {
  //       throw new Error('Detail deletion failed');
  //     }

  //     await Promise.all([
  //       updateInvReturnDetails()
  //     ]);

  //     toast.success("Inventory Return Upadated Successfully");

  //     console.log('Update successful');
  //   } catch (error) {
  //     console.error('Update failed:', error);
  //   }
  // };
  // const handleDeleteUpdateDetail = async () => {
  //   try {
  //     const response = await fetch(`${config.apiBaseUrl}/InventoryReturnDeleteDetailData`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({ ReturnID: returnId })
  //     });
  //     if (response.ok) {
  //       return true
  //     } else {
  //       console.log("Failed to fetch some data");
  //     }
  //   } catch (error) {
  //     console.error("Error executing API calls:", error);
  //   }
  // };
  // const updateInvReturnDetails = async () => {
  //   try {
  //     // Filter out invalid rows (empty or incomplete rows)
  //     const validRows = rowData.filter(row =>
  //       row.itemCode && row.itemName && row.quantityReturned > 0
  //     );

  //     for (const row of validRows) {
  //       const Details = {
  //         created_by: sessionStorage.getItem('selectedUserCode'),
  //         ReturnID: returnId,
  //         DateReturned: returnDate,
  //         Warehouse: row.warehouse,
  //         Supplier: row.supplier,
  //         ItemSNo: row.serialNumber,
  //         ItemCode: row.itemCode,
  //         ItemName: row.itemName,
  //         QuantityReturned: Number(row.quantityReturned),
  //         ReasonForReturn: row.reasonForReturn,
  //         Condition: row.condition,
  //         ProcessedBy: row.processedBy,
  //         ApprovalStatus: row.approvalStatus,
  //         ActionTaken: row.actionTaken,
  //         Notes: row.notes,
  //       };

  //       const response = await fetch(`${config.apiBaseUrl}/addInventoryReturndetails`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(Details),
  //       });

  //       if (response.ok) {
  //         console.log("Inventory Return Data updated successfully");
  //         return true;
  //       } else {
  //         const errorResponse = await response.json();
  //         console.error(errorResponse.message); // Log error message
  //         toast.error(errorResponse.message);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error inserting data:", error);
  //     toast.error('Error inserting data: ' + error.message);
  //   }
  // };

  const transformRowData = (data) => {
    return data.map(row => ({
      "S.No": row.serialNumber,
      "Item Code": row.itemCode.toString(),
      "Item Name": row.itemName.toString(),
      "Warehouse": row.warehouse.toString(),
      "Supplier": row.supplier.toString(),
      "Quantity Returned": row.quantityReturned.toString(),
      "Reason For Return": row.reasonForReturn.toString(),
      "Condition": row.condition.toString(),
      "Processed By": row.processedBy.toString(),
      "Approval Status": row.approvalStatus.toString(),
      "Action Taken": row.actionTaken.toString(),
      "Notes": row.notes.toString(),
    }));
  };


  const handleExcelDownload = () => {

    const filteredRowData = rowData.filter(row => row.quantityReturned > 0);
    console.log(selectedReturn)
    if (rowData.length === 0 || !returnId || !returnDate || !selectedReturn) {
      toast.warning('No Data Available');
      return;
    }

    const headerData = [{
      "Company Code": sessionStorage.getItem('selectedCompanyCode'),
      "Transaction ID": returnId,
      "Transaction Date": returnDate,
      "Transaction Type": selectedReturn.value,
    }];

    const transformedData = transformRowData(filteredRowData);
    const rowDataSheet = XLSX.utils.json_to_sheet(transformedData);
    const headerSheet = XLSX.utils.json_to_sheet(headerData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Details Data");

    XLSX.writeFile(workbook, "Inventory_Return.xlsx");
  };

  const handleAddRow = () => {
    const serialNumber = rowData.length + 1;
    const newRow = { serialNumber, itemCode: '', itemName: '', serialno: '', warehouse: selectedWarehouse ? selectedWarehouse.value : '', supplier: '', quantityReturned: '', reasonForReturn: '', condition: '', processedBy: '', approvalStatus: '', actionTaken: '', notes: '' };
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

  //Default Date functionality
  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setReturnDate(currentDate);
  }, [currentDate]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (selectedDate >= financialYearStart && selectedDate <= financialYearEnd) {
      if (selectedDate !== currentDate) {
        console.log("Date has been changed.");
      }
      setReturnDate(selectedDate);
    } else {
      toast.warning('Transaction date must be between April 1st, 2024 and March 31st, 2025.');
    }
  };

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
          <div class="d-flex justify-content-between">
            <div className="d-flex justify-content-start">
              <h1 align="left" className="purbut me-5">Inventory Return</h1>
            </div>
            <div class="d-flex justify-content-end me-5">
              {saveButtonVisible && ['add', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                <savebutton className="purbut" title='save' onClick={handleSaveButtonClick}>
                  <i class="fa-regular fa-floppy-disk"></i>
                </savebutton>
              )}
              {/* {['update', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                <printbutton className="purbut" title='update' onClick={handleUpdateButtonClick}>
                  <i class="fa-solid fa-floppy-disk"></i>
                </printbutton>
              )} */}
              {['delete', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                <delbutton className="purbut" onClick={handleDeleteButtonClick} title='delete' >
                  <i class="fa-solid fa-trash"></i>
                </delbutton>
              )}
              {['all permission', 'view'].some(permission => returnPermission.includes(permission)) && (
                <printbutton className="purbut" title="print" onClick={generateReport}>
                  <i class="fa-solid fa-file-pdf"></i>
                </printbutton>
              )}
              {showExcelButton && (
                <printbutton className="purbut" title='excel' onClick={handleExcelDownload}>
                  <i class="fa-solid fa-file-excel"></i>
                </printbutton>
              )}
              <printbutton className="purbut" onClick={handleReload}>
                <i class="fa-solid fa-arrow-rotate-right"></i>
              </printbutton>
            </div>
          </div>
          <div class="mobileview">
            <div class="d-flex justify-content-between ">
              <div className="d-flex justify-content-start">
                <h1 align="left" className="h1">Inventory Return</h1>
              </div>
              <div class="dropdown mt-1" style={{ paddingLeft: 0 }}>
                <button class="btn btn-primary dropdown-toggle p-1 ms-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-solid fa-list"></i>
                </button>
                <ul class="dropdown-menu menu">
                  {saveButtonVisible && (
                    <li class="iconbutton d-flex justify-content-center text-success">
                      {['add', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                        <icon class="icon" onClick={handleSaveButtonClick}>
                          <i class="fa-regular fa-floppy-disk"></i>
                        </icon>
                      )}
                    </li>
                  )}
                  {/* <li class="iconbutton d-flex justify-content-center text-success">
                    {['update', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                      <icon class="icon" onClick={handleUpdateButtonClick}>
                        <i class="fa-solid fa-floppy-disk"></i>
                      </icon>
                    )}
                  </li> */}
                  <li class="iconbutton  d-flex justify-content-center text-danger">
                    {['delete', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                      <icon class="icon" onClick={handleDeleteButtonClick}>
                        <i class="fa-solid fa-trash"></i>
                      </icon>
                    )}
                  </li>
                  <li class="iconbutton  d-flex justify-content-center text-warning">
                    {['all permission', 'view'].some(permission => returnPermission.includes(permission)) && (
                      <icon class="icon" onClick={generateReport}>
                        <i class="fa-solid fa-file-pdf"></i>
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
        <div className="shadow-lg p-1 bg-body-tertiary rounded  pt-3 pb-4" align="left">
          {/* <div className="status">{status}</div> */}
          <div className="row ms-3 me-3 mt-2">
            <div className="col-md-3 form-group mb-2">
              <label htmlFor="party_code" className={`${deleteError && !returnId ? 'red' : ''}`}>Transaction ID
                {showAsterisk && <span className="text-danger">*</span>}
              </label>
              <div className="exp-form-floating">
                <div class="d-flex justify-content-end">
                  <input
                    id="returnId"
                    className="exp-input-field form-control justify-content-start"
                    type="text"
                    placeholder=""
                    title='Please enter the transaction ID'
                    required
                    value={returnId}
                    onChange={(e) => setReturnId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={50}
                    autoComplete='off'
                  />
                  <div className='position-absolute mt-1 me-2'>
                    <span className="icon searchIcon"
                    title='Inventory Return Help'
                      onClick={handleInvReturn}>
                      <i class="fa fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group mb-2" >
              <div class="exp-form-floating" >
                <label for="" className={`${error && !returnDate ? 'red' : ''}`}>Transaction Date</label>
                {!showAsterisk && <span className="text-danger">*</span>}
                <input
                  id="returnDate"
                  className="exp-input-field form-control"
                  type="date"
                  title='Please enter the transaction date'
                  placeholder=""
                  required
                  value={returnDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <label for="" className={`${error && !returnType ? 'red' : ''}`}>Transaction Type
                {!showAsterisk && <span className="text-danger">*</span>}
              </label>
              <div class="exp-form-floating">
                <div title="select a transaction type">
                <Select
                  id="returnType"
                  className="exp-input-field"
                  placeholder=""
                  required
                  value={selectedReturn}
                  onChange={handleChangeReturn}
                  options={filteredOptionReturn}
                  data-tip="Please select a transaction type"
                />
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <label for="">Default Warehouse</label>
              <div class="exp-form-floating">
                <div title="select a default warehouse">
                <Select
                  id="returnType"
                  className="exp-input-field"
                  placeholder=""
                  required
                  value={selectedWarehouse}
                  onChange={handleChangeWarehouse}
                  options={filteredOptionWarehouse}
                  data-tip="Please select a default warehouse"
                />
                
</div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between ms-3 " style={{ marginBlock: "", marginTop: "10px" }} >
            <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "25px" }}>
              <purButton
                type="button"
                title='Item Details'
                className={`"toggle-btn"  ${activeTable === 'myTable' ? 'active' : ''}`}
                onClick={() => handleToggleTable('myTable')}>
                Item Details
              </purButton>
            </div>
            <div align="" class="d-flex justify-content-end" style={{ marginRight: "50px" }}>
              <icon
                type="button"
                class="popups-btn"
                title='Add row'
                onClick={handleAddRow}>
                <FontAwesomeIcon icon={faPlus} />
              </icon>
              <icon
                type="button"
                title='Less row'
                class="popups-btn"
                onClick={handleRemoveRow}>
                <FontAwesomeIcon icon={faMinus} />
              </icon>
            </div>
          </div>
          <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={{ editable: true, resizable: true }}
              onCellValueChanged={handleCellValueChanged}
            />
          </div>
        </div>
      </div>
      <div>
        <InventoryReturnItemPopup open={open} handleClose={handleClose} handleItem={handleItem} />
        <InventoryReturnWarehousePopup open={open1} handleClose={handleClose} handleWarehouse={handleWarehouse} />
        <InvReturnPopup open={open2} handleClose={handleClose} InvReturnData={InvReturnData} />
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
  )
}

export default UnplannedReturn;