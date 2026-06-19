import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "ag-grid-enterprise";
import "./apps.css";
import "./input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import 'ag-grid-autocomplete-editor/dist/main.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select'
import "./mobile.css";
import './mobile.css';
import * as XLSX from 'xlsx';
import ProductItemPopup from './ProductItemPopup';
import ProductPopup from './ProductPopup';
import labels from './Labels';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { showConfirmationToast } from './ToastConfirmation';
import ProductImagePopup from './ProductImageUpdate'
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

const Product = () => {

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const returnPermission = permissions
    .filter(permission => permission.screen_type === 'Product')
    .map(permission => permission.permission_type.toLowerCase());

  const [rowData, setRowData] = useState([{
    itemCode: '', itemName: '', quantity: 0, ItemSno: 1
  }]);
  const [activeTable, setActiveTable] = useState('myTable');
  const [global, setGlobal] = useState(null)
  const [globalItem, setGlobalItem] = useState(null)
  const [returnDate, setReturnDate] = useState('');
  const [returnId, setReturnId] = useState('');
  const [statusdrop, setStatusdrop] = useState([]);
  const [error, setError] = useState("");
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTax, setselectedTax] = useState('');
  const [status, setStatus] = useState("");
  const [taxType, setTaxType] = useState(" ");
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [saltaxdrop, setsaltaxdrop] = useState([]);
  const [unitPrice, setUnitPrice] = useState("");
  const [Datastatus, setDatastatus] = useState(0);
  const [user_images, setuser_image] = useState('');
  const [selectedsaltax, setselectedsaltax] = useState('');
  const [Item_sales_Othertax_type, setItem_sales_Othertax_type] = useState('');
  const [Othersaltaxdrop, setOthersaltaxdrop] = useState('');
  const [selectedImage, setSelectedImage] = useState('default-placeholder.png');
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [additionalData, setAdditionalData] = useState({
    modified_by: "",
    created_by: "",
    modified_date: "",
    created_date: "",
  })
  const [hovered, setHovered] = useState(false);
  const [HSN, setHSNcode] = useState('');

  const handleClick = () => {
    setOpen2(true);
  };



  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    const fetchsaltaxtype = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getothersalestax`, {
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
        setOthersaltaxdrop(val);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    if (company_code) {
      fetchsaltaxtype();
    }
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    fetch(`${config.apiBaseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val));
  }, []);


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/gettaxitemsales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(setsaltaxdrop)
      .catch((error) => console.error("Error fetching warehouse:", error));
  }, []);


  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));
  const filteredOptionTax = saltaxdrop.map((option) => ({
    value: option.tax_type,
    label: option.tax_type,
  }));

  const filteredOptionOthertaxitemsales = Array.isArray(Othersaltaxdrop)
    ? Othersaltaxdrop.map((option) => ({
      value: option.Other_Sales_tax_type,
      label: option.Other_Sales_tax_type,  // Concatenate ApprovedBy and EmployeeId with ' - '
    }))
    : [];

  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : '');
    setError(false);
  };
  const handleChangeTax = (selectedsaltax) => {
    setselectedTax(selectedsaltax);
    setTaxType(selectedsaltax ? selectedsaltax.value : '');
    setError(false);
  };

  const handleChangesaltax = (selectedsaltax) => {
    setselectedsaltax(selectedsaltax);
    setItem_sales_Othertax_type(selectedsaltax ? selectedsaltax.value : '');
    setError(false);
  };


  const handleToggleTable = (table) => {
    setActiveTable(table);
  };


  const handleDelete = (params) => {
    const ItemSno = params.data.ItemSno;

    const updatedRowData = rowData.filter(row => row.ItemSno !== ItemSno);

    setRowData(updatedRowData);

    if (updatedRowData.length === 0) {
      const newRow = {
        ItemSno: 1,
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
        ItemSno: index + 1
      }));
      setRowData(updatedRowDataWithNewSerials);
    }
  };


  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex, newValue } = params;
    const lastRowIndex = rowData.length - 1;

    // Check if the change occurred in the purchaseQty field
    if (colDef.field === 'quantity') {
      const quantity = parseFloat(newValue);

      // Check if the entered quantity is positive and the row is the last one
      if (quantity > 0 && rowIndex === lastRowIndex) {
        const ItemSno = rowData.length + 1;
        const newRowData = {
          ItemSno,
          itemCode: '',
          itemName: '',
          quantity: 0,
          TotalTaxAmount: '',
          TotalItemAmount: '',
          description: '',
        };

        setRowData(prevRowData => [...prevRowData, newRowData]);
      }
    }
  };

  //ITEM CODE TO SEARCH IN AG GRID
  const handleItemCode = async (params) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getitemcodepurdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Item_code: params.data.itemCode, company_code: sessionStorage.getItem("selectedCompanyCode") })
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
              };
            }
          }
          return row;
        });
        setRowData(updatedRow);
        console.log(updatedRow);
      } else if (response.status === 404) {
        toast.warning("Data Not Found")

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
    }
  };

  //Item Popup
  const handleClickOpen = (params) => {
    const GlobalSerialNumber = params.data.ItemSno
    setGlobal(GlobalSerialNumber)
    const GlobalItem = params.data.itemCode
    setGlobalItem(GlobalItem)
    setOpen(true);
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

  function qtyValueSetter(params) {

    if (!params.data.itemCode || params.data.itemCode.trim() === "") {
      toast.warning("Please select a itemCode before entering the quantity.");
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

    params.data.quantity = newValue;
    return true;
  }


  const columnDefs = [
    {
      headerName: 'S.No',
      field: 'ItemSno',
      minWidth: 80,
      sortable: false
    },
    {
      headerName: '',
      field: 'delete',
      editable: false,
      maxWidth: 50,
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
      // minWidth: 300,
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
      filter: true,
      // minWidth: 480,
      cellEditorParams: {
        maxLength: 40,
      },
      sortable: false
    },
    {
      headerName: '',
      field: 'Search',
      editable: true,
      maxWidth: 50,
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
      headerName: 'Qty',
      field: 'quantity',
      editable: true,
      filter: true,
      // minWidth: 130,
      valueSetter: qtyValueSetter,
      sortable: false,
    },
    // {
    //   headerName: 'Tax Amount',
    //   field: 'TotalTaxAmount',
    //   editable: true,
    //   minWidth: 165,
    //   maxWidth: 165,
    //   filter: true,
    //   sortable: false
    // },

    // {
    //   headerName: 'Total Amount',
    //   field: 'TotalItemAmount',
    //   editable: true,
    //   filter: true,
    //   maxWidth: 165,
    //   sortable: false,
    // },
    // {
    //   headerName: 'Description',
    //   field: 'description',
    //   editable: true,
    //   filter: true,
    //   maxWidth: 300,
    //   minWidth: 300,
    //   sortable: false,
    // },
  ];

  const handleItem = async (selectedData) => {
    console.log("Selected Data:", selectedData);
    let updatedRowDataCopy = [...rowData];
    let highestSerialNumber = updatedRowDataCopy.reduce((max, row) => Math.max(max, row.ItemSno), 0);

    selectedData.map(item => {
      const existingItemWithSameCode = updatedRowDataCopy.find(row => row.ItemSno === global && row.itemCode === globalItem);

      if (existingItemWithSameCode) {
        console.log("if", existingItemWithSameCode);
        existingItemWithSameCode.itemCode = item.itemCode;
        existingItemWithSameCode.itemName = item.itemName;
        existingItemWithSameCode.unitWeight = item.unitWeight;
        existingItemWithSameCode.TaxType = item.taxType;
        existingItemWithSameCode.TaxName = item.taxDetails;
        existingItemWithSameCode.TaxPercentage = item.taxPer;
        return true;
      }
      else {
        console.log("else");
        highestSerialNumber += 1;
        const newRow = {
          ItemSno: highestSerialNumber,
          itemCode: item.itemCode,
          itemName: item.itemName,
          unitWeight: item.unitWeight,
          TaxType: item.taxType,
          TaxName: item.taxDetails,
          TaxPercentage: item.taxPer
        };
        updatedRowDataCopy.push(newRow); // Push the new row to the updatedRowDataCopy
        return true;
      }
    });

    setRowData(updatedRowDataCopy);
    return true;
  };

  const handleSaveButtonClick = async () => {
    if (!productCode || !taxType || !unitPrice) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (rowData.length === 0) {
      toast.warning("No Product Details found to save.");
      return;
    }

    const filteredRowData = rowData.filter((row) => {
      return row.itemCode && row.itemCode.trim() !== '' && row.quantity > 0;
    });

    if (filteredRowData.length === 0) {
      toast.warning("Please check Item Code and Quantity");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("company_code", sessionStorage.getItem('selectedCompanyCode'));
      formData.append("Product_Code", productCode);
      formData.append("Product_name", productName);
      formData.append("status", status);
      formData.append("description", description);
      formData.append("Product_price", unitPrice);
      formData.append("tax_type", taxType);
      formData.append("Other_sales_taxtype", Item_sales_Othertax_type);
      formData.append("HSN_code", HSN);
      formData.append("created_by", sessionStorage.getItem('selectedUserCode'));

      if (user_images) {
        formData.append("Product_img", user_images); // Appending the image file
      }
      const response = await fetch(`${config.apiBaseUrl}/addProductHeader`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ Datastatus }] = searchData;
        setDatastatus(Datastatus);
        await productDetails(Datastatus);

        toast.success("Data Inserted Successfully");

        console.log("Product Data inserted successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert Purchase data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
    finally {
      setLoading(false);
    }
  };

  const productDetails = async (Datastatus) => {

    try {
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName && row.quantity > 0
      );

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          created_by: sessionStorage.getItem('selectedUserCode'),
          datastatus: Datastatus, // Ensure it's here
          item_code: row.itemCode,
          item_name: row.itemName,
          quantity: row.quantity,
          Product_name: productName,
          Product_Code: productCode,
          status: status,
          Item_SNo: row.ItemSno
        };

        const response = await fetch(`${config.apiBaseUrl}/addProductDetail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Product Detail Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to insert data");
          console.error(errorResponse.details || errorResponse.message);
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };


  const handleDeleteButtonClick = async () => {
    if (!productCode) {
      setError(" ");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to delete the data ?",
      async () => {
        try {
          const detailResult = await ProductDetailDelete();
          const headerResult = await ProductHeaderDelete();


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
          toast.warning(error.message || "An Error occured while Deleting Data");
        }
      },
      () => {
        toast.info("Data deleted cancelled.");
      }
    );
  };

  const ProductHeaderDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/productdeletehdrData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Product_Code: productCode, company_code: sessionStorage.getItem('selectedCompanyCode') }),
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

  const ProductDetailDelete = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/productDeleteDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Product_Code: productCode, company_code: sessionStorage.getItem('selectedCompanyCode') })
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

  const handleReload = () => {
    window.location.reload();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleProductCode(productCode)
    }
  };

  const handleProductCode = async (code) => {
    try {
      const companyCode = sessionStorage.getItem('selectedCompanyCode');

      const response = await fetch(`${config.apiBaseUrl}/ProductData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction_no: code, company_code: companyCode }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.warning("Data Not Found");
        } else {
          console.error("Error: Bad request or server issue");
        }
        resetFormData();
        return;
      }

      const searchData = await response.json();
      console.log("Fetched Data:", searchData);

      if (searchData?.Header?.length > 0) {
        const item = searchData.Header[0];

        setProductCode(item?.Product_Code || "");
        setProductName(item?.Product_name || "");
        setDescription(item?.description || "");
        setHSNcode(item?.HSN_code || "");
        setUnitPrice(item?.Product_price || "");

        if (item?.Product_img?.data) {
          const imageBlob = new Blob([new Uint8Array(item.Product_img.data)], { type: "image/jpeg" });
          const imageUrl = URL.createObjectURL(imageBlob);

          if (selectedImage) {
            URL.revokeObjectURL(selectedImage);
          }

          setuser_image(imageBlob);
          setSelectedImage(imageUrl);
        } else {
          console.warn("No product image found");
          setuser_image(null);
          setSelectedImage(null);
        }

        const selectedStatus = filteredOptionStatus.find((option) => option.value === item.status) || null;
        setSelectedStatus(selectedStatus);
        setStatus(selectedStatus?.value || "");

        const selectedSaltax = filteredOptionOthertaxitemsales.find((option) => option.value === item.Other_sales_taxtype) || null;
        setselectedsaltax(selectedSaltax);
        setItem_sales_Othertax_type(selectedSaltax?.value || "");

        const selectedTax = filteredOptionTax.find((option) => option.value === item.tax_type) || null;
        setselectedTax(selectedTax);
        setTaxType(selectedTax?.value || "");
      } else {
        console.log("Header Data is empty or not found");
        resetFormData();
      }

      if (searchData?.Detail?.length > 0) {
        const updatedRowData = searchData.Detail.map((item, index) => ({
          ItemSno: index + 1,
          itemCode: item?.item_Code || "",
          itemName: item?.item_name || "",
          quantity: item?.quantity || 0,
        }));

        setRowData(updatedRowData);
      } else {
        console.log("Detail Data is empty or not found");
        setRowData([{ ItemSno: 1, itemCode: "", itemName: "" }]);
      }

      // Show relevant buttons
      setUpdateButtonVisible(true);
      setSaveButtonVisible(false);
      setShowExcelButton(true);

      console.log("Data fetched successfully");
    } catch (error) {
      console.error("Error fetching product data:", error);
      toast.error("An error occurred while fetching data.");
    }
  };

  // Function to Reset Form Data
  const resetFormData = () => {
    setProductCode("");
    setProductName("");
    setDescription("");
    setTaxType("");
    setHSNcode("");
    setUnitPrice("");
    setuser_image(null);
    setSelectedImage(null);
    setSelectedStatus(null);
    setStatus("");
    setselectedsaltax(null);
    setItem_sales_Othertax_type("");
    setselectedTax(null);
    setTaxType("");
    setRowData([{ ItemSno: 1, itemCode: "", itemName: "" }]);
  };




  const PrintHeaderData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/ProductPrintHDR`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: productCode })
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
      const response = await fetch(`${config.apiBaseUrl}/ProductPrintDet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: productCode })
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

  const handleProduct = () => {
    setShowExcelButton(true)
    setOpen1(true);
  };

  const ProductData = async (data) => {
    setUpdateButtonVisible(true);
    setSaveButtonVisible(false)

    console.log(data)

    if (data && data.length > 0) {
      const [{ productCode, productName, status, headerDescription, HSNcode, ProductPrice, TaxType, Other_sales_taxtype }] = data;


      setSelectedImage(`data:image/jpeg;base64,${data[0].Product_img}`);


      console.log(TaxType)
      const productcode = document.getElementById('productCode');
      if (productcode) {
        productcode.value = productCode;
        setProductCode(productCode);
      } else {
        console.error('productCode element not found');
      }

      const productname = document.getElementById('productName');
      if (productname) {
        productname.value = productName;
        setProductName(productName);
      } else {
        console.error('productName element not found');
      }

      const HSN = document.getElementById('HSN');
      if (HSN) {
        HSN.value = HSNcode;
        setHSNcode(HSNcode);
      } else {
        console.error('HSN element not found');
      }

      const Productprice = document.getElementById('Productprice');
      if (Productprice) {
        Productprice.value = ProductPrice;
        setUnitPrice(ProductPrice);
      } else {
        console.error('HSN element not found');
      }

      const headerdescription = document.getElementById('description');
      if (headerdescription) {
        headerdescription.value = headerDescription;
        setDescription(headerDescription);
      } else {
        console.error('description element not found');
      }

      const Status = document.getElementById('status');
      if (Status) {
        const selectedStatus = filteredOptionStatus.find(option => option.value === status);
        setSelectedStatus(selectedStatus);
        setStatus(selectedStatus.value)
      } else {
        console.error('Tax Type  not found');
      }

      const other = document.getElementById('OthertaxType');
      if (other) {
        const selectedtax = filteredOptionOthertaxitemsales.find(option => option.value === Other_sales_taxtype);
        setselectedsaltax(selectedtax);
        setItem_sales_Othertax_type(selectedtax.value)
      } else {
        console.error('Tax Type  not found');
      }

      const taxType = document.getElementById('taxType');
      if (taxType) {
        const selectedTax = filteredOptionTax.find(option => option.value === TaxType);
        console.log(filteredOptionTax)
        setselectedTax(selectedTax);
        // setTaxType(selectedTax.value)
      } else {
        console.error('Tax Type  not found');
      }

      await ProductDetail(productCode);

    } else {
      console.log("Data not fetched...!");
    }
  };

  const ProductDetail = async (productCode) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/ProductDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: productCode, company_code: sessionStorage.getItem('selectedCompanyCode') })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];
        console.log(searchData)
        searchData.forEach((item, index) => {
          const { item_Code, item_name, quantity, Tax, Tot_amt, description, tax_name_details, tax_percentage, tax_type } = item;
          newRowData.push({
            ItemSno: index + 1,
            itemCode: item_Code,
            itemName: item_name,
            quantity: quantity,
            TotalTaxAmount: Tax,
            TotalItemAmount: Tot_amt,
            description: description,
            TaxName: tax_name_details,
            TaxPercentage: tax_percentage,
            TaxType: tax_type
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


  const handleUpdateButtonClick = async () => {
    if (!productCode || !taxType || !unitPrice) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (rowData.length === 0) {
      toast.warning("No Product Details found to save.");
      return;
    }

    const filteredRowData = rowData.filter((row) => row.quantity > 0);
    if (filteredRowData.length === 0) {
      toast.warning("Please check Quantity");
      return;
    }

    try {

      const headerResult = await updateHeader();
      const detailResult = await updateDetails();

      if (headerResult && detailResult) {
        console.log("All API calls completed successfully");
        setShowExcelButton(true);
        toast.success("Product  Data updated  Successfully")
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const updateHeader = async () => {

    try {
      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        Product_Code: productCode,
        Product_name: productName,
        description: description,
        status: status,
        Product_price: unitPrice,
        tax_type: taxType,
        modified_by: sessionStorage.getItem('selectedUserCode'),
      };

      const response = await fetch(`${config.apiBaseUrl}/UpdateProducthdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        return true;

      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };
  const updateDetails = async () => {
    try {
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName && row.quantity > 0
      );

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          Product_Code: productCode,
          Product_name: productName,
          item_code: row.itemCode,
          item_name: row.itemName,
          quantity: Number(row.quantity),
          status: status,
          Item_SNo: row.ItemSno,
          modified_by: sessionStorage.getItem('selectedUserCode'),
        };

        const response = await fetch(`${config.apiBaseUrl}/UpdateProductdetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error(errorResponse.message); // Log error message
          toast.error(`Failed to update item: ${row.itemName} (${errorResponse.message})`);
          throw new Error(`Error updating row: ${row.itemName}`);
        }
      }

      // If all API calls succeed
      return true;
    } catch (error) {
      console.error("Error updating product details:", error);
      toast.error(`Error updating product details: ${error.message}`);
      return false;
    }
  };



  const transformRowData = (data) => {
    return data.map(row => ({
      "S.No": row.ItemSno,
      "Item Code": row.itemCode.toString(),
      "Item Name": row.itemName.toString(),
      "Quantity": row.quantity.toString(),

    }));
  };


  const handleExcelDownload = () => {

    const filteredRowData = rowData.filter(row => row.quantity > 0);
    console.log(selectedStatus)
    console.log(productCode)
    console.log(productName)
    console.log(description)
    if (rowData.length === 0 || !productCode || !productName || !description || !selectedStatus || !HSN || !unitPrice) {
      toast.warning('There is no data to export.');
      return;
    }

    const headerData = [{
      "company code": sessionStorage.getItem('selectedCompanyCode'),
      "Product Code": productCode,
      "Product Name": productName,
      "Description": description,
      "Status": selectedStatus.value,
      "Tax type": selectedTax.value,
      "HSN Code": HSN,
      "Product Price": unitPrice,
    }];

    const transformedData = transformRowData(filteredRowData);
    const rowDataSheet = XLSX.utils.json_to_sheet(transformedData);
    const headerSheet = XLSX.utils.json_to_sheet(headerData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Product_Header");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Product_Details");

    XLSX.writeFile(workbook, "Product.xlsx");
  };


  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    // Regular expression: up to 12 digits before the decimal, optional decimal, up to 2 digits after the decimal
    const regex = /^\d{0,12}(\.\d{0,2})?$/;

    if (regex.test(inputValue) || inputValue === "") {
      setHSNcode(inputValue); // Update state if valid
    }
  };

  const handleAddRow = () => {
    const ItemSno = rowData.length + 1;
    const newRow = { ItemSno, itemCode: '', itemName: '', quantity: 0 };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([{ ItemSno: 1, itemCode: '', itemName: '', quantity: 0 }]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };

  const handleFileSelect1 = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.warning('File size exceeds 1MB. Please upload a smaller file.');
        event.target.value = null;
        return;
      }
      if (file) {
        setSelectedImage(URL.createObjectURL(file));
        setuser_image(file);
      }
    }
  };

  return (
    <div className='container-fluid Topnav-screen'>
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div>
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
          <div class="d-flex justify-content-between">
            <h1 align="left" className='purbut'>Product</h1>
            <div class="purbut">
              <div class="d-flex justify-content-end me-5 mt-3">
                <div>
                  {saveButtonVisible && ['add', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                    <savebutton class="px-4 mt-2 mb-1" title='save' onClick={handleSaveButtonClick}>
                      <i class="fa-regular fa-floppy-disk"></i>
                    </savebutton>
                  )}
                </div>
                {/* <div>
                {updateButtonVisible &&['update', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                <savebutton className="purbut" title='update' onClick={handleUpdateButtonClick} >
                  <i class="fa-solid fa-floppy-disk"></i>
                </savebutton>
              )}
                </div> */}
                <div>
                  {['delete', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                    <delbutton class="px-4 mt-2 mb-1" onClick={handleDeleteButtonClick} title='delete' >
                      <i class="fa-solid fa-trash"></i>
                    </delbutton>
                  )}
                </div>
                {/* <div >
                  {['all permission', 'view'].some(permission => returnPermission.includes(permission)) && (
                    <printbutton class="px-4 mt-2 mb-1" title="print" onClick={generateReport}>
                      <i class="fa-solid fa-file-pdf"></i></printbutton>
                  )}
                </div> */}
                <div>
                  <icon className={`icon px-4 ${showExcelButton ? '' : 'hidden'}`} title='excel' onClick={handleExcelDownload} style={{ display: showExcelButton ? 'block' : 'none' }}>
                    <i className="fa-solid fa-file-excel"></i>
                  </icon>
                </div>
                <div>
                  <icon className="icon px-4" onClick={handleReload} title="Reload" style={{ cursor: "pointer" }}>
                    <i className="fa-solid fa-arrow-rotate-right"></i>
                  </icon>
                </div>
              </div>
            </div>
          </div>
          <div class="mobileview">
            <div className='d-flex justify-content-between  ms-4'>
              <div className='d-flex justify-content-start'>
                <h1 align="left" className='h1'>Product</h1>
              </div>
              <div className='d-flex justify-content-end'>
                <div class="dropdown mt-1">
                  <button class="btn btn-primary dropdown-toggle p-1 fs-6" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-list"></i>
                  </button>
                  <ul class="dropdown-menu menu" >
                    <li class="iconbutton  d-flex justify-content-center text-success " style={{ padding: "8px" }}>
                      {saveButtonVisible && ['add', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                        <icon class="icon" onClick={handleSaveButtonClick}>
                          <i class="fa-regular fa-floppy-disk"></i>
                        </icon>
                      )}
                    </li>
                    {/* <li class="iconbutton d-flex justify-content-center text-success">
                {['update', 'all permission'].some(permission => returnPermission.includes(permission)) && (
              <icon title='update' onClick={handleUpdateButtonClick} >
                  <i class="fa-solid fa-floppy-disk"></i>
                  </icon>
              )}
               </li> */}
                    <li class="iconbutton  d-flex justify-content-center text-danger ms-1" style={{ padding: "8px" }}>
                      {['delete', 'all permission'].some(permission => returnPermission.includes(permission)) && (
                        <icon class="icon" onClick={handleDeleteButtonClick}>
                          <i class="fa-solid fa-trash"></i>
                        </icon>
                      )}
                    </li>
                    {/* <li class="iconbutton  d-flex justify-content-center ">
                      {['all permission', 'view'].some(permission => returnPermission.includes(permission)) && (
                        <icon class="icon" onClick={generateReport}>
                          <i class="fa-solid fa-print"></i>
                        </icon>
                      )}
                    </li> */}
                    <li class="iconbutton  d-flex justify-content-center  mb-0 " style={{ padding: "8px" }}>
                      <icon class=" icon" onClick={handleExcelDownload} style={{ display: showExcelButton ? 'block' : 'none' }}><i class="fa-solid fa-file-excel"></i></icon>
                    </li>
                    <li class="iconbutton  d-flex justify-content-center mt-0 pt-0" style={{ padding: "8px" }}>
                      <icon class="icon" onClick={handleReload} ><i className="fa-solid fa-arrow-rotate-right"></i></icon>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
            </div>
          </div>
        </div>
      </div>
      <div >
        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 pb-4 mt-2">
          <div className="row ms-4 mt-3 me-4">
            <div className="col-md-3 form-group mb-2">
              <label htmlFor="party_code" className={`${error && !productCode ? 'red' : ''}`}>Product Code <span className="text-danger">*</span></label>
              <div className="exp-form-floating">
                <div class="d-flex justify-content-end">
                  <input
                    id="productCode"
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={50}
                    autoComplete='off'
                  />
                  <div className='position-absolute mt-1 me-2'>
                    <icon className="icon searchIcon" onClick={handleProduct}><i class="fa fa-search"></i></icon>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <label htmlFor="party_code">Product Name</label>
              <div className="exp-form-floating">
                <div class="d-flex justify-content-between">
                  <input
                    id="productName"
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    maxLength={50}
                    autoComplete='off'
                  />
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <label htmlFor="party_code">HSN code</label>
              <div className="exp-form-floating">
                <div className="d-flex justify-content-between">
                  <input
                    id="HSN"
                    className="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required
                    value={HSN}
                    onChange={handleInputChange}
                    maxLength={4} 
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <div class="exp-form-floating">
                <div class="d-flex justify-content-start">
                  <div>
                    <label for="state" className={`${error && !unitPrice ? 'red' : ''}`}>Unit Price<span className="text-danger">*</span> </label>
                  </div>
                </div>
                <input
                  id="Productprice"
                  className="exp-input-field form-control"
                  type="text" 
                  placeholder=""
                  required
                  title="Please enter the sales price"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  onInput={(e) => {
                    e.target.value = e.target.value
                      .replace(/[^0-9.]/g, '')
                      .replace(/(\..*?)\..*/g, '$1') 
                      .slice(0, 12);
                  }}
                  maxLength={12}
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <div class="exp-form-floating">
                <div class="d-flex justify-content-start">
                  <div>
                    <label for="state" className={`${error && !taxType ? 'red' : ''}`}> Local Tax Type<span className="text-danger">*</span> </label>
                  </div>
                  <div>
                  </div>
                </div>
                <div title="Select the Local Tax Type">
                  <Select
                    id="taxType"
                    value={selectedTax}
                    onChange={handleChangeTax}
                    options={filteredOptionTax}
                    className="exp-input-field"
                    placeholder=""
                    maxLength={50}

                  />
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <div class="exp-form-floating">
                <div class="d-flex justify-content-start">
                  <div>
                    <label for="state" className={`${error && !taxType ? 'red' : ''}`}> Other Tax Type<span className="text-danger">*</span> </label>
                  </div>
                  <div>
                  </div>
                </div>
                <div title="Select the Other Tax Type">
                  <Select
                    id="OthertaxType"
                    value={selectedsaltax}
                    onChange={handleChangesaltax}
                    options={filteredOptionOthertaxitemsales}
                    className="exp-input-field"
                    placeholder=""
                    maxLength={50}

                  />
                </div>
              </div>
            </div>
            <div className="col-md-3 form-group mb-2" >
              <div class="exp-form-floating" >
                <label for=""> Description</label>
                <input
                  id="description"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required
                  value={description}
                  maxLength={100}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
              <label for="" >Status</label>
              <div class="exp-form-floating">
                <div title="Select the Status">

                  <Select
                    id="status"
                    value={selectedStatus}
                    onChange={handleChangeStatus}
                    options={filteredOptionStatus}
                    className="exp-input-field"
                    placeholder=""
                    required
                    maxLength={10}
                    data-tip="Please select a payment type"
                  />
                </div>
              </div>
            </div>
            <div className="col-md-2 form-group ">
              <div className="exp-form-floating">
                <div className="d-flex justify-content-start">
                  <div>
                    <label htmlFor="state" className="exp-form-labels">Photo</label>
                  </div>
                </div>
                <div className='input-group mb-5'>
                  <input
                    type="file"
                    className="exp-input-field form-control position-relative"
                    accept="image/*"
                    onChange={handleFileSelect1}
                  />
                  <div className='purbut'>
                    <div className="col-md-12 form-group  ms-4 d-flex justify-content-start position-absolute" >
                      <div className="exp-form-floating">
                        <div className="image-frame" style={{
                          width: "100px",
                          height: "100px",
                          border: "2px solid #ccc",
                          padding: "10px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <img
                            src={selectedImage || 'default-placeholder.png'}
                            alt="Preview"
                            style={{
                              height: "120%",
                              width: "120%",
                              objectFit: "fill"
                            }}
                            onClick={handleClick}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='mobileview mobile-only'>
                    <div className=" col-12 form-group mt-3 d-flex justify-content-start" >
                      <div className="exp-form-floating">
                        <div className="image-frame" style={{
                          width: "150px",
                          height: "150px",
                          border: "2px solid #ccc",
                          padding: "10px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <img
                            src={selectedImage || 'default-placeholder.png'}
                            alt="Preview"
                            style={{
                              height: "120%",
                              width: "120%",
                              objectFit: "fill"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between ms-2" style={{ marginBlock: "", marginTop: "20px" }} >
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
          <div className="ag-theme-alpine " style={{ height: 430, width: "100%" }} >
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={{ editable: true, resizable: true }}
              onCellValueChanged={async (event) => {
                handleCellValueChanged(event);
              }}
            />
          </div>
          <div>
          </div>
        </div>
        <ProductItemPopup open={open} handleClose={handleClose} handleItem={handleItem} />
        <ProductPopup open={open1} handleClose={handleClose} ProductData={ProductData} />
        <ProductImagePopup open={open2} handleClose={handleClose} productCode={productCode} ProductImage={user_images} />
      </div>
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6">{labels.createdBy}: {additionalData.created_by}</p>
            <p className="col-md-">
              {labels.createdDate}: {additionalData.created_date}
            </p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6">
              {labels.modifiedBy}: {additionalData.modified_by}{""}
            </p>
            <p className="col-md-6">
              {labels.modifiedDate}: {additionalData.modified_date}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Product;   