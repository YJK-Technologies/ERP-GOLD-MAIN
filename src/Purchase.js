import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import "./apps.css";
import "./input.css";
import * as XLSX from 'xlsx';
import "bootstrap/dist/css/bootstrap.min.css";
import 'ag-grid-autocomplete-editor/dist/main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLocation } from 'react-router-dom';
import Select from 'react-select'
import PurchaseVendorPopup from './PurchaseVendorPopup'
import "./mobile.css";
import PurchaseItemPopup from './PurchaseItemPopup';
import PurchaseWarehousePopup from './PurchaseWarehousePopup';
import { upperCase } from "upper-case";
import PurchasePopup from './PurchasePopup'
import PurchaseDelDetPopup from './PurchaseDelDetPopup'
import './mobile.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import labels from './Labels';
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader, NotFoundException  } from "@zxing/library";
import LoadingScreen from './Loading';
const config = require('./Apiconfig');


function Purchase() {

  const [paydrop, setPaydrop] = useState([]);
  const [purchasedrop, setPurchasedrop] = useState([]);
  const [rowData, setRowData] = useState([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', purchaseQty: '', ItemTotalWight: '', purchaseAmt: '', TotalTaxAmount: '', TotalItemAmount: '' }]);
  const [rowDataTax, setRowDataTax] = useState([]);
  const [activeTable, setActiveTable] = useState('myTable');
  const [vendor_code, setvendor_code] = useState("");
  const [payType, setPayType] = useState("");
  const [purchaseType, setPurchaseType] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
    const [loading, setLoading] = useState(false);
     const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  };
  const [transactionDate, setTransactionDate] = useState(getTodayDate());
  const [bill_qty, setbill_qty] = useState("");
  const [TotalBill, setTotalBill] = useState('');
  const [TotalTax, setTotalTax] = useState(0)
  const [TotalPurchase, setTotalPurchase] = useState(0)
  const [round_difference, setRoundDifference] = useState(0)
  const [error, setError] = useState("");
  const [selectedPay, setselectedPay] = useState('');
  const [selected, setSelected] = useState(null);
  const [vendor_name, setVendorName] = useState("");
  const [clickedRowIndex, setClickedRowIndex] = useState(null)
  const [global, setGlobal] = useState(null)
  const [globalItem, setGlobalItem] = useState(null)
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [authButtonVisible, setAuthButtonVisible] = useState(false);
  const [printButtonVisible, setPrintButtonVisible] = useState(false);
  const [delButtonVisible, setDelButtonVisible] = useState(false);
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [refNo, setRefNo] = useState("");
  const [financialYearStart, setFinancialYearStart] = useState('');
  const [financialYearEnd, setFinancialYearEnd] = useState('');
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [warehouseDrop, setWarehouseDrop] = useState([]);
  const [screensDrop, setScreensDrop] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedscreens, setSelectedscreens] = useState(null);
  const [Screens, setScreens] = useState('Add');
  const [showDropdown, setShowDropdown] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [status, setStatus] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const[Type,setType]=useState("purchase");
  const[BillDate,setBillDate]=useState("");
  const[vendorcodedrop,setVendorcodedrop]=useState([]);
  const[warehouse_code,setWarehousecode]=useState("");
  
 
  const navigate = useNavigate();

  const location = useLocation();

  const savedPath = sessionStorage.getItem('currentPath');
  
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDefaultoptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;

        const { pay_type, Party_code, warehouse_code, Transaction_type, Party_name } = data[0];
  
        const setDefault = (type, setType, options, setSelected) => {
          if (type) {
            setType(type);
            setSelected(options.find((opt) => opt.value === type) || null);
          }
        };
  
        setDefault(pay_type, setPayType, filteredOptionPay, setselectedPay);
        setDefault(warehouse_code, setWarehousecode, filteredOptionWarehouse, setSelectedWarehouse);
        setDefault(Transaction_type, setPurchaseType,filteredOptionPurchase, setSelected);
  
        if (Party_code) setvendor_code(Party_code);
        if (Party_name) setVendorName(Party_name);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [paydrop, warehouseDrop, purchasedrop, Type]);
  ;

  const handleChangePay = (selectedPay) => {
    setselectedPay(selectedPay);
    setPayType(selectedPay ? selectedPay.value : '');
  };
  
  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0]; // Format the date as 'YYYY-MM-DD'
    setEntryDate(currentDate);
  }, []);


  useEffect(() => {

    const currentPath = location.pathname;
    console.log(`Current path: ${currentPath}`);
    if (savedPath !== '/Purchase') {
      sessionStorage.setItem('screenSelection', 'Add');
    }
  }, [location]);

  useEffect(() => {
    const savedScreen = sessionStorage.getItem('screenSelection');
    if (savedScreen) {
      setSelectedscreens({ value: savedScreen, label: savedScreen === 'Add' ? 'Add' : 'Delete' });
      setScreens(savedScreen);
    } else {
      setSelectedscreens({ value: 'Add', label: 'Add' });
      setScreens('Add');
    }
  }, []);

  const [additionalData, setAdditionalData] = useState({
    modified_by: '',
    created_by: '',
    modified_date: '',
    created_date: ''
  });

  const vendorcode = useRef(null);
  const purchasetype = useRef(null);
  const paytype = useRef(null);
  const DatE = useRef(null);
  const purchasedate = useRef(null);
  const gridRef = useRef(null);

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const purchasePermission = permissions
    .filter(permission => permission.screen_type === 'Purchase')
    .map(permission => permission.permission_type.toLowerCase());

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

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })

      .then((response) => response.json())
      .then((data) => setScreensDrop(data))
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

  const filteredOptionScreens = screensDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));


  const handleChangeScreens = (selected) => {
    setSelectedscreens(selected);
    const screenValue = selected?.value === 'Add' ? 'Add' : 'Delete';
    setScreens(screenValue);

    sessionStorage.setItem('screenSelection', screenValue);
  };


  const handleChangeWarehouse = (selectedPay) => {
    const updatedRowData = rowData.map((row) => {
      return {
        ...row,
        warehouse: selectedPay.value
      };
    });

    setRowData(updatedRowData);
    setSelectedWarehouse(selectedPay);
  };

  //CODE FOR PARTY CODE POPUP 
  const filteredOptionPay = paydrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionPurchase = purchasedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  // const handleChangePay = (selectedPay) => {
  //   setselectedPay(selectedPay);
  //   setPayType(selectedPay ? selectedPay.value : '');
  //   setError(false);
  //   setStatus('Typing...');
  // };

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

  const handlePurchaseDelete = () => {
    setOpen4(true);
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
    const GLobalItem = params.data.itemCode
    console.log(GLobalItem)
    setGlobalItem(GLobalItem)
    setOpen1(true);
    console.log('Opening popup...');
  };


  //CODE FOR TOTAL WEIGHT, TOTAL TAX AND TOTAL AMOUNT CALCULATION
  const ItemAmountCalculation = async (params) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/ItemAmountCalculation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Item_SNO: params.data.serialNumber,
          Item_code: params.data.itemCode,
          bill_qty: params.data.purchaseQty,
          purchaser_amt: params.data.purchaseAmt,
          tax_type_header: params.data.taxType,
          tax_name_details: params.data.taxDetails,
          tax_percentage: params.data.taxPer,
          UnitWeight: params.data.unitWeight,
          keyfield: params.data.keyField
        })
      });

      if (response.ok) {
        const searchData = await response.json();

        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode && row.serialNumber === params.data.serialNumber) {
            const matchedItem = searchData.find(item => {
              console.log("Item ID being checked:", item.id);  // Printing item.id being checked
              return item.id === row.id;
            });
            if (matchedItem) {
              return {
                ...row,
                // Use nullish coalescing to replace null/undefined with 0
                ItemTotalWight: formatToTwoDecimalPoints(matchedItem.ItemTotalWight ?? 0),
                TotalItemAmount: formatToTwoDecimalPoints(matchedItem.TotalItemAmount ?? 0),
                TotalTaxAmount: formatToTwoDecimalPoints(matchedItem.TotalTaxAmount ?? 0)
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
            existingItemWithSameCode.TaxPercentage = item.TaxPercentage ?? 0;
            existingItemWithSameCode.TaxAmount = parseFloat(item.TaxAmount ?? 0).toFixed(2);
          } else {
            const newRow = {
              ItemSNO: item.ItemSNO,
              TaxSNO: item.TaxSNO,
              Item_code: item.Item_code,
              TaxType: item.TaxType,
              TaxPercentage: item.TaxPercentage ?? 0,
              TaxAmount: parseFloat(item.TaxAmount ?? 0).toFixed(2),
              keyfield: item.keyfield,
            };
            updatedRowDataTaxCopy.push(newRow);
            console.log(newRow);
          }
        });

        updatedRowDataTaxCopy.sort((a, b) => a.ItemSNO - b.ItemSNO);
        setRowDataTax(updatedRowDataTaxCopy);

        // Check if any row has purchaseQty defined``
        const hasPurchaseQty = updatedRowData.some(row => row.purchaseQty >= 0);

        if (hasPurchaseQty) {
          const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || 0).join(',');
          const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || 0).join(',');

          // Remove trailing commas if present
          const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
          const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

          console.log("formattedTotalItemAmounts", formattedTotalItemAmounts);
          console.log("formattedTotalTaxAmounts", formattedTotalTaxAmounts);

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
          body: JSON.stringify({ Tax_amount: formattedTotalTaxAmounts, Putchase_amount: formattedTotalItemAmounts,
            company_code:sessionStorage.getItem("selectedCompanyCode")
           }),
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

  //ITEM CODE TO SEARCH IN AG GRID
  const handleItemCode = async (params) => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    setLoading(true)
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
                warehouse: selectedWarehouse ? selectedWarehouse.value : '',
                purchaseAmt: matchedItem.Item_std_purch_price,
                taxType: matchedItem.Item_purch_tax_type,
                taxDetails: matchedItem.combined_tax_details,
                taxPer: matchedItem.combined_tax_percent,
                keyField: `${row.serialNumber || ''}-${matchedItem.Item_code || ''}`,
                purchaseQty: null,
                ItemTotalWight: null,
                TotalTaxAmount: null,
                TotalItemAmount: null
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
    }finally {
      setLoading(false);
    }
  };


  const handleWarehouseCode = async (params) => {

    const itemDetailsSet = rowData.some(
      (row) => row.itemCode === params.data.itemCode && row.itemName
    );

    if (!itemDetailsSet) {
      toast.warning("Please fetch item details first before setting the warehouse.");
      // .then(() => {

      //   const updatedRowData = rowData.map((row) => {
      //     if (row.itemCode === params.data.itemCode) {
      //       return {
      //         ...row,
      //         warehouse: "", // Clear the warehouse field
      //       };
      //     }
      //     return row;
      //   });
      //   setRowData(updatedRowData);
      // });
      return;
    }
    setLoading(true)

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
          if (row.itemCode === params.data.itemCode && row.serialNumber === params.data.serialNumber) {
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
        toast.warning('Data not found!', {
          onClose: () => {
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
          }
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }finally {
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
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), vendor_code: code })
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
          toast.warning('No data found for the given vendor code.');
          setvendor_code('');
          setVendorName('');
        }
      } else if (response.status === 404) {
        toast.warning('No data found for the given vendor code.');
        setvendor_code('');
        setVendorName('');

      } else {
        toast.warning('There was an error with your request.');
        setvendor_code('');
        setVendorName('');
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.warning('An error occurred while fetching the data.');
      setvendor_code('');
      setVendorName('');
    }finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchVendor(vendor_code);
      paytype.current.focus();
    }
  };
  const handleKeyPressRef = (e) => {
    if (e.key === 'Enter') {
      handleRefNo(transactionNumber)
      TransactionStatus(transactionNumber)
      paytype.current.focus();
    }
  };

  const TransactionStatus = async (transactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/purauthstatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_no: transactionNo,
          company_code: sessionStorage.getItem('selectedCompanyCode')
        })
      });
      if (response.ok) {
        const searchData = await response.json();
        if (Array.isArray(searchData)) {
          const formattedOptions = searchData.map(item => ({
            value: item.descriptions,
            label: item.attributedetails_name
          }));
          setStatus(formattedOptions);
          console.log(searchData);
        } else {
          console.log("Data fetched is not in expected array format");
        }
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const handleChangeStatus = (selected) => {
    setSelectedStatus(selected);
    console.log("Selected option:", selected);
  };

  const handleChange = (e) => {
    const vendor = e.target.value;
    setvendor_code(vendor);
  };

  const filteredOptionCode = vendorcodedrop.map((option) => ({
    value: option.vendor_code,
    label: `${option.vendor_code} - ${option.vendor_name}`,
  }));

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    const fetchVendor = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/vendorcode`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const val = await response.json();
        setVendorcodedrop(val);
      } catch (error) {
        console.error('Error fetching Vendors:', error);
      }
    };

    if (company_code) {
      fetchVendor();
    }
  }, []);
        
    


  //CODE ITEM CODE TO ADD NEW ROW FUNCTION
  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex, newValue } = params;
    const lastRowIndex = rowData.length - 1;
    if (colDef.field === 'purchaseQty') {
      const quantity = parseFloat(newValue);

      if (quantity > 0 && rowIndex === lastRowIndex) {
        const serialNumber = rowData.length + 1;
        const newRowData = {
          serialNumber,
          itemName: null,
          unitWeight: null,
          warehouse: selectedWarehouse ? selectedWarehouse.value : '',
          purchaseQty: null,
          totalWeight: null,
          purchaseAmt: null,
          taxAmt: null,
          totalAmt: null,
        };

        setRowData(prevRowData => [...prevRowData, newRowData]);
      }
    }
  };

  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber;

    const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);
    const updatedRowDataTax = rowDataTax.filter(row => Number(row.ItemSNO) !== serialNumberToDelete);

    setRowData(updatedRowData);
    setRowDataTax(updatedRowDataTax);

    if (updatedRowData.length === 0) {
      const newRow = {
        serialNumber: 1,
        delete: '',
        itemCode: '',
        itemName: '',
        search: '',
        unitWeight: '',
        warehouse: '',
        purchaseQty: '',
        ItemTotalWight: '',
        purchaseAmt: '',
        TotalTaxAmount: '',
        TotalItemAmount: ''
      };
      setRowData([newRow]);

      const formattedTotalItemAmounts = '0.00';
      const formattedTotalTaxAmounts = '0.00';

      TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);
    }
    else {
      const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
        ...row,
        serialNumber: index + 1
      }));
      setRowData(updatedRowDataWithNewSerials);

      const updatedRowDataTaxWithNewSerials = updatedRowDataTax.map((taxRow) => {
        const correspondingRow = updatedRowDataWithNewSerials.find(
          (dataRow) => dataRow.keyField === taxRow.keyfield
        );

        return correspondingRow
          ? { ...taxRow, ItemSNO: correspondingRow.serialNumber.toString() }
          : taxRow;
      });
      setRowDataTax(updatedRowDataTaxWithNewSerials);

      const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || '0.00').join(',');
      const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || '0.00').join(',');

      const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
      const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

      TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);
    }
  };

  function qtyValueSetter(params) {

    if (!params.data.warehouse || params.data.warehouse.trim() === "") {
      toast.warning("Please select a warehouse before entering the quantity.");
      return false;
    }

    const newValue = parseFloat(params.newValue);

    if (isNaN(newValue) || params.newValue.toString().trim() === '' || params.newValue.toString().match(/[^0-9.]/)) {
      toast.warning("Please enter a valid numeric quantity.");
      return false;
    }

    if (newValue < 0) {
      toast.warning("Quantity cannot be negative.");
      return false;
    }

    params.data.purchaseQty = newValue;
    return true;
  }

  const [showScanner, setShowScanner] = useState(false);
  const [editingParams, setEditingParams] = useState(null);

  const handleOpenScanner = (params) => {
    setEditingParams(params);
    setShowScanner(true);
  };

  const handleScanComplete = (barcode) => {
    if (editingParams) {
      editingParams.node.setDataValue("itemCode", barcode);
      // handleItemCode(editingParams);
    }
    setShowScanner(false);
  };

  const BarcodeScanner = ({ onClose, onScan }) => {
    const videoRef = useRef(null);
    const scannerRef = useRef(null); // Store scanner instance
    const [cameras, setCameras] = useState([]); // Store available cameras
    const [currentCamera, setCurrentCamera] = useState(null); // Current selected camera
    const [modalVisible, setModalVisible] = useState(true);
  
    useEffect(() => {
      detectAvailableCameras();
  
      return () => {
        stopCamera();
      };
    }, []);
  
    const detectAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
  
        if (videoDevices.length > 0) {
          setCameras(videoDevices);
          const backCamera = videoDevices.find((device) => device.label.toLowerCase().includes('back')) || videoDevices[0];
          setCurrentCamera(backCamera.deviceId);
          startCamera(backCamera.deviceId);
        } else {
          console.error('No video devices found');
        }
      } catch (err) {
        console.error('Error detecting cameras:', err);
      }
    };
  
    const startCamera = async (deviceId) => {
      stopCamera();
  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
        });
  
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
  
        startScanner();
      } catch (err) {
        console.error('Camera access error:', err);
      }
    };
  
    const startScanner = () => {
      if (!scannerRef.current) {
        scannerRef.current = new BrowserMultiFormatReader();
      }
  
      scannerRef.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          onScan(result.getText());
          setModalVisible(false);
        }
      });
    };
  
    const stopCamera = () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  
    const toggleCamera = () => {
      if (cameras.length > 1) {
        const newCamera = cameras.find((cam) => cam.deviceId !== currentCamera);
        if (newCamera) {
          setCurrentCamera(newCamera.deviceId);
          startCamera(newCamera.deviceId);
        }
      }
    };
  
    const handleClose = () => {
      setModalVisible(false);
      onClose();
    };
  
    return (
      <>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: -1 }}></video>
  
        <Modal show={modalVisible} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Scan Barcode</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'black' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%' }}></video>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {cameras.length > 1 && (
              <Button variant="primary" onClick={toggleCamera}>
                Switch Camera
              </Button>
            )}
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  };
  
  const columnDefs = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 80,
      sortable: false,
      editable: false,
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
      headerName: "Item Name",
      field: "itemName",
      editable: false,
      filter: true,
      cellEditorParams: {
        maxLength: 40,
      },
      sortable: false,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 30;
        const showIcons = isWideEnough;

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
                params.value
              )}
            </div>

            {showIcons && (
              <span
                className="icon searchIcon"
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={() => handleClickOpen(params)}
              >
                <i className="fa fa-search"></i>
              </span>
            )}

            {showIcons && (
              <span
                className="icon cameraIcon"
                style={{
                  position: "absolute",
                  right: "-10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={() => handleOpenScanner(params)}
              >
                <i className="fa fa-camera"></i>
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: 'Unit Weight',
      field: 'unitWeight',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Warehouse',
      field: 'warehouse',
      editable: true,
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
      headerName: 'Qty',
      field: 'purchaseQty',
      editable: true,
      filter: true,
      value: { bill_qty },
      sortable: false,
      valueSetter: qtyValueSetter,
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: 'Total Weight',
      field: 'ItemTotalWight',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Unit Price',
      field: 'purchaseAmt',
      editable: true,
      filter: true,
      sortable: false,
      cellEditorParams: {
        maxLength: 18,
      },
    },
    {
      headerName: 'Tax Amount',
      field: 'TotalTaxAmount',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Total',
      field: 'TotalItemAmount',
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Purchase Tax Type',
      field: 'taxType',
      editable: false,
      filter: true,
      hide: true,
      sortable: false
    },
    {
      headerName: 'Tax Detail',
      field: 'taxDetails',
      editable: false,
      filter: true,
      hide: true,
      sortable: false
    },
    {
      headerName: 'tax Percentage',
      field: 'taxPer',
      editable: false,
      filter: true,
      hide: true,
      sortable: false
    },
    {
      headerName: 'KeyField',
      field: 'keyField',
      editable: false,
      filter: true,
      sortable: false,
      hide: true,
    },
  ];

  //DEFINE TAX DETAIL COLUMNS
  const columnDefsTax = [
    {
      headerName: 'S.No',
      field: 'ItemSNO',
      maxWidth: 250,
      sortable: false,
      editable: true
    },
    {
      headerName: 'Tax S.No',
      field: 'TaxSNO',
      // maxWidth: 120,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Item Code',
      field: 'Item_code',
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
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax Amount',
      field: 'TaxAmount',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Keyfield',
      field: 'keyfield',
      sortable: false,
      editable: false,
      hide: true,
    }
  ];

  // Fetch data from APIs
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



  //CODE TO SAVE PURCHASE HEADER 
  const handleSaveButtonClick = async () => {
    if (!vendor_code 
      || !payType || 
      !purchaseType 
      || !entryDate 
      || !transactionDate) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (rowData.length === 0 || rowDataTax.length === 0) {
      toast.warning("No purchase details or tax details found to save.");
      return;
    }

        // Check for itemCode present but purchaseQty missing/invalid
        const invalidRows = rowData.filter(row => row.itemCode && (!row.purchaseQty || row.purchaseQty <= 0));
        if (invalidRows.length > 0) {
          toast.warning("Item code is present but Quantity is missing or zero in one or more rows.");
          return;
        }
      
        // ? Check for purchaseQty present but itemCode missing
        const rowsWithQtyNoItemCode = rowData.filter(row => row.purchaseQty > 0 && (!row.itemCode || row.itemCode.trim() === ''));
        if (rowsWithQtyNoItemCode.length > 0) {
          toast.warning("Quantity is entered but Item Code is missing in one or more rows.");
          return;
        }
      

      

    const filteredRowData = rowData.filter(row => row.purchaseQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0);


    const hasNullWarehouse = filteredRowData.some((row) => !row.warehouse || row.warehouse.trim() === '');
    if (hasNullWarehouse) {
      toast.warning("One or more rows have a null or empty warehouse.");
      return;
    }

    if (filteredRowData.length === 0 || rowDataTax.length === 0) {
      toast.warning("please check purchase Qty, Unit price and Total values are greaterthan Zero");
      return;
    }
    setLoading(true);

    try {
      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        vendor_code: vendor_code,
        pay_type: payType,
        purchase_type: purchaseType,
        Entry_date: entryDate,
        transaction_date: transactionDate,
        purchase_amount: TotalPurchase,
        tax_amount: TotalTax,
        total_amount: TotalBill,
        rounded_off: round_difference,
        created_by: sessionStorage.getItem('selectedUserCode')
      };

      const response = await fetch(`${config.apiBaseUrl}/addpurchasehdrdata`, {
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
        setTransactionNumber(transaction_no);

        
        await savePurchaseDetails(transaction_no);
        await savePurTaxDetails(transaction_no);
        toast.success("Purchase Data inserted Successfully")

        setAuthButtonVisible(false)
        setDelButtonVisible(true)
        setPrintButtonVisible(true)
        setShowExcelButton(true); // Show the Excel button
        console.log("Purchase Header Data inserted successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert Purchase data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }finally {
      setLoading(false);
    }
  };

  //CODE TO SAVE PURCHASE DETAILS
  const savePurchaseDetails = async (transaction_no) => {

    try {
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName && row.purchaseQty > 0
      );

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          created_by: sessionStorage.getItem('selectedUserCode'),
          item_code: row.itemCode,
          item_name: row.itemName,
          weight: row.unitWeight,
          warehouse_code: row.warehouse,
          bill_qty: row.purchaseQty,
          total_weight: row.ItemTotalWight,
          item_amt: row.purchaseAmt,
          bill_rate: row.TotalItemAmount,
          tax_amount: row.TotalTaxAmount,
          vendor_code: vendor_code,
          vendor_name: vendor_name,
          pay_type: payType,
          purchase_type: purchaseType,
          transaction_no: transaction_no,
          transaction_date: transactionDate,
          ItemSNo: row.serialNumber
        };

        const response = await fetch(`${config.apiBaseUrl}/addpurhdetData`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Purchase Detail Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to insert sales data");
          console.error(errorResponse.details || errorResponse.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };


  const savePurTaxDetails = async (transaction_no) => {
    try {
      for (const row of rowData) {
        const matchingTaxRows = rowDataTax.filter(taxRow => taxRow.Item_code === row.itemCode);

        for (const taxRow of matchingTaxRows) {
          const Details = {
            company_code: sessionStorage.getItem('selectedCompanyCode'),
            item_code: row.itemCode,
            item_name: row.itemName,
            vendor_code: vendor_code,
            pay_type: payType,
            transaction_no: transaction_no,
            transaction_date: transactionDate,
            ItemSNo: row.serialNumber,
            TaxSNo: taxRow.TaxSNO,
            tax_type: row.taxType,
            tax_name_details: taxRow.TaxType,
            tax_amt: taxRow.TaxAmount,
            tax_per: taxRow.TaxPercentage,
            created_by: sessionStorage.getItem('selectedUserCode')
          };

          const response = await fetch(`${config.apiBaseUrl}/purtaxdetail`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Details),
          });

          if (response.ok) {
            console.log("Purchase Detail Data inserted successfully");
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert sales data");
            console.error(errorResponse.details || errorResponse.message);
          }
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const PrintHeaderData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberToHeaderPrintData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: transactionNumber, company_code: sessionStorage.getItem('selectedCompanyCode') })
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

  const PrintDetailData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberToDetailPrintData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: transactionNumber, company_code: sessionStorage.getItem('selectedCompanyCode') })
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

  const PrintSumTax = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberToSumTax`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: transactionNumber, company_code: sessionStorage.getItem('selectedCompanyCode') })
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

  const generateReport = async () => {
    setStatus('Generating Report...');
        setLoading(true);

    try {
      const headerData = await PrintHeaderData();
      const detailData = await PrintDetailData();
      const taxData = await PrintSumTax();

      if (headerData && detailData && taxData) {
        console.log("All API calls completed successfully");

        sessionStorage.setItem('PheaderData', JSON.stringify(headerData));
        sessionStorage.setItem('PdetailData', JSON.stringify(detailData));
        sessionStorage.setItem('PtaxData', JSON.stringify(taxData));

        window.open('/PurchasePrint', '_blank');

      } else {
        console.log("Failed to fetch some data");
        toast.error("Transaction No Does Not Exits");
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

    selectedData.forEach(item => {
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
        existingItemWithSameCode.warehouse = selectedWarehouse ? selectedWarehouse.value : ''
        existingItemWithSameCode.keyField = `${existingItemWithSameCode.serialNumber || ''}-${existingItemWithSameCode.itemCode || ''}`;
        existingItemWithSameCode.purchaseQty = null;
        existingItemWithSameCode.ItemTotalWight = null;
        existingItemWithSameCode.TotalTaxAmount = null;
        existingItemWithSameCode.TotalItemAmount = null;
      } else {
        console.log("else");
        highestSerialNumber += 1;
        const newRow = {
          serialNumber: highestSerialNumber,
          itemCode: item.itemCode,
          itemName: item.itemName,
          warehouse: selectedWarehouse ? selectedWarehouse.value : '',
          unitWeight: item.unitWeight,
          purchaseAmt: item.purchaseAmt,
          taxType: item.taxType,
          taxDetails: item.taxDetails,
          taxPer: item.taxPer,
          keyField: `${highestSerialNumber}-${item.itemCode || ''}`,
          purchaseQty: null,
          ItemTotalWight: null,
          TotalTaxAmount: null,
          TotalItemAmount: null
        };
        updatedRowDataCopy.push(newRow);
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
      toast.warning("Please fetch item details first before setting the warehouse.");
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

  const handleVendor = async (data) => {
    if (data && data.length > 0) {
      const [{ VendorCode, VendorName }] = data;
      const upperVendorCode = upperCase(VendorCode);
      const upperVendorName = upperCase(VendorName);
      setvendor_code(upperVendorCode);
      setVendorName(upperVendorName);
    } else {
      console.error('Data is empty or undefined');
    }
  };

  const handleRowClicked = (event) => {
    const clickedRowIndex = event.rowIndex;
    setClickedRowIndex(clickedRowIndex)
  };

  const handleTransactionDateChange = (e) => {
    const date = e.target.value;
    setStatus('Typing...');
    if (date >= financialYearStart && date <= financialYearEnd) {
      setTransactionDate(date);
    } else {
      toast.warning('Transaction date must be between April 1st, 2024 and March 31st, 2025.');
    }
  };

  const handleEntryDateChange = (e) => {
    const date = e.target.value;
    setStatus('Typing...');

    if (transactionDate && new Date(date) > new Date(transactionDate)) {
      toast.warning("Entry Date cannot be after the Transaction Date.");
      return;
    }

    setEntryDate(date);

    if (date >= financialYearStart && date <= financialYearEnd) {
      setEntryDate(date);
    } else {
      toast.warning('Entry date must be between April 1st, 2024 and March 31st, 2025.');
    }

  };



  const onColumnMoved = (params) => {
    const columnState = JSON.stringify(params.columnApi.getColumnState());
    localStorage.setItem('myColumnState', columnState);
  };

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
        setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/getPurchaseData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: code,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.warning("Data not found");
          clearFormFields();
          setRowDataTax([]);
        } else {
          const errorResponse = await response.json();
          toast.error(errorResponse.message || "An error occurred");
        }
        return;
      }

      const searchData = await response.json();
      setShowExcelButton(true);
      setShowDropdown(true);
      setAuthButtonVisible(true);
      setPrintButtonVisible(true);
      setSaveButtonVisible(false);

      if (searchData.table1 && searchData.table1.length > 0) {
        const item = searchData.table1[0];
        setEntryDate(formatDate(item.Entry_date));
        setPayType(item.pay_type);
        setPurchaseType(item.purchase_type);
        setTransactionDate(formatDate(item.transaction_date));
        setTransactionNumber(item.transaction_no);
        setvendor_code(item.vendor_code);
        setTotalPurchase(formatToTwoDecimalPoints(item.purchase_amount));
        setTotalTax(formatToTwoDecimalPoints(item.tax_amount));
        setTotalBill(formatToTwoDecimalPoints(item.total_amount));
        setRoundDifference(formatToTwoDecimalPoints(item.rounded_off));

        const selectedPay = filteredOptionPurchase.find(
          (option) => option.value === item.purchase_type
        );
        setSelected(selectedPay);
        setPurchaseType(selectedPay.value);

        const selected = filteredOptionPay.find(
          (option) => option.value === item.pay_type
        );
        setselectedPay(selected);
        setPayType(selected.value);
      } else {
        console.log("Header Data is empty or not found");
        clearFormFields();
      }

      if (searchData.table2 && searchData.table2.length > 0) {

        setVendorName(searchData.table2.vendor_name);
        const updatedRowData = searchData.table2.map((item) => {
          const taxDetailsList = searchData.table3.filter(
            (taxItem) => taxItem.item_code === item.item_code
          );

          const taxDetails = taxDetailsList
            .map((taxItem) => taxItem.tax_name_details)
            .join(",");
          const taxPer = taxDetailsList
            .map((taxItem) => taxItem.tax_per)
            .join(",");
          const taxType =
            taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;

          setVendorName(item.vendor_name);

          return {
            serialNumber: item.ItemSNo,
            itemCode: item.item_code,
            itemName: item.item_name,
            unitWeight: item.weight,
            warehouse: item.warehouse_code,
            purchaseQty: item.bill_qty,
            ItemTotalWight: parseFloat(item.total_weight).toFixed(2),
            purchaseAmt: item.item_amt,
            TotalTaxAmount: parseFloat(item.tax_amount).toFixed(2),
            TotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
            taxType: taxType || null,
            taxPer: taxPer || null,
            taxDetails: taxDetails || null,
          };
        });

        setRowData(updatedRowData);
      } else {
        console.log("Detail Data is empty or not found");
        setRowData([
          {
            serialNumber: 1,
            delete: "",
            itemCode: "",
            itemName: "",
            search: "",
            unitWeight: 0,
            warehouse: "",
            purchaseQty: 0,
            ItemTotalWight: 0,
            purchaseAmt: 0,
            TotalTaxAmount: 0,
            TotalItemAmount: 0,
          },
        ]);
      }

      if (searchData.table3 && searchData.table3.length > 0) {
        const updatedRowDataTax = searchData.table3.map((item) => {
          return {
            ItemSNO: item.ItemSNo,
            TaxSNO: item.TaxSNo,
            Item_code: item.item_code,
            TaxType: item.tax_name_details,
            TaxPercentage: item.tax_per,
            TaxAmount: parseFloat(item.tax_amt).toFixed(2),
            TaxName: item.tax_type,
          };
        });

        console.log(updatedRowDataTax);
        setRowDataTax(updatedRowDataTax);
      } else {
        console.log("Tax Data is empty or not found");
        setRowDataTax([]);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error(error.message || "Failed to fetch data");
    }
    finally {
      setLoading(false);
    }
  };

  const clearFormFields = () => {
    setEntryDate("");
    setPayType("");
    setPurchaseType("");
    setTransactionDate("");
    setTransactionNumber("");
    setvendor_code("");
    setTotalPurchase("");
    setTotalTax("");
    setTotalBill("");
    setRoundDifference("");
    setSelected("");
    setselectedPay("");
    setRowData([
      {
        serialNumber: 1,
        delete: "",
        itemCode: "",
        itemName: "",
        search: "",
        unitWeight: 0,
        warehouse: "",
        purchaseQty: 0,
        ItemTotalWight: 0,
        purchaseAmt: 0,
        TotalTaxAmount: 0,
        TotalItemAmount: 0,
      },
    ]);
    setRowDataTax([]);
  };

  const handlePurchaseData = async (data) => {
    if (data && data.length > 0) {
      setShowExcelButton(true)
      setPrintButtonVisible(true)
      setAuthButtonVisible(true)
      setSaveButtonVisible(false)
      setUpdateButtonVisible(false)
      setShowDropdown(true);

      const [{ TransactionNo, TransactionDate, Entrydate, PurchaseType, PayType, TotalTax, Amount, VendorName, TotalAmount, Vendorcode, RoundOff }] = data;

      const transactionNumber = document.getElementById('transactionNumber');
      if (transactionNumber) {
        transactionNumber.value = TransactionNo;
        setTransactionNumber(TransactionNo);
      } else {
        console.error('transactionNumber element not found');
      }
      const roundOff = document.getElementById('roundOff');
      if (roundOff) {
        roundOff.value = RoundOff;
        setRoundDifference(RoundOff);
      } else {
        console.error('transactionNumber element not found');
      }

      const entrydate = document.getElementById('entryDate');
      if (entrydate) {
        entrydate.value = Entrydate;
        setEntryDate(formatDate(Entrydate));
      } else {
        console.error('entry element not found');
      }

      const transactiondate = document.getElementById('transactionDate');
      if (transactiondate) {
        transactiondate.value = TransactionDate;
        setTransactionDate(formatDate(TransactionDate));
      } else {
        console.error('entry element not found');
      }

      const purchasetype = document.getElementById('purchaseType');
      if (purchasetype) {
        const selectedPay = filteredOptionPurchase.find(option => option.value === PurchaseType);
        setSelected(selectedPay);
        setPurchaseType(selectedPay.value);
      } else {
        console.error('entry element not found');
      }

      const paytype = document.getElementById('paytype');
      if (paytype) {
        const selectedPay = filteredOptionPay.find(option => option.value === PayType);
        setselectedPay(selectedPay);
        setPayType(selectedPay.value);
      } else {
        console.error('entry element not found');
      }

      const totalPurchaseAmount = document.getElementById('totalPurchaseAmount');
      if (totalPurchaseAmount) {
        totalPurchaseAmount.value = Amount;
        setTotalPurchase(formatToTwoDecimalPoints(Amount));
      } else {
        console.error('transactionNumber element not found');
      }

      const totalTaxAmount = document.getElementById('totalTaxAmount');
      if (totalTaxAmount) {
        totalTaxAmount.value = TotalTax;
        setTotalTax(formatToTwoDecimalPoints(TotalTax));
      } else {
        console.error('transactionNumber element not found');
      }

      const totalBillAmount = document.getElementById('totalBillAmount');
      if (totalBillAmount) {
        totalBillAmount.value = TotalAmount;
        setTotalBill(formatToTwoDecimalPoints(TotalAmount));
      } else {
        console.error('transactionNumber element not found');
      }

      const partyCode = document.getElementById('party_code');
      if (partyCode) {
        partyCode.value = Vendorcode;
        setvendor_code(Vendorcode);
      } else {
        console.error('transactionNumber element not found');
      }

      const partyName = document.getElementById('party_name');
      if (partyName) {
        partyName.value = VendorName;
        setVendorName(VendorName);
      } else {
        console.error('transactionNumber element not found');
      }

      TransactionStatus(TransactionNo)
      await PurchaseTax(TransactionNo);

    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  };

  const PurchaseTax = async (TransactionNo) => {
        setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/getpurchasereturntax`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: TransactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newTaxDetail = [];
        const taxNameDetailsArray = [];
        const taxPer = [];
        let taxType = '';
        searchData.forEach(({ ItemSNo, TaxSNo, item_code, tax_name_details, tax_per, tax_amt, tax_type }) => {
          newTaxDetail.push({
            ItemSNO: ItemSNo,
            TaxSNO: TaxSNo,
            Item_code: item_code,
            TaxType: tax_name_details,
            TaxPercentage: tax_per,
            TaxAmount: parseFloat(tax_amt).toFixed(2),
            TaxName: tax_type
          });
          taxNameDetailsArray.push(tax_name_details);
          taxPer.push(tax_per);
          taxType = tax_type;
        });

        const taxNameDetailsString = taxNameDetailsArray.join(',');
        const taxPerDetaiString = taxPer.join(',');

        setRowDataTax(newTaxDetail);

        PurchaseDetail(TransactionNo, taxNameDetailsString, taxPerDetaiString, taxType);
      } else if (response.status === 404) {
        console.log("Data not found");
        setRowDataTax([])
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

const PurchaseDetail = async (TransactionNo, taxNameDetailsString, taxPerDetaiString, taxType) => {
  setLoading(true);

  try {
    const response = await fetch(`${config.apiBaseUrl}/getpurchasereturnit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction_no: TransactionNo,
        company_code: sessionStorage.getItem("selectedCompanyCode")
      })
    });

    if (response.ok) {
      const searchData = await response.json();

      if (searchData.length === 0) {
        setRowData([
          {
            serialNumber: 1,
            delete: "",
            itemCode: "",
            itemName: "",
            search: "",
            unitWeight: 0,
            warehouse: "",
            purchaseQty: 0,
            ItemTotalWight: 0,
            purchaseAmt: 0,
            TotalTaxAmount: 0,
            TotalItemAmount: 0,
          },
        ]);
        return;
      }

      const newRowData = searchData.map(item => ({
        serialNumber: item.ItemSNo,
        itemCode: item.item_code,
        itemName: item.item_name,
        unitWeight: item.weight,
        purchaseQty: item.bill_qty,
        warehouse: item.warehouse_code,
        ItemTotalWight: parseFloat(item.total_weight).toFixed(2),
        purchaseAmt: parseFloat(item.item_amt).toFixed(2),
        TotalTaxAmount: parseFloat(item.tax_amount).toFixed(2),
        TotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
        taxType: taxType,
        taxPer: taxPerDetaiString,
        taxDetails: taxNameDetailsString,
      }));

      setRowData(newRowData);

      // ✅ Set vendor name from the first item (if consistent)
      setVendorName(searchData[0].vendor_name);

    } else if (response.status === 404) {
      setRowData([
        {
          serialNumber: 1,
          delete: "",
          itemCode: "",
          itemName: "",
          search: "",
          unitWeight: 0,
          warehouse: "",
          purchaseQty: 0,
          ItemTotalWight: 0,
          purchaseAmt: 0,
          TotalTaxAmount: 0,
          TotalItemAmount: 0,
        },
      ]);
    } else {
      const errorResponse = await response.json();
      toast.warning(errorResponse.message || "Failed to insert sales data");
      console.error(errorResponse.details || errorResponse.message);
    }
  } catch (error) {
    console.error("Error fetching search data:", error);
  } finally {
    setLoading(false);
  }
};

  const handleDeleteHeader = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/purdeletehdrData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNumber,
          modified_by : sessionStorage.getItem("selectedUserCode")

        })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", transactionNumber);
        return true
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.details || errorResponse.message);
        return errorResponse.details || errorResponse.message;
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const handleDeleteDetail = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/purDeleteDetailData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNumber })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", transactionNumber);
        return true
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const handleDeleteTaxDetail = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/purDeleteTaxData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNumber })
      });
      if (response.ok) {
        return true
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const handleDeleteButtonClick = async () => {
    if (!transactionNumber) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    setLoading(true);

    try {
      const taxDetailResult = await handleDeleteTaxDetail();
      const detailResult = await handleDeleteDetail();
      const headerResult = await handleDeleteHeader();


      if (headerResult && detailResult && taxDetailResult) {
        console.log("Data Deleted Successfully");
        toast.success("Data Deleted Successfully", {
          autoClose: false,
          onClose: () => {
            window.location.reload();
          }
        });
      } else {
        toast.error(`${headerResult}`);
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      toast.error('Error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
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

  //purchase deleted code
  const [rowDataDelete, setRowDataDelete] = useState([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', purchaseQty: '', ItemTotalWight: '', purchaseAmt: '', TotalTaxAmount: '', TotalItemAmount: '' }]);
  const [rowDataTaxDelete, setRowDataTaxDelete] = useState([]);
  const [deletePayType, setDeletePayType] = useState("");
  const [deletePurchaseType, setDeletePurchaseType] = useState("");
  const [deleteEntryDate, setDeleteEntryDate] = useState("");
  const [deleteTransactionDate, setDeleteTransactionDate] = useState("");
  const [deleteTotalBill, setDeleteTotalBill] = useState('');
  const [deleteTotalTax, setDeleteTotalTax] = useState(0)
  const [deleteTotalPurchase, setDeleteTotalPurchase] = useState(0)
  const [deleteRoundDifference, setDeleteRoundDifference] = useState(0)
  const [deleteVendorName, setDeleteVendorName] = useState("")
  const [deleteVendorCode, setDeleteVendorCode] = useState("");


  const columnDeletedDefs = [
    {
      headerName: 'S.No',
      field: 'deleteSerialNumber',
      maxWidth: 80,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Item Code',
      field: 'deleteItemCode',
      editable: false,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
      autoComplete: false
    },
    {
      headerName: 'Item Name',
      field: 'deleteItemName',
      editable: false,
      filter: true,
      cellEditorParams: {
        maxLength: 40,
      },
      sortable: false
    },
    {
      headerName: 'Unit Weight',
      field: 'deleteUnitWeight',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Warehouse',
      field: 'deleteWarehouse',
      editable: false,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
      autoComplete: false
    },
    {
      headerName: ' Qty',
      field: 'deletePurchaseQty',
      editable: false,
      filter: true,
      value: { bill_qty },
      sortable: false,
      autoComplete: false,
    },
    {
      headerName: 'Total Weight',
      field: 'deleteItemTotalWight',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Unit Price',
      field: 'deletePurchaseAmt',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Tax Amount',
      field: 'deleteTotalTaxAmount',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Total',
      field: 'deleteTotalItemAmount',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Purchase Tax Type',
      field: 'taxType',
      editable: false,
      filter: true,
      hide: true,
      sortable: false
    },
    {
      headerName: 'Tax Detail',
      field: 'taxDetails',
      editable: false,
      filter: true,
      hide: true,
      sortable: false
    },
    {
      headerName: 'tax Percentage',
      field: 'taxPer',
      editable: false,
      filter: true,
      hide: true,
      sortable: false
    },
  ];

  //DEFINE TAX DETAIL COLUMNS
  const columnDeletedDefsTax = [
    {
      headerName: 'S.No',
      field: 'deleteItemSNO',
      maxWidth: 80,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax S.No',
      field: 'deleteTaxSNO',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Item Code',
      field: 'deleteItem_code',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax Type ',
      field: 'deleteTaxType',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax %',
      field: 'deleteTaxPercentage',
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax Amount',
      field: 'deleteTaxAmount',
      sortable: false,
      editable: false
    }
  ];
  const handlePurchaseDeleteData = async (data) => {
    if (data && data.length > 0) {
      const [{ TransactionNo, TransactionDate, Entrydate, PurchaseType, PayType, TotalTax, Amount, VendorName, TotalAmount, Vendorcode, RoundOff }] = data;

      const transactionNumber = document.getElementById('RefNo');
      if (transactionNumber) {
        transactionNumber.value = TransactionNo;
        setRefNo(TransactionNo);
      } else {
        console.error('transactionNumber element not found');
      }
      const roundOff = document.getElementById('roundOff');
      if (roundOff) {
        roundOff.value = RoundOff;
        setDeleteRoundDifference(RoundOff);
      } else {
        console.error('transactionNumber element not found');
      }

      const entrydate = document.getElementById('entryDate');
      if (entrydate) {
        entrydate.value = Entrydate;
        setDeleteEntryDate(formatDate(Entrydate));  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const payType = document.getElementById('payType');
      if (payType) {
        payType.value = PayType;
        setDeletePayType(PayType);  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const purchaseType = document.getElementById('purchaseType');
      if (purchaseType) {
        purchaseType.value = PurchaseType;
        setDeletePurchaseType(PurchaseType);  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const transactiondate = document.getElementById('transactionDate');
      if (transactiondate) {
        transactiondate.value = TransactionDate;
        setDeleteTransactionDate(formatDate(TransactionDate));  // You can choose to use formattedDate instead if required
      } else {
        console.error('entry element not found');
      }

      const totalPurchaseAmount = document.getElementById('totalPurchaseAmount');
      if (totalPurchaseAmount) {
        totalPurchaseAmount.value = Amount;
        setDeleteTotalPurchase(formatToTwoDecimalPoints(Amount));
      } else {
        console.error('transactionNumber element not found');
      }

      const totalTaxAmount = document.getElementById('totalTaxAmount');
      if (totalTaxAmount) {
        totalTaxAmount.value = TotalTax;
        setDeleteTotalTax(formatToTwoDecimalPoints(TotalTax));
      } else {
        console.error('transactionNumber element not found');
      }

      const totalBillAmount = document.getElementById('totalBillAmount');
      if (totalBillAmount) {
        totalBillAmount.value = TotalAmount;
        setDeleteTotalBill(formatToTwoDecimalPoints(TotalAmount));
      } else {
        console.error('transactionNumber element not found');
      }

      const partyCode = document.getElementById('party_code');
      if (partyCode) {
        partyCode.value = Vendorcode;
        setDeleteVendorCode(Vendorcode);
      } else {
        console.error('transactionNumber element not found');
      }
      const partyName = document.getElementById('party_code');
      if (partyName) {
        partyName.value = VendorName;
        setDeleteVendorName(VendorName);
      } else {
        console.error('transactionNumber element not found');
      }

      await PurchaseDeletedTax(TransactionNo);

    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  };

  const PurchaseDeletedTax = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/purdeletedtax`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: TransactionNo })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newTaxDetail = [];
        const taxNameDetailsArray = [];
        const taxPer = [];
        let taxType = '';
        searchData.forEach(({ ItemSNo, TaxSNo, item_code, tax_name_details, tax_per, tax_amt, tax_type }) => {
          newTaxDetail.push({
            deleteItemSNO: ItemSNo,
            deleteTaxSNO: TaxSNo,
            deleteItem_code: item_code,
            deleteTaxType: tax_name_details,
            deleteTaxPercentage: tax_per,
            deleteTaxAmount: parseFloat(tax_amt).toFixed(2),
            TaxName: tax_type
          });
          taxNameDetailsArray.push(tax_name_details);
          taxPer.push(tax_per);
          taxType = tax_type;
        });

        const taxNameDetailsString = taxNameDetailsArray.join(',');
        const taxPerDetaiString = taxPer.join(',');

        setRowDataTaxDelete(newTaxDetail);

        PurchaseDeletedDetail(TransactionNo, taxNameDetailsString, taxPerDetaiString, taxType);
      } else if (response.status === 404) {
        setRowDataTaxDelete([])
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const PurchaseDeletedDetail = async (TransactionNo, taxNameDetailsString, taxPerDetaiString, taxType) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/purdeletedunit`, {
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
            item_name,
            weight,
            warehouse_code,
            bill_qty,
            total_weight,
            item_amt,
            tax_amount,
            bill_rate,
          } = item;

          newRowData.push({
            deleteSerialNumber: ItemSNo,
            deleteItemCode: item_code,
            deleteItemName: item_name,
            deleteUnitWeight: weight,
            deletePurchaseQty: bill_qty,
            deleteWarehouse: warehouse_code,
            deleteItemTotalWight: parseFloat(total_weight).toFixed(2),
            deletePurchaseAmt: parseFloat(item_amt).toFixed(2),
            deleteTotalTaxAmount: parseFloat(tax_amount).toFixed(2),
            deleteTotalItemAmount: parseFloat(bill_rate).toFixed(2),
            taxType: taxNameDetailsString,
            taxPer: taxPerDetaiString,
            taxDetails: taxType,
          });
        });
        setRowDataDelete(newRowData);

      } else if (response.status === 404) {
        setRowDataDelete([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: 0, warehouse: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }])
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };


  const handleKeyDeleteRef = (e) => {
    if (e.key === 'Enter') {
      handleDeletedRefNo(refNo)
    }
  };

  const handleDeletedRefNo = async (code) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/getPurchaseDeleteDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: code }) // Send company_no and company_name as search criteria
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.warning("Data not found");
          clearFormFields();
          setRowDataTax([]);
        } else {
          const errorResponse = await response.json();
          toast.error(errorResponse.message || "An error occurred");
        }
        return;
      }

      const searchData = await response.json();
      if (searchData.table1 && searchData.table1.length > 0) {
        const item = searchData.table1[0];
        setDeleteEntryDate(formatDate(item.Entry_date));
        setDeletePayType(item.pay_type);
        setRefNo(item.transaction_no);
        setDeletePurchaseType(item.purchase_type);
        setDeleteTransactionDate(formatDate(item.transaction_date));
        setDeleteVendorCode(item.vendor_code);
        setDeleteTotalPurchase(formatToTwoDecimalPoints(item.purchase_amount));
        setDeleteTotalTax(formatToTwoDecimalPoints(item.tax_amount));
        setDeleteTotalBill(formatToTwoDecimalPoints(item.total_amount));
        setDeleteRoundDifference(formatToTwoDecimalPoints(item.rounded_off));

      } else {
        console.log("Header Data is empty or not found");
        setDeleteEntryDate('');
        setDeletePayType('');
        setRefNo('');
        setSelected('');
        setselectedPay('')
        setDeleteTransactionDate('');
        setDeleteVendorCode('');
        setDeleteVendorName('');
        setDeleteTotalPurchase('');
        setDeleteTotalTax('');
        setDeleteRoundDifference('');
        setDeleteTotalBill('')
      }

      if (searchData.table2 && searchData.table2.length > 0) {

        const updatedRowData = searchData.table2.map(item => {
          // Find all tax details from table3 that correspond to the current item in table2
          const taxDetailsList = searchData.table3.filter(taxItem => taxItem.item_code === item.item_code);

          // Extract and join tax types and percentages as comma-separated strings
          const taxType = taxDetailsList.map(taxItem => taxItem.tax_name_details).join(",");
          const taxPer = taxDetailsList.map(taxItem => taxItem.tax_per).join(",");
          const taxDetails = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;

          setDeleteVendorName(item.vendor_name)
          return {
            deleteSerialNumber: item.ItemSNo,
            deleteItemCode: item.item_code,
            deleteItemName: item.item_name,
            deleteUnitWeight: item.weight,
            deleteWarehouse: item.warehouse_code,
            deletePurchaseQty: item.bill_qty,
            deleteItemTotalWight: parseFloat(item.total_weight).toFixed(2),
            deletePurchaseAmt: item.item_amt,
            deleteTotalTaxAmount: parseFloat(item.tax_amount).toFixed(2),
            deleteTotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
            taxType: taxType || null,
            taxPer: taxPer || null,
            taxDetails: taxDetails || null
          };
        });

        setRowDataDelete(updatedRowData);
      } else {
        console.log("Detail Data is empty or not found");
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: 0, warehouse: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }])
      }

      if (searchData.table3 && searchData.table3.length > 0) {

        const updatedRowDataTax = searchData.table3.map(item => {
          return {
            deleteItemSNO: item.ItemSNo,
            deleteTaxSNO: item.TaxSNo,
            deleteItem_code: item.item_code,
            deleteTaxType: item.tax_name_details,
            deleteTaxPercentage: item.tax_per,
            deleteTaxAmount: parseFloat(item.tax_amt).toFixed(2),
            TaxName: item.tax_type
          };
        });

        console.log(updatedRowDataTax);
        setRowDataTaxDelete(updatedRowDataTax);
      } else {
        console.log("Tax Data is empty or not found");
        setRowDataTax([])
      }

      console.log("data fetched successfully")

    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error(error.message || "Failed to fetch data");
    }finally {
      setLoading(false);
    }
  };

  const handleExcelDownload = () => {
    const filteredRowData = rowData.filter(row => row.purchaseQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0);
    const filteredRowDataTax = rowDataTax.filter(taxRow => taxRow.TaxAmount > 0 && taxRow.TaxPercentage > 0);

    const headerData = [{
      company_code: sessionStorage.getItem('selectedCompanyCode'),
      vendor_code: vendor_code,
      pay_type: payType,
      purchase_type: purchaseType,
      Entry_date: entryDate,
      transaction_no: transactionNumber,
      transaction_date: transactionDate,
      purchase_amount: TotalPurchase,
      tax_amount: TotalTax,
      total_amount: TotalBill,
      rounded_off: round_difference
    }];

    const headerSheet = XLSX.utils.json_to_sheet(headerData);
    const rowDataSheet = XLSX.utils.json_to_sheet(filteredRowData);
    const rowDataTaxSheet = XLSX.utils.json_to_sheet(filteredRowDataTax);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Purchase Details");
    XLSX.utils.book_append_sheet(workbook, rowDataTaxSheet, "Tax Details");

    XLSX.writeFile(workbook, "purchase_data.xlsx");
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

  const handleAddRow = () => {
    const serialNumber = rowData.length + 1;
    const newRow = { serialNumber, itemCode: '', itemName: '', unitWeight: 0, warehouse: selectedWarehouse ? selectedWarehouse.value : '', purchaseQty: 0, ItemTotalWight: '', purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', purchaseQty: '', ItemTotalWight: '', purchaseAmt: '', TotalTaxAmount: '', TotalItemAmount: '' }]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };

  const handleAuthorizedButtonClick = async () => {
        setLoading(true);
  if (!status || 
      !transactionNumber) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    try {
      const headerResponse = await AuthorizedHeader();
      const detailsResponse = await AuthorizedDetails();
      const taxDetailsResponse = await AuthorizedTaxDetails();

      if (headerResponse && detailsResponse && taxDetailsResponse) {
        toast.success("Bill Status Updated Successfully");
      }
    } catch (error) {
      toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const AuthorizedHeader = async () => {
      

    try {
      const response = await fetch(`${config.apiBaseUrl}/PurchaseAuthHdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_no: transactionNumber,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          authroization_status: selectedStatus.value
        })
      });
      if (response.ok) {
        return true;
      } else {
        toast.error("Failed to Update data");
      }
    } catch (error) {
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const AuthorizedDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/PurchaseAuthDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_no: transactionNumber,
          authroization_status: selectedStatus.value
        })
      });
      if (response.ok) {
        return true;
      } else {
        toast.error("Failed to Update data");
      }
    } catch (error) {
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const AuthorizedTaxDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/PurchaseAuthTaxDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_no: transactionNumber,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          authroization_status: selectedStatus.value
        })
      });
      if (response.ok) {
        return true;
      } else {
        toast.error("Failed to Update data");
      }
    } catch (error) {
      toast.error('Error inserting data: ' + error.message);
    }
  };
  const navigateToPurchaseSettings = () => {
    navigate('/PurchaseSetting'); // Adjust the path as per your route setup
  };


  return (
    <div className="">
      {Screens === 'Add' ? (
        <div className="container-fluid Topnav-screen">
                {loading && <LoadingScreen />}
        
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 align="left" className="purbut me-5">Purchase</h1>
                </div>
                <div className="d-flex justify-content-end purbut me-3">
                  <div class="exp-form-floating">
                    <Select
                      id="returnType"
                      className="exp-input-field col-md-6 mt-2"
                      placeholder=""
                      required
                      value={selectedscreens}
                      onChange={handleChangeScreens}
                      options={filteredOptionScreens}
                      data-tip="Please select a default warehouse"
                    />
                  </div>
                  {saveButtonVisible && ['add', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                    <savebutton className="purbut" title='Save' onClick={handleSaveButtonClick}>
                      <i class="fa-regular fa-floppy-disk"></i>
                    </savebutton>
                  )}
                  
                   {authButtonVisible && (
                 <savebutton className="purbut" onClick={handleAuthorizedButtonClick} >
                    <i class="fa-solid fa-check"></i>
                  </savebutton>
                   )}

                  {delButtonVisible && ['delete', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                    <delbutton className="purbut" onClick={handleDeleteButtonClick} title='delete' >
                      <i class="fa-solid fa-trash"></i>
                    </delbutton>
                  )}
                  {printButtonVisible && ['all permission', 'view'].some(permission => purchasePermission.includes(permission)) && (
                    <printbutton className="purbut" title="print" onClick={generateReport} >
                      <i class="fa-solid fa-file-pdf"></i>
                    </printbutton>
                  )}
                  {showExcelButton && (
                    <printbutton className="purbut" title='excel' onClick={handleExcelDownload}>
                      <i class="fa-solid fa-file-excel"></i>
                    </printbutton>
                  )}
                  <printbutton className="purbut" title='Reload' onClick={handleReload} >
                    <i class="fa-solid fa-arrow-rotate-right"></i>
                  </printbutton>
             <a className='border-none text-dark p-1 mt-2' title='Setting' onClick={navigateToPurchaseSettings} style={{ cursor: "pointer" }}>
                      <svg xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="feather feather-settings">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 
           1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 
           1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 
           1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 
           1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 
           1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 
           2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 
           1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 
           1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 
           1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 
           1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 
           0-1.51 1z"/>
                      </svg>
                    </a>
                </div>
                
              </div>
              <div class="mobileview">
                <div class="d-flex justify-content-between">
                  <div className="d-flex justify-content-start">
                    <h1 align="left" className="h1">Purchase</h1>
                  </div>
                  <div class="dropdown mt-1 ms-5" style={{ paddingLeft: 0 }}>

                    <button class="btn btn-primary dropdown-toggle p-1 ms-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fa-solid fa-list"></i>
                    </button>
                    <ul class="dropdown-menu menu">
                      {saveButtonVisible && (
                        <li class="iconbutton d-flex justify-content-center text-success">
                          {['add', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                            <icon class="icon" onClick={handleSaveButtonClick}>
                              <i class="fa-regular fa-floppy-disk"></i>
                            </icon>
                          )}
                        </li>
                      )}
                      <li class="iconbutton d-flex justify-content-center text-success">
                        <icon class="icon" onClick={handleAuthorizedButtonClick}>
                          <i class="fa-solid fa-check"></i>
                        </icon>
                      </li>
                      <li class="iconbutton  d-flex justify-content-center text-danger">
                        {['delete', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                          <icon class="icon" onClick={handleDeleteButtonClick}>
                            <i class="fa-solid fa-trash"></i>
                          </icon>
                        )}
                      </li>
                      <li class="iconbutton  d-flex justify-content-center text-warning">
                        {['all permission', 'view'].some(permission => purchasePermission.includes(permission)) && (
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
              <div className="row ms-3 me-3">
                {showDropdown && (
                  <div className="col-md-3 form-group mb-2">
                    <label for="" className={`${error && !status ? 'red' : ''}`}>Status</label>
                                        <span className="text-danger">*</span>

                    <div class="exp-form-floating">
                      <Select
                        id="returnType"
                        className="exp-input-field"
                        placeholder="Select an option"
                        options={status}
                        value={selectedStatus}
                        onChange={handleChangeStatus}
                        getOptionLabel={(option) => option.label || ""}
                        getOptionValue={(option) => option.value || ""}
                      />
                    </div>
                  </div>
                )}
                <div className="col-md-3 form-group mb-2">
                  <label htmlFor="party_code" className={`${error && !transactionNumber ? 'red' : ''}`}>Transaction No</label>
                  <div className="exp-form-floating">
                    <div class="d-flex justify-content-end">
                      <input
                        id="transactionNumber"
                        className="exp-input-field form-control justify-content-start"
                        type="text"
                        placeholder=""
                        required
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value)}
                        maxLength={50}
                        onKeyPress={handleKeyPressRef}
                        autoComplete='off'
                      />
                      <div className='position-absolute mt-1 me-2'>
                        <span className="icon searchIcon"
                          onClick={handlePurchase}>
                          <i class="fa fa-search"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2" >
                  <div class="exp-form-floating" >
                    <label for="" className={`${error && !transactionDate ? 'red' : ''}`}>Transaction Date</label>
                    <span className="text-danger">*</span>
                    <input
                      name="transactionDate"
                      id="transactionDate"
                      className="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required
                      min={financialYearStart}
                      max={financialYearEnd}
                      value={transactionDate}
                      onChange={handleTransactionDateChange}
                      ref={purchasedate}
                      onKeyDown={(e) => handleKeyDown(e, vendorcode, purchasedate)}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <label htmlFor="party_code" className={`${error && !vendor_code ? 'red' : ''}`}>
                    Vendor Code<span className="text-danger">*</span>
                  </label>
                  <div className="exp-form-floating">
                    <div class="d-flex justify-content-end">
                      <input
                        className="exp-input-field form-control justify-content-start"
                        id='party_code'
                        required
                        value={vendor_code}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        // options={filteredOptionCode}

                        maxLength={18}
                        autoComplete='off'
                        ref={vendorcode} // Attach ref to Vendor Code
                      />
                      <div className='position-absolute mt-1 me-2'>
                        <span className="icon searchIcon"
                          onClick={handleShowModal}>
                          <i class="fa fa-search"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <label id="partyName">Vendor Name</label>
                  <div class="exp-form-floating">
                    <input
                      className="exp-input-field form-control"
                      id='party_name'
                      required
                      value={vendor_name}
                      onChange={(e) => setVendorName(e.target.value)}
                      title="please fill out this field"
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2"><label for="" className={`${error && !payType ? 'red' : ''}`}>Pay Type
                  <span className="text-danger">*</span>
                </label>
                  <div class="exp-form-floating">
                    <div title="select a payment type">
                    <Select
                      id="paytype"
                      value={selectedPay}
                      onChange={handleChangePay}
                      options={filteredOptionPay}
                      className="exp-input-field"
                      placeholder=""
                      required
                      data-tip="Please select a payment type"
                      onKeyDown={(e) => handleKeyDown(e, purchasetype, paytype)} // No next field after this
                      ref={paytype} // Attach ref to Purchase Type
                    />
                  </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                 
                    <label className={`${error && !purchaseType ? 'red' : ''}`}> Purchase Type</label>
                    <span className="text-danger">*</span>
                     <div class="exp-form-floating">
                      <div title="select a payment type">
                    <Select
                      id="purchaseType"
                      value={selected}
                      onChange={handleChangePurchase}
                      options={filteredOptionPurchase}
                      className="exp-input-field"
                      placeholder=""
                      onKeyDown={(e) => handleKeyDown(e, DatE, purchasetype)} // No next field after this
                      ref={purchasetype} // Attach ref to Purchase Type
                    />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="entryDate" className={`${error && !entryDate ? 'red' : ''}`}> Entry Date</label>
                    <span className="text-danger">*</span>
                    <input
                      id="entryDate"
                      className="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required
                      min={financialYearStart}
                      max={financialYearEnd}
                      value={entryDate}
                      onChange={handleEntryDateChange}
                      ref={DatE}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <label for="">Default Warehouse</label>
                  <div class="exp-form-floating">
                    <div title="Select a Default warehouse">
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
              <div>
                <div className='row ms-3 me-3 mb-3'>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="" class="exp-form-labels" className="">Total Amount</label>
                      <input
                        id="totalPurchaseAmount"
                        class="exp-input-field form-control input"
                        type="text"
                        placeholder=""
                        required
                        value={TotalPurchase}
                        onChange={(e) => setTotalPurchase(e.target.value)}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="" class="exp-form-labels" className=""> Total Tax </label>
                      <input
                        name="totalTaxAmount"
                        id="totalTaxAmount"
                        text="text"
                        className="exp-input-field form-control input"
                        placeholder=""
                        required
                        value={TotalTax}
                        onChange={(e) => setTotalTax(e.target.value)}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="" class="exp-form-labels" className="">Round Off</label>
                      <input
                        name=""
                        id="roundOff"
                        type="text"
                        className="exp-input-field form-control input"
                        placeholder=""
                        required
                        value={round_difference}
                        onChange={(e) => setRoundDifference(e.target.value)}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="" class="exp-form-labels" className="">Total Bill Amount</label>
                      <input
                        name=""
                        id="totalBillAmount"
                        type="text"
                        className="exp-input-field form-control input"
                        placeholder=""
                        required
                        value={TotalBill}
                        onChange={(e) => setTotalBill(e.target.value)}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2" style={{ display: "none" }}>
                <div className="exp-form-floating">
    <label id="customer">Screen Type</label>
    <input
      className="exp-input-field form-control"
      id="customername"
      required
      value={Type}
      onChange={(e) => setType(e.target.value)}
    />
  </div>
  </div>
              </div>
              <div class="d-flex justify-content-between " style={{ marginBlock: "", marginTop: "10px" }} >
                <div className="purbut">
                  <div align="left" class="d-flex justify-content-start ms-5">
                    <purButton
                      type="button"
                      className={`"toggle-btn"  ${activeTable === 'myTable' ? 'active' : ''}`}
                      onClick={() => handleToggleTable('myTable')}>
                      Item Details
                    </purButton>
                    <purButton
                      type="button"
                      className={`"toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`}
                      onClick={() => handleToggleTable('tax')}>
                      Tax Details
                    </purButton>
                  </div>
                </div>
                <div className='mobileview'>
                  <div align="left" class="d-flex justify-content-start ms-1">
                    <purButton
                      type="button"
                      className={`"toggle-btn"  ${activeTable === 'myTable' ? 'active' : ''}`}
                      onClick={() => handleToggleTable('myTable')}>
                      Item Details
                    </purButton>
                    <purButton
                      type="button"
                      className={`"toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`}
                      onClick={() => handleToggleTable('tax')}>
                      Tax Details
                    </purButton>
                  </div></div>
                <div className='purbut'>
                  <div class="d-flex justify-content-end" style={{ marginRight: "50px" }}>
                    <icon
                      type="button"
                      className="popups-btn "
                      onClick={handleAddRow}>
                      <FontAwesomeIcon icon={faPlus} />
                    </icon>
                    <icon
                      type="button"
                      className="popups-btn"
                      onClick={handleRemoveRow}>
                      <FontAwesomeIcon icon={faMinus} />
                    </icon>
                  </div></div>

                <div className='mobileview'>
                  <div class="d-flex justify-content-start" >
                    <icon
                      type="button"
                      className="popups-btn fs-6 ms-0 text-dark "
                      onClick={handleAddRow}>
                      <FontAwesomeIcon icon={faPlus} />
                    </icon>
                    <icon
                      type="button"
                      className="popups-btn fs-6 ms-0 text-dark"
                      onClick={handleRemoveRow}>
                      <FontAwesomeIcon icon={faMinus} />
                    </icon>
                  </div></div>
              </div>

              <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                <AgGridReact
                  columnDefs={activeTable === 'myTable' ? columnDefs : columnDefsTax}
                  rowData={activeTable === 'myTable' ? rowData : rowDataTax}
                  defaultColDef={{ editable: true, resizable: true }}
                  onCellValueChanged={async (event) => {
                    if (event.colDef.field === 'purchaseQty' || event.colDef.field === 'purchaseAmt') {
                      await ItemAmountCalculation(event);
                    }
                    handleCellValueChanged(event);
                  }}
                  onGridReady={(params) => {
                    setGridApi(params.api); // Save the gridApi reference
                  }}
                  onRowClicked={handleRowClicked}
                  onColumnMoved={onColumnMoved}
                />
              </div>
            </div>
          </div>
          <div>
            <PurchaseItemPopup open={open} handleClose={handleClose} handleItem={handleItem} />
            <PurchaseWarehousePopup open={open1} handleClose={handleClose} handleWarehouse={handleWarehouse} />
            <PurchaseVendorPopup open={open2} handleClose={handleClose} handleVendor={handleVendor} />
            <PurchasePopup open={open3} handleClose={handleClose} handlePurchaseData={handlePurchaseData} />
            {showScanner && (
              <BarcodeScanner onClose={() => setShowScanner(false)} onScan={handleScanComplete} />
            )}
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
      ) : (
        <div className="container-fluid Topnav-screen">
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 align="left" className="purbut me-5" >Deleted Purchase</h1>
                  
                </div>
                 <div class="exp-form-floating">
                    <Select
                      id="returnType"
                      className="exp-input-field col-md-6 mt-2"
                      placeholder=""
                      required
                      value={selectedscreens}
                      onChange={handleChangeScreens}
                      options={filteredOptionScreens}
                      data-tip="Please select a default warehouse"
                    />
                  </div>
                
              </div>
              <div class="mobileview">
                <div class="d-flex justify-content-between">
                  <div className="d-flex justify-content-start">
                    <h1 align="left" className="h1">Deleted Purchase</h1>
                  </div>
                
                </div>
              </div>
            </div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded  pt-3 pb-4" align="left">
              <div className="status justify-content-center mb-3">{status}</div>
              <div >
                <div className="row ms-3 me-3">
                  <div className="col-md-3 form-group mb-2">
                    <label htmlFor="party_code">Transaction No</label>
                    <div className="exp-form-floating">
                      <div class="d-flex justify-content-end">
                        <input
                          id="RefNo"
                          className="exp-input-field form-control justify-content-start"
                          type="text"
                          placeholder=""
                          maxLength={50}
                          required
                          value={refNo}
                          onChange={(e) => setRefNo(e.target.value)}
                          onKeyPress={handleKeyDeleteRef}
                          autoComplete='off'
                        />
                        <div className='position-absolute mt-1 me-2'>
                          <span className="icon searchIcon"
                            onClick={handlePurchaseDelete}>
                            <i class="fa fa-search"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2" >
                    <div class="exp-form-floating" >
                      <label for="" className="">Transaction Date</label>
                     
                      <input
                        name="transactionDate"
                        id="transactionDate"
                        className="exp-input-field form-control"
                        type="date"
                        placeholder=""
                        required
                        min={financialYearStart}
                        max={financialYearEnd}
                        value={deleteTransactionDate}
                        onChange={(e) => setDeleteTransactionDate(e.target.value)}
                        title="please Enter the Transaction date"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <label htmlFor="party_code" className="">
                      Vendor Code
                    </label>

                    <div className="exp-form-floating">
                      <div class="d-flex justify-content-between">
                        <input
                          className="exp-input-field form-control"
                          id='party_code'
                          required
                          value={deleteVendorCode}
                          maxLength={18}
                          autoComplete='off'
                          readOnly
                          title='please fill out of this field'
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2"> <label id="partyName">Vendor Name</label>
                    <div class="exp-form-floating">
                      <input
                        className="exp-input-field form-control"
                        id='party_name'
                        required
                        value={deleteVendorName}
                        onChange={(e) => setDeleteVendorName(e.target.value)}
                        readOnly
                        title='please fill out of this field'
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2"><label for="" className={`${error && !payType ? 'red' : ''}`}>Pay Type
                   
                  </label>
                    <div class="exp-form-floating">
                      <input
                        id="payType"
                        value={deletePayType}
                        className="exp-input-field form-control"
                        placeholder=""
                        required
                        isDisabled={true}
                        data-tip="Please select a payment type"
                        title='please fill out of this field'
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label className=""> Purchase Type</label>
                     
                      <input
                        id="purchaseType"
                        value={deletePurchaseType}
                        className="exp-input-field form-control"
                        placeholder=""
                        isDisabled={true}
                        title='please fill out of this field'
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="entryDate" className=""> Entry Date</label>
                      
                      <input
                        id="entryDate"
                        className="exp-input-field form-control"
                        type="date"
                        placeholder=""
                        required
                        min={financialYearStart}
                        max={financialYearEnd}
                        value={deleteEntryDate}
                        onChange={(e) => setDeleteEntryDate(e.target.value)}
                        readOnly
                        title="please enter the entrydate"
                      />
                    </div>
                  </div>

                  {/* <div className="col-md-3 form-group mb-2">
                    <label className={`${error && !Screens ? 'red' : ''}`}>Screens</label>
                    <div class="exp-form-floating">
                      <Select
                        id="returnType"
                        className="exp-input-field"
                        placeholder=""
                        required
                        value={selectedscreens}
                        onChange={handleChangeScreens}
                        options={filteredOptionScreens}
                        data-tip="Please select a default warehouse"
                      />
                    </div>
                  </div> */}
                </div>
                <div className='row  ms-3 me-3'>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="" class="exp-form-labels" className="">Total Amount</label>
                      <input
                        id="totalPurchaseAmount"
                        class="exp-input-field form-control input"
                        type="text"
                        placeholder=""
                        required
                        value={deleteTotalPurchase}
                        onChange={(e) => setDeleteTotalPurchase(e.target.value)}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="" class="exp-form-labels" className=""> Total Tax </label>
                      <input
                        name="totalTaxAmount"
                        id="totalTaxAmount"
                        text="text"
                        className="exp-input-field form-control input"
                        placeholder=""
                        required
                        value={deleteTotalTax}
                        onChange={(e) => setDeleteTotalTax(e.target.value)}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="" class="exp-form-labels" className="">Round Off</label>
                      <input
                        name=""
                        id="roundOff"
                        type="text"
                        className="exp-input-field form-control input"
                        placeholder=""
                        required
                        value={deleteRoundDifference}
                        onChange={(e) => setDeleteRoundDifference(e.target.value)}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="" class="exp-form-labels" className="">Total Bill Amount</label>
                      <input
                        name=""
                        id="totalBillAmount"
                        type="text"
                        className="exp-input-field form-control input"
                        placeholder=""
                        required
                        value={deleteTotalBill}
                        onChange={(e) => setDeleteTotalBill(e.target.value)}
                        readOnly
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
                  <purButton
                    type="button"
                    className={`"toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`}
                    onClick={() => handleToggleTable('tax')}>
                    Tax Details
                  </purButton>

                </div>
              </div>
              <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                <AgGridReact
                  columnDefs={activeTable === 'myTable' ? columnDeletedDefs : columnDeletedDefsTax}
                  rowData={activeTable === 'myTable' ? rowDataDelete : rowDataTaxDelete}
                  defaultColDef={{ editable: true, resizable: true }}
                />
              </div>
            </div>
          </div>
          <div>
            <PurchaseDelDetPopup open={open4} handleClose={handleClose} handlePurchaseDeleteData={handlePurchaseDeleteData} />
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
      )}
    </div>
  );
}

export default Purchase;