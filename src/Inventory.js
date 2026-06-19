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
import "./mobile.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Select from 'react-select';
import SalesVendorPopup from './SalesVendorPopup';
import SalesItemPopup from './ItemPopup';
import SalesWarehousePopup from './WarehousePopup';
import SalesHdrPopup from './SalesPopup'
import SalesDeletedPopup from './SalesdeletePopup';
import labels from './Labels';
import { useLocation } from 'react-router-dom';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from "react-bootstrap";
import { BrowserMultiFormatReader } from "@zxing/library";
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

function Sales() {

  // State variables
  const [paydrop, setPaydrop] = useState([]);
  const [orderdrop, setOrderdrop] = useState([]);
  const [salesdrop, setSalesdrop] = useState([]);
  const [rowData, setRowData] = useState([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: 0, warehouse: '', salesQty: 0, salesMode: '', discount: 0, ItemTotalWeight: 0, purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' }]);
  const [rowDataTax, setRowDataTax] = useState([]);
  const [activeTable, setActiveTable] = useState('myTable');
  const [customerCode, setCustomerCode] = useState("");
  const [payType, setPayType] = useState("");
  const [salesType, setSalesType] = useState("");
  const [delvychellanno, setDelvychellanno] = useState("");
  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState("");
  const [selectedPay, setSelectedPay] = useState(null);
  const [selectedSales, setSelectedSales] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [TotalBill, setTotalBill] = useState(0);
  const [TotalTax, setTotalTax] = useState(0)
  const [Totalsales, setTotalsales] = useState(0)
  const [round_difference, setRoundDifference] = useState(0)
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [status, setStatus] = useState('');
  const [customerName, setCustomerName] = useState("");
  const [global, setGlobal] = useState(null)
  const [globalItem, setGlobalItem] = useState(null)
  const [orderType, setOrderType] = useState(null);
  const [warehouseDrop, setWarehouseDrop] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedscreens, setSelectedscreens] = useState(null);
  const [Screens, setScreens] = useState(null);
  const [screensDrop, setScreensDrop] = useState([]);
  const [additionalData, setAdditionalData] = useState({
    modified_by: '',
    created_by: '',
    modified_date: '',
    created_date: ''
  });
  const [refNo, setRefNo] = useState("");
  const paytype = useRef(null);
  const SaleS = useRef(null);
  const billdate = useRef(null);
  const dc = useRef(null);
  const order = useRef(null);
  const [updated, setupdated] = useState(false)
  const [authorizeButton, setAuthorizeButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [deleteButtonVisible, setDeleteButtonVisible] = useState(false);
  const [printButtonVisible, setPrintButtonVisible] = useState(false);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const location = useLocation();
  const savedPath = sessionStorage.getItem('currentPath');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [salesModeDrop, setSalesModeDrop] = useState([]);
  const [selectedSalesMode, setSelectedSalesMode] = useState(null);
  const [salesMode, setSalesMode] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);
  const [returnAmount, setReturnAmount] = useState(0);
  const [warehouse, setWarehouse] = useState('');
  const navigate = useNavigate();
  const [showAsterisk, setShowAsterisk] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [Type, setType] = useState("sales");
  const [rowDataTerms, setRowDataTerms] = useState([{ serialNumber: 1, Terms_conditions: '' }]);
  const [itemCodeDrop, setItemCodeDrop] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');

  //code added by Harish purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const sales = permissions
    .filter(permission => permission.screen_type === 'Sales')
    .map(permission => permission.permission_type.toLowerCase());


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDefaultoptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;

        const { Sales_mode, pay_type, sales_type, order_type, Party_code, warehouse_code, Transaction_type, Party_name } = data[0];

        const setDefault = (type, setType, options, setSelected) => {
          if (type) {
            setType(type);
            setSelected(options.find((opt) => opt.value === type) || null);
          }
        };

        setDefault(Sales_mode, setSalesMode, filteredOptionSalesMode, setSelectedSalesMode);
        setDefault(pay_type, setPayType, filteredOptionPay, setSelectedPay);
        setDefault(sales_type, setSalesType, filteredOptionSales, setSelectedSales);
        setDefault(order_type, setOrderType, filteredOptionOrder, setSelectedOrder);
        setDefault(warehouse_code, setWarehouse, filteredOptionWarehouse, setSelectedWarehouse);
        setDefault(Transaction_type, setSalesType, filteredOptionSales, setSelectedSales);

        if (Party_code) setCustomerCode(Party_code);
        if (Party_name) setCustomerName(Party_name);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [paydrop, salesModeDrop, salesdrop, orderdrop, warehouseDrop, salesdrop]);

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0]; // Format the date as 'YYYY-MM-DD'
    setBillDate(currentDate);
  }, []);


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

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

  useEffect(() => {
    const currentPath = location.pathname;
    console.log(`Current path: ${currentPath}`);
    if (savedPath !== '/Sales') {
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


  // Save to sessionStorage and update state when user changes selection
  const handleChangeScreens = (selected) => {
    setSelectedscreens(selected);
    const screenValue = selected?.value === 'Add' ? 'Add' : 'Delete';
    setScreens(screenValue);

    // Save the selection to sessionStorage
    sessionStorage.setItem('screenSelection', screenValue);
  };

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

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getSalesMode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setSalesModeDrop(data);
        if (data.length > 0) {
          const firstOption = {
            value: data[0].attributedetails_name,
            label: data[0].attributedetails_name,
          };
          setSelectedSalesMode(firstOption);
          setSalesMode(firstOption.value);
        }
      })
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

  const filteredOptionSalesMode = Array.isArray(salesModeDrop)
    ? salesModeDrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];

  const handleChangeSalesMode = (selectedSalesMode) => {
    setSelectedSalesMode(selectedSalesMode);
    setSalesMode(selectedSalesMode ? selectedSalesMode.value : '');
    setError(false);
  };

  const filteredOptionWarehouse = warehouseDrop.map((option) => ({
    value: option.warehouse_code,
    label: option.warehouse_code,
  }));

  const handleChangeWarehouse = (selectedOption) => {
    setSelectedWarehouse(selectedOption);
    setWarehouse(selectedOption ? selectedOption.value : '');
  };
  const handleShowModal = () => {
    setOpen2(true);
  };

  const handleSalesData = () => {
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
    const GlobalItem = params.data.itemCode
    setGlobalItem(GlobalItem)
    setOpen1(true);
    console.log('Opening popup...');
  };

  const handleChangeNo = (e) => {
    const refNo = e.target.value;
    setBillNo(refNo);
  }

  const handleShowModall = () => {
    setOpen3(true);
  };

  const ItemSalesAmountCalculation = async (params) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getSalesItemAmountCalculation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Item_SNO: params.data.serialNumber, Item_code: params.data.itemCode, bill_qty: params.data.salesQty, discount: params.data.discount, item_amt: params.data.purchaseAmt,
          tax_type_header: params.data.taxType, tax_name_details: params.data.taxDetails, tax_percentage: params.data.taxPer, UnitWeight: params.data.unitWeight, keyfield: params.data.keyField, company_code: sessionStorage.getItem("selectedCompanyCode")
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
                ItemTotalWeight: formatToTwoDecimalPoints(matchedItem.ItemTotalWeight ?? 0),
                TotalItemAmount: formatToTwoDecimalPoints(matchedItem.TotalItemAmount ?? 0),
                TotalTaxAmount: formatToTwoDecimalPoints(matchedItem.TotalTaxAmount ?? 0),
                discountAmount: formatToTwoDecimalPoints(matchedItem.DiscountAmount ?? 0),
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
          }
        });

        updatedRowDataTaxCopy.sort((a, b) => a.ItemSNO - b.ItemSNO);
        setRowDataTax(updatedRowDataTaxCopy);

        const hasSalesQty = updatedRowData.some(row => row.salesQty >= 0);

        if (hasSalesQty) {
          const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || 0).join(',');
          const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || 0).join(',');

          const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
          const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

          await TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);

          console.log("TotalAmountCalculation executed successfully");
        } else {
          console.log("No rows with Sales Qty greater than 0 found");
        }

        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.error);
        toast.error(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    }
  };


  const TotalAmountCalculation = async (formattedTotalTaxAmounts, formattedTotalItemAmounts) => {
    if (parseFloat(formattedTotalTaxAmounts) >= 0 && parseFloat(formattedTotalItemAmounts) >= 0) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/SalesTotalAmountCalculation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Tax_amount: formattedTotalTaxAmounts, sale_amt: formattedTotalItemAmounts, company_code: sessionStorage.getItem("selectedCompanyCode") }),
        });
        if (response.ok) {
          const data = await response.json();
          console.log(typeof (data))
          const [{ rounded_amount, round_difference, TotalSales, TotalTax }] = data;
          setTotalBill(formatToTwoDecimalPoints(rounded_amount));
          setRoundDifference(formatToTwoDecimalPoints(round_difference));
          setTotalsales(formatToTwoDecimalPoints(TotalSales));
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
      const response = await fetch(`${config.apiBaseUrl}/getItemCodeSalesData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code, Item_code: params.data.itemCode, type: salesMode })
      });

      if (response.ok) {
        const searchData = await response.json();
        setIsLocked(true);
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                itemCode: matchedItem.Item_code,
                itemName: matchedItem.Item_name,
                unitWeight: matchedItem.Item_wigh,
                discount: matchedItem.discount_Percentage,
                purchaseAmt: matchedItem.Item_std_sales_price,
                taxType: matchedItem.Item_sales_tax_type,
                taxDetails: matchedItem.combined_tax_details,
                taxPer: matchedItem.combined_tax_percent,
                keyField: `${row.serialNumber || ''}-${matchedItem.Item_code || ''}`,
                salesQty: null,
                warehouse: selectedWarehouse ? selectedWarehouse.value : '',
                ItemTotalWeight: null,
                TotalTaxAmount: null,
                TotalItemAmount: null
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
              if (row.itemCode === params.data.itemCode) {
                return {
                  ...row,
                  itemCode: '',
                  itemName: '',
                  unitWeight: 0,
                  purchaseAmt: 0,
                  discount: 0,
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
        return false;
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("Error fetching data: " + error.message);
      return false;
    } finally {
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
      //   
      //   const updatedRowData = rowData.map((row) => {
      //     if (row.itemCode === params.data.itemCode) {
      //       return {
      //         ...row,
      //         warehouse: "", 
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
          if (row.itemCode === params.data.itemCode) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
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
    } finally {
      setLoading(false);
    }

  }


  //CODE FOR PARTY CODE TO GET PARTY NAME
  const handleSearchCustomer = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getCustomerCode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), customer_code: code }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        if (searchData.length > 0) {
          const [{ customer_code, customer_name }] = searchData
          setCustomerCode(customer_code);
          setCustomerName(customer_name);

          console.log("data fetched successfully")
        }
      } else if (response.status === 404) {
        toast.warning('Data not found');
        setCustomerCode('');
        setCustomerName('');
      } else {
        toast.warning('There was an error with your request.');
        setCustomerCode('');
        setCustomerName('');
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error('Error inserting data: ' + error.message);
      setCustomerCode('');
      setCustomerName('');
    }finally {
      setLoading(false);
    }

  };

  const handleKeyPressRef = async (e) => {
    if (e.key === 'Enter') {
      const isSuccess = await handleRefNo(billNo);
      if (isSuccess) {
        TransactionStatus(billNo);
      }
    }
  };

  const TransactionStatus = async (billNo) => {
    console.log(TransactionStatus)
    try {
      const response = await fetch(`${config.apiBaseUrl}/salauthstatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bill_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchCustomer(customerCode);
      // paytype.current.focus();
    }
  };

  const handleChange = (e) => {
    const Customer = e.target.value;
    setCustomerCode(Customer);
  };

  //CODE ITEM CODE TO ADD NEW ROW FUNCTION
  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex } = params;
    const lastRowIndex = rowData.length - 1;

    if (colDef.field === 'salesQty' && rowIndex === lastRowIndex) {
      const serialNumber = rowData.length + 1;
      const newRowData = {
        serialNumber, delete: null, itemName: null, unitWeight: null, warehouse: null, salesQty: 0, totalWeight: null, purchaseAmt: null, taxAmt: null, totalAmt: null
      };
      setRowData(prevRowData => [...prevRowData, newRowData]);
    }
  };

  const handleRowClicked = (event) => {
    const clickedRowIndex = event.rowIndex;
    console.log(clickedRowIndex)
  };

  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber; // Assuming itemCode is used to identify the row

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
    } else {
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
      toast.warning('Please select a warehouse before entering the quantity.');
      return false;
    }

    const newValue = parseFloat(params.newValue);

    if (isNaN(newValue) || params.newValue.toString().trim() === '' || params.newValue.toString().match(/[^0-9.]/)) {
      toast.warning('Please enter a valid numeric quantity.');
      return false;
    }
    if (newValue < 0) {
      toast.warning('Quantity cannot be negative.');
      return false;
    }

    params.data.salesQty = newValue;
    return true;
  }

  //mobile scanner functionality code
  const [showScanner, setShowScanner] = useState(false);
  const [editingParams, setEditingParams] = useState(null);

  const handleOpenScanner = (params) => {
    setEditingParams(params);
    setShowScanner(true);
  };

  const handleScanComplete = (barcode) => {
    if (editingParams) {
      editingParams.node.setDataValue("itemCode", barcode);
    }
    setShowScanner(false);
  };

  const BarcodeScanner = ({ onClose, onScan }) => {
    const videoRef = useRef(null);
    const scannerRef = useRef(null);

    useEffect(() => {
      detectBackCamera();

      return () => {
        stopCamera();
      };
    }, []);

    const detectBackCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");

        if (videoDevices.length > 0) {
          // Try to find the back camera first
          const backCamera = videoDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || videoDevices[0];

          startCamera(backCamera.deviceId);
        } else {
          console.error("No video devices found");
        }
      } catch (err) {
        console.error("Error detecting cameras:", err);
      }
    };

    const startCamera = async (deviceId) => {
      stopCamera();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId }, facingMode: "environment" }, // Force back camera on mobile
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        startScanner();
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    const startScanner = () => {
      if (!scannerRef.current) {
        scannerRef.current = new BrowserMultiFormatReader();
      }

      scannerRef.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result) {
          onScan(result.getText());
        }
      });
    };

    const stopCamera = () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };

    const handleClose = () => {
      stopCamera();
      onClose();
    };

    return (
      <Modal show={true} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan Barcode</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ width: "100%", height: "300px", display: "flex", justifyContent: "center", alignItems: "center", background: "black" }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%" }}></video>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };


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
      onCellClicked: handleDelete,
      cellRenderer: function (params) {
        return <FontAwesomeIcon icon="fa-solid fa-trash" style={{ cursor: 'pointer', marginRight: "12px" }} />
      },
      sortable: false,
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    },
    {
      headerName: 'Item Code',
      field: 'itemCode',
      editable: !showExcelButton,
      // maxWidth: 140,
      filter: true,
      onCellValueChanged: function (params) {
        handleItemCode(params);
      },
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Item Name',
      field: 'itemName',
      editable: false,
      filter: true,
      // minWidth: 300,
      // maxWidth: 300,
      cellEditorParams: {
        maxLength: 40,
      },
      sortable: false,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 30;
        const showIcons = isWideEnough;

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

            {showIcons && (
              <span
                className="icon searchIcon"
                style={{
                  position: 'absolute',
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
      sortable: false,
    },
    {
      headerName: 'Unit Weight',
      field: 'unitWeight',
      editable: false,
      // maxWidth: 150,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Warehouse',
      field: 'warehouse',
      editable: !showExcelButton,
      filter: true,
      // maxWidth: 200,
      // minWidth: 200,
      cellEditorParams: {
        maxLength: 18,
      },
      onCellValueChanged: function (params) {
        handleWarehouseCode(params);
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
                onClick={() => handleOpen(params)}
              >
                <i className="fa fa-search"></i>
              </span>
            )}
          </div>
        );
      },
      sortable: false,
    },
    {
      headerName: 'Qty',
      field: 'salesQty',
      editable: !showExcelButton,
      // maxWidth: 140,
      filter: true,
      valueSetter: qtyValueSetter,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Discount %',
      field: 'discount',
      editable: false,
      hide: true,
      // maxWidth: 140,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Total Weight',
      field: 'ItemTotalWeight',
      editable: false,
      // minWidth: 150,
      // maxWidth: 150,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Unit Price',
      field: 'purchaseAmt',
      editable: !showExcelButton,
      // maxWidth: 170,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Discount Amount',
      field: 'discountAmount',
      editable: false,
      // minWidth: 180,
      // maxWidth: 180,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Tax Amount',
      field: 'TotalTaxAmount',
      editable: false,
      // minWidth: 150,
      // maxWidth: 150,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Total',
      field: 'TotalItemAmount',
      editable: false,
      filter: true,
      // minWidth: 135,
      // maxWidth: 175,
      sortable: false,
    },
    {
      headerName: 'Purchase Tax Type',
      field: 'taxType',
      editable: true,
      // maxWidth: 150,
      filter: true,
      sortable: false,
      hide: true
    },
    {
      headerName: 'Tax Detail',
      field: 'taxDetails',
      editable: true,
      // maxWidth: 150,
      filter: true,
      sortable: false,
      hide: true
    },
    {
      headerName: 'tax Percentage',
      field: 'taxPer',
      editable: true,
      // maxWidth: 150,
      filter: true,
      sortable: false,
      hide: true,
    },
    {
      headerName: 'KeyField',
      field: 'keyField',
      editable: false,
      // maxWidth: 150,
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
      maxWidth: 80,
    },
    {
      headerName: 'Tax S.No',
      field: 'TaxSNO',
      maxWidth: 120,
    },
    {
      headerName: 'Item Code',
      field: 'Item_code',
      // minWidth: 401
    },
    {
      headerName: 'Tax Type ',
      field: 'TaxType',
      // minWidth: 401,
    },
    {
      headerName: 'Tax %',
      field: 'TaxPercentage',
      // minWidth: 401
    },
    {
      headerName: 'Tax Amount',
      field: 'TaxAmount',
      // minWidth: 401,
    },
    {
      headerName: 'Keyfield',
      field: 'keyfield',
      // minWidth: 301,
      sortable: false,
      editable: false,
      hide: true,
    }
  ];

  // Fetch data from APIs
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/paytype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => setPaydrop(data))
      .catch((error) => console.error("Error fetching payment types:", error));

    fetch(`${config.apiBaseUrl}/salestype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => setSalesdrop(data))
      .catch((error) => console.error("Error fetching sales types:", error));

    fetch(`${config.apiBaseUrl}/ordertype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => setOrderdrop(data))
      .catch((error) => console.error("Error fetching Order type:", error));
  }, []);

  const filteredOptionPay = paydrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionSales = salesdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionOrder = orderdrop.map((option) => {
    const words = option.attributedetails_name.trim().split(/\s+/);

    const formattedName = words.map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        return word.toLowerCase();
      }
    }).join(' ');

    return {
      value: formattedName,
      label: formattedName,
    };
  });

  const handleChangePay = (selectedOption) => {
    setSelectedPay(selectedOption);
    setPayType(selectedOption ? selectedOption.value : '');
  };

  const handleChangeSales = (selectedOption) => {
    setSelectedSales(selectedOption);
    setSalesType(selectedOption ? selectedOption.value : '');
  };

  const handleChangeOrder = (selectedOption) => {
    setSelectedOrder(selectedOption);
    setOrderType(selectedOption ? selectedOption.value : '');
  };


  //CODE TO SAVE PURCHASE HEADER 
  const handleSaveButtonClick = async () => {
    if (!customerCode || !payType || !billDate || !salesType) {
      setError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }

    if (rowData.length === 0 || rowDataTax.length === 0) {
      toast.warning('No Sales details or tax details found to save.');
      return;
    }

    const filteredRowData = rowData.filter(row => row.salesQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0);

    const hasNullWarehouse = filteredRowData.some((row) => !row.warehouse || row.warehouse.trim() === '');
    if (hasNullWarehouse) {
      toast.warning('One or more rows have a null or empty warehouse.');
      return;
    }

    if (filteredRowData.length === 0 || rowDataTax.length === 0) {
      toast.warning('please check purchase Qty, Unit price and Total values are greaterthan Zero');
      return;
    }
setLoading(true)
    try {
      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        customer_code: customerCode,
        customer_name: customerName,
        pay_type: payType,
        sales_type: salesType,
        order_type: orderType,
        bill_date: billDate,
        sale_amt: Totalsales,
        tax_amount: TotalTax,
        bill_amt: TotalBill,
        roff_amt: round_difference,
        dely_chlno: delvychellanno,
        sales_mode: salesMode,
        paid_amount: paidAmount,
        return_amount: returnAmount,
        created_by: sessionStorage.getItem('selectedUserCode')
      };
      const response = await fetch(`${config.apiBaseUrl}/addsaleshdrdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        const [{ transaction_no }] = searchData;
        setBillNo(transaction_no);

        toast.success("Data inserted Successfully");

        await saveInventoryDetails(transaction_no);
        await saveInventoryTaxDetails(transaction_no);
        await saveTermsandCondition(transaction_no);
        setShowExcelButton(true);
        setDeleteButtonVisible(true);
        setPrintButtonVisible(true);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.error);
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Error inserting data: " + error.message);
    }finally {
      setLoading(false);
    }

  };


  //CODE TO SAVE PURCHASE DETAILS
  const saveInventoryDetails = async (transaction_no) => {
    try {
      // Filter out invalid rows (empty or incomplete rows)
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName && row.salesQty > 0
      );

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          bill_no: transaction_no,
          item_code: row.itemCode,
          item_name: row.itemName,
          weight: row.unitWeight,
          warehouse_code: row.warehouse,
          bill_qty: row.salesQty,
          total_weight: row.ItemTotalWeight,
          item_amt: row.purchaseAmt,
          bill_rate: row.TotalItemAmount,
          customer_code: customerCode,
          customer_name: customerName,
          pay_type: payType,
          sales_type: salesType,
          bill_date: billDate,
          dely_chlno: delvychellanno,
          ItemSNo: row.serialNumber,
          tax_amt: row.TotalTaxAmount,
          discount: row.discount,
          discount_amount: row.discountAmount,
          created_by: sessionStorage.getItem('selectedUserCode')
        };
        const response = await fetch(`${config.apiBaseUrl}/addsalesdetData`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Sales Detail Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          console.error(errorResponse.error);
          toast.warning(errorResponse.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const saveInventoryTaxDetails = async (transaction_no) => {
    try {
      const savedRows = new Set();
      for (const row of rowData) {
        const matchingTaxRows = rowDataTax.filter(taxRow => taxRow.Item_code === row.itemCode);

        for (const taxRow of matchingTaxRows) {
          const uniqueKey = `${transaction_no}-${taxRow.ItemSNO}-${taxRow.TaxSNO}`;

          if (savedRows.has(uniqueKey)) {
            continue;
          }
          const Details = {
            company_code: sessionStorage.getItem('selectedCompanyCode'),
            bill_no: transaction_no,
            item_code: row.itemCode,
            item_name: row.itemName,
            customer_code: customerCode,
            pay_type: payType,
            bill_date: billDate,
            ItemSNo: row.serialNumber,
            TaxSNo: taxRow.TaxSNO,
            tax_type: row.taxType,
            tax_name_details: taxRow.TaxType,
            tax_amt: taxRow.TaxAmount,
            tax_per: taxRow.TaxPercentage,
            created_by: sessionStorage.getItem('selectedUserCode')
          };

          const response = await fetch(`${config.apiBaseUrl}/addinventorytaxdetail`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Details),
          });

          if (response.ok) {
            console.log("Sales Tax Detail Data inserted successfully");
            savedRows.add(uniqueKey);
          } else {
            const errorResponse = await response.json();
            console.error(errorResponse.error);
            toast.warning(errorResponse.message);
          }
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const saveTermsandCondition = async (transaction_no) => {
    try {
      const validRows = rowDataTerms.filter(row => row.Terms_conditions.trim() !== '');
      for (const row of validRows) {
        const Details = {
          created_by: sessionStorage.getItem('selectedUserCode'),
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          bill_no: transaction_no,
          Terms_conditions: row.Terms_conditions,
        };

        try {
          const response = await fetch(`${config.apiBaseUrl}/salesTermsandCondition`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Details),
          });

          if (response.ok) {
            console.log("DC Data inserted successfully");
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to insert data");
            console.error(errorResponse.details || errorResponse.message);
          }
        } catch (error) {
          console.error(`Error inserting row: ${row.Terms_conditions}`, error);
          toast.error('Error inserting data: ' + error.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return (`${year}-${month}-${day}`);
  };


  const handleToggleTable = (table) => {
    setActiveTable(table);
  };

  const handleItem = async (selectedData) => {
    setIsLocked(true);
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
        existingItemWithSameCode.keyField = `${existingItemWithSameCode.serialNumber || ''}-${existingItemWithSameCode.itemCode || ''}`;
        existingItemWithSameCode.salesQty = null;
        existingItemWithSameCode.warehouse = selectedWarehouse ? selectedWarehouse.value : '';
        existingItemWithSameCode.ItemTotalWeight = null;
        existingItemWithSameCode.TotalTaxAmount = null;
        existingItemWithSameCode.TotalItemAmount = null;
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
          keyField: `${highestSerialNumber}-${item.itemCode || ''}`,
          salesQty: null,
          warehouse: selectedWarehouse ? selectedWarehouse.value : '',
          ItemTotalWeight: null,
          TotalTaxAmount: null,
          TotalItemAmount: null
        };
        updatedRowDataCopy.push(newRow);
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
      toast.warning("Please fetch item details first before setting the warehouse.");
      return; // Exit the function early
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
    console.log('Updated rowData:', updatedRowData);
  };

  const handleData = async (data) => {
    if (data && data.length > 0) {
      setShowDropdown(true);
      setShowExcelButton(true)
      setButtonsVisible(false)
      setShowAsterisk(true);
      setupdated(true);
      setPrintButtonVisible(true)
      setAuthorizeButton(true);
      const [{ BillNo, BillDate, SalesType, RoundOff, PaidAmount, ReturnAmount, SalesMode, DCNo, SaleAmount, TotalAmount, TotalTax, PayType, CustomerName, CustomerCode, OrderType, inventory_autono }] = data;
      console.table(data);

      const billDate = document.getElementById('billDate');
      if (billDate) {
        billDate.value = BillDate;
        setBillDate(formatDate(BillDate));
      } else {
        console.error('Billdate element not found');
      }

      const billNo = document.getElementById('billNo');
      if (billNo) {
        billNo.value = BillNo;
        setBillNo(BillNo);
      } else {
        console.error('transactionNumber element not found');
      }

      const paidAmount = document.getElementById('paidAmount');
      if (paidAmount) {
        paidAmount.value = PaidAmount;
        setPaidAmount(PaidAmount);
      } else {
        console.error('paidAmount element not found');
      }

      const returnAmount = document.getElementById('returnAmount');
      if (returnAmount) {
        returnAmount.value = ReturnAmount;
        setReturnAmount(ReturnAmount);
      } else {
        console.error('returnAmount element not found');
      }

      const purchasetype = document.getElementById('salesType');
      if (purchasetype) {
        const selectedOption = filteredOptionSales.find(option => option.value === SalesType);
        setSelectedSales(selectedOption);
      } else {
        console.error('entry element not found');
      }

      const paytype = document.getElementById('payType');
      if (paytype) {
        const selectedOption = filteredOptionPay.find(option => option.value === PayType);
        setSelectedPay(selectedOption);
      } else {
        console.error('entry element not found');
      }

      const orderType = document.getElementById('ordertype');
      if (orderType) {
        const selectedOption = filteredOptionOrder.find(option => option.value === OrderType);
        setSelectedOrder(selectedOption);
      } else {
        console.error('entry element not found');
      }

      const salesMode = document.getElementById('salesMode');
      if (salesMode) {
        const selectedSalesMode = filteredOptionSalesMode.find(option => option.value === SalesMode);
        setSelectedSalesMode(selectedSalesMode);
        console.log(SalesMode)
      } else {
        console.error('salesMode element not found');
      }

      const customerCode = document.getElementById('customercode');
      if (customerCode) {
        customerCode.value = CustomerCode;
        setCustomerCode(CustomerCode);
      } else {
        console.error('vendor element not found');
      }

      const customerName = document.getElementById('customername');
      if (customerName) {
        customerName.value = CustomerName;
        setCustomerName(CustomerName);
      } else {
        console.error('vendor element not found');
      }

      const roundOff = document.getElementById('roundOff');
      if (roundOff) {
        roundOff.value = RoundOff;
        setRoundDifference(RoundOff);
      } else {
        console.error('vendor element not found');
      }

      const dcNo = document.getElementById('dcno');
      if (dcNo) {
        dcNo.value = DCNo;
        setDelvychellanno(DCNo);
      } else {
        console.error('vendor element not found');
      }

      const saleAmount = document.getElementById('totalSaleAmount');
      if (saleAmount) {
        saleAmount.value = SaleAmount;
        setTotalsales(SaleAmount);
      } else {
        console.error('vendor element not found');
      }

      const totalAmount = document.getElementById('totalBillAmount');
      if (totalAmount) {
        totalAmount.value = TotalAmount;
        setTotalBill(TotalAmount);
      } else {
        console.error('vendor element not found');
      }

      const totalTax = document.getElementById('totalTaxAmount');
      if (totalTax) {
        totalTax.value = TotalTax;
        setTotalTax(TotalTax);
      } else {
        console.error('vendor element not found');
      }

      TransactionStatus(BillNo)
      await SalesReturnTax(BillNo);
    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  }

  const SalesReturnTax = async (BillNo) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/getSalesTaxDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newTaxDetail = [];
        const taxNameDetailsArray = [];
        const taxPer = [];
        let TaxName = '';
        searchData.forEach(({ ItemSNo, TaxSNo, item_code, tax_name_details, tax_per, tax_amt, tax_type }) => {
          newTaxDetail.push({
            ItemSNO: ItemSNo,
            TaxSNO: TaxSNo,
            Item_code: item_code,
            TaxType: tax_name_details,
            TaxPercentage: tax_per,
            TaxAmount: tax_amt,
            TaxName: tax_type
          });
          taxNameDetailsArray.push(tax_name_details);
          taxPer.push(tax_per);
          TaxName = tax_type;
        });

        const taxNameDetailsString = taxNameDetailsArray.join(',');
        const taxPerDetaiString = taxPer.join(',');

        setRowDataTax(newTaxDetail);

        SalesReturnDetail(BillNo, taxNameDetailsString, taxPerDetaiString, TaxName);
      } else if (response.status === 404) {
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

  const SalesReturnDetail = async (BillNo, taxNameDetailsString, taxPerDetaiString, TaxName) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getSalesDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
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
            tax_amt,
            bill_rate,
            discount_amount,
            discount
          } = item;

          newRowData.push({
            serialNumber: ItemSNo,
            itemCode: item_code,
            itemName: item_name,
            unitWeight: weight,
            salesQty: bill_qty,
            warehouse: warehouse_code,
            discountAmount: discount_amount,
            discount: discount,
            ItemTotalWeight: total_weight,
            purchaseAmt: item_amt,
            TotalTaxAmount: tax_amt,
            TotalItemAmount: bill_rate
          });
        });
        setRowData(newRowData);

        await salesTermsandCondition(BillNo);

      } else if (response.status === 404) {
        console.log("Data not found");
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const salesTermsandCondition = async (BillNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getTermsandConditionSales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData)

        const newRowData = [];
        searchData.forEach(item => {
          const { Terms_Conditions } = item;
          newRowData.push({ Terms_conditions: Terms_Conditions });
        });

        setRowDataTerms(newRowData);
      } else if (response.status === 404) {
        console.log("Data not found");
        setRowDataTerms([]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleVendor = async (data) => {
    if (data && data.length > 0) {
      const [{ CustomerCode, CustomerName }] = data;
      setCustomerCode(CustomerCode);
      setCustomerName(CustomerName)
    } else {
      console.error('Data is empty or undefined');
    }
  };

  const PrintHeaderData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberTosalesHeaderPrintData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
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
      const response = await fetch(`${config.apiBaseUrl}/refNumberTosalesDetailPrintData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
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

  const PrintSumTax = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberTosalesSumTax`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
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
    setLoading(true)
    try {
      const headerData = await PrintHeaderData();
      const detailData = await PrintDetailData();
      const taxData = await PrintSumTax();

      if (headerData && detailData && taxData) {
        console.log("All API calls completed successfully");

        sessionStorage.setItem('SheaderData', JSON.stringify(headerData));
        sessionStorage.setItem('SdetailData', JSON.stringify(detailData));
        sessionStorage.setItem('StaxData', JSON.stringify(taxData));

        window.open('/SalesPrint', '_blank');
      } else {
        console.log("Failed to fetch some data");
        toast.error("Reference Number Does Not Exits");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      toast.error('Error inserting data: ' + error.message);
    }finally {
      setLoading(false);
    }

  };

  const handleDeleteHeader = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/saledeletehdrData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bill_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });
      if (response.ok) {
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
      const response = await fetch(`${config.apiBaseUrl}/saleDeleteDetailData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bill_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });
      if (response.ok) {
        return true
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete detail.";
      }
    } catch (error) {
      return "Error deleting detail: " + error.message;
    }
  };

  const handleDeleteTaxDetail = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/salesDeleteTaxData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bill_no: billNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });
      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete tax detail.";
      }
    } catch (error) {
      return "Error deleting tax detail: " + error.message;
    }
  };

    const deleteTermsandCondition = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/deleteSalesTermsandCondition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bill_no: billNo,
          company_code: sessionStorage.getItem("selectedCompanyCode")
        })
      });
      if (response.ok) {
        return true;
      } else {
        const errorResponse = await response.json();
        return errorResponse.details || errorResponse.message || "Failed to delete terms and conditions.";
      }
    } catch (error) {
      return "Error deleting terms and conditions: " + error.message;
    }
  };

  const handleDeleteButtonClick = async () => {
    if (!billNo) {
      setDeleteError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }


    showConfirmationToast(
      "Are you sure you want to delete the data ?",
      async () => {
        setLoading(true);
        try {
          const termsResult = await deleteTermsandCondition();
          const taxDetailResult = await handleDeleteTaxDetail();
          const detailResult = await handleDeleteDetail();
          const headerResult = await handleDeleteHeader();

          if (headerResult === true && detailResult === true && taxDetailResult === true && termsResult === true) {
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
                  : taxDetailResult !== true
                    ? taxDetailResult
                    : termsResult !== true
                      ? termsResult
                      : "An unknown error occurred.";

            toast.error(errorMessage);
          }
        } catch (error) {
          console.error("Error executing API calls:", error);
          toast.warning(error.message || "An Error occured while Deleting Data");
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data deleted cancelled.");
      }

    );
  };

  const formatToTwoDecimalPoints = (number) => {
    return parseFloat(number).toFixed(2);
  };

  const handleRefNo = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getSalesData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem('selectedCompanyCode') }) // Send company_no and company_name as search criteria
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.warning("Data not found");
          clearFormFields();
          return false;
        } else {
          const errorResponse = await response.json();
          toast.error(errorResponse.message || "An error occurred");
          return false;
        }
      }
      const searchData = await response.json();
      setShowAsterisk(true);
      setButtonsVisible(false);
      setShowExcelButton(true);
      setShowDropdown(true);
      setAuthorizeButton(true);
      setPrintButtonVisible(true)
      setupdated(true);
      TransactionStatus(code)
      if (searchData.table1 && searchData.table1.length > 0) {
        const item = searchData.table1[0];

        setBillDate(formatDate(item.bill_date));
        setBillNo(item.bill_no);
        setCustomerCode(item.customer_code);
        setCustomerName(item.customer_name);
        setDelvychellanno(item.dely_chlno);
        setDelvychellanno(item.dely_chlno);
        setTotalBill(formatToTwoDecimalPoints(item.bill_amt));
        setRoundDifference(formatToTwoDecimalPoints(item.roff_amt));
        setTotalsales(formatToTwoDecimalPoints(item.sale_amt));
        setTotalTax(formatToTwoDecimalPoints(item.tax_amount));
        setPaidAmount(formatToTwoDecimalPoints(item.paid_amount));
        setReturnAmount(formatToTwoDecimalPoints(item.return_amount));


        const selectedOption = filteredOptionSales.find(option => option.value === item.sales_type);
        setSelectedSales(selectedOption);

        const selected = filteredOptionPay.find(option => option.value === item.pay_type);
        setSelectedPay(selected);

        const selectedOrder = filteredOptionOrder.find(option => option.value === item.order_type);
        setSelectedOrder(selectedOrder)

        const selectedSalesMode = filteredOptionSalesMode.find(option => option.value === item.sales_mode);
        setSelectedSalesMode(selectedSalesMode);

      } else {
        console.log("Header Data is empty or not found");
        clearFormFields();
        return false;
      }

      if (searchData.table2 && searchData.table2.length > 0) {

        const updatedRowData = searchData.table2.map(item => {
          const taxDetailsList = searchData.table3.filter(taxItem => taxItem.item_code === item.item_code);

          const taxDetails = taxDetailsList.map(taxItem => taxItem.tax_name_details).join(",");
          const taxPer = taxDetailsList.map(taxItem => taxItem.tax_per).join(",");
          const taxType = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;

          setCustomerName(item.customer_name);

          return {
            serialNumber: item.ItemSNo,
            itemCode: item.item_code,
            itemName: item.item_name,
            unitWeight: item.weight,
            warehouse: item.warehouse_code,
            salesQty: item.bill_qty,
            ItemTotalWeight: item.total_weight,
            itemAmt: item.item_amt,
            totalReturnAmt: item.bill_rate,
            ReturnWeight: item.return_weight,
            purchaseAmt: item.item_amt,
            delvychellanno: item.dely_chlno,
            discount: item.discount,
            discountAmount: item.discount_amount,
            TotalTaxAmount: parseFloat(item.tax_amt).toFixed(2),
            TotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
            taxType: taxType || null,
            taxPer: taxPer || null,
            taxDetails: taxDetails || null
          };
        });

        setRowData(updatedRowData);
      } else {
        console.log("Detail Data is empty or not found");
        setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', serach: '', unitWeight: 0, warehouse: '', billQty: 0, ItemTotalWight: 0, salesAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
      }

      if (searchData.table3 && searchData.table3.length > 0) {

        const updatedRowDataTax = searchData.table3.map(item => {
          return {
            ItemSNO: item.ItemSNo,
            TaxSNO: item.TaxSNo,
            Item_code: item.item_code,
            TaxType: item.tax_name_details,
            TaxPercentage: item.tax_per,
            TaxAmount: item.tax_amt,
            TaxName: item.tax_type
          };
        });

        console.log(updatedRowDataTax);
        setRowDataTax(updatedRowDataTax);
      } else {
        console.log("Tax Data is empty or not found");
        setRowDataTax([]);
      }

      if (searchData.table4 && searchData.table4.length > 0) {
        const updatedRowDataTerms = searchData.table4.map(item => ({
          Terms_conditions: item.Terms_Conditions
        }));
        setRowDataTerms(updatedRowDataTerms);
      } else {
        console.log("Terms Data is empty or not found");
        setRowDataTerms([]);
      }

      console.log("data fetched successfully");
      return false;
    } catch (error) {
      console.error("Error fetching search data:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearFormFields = () => {
    setTotalsales('');
    setDelvychellanno('');
    setPayType('');
    setSalesType('');
    setBillDate('');
    setBillNo('');
    setCustomerCode('');
    setCustomerName('');
    setTotalTax('');
    setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', serach: '', unitWeight: 0, warehouse: '', billQty: 0, ItemTotalWight: 0, salesAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
    setRowDataTax([]);
  };

  //code sales delete screen
  const handleDeletedData = async (data) => {
    if (data && data.length > 0) {
      const [{ BillNo, BillDate, PaidAmount, ReturnAmount, SalesMode, SalesType, RoundOff, DCNo, SaleAmount, TotalAmount, TotalTax, PayType, InventoryAutoNo, CustomerName, CustomerCode, OrderType }] = data;
      console.table(data);

      const billDate = document.getElementById('billDate');
      if (billDate) {
        billDate.value = BillDate;
        setDeleteBillDate(formatDate(BillDate));
      } else {
        console.error('Billdate element not found');
      }

      const billNo = document.getElementById('saleReferNo');
      if (billNo) {
        billNo.value = BillNo;
        setRefNo(BillNo);
      } else {
        console.error('Billdate element not found');
      }

      const deletedSalesMode = document.getElementById('deletedSalesMode');
      if (deletedSalesMode) {
        deletedSalesMode.value = SalesMode;
        setDeletedSalesMode(SalesMode);
      } else {
        console.error('deletedSalesMode element not found');
      }

      const deletedPaidAmount = document.getElementById('deletedPaidAmount');
      if (deletedPaidAmount) {
        deletedPaidAmount.value = PaidAmount;
        setDeletedPaidAmount(PaidAmount);
      } else {
        console.error('deletedPaidAmount element not found');
      }

      const deletedReturnAmount = document.getElementById('deletedReturnAmount');
      if (deletedReturnAmount) {
        deletedReturnAmount.value = ReturnAmount;
        setDeletedReturnAmount(ReturnAmount);
      } else {
        console.error('deletedReturnAmount element not found');
      }

      const ordertype = document.getElementById('ordertype');
      if (ordertype) {
        ordertype.value = OrderType;
        setDeleteOrderType(OrderType);
      } else {
        console.error('transactionNumber element not found');
      }

      const salesType = document.getElementById('salesType');
      if (salesType) {
        salesType.value = SalesType;
        setDeleteSalesType(SalesType);
      } else {
        console.error('transactionNumber element not found');
      }

      const payType = document.getElementById('payType');
      if (payType) {
        payType.value = PayType;
        setDeletePayType(PayType);
      } else {
        console.error('transactionNumber element not found');
      }

      const customerCode = document.getElementById('customercode');
      if (customerCode) {
        customerCode.value = CustomerCode;
        setDeleteCustomerCode(CustomerCode);
      } else {
        console.error('vendor element not found');
      }

      const customerName = document.getElementById('customername');
      if (customerName) {
        customerName.value = CustomerName;
        setDeleteCustomerName(CustomerName);
      } else {
        console.error('vendor element not found');
      }

      const roundOff = document.getElementById('roundOff');
      if (roundOff) {
        roundOff.value = RoundOff;
        setDeleteRoundDifference(RoundOff);
      } else {
        console.error('vendor element not found');
      }

      const dcNo = document.getElementById('dcno');
      if (dcNo) {
        dcNo.value = DCNo;
        setDeleteDelvychellanno(DCNo);
      } else {
        console.error('vendor element not found');
      }

      const saleAmount = document.getElementById('totalSaleAmount');
      if (saleAmount) {
        saleAmount.value = SaleAmount;
        setDeleteTotalsales(SaleAmount);
      } else {
        console.error('vendor element not found');
      }

      const totalAmount = document.getElementById('totalBillAmount');
      if (totalAmount) {
        totalAmount.value = TotalAmount;
        setDeleteTotalBill(TotalAmount);
      } else {
        console.error('vendor element not found');
      }

      const totalTax = document.getElementById('totalTaxAmount');
      if (totalTax) {
        totalTax.value = TotalTax;
        setDeleteTotalTax(TotalTax);
      } else {
        console.error('vendor element not found');
      }

      await SalesDeleteTax(BillNo);
    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  }

  const SalesDeleteTax = async (BillNo) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/salesdelsearchtax`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newTaxDetail = [];
        const taxNameDetailsArray = [];
        const taxPer = [];
        let TaxName = '';
        searchData.forEach(({ ItemSNo, TaxSNo, item_code, tax_name_details, tax_per, tax_amt, tax_type }) => {
          newTaxDetail.push({
            deleteItemSNO: ItemSNo,
            deleteTaxSNO: TaxSNo,
            deleteItem_code: item_code,
            deleteTaxType: tax_name_details,
            deleteTaxPercentage: tax_per,
            deleteTaxAmount: tax_amt,
            TaxName: tax_type
          });
          taxNameDetailsArray.push(tax_name_details);
          taxPer.push(tax_per);
          TaxName = tax_type;
        });

        const taxNameDetailsString = taxNameDetailsArray.join(',');
        const taxPerDetaiString = taxPer.join(',');

        setRowDataTaxDelete(newTaxDetail);

        SalesDeleteDetail(BillNo, taxNameDetailsString, taxPerDetaiString, TaxName);
      } else if (response.status === 404) {
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

  const SalesDeleteDetail = async (BillNo) => {
        setLoading(true);
        try {
      const response = await fetch(`${config.apiBaseUrl}/saledelsearchitem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem('selectedCompanyCode') })
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
            tax_amt,
            bill_rate,
            discount_amount,
            discount
          } = item;

          newRowData.push({
            deleteSerialNumber: ItemSNo,
            deleteItemCode: item_code,
            deleteItemName: item_name,
            deleteUnitWeight: weight,
            deleteSalesQty: bill_qty,
            deleteWarehouse: warehouse_code,
            deleteItemTotalWeight: total_weight,
            deletePurchaseAmt: item_amt,
            deleteTotalTaxAmount: tax_amt,
            deleteTotalItemAmount: bill_rate,
            deletedDiscountAmount: discount_amount,
            deletedDiscount: discount,
          });
        });
        setRowDataDelete(newRowData);

        await saledDeletedTerms(BillNo);

      } else if (response.status === 404) {
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

    const saledDeletedTerms = async (BillNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedTermsSales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: BillNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData)

        const newRowData = [];
        searchData.forEach(item => {
          const { Terms_Conditions } = item;
          newRowData.push({ deletedTermsConditions: Terms_Conditions });
        });

        setDeletedRowDataTerms(newRowData);
      } else if (response.status === 404) {
        console.log("Data not found");
        setDeletedRowDataTerms([]);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message || "Internal Server Error");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleDeletedRerNo = (e) => {
    const deleteNumber = e.target.value;
    setRefNo(deleteNumber);
  }

  const handleKeyDelete = (e) => {
    if (e.key === 'Enter') {
      handleDeleteRefNo(refNo);
    }
  };

  const handleDeleteRefNo = async (code) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/getRefSalesDelete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem('selectedCompanyCode') }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        if (searchData.table1 && searchData.table1.length > 0) {
          const item = searchData.table1[0];
          setRefNo(item.bill_no);
          setDeleteBillDate(formatDate(item.bill_date));
          setDeleteCustomerCode(item.customer_code);
          setDeleteCustomerName(item.customer_name);
          setDeleteDelvychellanno(item.dely_chlno);
          setDeleteOrderType(item.order_type);
          setDeletePayType(item.pay_type);
          setDeleteSalesType(item.sales_type);
          setDeletedSalesMode(item.sales_mode);
          setDeleteTotalBill(formatToTwoDecimalPoints(item.bill_amt));
          setDeleteRoundDifference(formatToTwoDecimalPoints(item.roff_amt));
          setDeleteTotalsales(formatToTwoDecimalPoints(item.sale_amt));
          setDeleteTotalTax(formatToTwoDecimalPoints(item.tax_amount));
          setDeletedPaidAmount(formatToTwoDecimalPoints(item.paid_amount));
          setDeletedReturnAmount(formatToTwoDecimalPoints(item.return_amount));

        } else {
          console.log("Header Data is empty or not found");
          setRefNo('')
          setDeleteTotalsales('');
          setDeleteDelvychellanno('');
          setDeletePayType('');
          setDeleteSalesType('');
          setDeleteBillDate('');
          setRefNo('');
          setDeleteCustomerCode('');
          setDeleteCustomerName('');
          setDeleteTotalTax('');
        }

        if (searchData.table2 && searchData.table2.length > 0) {

          const updatedRowData = searchData.table2.map(item => {
            // Find all tax details from table3 that correspond to the current item in table2
            const taxDetailsList = searchData.table3.filter(taxItem => taxItem.item_code === item.item_code);

            // Extract and join tax types and percentages as comma-separated strings
            const taxDetails = taxDetailsList.map(taxItem => taxItem.tax_name_details).join(",");
            const taxPer = taxDetailsList.map(taxItem => taxItem.tax_per).join(",");
            const taxType = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;

            // Set the vendor_name to the label
            document.getElementById('customercode').textContent = item.customer_name;

            return {
              deleteSerialNumber: item.ItemSNo,
              deleteItemCode: item.item_code,
              deleteItemName: item.item_name,
              deleteUnitWeight: item.weight,
              deleteWarehouse: item.warehouse_code,
              deleteSalesQty: item.bill_qty,
              deleteItemTotalWeight: item.total_weight,
              deletePurchaseAmt: item.item_amt,
              deletedDiscount: item.discount,
              deletedDiscountAmount: item.discount_amount,
              deleteTotalTaxAmount: parseFloat(item.tax_amt).toFixed(2),
              deleteTotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
              taxType: taxType || null,
              taxPer: taxPer || null,
              taxDetails: taxDetails || null
            };
          });

          setRowDataDelete(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', serach: '', unitWeight: 0, warehouse: '', billQty: 0, ItemTotalWight: 0, salesAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
        }

        if (searchData.table3 && searchData.table3.length > 0) {

          const updatedRowDataTax = searchData.table3.map(item => {
            return {
              deleteItemSNO: item.ItemSNo,
              deleteTaxSNO: item.TaxSNo,
              deleteItem_code: item.item_code,
              deleteTaxType: item.tax_name_details,
              deleteTaxPercentage: item.tax_per,
              deleteTaxAmount: item.tax_amt,
              TaxName: item.tax_type
            };
          });

          console.log(updatedRowDataTax);
          setRowDataTaxDelete(updatedRowDataTax);
        } else {
          console.log("Tax Data is empty or not found");
          setRowDataTax([]);
        }

        if (searchData.table4 && searchData.table4.length > 0) {
          const updatedRowDataTerms = searchData.table4.map(item => {
            return {
              deletedTermsConditions: item.Terms_Conditions,
            };
          });
          setDeletedRowDataTerms(updatedRowDataTerms);
        }
        else {
          console.log("Detail Data is empty or not found");
          setDeletedRowDataTerms([])
        }

        console.log("data fetched successfully")

      } else if (response.status === 404) {
        toast.warning('Data not found');

        // Clear the data fields
        setRefNo('')
        setTotalsales('');
        setDelvychellanno('');
        setPayType('');
        setSalesType('');
        setBillDate('');
        setBillNo('');
        setCustomerCode('');
        setCustomerName('');
        setTotalTax('');
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: 0, warehouse: '', billQty: 0, ItemTotalWight: 0, salesAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
        setRowDataTax([]);
      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }finally {
      setLoading(false);
    }

  };

  //sales deleted code
  const [rowDataDelete, setRowDataDelete] = useState([{ deleteSerialNumber: 1, deleteItemCode: '', deleteItemName: '', deleteUnitWeight: '', deleteWarehouse: '', deleteSalesQty: '', deleteItemTotalWeight: '', deletePurchaseAmt: 0, deleteTotalTaxAmount: '', deleteTotalItemAmount: '' }]);
  const [rowDataTaxDelete, setRowDataTaxDelete] = useState([]);
  const [deleteCustomerCode, setDeleteCustomerCode] = useState("");
  const [deleteCustomerName, setDeleteCustomerName] = useState("");
  const [deletePayType, setDeletePayType] = useState("");
  const [deleteSalesType, setDeleteSalesType] = useState("");
  const [deleteOrderType, setDeleteOrderType] = useState(null);
  const [deleteDelvychellanno, setDeleteDelvychellanno] = useState("");
  const [deletedSalesMode, setDeletedSalesMode] = useState("");
  const [deletedPaidAmount, setDeletedPaidAmount] = useState("");
  const [deletedReturnAmount, setDeletedReturnAmount] = useState("");
  const [deleteBillDate, setDeleteBillDate] = useState("");
  const [deleteTotalBill, setDeleteTotalBill] = useState(0);
  const [deleteTotalTax, setDeleteTotalTax] = useState(0)
  const [deleteTotalsales, setDeleteTotalsales] = useState(0)
  const [deleteRoundedDifference, setDeleteRoundDifference] = useState(0)

  const columnDeletdDef = [
    {
      headerName: 'S.No',
      field: 'deleteSerialNumber',
      maxWidth: 80,
      editable: false
    },
    {
      headerName: 'Item Code',
      field: 'deleteItemCode',
      editable: true,
      // maxWidth: 140,
      filter: true,
      editable: false,
      onCellValueChanged: function (params) {
      }
    },
    {
      headerName: 'Item Name',
      field: 'deleteItemName',
      editable: true,
      // maxwidth: 150,
      filter: true,
      editable: false,
      cellEditorParams: {
        maxLength: 40,
      },
      sortable: false
    },
    {
      headerName: 'Unit Weight',
      field: 'deleteUnitWeight',
      editable: true,
      // maxWidth: 180,
      editable: false,
      filter: true,
    },
    {
      headerName: 'Warehouse',
      field: 'deleteWarehouse',
      editable: true,
      filter: true,
      // maxWidth: 150,
      editable: false,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false
    },
    {
      headerName: 'Qty',
      field: 'deleteSalesQty',
      editable: true,
      // maxWidth: 180,
      filter: true,
      editable: false,
    },
    {
      headerName: 'Total Weight',
      field: 'deleteItemTotalWeight',
      editable: true,
      // minWidth: 150,
      // maxWidth: 180,
      editable: false,
      filter: true,
    },
    {
      headerName: 'Unit Price',
      field: 'deletePurchaseAmt',
      editable: true,
      // maxWidth: 170,
      editable: false,
      filter: true,
    },
    {
      headerName: 'Tax Amount',
      field: 'deleteTotalTaxAmount',
      editable: true,
      // minWidth: 150,
      // maxWidth: 150,
      editable: false,
      filter: true,
    },
    {
      headerName: 'Discount %',
      field: 'deletedDiscount',
      editable: false,
      hide: true,
      // maxWidth: 140,
      filter: true,
      cellEditorParams: {
        maxLength: 18,
      },
      sortable: false,
    },
    {
      headerName: 'Discount Amount',
      field: 'deletedDiscountAmount',
      editable: false,
      // minWidth: 180,
      // maxWidth: 180,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Total',
      field: 'deleteTotalItemAmount',
      editable: true,
      filter: true,
      // minWidth: 600,
      editable: false,
      maxWidth: 155,
    },
    {
      headerName: 'Purchase Tax Type',
      field: 'taxType',
      editable: true,
      // maxWidth: 150,
      filter: true,
      editable: false,
      hide: true
    },
    {
      headerName: 'Tax Detail',
      field: 'taxDetails',
      editable: true,
      // maxWidth: 150,
      filter: true,
      editable: false,
      hide: true
    },
    {
      headerName: 'Tax Percentage',
      field: 'taxPer',
      editable: true,
      // maxWidth: 150,
      filter: true,
      editable: false,
      hide: true,
    },
  ];

  //DEFINE TAX DETAIL COLUMNS
  const columnDelDefsTax = [
    {
      headerName: 'S.No',
      field: 'deleteItemSNO',
      editable: false,
      maxWidth: 80,
    },
    {
      headerName: 'Tax S.No',
      field: 'deleteTaxSNO',
      maxWidth: 120,
      editable: false,
    },
    {
      headerName: 'Item Code',
      field: 'deleteItem_code',
      editable: false,
      // minWidth: 401
    },
    {
      headerName: 'Tax Type ',
      field: 'deleteTaxType',
      editable: false,
      // minWidth: 401,
    },
    {
      headerName: 'Tax percentage',
      field: 'deleteTaxPercentage',
      editable: false,
      // minWidth: 401
    },
    {
      headerName: 'Tax Amount',
      field: 'deleteTaxAmount',
      editable: false,
      // minWidth: 401,
    }
  ];

  const handleReload = () => {
    setLoading(true)
    window.location.reload();
  };

  const handleExcelDownload = () => {
    const filteredRowData = rowData.filter(row => row.salesQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0);
    const filteredRowDataTax = rowDataTax.filter(taxRow => taxRow.TaxAmount > 0 && taxRow.TaxPercentage > 0);

    const headerData = [{
      company_code: sessionStorage.getItem('selectedCompanyCode'),
      customer_code: customerCode,
      customer_name: customerName,
      pay_type: payType,
      sales_type: salesType,
      order_type: orderType,
      bill_no: billNo,
      bill_date: billDate,
      sale_amt: Totalsales,
      tax_amount: TotalTax,
      bill_amt: TotalBill,
      roff_amt: round_difference,
      dely_chlno: delvychellanno,
    }];

    const headerSheet = XLSX.utils.json_to_sheet(headerData);
    const rowDataSheet = XLSX.utils.json_to_sheet(filteredRowData);
    const rowDataTaxSheet = XLSX.utils.json_to_sheet(filteredRowDataTax);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Sales Details");
    XLSX.utils.book_append_sheet(workbook, rowDataTaxSheet, "Tax Details");

    XLSX.writeFile(workbook, "Sales data.xlsx");
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
    const newRow = { serialNumber, itemCode: '', itemName: '', unitWeight: 0, warehouse: selectedWarehouse ? selectedWarehouse.value : '', salesQty: 0, ItemTotalWeight: 0, purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', salesQty: '', ItemTotalWeight: '', purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' }]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };

  const handleChangeStatus = (selected) => {
    setSelectedStatus(selected);
    console.log("Selected option:", selected);
  };

  const handleAuthorizedButtonClick = async () => {
        if ( !billNo || !selectedStatus) {
      setDeleteError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    setLoading(true)
    try {
      await AuthorizedHeader();
      await AuthorizedDetails();
      await AuthorizedTaxDetails();
      console.log("All functions executed successfully.");
    } catch (error) {
      console.error("Error executing handleAuthorizedButtonClick:", error);
    }finally {
      setLoading(false);
    }

  };

  const AuthorizedHeader = async () => {
    
    try {
      const response = await fetch(`${config.apiBaseUrl}/SalesAuthHdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bill_no: billNo,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          authroization_status: selectedStatus.value
        })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", billNo);
        return true
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const AuthorizedDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/SalesAuthDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bill_no: billNo,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          authroization_status: selectedStatus.value
        })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", billNo);
        return true
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const AuthorizedTaxDetails = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/SalesAuthTaxDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bill_no: billNo,
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          authroization_status: selectedStatus.value
        })
      });
      if (response.ok) {
        console.log("Rows deleted successfully:", billNo);
        return true
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };


  const navigateToSalesSettings = () => {
    navigate('/SalesSettings'); // Adjust the path as per your route setup
  };



  const ReturnAmountCalculation = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getSalesReturnAmountCalculation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sale_amt: TotalBill, paid_amt: parseFloat(paidAmount) }),
      });
      if (response.ok) {
        const data = await response.json();
        const [{ ReturnAmount }] = data;
        setReturnAmount(formatToTwoDecimalPoints(ReturnAmount))
      } else {
        const errorMessage = await response.text();
        console.error(`Server responded with error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (!updated && paidAmount) {
      ReturnAmountCalculation();
    }
  }, [TotalBill, paidAmount, updated]);


  const DeleteTerms = (params) => {
    const { data } = params;
    setRowDataTerms((prevRows) => {
      const updatedRows = prevRows.filter((row) => row !== data);
      if (updatedRows.length === 0) {
        return [
          {
            serialNumber: 1,
            Terms_conditions: "",
          },
        ];
      }
      return updatedRows.map((row, index) => ({
        ...row,
        serialNumber: index + 1,
      }));
    });
  };

  const handleValueChanged = (params) => {
    const { data, colDef } = params;
    if (colDef.field === "Terms_conditions" && data.Terms_conditions?.trim() !== "") {
      const isLastRow = rowDataTerms[rowDataTerms.length - 1] === data;
      if (isLastRow) {
        const newRow = {
          serialNumber: rowDataTerms.length + 1,
          Terms_conditions: "",
        };
        setRowDataTerms((prevRows) => [...prevRows, newRow]);
      }
    }
  };

  const columnDefsTermsConditions = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 70,
      valueGetter: (params) => params.node.rowIndex + 1,
      sortable: false,
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 25,
      tooltipValueGetter: () => "Delete",
      onCellClicked: DeleteTerms,
      cellRenderer: function () {
        return <FontAwesomeIcon icon="fa-solid fa-trash" style={{ cursor: 'pointer', marginRight: "12px" }} />;
      },
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
      sortable: false,
    },
    {
      headerName: 'Terms & Conditions',
      field: 'Terms_conditions',
      sortable: false,
      editable: !showExcelButton,
      flex: 1,
      onCellValueChanged: (params) => handleValueChanged(params),
    },
  ];

  const [deletedRowDataTerms, setDeletedRowDataTerms] = useState([]);

  const deletedTermsConditions = [
    {
      headerName: 'S.No',
      field: 'deletedSerialNumber',
      maxWidth: 70,
      valueGetter: (params) => params.node.rowIndex + 1,
      sortable: false,
      minHeight: 50,
      maxHeight: 50,
    },
    {
      headerName: 'Terms & Conditions',
      field: 'deletedTermsConditions',
      sortable: false,
      editable: false,
      flex: 1
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const company_code = sessionStorage.getItem('selectedCompanyCode');
      try {
        const response = await fetch(`${config.apiBaseUrl}/termsandCondition`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code })
        })
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        const updatedData = await Promise.all(
          result.map(async (item) => ({
            ...item,
            Terms_conditions: item.attributedetails_name
          }))
        );
        setRowDataTerms(updatedData);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchItemCode = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getSalesItemCode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setItemCodeDrop(data);
        } else {
          console.warn("No data found for item codes");
          setItemCodeDrop([]);
        }
      } catch (error) {
        console.error("Error fetching item codes:", error);
      }
    };

    fetchItemCode();
  }, []);

  const filteredOptionItem = itemCodeDrop.map((option) => ({
    value: option.Item_code,
    label: `${option.Item_code} - ${option.Item_name}`,
  }));

  const handleChangeItem = async (selectedOption) => {
    setSelectedItem(selectedOption);

    const selectedItemCode = selectedOption?.value;
    const company_code = sessionStorage.getItem("selectedCompanyCode");

    if (!selectedItemCode) return;

    try {
      const response = await fetch(`${config.apiBaseUrl}/getItemCodeSalesData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code, Item_code: selectedItemCode, type: salesMode })
      });

      if (response.ok) {
        const searchData = await response.json();
        const matchedItem = searchData[0];
        if (!matchedItem) {
          toast.warning("No item data found.");
          return;
        }

        // Find first row with empty itemCode
        const emptyRowIndex = rowData.findIndex(row => !row.itemCode);

        if (emptyRowIndex !== -1) {
          // Update the first empty row
          const updatedRowData = [...rowData];
          updatedRowData[emptyRowIndex] = {
            ...updatedRowData[emptyRowIndex],
            itemCode: matchedItem.Item_code,
            itemName: matchedItem.Item_name,
            unitWeight: matchedItem.Item_wigh,
            discount: matchedItem.discount_Percentage,
            purchaseAmt: matchedItem.Item_std_sales_price,
            taxType: matchedItem.Item_sales_tax_type,
            taxDetails: matchedItem.combined_tax_details,
            taxPer: matchedItem.combined_tax_percent,
            keyField: `${updatedRowData[emptyRowIndex].serialNumber || ''}-${matchedItem.Item_code || ''}`,
            warehouse: selectedWarehouse ? selectedWarehouse.value : '',
          };
          setRowData(updatedRowData);
        } else {
          // No empty row found, add a new row
          const newRow = {
            serialNumber: rowData.length + 1,
            itemCode: matchedItem.Item_code,
            itemName: matchedItem.Item_name,
            unitWeight: matchedItem.Item_wigh,
            discount: matchedItem.discount_Percentage,
            purchaseAmt: matchedItem.Item_std_sales_price,
            taxType: matchedItem.Item_sales_tax_type,
            taxDetails: matchedItem.combined_tax_details,
            taxPer: matchedItem.combined_tax_percent,
            keyField: `${rowData.length + 1}-${matchedItem.Item_code || ''}`,
            warehouse: selectedWarehouse ? selectedWarehouse.value : '',
          };
          setRowData(prev => [...prev, newRow]);
        }

      } else {
        toast.warning("Item not found.");
      }
    } catch (error) {
      console.error("Error fetching item data from dropdown:", error);
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div className="">
      {Screens === 'Add' ? (
        <div className="container-fluid Topnav-screen">
          <div>
                  {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 align="left" className="purbut me-5">Sales</h1>
                </div>
                <div className="d-flex justify-content-end purbut me-3">
                  <div class="exp-form-floating">
                     <div title="Select the Screen">
                    <Select
                      id="returnType"
                      className="exp-input-field col-md-6 mt-2"
                      placeholder=""
                      required
                      value={selectedscreens}
                      onChange={handleChangeScreens}
                      options={filteredOptionScreens}

                    />
                  </div>
                  </div>
                  {buttonsVisible && ['add', 'all permission'].some(permission => sales.includes(permission)) && (
                    <savebutton className="purbut" onClick={handleSaveButtonClick} title='Save'>
                      <i class="fa-regular fa-floppy-disk"></i>
                    </savebutton>
                  )}
                  {authorizeButton && (
                  <savebutton className="purbut" onClick={handleAuthorizedButtonClick} title="Authorization">
                    <i class="fa-solid fa-check"></i>
                  </savebutton>
                  )}
                  {deleteButtonVisible &&['delete', 'all permission'].some(permission => sales.includes(permission)) && (
                    <delbutton className="purbut" onClick={handleDeleteButtonClick} title='Delete'>
                      <i class="fa-solid fa-trash"></i>
                    </delbutton>
                  )}
                  {printButtonVisible &&['all permission', 'view'].some(permission => sales.includes(permission)) && (
                    <printbutton className="purbut" title="Print" onClick={generateReport}>
                      <i class="fa-solid fa-file-pdf"></i>
                    </printbutton>
                  )}
                  {showExcelButton && (
                    <printbutton className="purbut" title='Excel' onClick={handleExcelDownload}>
                      <i class="fa-solid fa-file-excel"></i>
                    </printbutton>
                  )}
                  <printbutton className="purbut" onClick={handleReload} title='Reload'>
                    <i class="fa-solid fa-arrow-rotate-right"></i>
                  </printbutton>
                         <a className='border-none text-dark p-1 mt-2' title='Setting' onClick={navigateToSalesSettings} style={{ cursor: "pointer" }}>
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
                <div class="d-flex justify-content-between ">
                  <div className="d-flex justify-content-start me-4">
                    <h1 align="left" className="h1">Sales</h1>
                  </div>
                  <div class="dropdown mt-1 ms-5" style={{ paddingLeft: 0 }}>
                    <button class="btn btn-primary dropdown-toggle p-1 ms-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fa-solid fa-list"></i>
                    </button>
                    <ul class="dropdown-menu menu">
                      {buttonsVisible && (
                        <li class="iconbutton d-flex justify-content-center text-success">
                          {['add', 'all permission'].some(permission => sales.includes(permission)) && (
                            <icon class="icon" onClick={handleSaveButtonClick}>
                              <i class="fa-regular fa-floppy-disk"></i>
                            </icon>
                          )}
                        </li>
                      )}
                      {authorizeButton && (
                      <li class="iconbutton d-flex justify-content-center text-success">
                        <icon class="icon" onClick={handleAuthorizedButtonClick}>
                          <i class="fa-solid fa-check"></i>
                        </icon>
                      </li>
                      )}
                      <li class="iconbutton  d-flex justify-content-center text-danger">
                        {['delete', 'all permission'].some(permission => sales.includes(permission)) && (
                          <icon class="icon" onClick={handleDeleteButtonClick}>
                            <i class="fa-solid fa-trash"></i>
                          </icon>
                        )}
                      </li>
                      <li class="iconbutton  d-flex justify-content-center text-warning">
                        {['all permission', 'view'].some(permission => sales.includes(permission)) && (
                          <icon class="icon" onClick={generateReport}>
                            <i class="fa-solid fa-file-pdf"></i>
                          </icon>
                        )}</li>
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
              {/* <div className="status justify-content-center mb-3">{status}</div> */}
              <div className="row  ms-3 me-3">
                {showDropdown && (
                  <div className="col-md-3 form-group mb-2">
     <label className={`${deleteError && !selectedStatus   ? 'red' : ''}`}>Status<span className="text-danger">*</span></label>
                    <div class="exp-form-floating">
                       <div title="Select the Status">
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
                  </div>
                )}
                <div className="col-md-3 form-group mb-2">
                  <label htmlFor="party_code" className={`${deleteError && !billNo ? 'red' : ''}`}>Bill No{showAsterisk && <span className="text-danger">*</span>}</label>
                  <div className="exp-form-floating">
                    <div class="d-flex justify-content-end">
                      <input
                        id="billNo"
                        className="exp-input-field form-control justify-content-start"
                        type="text"
                        placeholder=""
                        required
                        value={billNo}
                        onChange={handleChangeNo}
                        onKeyPress={handleKeyPressRef}
                        autoComplete="off"
                      />
                      <div className='position-absolute mt-1 me-2'>
                        <span className="icon searchIcon"
                          onClick={handleShowModall}>
                          <i class="fa fa-search"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <label htmlFor="party_code" className={`${error && !customerCode ? 'red' : ''}`}>
                    Customer Code{!showAsterisk && <span className="text-danger">*</span>}
                  </label>
                  <div className="exp-form-floating">
                    <div class="d-flex justify-content-end">
                      <input
                        className="exp-input-field form-control justify-content-start"
                        id='customercode'
                        required
                        value={customerCode}
                        maxLength={18}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        autoComplete="off"
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
                  <div className="exp-form-floating">
                    <label id="customer">Customer Name</label>
                    <input
                      className="exp-input-field form-control"
                      id="customername"
                      required
                      value={customerName}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label htmlFor="" className={`${error && !payType ? 'red' : ''}`}>Pay Type{!showAsterisk && <span className="text-danger">*</span>}</label>
                    <div title="Select the pay type">
                    <Select
                      id="payType"
                      value={selectedPay}
                      onChange={handleChangePay}
                      options={filteredOptionPay}
                      className="exp-input-field"
                      placeholder=""
                      required
                      data-tip="Please select a payment type"
                      autoComplete="off"
                    // ref={paytype}
                    // onKeyDown={(e) => handleKeyDown(e, SaleS, paytype)}
                    />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label htmlFor="" className={`${error && !salesType ? 'red' : ''}`}>Sales Type{!showAsterisk && <span className="text-danger">*</span>}</label>
                    <div title="Select the Sales type">
                    <Select
                      id="salesType"
                      value={selectedSales}
                      onChange={handleChangeSales}
                      options={filteredOptionSales}
                      className="exp-input-field"
                      placeholder=""
                      required
                      data-tip="Please select a payment type"
                      autoComplete="off"
                    // ref={SaleS}
                    // onKeyDown={(e) => handleKeyDown(e, order, SaleS)}
                    />
                  </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label htmlFor="" >Order Type</label>
                     <div title="Select the Order Type">
                    <Select
                      id="ordertype"
                      value={selectedOrder}
                      onChange={handleChangeOrder}
                      options={filteredOptionOrder}
                      className="exp-input-field"
                      placeholder=""
                      required
                      data-tip="Please select a payment type"
                      autoComplete="off"
                    // ref={order}
                    // onKeyDown={(e) => handleKeyDown(e, billdate, order)}
                    />
                  </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2 ">
                  <div className="exp-form-floating">
                    <label htmlFor="" className={`${error && !billDate ? 'red' : ''}`}>Bill Date{!showAsterisk && <span className="text-danger">*</span>}</label>
                    <input
                      name="transactionDate"
                      id="billDate"
                      className="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required
                      value={billDate}
                      onChange={(e) => setBillDate(e.target.value)}
                      autoComplete="off"
                    // ref={billdate}
                    // onKeyDown={(e) => handleKeyDown(e, dc, billdate)}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label >DC No</label>
                    <input
                      name="transactionNumber"
                      id="dcno"
                      type="text"
                      className="exp-input-field form-control"
                      placeholder=""
                      required
                      value={delvychellanno}
                      maxLength={18}
                      onChange={(e) => setDelvychellanno(e.target.value)}
                      autoComplete="off"
                    // ref={dc}
                    // onKeyDown={(e) => handleKeyDown}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <label for="">Default Warehouse</label>
                  <div class="exp-form-floating">
                     <div title="Select the Warehouse">
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
                <div className="col-md-3 form-group mb-2">
                  <label for="">Sales Mode</label>
                  <div class="exp-form-floating">
                     <div title="Select the Sales mode">
                    <Select
                      id="salesMode"
                      className="exp-input-field"
                      placeholder=""
                      required
                      value={selectedSalesMode}
                      onChange={handleChangeSalesMode}
                      options={filteredOptionSalesMode}
                      isDisabled={isLocked}
                    />
                  </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-lg p-3 bg-body-tertiary rounded mt-2">
              <div className="row ms-1">
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <div className="exp-form-floating">
                        <label htmlFor="paidAmount" className="">Paid Amount</label>
                        <input
                          id="paidAmount"
                          type="number"
                          className="form-control exp-input-field"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="exp-form-floating">
                        <label htmlFor="returnAmount" className="">Return Amount</label>
                        <input
                          id="returnAmount"
                          type="number"
                          className="form-control exp-input-field"
                          value={returnAmount}
                          onChange={(e) => setReturnAmount(e.target.value)}
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <div className="exp-form-floating">
                        <label htmlFor="totalSaleAmount" className="">Total Sales Amount</label>
                        <input
                          id="totalSaleAmount"
                          type="text"
                          className="form-control exp-input-field"
                          value={Totalsales}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="exp-form-floating">
                        <label htmlFor="totalTaxAmount" className="">Total Tax</label>
                        <input
                          id="totalTaxAmount"
                          type="text"
                          className="form-control exp-input-field"
                          value={TotalTax}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <div className="exp-form-floating">
                        <label htmlFor="roundOff" className="">Round Off</label>
                        <input
                          id="roundOff"
                          type="text"
                          className="form-control exp-input-field"
                          value={round_difference}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="exp-form-floating">
                        <label htmlFor="totalBillAmount" className="">Total Bill Amount</label>
                        <input
                          id="totalBillAmount"
                          type="text"
                          className="form-control exp-input-field"
                          value={TotalBill}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                  <div className="col-md-6 mb-2">
                    <div className="exp-form-floating">
                      <label htmlFor="totalBillAmount" className="">Item Code</label>
                      <Select
                        id="salesMode"
                        className="exp-input-field"
                        placeholder=""
                        required
                        title="Please select the item code"
                        value={selectedItem}
                        onChange={handleChangeItem}
                        options={filteredOptionItem}
                      />
                    </div>
                  </div>
                  <div className="d-none">
                    <div className="exp-form-floating">
                      <label htmlFor="customername" className="">Screen Type</label>
                      <input
                        id="customername"
                        className="form-control"
                        value={Type}
                        onChange={(e) => setType(e.target.value)}
                      />
                    </div>
                  </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="ag-theme-alpine" style={{ height: 200, width: "100%" }}>
                    <AgGridReact
                      columnDefs={columnDefsTermsConditions}
                      rowData={rowDataTerms}
                      defaultColDef={{ editable: !showExcelButton }}
                      rowHeight={30}
                      onRowClicked={handleRowClicked}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-lg p-1 mt-2 bg-body-tertiary rounded  pt-3 pb-4" align="left">
              <div class="d-flex justify-content-between ms-4" style={{ marginBlock: "", marginTop: "10px" }} >
                <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "14px" }}>
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
                  defaultColDef={{ flex:true }}
                  rowSelection="Single"
                  onSelectionChanged={() => console.log('Selection Changed')}
                  onCellValueChanged={async (event) => {
                    if (event.colDef.field === 'salesQty' || event.colDef.field === 'purchaseAmt') {
                      await ItemSalesAmountCalculation(event);
                    }
                    handleCellValueChanged(event);
                  }}
                  onRowClicked={handleRowClicked}
                />
              </div>
            </div>
          </div>
          <div>
            <SalesItemPopup open={open} handleClose={handleClose} handleItem={handleItem} type={salesMode} />
            <SalesWarehousePopup open={open1} handleClose={handleClose} handleWarehouse={handleWarehouse} />
            <SalesVendorPopup open={open2} handleClose={handleClose} handleVendor={handleVendor} />
            <SalesHdrPopup open={open3} handleClose={handleClose} handleData={handleData} />
            {showScanner && (<BarcodeScanner onClose={() => setShowScanner(false)} onScan={handleScanComplete} />)}
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
          <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
            <div class="d-flex justify-content-between">
              <div className="d-flex justify-content-start">
                <h1 align="left" className="purbut me-5" >Deleted Sales</h1>
              </div>
              <div className="col-md-1 form-group mb-2">
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
              </div>
            </div>
            <div class="mobileview">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 align="left" className="h1">Deleted Sales</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="shadow-lg p-1 bg-body-tertiary rounded  pt-3 pb-4" align="left">
            <div >
              <div className="row ms-3 me-3">
                <div className="col-md-3 form-group mb-2">
                  <label htmlFor="party_code" >Bill No</label>
                  <div className="exp-form-floating">
                    <div class="d-flex justify-content-end">
                      <input
                        className="exp-input-field form-control justify-content-start"
                        id='saleReferNo'
                        required
                        value={refNo}
                        onChange={handleDeletedRerNo}
                        onKeyPress={handleKeyDelete}
                        autoComplete="off"
                      />
                      <div className='position-absolute mt-1 me-2'>
                        <span className="icon searchIcon"
                          onClick={handleSalesData}>
                          <i class="fa fa-search"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <label htmlFor="party_code" className={`${error && !customerCode ? 'red' : ''}`}>
                    Customer Code
                  </label>
                  <div className="exp-form-floating ">
                    <div class="d-flex justify-content-between">
                      <input
                        className="exp-input-field form-control"
                        id='customercode'
                        required
                        value={deleteCustomerCode}
                        autoComplete="off"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label id="customer">Customer Name</label>
                    <input
                      className="exp-input-field form-control"
                      id="customername"
                      required
                      value={deleteCustomerName}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label htmlFor="" className={`${error && !payType ? 'red' : ''}`}>Pay type</label>
                    <input
                      id="payType"
                      value={deletePayType}
                      className="exp-input-field form-control"
                      placeholder=""
                      required
                      isDisabled={true}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label htmlFor="" >Sales Type</label>
                    <input
                      id="salesType"
                      value={deleteSalesType}
                      className="exp-input-field form-control"
                      placeholder=""
                      required
                      isDisabled={true}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label htmlFor="" >Order Type</label>
                    <input
                      id="ordertype"
                      value={deleteOrderType}
                      className="exp-input-field form-control"
                      placeholder=""
                      required
                      isDisabled={true}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label htmlFor="" className="bill-date-label">Bill Date</label>
                    <input
                      name="transactionDate"
                      id="billDate"
                      className="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required
                      readOnly
                      value={deleteBillDate}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div className="exp-form-floating">
                    <label >DC No.</label>
                    <input
                      name="transactionNumber"
                      id="dcno"
                      type="text"
                      className="exp-input-field form-control"
                      placeholder=""
                      required
                      readOnly
                      value={deleteDelvychellanno}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <label for="">Sales Mode</label>
                  <div class="exp-form-floating">
                    <input
                      id="deletedSalesMode"
                      className="exp-input-field form-control"
                      placeholder=""
                      required
                      readOnly
                      value={deletedSalesMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4" align="left">
            <div className='row ms-3 me-3'>
              <div className="col-md-6">
                <div className="row">
                  <div className="col-md-6 form-group mb-2">
                    <div className="exp-form-floating">
                      <label htmlFor="">Paid Amount</label>
                      <input
                        name=""
                        id="deletedPaidAmount"
                        type="number"
                        className="exp-input-field form-control input"
                        placeholder=""
                        required
                        readOnly
                        value={deletedPaidAmount}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 form-group mb-2">
                    <div className="exp-form-floating">
                      <label htmlFor="">Return Amount</label>
                      <input
                        name=""
                        id="deletedReturnAmount"
                        type="number"
                        className="exp-input-field form-control input"
                        placeholder=""
                        required
                        readOnly
                        value={deletedReturnAmount}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 form-group">
                    <div className="exp-form-floating">
                      <label htmlFor="" >Total Sales Amount</label>
                      <input
                        id="totalSaleAmount"
                        className="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        required
                        value={deleteTotalsales}
                        readOnly
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 form-group">
                    <div className="exp-form-floating">
                      <label htmlFor="">Total Tax</label>
                      <input
                        name="totalTaxAmount"
                        id="totalTaxAmount"
                        text="text"
                        className="exp-input-field form-control"
                        placeholder=""
                        required
                        value={deleteTotalTax}
                        readOnly
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 form-group">
                    <div className="exp-form-floating">
                      <label htmlFor="">Round Off</label>
                      <input
                        name=""
                        id="roundOff"
                        type="text"
                        className="exp-input-field form-control"
                        placeholder=""
                        required
                        value={deleteRoundedDifference}
                        readOnly
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 form-group">
                    <div className="exp-form-floating">
                      <label htmlFor="">Total Bill Amount</label>
                      <input
                        name=""
                        id="totalBillAmount"
                        type="text"
                        className="exp-input-field form-control"
                        placeholder=""
                        required
                        value={deleteTotalBill}
                        readOnly
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="ag-theme-alpine" style={{ height: 200, width: "100%" }}>
                  <AgGridReact
                    columnDefs={deletedTermsConditions}
                    rowData={deletedRowDataTerms}
                    rowHeight={28}
                    onRowClicked={handleRowClicked}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="shadow-lg p-1 mt-2 bg-body-tertiary rounded  pt-3 pb-4" align="left">
            <div class="d-flex justify-content-between ms-4" style={{ marginBlock: "", marginTop: "10px" }} >
              <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "14px" }}>
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
                columnDefs={activeTable === 'myTable' ? columnDeletdDef : columnDelDefsTax}
                rowData={activeTable === 'myTable' ? rowDataDelete : rowDataTaxDelete}
                defaultColDef={{ editable: true, resizable: true }}
                rowSelection="Single"
              />
            </div>
          </div>
          <div>
            <SalesDeletedPopup open={open4} handleClose={handleClose} handleDeletedData={handleDeletedData} />
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




export default Sales;