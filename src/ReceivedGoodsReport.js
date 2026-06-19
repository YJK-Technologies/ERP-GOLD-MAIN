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
import "./test.css"
import LoadingScreen from './Loading';
const config = require('./Apiconfig');


function ReceivedGoodsRt() {
    const [rowData, setRowData] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [editedData, setEditedData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemCodeDrop, setItemCodeDrop] = useState([]);
    const [item, setItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [financialYearStart, setFinancialYearStart] = useState('');
    const [financialYearEnd, setFinancialYearEnd] = useState('');
    const [transaction_date, settransaction_date] = useState("");
    const [transaction_dateTO, settransaction_date_TO] = useState("");
    const [itemname, setitemname] = useState("")
    const [transactionNo, setTransactionNo] = useState('');
    const [selectedPendingStatus, setSelectedPendingStatus] = useState(null);
    const [pendingStatus, setPendingStatus] = useState('');
    const [pendingStatusDrop, setPendingStatusDrop] = useState([]);
    const companyName = sessionStorage.getItem('selectedCompanyName');
    const [loading, setLoading] = useState(false);

    const handleChangeStatus = (selected) => {
        setSelectedPendingStatus(selected);
        setPendingStatus(selected ? selected.value : '');
    };

    const filteredOptionStatus = pendingStatusDrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getPendingStatus`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode"),

            }),
        })

            .then((response) => response.json())
            .then((data) => {
                setPendingStatusDrop(data);
                const defaultInvoice = data.find((item) => item.attributedetails_name === "Yes") || data[0];
                if (defaultInvoice) {
                    setSelectedPendingStatus({
                        value: defaultInvoice.attributedetails_name,
                        label: defaultInvoice.attributedetails_name,
                    });
                    setPendingStatus(defaultInvoice.attributedetails_name);
                }
            })
            .catch((error) => console.error("Error fetching invoice types:", error));

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
            headerName: 'Transaction Date',
            field: 'bill_date',
            editable: true,
            filter: true,
            sortable: false,
            editable: false,
            headerCheckboxSelection: true,
            checkboxSelection: true,
        },
        {
            headerName: 'Transaction No',
            field: 'bill_no',
            editable: true,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Item S.No',
            field: 'item_sno',
            editable: true,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Item Code',
            field: 'item_code',
            editable: true,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Item Name',
            field: 'item_name',
            editable: true,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Bill Qty',
            field: 'bill_qty',
            editable: true,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Received Qty',
            field: 'rec_qty',
            editable: true,
            filter: true,
            sortable: false
        },
        {
            headerName: 'Balance Qty',
            field: 'bal_qty',
            editable: true,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Pending',
            field: 'pending',
            editable: true,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Description',
            field: 'description',
            editable: true,
            filter: true,
            sortable: false,
            editable: false
        }

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

    // const bothDatesSelected = transaction_date && transaction_dateTO;

    // useEffect(() => {
    //     if (bothDatesSelected && pendingStatus) {
    //         fetchreceivedgoodsreport();
    //     }
    // }, [bothDatesSelected, pendingStatus]);

    const fetchreceivedgoodsreport = async () => {
        setLoading(true);
        try {
            const body = {
                item_code: item,
                bill_no: transactionNo,
                item_name: itemname,
                start_date: transaction_date,
                end_date: transaction_dateTO,
                pending: pendingStatus,
                company_code: sessionStorage.getItem("selectedCompanyCode"),
            };

            const response = await fetch(`${config.apiBaseUrl}/getReceivedGoodsReport`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const fetchedData = await response.json();

                // Function to format the bill_date
                const formatDate = (dateString) => {
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0]; // Fetch only the date part (YYYY-MM-DD)
                };

                const newRows = fetchedData.map((matchedItem) => ({
                    bill_date: formatDate(matchedItem.bill_date), // Use formatted date
                    bill_no: matchedItem.bill_no,
                    item_sno: matchedItem.item_sno,
                    item_code: matchedItem.item_code,
                    item_name: matchedItem.item_name,
                    bill_qty: matchedItem.bill_qty,
                    rec_qty: matchedItem.rec_qty,
                    bal_qty: matchedItem.bal_qty,
                    pending: matchedItem.pending,
                    description: matchedItem.description,
                }));

                setRowData(newRows);
            } else if (response.status === 404) {
                console.log("Data Not found");
                toast.warning("Data Not found");
                setRowData([]);
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to fetch data");
                console.error(errorResponse.details || errorResponse.message);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleCustomDatestart = (e) => {
        e.preventDefault();
        setStartDate(e.target.value);
    };

    const handleCustomDateend = (e) => {
        e.preventDefault();
        setEndDate(e.target.value);
    };

    const transformRowData = (data) => {
        return data.map(row => ({
            "Transaction Date": row.bill_date,
            "Transaction No": row.bill_no,
            "Bill Qty": row.bill_qty,
            "Received Qty": row.rec_qty,
            "Balance Qty": row.bal_qty,
            "Item Code": row.item_code,
            "Item Name": row.item_name,
            "Qty": row.bill_qty,
            "pending": row.pending
        }));
    };

    const handleExportToExcel = () => {
        if (rowData.length === 0) {
            toast.warning('There is no data to export.');
            return;
        }

        const headerData = [
            ['Received Goods Analysis'],
            [`Company Name: ${companyName}`],
            [`Date Range: ${transaction_date} to ${transaction_dateTO}`],
            []
        ];

        const transformedData = transformRowData(rowData);

        const worksheet = XLSX.utils.aoa_to_sheet(headerData);

        XLSX.utils.sheet_add_json(worksheet, transformedData, { origin: 'A5' });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Received Goods');
        XLSX.writeFile(workbook, 'ReceivedGoods.xlsx');
    };

    //Default Date functionality
    const currentDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        settransaction_date(currentDate);
    }, [currentDate]);


    const handleDateChange = (e) => {
        const selectedDate = e.target.value;

        if (selectedDate >= financialYearStart && selectedDate <= financialYearEnd) {
            if (selectedDate !== currentDate) {
                console.log("Date has been changed.");
            }
            settransaction_date(selectedDate);
        } else {
            toast.warning('Transaction date must be between April 1st, 2024 and March 31st, 2025.');
        }
    };

    //Default Date functionality
    const currentDateTo = new Date().toISOString().split('T')[0];

    useEffect(() => {
        settransaction_date_TO(currentDateTo);
    }, [currentDateTo]);


    const handleDateChangeTo = (e) => {
        const selectedDate = e.target.value;

        if (selectedDate >= financialYearStart && selectedDate <= financialYearEnd) {
            if (selectedDate !== currentDateTo) {
                console.log("Date has been changed.");
            }
            settransaction_date_TO(selectedDate);
        } else {
            toast.warning('Transaction date must be between April 1st, 2024 and March 31st, 2025.');
        }
    };


    return (
        <div className="container-fluid Topnav-screen">
            {loading && <LoadingScreen />}
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            <div>
                <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
                    <div className="d-flex justify-content-between">
                        <h1 className='purbut mt-3'> Received Goods Analysis</h1>
                        <div className="mobileview">
                            <div className="d-flex justify-content-between">
                                <div className="d-flex justify-content-start">
                                    <h1 className='h1'>Received Goods Analysis</h1>
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
                    <div className="col-md-3 form-group">
                        <label className="form-label">From</label>
                        <input
                            id="TransactionDate"
                            className="exp-input-field form-control"
                            type="date"
                            placeholder=""
                            required title="Please fill the transaction date here"
                            min={financialYearStart}
                            max={financialYearEnd}
                            value={transaction_date}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && transaction_date && transaction_dateTO) {
                                    fetchreceivedgoodsreport();
                                }
                            }}
                            onChange={(e) => settransaction_date(e.target.value)}
                            maxLength={50}
                        />
                    </div>
                    <div className="col-md-3 form-group">
                        <label className="form-label">To</label>
                        <input
                            id="TransactionDate"
                            className="exp-input-field form-control"
                            type="date"
                            placeholder=""
                            required title="Please fill the transaction date here"
                            min={financialYearStart}
                            max={financialYearEnd}
                            value={transaction_dateTO}
                            onChange={(e) => settransaction_date_TO(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && transaction_date && transaction_dateTO) {
                                    fetchreceivedgoodsreport();
                                }
                            }}
                            maxLength={50}
                        />
                    </div>
                    <div className="col-md-3 form-group">
                        <label className="form-label">Transaction No</label>
                        <input
                            name="transactionDate"
                            id="transactionNo"
                            className="exp-input-field form-control"
                            type="text"
                            title="Please Enter the Transaction Number"
                            placeholder=""
                            required
                            autoComplete="off"
                            value={transactionNo}
                            onKeyDown={(e) => e.key === 'Enter' && fetchreceivedgoodsreport()}
                            onChange={(e) => setTransactionNo(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3 form-group">
                        <label for="city" className="form-label">Item Code</label>
                        <div title ='Please Enter the Item Code'>
                        <Select
                            id="status"
                            value={selectedItem}
                            onChange={handleChangeItem}
                            options={filteredOptionItem}
                            className="exp-input-field"
                            placeholder=""
                            onKeyDown={(e) => e.key === 'Enter' && fetchreceivedgoodsreport()}
                        />
                        </div>
                    </div>
                    <div className="col-md-3 form-group mb-2 ">
                        <label className="form-label">Item Name </label>
                        <input
                            id="wcode"
                            className="form-control exp-input-field"
                            placeholder=""
                            title="Please Enter the Item Name"
                            value={itemname}
                            onChange={(e) => setitemname(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchreceivedgoodsreport()}
                        />
                    </div>
                    <div className="col-md-3 form-group">
                        <label className="form-label">Pending Status </label>
                        <div title='Please Enter the Pending Status'>
                        <Select
                            id="returnType"
                            className=" exp-input-field"
                            placeholder=""
                            required
                            value={selectedPendingStatus}
                            onChange={handleChangeStatus}
                            options={filteredOptionStatus}
                            onKeyDown={(e) => e.key === 'Enter' && fetchreceivedgoodsreport()}
                            data-tip="Please select a default warehouse"
                        />
                    </div>
                </div>
                <div className="col-md-1">
                        <div class="exp-form-floating">
                            <div class=" d-flex justify-content-center mt-4">
                                <icon className="popups-btn fs-6 p-3" onClick={fetchreceivedgoodsreport} required title="Search">
                                    <i className="fas fa-search"></i>
                                </icon>
                                {/* <icon className="popups-btn fs-6 p-3" required title="Refresh">
                      <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                    </icon> */}
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
                        paginationAutoPageSize={true}
                    />
                </div>
            </div>
        </div>
        </div>
    );
}

export default ReceivedGoodsRt;
