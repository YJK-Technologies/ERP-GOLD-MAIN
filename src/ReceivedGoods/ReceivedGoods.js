import React, { useState, useRef, useEffect } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AgGridReact } from 'ag-grid-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReceivedGoodsPopup from './ReceivedGoodsHelp';
const config = require('../Apiconfig');

function AssetsReturn({ }) {
    const [rowData, setRowData] = useState([]);
    const [transactionDate, setTransactionDate] = useState('');
    const [transactionNo, setTransactionNo] = useState('');
    const [gridApi, setGridApi] = useState(null);

    const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
    const purchasePermission = permissions
        .filter(permission => permission.screen_type === 'ReceivedGoods')
        .map(permission => permission.permission_type.toLowerCase());


    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const columnDefs = [
        {
            headerName: 'Item S.No',
            field: 'itemSNo',
            editable: false,
            minWidth: 130,
            maxWidth: 130,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Item Code',
            field: 'itemCode',
            editable: false,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Item Name',
            field: 'itemName',
            editable: false,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Bill Qty',
            field: 'billQty',
            editable: false,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Received Qty',
            field: 'receivedQty',
            editable: false,
            filter: true,
            sortable: false
        },
        {
            headerName: 'Balance Qty',
            field: 'balanceQty',
            editable: false,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Receive Qty',
            field: 'receiveQty',
            editable: true,
            filter: true,
            sortable: false,
            valueSetter: (params) => {
                const newValue = Number(params.newValue);
                const balanceQty = Number(params.data.balanceQty);
                const itemCode = params.data.itemCode;

                if (isNaN(newValue)) {
                    toast.warning(`Item Code: ${itemCode} - Please enter a valid number for Receive Qty.`);
                    return false;
                }

                if (newValue > balanceQty) {
                    toast.warning(`Item Code: ${itemCode} - Receive Qty (${newValue}) cannot be greater than Balance Qty (${balanceQty}).`);
                    return false;
                }

                // Valid case
                params.data.receiveQty = newValue;
                return true;
            }
        },
        {
            headerName: 'Keyfield',
            field: 'keyfield',
            editable: false,
            hide: true,
            filter: true,
        },
    ];

    const fetchReceivedGoodsData = async (TransactionNo) => {
        try {
            const body = {
                company_code: sessionStorage.getItem('selectedCompanyCode'),
                bill_no: transactionNo || TransactionNo
            };

            const response = await fetch(`${config.apiBaseUrl}/getReceivedGoods`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const searchData = await response.json();

                if (searchData.length > 0) {
                    const { bill_no, bill_date } = searchData[0];
                    setTransactionNo(bill_no);
                    setTransactionDate(formatDate(bill_date));

                    const newRows = searchData.map((matchedItem) => ({
                        transactionNo: matchedItem.bill_no,
                        transactionDate: formatDate(matchedItem.bill_date),
                        itemSNo: matchedItem.item_sno,
                        itemCode: matchedItem.item_code,
                        itemName: matchedItem.item_name,
                        billQty: matchedItem.bill_qty,
                        balanceQty: matchedItem.bal_qty,
                        receivedQty: matchedItem.rec_qty,
                        keyfield: matchedItem.keyfield,
                        receiveQty: 0
                    }));
                    setRowData(newRows);
                    console.log(searchData);
                } else {
                    toast.warning("Data Not found");
                    setRowData([]);
                }
            } else if (response.status === 404) {
                toast.warning("Data Not found");
                setRowData([]);
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to insert sales data");
                console.error(errorResponse.details || errorResponse.message);
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
        }
    };

    const updateSelectedRows = async () => {
        const allRowsData = [];
        gridApi.forEachNode(node => allRowsData.push(node.data));

        const filteredRows = allRowsData.filter(row => row.receiveQty > 0);

        if (filteredRows.length === 0) {
            toast.warning("No valid rows found with Received Amount greater than zero to update");
            return;
        }

        try {
            const company_code = sessionStorage.getItem('selectedCompanyCode');
            const response = await fetch(`${config.apiBaseUrl}/updateReceivedGoods`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "company_code": company_code
                },
                body: JSON.stringify({ editedData: filteredRows })
            });

            if (response.ok) {
                toast.success("Data updated successfully", {
                    onClose: () => fetchReceivedGoodsData(),
                });
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to update received goods data");
            }
        } catch (error) {
            console.error("Error updating rows:", error);
            toast.error('Error Updating Data: ' + error.message);
        }
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    const [open, setOpen] = React.useState(false);

    const handlePurchase = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleRGData = async (data) => {
        if (data && data.length > 0) {
            const [{ TransactionNo, EntryDate }] = data;

            await fetchReceivedGoodsData(TransactionNo);

            const transactionNumber = document.getElementById('transactionNo');
            if (transactionNumber) {
                transactionNumber.value = TransactionNo;
                setTransactionNo(TransactionNo);
            } else {
                console.error('transactionNumber element not found');
            }

            const transactionDate = document.getElementById('transactionDate');
            if (transactionDate) {
                transactionDate.value = EntryDate;
                setTransactionDate(formatDate(EntryDate));
            } else {
                console.error('transactionDate element not found');
            }

        } else {
            console.log("Data not fetched...!");
        }
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div class="container-fluid Topnav-screen">
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
                <div className="d-flex justify-content-between">
                    <div className=" justify-content-start">
                        <h1 align="left" className="purbut me-5">Received Goods</h1>
                    </div>
                    <div class="d-flex justify-content-end mb-2 me-3 ">
                        {["add", "all permission"].some((permission) => purchasePermission.includes(permission)) && (
                            <savebutton className="purbut" title="save" onClick={updateSelectedRows}>
                                <i class="fa-regular fa-floppy-disk"></i>
                            </savebutton>
                        )}
                        <printbutton className="purbut" onClick={handleReload} title='reload'>
                            <i class="fa-solid fa-arrow-rotate-right"></i>
                        </printbutton>
                    </div>
                    <div className="mobileview">
                        <div class=" d-flex justify-content-between ">
                            <div className="" style={{ textAlign: "left" }}>
                                <h1 className="h1">Received Goods</h1>
                            </div>
                            <div className=" ">
                                <div class="dropdown mt-2 me-3" >
                                    <button class="btn btn-primary dropdown-toggle p-1 ms-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="fa-solid fa-list"></i>
                                    </button>
                                    <ul class="dropdown-menu menu">
                                        <li class="iconbutton  d-flex justify-content-center text-success ">
                                            {['update', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                                                <icon class="icon" onClick={updateSelectedRows}>
                                                    <i class="fa-regular fa-floppy-disk"></i>
                                                </icon>
                                            )}
                                        </li>
                                        <li class="iconbutton  d-flex justify-content-center">
                                            <icon class="icon" onClick={handleReload} title='reload'>
                                                <i class="fa-solid fa-arrow-rotate-right"></i>
                                            </icon>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded  pb-4">
                <div class=" mt-4">
                    <div className="row ms-3 ">
                        <div className="col-md-2 form-group mb-2 ">
                            <label class="exp-form-labels">Transaction No</label>
                            <div className="exp-form-floating">
                                <div class="d-flex justify-content-end">
                                    <input
                                        name="transactionDate"
                                        id="transactionNo"
                                        className="exp-input-field form-control"
                                        type="text"
                                        placeholder=""
                                        required
                                        autoComplete="off"
                                        value={transactionNo}
                                        onKeyDown={(e) => e.key === "Enter" && fetchReceivedGoodsData()}
                                        onChange={(e) => setTransactionNo(e.target.value)}
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
                        <div className="col-md-2 form-group mb-2 " >
                            <div class="exp-form-floating" >
                                <label class="exp-form-labels">Transaction Date</label>
                                <input
                                    name="transactionDate"
                                    id="transactionDate"
                                    className="exp-input-field form-control"
                                    type="date"
                                    placeholder=""
                                    required
                                    value={transactionDate}
                                />
                            </div>
                        </div>
                    </div>
                    <div align="right" class="d-flex justify-content-end mb-2 me-6" style={{ marginRight: "90px" }}>
                    </div>
                    <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                        <AgGridReact
                            columnDefs={columnDefs}
                            rowData={rowData}
                            defaultColDef={{ flex: true }}
                            onGridReady={onGridReady}
                            pagination={true}
                            paginationAutoPageSize={true}
                        />
                    </div>
                    <div>
                        <ReceivedGoodsPopup open={open} handleClose={handleClose} handleRGData={handleRGData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AssetsReturn;
