
import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import "./apps.css";
import "./input.css";
import "./mobile.css"
import "bootstrap/dist/css/bootstrap.min.css";
import 'ag-grid-autocomplete-editor/dist/main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select'
import PurchaseVendorPopup from './PurchaseVendorPopup'
import { ToastContainer,toast } from 'react-toastify';
import "./mobile.css";
import { faMagnifyingGlassPlus, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";
import { upperCase } from "upper-case";
import PurchasePopup from './PurchasePopup'
import StockTransferWarehousePopup from './StockTransferWHPopup';
import StockTransferItemPopup from './StockTransferItempopup';
import StockTransferToWarehousePopup from './STtoWarehousepopup';
import StockItemPopup from './StockHelp';
import { DtPicker } from 'react-calendar-datetime-picker'
import 'react-calendar-datetime-picker/dist/style.css'
import labels from './Labels';
import { showConfirmationToast } from './ToastConfirmation';
import LoadingScreen from './Loading';
const config = require('./Apiconfig');


function StockTransfer() {
 
  const CompanyName = sessionStorage.getItem('selectedCompanyName'); 
  const LocationCode = sessionStorage.getItem('selectedLocationCode'); 
  const LocationName = sessionStorage.getItem('selectedLocationName'); 
  const UserName = sessionStorage.getItem('selectedUserName'); 


  const [gridApi, setGridApi] = useState(null);
  const [vendorcodedrop, setVendorcodedrop] = useState([]);
  const [paydrop, setPaydrop] = useState([]);
  const [purchasedrop, setPurchasedrop] = useState([]);
  const [rowData, setRowData] = useState([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', serach: '', unitWeight: 0, warehouse: '', warehouseTo: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
  const [rowDataTax, setRowDataTax] = useState([]);
  const [activeTable, setActiveTable] = useState('myTable');
  const [vendor_code, setvendor_code] = useState("");
  const [payType, setPayType] = useState("");
  const [purchaseType, setPurchaseType] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [bill_qty, setbill_qty] = useState("");
  const [TotalBill, setTotalBill] = useState('');
  const [TotalTax, setTotalTax] = useState(0)
  const [TotalPurchase, setTotalPurchase] = useState(0)
  const [round_difference, setRoundDifference] = useState(0)
  const [new_running_no, setNew_running_no] = useState("");
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState('');
  const [selected, setSelected] = useState(null);
  const [vendor_name, setVendorName] = useState("")
  const [ItemSNO, setItemSerialNo] = useState("")
  const navigate = useNavigate();
  const [status, setStatus] = useState('Ready to Add  Data...');
  const [clickedRowIndex, setClickedRowIndex] = useState(null)
  const [global, setGlobal] = useState(null)
  const [item_code, setitem_code] = useState(null)
  const [from_Warehouse, setfrom_Warehouse] = useState(null)
  const [to_Warehouse, setto_Warehouse] = useState(null)
  const [Item_name, setItem_name] = useState(null)
  const [gridData, setGridData] = useState([]);
  const [globalItem, setGlobalItem] = useState(null)
  const [date, setDate] = useState(null)
    const [loading, setLoading] = useState(false);
  const [additionalData, setAdditionalData] = useState({
    modified_by: '',
    created_by: '',
    modified_date: '',
    created_date: ''
  });
  const [hovered, setHovered] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [delButtonVisible, setDelButtonVisible] = useState(false);
  const [printButtonVisible, setprintButtonVisible] = useState(false);


  const [financialYearStart, setFinancialYearStart] = useState('');
  const [financialYearEnd, setFinancialYearEnd] = useState('');

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const purchasePermission = permissions
    .filter(permission => permission.screen_type === 'Purchase')
    .map(permission => permission.permission_type.toLowerCase());


  //CODE FOR PARTY CODE POPUP 
  const filteredOptionPay = paydrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionPurchase = purchasedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangePay = (selectedOption) => {
    setSelectedOption(selectedOption);
    setPayType(selectedOption ? selectedOption.value : '');
    setError(false);
    setStatus('Typing...');
  };


  const handleChangePurchase = (selected) => {
    setSelected(selected);
    setPurchaseType(selected ? selected.value : '');
    setError(false);
    setStatus('Typing...');
  };

  const handleShowModal = () => {
    setOpen2(true);
  };

  const handlePurchase = () => {
    setOpen3(true);
  };

  //Item Name Popup
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);

  //Item Popup
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
    setOpen3(false);
    setOpen4(false);
  };


  //Warehouse Popup
  const handleOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber
    setGlobal(GlobalSerialNumber)
    setOpen1(true);
    console.log('Opening popup...');
  };

  const handleOpenpopup = (params) => {
    const GlobalSerialNumber = params.data.serialNumber
    setGlobal(GlobalSerialNumber)
    setOpen4(true);
    console.log('Opening popup...');
  };




  //ITEM CODE TO SEARCH IN AG GRID
  const handleItemCode = async (params) => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
        setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getitemcodepurdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code,Item_code: params.data.itemCode })
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
                warehouse: matchedItem.warehouse // Update warehouse if needed
              };
            }
          }
          return row;
        });
        setRowData(updatedRow);
        console.log(updatedRow);
      } else if (response.status === 404) {
        toast.warning("Data Not Found").then(() => {
          // Remove text from the field
          const updatedRowData = rowData.map(row => {
            if (row.itemCode === params.data.itemCode) {
              return {
                ...row,
                itemCode: '', // Clear the itemCode field
                itemName: '',
                unitWeight: 0,
                purchaseAmt: 0,
                taxType: '',
                taxDetails: '',
                taxPer: '',
                warehouse: '' // Clear the warehouse field
              };
            }
            return row;
          });
          setRowData(updatedRowData);
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
finally {
      setLoading(false);
    }

  };


  const handleWarehouseCodeFrom = async (params) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/getWarehouseCodeData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ warehouse_code: params.data.warehouse })
      });

      if (response.ok) {
        const searchData = await response.json();
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              if (row.warehouse === matchedItem.warehouse_code) {
                // Show alert if From Warehouse and To Warehouse are equal
                toast.warning("From Warehouse and To Warehouse cannot be the same").then(() => {
                  // Clear To Warehouse field
                  setRowData(prevRowData =>
                    prevRowData.map(prevRow => {
                      if (prevRow.itemCode === params.data.itemCode) {
                        return {
                          ...prevRow,
                          warehouseTo: '', // Clear the To Warehouse field
                        };
                      }
                      return prevRow;
                    })
                  );
                });
              } return {
                ...row,
                warehouse: matchedItem.warehouse_code
              };
            }
          }
          return row;
        });
        setRowData(updatedRowData);
        console.log(updatedRowData);
      } else if (response.status === 404) {
       toast.warning("Data Not Found").then(() => {
          // Remove text from the field
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
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
finally {
      setLoading(false);
    }

  };

  const handleWarehouseCodeTo = async (params) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/getWarehouseCodeData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ warehouse_code: params.data.warehouseTo })
      });

      if (response.ok) {
        const searchData = await response.json();
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              if (row.warehouse === matchedItem.warehouse_code) {
                // Show alert if From Warehouse and To Warehouse are equal
                toast.warning("From Warehouse and To Warehouse cannot be the same!").then(() => {
                  // Clear To Warehouse field
                  setRowData(prevRowData =>
                    prevRowData.map(prevRow => {
                      if (prevRow.itemCode === params.data.itemCode) {
                        return {
                          ...prevRow,
                          warehouseTo: '', // Clear the To Warehouse field
                        };
                      }
                      return prevRow;
                    })
                  );
                });
              } else {
                return {
                  ...row,
                  warehouseTo: matchedItem.warehouse_code
                };
              }
            }
          }
          return row;
        });
        setRowData(updatedRowData);
        console.log(updatedRowData);
      } else if (response.status === 404) {
        toast.warning("Data not found!").then(() => {
          // Remove text from the field
          const updatedRowData = rowData.map(row => {
            if (row.itemCode === params.data.itemCode) {
              return {
                ...row,
                warehouseTo: ''
              };
            }
            return row;
          });
          setRowData(updatedRowData);
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
finally {
      setLoading(false);
    }

  };


  //CODE FOR PARTY CODE TO GET PARTY NAME
  const handleSearchVendor = async (code) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/PartyCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ vendor_code: code })
      });

      if (response.ok) {
        const searchData = await response.json();
        if (searchData.length > 0) {
          const [{ vendor_code, vendor_name }] = searchData;

          const upperVendorCode = upperCase(vendor_code);
          const upperVendorName = upperCase(vendor_name);

          setvendor_code(upperVendorCode);
          setVendorName(upperVendorName);

          console.log("Data fetched successfully");
        } else {
      
          toast.warning("No data found for the given vendor code.")
          setvendor_code('');
          setVendorName('');
        }
      } else if (response.status === 404) {
        toast.warning("No data found for the given vendor code.")


        setvendor_code('');
        setVendorName('');
      } else {
       
        toast.error("There was an error with your request.")

        setvendor_code('');
        setVendorName('');
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      
      toast.error("An error occurred while fetching the data.")

      setvendor_code('');
      setVendorName('');
    }
finally {
      setLoading(false);
    }

  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchVendor(vendor_code);
    }
  };
  const handleKeyPressRef = (e) => {
    if (e.key === 'Enter') {
      handleRefNo(new_running_no)
    }
  };

  const handleChange = (e) => {
    setStatus('Typing...');
    const vendor = e.target.value;
    setvendor_code(vendor);
  };

  //CODE ITEM CODE TO ADD NEW ROW FUNCTION
  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex } = params;
    const lastRowIndex = rowData.length - 1;

    if (colDef.field === 'purchaseQty' && rowIndex === lastRowIndex) {
      const serialNumber = rowData.length + 1;
      const newRowData = {
        serialNumber, delete: '', itemName: null, unitWeight: null, warehouse: null, warehouseTo:null, purchaseQty: 0, unitWeight:null, totalWeight: null
      };
      setRowData(prevRowData => [...prevRowData, newRowData]);
    }
  };

  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber;

    // Filter out the row from rowData
    const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);

    // Filter out the row from rowDataTax

    // Update the state with the new row data
    setRowData(updatedRowData);


    console.log('Updated rowData:', updatedRowData);


    // Check if updatedRowData is empty and initialize with a new row if needed
    if (updatedRowData.length === 0) {
      const newRow = {
        serialNumber: 1, // Resetting serialNumber to 1
        delete: '',
        itemCode: '',
        itemName: '',
        search: '', // Corrected 'search' field name
        unitWeight: 0,
        warehouse: '',
        purchaseQty: 0,
        ItemTotalWight: 0, // Corrected 'ItemTotalWeight' field name
        purchaseAmt: 0,

        TotalItemAmount: 0
      };
      setRowData([newRow]);
    } else {
      // If not empty, update serialNumber dynamically
      const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
        ...row,
        serialNumber: index + 1 // Update serialNumber dynamically based on index
      }));
      setRowData(updatedRowDataWithNewSerials);
    }
  };

  const onCellValueChanged = (params) => {
    // Trigger `handlePurchaseData` with the updated row data
    handlePurchaseData(params.data);
  };

  const onRowSelected = (event) => {
    // Trigger `handlePurchaseData` with the selected row data
    handlePurchaseData(event.data);
  };

  function qtyValueSetter(params) {
    const newValue = parseFloat(params.newValue);
    if (isNaN(newValue) || newValue < 0) {
     
      toast.error("Quantity cannot be negative!")
      return false; // Prevent the value from being set
    }
    params.data.purchaseQty = newValue;
    return true; // Allow the value to be set
  }



  // Column definitions for the grid
  const columnDefs = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 80,
      sortable: false,
      editable: false
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
      editable: true,
      // maxWidth: 140,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleItemCode(params);
      },
      sortable: false,
      autoComplete: false
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
      sortable: false
    },
    {
      headerName: '',
      field: 'Search',
      editable: true,
      maxWidth: 25,
      tooltipValueGetter: (params) =>
        "Item Help",
      onCellClicked: handleClickOpen,
      cellRenderer: function () {
        return <FontAwesomeIcon icon="fa-solid fa-magnifying-glass-plus" style={{ cursor: 'pointer', marginRight: "12px" }} />
      },
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      sortable: false,
      filter: false
    },

    {
      headerName: 'From Warehouse',
      field: 'warehouse',
      editable: true,
      filter: true,
      // maxWidth: 170,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleWarehouseCodeFrom(params);
      },
      sortable: false,
      autoComplete: false
    },
    {
      headerName: '',
      field: 'Search',
      editable: true,
      maxWidth: 25,
      tooltipValueGetter: (params) =>
        "Warehouse Help",
      onCellClicked: handleOpen,
      filter: true,
      cellRenderer: function () {
        return <FontAwesomeIcon icon="fa-solid fa-magnifying-glass-plus" style={{ cursor: 'pointer', marginRight: "12px" }} />
      },
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      sortable: false,
      filter: false
    },

    {
      headerName: 'To  Warehouse',
      field: 'warehouseTo',
      editable: true,
      filter: true,
      // maxWidth: 150,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleWarehouseCodeTo(params);
      },
      sortable: false,
      autoComplete: false
    },
    {
      headerName: '',
      field: 'Search',
      editable: true,
      maxWidth: 25,
      tooltipValueGetter: (params) =>
        "Warehouse Help",
      onCellClicked: handleOpenpopup,
      filter: true,
      cellRenderer: function () {
        return <FontAwesomeIcon icon="fa-solid fa-magnifying-glass-plus" style={{ cursor: 'pointer', marginRight: "12px" }} />
      },
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      sortable: false,
      filter: false
    },
    {
      headerName: 'Qty',
      field: 'purchaseQty',
      editable: true,
      // maxWidth: 110,
      filter: true,
      value: { bill_qty },
      sortable: false,
      autoComplete: false,
      valueSetter: qtyValueSetter,
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: 'Unit Weight',
      field: 'unitWeight',
      editable: false,
      // maxWidth: 150,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Total Weight',
      field: 'ItemTotalWight',
      editable: false,
      // minWidth: 600,
      filter: true,
      sortable: false
    }
  ];

  //DEFINE TAX DETAIL COLUMNS
  const columnDefsTax = [
    {
      headerName: 'S.No',
      field: 'ItemSNO',
      maxWidth: 80,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax S.No',
      field: 'TaxSNO',
      maxWidth: 120,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Item Code',
      field: 'item_code',
      // minWidth: 315,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax Type ',
      field: 'TaxType',
      // minWidth: 201,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax %',
      field: 'TaxPercentage',
      // minWidth: 201,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax Amount',
      field: 'TaxAmount',
      // minWidth: 600,
      sortable: false,
      editable: false
    }
  ];

  // // Fetch data from APIs
  // useEffect(() => {
  //   fetch(`${config.apiBaseUrl}/vendorcode`)
  //     .then((response) => response.json())
  //     .then((data) => setVendorcodedrop(data))
  //     .catch((error) => console.error("Error fetching vendor codes:", error));

  //   fetch(`${config.apiBaseUrl}/paytype`)
  //     .then((response) => response.json())
  //     .then((data) => setPaydrop(data))
  //     .catch((error) => console.error("Error fetching payment types:", error));

  //   fetch(`${config.apiBaseUrl}/purchasetype`)
  //     .then((response) => response.json())
  //     .then((data) => setPurchasedrop(data))
  //     .catch((error) => console.error("Error fetching purchase types:", error));

  // }, []);


  //CODE TO SAVE PURCHASE HEADER 
  const handleSaveButtonClick = async () => {
    if (!transactionDate) {
      setError(" ");
      setStatus('Error: Missing required fields');
      return;
    }

    if (rowData.length === 0) {
      
      toast.warning("There are no items to save. Please add at least one item.")
      return;
    }

    const hasValidData = rowData.some(row => row.purchaseQty > 0 && row.ItemTotalWight > 0);

    if (!hasValidData) {
   
      toast.warning("Ensure at least one row has Qty and Item Total Weight greater than 0.")
      return;
    }

    setStatus('Saving...');
    setLoading(true)
    try {
      const Header = {
        transaction_date: transactionDate,
        created_by: sessionStorage.getItem('selectedUserCode'),
        company_code: sessionStorage.getItem('selectedCompanyCode'),
      };

      const response = await fetch(`${config.apiBaseUrl}/addstocktransferhdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ transaction_no }] = searchData;
        setNew_running_no(transaction_no);

      
        toast.success("Stock Data inserted Successfully")

        await saveStockTransferDetails(transaction_no);
setDelButtonVisible(true)
setprintButtonVisible(true)
        setStatus('Saved...');
        console.log("Stock Header Data inserted successfully");
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message); // Log error message
      }
    } catch (error) {
      console.error("Error inserting data:", error);
     
      toast.error('Error inserting data: ' + error.message)
      setStatus('Error: ' + error.message);
    }
finally {
      setLoading(false);
    }

  };

  //CODE TO SAVE PURCHASE DETAILS
  const saveStockTransferDetails = async (transaction_no) => {
    try {
      for (const row of rowData) {
        const Details = {
          created_by: sessionStorage.getItem('selectedUserCode'),
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          ItemSNo: row.serialNumber,
          transaction_no: transaction_no.toString(),
          item_code: row.itemCode,
          Item_name: row.itemName,
          transfer_Qty: row.purchaseQty,
          weight: row.unitWeight,
          total_weight: row.ItemTotalWight,
          from_Warehouse: row.warehouse,
          to_Warehouse: row.warehouseTo,
          transaction_date: transactionDate

        };
        const response = await fetch(`${config.apiBaseUrl}/addstocktransferdetail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Stock Detail Data inserted successfully");
        } else if (response.status === 400) {
          const errorResponse = await response.json();
          console.error(errorResponse.error);
        } else {
          console.error("Failed to insert data for row");
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };




  const PrintDetailData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberToStockDetailPrintData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: new_running_no.toString() })
      });

      if (response.ok) {
        const searchData = await response.json();
        return searchData;
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const generateReport = async () => {
    setStatus('Generating Report...');
    setLoading(true)
    try {

      const detailData = await PrintDetailData();

      if (detailData) {
        console.log("All API calls completed successfully");
        console.log(detailData)

        // Stringify data and encode it

        const encodedDetailData = encodeURIComponent(JSON.stringify(detailData));


        // Construct the URL with the encoded data as query parameters
        const url = `/StockTransferTemplat?detailData=${encodedDetailData}`;

        // Open the URL in a new window
        window.open(url, '_blank');
        setStatus('Report Generated...');
      } else {
        console.log("Failed to fetch some data");
      
        toast.error("Reference Number Does Not Exist")
        setStatus('Reference Number Does Not Exist');
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
finally {
      setLoading(false);
    }

  };


  const handleToggleTable = (table) => {
    setActiveTable(table);
  };


  const handleItem = async (selectedData) => {
    console.log("Selected Data:", selectedData);
    let updatedRowDataCopy = [...rowData];
    let highestSerialNumber = updatedRowDataCopy.reduce((max, row) => Math.max(max, row.serialNumber), 0);

    selectedData.map(item => {
      const existingItemWithSameCode = updatedRowDataCopy.find(row => row.serialNumber === global && row.itemCode === globalItem);

      if (existingItemWithSameCode) {
        console.log("if");
        existingItemWithSameCode.itemCode = item.itemCode;
        existingItemWithSameCode.itemName = item.itemName;
        existingItemWithSameCode.unitWeight = item.unitWeight;
        existingItemWithSameCode.purchaseAmt = item.purchaseAmt;

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
        updatedRowDataCopy.push(newRow); // Push the new row to the updatedRowDataCopy
      }
    });

    setRowData(updatedRowDataCopy);
    console.log("Updated Row Data:", updatedRowDataCopy);
  };



  const handleVendor = async (data) => {
    if (data && data.length > 0) {
      const [{ VendorCode, VendorName }] = data;

      const upperVendorCode = upperCase(VendorCode);
      const upperVendorName = upperCase(VendorName);

      setvendor_code(upperVendorCode);
      setVendorName(upperVendorName);// Assuming setvendor_code is a function to set state or perform some action with VendorCode
    } else {
      console.error('Data is empty or undefined');
    }
  };

  const handleRowClicked = (event) => {
    const clickedRowIndex = event.rowIndex;
    setClickedRowIndex(clickedRowIndex)
    // console.log("Index Number",clickedRowIndex)
    // console.log("Values",rowData[clickedRowIndex])
  };

  const handleWarehouse = (data) => {
    console.log('Data received by handleWarehouse:', data);
    const updatedRowData = rowData.map(row => {
      if (row.serialNumber === global) {
        console.log('1st if condition met, row:', row);
        const matchedItem = data.find(item => item.id === row.id);

        if (matchedItem) {
          console.log('2nd if condition met, matchedItem:', matchedItem);

          // Check if From Warehouse and To Warehouse are the same
          if (row.warehouseTo === matchedItem.warehouse) {
          
            toast.warning("From Warehouse and To Warehouse cannot be the same!").then(() => {
              // Clear To Warehouse field
              setRowData(prevRowData =>
                prevRowData.map(prevRow => {
                  if (prevRow.serialNumber === global) {
                    return {
                      ...prevRow,
                      warehouseTo: '', // Clear the To Warehouse field
                    };
                  }
                  return prevRow;
                })
              );
            });
            return row; // Return early if warehouse codes are the same
          }
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
    console.log('Updated rowData:', updatedRowData);
  };


  const handleToWarehouse = (data) => {
    console.log('Data received by handleToWarehouse:', data);

    const updatedRowData = rowData.map(row => {
      if (row.serialNumber === global) {
        console.log('1st if condition met, row:', row);
        const matchedItem = data.find(item => item.id === row.id);

        if (matchedItem) {
          console.log('2nd if condition met, matchedItem:', matchedItem);

          // Check if From Warehouse and To Warehouse are the same
          if (row.warehouse === matchedItem.warehouse) {
            
            toast.warning("From Warehouse and To Warehouse cannot be the same!").then(() => {
              // Clear To Warehouse field
              setRowData(prevRowData =>
                prevRowData.map(prevRow => {
                  if (prevRow.serialNumber === global) {
                    return {
                      ...prevRow,
                      warehouseTo: '', // Clear the To Warehouse field
                    };
                  }
                  return prevRow;
                })
              );
            });
            return row; // Return early if warehouse codes are the same
          }

          return {
            ...row,
            warehouseTo: matchedItem.warehouse
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
    console.log('Updated rowData:', updatedRowData);
  };

  const currentDate = new Date().toISOString().split('T')[0];



  const handleTransactionDateChange = (date) => {
    // Check if 'date' is a valid object and has day, month, year or is a Date object
    if (date && typeof date === 'object') {
      const day = date.day || date.getDate();  // Handle if it's {day, month, year} or Date object
      const month = date.month || (date.getMonth() + 1); // Adjust for Date object month (0-based)
      const year = date.year || date.getFullYear();

      // Format the selected date as DD-MM-YYYY
      const formattedDate = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}-${year}`;
      setStatus('Typing...');
      setTransactionDate(formattedDate); // Set the formatted date
    } else {
      console.error('Invalid date object:', date);
      setStatus('Invalid Date');
    }
  };

  const handleEntryDateChange = (e) => {
    const date = e.target.value;
    setStatus('Typing...');
    if (date >= financialYearStart && date <= financialYearEnd) {
      setEntryDate(date);
    } else {
      alert('Entry date must be between April 1st, 2024 and March 31st, 2025.');
    }
  };

  const onGridReady = (params) => {
    console.log("Grid is ready");
    const columnState = localStorage.getItem('myColumnState');
    if (columnState) {
      params.columnApi.applyColumnState({ state: JSON.parse(columnState) });
    }
  };

  const onColumnMoved = (params) => {
    const columnState = JSON.stringify(params.columnApi.getColumnState());
    localStorage.setItem('myColumnState', columnState);
  };

  const handleChangeNo = (e) => {
    const refNo = e.target.value;
    setNew_running_no(refNo); setStatus('Typing...');
  }

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatToTwoDecimalPoints = (number) => {
    return parseFloat(number).toFixed(2);
  };

  const handleRefNo = async (code) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/getStockKey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        setSaveButtonVisible(false)
       setDelButtonVisible(true)
        setprintButtonVisible(true)

        const searchData = await response.json();
        // console.log(searchData)
        if (searchData.table1 && searchData.table1.length > 0) {
          console.log("Table 1 Data:", searchData.table1);
          const item = searchData.table1[0];


          setNew_running_no(item.transaction_no);

          setTransactionDate(formatDate(item.transaction_date));
          setTransactionNumber(item.transaction_no);


          const selectedOption = filteredOptionPurchase.find(option => option.value === item.purchase_type);
          setSelected(selectedOption);

          const selected = filteredOptionPay.find(option => option.value === item.pay_type);
          setSelectedOption(selected);
        } else {
          console.log("Table 1 is empty or not found");
        }

        if (searchData.table2 && searchData.table2.length > 0) {
          console.log("Table 2 Data:", searchData.table2);

          const updatedRowData = searchData.table2.map(item => {
            // Find all tax details from table3 that correspond to the current item in table2

            setVendorName(item.vendor_name)
            return {
              serialNumber: item.ItemSNo,
              itemCode: item.item_code,
              itemName: item.Item_name,
              unitWeight: item.weight,
              warehouse: item.from_Warehouse,
              warehouseTo: item.to_Warehouse,
              purchaseQty: item.transfer_Qty,
              ItemTotalWight: parseFloat(item.total_weight).toFixed(2),




            };
          });



          setRowData(updatedRowData);
        }
        else {
          console.log("Table 2 is empty or not found");
        }

        if (searchData.table3 && searchData.table3.length > 0) {
          console.log("Table 3 Data:", searchData.table3);

          const updatedRowDataTax = searchData.table3.map(item => {
            return {
              ItemSNO: item.ItemSNo,
              TaxSNO: item.TaxSNo,
              Item_code: item.item_code,
              TaxType: item.tax_name_details,
              TaxPercentage: item.tax_per,
              TaxAmount: parseFloat(item.tax_amt).toFixed(2),
              TaxName: item.tax_type
            };
          });

          console.log(updatedRowDataTax);
          setRowDataTax(updatedRowDataTax);
        } else {
          console.log("Table 3 is empty or not found");
        }

        console.log("data fetched successfully")
      } else if (response.status === 404) {
        
        toast.warning("Data Not Found")

        // Clear the data fields
        setNew_running_no('')
        setEntryDate('');
        setPayType('');
        setNew_running_no('');
        setSelected('');
        setSelectedOption('')
        setTransactionDate('');
        setTransactionNumber('');
        setvendor_code('');
        setVendorName('');
        setTotalPurchase('');
        setTotalTax('');
        setRoundDifference('');
        setTotalBill('')
        setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', serach: '', unitWeight: 0, warehouse: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }])
        setRowDataTax([])
      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
finally {
      setLoading(false);
    }

  };

  const handlePurchaseData = async (data) => {
    if (data && data.length > 0) {
      const [{ TransactionNo, transaction_date, }] = data;

      const transactiondate = document.getElementById('transactionDate');
      if (transactiondate) {
        transactiondate.value = transaction_date;
        setTransactionDate(formatDate(transaction_date));  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const transactionNo = document.getElementById('RefNo');
      if (transactionNo) {
        transactionNo.value = TransactionNo;
        setNew_running_no(TransactionNo);
      } else {
        console.error('transactionNumber element not found');
      }

      await StockDetail(TransactionNo)
      setprintButtonVisible(true)
      setDelButtonVisible(true)
      setSaveButtonVisible(false)
    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);

  };

  const StockDetail = async (TransactionNo) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/StockTransferDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: TransactionNo })
      });

      if (response.ok) {
        const searchData = await response.json();

        const newRowData = [];
        searchData.forEach(item => {
          const {
            ItemSNo,
            item_code,
            Item_name,
            weight,
            from_Warehouse,
            to_Warehouse,
            transfer_Qty,
            total_weight,

          } = item;

          newRowData.push({
            serialNumber: ItemSNo,
            itemCode: item_code,
            itemName: Item_name,
            unitWeight: weight,
            purchaseQty: transfer_Qty,
            warehouse: from_Warehouse,
            warehouseTo: to_Warehouse,
          

            ItemTotalWight: parseFloat(total_weight).toFixed(2),
          });
        });
        setRowData(newRowData);

      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
finally {
      setLoading(false);
    }

  };





  //CODE FOR TOTAL WEIGHT, TOTAL TAX AND TOTAL AMOUNT CALCULATION
  const ItemAmountCalculation = async (params) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/StockTransferItemAmountCalculation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transfer_Qty: params.data.purchaseQty,
          weight: params.data.unitWeight,
        })
      });

      if (response.ok) {
        const searchData = await response.json();

        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode && row.serialNumber === params.data.serialNumber) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                ItemTotalWight: formatToTwoDecimalPoints(matchedItem.total_weight)
              };
            }
          }
          return row;
        });

        setRowData(updatedRowData);

        let updatedRowDataTaxCopy = [...rowDataTax];

        searchData.forEach(item => {
          const existingItem = updatedRowDataTaxCopy.find(row => row.ItemSNO === item.ItemSNO && row.Item_code !== item.Item_code);

          if (existingItem) {
            const indexToRemove = updatedRowDataTaxCopy.indexOf(existingItem);
            updatedRowDataTaxCopy.splice(indexToRemove, 1);
          }

          const existingItemWithSameCode = updatedRowDataTaxCopy.find(row => row.ItemSNO === item.ItemSNO && row.Item_code === item.Item_code && row.TaxType === item.TaxType);

          if (existingItemWithSameCode) {
            console.log('if')
            existingItemWithSameCode.ItemTotalWight = parseFloat(item.ItemTotalWight).toFixed(2);
            existingItemWithSameCode.TaxPercentage = item.TaxPercentage;
            existingItemWithSameCode.TaxAmount = item.TaxAmount;
          } else {
            console.log("else")
            const newRow = {
              ItemSNO: item.ItemSNO,
              TaxSNO: item.TaxSNO,
              Item_code: item.Item_code,
              TaxType: item.TaxType,
              TaxPercentage: item.TaxPercentage,
              TaxAmount: parseFloat(item.TaxAmount).toFixed(2),
              ItemTotalWight: parseFloat(item.ItemTotalWight).toFixed(2),
            };
            updatedRowDataTaxCopy.push(newRow);
          }
        });

        updatedRowDataTaxCopy.sort((a, b) => a.ItemSNO - b.ItemSNO);
        setRowDataTax(updatedRowDataTaxCopy);

        // Check if any row has purchaseQty defined
        const hasPurchaseQty = updatedRowData.some(row => row.purchaseQty >= 0);

        if (hasPurchaseQty) {
          const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || 0).join(',');
          const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || 0).join(',');

          // Remove trailing commas if present
          const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
          const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

          console.log("formattedTotalItemAmounts", formattedTotalItemAmounts)
          console.log("formattedTotalTaxAmounts", formattedTotalTaxAmounts)

          // Ensure that TotalAmountCalculation receives numbers, not strings
          await TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);

          console.log("TotalAmountCalculation executed successfully");
        } else {
          console.log("No rows with purchaseQty greater than 0 found");
        }

        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const TotalAmountCalculation = async (formattedTotalTaxAmounts, formattedTotalItemAmounts) => {
    if (parseFloat(formattedTotalTaxAmounts) >= 0 && parseFloat(formattedTotalItemAmounts) >= 0) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/TotalAmountCalculation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Tax_amount: formattedTotalTaxAmounts, company_code:sessionStorage.getItem("selectedCompanyCode"), Putchase_amount: formattedTotalItemAmounts }),
        });
        if (response.ok) {
          const data = await response.json();
          // console.table(data)
          const [{ rounded_amount, round_difference, TotalPurchase, TotalTax }] = data;
          setTotalBill(formatToTwoDecimalPoints(rounded_amount));
          setRoundDifference(formatToTwoDecimalPoints(round_difference));
          setTotalPurchase(formatToTwoDecimalPoints(TotalPurchase));
          setTotalTax(formatToTwoDecimalPoints(TotalTax));
        } else {
          const errorMessage = await response.text();
          console.error(`Server responded with error: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const handleDeleteHeader = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/deletestocktransferhdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: new_running_no })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", new_running_no);
        return true
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };
  const handleDeleteDetail = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/deletestocktransfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: new_running_no, transaction_date: transactionDate })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", new_running_no);
        return true
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const handleDeleteButtonClick = async () => {
    // Check for required fields
    if (!new_running_no || !transactionDate) {
      setError(" ");
      setStatus("Error: Missing required fields");
      return;
    }
     showConfirmationToast(
          "Are you sure you want to delete the data ?",
          async () => {
    setStatus("Deleting...");
    setLoading(true)
    try {
      // Attempt to delete details first
      const detailResult = await handleDeleteDetail();
      console.log("Detail deletion result:", detailResult);
setprintButtonVisible(true)
      if (detailResult) {
        // If detail deletion is successful, proceed to delete the header
        const headerResult = await handleDeleteHeader();
        console.log("Header deletion result:", headerResult);

        if (headerResult) {
          console.log("Both details and header deleted successfully");
        
          toast.success("Successfully Deleted").then(() => {
            window.location.reload(); // Reload the page after successful deletion
          });
          setStatus("Deleted Successfully...");
        } else {
          // If header deletion failed, show error
          console.log("Failed to delete header");
      
          toast.error("Failed to delete header.")
          setStatus("Failed to delete header");
        }
      } else {
        // If detail deletion failed, show error
        console.log("Failed to delete details");
      
        toast.error("Reference Number Does Not Exist or Failed to delete details.")
        setStatus("Reference Number Does Not Exist or Failed to delete details");
      }
    } catch (error) {
      // Handle any errors that occur during the API call execution
      console.error("Error executing API calls:", error);

      toast.error("Reference Number Does Not Exist or Failed to delete details.")
      setStatus("Error occurred while deleting data");
    }
finally {
      setLoading(false);
    }

  },
        () => {
          toast.info("Data deleted cancelled.");
        }
  
      );
    };

  const handleReload = () => {
    setLoading(true)
    window.location.reload();
  };

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

  const handleAddRow = () => {
    const serialNumber = rowData.length + 1;
    const newRow = { serialNumber, itemCode: '', itemName: '', serialno: '', unitWeight: 0, warehouse: '', warehouseTo: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', serialno: '', unitWeight: 0, warehouse: '', warehouseTo: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };


  return (
    <div className="container-fluid Topnav-screen">
      <div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 mb-2">
          <div className="d-flex justify-content-between" >
      {loading && <LoadingScreen />}
                  <ToastContainer position="top-right" className="toast-design" theme="colored" />
      
            <div className="d-flex justify-content-start">
              <h1 align="left" className="purbut me-5" >Stock Transfer</h1>
            </div>


            <div className="d-flex justify-content-end purbut me-3">
              {saveButtonVisible &&['add', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                <savebutton className="purbut" onClick={handleSaveButtonClick} title='save'>
                  <i class="fa-regular fa-floppy-disk"></i>
                </savebutton>
              )}

              {delButtonVisible &&['delete', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                <delbutton className="purbut" onClick={handleDeleteButtonClick} title='delete'>
                  <i class="fa-solid fa-trash"></i>
                </delbutton>
              )}
              {printButtonVisible &&['all permission', 'view'].some(permission => purchasePermission.includes(permission)) && (
                <printbutton className="purbut" title="print" onClick={generateReport}>

                  <i class="fa-solid fa-file-pdf"></i></printbutton>
              )}
              <printbutton className="purbut" onClick={handleReload} ><i class="fa-solid fa-arrow-rotate-right"></i></printbutton>
            </div>  </div>


          <div class="mobileview">
          <div className="d-flex justify-content-between">
          <div className="d-flex justify-content-start">
      <h1 align="left" className="h1">Stock Transfer</h1> 
      </div>
      <div className="d-flex justify-content-end">
            <div class="dropdown">
              <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fa-solid fa-list"></i>
              </button>

              <ul class="dropdown-menu menu">
               
              <li class="iconbutton  d-flex justify-content-center text-success ">                 
                 {['update', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                     <icon
                     class="icon"
                     onClick={handleSaveButtonClick}
                   >
                   <i class="fa-solid fa-floppy-disk"></i>
                   </icon>
                  )}
                </li>
            


                <li class="iconbutton  d-flex justify-content-center text-danger">
                {['delete', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                      <icon
                      class="icon"
                      onClick={handleDeleteButtonClick}
                    >
                    
            <i class="fa-solid fa-trash"></i>
                    </icon>
                  )}
                </li>


                <li class="iconbutton  d-flex justify-content-center text-warning ">
                {['all permission', 'view'].some(permission => purchasePermission.includes(permission)) && (
                     <icon
                     class="icon"
                     onClick={generateReport}
                   >
                    
           <i class="fa-solid fa-file-pdf"></i>
                   </icon>
                  )}
              </li>
              <li class="iconbutton  d-flex justify-content-center ">
                {['all permission', 'view'].some(permission => purchasePermission.includes(permission)) && (
                     <icon
                     class="icon"
                     onClick={handleReload}
                   >
                    
                    <i class="fa-solid fa-arrow-rotate-right"></i>
                   </icon>
                  )}
              </li>
              </ul></div>
          </div></div></div></div>

      

      
<div className="shadow-lg p-1 bg-body-tertiary rounded  pt-4 "
          align="left">
              <div className="status">{status}</div>
        <div  
         >

          <div className="row ms-4">
            <div className="col-md-3 form-group">
              <label htmlFor="party_code">Transaction No</label>
              <div className="exp-form-floating">
                <div class="d-flex justify-content-end">
                  <input
                    id="RefNo"
                    className="exp-input-field form-control justify-content-start"
                    type="text"
                    placeholder=""
                    required
                    value={new_running_no}
                    onChange={handleChangeNo}
                    onKeyDown={(e) => {
                      // Allow only numbers and certain special keys like Backspace and Arrow keys
                      if (!/^\d$/.test(e.key) && e.key.length === 1 && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onKeyPress={handleKeyPressRef}
                    autoComplete='off'
                  />
                  <div className='position-absolute mt-2 me-2'>
                  <span
                          style={hovered ? { cursor: "pointer", borderRadius: "50%", backgroundColor: "#f0f0f0", padding: "10px" } : { cursor: "pointer", borderRadius: "50%", padding: "10px" }}
                          onMouseEnter={() => setHovered(true)}
                          onMouseLeave={() => setHovered(false)}
                          onClick={handlePurchase}>
                              <i class="fa fa-search"></i>
                              </span>
                    </div>
                </div>
              </div>
            </div>


            <div className="col-md-3 form-group" >
              <div class="exp-form-floating" >
                <label for="" className={`${error && !transactionDate ? 'red' : ''}`}>Transaction Date</label>
                <span className="text-danger">*</span>
                <DtPicker
                  name="transactionDate"
                  id="transactionDate"
                  className="exp-input-field form-control"
                  type="single"
                  placeholder="select the Date"
                  required
                  value={transactionDate}
                  onChange={handleTransactionDateChange}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between ms-3" style={{ marginBlock: "", marginTop: "10px" }} >
          <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "25px" }}>
            <purButton
              type="button"
              className={`"toggle-btn"  ${activeTable === 'myTable' ? 'active' : ''}`}
              onClick={() => handleToggleTable('myTable')}>
              Item Details
            </purButton>
          </div>
          <div align="" class="d-flex justify-content-end" style={{ marginRight: "50px" }}>
          <icon
              type="button"
              className="popups-btn"
              onClick={handleAddRow}>
              <FontAwesomeIcon icon={faPlus} />
            </icon>
            <icon
              type="button"
              className="popups-btn"
              onClick={handleRemoveRow}>
              <FontAwesomeIcon icon={faMinus} />
            </icon>
          </div>
        </div>

        <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
          <AgGridReact
            columnDefs={activeTable === 'myTable' ? columnDefs : columnDefsTax}
            rowData={activeTable === 'myTable' ? rowData : rowDataTax}
            defaultColDef={{ editable: true, resizable: true }}

            onCellValueChanged={async (event) => {
              await ItemAmountCalculation(event);
              handleCellValueChanged(event);
            }}
            onGridReady={onGridReady}
            onRowClicked={handleRowClicked}
            onColumnMoved={onColumnMoved}
            RowData={gridData}
            onRowSelected={onRowSelected}
          />
        </div>
        </div>
        <div>
          
          <StockTransferItemPopup open={open} handleClose={handleClose} handleItem={handleItem} />
          <StockTransferWarehousePopup open={open1} handleClose={handleClose} handleWarehouse={handleWarehouse} />
          <PurchaseVendorPopup open={open2} handleClose={handleClose} handleVendor={handleVendor} />
          <StockItemPopup open={open3} handleClose={handleClose} handlePurchaseData={handlePurchaseData} />
          <StockTransferToWarehousePopup open={open4} handleClose={handleClose} handleWarehouse={handleToWarehouse} />
        </div>
      </div>
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2 ">
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

export default StockTransfer;