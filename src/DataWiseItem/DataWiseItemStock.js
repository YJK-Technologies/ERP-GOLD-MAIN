import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "../apps.css";
import '../App.css'
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CompanyImagePopup from '../CompanyImageHelp'
import "../AccountInformation";
import LoadingScreen from '../Loading';
import { Checkbox } from "@mui/material";

const config = require('../Apiconfig');

function Grid() {

  const currentMonth = new Date().toISOString().slice(0, 7)
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [month, setMonth] = useState(currentMonth);
  const [item, setItem] = useState(null);
  const [item_variant, setItem_variant] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemCodeDrop, setItemCodeDrop] = useState([]);
  const [itemVariantDrop, setItemVariantDrop] = useState([]);
  const [selectedItem_variant, setSelectedItem_variant] = useState("");
  const [isVariantSelected, setIsVariantSelected] = useState(false);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const companyPermissions = permissions
    .filter(permission => permission.screen_type === 'DataWiseStock')
    .map(permission => permission.permission_type.toLowerCase());

  const filteredOptionItem = itemCodeDrop.map((option) => ({
    value: option.Item_code,
    label: `${option.Item_code} - ${option.Item_name}`,
  }));

  const handleChangeItem = async (selectedItem) => {
    setSelectedItem(selectedItem);
    setItem(selectedItem ? selectedItem.value : '');
    if (selectedItem) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getitemcodeVariant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            Item_code: selectedItem.value
          }),
        });

        if (response.ok) {
          const data = await response.json();

          const defaultVariant = filteredOptionVariant.find(option => option.attributedetails_name === data.variant);
          setSelectedItem_variant(defaultVariant);
        } else {
          console.warn("No variants found for the selected item");
        }
      } catch (error) {
        console.error("Error fetching item variants:", error);
      }
    }
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/variant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((data) => data.json())
      .then((val) => setItemVariantDrop(val));
  }, []);

  // useEffect(() => {
  //     const fetchItemVariants = async () => {
  //       try {
  //         const response = await fetch(`${config.apiBaseUrl}/getitemcodeVariant`, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             company_code: sessionStorage.getItem("selectedCompanyCode"),
  //             Item_code: item
  //           }),
  //         });

  //         if (response.ok) {
  //           const data = await response.json();
  //           setItemVariantDrop(data);
  //         } else {
  //           console.warn("No variants found for the selected item");
  //           setItemVariantDrop([]);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching item variants:", error);
  //         setItemVariantDrop([]);
  //       }
  //     };
  //     fetchItemVariants();
  // }, []);


  const filteredOptionVariant = itemVariantDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));


  const handleChangeVariant = async (selectedVariant) => {
    setSelectedItem_variant(selectedVariant);
    setItem_variant(selectedVariant ? selectedVariant.value : '');
    if (selectedVariant) {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getitemcodeVariant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            Item_code: "",
            Item_variant: selectedVariant.value,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          const defaultItem = filteredOptionItem.find(option => option.Item_code === data.itemcode);
          setSelectedItem(defaultItem || null);
        }
      } catch (error) {
        console.error("Error fetching item codes:", error);
      }
    }
  };

  useEffect(() => {
    if (isVariantSelected) {
      return;
    }

    const fetchItemCode = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getItemCode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),
          }),
        });

        const data = await response.json();
        if (response.ok) {
          const updatedData = [{ Item_code: "All", Item_name: "All" }, ...data];
          setItemCodeDrop(updatedData);
        } else {
          console.warn("No data found for item codes");
          setItemCodeDrop([]); // Clear dropdown if no data found
        }
      } catch (error) {
        console.error("Error fetching item codes:", error);
      }
    };

    fetchItemCode();
  }, [isVariantSelected]); // This hook only runs if variant is not selected  

  const [selectedCompanyNo, setselectedCompanyNo] = useState(null);
  const [selectedCompanyLogo, setSelectedCompanyLogo] = useState(null);
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleCompanyNoChange = (event) => {
    setMonth(event.target.value);
  };

  const handleSearch = async () => {
    if (!month) {
      toast.warning("Month value should not be blank");
      return
    }
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDateWiseItemStock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          month,
          item_code: item,
          item_variant: item_variant,
          company_code: sessionStorage.getItem('selectedCompanyCode')
        })
      });
      if (response.ok) {
        const fetchedData = await response.json();
        const newRows = fetchedData.map((matchedItem) => ({
          transaction_date: formatDate(matchedItem.transaction_date),
          Item_code: matchedItem.Item_code,
          item_variant: matchedItem.item_variant,
          Item_name: matchedItem.Item_name,
          openingItemQty: matchedItem.openingItemQty,
          PurchaseQty: matchedItem.PurchaseQty,
          ReceivedGoodsQty: matchedItem.ReceivedGoodsQty,
          SalesReturnQty: matchedItem.SalesReturnQty,
          TotalRecQty: matchedItem.TotalRecQty,
          SalesQty: matchedItem.SalesQty,
          PurchaseReturnQty: matchedItem.PurchaseReturnQty,
          TaxInvoiceQty: matchedItem.TaxInvoiceQty,
          DCItemQty: matchedItem.DCItemQty,
          TotalIssQty: matchedItem.TotalIssQty,
          ClosingStock: matchedItem.ClosingStock,
        }));
        setRowData(newRows);
        console.log("data fetched successfully")
      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found");
        setRowData([]);
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

  const reloadGridData = () => {
    window.location.reload();
  };


  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Handle cell click and open popup
  const handleClickOpen = (params) => {
    const companyNo = params.data.company_no;
    const companyLogo = params.data.company_logo;
    setselectedCompanyNo(companyNo);
    setSelectedCompanyLogo(companyLogo);
    setOpen(true);
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleRowClick = (rowData) => {
    setCreatedBy(rowData.created_by);
    setModifiedBy(rowData.modified_by);
    const formattedCreatedDate = formatDate(rowData.created_date);
    const formattedModifiedDate = formatDate(rowData.modified_date);
    setCreatedDate(formattedCreatedDate);
    setModifiedDate(formattedModifiedDate);
  };


  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Date",
      field: "transaction_date",
    },
    {
      headerName: "Item Code",
      field: "Item_code",
    },
    {
      headerName: "item_variant",
      field: "item_variant"
    },
    {
      headerName: "Item Name",
      field: "Item_name"
    },
    {
      headerName: "Opening Item Qty",
      field: "openingItemQty",
    },
    {
      headerName: "Received",
      children: [
        {
          headerName: "Purchase Qty",
          field: "PurchaseQty",
        },
        {
          headerName: "Received Goods Qty",
          field: "ReceivedGoodsQty",
        },
        {
          headerName: "Sales Return Qty",
          field: "SalesReturnQty",
        },
        {
          headerName: "Total Received",
          field: "TotalRecQty",
        },
      ],
    },
    {
      headerName: "Issued",
      children: [
        {
          headerName: "Sales",
          field: "SalesQty",
        },
        {
          headerName: "Purchase Return",
          field: "PurchaseReturnQty",
        },
        {
          headerName: "Tax Invoice",
          field: "TaxInvoiceQty",
        },
        {
          headerName: "DC",
          field: "DCItemQty",
        },
        {
          headerName: "Total Issued",
          field: "TotalIssQty",
        },
      ],
    },
    {
      headerName: "Closing",
      field: "ClosingStock"
    },
  ];

  // const defaultColDef = {
  //   resizable: true,
  //   wrapText: true,
  //   // sortable: true,
  //   //editable: true,
  //   flex: 1,
  //   // filter: true,
  //   // floatingFilter: true,
  // };



  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return;
    }

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Stock Report</title>");
    reportWindow.document.write("<style>");
    reportWindow.document.write(`
    body {
        font-family: Arial, sans-serif;
        margin: 20px;
    }
    h1 {
        color: maroon;
        text-align: center;
        font-size: 24px;
        margin-bottom: 30px;
        text-decoration: underline;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    th, td {
        padding: 10px;
        text-align: left;
        border: 1px solid #ddd;
        vertical-align: top;
    }
    th {
        background-color: maroon;
        color: white;
        font-weight: bold;
    }
    td {
        background-color: #fdd9b5;
    }
    tr:nth-child(even) td {
        background-color: #fff0e1;
    }
    .report-button {
        display: block;
        width: 150px;
        margin: 20px auto;
        padding: 10px;
        background-color: maroon;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 16px;
        text-align: center;
        border-radius: 5px;
    }
    .report-button:hover {
        background-color: darkred;
    }
    @media print {
        .report-button {
            display: none;
        }
        body {
            margin: 0;
            padding: 0;
        }
    }
  `);
    reportWindow.document.write("</style></head><body>");
    reportWindow.document.write("<h1><u>Stock Report</u></h1>");

    // Create table headers from columnDefs
    reportWindow.document.write("<table><thead><tr>");
    columnDefs.forEach((col) => {
      if (col.children) {
        // For grouped headers
        col.children.forEach((child) => {
          reportWindow.document.write(`<th>${child.headerName}</th>`);
        });
      } else {
        reportWindow.document.write(`<th>${col.headerName}</th>`);
      }
    });
    reportWindow.document.write("</tr></thead><tbody>");

    // Populate the rows based on selectedRows
    selectedRows.forEach((row) => {
      reportWindow.document.write("<tr>");
      columnDefs.forEach((col) => {
        if (col.children) {
          col.children.forEach((child) => {
            reportWindow.document.write(`<td>${row[child.field] || ""}</td>`);
          });
        } else {
          reportWindow.document.write(`<td>${row[col.field] || ""}</td>`);
        }
      });
      reportWindow.document.write("</tr>");
    });

    reportWindow.document.write("</tbody></table>");
    reportWindow.document.write(
      '<button class="report-button" onclick="window.print()">Print</button>'
    );
    reportWindow.document.write("</body></html>");
    reportWindow.document.close();
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);

  };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.company_no === params.data.company_no
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  const handleExcelDownload = () => {
    const filteredRowData = rowData
    const rowDataSheet = XLSX.utils.json_to_sheet(filteredRowData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Date wise Data");

    XLSX.writeFile(workbook, "Date_Wise_Item_Stock_data.xlsx");
  };

  // Handler for when a row is selected
  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      handleRowClick(event.data);
    }
  };


  return (
    <div className="container-fluid Topnav-screen">
      <div>
        {loading && <LoadingScreen />}
        <ToastContainer position="top-right" className="toast-design" theme="colored" />
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
          <div className=" d-flex justify-content-between  ">
            <div class="d-flex justify-content-start">
              <h1 align="left" className="purbut"> Date Wise Item Stock
              </h1>
            </div>
            <div className="d-flex justify-content-end purbut me-3">
              {['all permission', 'view'].some(permission => companyPermissions.includes(permission)) && (
                <printbutton className="purbut btn btn-dark mt-3 mb-3 rounded-3" onClick={generateReport} required title="Generate Report">
                  <i class="fa-solid fa-print"></i>
                </printbutton>
              )}
              <printbutton className="purbut btn btn-dark mt-3 mb-3 rounded-3" title='excel' onClick={handleExcelDownload}>
                <i class="fa-solid fa-file-excel"></i>
              </printbutton>
            </div>
          </div>
          <div class="mobileview">
            <div class="d-flex justify-content-between">
              <div className="d-flex justify-content-start ms-3">
                <h1 align="left" className="h1" >Date Wise Item Stock </h1>
              </div>
              <div class="dropdown mt-1" >
                <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-solid fa-list"></i>
                </button>
                <ul class="dropdown-menu">
                  <li class="iconbutton  d-flex justify-content-center ">
                    {['all permission', 'view'].some(permission => companyPermissions.includes(permission)) && (
                      <icon
                        class="icon"
                        onClick={handleExcelDownload}
                      >
                        <i class="fa-solid fa-file-excel"></i>
                      </icon>
                    )}
                  </li>
                  <li class="iconbutton  d-flex justify-content-center ">
                    {['all permission', 'view'].some(permission => companyPermissions.includes(permission)) && (
                      <icon
                        class="icon"
                        onClick={generateReport}
                      >
                        <i class="fa-solid fa-print"></i>
                      </icon>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
        <div className="row ms-4 mb-3 me-4 mt-3">
          <div className="col-md-3 form-group">
            <div class="exp-form-floating">
              <label for="cname" class="exp-form-labels">
                Month
              </label>
              <input
                id="cno"
                className="exp-input-field form-control"
                type="month"
                placeholder=""
                required
                value={month}
                onChange={handleCompanyNoChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div className="col-md-3 form-group">
            <div class="exp-form-floating">
              <label for="state" class="exp-form-labels">
                Item Code
              </label>
              <Select
                id="status"
                value={selectedItem}
                onChange={handleChangeItem}
                options={filteredOptionItem}
                className="exp-input-field"
                placeholder=""

                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                maxLength={25}
              />
            </div>
          </div>
          <div className="col-md-3 form-group">
            <div class="exp-form-floating">
              <label for="state" class="exp-form-labels">
                Item Varient
              </label><Select
                id="ahsts"
                value={selectedItem_variant}
                onChange={handleChangeVariant}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                options={filteredOptionVariant}
                className="exp-input-field"
                placeholder=""
                maxLength={25}
              />
            </div>
          </div>
          <div className="col-md-3 form-group mt-4">
            <div class="exp-form-floating">
              <div class=" d-flex  justify-content-center">
                <div class=''>
                  <icon className=" text-dark popups-btn fs-6" onClick={handleSearch} required title="Search">
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </icon>
                </div>
                <div>
                  <icon className=" popups-btn text-dark fs-6" onClick={reloadGridData} required title="Refresh">
                    <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                  </icon>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ag-theme-alpine" style={{ height: 455, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            rowSelection="multiple"
            onSelectionChanged={onSelectionChanged}
            pagination={true}
            paginationAutoPageSize={true}
            onRowSelected={onRowSelected}
            headerHeight={25}
          />
        </div>
        <div>
          <CompanyImagePopup open={open} handleClose={handleClose} companyNo={selectedCompanyNo} companyLogo={selectedCompanyLogo} />
        </div>
      </div>
    </div>
  );
}

export default Grid;
