import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import './App.css';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./test.css";
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

function Grid() {
    const [rowData, setRowData] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [editedData, setEditedData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemCodeDrop, setItemCodeDrop] = useState([]);
    const [item, setItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const companyName = sessionStorage.getItem('selectedCompanyName');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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

                    setSelectedItem({
                        value: "All",
                        label: "All - All",
                    });
                    setItem("All");
                } else {
                    console.warn("No data found");
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

    const handleChangeItem = (selectedItem) => {
        setSelectedItem(selectedItem);
        setItem(selectedItem ? selectedItem.value : '');
    };

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
    };

    const columnDefs = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            headerName: "Transaction Date",
            field: "transaction_date",
            editable: true,
        },
        {
            headerName: "Item Code",
            field: "Item_code",
            editable: true,
        },
        {
            headerName: "Item Name",
            field: "Item_name",
            editable: true,
        },
        {
            headerName: "Qty",
            field: "bill_qty",
            editable: true,
        },
    ];

    const defaultColDef = {
        resizable: true,
        wrapText: true,
        flex: 1,
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    const generateReport = () => {
        const selectedRows = gridApi.getSelectedRows();
        if (selectedRows.length === 0) {
            alert("Please select at least one row to generate a report");
            return;
        }

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            if (isNaN(date)) return dateString;
            return date.toLocaleDateString("en-GB");
        };

        const reportData = selectedRows.map((row) => {
            return {
                "Transaction Date": formatDate(row.transaction_date),
                "Item Code": row.Item_code,
                "Item Name": row.Item_name,
                "Qty": row.bill_qty
            };
        });

        const reportWindow = window.open("", "_blank");
        reportWindow.document.write("<html><head><title>Opening Item</title>");
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
        reportWindow.document.write("<h1><u>Opening Item</u></h1>");

        reportWindow.document.write("<table><thead><tr>");
        Object.keys(reportData[0]).forEach((key) => {
            reportWindow.document.write(`<th>${key}</th>`);
        });
        reportWindow.document.write("</tr></thead><tbody>");

        reportData.forEach((row) => {
            reportWindow.document.write("<tr>");
            Object.values(row).forEach((value) => {
                reportWindow.document.write(`<td>${value}</td>`);
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

    useEffect(() => {
        if (item) {
            fetchGstReport();
        }
    }, []);

    const fetchGstReport = async () => {
        setLoading(true);
        try {
            const body = {
                Item_code: item,
                company_code: sessionStorage.getItem("selectedCompanyCode"),
            };

            const response = await fetch(`${config.apiBaseUrl}/getOpeningItemPeriod`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const fetchedData = await response.json();
                const newRows = fetchedData.map((matchedItem) => ({
                    transaction_date: formatDate(matchedItem.transaction_date),
                    Item_code: matchedItem.Item_code,
                    Item_name: matchedItem.Item_name,
                    bill_qty: matchedItem.bill_qty,
                }));
                setRowData(newRows);
            } else if (response.status === 404) {
                console.log("Data Not found");
                toast.warning("Data Not found");
                setRowData([])
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

    const transformRowData = (data) => {
        return data.map(row => ({
            "Transaction Date": row.transaction_date,
            "Item Code": row.Item_code,
            "Item Name": row.Item_name.toString(),
            "Qty": row.bill_qty.toString(),
        }));
    };

    const handleExportToExcel = () => {
        if (rowData.length === 0) {
            toast.warning('There is no data to export.');
            return;
        }

        const headerData = [
            ['Opening Item Analysis'],
            [`Company Name: ${companyName}`],
            []
        ];

        const transformedData = transformRowData(rowData);

        const worksheet = XLSX.utils.aoa_to_sheet(headerData);

        XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Opening Item');
        XLSX.writeFile(workbook, 'Opening_Item_Analysis.xlsx');
    };

    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            <div>
                <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
                    <div className="d-flex justify-content-between">
                        <h1 className='purbut mt-3'>Opening Item Analysis</h1>
                        <div className="mobileview">
                            <div className="d-flex justify-content-between">
                                <div className="d-flex justify-content-start">
                                    <h1 className='h1'>Opening Item Analysis</h1>
                                </div>
                                <div className="d-flex justify-content-end mt-1 ms-5">
                                    <div className="dropdown">
                                        <button className="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fa-solid fa-list"></i>
                                        </button>
                                        <ul className="dropdown-menu ">
                                            <li>
                                                <icon class="iconbutton d-flex justify-content-center" onClick={generateReport}>
                                                    <i className="fa-solid fa-print"></i>
                                                </icon>
                                            </li>
                                            <li>
                                                <icon class="iconbutton d-flex justify-content-center" onClick={handleExportToExcel}>
                                                    <i class="fa-solid fa-file-excel"></i>
                                                </icon>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="purbut">
                            <div className="d-flex justify-content-end me-5">
                                <button className="btn btn-dark mt-3 mb-3 rounded-3" onClick={generateReport}>
                                    <i className="fa-solid fa-print"></i>
                                </button>
                                <button class="btn btn-dark mt-3 mb-3 rounded-3" onClick={handleExportToExcel}>
                                    <i class="fa-solid fa-file-excel"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
                <div className="row ms-4 mb-3 me-4 mt-3">
                    <div className="col-md-3 mb-2 form-group">
                        <div class="exp-form-floating">
                            <label for="city" class="exp-form-labels">Item Code</label>
                            <div title="Please Enter the Item Code">
                                <Select
                                    id="status"
                                    value={selectedItem}
                                    onChange={handleChangeItem}
                                    options={filteredOptionItem}
                                    className="exp-input-field"
                                    placeholder=""
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-1 mb-2">
                        <div class="exp-form-floating">
                            <div class=" d-flex justify-content-center mt-4">
                                <icon className="popups-btn fs-6 p-3" onClick={fetchGstReport} required title="Search">
                                    <i className="fas fa-search"></i>
                                </icon>
                            </div>
                        </div>
                    </div>
                    <div class="ag-theme-alpine" style={{ height: 455, width: "100%" }}>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            onGridReady={onGridReady}
                            onCellValueChanged={onCellValueChanged}
                            onSelectionChanged={onSelectionChanged}
                            pagination={true}
                            rowSelection="multiple"
                            paginationAutoPageSize={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Grid;
