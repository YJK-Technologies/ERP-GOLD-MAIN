import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import "./apps.css";
import "./input.css";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "ag-grid-autocomplete-editor/dist/main.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./mobile.css";
import QuotationItemPopup from "./QuotationItemPopup";
import QuotationPopup from "./QuotationPopup";
import { ToastContainer, toast } from "react-toastify";
import "./mobile.css";
import labels from "./Labels";
import Select from 'react-select';
import { showConfirmationToast } from './ToastConfirmation';
import QuotationCustomerPopup from './SalesVendorPopup';
import { useLocation } from 'react-router-dom';
import DeletedQuotaionHelp from './DeletedQuotationPopup';
import LZString from "lz-string";
import LoadingScreen from './Loading';

const config = require("./Apiconfig");

function Quotation() {
  const [rowData, setRowData] = useState([]);
  const [rowDataTax, setRowDataTax] = useState([]);
  const [rowDataTerms, setrowDataTerms] = useState([{ serialNumber: 1, Terms_conditions: '' }]);
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [entryDate, setEntryDate] = useState("");
  const [TotalBill, setTotalBill] = useState("");
  const [TotalTax, setTotalTax] = useState(0);
  const [TotalPurchase, setTotalPurchase] = useState(0);
  const [round_difference, setRoundDifference] = useState(0);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [clickedRowIndex, setClickedRowIndex] = useState(null);
  const [globalItem, setGlobalItem] = useState(null);
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [financialYearStart, setFinancialYearStart] = useState("");
  const [financialYearEnd, setFinancialYearEnd] = useState("");
  const [showAsterisk, setShowAsterisk] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productDrop, setProductDrop] = useState([]);
  const [product, setProduct] = useState("");
  const [dynamicOptions, setDynamicOptions] = useState([]);
  const [selectedDynamicOption, setSelectedDynamicOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [additionalData, setAdditionalData] = useState({
    modified_by: "",
    created_by: "",
    modified_date: "",
    created_date: "",
  });

  const [transactionNo, setTransactionNo] = useState("");
  const [activeTable, setActiveTable] = useState("myTable");
  const [screensDrop, setScreensDrop] = useState([]);
  const [Screens, setScreens] = useState('');
  const [selectedscreens, setSelectedscreens] = useState(null);

  const location = useLocation();
  const savedPath = sessionStorage.getItem('currentPath');

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || {};
  const quotationPermission = permissions
    .filter((permission) => permission.screen_type === "Quotation")
    .map((permission) => permission.permission_type.toLowerCase());

  useEffect(() => {
    const currentPath = location.pathname;
    console.log(`Current path: ${currentPath}`);
    if (savedPath !== '/Quotation') {
      sessionStorage.getItem('QuotationScreenSelection');
    }
  }, [location]);

  useEffect(() => {
    const savedScreen = sessionStorage.getItem('QuotationScreenSelection');
    if (savedScreen) {
      setSelectedscreens({ value: savedScreen, label: savedScreen === 'Add' ? 'Add' : 'Delete' });
      setScreens(savedScreen);
    } else {
      setSelectedscreens({ value: 'Add', label: 'Add' });
      setScreens('Add');
    }
  }, []);

  useEffect(() => {
    const companyCode = sessionStorage.getItem('selectedCompanyCode');
        
    fetch(`${config.apiBaseUrl}/getEvent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_code: companyCode,
      }),
    })

      .then((response) => response.json())
      .then((data) => setScreensDrop(data))
      .catch((error) => console.error("Error fetching purchase types:", error));
  }, []);

  const handleChangeScreens = (selected) => {
    setSelectedscreens(selected);
    const screenValue = selected?.value === 'Add' ? 'Add' : 'Delete';
    setScreens(screenValue);
    sessionStorage.setItem('QuotationScreenSelection', screenValue);
  };

  const filteredOptionScreens = screensDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const [headerRowData, setHeaderRowData] = useState([
    { fieldName: "Customer Code", billTo: "" },
    { fieldName: "Customer Name", billTo: "" },
    { fieldName: "Address 1", billTo: "" },
    { fieldName: "Address 2", billTo: "" },
    { fieldName: "Address 3", billTo: "" },
    { fieldName: "Address 4", billTo: "" },
    { fieldName: "State", billTo: "" },
    { fieldName: "Country", billTo: "" },
    { fieldName: "Mobile No", billTo: "" },
    { fieldName: "GST No", billTo: "" },
    { fieldName: "Contact Person", billTo: "" },
  ]);

  const onCellValueChangedBillTo = (params) => {
    if (params.data.fieldName === "Customer Code") {
      if (!params.data.billTo) {
        setHeaderRowData((prevData) =>
          prevData.map((row) => ({
            ...row,
            billTo: row.fieldName === "Customer Code" ? row.billTo : "", // Retain only Customer Code field's value
          }))
        );
      } else {
        handleCustomerDetailsBillTo(params.data.billTo);
      }
    }
  };


  useEffect(() => {
    const companyCode = sessionStorage.getItem('selectedCompanyCode');

    const fetchData = async () => {
      try {
        const response = await 
        
    fetch(`${config.apiBaseUrl}/TermsQO`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_code: companyCode,
      }),
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
        setrowDataTerms(updatedData);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchData();
  }, []);


  const columnHeader = [
    {
      headerName: "Details",
      field: "fieldName",
      // maxWidth: 240,
      editable: false,
    },
    {
      headerName: "Bill To",
      field: "billTo",
      editable: true,
      cellEditor: "agTextCellEditor",
      onCellValueChanged: onCellValueChangedBillTo,
      cellEditorParams: {
        maxLength: 250,
      },
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 150;
        const showSearchIcon = params.data.fieldName === "Customer Code" && isWideEnough;

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
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                onClick={handleShowModal}
              >
                <i className="fa fa-search"></i>
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const handleCustomerDetailsBillTo = async (customerCode) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getCustomerDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_code: customerCode,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (response.ok) {
        const searchData = await response.json();

        if (searchData.length === 0) {
          toast.warning("Customer code is not available!");
          return;
        }

        const [
          {
            customer_code,
            customer_name,
            customer_addr_1,
            customer_addr_2,
            customer_addr_3,
            customer_addr_4,
            customer_state,
            customer_country,
            customer_mobile_no,
            contact_person,
            customer_gst_no
          },
        ] = searchData;

        setHeaderRowData((prevRowData) =>
          prevRowData.map((row) => {
            switch (row.fieldName) {
              case "Customer Code":
                return { ...row, billTo: customer_code };
              case "Customer Name":
                return { ...row, billTo: customer_name };
              case "Address 1":
                return { ...row, billTo: customer_addr_1 };
              case "Address 2":
                return { ...row, billTo: customer_addr_2 };
              case "Address 3":
                return { ...row, billTo: customer_addr_3 };
              case "Address 4":
                return { ...row, billTo: customer_addr_4 };
              case "State":
                return { ...row, billTo: customer_state };
              case "Country":
                return { ...row, billTo: customer_country };
              case "Mobile No":
                return { ...row, billTo: customer_mobile_no };
              case "GST No":
                return { ...row, billTo: customer_gst_no };
              case "Contact Person":
                return { ...row, billTo: contact_person };
              default:
                return row;
            }
          })
        );
      } else if (response.status === 404) {
        toast.warning("Data not found", {
          onClose: () => {
            setHeaderRowData((prevRowData) =>
              prevRowData.map((row) => ({
                ...row,
                billTo: "",
              }))
            );
          },
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("An error occurred while fetching customer details.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    setOpen3(true);
  };

  const handleToggleTable = (table) => {
    setActiveTable(table);
  };

  //Item Name Popup
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
    setOpen2(false);
    setOpen3(false);
    setOpen4(false);
  };

  //CODE FOR TOTAL WEIGHT, TOTAL TAX AND TOTAL AMOUNT CALCULATION
  const ItemAmountCalculation = async (params) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/ItemAmountCalculation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Item_SNO: params.data.serialNumber,
            Item_code: params.data.itemCode,
            bill_qty: params.data.purchaseQty,
            purchaser_amt: params.data.purchaseAmt,
            tax_type_header: params.data.taxType,
            tax_name_details: params.data.taxDetail,
            tax_percentage: params.data.taxPercentage,
            keyfield: params.data.keyField
          }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();

        const updatedRowData = rowData.map((row) => {
          if (
            row.itemCode === params.data.itemCode &&
            row.serialNumber === params.data.serialNumber
          ) {
            const matchedItem = searchData.find((item) => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                TotalItemAmount: matchedItem.TotalItemAmount,
                TotalTaxAmount: matchedItem.TotalTaxAmount 
                
              };
            }
          }
          return row;
        });

        setRowData(updatedRowData);

        setRowDataTax((prevRowDataTax) => {
          let updatedRowDataTaxCopy = [...prevRowDataTax];

        searchData.forEach((item) => {
          updatedRowDataTaxCopy = updatedRowDataTaxCopy.filter(row => 
            !(row.ItemSNO === item.ItemSNO && row.TaxSNO === item.TaxSNO)
         );

            const newRow = {
              ItemSNO: item.ItemSNO,
              TaxSNO: item.TaxSNO,
              Item_code: item.Item_code,
              TaxType: item.TaxType,
              TaxPercentage: item.TaxPercentage,
              TaxAmount: item.TaxAmount,
              ItemTotalWight: item.ItemTotalWight,
              keyfield: item.keyfield,
            };
            updatedRowDataTaxCopy.push(newRow);
            console.log(newRow);
        });

        updatedRowDataTaxCopy.sort((a, b) => a.ItemSNO - b.ItemSNO);

        return updatedRowDataTaxCopy;
    });
      
        const hasPurchaseQty = updatedRowData.some(row => row.purchaseQty >= 0);

        if (hasPurchaseQty) {
          const totalItemAmounts = updatedRowData.map((row) => row.TotalItemAmount || 0).join(",");
          const totalTaxAmounts = updatedRowData.map((row) => row.TotalTaxAmount || 0).join(",");

          // Remove trailing commas if present
          const formattedTotalItemAmounts = totalItemAmounts.endsWith(",")? totalItemAmounts.slice(0, -1): totalItemAmounts;
          const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(",")? totalTaxAmounts.slice(0, -1): totalTaxAmounts;

          console.log("formattedTotalItemAmounts", formattedTotalItemAmounts);
          console.log("formattedTotalTaxAmounts", formattedTotalTaxAmounts);

          // Ensure that TotalAmountCalculation receives numbers, not strings
           TotalAmountCalculation(formattedTotalTaxAmounts,formattedTotalItemAmounts)
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

  const TotalAmountCalculation = async ( formattedTotalTaxAmounts, formattedTotalItemAmounts ) => {
    if ( parseFloat(formattedTotalTaxAmounts) >= 0 && parseFloat(formattedTotalItemAmounts) >= 0 ) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/TotalAmountCalculation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Tax_amount: formattedTotalTaxAmounts,
              Putchase_amount: formattedTotalItemAmounts,
              company_code:sessionStorage.getItem("selectedCompanyCode")
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          // console.table(data)
          const [
            { rounded_amount, round_difference, TotalPurchase, TotalTax },
          ] = data;
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

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };


  //CODE ITEM CODE TO ADD NEW ROW FUNCTION
  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex, newValue } = params;
    const lastRowIndex = rowData.length - 1;

    if (colDef.field === "Qty") {
      const quantity = parseFloat(newValue);

      if (quantity > 0 && rowIndex === lastRowIndex) {
        const serialNumber = rowData.length + 1;
        const newRowData = {
          serialNumber,
          itemCode: null,
          itemName: null,
          purchaseQty: 0,
          itemImages: null,
          purchaseAmt: null,
          TotalTaxAmount: null,
          TotalItemAmount: null,
        };

        setRowData((prevRowData) => [...prevRowData, newRowData]);
      }
    }
  };

  // const handleDelete = (params) => {
  //   const serialNumberToDelete = params.data.serialNumber;

  //   const updatedRowData = rowData.filter(row => Number(row.serialNumber) !== Number(serialNumberToDelete));
  //   const updatedRowDataTax = rowDataTax.filter(row => Number(row.ItemSNO) !== Number(serialNumberToDelete));

  //   setRowData(updatedRowData);
  //   setRowDataTax(updatedRowDataTax);

  //   if (updatedRowData.length === 0) {
  //     const newRow = {
  //       serialNumber: 1,
  //       itemCode: "",
  //       itemName: "",
  //       unitWeight: "",
  //       warehouse: "",
  //       purchaseQty: "",
  //       ItemTotalWight: "",
  //       purchaseAmt: "",
  //       TotalTaxAmount: "",
  //       TotalItemAmount: "",
  //     };
  //     setRowData([newRow]);

  //     const formattedTotalItemAmounts = "0.00";
  //     const formattedTotalTaxAmounts = "0.00";

  //     TotalAmountCalculation(
  //       formattedTotalTaxAmounts,
  //       formattedTotalItemAmounts
  //     );
  //   } else {
  //     const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
  //       ...row,
  //       serialNumber: index + 1,
  //     }));

  //     setRowData(updatedRowDataWithNewSerials);

  //     const updatedRowDataTaxWithNewSerials = updatedRowDataTax.map((taxRow) => {
  //       const correspondingRow = updatedRowDataWithNewSerials.find(
  //         (dataRow) => dataRow.keyField === taxRow.keyfield
  //       );

  //       return correspondingRow
  //         ? { ...taxRow, ItemSNO: correspondingRow.serialNumber.toString() }
  //         : taxRow;
  //     });
  //     setRowDataTax(updatedRowDataTaxWithNewSerials);

  //     const totalItemAmounts = updatedRowData
  //       .map((row) => row.TotalItemAmount || "0.00")
  //       .join(",");
  //     const totalTaxAmounts = updatedRowData
  //       .map((row) => row.TotalTaxAmount || "0.00")
  //       .join(",");

  //     const formattedTotalItemAmounts = totalItemAmounts.endsWith(",")
  //       ? totalItemAmounts.slice(0, -1)
  //       : totalItemAmounts;
  //     const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(",")
  //       ? totalTaxAmounts.slice(0, -1)
  //       : totalTaxAmounts;

  //     TotalAmountCalculation(
  //       formattedTotalTaxAmounts,
  //       formattedTotalItemAmounts
  //     );
  //   }
  // };


  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber;

    const updatedRowData = rowData.filter(row => Number(row.serialNumber) !== Number(serialNumberToDelete));
    const updatedRowDataTax = rowDataTax.filter(row => Number(row.ItemSNO) !== Number(serialNumberToDelete));

    setRowData(updatedRowData);
    setRowDataTax(updatedRowDataTax);


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

  };

  const handleDeleteTerms = (params) => {
    const serialNumberToDelete = params.data.serialNumber;

    const updatedRowData = rowData.filter(row => Number(row.serialNumber) !== Number(serialNumberToDelete));


    setrowDataTerms(updatedRowData);


    const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
      ...row,
      serialNumber: index + 1
    }));
    setrowDataTerms(updatedRowDataWithNewSerials);

  };

  function qtyValueSetter(params) {
    const newValue = parseFloat(params.newValue);
    params.data.qty = newValue;
    return true;
  }

      const [rowdatapatch, setrowdatapatch] = useState([
          { fieldName: 'Kind Attention',Notes:''},
          { fieldName: 'Quotation Validity',Notes:''}  
      ]);

      const columnPatch = [
        { 
          headerName: 'Details', 
          field: 'fieldName', 
          editable: false 
        },
        {
            headerName: 'Notes',
            field: 'Notes',
            editable: true,
            onCellValueChanged: onCellValueChangedBillTo,
            cellEditorParams: {
                maxLength: 250
            },
        }
    ];

  const columnDefs = [
    {
      headerName: "S.No",
      field: "serialNumber",
      maxWidth: 80,
      sortable: false,
      editable: false,
    },
    {
      headerName: "",
      field: "delete",
      editable: false,
      maxWidth: 25,
      tooltipValueGetter: (p) => "Delete",
      onCellClicked: handleDelete,
      cellRenderer: function (params) {
        return (
          <FontAwesomeIcon
            icon="fa-solid fa-trash"
            style={{ cursor: "pointer", marginRight: "12px" }}
          />
        );
      },
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      sortable: false,
    },
    {
      headerName: "Product / Item Code",
      field: "itemCode",
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: "Item Name",
      field: "itemName",
      editable: true,
      filter: true,
      sortable: false,
      // minWidth: 260,
    },
    // {
    //   headerName: "",
    //   field: "Search",
    //   editable: true,
    //   maxWidth: 25,
    //   tooltipValueGetter: (params) => "Item Help",
    //   onCellClicked: handleClickOpen,
    //   cellRenderer: function () {
    //     return (
    //       <FontAwesomeIcon
    //         icon="fa-solid fa-magnifying-glass-plus"
    //         style={{ cursor: "pointer", marginRight: "12px" }}
    //       />
    //     );
    //   },
    //   cellStyle: {
    //     display: "flex",
    //     justifyContent: "center",
    //     alignItems: "center",
    //   },
    //   sortable: false,
    //   filter: false,
    // },
    {
      headerName: "Description",
      field: "Description",
      editable: true,
      filter: true,
      sortable: false,
      // minWidth: 260,
    },
    {
      headerName: "Qty",
      field: "purchaseQty",
      editable: true,
      // minWidth: 140,
      filter: true,
      sortable: false,
      // valueSetter: qtyValueSetter,
      cellEditorParams: {
        maxLength: 10,
      },
    },
    {
      headerName: "Ref.Image",
      field: "image",
      editable: false,
      filter: true,
      sortable: false,
      cellStyle: { textAlign: "center" },
      cellRenderer: (params) => {
        if (params.value) {
          const base64Image = arrayBufferToBase64(params.value.data);
          return (
            <img src={`data:image/jpeg;base64,${base64Image}`}
              alt="Product Image"
              style={{ width: " 50px", height: "50px" }}
            />
          );
        } else {
          return "";
        }
      },
      hide: false
    },
    {
      headerName: "Unit Price",
      field: "purchaseAmt",
      // minWidth: 170,
      editable: true,
      filter: true,
      sortable: false,
    },
    {
      headerName: "HSN",
      field: "HSN_code",
      editable: false,
      filter: true,
      sortable: false,
      // minWidth: 150,
    },
    {
      headerName: "Tax Amount",
      field: "TotalTaxAmount",
      editable: false,
      // minWidth: 150,
      filter: true,
      sortable: false,
    },
    {
      headerName: "Total",
      field: "TotalItemAmount",
      editable: false,
      // minWidth: 150,
      filter: true,
      sortable: false,
    },
    {
      headerName: "Purchase Tax Type",
      field: "taxType",
      editable: false,
      filter: true,
      hide: false,
      sortable: false,
    },
    {
      headerName: "Tax Detail",
      field: "taxDetail",
      editable: false,
      filter: true,
      hide: false,
      sortable: false,
    },
    {
      headerName: "tax Percentage",
      field: "taxPercentage",
      editable: false,
      filter: true,
      hide: false,
      sortable: false,
    },
    {
      headerName: 'KeyField',
      field: 'keyField',
      editable: false,
      // maxWidth: 150,
      filter: true,
      sortable: false,
      hide: true,
    }
  ];

  //DEFINE TAX DETAIL COLUMNS
  const columnDefsTax = [
    {
      headerName: "S.No",
      field: "ItemSNO",
      maxWidth: 250,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Tax S.No",
      field: "TaxSNO",
      maxWidth: 170,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Item Code",
      field: "Item_code",
      // minWidth: 315,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Tax Type ",
      field: "TaxType",
      // minWidth: 315,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Tax %",
      field: "TaxPercentage",
      // minWidth: 250,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Tax Amount",
      field: "TaxAmount",
      // minWidth: 301,
      sortable: false,
      editable: false,
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

  const DeleteTerms = (params) => {
    const { data } = params;
    setrowDataTerms((prevRows) => {
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

  const columnDefsTermsConditions = [
    {
      headerName: 'S.No',
      field: 'serialNumber',
      maxWidth: 70,
      valueGetter: (params) => params.node.rowIndex + 1,
      sortable: false,
      minHeight: 50,
      maxHeight: 50,
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
      minHeight: 50,
      maxHeight: 50,
    },
    {
      headerName: 'Terms & Conditions',
      field: 'Terms_conditions',
      // minWidth: 1000,
      // maxWidth: 1000,
      minHeight: 50,
      maxHeight: 50,
      maxLength: 250,
      sortable: false,
      editable: true,
      flex:true,
      onCellValueChanged: (params) => handleValueChanged(params),
    },
  ];

  const handleValueChanged = (params) => {
    const { data, colDef } = params;
    // Ensure the field is Terms_conditions and the value is not empty
    if (colDef.field === "Terms_conditions" && data.Terms_conditions?.trim() !== "") {
      const isLastRow = rowDataTerms[rowDataTerms.length - 1] === data;
      if (isLastRow) {
        // Add a new row with an incremented serial number
        const newRow = {
          serialNumber: rowDataTerms.length + 1,
          Terms_conditions: "", // Ensure the correct field name is used
        };
        setrowDataTerms((prevRows) => [...prevRows, newRow]);
      }
    }
  };


  const handleUpdateButtonClick = async () => {
    if (!transactionNo || !entryDate ) {
        setError(" ");
        toast.warning("Error: Missing required fields");
        return;
    }
    setLoading(true);

    try {
       
      const billToData = headerRowData.reduce((acc, row) => {
        acc[row.fieldName] = row.billTo;
        return acc;
    }, {});

    const datapatch = rowdatapatch.reduce((acc, row) => {
      acc[row.fieldName] = row.Notes;
      return acc;
  }, {});

    const Header = {
      company_code: sessionStorage.getItem("selectedCompanyCode"),
      transaction_no: transactionNo,
      customer_code: billToData['Customer Code'],
      customer_name: billToData['Customer Name'],
      customer_addr_1: billToData['Address 1'],
      customer_addr_2: billToData['Address 2'],
      customer_addr_3: billToData['Address 3'],
      customer_addr_4: billToData['Address 4'],
      customer_state: billToData['State'],
      customer_country: billToData['Country'],
      customer_mobile_no: billToData['Mobile No'],
      customer_gst_no: billToData['GST No'],
      contact_person: billToData['Contact Person'],
      kind_attention: datapatch['Kind Attention'] ? datapatch['Kind Attention'] : null,
      quotation_validity: datapatch['Quotation Validity'] ? datapatch['Quotation Validity'] : null,
      Entry_date: entryDate,
      purchase_amount: TotalPurchase,
      tax_amount: TotalTax,
      rounded_off: round_difference,
      total_amount: TotalBill,
      modified_by: sessionStorage.getItem("selectedUserCode"),
    };

        const response = await fetch(`${config.apiBaseUrl}/updQuotationheader`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Header),
        });

        if (response.ok) {
          await saveQuotationDetails(transactionNo);
          await saveQuotationTaxDetails(transactionNo);
          await savequoDetailTerms(transactionNo);
            setShowExcelButton(true);
            setShowUpdateButton(true);
            toast.success("Qutation Data updated Successfully")

        } else {
            const error = await response.json();
            toast.error('Error inserting data' + error.message);
        }
    } catch (error) {
        console.error("Error inserting data:", error);
        toast.error('Error inserting data: ' + error.message);
    } finally {
      setLoading(false);
    }
};
  //CODE TO SAVE PURCHASE HEADER
  const handleSaveButtonClick = async () => {
    if (!entryDate) {
      setError(" ");
      return;
    }

    if (rowData.length === 0 || rowDataTax.length === 0) {
      toast.warning("No item details or tax details found to save.");
      return;
    }

    const filteredRowData = rowData.filter(
      (row) =>
        row.purchaseQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0
    );

    if (filteredRowData.length === 0 || rowDataTax.length === 0) {
      toast.warning(
        "please check Qty, Unit price and Total values Should be greater than Zero"
      );
      return;
    }
    setLoading(true);

    try {
      const billToData = headerRowData.reduce((acc, row) => {
        acc[row.fieldName] = row.billTo;
        return acc;
    }, {});

    const datapatch = rowdatapatch.reduce((acc, row) => {
      acc[row.fieldName] = row.Notes;
      return acc;
  }, {});


      const Header = {
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        customer_code: billToData['Customer Code'],
        customer_name: billToData['Customer Name'],
        customer_addr_1: billToData['Address 1'],
        customer_addr_2: billToData['Address 2'],
        customer_addr_3: billToData['Address 3'],
        customer_addr_4: billToData['Address 4'],
        customer_state: billToData['State'],
        customer_country: billToData['Country'],
        customer_mobile_no: billToData['Mobile No'],
        customer_gst_no: billToData['GST No'],
        contact_person: billToData['Contact Person'],
        kind_attention: datapatch['Kind Attention'] ? datapatch['Kind Attention'] : null,
        quotation_validity: datapatch['Quotation Validity'] ? datapatch['Quotation Validity'] : null,
        Entry_date: entryDate,
        purchase_amount: TotalPurchase,
        tax_amount: TotalTax,
        rounded_off: round_difference,
        total_amount: TotalBill,
        created_by: sessionStorage.getItem("selectedUserCode"),
      };

      const response = await fetch(`${config.apiBaseUrl}/addQuotationheader`, {
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
        setTransactionNo(transaction_no);

        await saveQuotationDetails(transaction_no);
        await saveQuotationTaxDetails(transaction_no);
        await savequoDetailTerms(transaction_no);
        toast.success("Data Inserted Successfully");
        setShowExcelButton(true); // Show the Excel button
        console.log("Purchase Header Data inserted successfully");
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message); // Log error message
        toast.warning(errorResponse.message || "Error");
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.warning("Error inserting data:")
    } finally {
      setLoading(false);
    }
  };

  //CODE TO SAVE PURCHASE DETAILS
  const saveQuotationDetails = async (transaction_no) => {
    try {
      const customer_code = headerRowData[0]?.billTo || "";
      const customer_name = headerRowData[1]?.billTo || "";
      const validRows = rowData.filter(
        (row) => row.itemCode && row.itemName && row.purchaseQty > 0
      );

      for (const row of validRows) {
        const formData = new FormData();

        formData.append("created_by", sessionStorage.getItem("selectedUserCode"));
        formData.append("company_code", sessionStorage.getItem("selectedCompanyCode"));
        formData.append("item_code", row.itemCode);
        formData.append("item_name", row.itemName);
        formData.append("bill_qty", row.purchaseQty);
        formData.append("item_amt", row.purchaseAmt);
        formData.append("bill_rate", row.TotalItemAmount);
        formData.append("tax_amount", row.TotalTaxAmount);
        formData.append("transaction_no", transaction_no);
        formData.append("Entry_date", entryDate);
        formData.append("ItemSNo", row.serialNumber);
        formData.append("hsn", row.HSN_code);
        formData.append("Description", row.Description);
        formData.append("customer_name", customer_name);
        formData.append("customer_code", customer_code);

        if (row.image && row.image.type === "Buffer") {
          const bufferData = new Uint8Array(row.image.data);
          const imageBlob = new Blob([bufferData], { type: "image/jpeg" });
          formData.append("item_images", imageBlob, "itemImage.jpg");
        } else {
          console.warn("Invalid image data, skipping image upload.");
        }

        const response = await fetch(`${config.apiBaseUrl}/addquotationdetail`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          console.log("Quotation details inserted successfully");
        } else {
          const errorResponse = await response.json();
          console.error("Error:", errorResponse.message);
          toast.warning(errorResponse.message || "Error occurred while saving data.");
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error("Failed to save quotation details. Please try again.");
    }
  };

  const saveQuotationTaxDetails = async (transaction_no) => {
    try {
      const savedRows = new Set();

      const customer_code = headerRowData[0].billTo;
      for (const row of rowData) {
        const matchingTaxRows = rowDataTax.filter(
          (taxRow) => taxRow.Item_code === row.itemCode
        );


        for (const taxRow of matchingTaxRows) {
          const uniqueKey = `${transaction_no}-${taxRow.ItemSNO}-${taxRow.TaxSNO}`;

          if (savedRows.has(uniqueKey)) {
            continue;
          }

          const Details = {
            customer_code,
            transaction_no: transaction_no.toString(),
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            item_code: row.itemCode,
            item_name: row.itemName,
            ItemSNo: taxRow.ItemSNO,
            TaxSNo: taxRow.TaxSNO,
            tax_type: row.taxType,
            Entry_date: entryDate,
            tax_name_details: taxRow.TaxType,
            tax_amt: taxRow.TaxAmount,
            tax_per: taxRow.TaxPercentage,
            created_by: sessionStorage.getItem("selectedUserCode"),
          };

          const response = await fetch(`${config.apiBaseUrl}/addquotetaxdetail`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(Details),
            }
          );

          if (response.ok) {
            console.log("Purchase Detail Data inserted successfully");
            savedRows.add(uniqueKey);
          } else if (response.status === 400) {
            const errorResponse = await response.json();
            console.error(errorResponse.error);
          } else {
            console.error("Failed to insert data for row");
          }
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  const savequoDetailTerms = async (transaction_no) => {
    try {
      // Filter rows where Terms_conditions is non-empty
      const validRows = rowDataTerms.filter(row => row.Terms_conditions.trim() !== '');

      // if (validRows.length === 0) {
      //     toast.warning('No valid Terms & Conditions to save.');
      //     return;
      // }

      for (const row of validRows) {
        const Details = {
          created_by: sessionStorage.getItem('selectedUserCode'),
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          transaction_no: transaction_no,
          Terms_conditions: row.Terms_conditions,
        };

        try {
          const response = await fetch(`${config.apiBaseUrl}/quoTermsandConditions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Details),
          });

          if (response.ok) {
            console.log("Terms & Conditions saved successfully");
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to save Terms & Conditions");
            console.error(errorResponse.details || errorResponse.message);
          }
        } catch (error) {
          console.error(`Error saving row: ${row.Terms_conditions}`, error);
          toast.error('Error saving data: ' + error.message);
        }
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error('Error saving data: ' + error.message);
    }
  };


  const PrintHeaderData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberToQuotationHeaderPrintData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'),transaction_no: transactionNo }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
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
      const response = await fetch(
        `${config.apiBaseUrl}/refNumberToQuotationDetailPrintData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'),transaction_no: transactionNo }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        console.log("Data received:", searchData);
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
      const response = await fetch(
        `${config.apiBaseUrl}/refNumberToQuoteSumTax`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'),transaction_no: transactionNo.toString() }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
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

  const openPrintWindow = (url, headerKey, detailKey, taxKey) => {
    const printWindow = window.open(url, '_blank');

    if (printWindow) {
        printWindow.addEventListener("beforeunload", () => {
            sessionStorage.removeItem(headerKey);
            sessionStorage.removeItem(detailKey);
            sessionStorage.removeItem(taxKey);
            console.log("Session storage cleared after print window closed.");
        });
    }
};

  const generateReport = async () => {
    if (!transactionNo) {
      setDeleteError(" ");
      toast.warning('Error: Missing required fields');
      return;
    }
    setLoading(true);

    try {
      const headerData = await PrintHeaderData();
      const detailData = await PrintDetailData();
      const taxData = await PrintSumTax();

      if (headerData && detailData && taxData) {

        let url, headerKey, detailKey, taxKey;

        headerKey = 'QuotationheaderData';
        detailKey = 'QuotationdetailData';
        taxKey = 'QuotationtaxData';
        url = '/QuotationPrint'; 

        sessionStorage.setItem(headerKey, LZString.compress(JSON.stringify(headerData)));
        sessionStorage.setItem(detailKey, LZString.compress(JSON.stringify(detailData)));
        sessionStorage.setItem(taxKey, LZString.compress(JSON.stringify(taxData)));

        // sessionStorage.setItem('QuotationheaderData', JSON.stringify(headerData));
        // sessionStorage.setItem('QuotationdetailData', JSON.stringify(detailData));
        // sessionStorage.setItem('QuotationtaxData', JSON.stringify(taxData));

        // window.open('/QuotationPrint', '_blank');

        openPrintWindow(url, headerKey, detailKey, taxKey);
      } else {
        console.log("Failed to fetch some data");
        toast.error("Transaction No Does Not Exits");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImageAsBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleItem = async (selectedData) => {
    console.log("Selected Data:", selectedData);
    let updatedRowDataCopy = [...rowData];
    let highestSerialNumber = updatedRowDataCopy.reduce(
      (max, row) => Math.max(max, row.serialNumber),
      0
    );

    for (const item of selectedData) {
      // Convert image URL to base64 if needed
      let itemImages = item.itemImages;
      if (itemImages && itemImages.startsWith("http")) {
        itemImages = await fetchImageAsBase64(itemImages);
      }

      const existingItemWithSameCode = updatedRowDataCopy.find(
        (row) => row.serialNumber === global && row.itemCode === globalItem
      );

      if (existingItemWithSameCode) {
        console.log("if", existingItemWithSameCode);
        existingItemWithSameCode.itemCode = item.itemCode;
        existingItemWithSameCode.itemName = item.itemName;
        existingItemWithSameCode.purchaseAmt = item.purchaseAmt;
        existingItemWithSameCode.taxType = item.taxType;
        existingItemWithSameCode.taxDetail = item.taxDetails;
        existingItemWithSameCode.taxPercentage = item.taxPer;
        existingItemWithSameCode.itemImages = itemImages;
        existingItemWithSameCode.keyField = `${existingItemWithSameCode.serialNumber || ''}-${existingItemWithSameCode.itemCode || ''}`;
      } else {
        console.log("else");
        highestSerialNumber += 1;
        const newRow = {
          serialNumber: highestSerialNumber,
          itemCode: item.itemCode,
          itemName: item.itemName,
          purchaseAmt: item.purchaseAmt,
          taxType: item.taxType,
          taxDetail: item.taxDetails,
          taxPercentage: item.taxPer,
          itemImages: itemImages,
          keyField: `${highestSerialNumber}-${item.itemCode || ''}`,
        };
        updatedRowDataCopy.push(newRow);
      }
    }

    setRowData(updatedRowDataCopy);
    return true;
  };

  //code for ag grid clicked to get rowIndex
  const handleRowClicked = (event) => {
    const clickedRowIndex = event.rowIndex;
    setClickedRowIndex(clickedRowIndex);
  };

  const handleTransactionDateChange = (e) => {
    const date = e.target.value;
    if (date >= financialYearStart && date <= financialYearEnd) {
      setEntryDate(date);
    } else {
      toast.warning("Transaction date must be between April 1st, 2024 and March 31st, 2025.");
    }
  };

  const onGridReady = (params) => {
    console.log("Grid is ready");
    const columnState = localStorage.getItem("myColumnState");
    if (columnState) {
      params.columnApi.applyColumnState({ state: JSON.parse(columnState) });
    }
  };

  const onColumnMoved = (params) => {
    const columnState = JSON.stringify(params.columnApi.getColumnState());
    localStorage.setItem("myColumnState", columnState);
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatToTwoDecimalPoints = (number) => {
    return parseFloat(number).toFixed(2);
  };

  const handleDeleteHeader = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/quotedeletehdrData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: transactionNo,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          modified_by : sessionStorage.getItem("selectedUserCode")
        }),
      });
      if (response.ok) {
        console.log("Header deleted successfully:", transactionNo);
        return true;
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
      const response = await fetch(`${config.apiBaseUrl}/quotedeletedetData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: transactionNo,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
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

  const handleDeleteTaxDetail = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/quoteDeleteTaxData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: transactionNo,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
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

  const DeleteTermsQuotation = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/QuoTermsandConditionsDelete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: transactionNo.toString(),
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });
      if (response.ok) {
        console.log("Terms and conditions deleted successfully:", transactionNo);
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
    if (!transactionNo) {
      setDeleteError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to delete the data?",
      async () => {
        setLoading(true);
        try {
          const taxDetailResult = await handleDeleteTaxDetail();
          const detailResult = await handleDeleteDetail();
          const termsResult = await DeleteTermsQuotation();
          const headerResult = await handleDeleteHeader();

          if (headerResult === true && detailResult === true && taxDetailResult === true && termsResult === true) {
            console.log("Data Deleted Successfully");
            toast.success("Data Deleted Successfully", {
              autoClose: true,
              onClose: () => {
                window.location.reload();
              },
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
          toast.error("Error occurred: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data deletion cancelled.");
      }
    );
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

    const financialYearStartDate = new Date(startYear, 3, 1)
      .toISOString()
      .split("T")[0]; // April 1
    const financialYearEndDate = new Date(endYear, 2, 31)
      .toISOString()
      .split("T")[0]; // March 31

    setFinancialYearStart(financialYearStartDate);
    setFinancialYearEnd(financialYearEndDate);
  }, []);

  const handleExcelDownload = () => {
    const headerData = [
      {
        "Entry Date": entryDate,
        "Transaction No": transactionNo,
        "Company Code": sessionStorage.getItem("selectedCompanyCode"),
        "Customer Code": headerRowData[0].billTo,
        "Customer Name": headerRowData[1].billTo,
        "Customer Address 1": headerRowData[2].billTo,
        "Customer Address 2": headerRowData[3].billTo,
        "Customer Address 3": headerRowData[4].billTo,
        "Customer Address 4": headerRowData[5].billTo,
        "Customer State": headerRowData[6].billTo,
        "Customer Country": headerRowData[7].billTo,
        "Customer Mobile No": headerRowData[8].billTo,
        "Customer GST No": headerRowData[9].billTo,
        "Contact Person": headerRowData[10].billTo,
        "Purchase Amount": TotalPurchase,
        "Tax Amount": TotalTax,
        "Rounded Off": round_difference,
        "Total Amount": TotalBill,
      },
    ];

    const itemData = rowData
      .filter((row) => row.itemCode && row.itemName && row.purchaseQty > 0)
      .map((row) => ({
        "Entry Date": entryDate,
        "Transaction No": transactionNo,
        "Customer Name": headerRowData[0].billTo,
        "Item SNo": row.serialNumber,
        "Item Code": row.itemCode,
        "HSN Code": row.HSN_code,
        "Item Name": row.itemName,
        "Bill Qty": row.purchaseQty,
        "Item Amount": row.purchaseAmt,
        "Bill Rate": row.TotalItemAmount,
        "Tax Amount": row.TotalTaxAmount,
      }));

    const taxDetailsData = rowDataTax.map((taxRow) => {
      const matchedItem = rowData.find(
        (row) => Number(row.serialNumber) === Number(taxRow.ItemSNO)
      );

      return {
        "Transaction No": transactionNo.toString(),
        "Entry Date": entryDate,
        "Item SNo": taxRow.ItemSNO,
        "Item Code": matchedItem ? matchedItem.itemCode : "",
        "Item Name": matchedItem ? matchedItem.itemName : "",
        "Tax SNo": taxRow.TaxSNO,
        "Tax Type": taxRow.TaxType,
        "Tax Amount": taxRow.TaxAmount,
        "Tax Percentage": taxRow.TaxPercentage,
      };
    });

    const headerWorksheet = XLSX.utils.json_to_sheet(headerData);

    const itemWorksheet = XLSX.utils.json_to_sheet(itemData);

    const taxDetailsWorksheet = XLSX.utils.json_to_sheet(taxDetailsData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, headerWorksheet, "Header Data");
    XLSX.utils.book_append_sheet(workbook, itemWorksheet, "Detail Data");
    XLSX.utils.book_append_sheet(workbook, taxDetailsWorksheet, "Tax Details");

    XLSX.writeFile(workbook, "Quotation.xlsx");
  };

  const handleQuotationData = async (data) => {
    if (data && data.length > 0) {
      setShowAsterisk(true);
      setButtonsVisible(false);
      setShowExcelButton(true);
      setShowUpdateButton(true);

      const [
        {
          TransactionNo,
          CustomerCode,
          EntryDate,
          CustomerName,
          CustomerAddr1,
          CustomerAddr2,
          CustomerAddr3,
          CustomerAddr4,
          CustomerState,
          CustomerCountry,
          ContactPerson,
          ContactMobileNo,
          TaxAmount,
          PurchaseAmount,
          RoundOff,
          TotalAmount,
          GSTNo,
          attention,
          Quotation_Validity,

        },
      ] = data;

      const transactionNumber = document.getElementById("RefNo");
      if (transactionNumber) {
        transactionNumber.value = TransactionNo;
        setTransactionNo(TransactionNo);
      } else {
        console.error("transactionNumber element not found");
      }

      const entrydate = document.getElementById("entryDate");
      if (entrydate) {
        entrydate.value = EntryDate;
        setEntryDate(formatDate(EntryDate)); // You can choose to use formattedDate instead if required
      } else {
        console.error("entry element not found");
      }
      const totalPurchaseAmount = document.getElementById(
        "totalPurchaseAmount"
      );
      if (totalPurchaseAmount) {
        totalPurchaseAmount.value = PurchaseAmount;
        setTotalPurchase(formatToTwoDecimalPoints(PurchaseAmount));
      } else {
        console.error("transactionNumber element not found");
      }

      const totalBillAmount = document.getElementById("totalBillAmount");
      if (totalBillAmount) {
        totalBillAmount.value = TotalAmount;
        setTotalBill(formatToTwoDecimalPoints(TotalAmount));
      } else {
        console.error("transactionNumber element not found");
      }

      const roundOff = document.getElementById("roundOff");
      if (roundOff) {
        roundOff.value = RoundOff;
        setRoundDifference(RoundOff);
      } else {
        console.error("transactionNumber element not found");
      }

      const taxAmount = document.getElementById("roundOff");
      if (taxAmount) {
        taxAmount.value = TaxAmount;
        setTotalTax(TaxAmount);
      } else {
        console.error("transactionNumber element not found");
      }

      await QuotationDetailView(TransactionNo);
      await QuotationTax(TransactionNo);
      await QuotationTC(TransactionNo);

      setHeaderRowData([
        { fieldName: "Customer Code", billTo: CustomerCode },
        { fieldName: "Customer Name", billTo: CustomerName },
        { fieldName: "Address 1", billTo: CustomerAddr1 },
        { fieldName: "Address 2", billTo: CustomerAddr2 },
        { fieldName: "Address 3", billTo: CustomerAddr3 },
        { fieldName: "Address 4", billTo: CustomerAddr4 },
        { fieldName: "State", billTo: CustomerState },
        { fieldName: "Country", billTo: CustomerCountry },
        { fieldName: "Mobile No", billTo: ContactMobileNo },
        { fieldName: "GST No", billTo: GSTNo },
        { fieldName: "Contact Person", billTo: ContactPerson },
      ]);

      setrowdatapatch([
        { fieldName: "Kind Attention", Notes: attention },
        { fieldName: "Quotation Validity", Notes: Quotation_Validity }
  
      ]);

    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  };

  const QuotationTax = async (TransactionNo) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/getQuotationTaxDetailView`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction_no: TransactionNo,
            company_code: sessionStorage.getItem("selectedCompanyCode"),
          }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];
        const taxDataMap = {};
  
        searchData.forEach(
          ({
            ItemSNo,
            TaxSNo,
            item_code,
            tax_name_details,
            tax_per,
            tax_amt,
            tax_type,
          }) => {
            newRowData.push({
              ItemSNO: ItemSNo,
              TaxSNO: TaxSNo,
              Item_code: item_code,
              TaxType: tax_name_details,
              TaxPercentage: tax_per,
              TaxAmount: tax_amt,
              TaxName: tax_type,
              keyfield: `${ItemSNo}-${item_code || ''}`,
            });
  
            if (!taxDataMap[ItemSNo]) {
              taxDataMap[ItemSNo] = {
                tax_type: tax_type,
                tax_names: [],
                tax_percents: [],
              };
            }
  
            taxDataMap[ItemSNo].tax_names.push(tax_name_details);
            taxDataMap[ItemSNo].tax_percents.push(tax_per);
          }
        );
  
        await QuotationDetailView(TransactionNo, taxDataMap);
  
        setRowDataTax(newRowData);
      } else if (response.status === 404) {
        console.log("Data not found");
        setRowDataTax([]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };
  
  const QuotationDetailView = async (TransactionNo, taxDataMap) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/getQuotationDetailView`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction_no: TransactionNo,
            company_code: sessionStorage.getItem("selectedCompanyCode"),
          }),
        }
      );
  
      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
  
        const newRowData = [];
        searchData.forEach((item) => {
          const {
            ItemSNo,
            item_code,
            item_name,
            bill_qty,
            item_images,
            item_amt,
            tax_amount,
            bill_rate,
            hsn,
            Description
          } = item;
  
          const taxInfo = taxDataMap[ItemSNo] || {
            tax_type: '',
            tax_names: [],
            tax_percents: [],
          };
  
          newRowData.push({
            serialNumber: ItemSNo,
            itemCode: item_code,
            itemName: item_name,
            Description: Description,
            HSN_code: hsn,
            image: item_images,
            purchaseQty: bill_qty,
            TotalTaxAmount: tax_amount,
            purchaseAmt: item_amt,
            TotalItemAmount: bill_rate,
            taxType: taxInfo.tax_type, 
            taxDetail: taxInfo.tax_names.join(", "), 
            taxPercentage: taxInfo.tax_percents.join(", "),
            keyField: `${ItemSNo}-${item_code || ''}`,
          });
        });
  
        setRowData(newRowData);
      } else if (response.status === 404) {
        console.log("Data not found");
        setRowData([]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const QuotationTC = async (TransactionNo) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/getQuotationTCDetailView`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction_no: TransactionNo,
            company_code: sessionStorage.getItem("selectedCompanyCode"),
          }),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData)

        const newRowData = [];
        searchData.forEach(item => {
          const {

            Terms_conditions

          } = item;

          newRowData.push({
            Terms_conditions: Terms_conditions,

          });

        });

        setrowDataTerms(newRowData);

      } else if (response.status === 404) {
        console.log("Data not found");
        setrowDataTerms([]);
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };



  const handleKeyPressRef = (e) => {
    if (e.key === "Enter") {
      handleRefNo(transactionNo);
    }

  };

  const handleRefNo = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getQuotation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: code,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }), // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        setButtonsVisible(false);
        setShowExcelButton(true);
        setShowUpdateButton(true);
        setShowAsterisk(true);
        const searchData = await response.json();
        if (searchData.Header && searchData.Header.length > 0) {
          const item = searchData.Header[0];
          setEntryDate(formatDate(item.Entry_date));
          setTransactionNo(item.transaction_no);
          setTotalPurchase(item.purchase_amount);
          setTotalBill(item.total_amount);
          setRoundDifference(item.rounded_off);
          setTotalTax(item.tax_amount);

          setHeaderRowData([
            { fieldName: "Customer Code", billTo: item.customer_code },
            { fieldName: "Customer Name", billTo: item.customer_name },
            { fieldName: "Address 1", billTo: item.customer_addr_1 },
            { fieldName: "Address 2", billTo: item.customer_addr_2 },
            { fieldName: "Address 3", billTo: item.customer_addr_3 },
            { fieldName: "Address 4", billTo: item.customer_addr_4 },
            { fieldName: "State", billTo: item.customer_state },
            { fieldName: "Country", billTo: item.customer_country },
            { fieldName: "Mobile No", billTo: item.customer_mobile_no }, // Assuming no mobile numbers are fetched
            { fieldName: "GST No", billTo: item.customer_gst_no }, // Assuming no mobile numbers are fetched
            { fieldName: "Contact Person", billTo: item.contact_person },
          ]);

          setrowdatapatch([
            { fieldName: "Kind Attention", Notes: item.kind_attention},
            { fieldName: "Quotation Validity", Notes: item.quotation_validity},
          ]);

        } else {
          console.log("Header Data is empty or not found");
          setEntryDate("");
          setTransactionNo("");
          setTotalPurchase("");
          setTotalBill("");
          setRoundDifference("");
          setTotalTax("");
        }

        if (searchData.Detail && searchData.Detail.length > 0) {
          const updatedRowData = searchData.Detail.map((item) => {
            const matchingDetails = searchData.TaxDetail.filter(
              (detailItem) => detailItem.ItemSNo === item.ItemSNo
          );
          const taxDetail = matchingDetails.map((detail) => detail.tax_name_details).join(', ');
          const taxPercentage = matchingDetails.map((detail) => detail.tax_per).join(', ');

          const taxType = matchingDetails.length > 0 ? matchingDetails[0].tax_type : '';

            return {
              serialNumber: item.ItemSNo,
              itemCode: item.item_code,
              itemName: item.item_name,
              itemImages: item.item_images
                ? arrayBufferToBase64(item.item_images.data)
                : null,
              purchaseQty: item.bill_qty,
              purchaseAmt: item.item_amt,
              Description: item.Description || '',
              HSN_code: item.hsn,
              image: item.item_images,
              taxType,
              taxDetail,
              taxPercentage,
              keyField: `${item.ItemSNo}-${item.item_code || ''}`,
              TotalTaxAmount: item.tax_amount,
              TotalItemAmount: item.bill_rate,
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

        if (searchData.TaxDetail && searchData.TaxDetail.length > 0) {
          const updatedRowDataTax = searchData.TaxDetail.map((item) => ({
            ItemSNO: item.ItemSNo,
            TaxSNO: item.TaxSNo,
            Item_code: item.item_code,
            TaxType: item.tax_name_details,
            TaxPercentage: item.tax_per,
            TaxAmount: item.tax_amt,
            TaxName: item.tax_type,
            keyfield: `${item.ItemSNo}-${item.item_code || ''}`,
          }));

          console.log("Updated Row Data Tax:", updatedRowDataTax);
          setRowDataTax(updatedRowDataTax);
        } else {
          console.log("Tax Data is empty or not found");
          setRowDataTax([]);
        }


        if (searchData.Terms && searchData.Terms.length > 0) {
          const updatedRowData = searchData.Terms.map((item) => {
            return {
              Terms_conditions: item.Terms_conditions,
            };
          });

          setrowDataTerms(updatedRowData);
        } else {

          console.log(" Data is empty or not found");

          setrowDataTerms([]);
        }


        console.log("data fetched successfully");
      } else if (response.status === 404) {
        toast.warning("Data not found");

        setEntryDate("");
        setTotalPurchase("");
        setTotalTax("");
        setRoundDifference("");
        setTotalBill("");
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
        setrowDataTerms([]);
        setRowDataTax([]);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message); // Log error message
        toast.error(errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
       fetch(`${config.apiBaseUrl}/getItem`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode"),
              }),
            })
      .then((data) => data.json())
      .then((data) => {
        setProductDrop(data);
        const defaultInvoice = data.find((item) => item.attributedetails_name === "Product") || data[0];
        if (defaultInvoice) {
          setSelectedProduct({
            value: defaultInvoice.attributedetails_name,
            label: defaultInvoice.attributedetails_name,
          });
          setProduct(defaultInvoice.attributedetails_name);

          if (defaultInvoice.attributedetails_name === "Product") {
            fetchCodes(defaultInvoice.attributedetails_name);
          }
        }
      });
  }, []);

  const handleChangeProduct = (selectedProduct) => {
    setSelectedProduct(selectedProduct);
    setProduct(selectedProduct ? selectedProduct.value : '');
    fetchCodes(selectedProduct.value);
  };

  const filteredOptionProduct = productDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  // const fetchProductCodes = () => {
  //   fetch(`${config.apiBaseUrl}/getProductcode`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ company_code: sessionStorage.getItem("selectedCompanyCode") })
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const formattedData = data.map((product) => ({
  //         value: product.Product_Code,
  //         label: product.Product_Code,
  //       }));
  //       setDynamicOptions(formattedData);
  //     })
  //     .catch((error) => console.error('Error fetching product codes:', error));
  // };

  // const fetchItemCodes = () => {
  //   fetch(`${config.apiBaseUrl}/itemcode`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ company_code: sessionStorage.getItem("selectedCompanyCode") })
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const formattedData = data.map((item) => ({
  //         value: item.Item_code,
  //         label: item.Item_code,
  //       }));
  //       setDynamicOptions(formattedData);
  //     })
  //     .catch((error) => console.error('Error fetching item codes:', error));
  // };

  const fetchCodes = (selectedValue) => {
    fetch(`${config.apiBaseUrl}/getcodetest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            filter: selectedValue,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            const formattedData = data.map((item) => ({
                value: item.code,
                label: `${item.code} - ${item.name}`,
            }));
            setDynamicOptions(formattedData);
        })
        .catch((error) => {
            console.error('Error fetching product codes:', error);
        });
};

  const handleChangeDynamicOption = (selectedOption) => {
    console.log('Selected Option:', selectedOption);
    console.log('Selected Product:', selectedProduct);

    setSelectedDynamicOption(selectedOption);

    if (selectedProduct && selectedProduct.value === 'Item') {
      handleItemCode(selectedOption.value);
      console.log(selectedOption.value)
    } else if (selectedProduct && selectedProduct.value === 'Product') {
      handlequotationProductCode(selectedOption.value);

    }
  };


  const handlequotationProductCode = async (Product_Code) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/Quotation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Product_Code,
          company_code: sessionStorage.getItem("selectedCompanyCode")
        })
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);

        // Get the last serial number or default to 0 if rowData is empty
        const lastSerialNumber = rowData.length > 0 ? rowData[rowData.length - 1].serialNumber : 0;
        const updatedSerialNo = lastSerialNumber + 1;

        // Map the fetched data into new rows with appropriate properties
        const newRows = searchData.map((matchedItem) => ({
          serialNumber: updatedSerialNo, // Serial number increments for each item added
          itemCode: matchedItem.product_code,
          image: matchedItem.image,
          itemName: matchedItem.product_name,
          Description: matchedItem.HeaderDescription,
          HSN_code: matchedItem.HSN_code,
          purchaseAmt: matchedItem.Product_price,
          taxType: matchedItem.tax_type,
          taxDetail: matchedItem.combined_tax_details,
          taxPercentage: matchedItem.combined_tax_percent,
          keyField: `${updatedSerialNo}-${matchedItem.product_code || ''}` // Unique key for each row
        }));

        // Update the state by appending the new rows to the previous row data
        setRowData(prevRowData => [...prevRowData, ...newRows]);
      } else if (response.status === 404) {
        toast.warning('Data not found');
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  //ITEM CODE TO SEARCH IN AG GRID
  // const handleItemCode = async (Item_code) => {
  //   try {
  //     const response = await fetch(
  //       `${config.apiBaseUrl}/getItemCodeSalesDataQuote`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ Item_code,company_code: sessionStorage.getItem("selectedCompanyCode") }),
  //       }
  //     );

  //     if (response.ok) {
  //       const searchData = await response.json();
  //       const updatedRow = rowData.map((row) => {
  //         if (Item_code) {
  //           const matchedItem = searchData.find((item) => item.id === row.id);
  //           if (matchedItem) {
  //             return {
  //               ...row,
  //               itemCode: matchedItem.Item_code,
  //               image: matchedItem.image,
  //               itemName: matchedItem.Item_name,
  //               unitWeight: matchedItem.Item_wigh,
  //               purchaseAmt: matchedItem.Item_std_purch_price,
  //               taxType: matchedItem.Item_purch_tax_type,
  //               taxDetails: matchedItem.combined_tax_details,
  //               taxPer: matchedItem.combined_tax_percent,
  //               keyField: `${row.serialNumber || ''}-${matchedItem.Item_code || ''}`,
  //               // itemImages: matchedItem.item_images
  //               //   ? arrayBufferToBase64(matchedItem.item_images.data)
  //               //   : null,
  //             };
  //           }
  //         }
  //         return row;
  //       });
  //       setRowData(updatedRow);
  //       console.log(updatedRow);
  //     } else if (response.status === 404) {
  //       toast.warning('Data not found');
  //     } else {
  //       console.log("Bad request");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching search data:", error);
  //   }
  // };
  const handleItemCode = async (Item_code) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getItemCodeSalesDataQuote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Item_code, company_code: sessionStorage.getItem("selectedCompanyCode") }),
      });

      if (response.ok) {
        const searchData = await response.json();

        const lastSerialNumber = rowData.length > 0 ? rowData[rowData.length - 1].serialNumber : 0;
        const updatedSerialNo = lastSerialNumber + 1;

        const newRows = searchData.map((matchedItem) => ({
          serialNumber: updatedSerialNo,
          itemCode: matchedItem.Item_code,
          image: matchedItem.image,
          itemName: matchedItem.Item_name,
          unitWeight: matchedItem.Item_wigh,
          purchaseAmt: matchedItem.Item_std_sales_price,
          HSN_code: matchedItem.hsn,
          taxType: matchedItem.Item_sales_tax_type,
          taxDetail: matchedItem.combined_tax_details,
          taxPercentage: matchedItem.combined_tax_percent,

          keyField: `${updatedSerialNo || ''}-${matchedItem.Item_code || ''}`,
          image: matchedItem.image,
        }));

        setRowData((prevRowData) => [...prevRowData, ...newRows]);
      } else if (response.status === 404) {
        toast.warning('Data not found');
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleShowModal = () => {
    setOpen2(true);
  };

  const handleVendor = async (data) => {
    if (data && data.length > 0) {
      const [{ CustomerCode, CustomerName, Address1, Address2, Address3, Address4, State, Country, MobileNo, ContactPerson, GSTNo }] = data;

      setHeaderRowData((prevRowData) =>
        prevRowData.map((row) => {
          switch (row.fieldName) {
            case "Customer Code":
              return { ...row, billTo: CustomerCode };
            case "Customer Name":
              return { ...row, billTo: CustomerName };
            case "Address 1":
              return { ...row, billTo: Address1 };
            case "Address 2":
              return { ...row, billTo: Address2 };
            case "Address 3":
              return { ...row, billTo: Address3 };
            case "Address 4":
              return { ...row, billTo: Address4 };
            case "State":
              return { ...row, billTo: State };
            case "Country":
              return { ...row, billTo: Country };
            case "Mobile No":
              return { ...row, billTo: MobileNo };
            case "GST No":
              return { ...row, billTo: GSTNo };
            case "Contact Person":
              return { ...row, billTo: ContactPerson };
            default:
              return row;
          }
        })
      );

    } else {
      console.error('Data is empty or undefined');
    }
  };

  //Deleted Screen
  const [deletedRowData, setDeletedRowData] = useState([]);
  const [deletedRowDataTax, setDeletedRowDataTax] = useState([]);
  const [deletedRowDataTerms, setDeletedRowDataTerms] = useState([]);
  const [TransactionNo, setTransactionno] = useState("");
  const [TransactionDate, setTransactionDate] = useState("");
  const [Total, setTotal] = useState("");
  const [Tax, setTax] = useState("");
  const [RoundOff, setRoundOff] = useState("");
  const [GrandTotal, setGrandTotal] = useState("");

  
  const [deletedrowdatapatch, setdeleterowdatapatch] = useState([
    { fieldName: 'Kind Attention',deletedNotes:''},
    { fieldName: 'Quotation Validity',deletedNotes:''}
]);

const columDeletedPatch = [
  { headerName: 'Details', field: 'fieldName', maxWidth: 240, editable: false },
  {
      headerName: 'Notes',
      field: 'deletedNotes',
      editable: true,
      onCellValueChanged: onCellValueChangedBillTo,
      cellEditorParams: {
          maxLength: 250
      },
  }
];


  const deletedColumnDetail = [
    {
      headerName: "S.No",
      field: "deletedSerialNumber",
      maxWidth: 80,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Product / Item Code",
      field: "deletedItemCode",
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: "Item Name",
      field: "deletedItemName",
      editable: false,
      filter: true,
      sortable: false,
      // maxWidth: 260,
      // minWidth: 260,
    },
    {
      headerName: "Description",
      field: "deletedDescription",
      editable: false,
      filter: true,
      sortable: false,
      // maxWidth: 260,
      // minWidth: 260,
    },
    {
      headerName: "Qty",
      field: "deletedPurchaseQty",
      editable: false,
      // maxWidth: 140,
      filter: true,
      sortable: false,
    },
    {
      headerName: "Ref.Image",
      field: "deletedImage",
      editable: false,
      filter: true,
      sortable: false,
      cellStyle: { textAlign: "center" },
      cellRenderer: (params) => {
        if (params.value) {
          const base64Image = arrayBufferToBase64(params.value.data);
          return (
            <img src={`data:image/jpeg;base64,${base64Image}`}
              alt="Product Image"
              style={{ width: " 50px", height: "50px" }}
            />
          );
        } else {
          return "";
        }
      },
      hide: false
    },
    {
      headerName: "Unit Price",
      field: "deletedPurchaseAmt",
      // maxWidth: 170,
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: "HSN",
      field: "deletedHSN_code",
      editable: false,
      filter: true,
      sortable: false,
      // maxWidth: 150,
      // minWidth: 150,
    },
    {
      headerName: "Tax Amount",
      field: "deletedTotalTaxAmount",
      editable: false,
      // maxWidth: 200,
      filter: true,
      sortable: false,
    },
    {
      headerName: "Total",
      field: "deletedTotalItemAmount",
      editable: false,
      // minWidth: 150,
      filter: true,
      sortable: false,
    },
  ];

  const deletedColumnTax = [
    {
      headerName: "S.No",
      field: "deletedItemSNO",
      maxWidth: 250,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Tax S.No",
      field: "deletedTaxSNO",
      maxWidth: 170,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Item Code",
      field: "deletedItem_code",
      // minWidth: 315,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Tax Type ",
      field: "deletedTaxType",
      // minWidth: 315,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Tax %",
      field: "deletedTaxPercentage",
      // minWidth: 250,
      sortable: false,
      editable: false,
    },
    {
      headerName: "Tax Amount",
      field: "deletedTaxAmount",
      // minWidth: 301,
      sortable: false,
      editable: false,
    },
  ];

  const deletedColumnHeader = [
    {
      headerName: "Details",
      field: "fieldName",
      // maxWidth: 240,
      editable: false,
    },
    {
      headerName: "Bill To",
      field: "deletedBillTo",
      editable: false,
      cellEditor: "agTextCellEditor",
    },
  ];

  const [deletedHeaderRowData, setDeletedHeaderRowData] = useState([
    { fieldName: "Customer Code", deletedBillTo: "" },
    { fieldName: "Customer Name", deletedBillTo: "" },
    { fieldName: "Address 1", deletedBillTo: "" },
    { fieldName: "Address 2", deletedBillTo: "" },
    { fieldName: "Address 3", deletedBillTo: "" },
    { fieldName: "Address 4", deletedBillTo: "" },
    { fieldName: "State", deletedBillTo: "" },
    { fieldName: "Country", deletedBillTo: "" },
    { fieldName: "Mobile No", deletedBillTo: "" },
    { fieldName: "GST No", deletedBillTo: "" },
    { fieldName: "Contact Person", deletedBillTo: "" },
  ]);

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
      // minWidth: 1000,
      // maxWidth: 1000,
      minHeight: 50,
      maxHeight: 50,
      maxLength: 250,
      sortable: false,
      editable: false,
    },
  ];

  const handleDeleteKeyPress = (e) => {
    if (e.key === "Enter") {
      handleDeletedTransaction(TransactionNo);
    }

  };

  const handleDeletedTransaction = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedQuotation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: code,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });
      if (response.ok) {
        const searchData = await response.json();
        if (searchData.Header && searchData.Header.length > 0) {
          const item = searchData.Header[0];
          setTransactionDate(formatDate(item.Entry_date));
          setTransactionno(item.transaction_no);
          setTotal(item.purchase_amount);
          setGrandTotal(item.total_amount);
          setRoundOff(item.rounded_off);
          setTax(item.tax_amount);

          setdeleterowdatapatch([
            { fieldName: 'Kind Attention', deletedNotes: item.kind_attention},
            { fieldName: 'Quotation Validity', deletedNotes: item.quotation_validity}
          ]);

          setDeletedHeaderRowData([
            { fieldName: "Customer Code", deletedBillTo: item.customer_code },
            { fieldName: "Customer Name", deletedBillTo: item.customer_name },
            { fieldName: "Address 1", deletedBillTo: item.customer_addr_1 },
            { fieldName: "Address 2", deletedBillTo: item.customer_addr_2 },
            { fieldName: "Address 3", deletedBillTo: item.customer_addr_3 },
            { fieldName: "Address 4", deletedBillTo: item.customer_addr_4 },
            { fieldName: "State", deletedBillTo: item.customer_state },
            { fieldName: "Country", deletedBillTo: item.customer_country },
            { fieldName: "Mobile No", deletedBillTo: item.customer_mobile_no }, // Assuming no mobile numbers are fetched
            { fieldName: "GST No", deletedBillTo: item.customer_gst_no },
            { fieldName: "Contact Person", deletedBillTo: item.contact_person },
          ]);

        } else {
          console.log("Header Data is empty or not found");
          setTransactionDate("");
          setTransactionno("");
          setTotal("");
          setGrandTotal("");
          setRoundOff("");
          setTax("");
        }

        if (searchData.Detail && searchData.Detail.length > 0) {
          const updatedRowData = searchData.Detail.map((item) => {
            return {
              deletedSerialNumber: item.ItemSNo,
              deletedItemCode: item.item_code,
              deletedItemName: item.item_name,
              deletedPurchaseQty: item.bill_qty,
              deletedPurchaseAmt: item.item_amt,
              deletedDescription: item.Description,
              deletedHSN_code: item.hsn,
              deletedImage: item.item_images,
              deletedTotalTaxAmount: parseFloat(item.tax_amount).toFixed(2),
              deletedTotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
            };
          });

          setDeletedRowData(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setDeletedRowData([]);
        }

        if (searchData.TaxDetail && searchData.TaxDetail.length > 0) {
          const updatedRowDataTax = searchData.TaxDetail.map((item) => ({
            deletedItemSNO: item.ItemSNo,
            deletedTaxSNO: item.TaxSNo,
            deletedItem_code: item.item_code,
            deletedTaxType: item.tax_name_details,
            deletedTaxPercentage: parseFloat(item.tax_per).toFixed(2),
            deletedTaxAmount: parseFloat(item.tax_amt).toFixed(2),
          }));

          console.log("Updated Row Data Tax:", updatedRowDataTax);
          setDeletedRowDataTax(updatedRowDataTax);
        } else {
          console.log("Tax Data is empty or not found");
          setDeletedRowDataTax([]);
        }
        if (searchData.Terms && searchData.Terms.length > 0) {
          const updatedRowData = searchData.Terms.map((item) => {
            return {
              deletedTermsConditions: item.Terms_conditions,
            };
          });

          setDeletedRowDataTerms(updatedRowData);
        } else {
          console.log(" Data is empty or not found");
          setDeletedRowDataTerms([]);
        }

        console.log("data fetched successfully");
      } else if (response.status === 404) {
        toast.warning("Data not found");

        setTransactionDate("");
        setTransactionno("");
        setTotal("");
        setGrandTotal("");
        setRoundOff("");
        setTax("");
        setDeletedRowData([]);
        setDeletedRowDataTerms([]);
        setDeletedHeaderRowData([]);
        setDeletedRowDataTax([]);
      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message); // Log error message
        toast.error(errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [open4, setOpen4] = React.useState(false);

  const handleDeletedQuotation = () => {
    setOpen4(true);
  };

  const handleDeletedQuotationData = async (data) => {
    if (data && data.length > 0) {
      const [{ TransactionNo, CustomerCode, EntryDate, CustomerName, CustomerAddr1, CustomerAddr2, CustomerAddr3,
        CustomerAddr4, CustomerState, CustomerCountry, ContactPerson, ContactMobileNo, TaxAmount,KIND_attention,Quotation_validity,
        PurchaseAmount, RoundOff, TotalAmount,GSTNo }] = data;

      const transactionNumber = document.getElementById("TransactionNo");
      if (transactionNumber) {
        transactionNumber.value = TransactionNo;
        setTransactionno(TransactionNo);
      } else {
        console.error("transactionNumber element not found");
      }

      const transactiondate = document.getElementById("TransactionDate");
      if (transactiondate) {
        transactiondate.value = EntryDate;
        setTransactionDate(formatDate(EntryDate));
      } else {
        console.error("EntryDate element not found");
      }

      const total = document.getElementById("Total");
      if (total) {
        total.value = PurchaseAmount;
        setTotal(formatToTwoDecimalPoints(PurchaseAmount));
      } else {
        console.error("PurchaseAmount element not found");
      }

      const grandTotal = document.getElementById("GrandTotal");
      if (grandTotal) {
        grandTotal.value = TotalAmount;
        setGrandTotal(formatToTwoDecimalPoints(TotalAmount));
      } else {
        console.error("TotalAmount element not found");
      }

      const roundOff = document.getElementById("RoundOff");
      if (roundOff) {
        roundOff.value = RoundOff;
        setRoundOff(RoundOff);
      } else {
        console.error("RoundOff element not found");
      }

      const taxAmount = document.getElementById("Tax");
      if (taxAmount) {
        taxAmount.value = TaxAmount;
        setTax(TaxAmount);
      } else {
        console.error("TaxAmount element not found");
      }

      await DeletedQuotationDetailView(TransactionNo);
      await DeletedQuotationTaxView(TransactionNo);
      await DeletedTermsView(TransactionNo);

      setDeletedHeaderRowData([
        { fieldName: "Customer Code", deletedBillTo: CustomerCode },
        { fieldName: "Customer Name", deletedBillTo: CustomerName },
        { fieldName: "Address 1", deletedBillTo: CustomerAddr1 },
        { fieldName: "Address 2", deletedBillTo: CustomerAddr2 },
        { fieldName: "Address 3", deletedBillTo: CustomerAddr3 },
        { fieldName: "Address 4", deletedBillTo: CustomerAddr4 },
        { fieldName: "State", deletedBillTo: CustomerState },
        { fieldName: "Country", deletedBillTo: CustomerCountry },
        { fieldName: "Mobile No", deletedBillTo: ContactMobileNo },
        { fieldName: "GST No", deletedBillTo: GSTNo },
        { fieldName: "Contact Person", deletedBillTo: ContactPerson },
      ]);

      setdeleterowdatapatch([
        { fieldName: "Kind Attention", deletedNotes: KIND_attention},
        { fieldName: "Quotation Validity", deletedNotes: Quotation_validity },

      ]);

    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  };

  const DeletedQuotationTaxView = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedQuotationTaxDetailView`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: TransactionNo,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      }
      );

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];
        searchData.forEach(
          ({
            ItemSNo,
            TaxSNo,
            item_code,
            tax_name_details,
            tax_per,
            tax_amt,
            tax_type,
          }) => {
            newRowData.push({
              deletedItemSNO: ItemSNo,
              deletedTaxSNO: TaxSNo,
              deletedItem_code: item_code,
              deletedTaxType: tax_name_details,
              deletedTaxPercentage: tax_per,
              deletedTaxAmount: parseFloat(tax_amt).toFixed(2),
            });
          }
        );

        setDeletedRowDataTax(newRowData);
      } else if (response.status === 404) {
        console.log("Data not found");
        setDeletedRowDataTax([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to save Terms & Conditions");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const DeletedQuotationDetailView = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedQuotationDetailView`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: TransactionNo,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      }
      );

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);

        const newRowData = [];
        searchData.forEach((item) => {
          const {
            ItemSNo,
            item_code,
            item_name,
            bill_qty,
            item_images,
            item_amt,
            tax_amount,
            bill_rate,
            hsn,
            Description
          } = item;

          newRowData.push({
            deletedSerialNumber: ItemSNo,
            deletedItemCode: item_code,
            deletedItemName: item_name,
            deletedDescription: Description,
            deletedHSN_code: hsn,
            deletedImage: item_images,
            deletedPurchaseQty: bill_qty,
            deletedTotalTaxAmount: parseFloat(tax_amount).toFixed(2),
            deletedPurchaseAmt: parseFloat(item_amt).toFixed(2),
            deletedTotalItemAmount: parseFloat(bill_rate).toFixed(2),
          });
        });

        setDeletedRowData(newRowData);
      } else if (response.status === 404) {
        console.log("Data not found");
        setDeletedRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to save Terms & Conditions");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const DeletedTermsView = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedQuotationTerms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_no: TransactionNo,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      }
      );

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData)

        const newRowData = [];
        searchData.forEach(item => {
          const { Terms_conditions } = item;
          newRowData.push({
            deletedTermsConditions: Terms_conditions,
          });
        });

        setDeletedRowDataTerms(newRowData);

      } else if (response.status === 404) {
        console.log("Data not found");
        setDeletedRowDataTerms([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to save Terms & Conditions");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  //Default Date functionality
  const currentDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setEntryDate(currentDate);
  }, [currentDate]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (selectedDate >= financialYearStart && selectedDate <= financialYearEnd) {
      if (selectedDate !== currentDate) {
        console.log("Date has been changed.");
      }
      setEntryDate(selectedDate);
    } else {
      toast.warning('Transaction date must be between April 1st, 2024 and March 31st, 2025.');
    }
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
                  <h1 align="left" className="purbut me-5">
                    Quotation
                  </h1>
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
                  {buttonsVisible &&
                    ["add", "all permission"].some((permission) => quotationPermission.includes(permission)) && (
                      <savebutton className="purbut" onClick={handleSaveButtonClick} title="Save">
                        <i class="fa-regular fa-floppy-disk"></i>
                      </savebutton>
                    )}

{showUpdateButton && ['update', 'all permission'].some(permission => quotationPermission.includes(permission)) && (
                                <savebutton className="purbut" onClick={handleUpdateButtonClick} title='Update' >
                                    <i class="fa-solid fa-floppy-disk"></i>
                                </savebutton>
                            )} 

                  {["delete", "all permission"].some((permission) => quotationPermission.includes(permission)) && (
                    <delbutton className="purbut" onClick={handleDeleteButtonClick} title="Delete">
                      <i class="fa-solid fa-trash"></i>
                    </delbutton>
                  )}
                  {["all permission", "view"].some((permission) => quotationPermission.includes(permission)) && (
                    <printbutton className="purbut" title="Print" onClick={generateReport}>
                      <i class="fa-solid fa-file-pdf"></i>
                    </printbutton>
                  )}
                  {showExcelButton && (
                    <printbutton className="purbut" title="Excel" onClick={handleExcelDownload}>
                      <i class="fa-solid fa-file-excel"></i>
                    </printbutton>
                  )}
                  <printbutton className="purbut" title="Reload" onClick={handleReload}>
                    <i class="fa-solid fa-arrow-rotate-right"></i>
                  </printbutton>
                </div>
              </div>
              <div class="mobileview">
                <div class="d-flex justify-content-between ">
                  <div className="d-flex justify-content-start">
                    <h1 align="left" className="h1">
                      Quotation
                    </h1>
                  </div>
                  <div class="dropdown mt-1 ms-5" style={{ paddingLeft: 0 }}>
                    <button class="btn btn-primary dropdown-toggle p-1 ms-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fa-solid fa-list"></i>
                    </button>
                    <ul class="dropdown-menu menu">
                      {buttonsVisible && (
                        <li class="iconbutton d-flex justify-content-center text-success">
                          {["add", "all permission"].some((permission) => quotationPermission.includes(permission)) && (
                            <icon class="icon" onClick={handleSaveButtonClick}>
                              <i class="fa-regular fa-floppy-disk"></i>
                            </icon>
                          )}
                        </li>
                      )}
                      <li class="iconbutton  d-flex justify-content-center text-danger">
                        {["delete", "all permission"].some((permission) => quotationPermission.includes(permission)) && (
                          <icon class="icon" onClick={handleDeleteButtonClick}>
                            <i class="fa-solid fa-trash"></i>
                          </icon>
                        )}
                      </li>
                      <li class="iconbutton  d-flex justify-content-center text-warning">
                        {["all permission", "view"].some((permission) => quotationPermission.includes(permission)) && (
                          <icon class="icon" onClick={generateReport}>
                            <i class="fa-solid fa-file-pdf"></i>
                          </icon>
                        )}
                      </li>
                      {showExcelButton && (
                        <li class="iconbutton  d-flex justify-content-center">
                          <icon class="icon" onClick={handleExcelDownload} >
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
            <div className="shadow-lg p-1 bg-body-tertiary rounded  pt-3 pb-4">
              <div className="row ms-3 me-3">
                {/* <div className=""> */}
                  <div className="col-md-4 form-group mb-2">
                    <label className={`${deleteError && !transactionNo ? "red" : ""}`}>
                      Transaction No{showAsterisk && <span className="text-danger">*</span>}
                    </label>
                    <div className="exp-form-floating">
                      <div class="d-flex justify-content-end">
                        <input
                          id="RefNo"
                          className="exp-input-field form-control justify-content-start"
                          type="text"
                          placeholder=""
                          title="Please enter the transaction no"
                          required
                          value={transactionNo}
                          onChange={(e) => setTransactionNo(e.target.value)}
                          maxLength={50}
                          onKeyPress={handleKeyPressRef}
                          autoComplete="off"
                        />
                        <div className="position-absolute mt-1 me-2">
                          <span className="icon searchIcon" title="Quotation Help" onClick={handlePurchase}>
                            <i class="fa fa-search"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 form-group mb-2 ">
                    <div class="exp-form-floating">
                      <label for="" className={`${error && !entryDate ? "red" : ""}`}>
                        Transaction Date{!showAsterisk && <span className="text-danger">*</span>}
                      </label>
                      <input
                        name="transactionDate"
                        id="entryDate"
                        className="exp-input-field form-control"
                        type="date"
                        placeholder=""
                        title="Please enter the transaction date"
                        required
                        min={financialYearStart}
                        max={financialYearEnd}
                        value={entryDate}
                        onChange={handleDateChange}
                      />
                    </div>
                  </div>
                {/* </div> */}
                </div>
                <div className="row ms-2 me-3 g-0">
                <div className="col-md-6">
                  <div className="ag-theme-alpine" style={{ height: 240, width: "100%" }}>
                    <AgGridReact
                      columnDefs={columnDefsTermsConditions}
                      rowData={rowDataTerms}
                      defaultColDef={{ editable: true, resizable: true }}
                      onGridReady={onGridReady}
                      rowHeight={28}
                      onRowClicked={handleRowClicked}
                      onColumnMoved={onColumnMoved}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="ag-theme-alpine" style={{ height: 240, width: "100%" }}>
                    <AgGridReact
                      columnDefs={columnPatch}
                      rowData={rowdatapatch}
                      defaultColDef={{ flex: 1 }}
                      rowHeight={28}
                    />
                  </div>
                </div>
                </div>
              <div className="ag-theme-alpine mt-2" style={{ height: 360, width: "100%" }}>
                <AgGridReact
                  columnDefs={columnHeader}
                  rowData={headerRowData}
                  defaultColDef={{ flex: 1 }}
                  rowHeight={28}
                />
              </div>
            </div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4" align="left">
              <div className="row ms-3 me-3">
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName">
                      Total
                    </label>
                    <input
                      id="totalPurchaseAmount"
                      class="exp-input-field form-control input"
                      type="text"
                      title="Total"
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
                    <label for="" class="exp-form-labels" className="partyName">
                      Total Tax
                    </label>
                    <input
                      name="totalTaxAmount"
                      id="totalTaxAmount"
                      text="text"
                      title="Total tax"
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
                    <label for="" class="exp-form-labels" className="partyName">
                      Round Off
                    </label>
                    <input
                      name=""
                      id="roundOff"
                      type="text"
                      className="exp-input-field form-control input"
                      placeholder=""
                      title="Round off"
                      required
                      value={round_difference}
                      onChange={(e) => setRoundDifference(e.target.value)}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName">
                      Grand Total
                    </label>
                    <input
                      name=""
                      id="totalBillAmount"
                      title="Grand total"
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
                <div className="col-md-3 form-group mb-2" style={{ justifyContent: "center" }}>
                  <label htmlFor="party_code">Product/Items Filter</label>
                  <div className="exp-form-floating">
                    <div class="d-flex justify-content-between">
                      <Select
                        id="Product"
                        value={selectedProduct}
                        onChange={handleChangeProduct}
                        options={filteredOptionProduct}
                        className="exp-input-field"
                        placeholder=""
                        required
                        title="Please select the product/items filter"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2" style={{ justifyContent: "center" }}>
                  <label htmlFor="party_code">Product/Items Name</label>
                  <div className="exp-form-floating">
                    <div class="d-flex justify-content-between">
                      <Select
                        className="exp-input-field"
                        id='itemCode'
                        required
                        placeholder=""
                        maxLength={18}
                        autoComplete='off'
                        options={dynamicOptions}
                        onChange={handleChangeDynamicOption}
                        title="Please select the product/items name"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="d-flex justify-content-between ms-2"
                style={{ marginBlock: "", marginTop: "10px" }}
              >
                <div
                  align="left"
                  class="d-flex justify-content-start"
                  style={{ marginLeft: "25px" }}
                >
                  <purButton
                    type="button"
                    title='Product / Item Details'
                    className={`"toggle-btn"  ${activeTable === "myTable" ? "active" : ""}`}
                    onClick={() => handleToggleTable("myTable")}
                  >
                    Product / Item Details
                  </purButton>
                  <purButton
                    type="button"
                    title='Tax Details'
                    className={`"toggle-btn" ${activeTable === "tax" ? "active" : ""}`}
                    onClick={() => handleToggleTable("tax")}
                  >
                    Tax Details
                  </purButton>
                </div>
                {/* <div
              align=""
              class="d-flex justify-content-end"
              style={{ marginRight: "50px" }}
            >
              <icon type="button" className="popups-btn" onClick={handleAddRow}>
                <FontAwesomeIcon icon={faPlus} />
              </icon>
              <icon
                type="button"
                className="popups-btn"
                onClick={handleRemoveRow}
              >
                <FontAwesomeIcon icon={faMinus} />
              </icon>
            </div> */}
              </div>
              <div
                className="ag-theme-alpine"
                style={{ height: 437, width: "100%" }}
              >
                <AgGridReact
                  columnDefs={activeTable === "myTable" ? columnDefs : columnDefsTax}
                  rowData={activeTable === "myTable" ? rowData : rowDataTax}
                  defaultColDef={{ editable: true, resizable: true }}
                  onCellValueChanged={async (event) => {
                    if (
                      event.colDef.field === "purchaseQty" ||
                      event.colDef.field === "purchaseAmt"
                    ) {
                      await ItemAmountCalculation(event);
                    }
                    handleCellValueChanged(event);
                  }}
                  onGridReady={onGridReady}
                  onRowClicked={handleRowClicked}
                  onColumnMoved={onColumnMoved}
                />
              </div>
            </div>
          </div>
          <div>
            <QuotationItemPopup open={open} handleClose={handleClose} handleItem={handleItem} />
            <QuotationCustomerPopup open={open2} handleClose={handleClose} handleVendor={handleVendor} />
            <QuotationPopup open={open3} handleClose={handleClose} handleQuotationData={handleQuotationData} />
          </div>
          <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
            <div className="row ms-2">
              <div className="d-flex justify-content-start">
                <p className="col-md-6">
                  {labels.createdBy}: {additionalData.created_by}
                </p>
                <p className="col-md-6">
                  {labels.createdDate}: {additionalData.created_date}
                </p>
              </div>
              <div className="d-flex justify-content-start">
                <p className="col-md-6">
                  {labels.modifiedBy}: {additionalData.modified_by}
                </p>
                <p className="col-md-6">
                  {" "}
                  {labels.modifiedDate}: {additionalData.modified_date}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-fluid Topnav-screen">
        {loading && <LoadingScreen />}
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 align="left" className="purbut me-5">
                    Deleted Quotation
                  </h1>
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
                </div>
              </div>
              <div class="mobileview">
                <div class="d-flex justify-content-between ">
                  <div className="d-flex justify-content-start">
                    <h1 align="left" className="h1">
                      Deleted Quotation
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded  pt-3 pb-4">
              <div className="row ms-3 me-3">
                <div className="col-md-3">
                  <div className="col-md-12 form-group mb-2">
                    <label>Transaction No</label>
                    <div className="exp-form-floating">
                      <div class="d-flex justify-content-end">
                        <input
                          id="TransactionNo"
                          className="exp-input-field form-control justify-content-start"
                          type="text"
                          placeholder=""
                          required
                          value={TransactionNo}
                          onChange={(e) => setTransactionno(e.target.value)}
                          maxLength={50}
                          title="Please enter the transaction no"
                          onKeyPress={handleDeleteKeyPress}
                          autoComplete="off"
                        />
                        <div className="position-absolute mt-1 me-2">
                          <span className="icon searchIcon" title="Deleted Quotation Help" onClick={handleDeletedQuotation}>
                            <i class="fa fa-search"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 form-group mb-2 ">
                    <div class="exp-form-floating">
                      <label for="">Transaction Date</label>
                      <input
                        name="TransactionDate"
                        id="TransactionDate"
                        className="exp-input-field form-control"
                        type="date"
                        readOnly
                        placeholder=""
                        title="Transaction date"
                        required
                        value={TransactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="ag-theme-alpine" style={{ height: 240, width: "100%" }}>
                    <AgGridReact
                      columnDefs={deletedTermsConditions}
                      rowData={deletedRowDataTerms}
                      defaultColDef={{ editable: true, resizable: true }}
                      onGridReady={onGridReady}
                      rowHeight={28}
                      onRowClicked={handleRowClicked}
                      onColumnMoved={onColumnMoved}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="ag-theme-alpine" style={{ height: 240, width: "100%" }}>
                  <AgGridReact
                      columnDefs={columDeletedPatch}
                      rowData={deletedrowdatapatch}
                      defaultColDef={{ flex: 1 }}
                      rowHeight={28}
                    />
                  </div>
                </div>
              </div>
              <div
                className="ag-theme-alpine mt-2"
                style={{ height: 360, width: "100%" }}
              >
                <AgGridReact
                  columnDefs={deletedColumnHeader}
                  rowData={deletedHeaderRowData}
                  defaultColDef={{ flex: 1 }}
                  rowHeight={28}
                />
              </div>
            </div>
            <div
              className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4"
              align="left"
            >
              <div className="row ms-3 me-3">
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName">
                      Total
                    </label>
                    <input
                      id="Total"
                      class="exp-input-field form-control input"
                      type="text"
                      placeholder=""
                      required
                      title="Total"
                      value={Total}
                      onChange={(e) => setTotal(e.target.value)}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName">
                      Total Tax
                    </label>
                    <input
                      name="totalTaxAmount"
                      id="Tax"
                      text="text"
                      title="Total tax"
                      className="exp-input-field form-control input"
                      placeholder=""
                      required
                      value={Tax}
                      onChange={(e) => setTax(e.target.value)}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName">
                      Round Off
                    </label>
                    <input
                      name=""
                      id="RoundOff"
                      type="text"
                      title="Round off"
                      className="exp-input-field form-control input"
                      placeholder=""
                      required
                      value={RoundOff}
                      onChange={(e) => setRoundOff(e.target.value)}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName">
                      Grand Total
                    </label>
                    <input
                      name=""
                      id="GrandTotal"
                      type="text"
                      title="Grand total"
                      className="exp-input-field form-control input"
                      placeholder=""
                      required
                      value={GrandTotal}
                      onChange={(e) => setGrandTotal(e.target.value)}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between ms-2" style={{ marginBlock: "", marginTop: "10px" }}>
                <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "25px" }}>
                  <purButton
                    type="button"
                    title='Product / Item Details'
                    className={`"toggle-btn"  ${activeTable === "myTable" ? "active" : ""}`}
                    onClick={() => handleToggleTable("myTable")}
                  >
                    Product / Item Details
                  </purButton>
                  <purButton
                    type="button"
                    title='Tax Details'
                    className={`"toggle-btn" ${activeTable === "tax" ? "active" : ""}`}
                    onClick={() => handleToggleTable("tax")}
                  >
                    Tax Details
                  </purButton>
                </div>
              </div>
              <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                <AgGridReact
                  columnDefs={activeTable === "myTable" ? deletedColumnDetail : deletedColumnTax}
                  rowData={activeTable === "myTable" ? deletedRowData : deletedRowDataTax}
                  defaultColDef={{ editable: true, resizable: true }}
                  onGridReady={onGridReady}
                  onRowClicked={handleRowClicked}
                  onColumnMoved={onColumnMoved}
                />
              </div>
            </div>
          </div>
          <div>
            <DeletedQuotaionHelp open={open4} handleClose={handleClose} handleDeletedQuotationData={handleDeletedQuotationData} />
          </div>
          <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
            <div className="row ms-2">
              <div className="d-flex justify-content-start">
                <p className="col-md-6">
                  {labels.createdBy}: {additionalData.created_by}
                </p>
                <p className="col-md-6">
                  {labels.createdDate}: {additionalData.created_date}
                </p>
              </div>
              <div className="d-flex justify-content-start">
                <p className="col-md-6">
                  {labels.modifiedBy}: {additionalData.modified_by}
                </p>
                <p className="col-md-6">
                  {labels.modifiedDate}: {additionalData.modified_date}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quotation;
