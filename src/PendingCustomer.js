import React, { useState, useRef, useEffect } from "react";
import "./input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AgGridReact } from 'ag-grid-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
const config = require('./Apiconfig');

function AssetsReturn({ }) {
    const [rowData, setRowData] = useState([]);
    const [customerDrop, setCustomerDrop] = useState([]);
    const [typeDrop, setTypeDrop] = useState([]);
    const [customer, setCustomer] = useState('');
    const [type, setType] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [transactionDate, setTransactionDate] = useState('');
    const [gridApi, setGridApi] = useState(null);

    const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
    const purchasePermission = permissions
        .filter(permission => permission.screen_type === 'PendingCustomer')
        .map(permission => permission.permission_type.toLowerCase());


    useEffect(() => {
        const fetchCustomerCode = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/getCustomerCodeDrop`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        company_code: sessionStorage.getItem("selectedCompanyCode"),
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    const updatedData = [{ customer_code: "All", customer_name: "All" }, ...data];
                    setCustomerDrop(updatedData);
                } else {
                    console.warn("No data found");
                    setCustomerDrop([]);
                }
            } catch (error) {
                console.error("Error fetching item codes:", error);
            }
        };

        fetchCustomerCode();
    }, []);

    const filteredOptionCustomer = customerDrop.map((option) => ({
        value: option.customer_code,
        label: `${option.customer_code} - ${option.customer_name}`,
    }));

    const handleChangeCustomer = (selectedCustomer) => {
        setSelectedCustomer(selectedCustomer);
        setCustomer(selectedCustomer ? selectedCustomer.value : '');
    };

    useEffect(() => {
        const companyCode = sessionStorage.getItem('selectedCompanyCode');
        
        fetch(`${config.apiBaseUrl}/PendingCustomer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_code: companyCode,
          }),
        })

        
          .then((data) => data.json())
          .then((val) => {
            setTypeDrop(val);
    
            if (val.length > 0) {
              const firstOption = {
                value: val[0].attributedetails_name,
                label: val[0].attributedetails_name,
              };
              setSelectedType(firstOption);
              setType(firstOption.value);
            }
          });
    }, []);

    const handleChangeType = (selectedType) => {
        setSelectedType(selectedType);
        setType(selectedType ? selectedType.value : '');
      };
    
      const filteredOptionType = Array.isArray(typeDrop)
      ? typeDrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
      }))
      : [];

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const columnDefs = [
        {
            headerName: 'S.No',
            field: 'serialNumber',
            maxWidth: 80,
            sortable: false,
            valueGetter: (params) => {
                return params.node ? params.node.rowIndex + 1 : '';
            },
        },
        {
            headerName: 'Transaction No',
            field: 'transactionNo',
            editable: true,
            //minWidth: 300,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Transaction Date',
            field: 'transactionDate',
            editable: true,
            //maxWidth: 200,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Customer Code',
            field: 'code',
            editable: true,
            //minWidth: 300,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Customer Name',
            field: 'name',
            editable: true,
            //minWidth: 300,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Item Details',
            field: 'HeaderDescription',
            editable: true,
            //minWidth: 300,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Total Amount',
            field: 'totalAmount',
            editable: true,
            //minWidth: 180,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Paid',
            field: 'paidAmount',
            editable: true,
            //minWidth: 180,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Balance Amount',
            field: 'balanceAmount',
            editable: true,
            //minWidth: 180,
            filter: true,
            sortable: false,
            editable: false
        },
        {
            headerName: 'Received Amount',
            field: 'receivedAmount',
            editable: true,
            //minWidth: 180,
            filter: true,
            sortable: false
        },
        {
            headerName: 'Keyfield',
            field: 'keyfield',
            editable: false,
            hide: true,
            //minWidth: 180,
            filter: true,
            sortable: false
        },
    ];

    useEffect(() => {
        if(type){
            fetchQuotationData();
        }
    }, [customer, transactionDate, type]);

    const fetchQuotationData = async () => {
        try {
            const body = {
                bill_date: transactionDate,
                company_code: sessionStorage.getItem('selectedCompanyCode'),
                customer_code: customer,
                type:type
            };

            const response = await fetch(`${config.apiBaseUrl}/getPendingCustomer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const searchData = await response.json();
                const newRows = searchData.map((matchedItem) => ({
                    transactionNo: matchedItem.bill_no,
                    transactionDate: formatDate(matchedItem.bill_date),
                    totalAmount: matchedItem.bill_amt,
                    balanceAmount: matchedItem.bal_amt,
                    paidAmount: matchedItem.paid_amt,
                    name: matchedItem.customer_name,
                    code: matchedItem.customer_code,
                    HeaderDescription:matchedItem.HeaderDescription,
                    receivedAmount:0,
                    keyfield: matchedItem.keyfield
                }));
                setRowData(newRows);
                console.log(searchData);
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
        }
    };

    const updateSelectedRows = async () => {
        const allRowsData = [];
        gridApi.forEachNode(node => allRowsData.push(node.data));

        const filteredRows = allRowsData.filter(row => row.receivedAmount > 0);

        if (filteredRows.length === 0) {
            toast.warning("No valid rows found with Received Amount greater than zero to update");
            return;
        }

        try {
            const company_code = sessionStorage.getItem('selectedCompanyCode');
            const response = await fetch(`${config.apiBaseUrl}/updatePendingCustomer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "company_code": company_code
                },
                body: JSON.stringify({ editedData: filteredRows })
            });

            if (response.ok) {
                toast.success("Data updated successfully", {
                    onClose: () => fetchQuotationData(),
                });
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to insert sales data");
            }
        } catch (error) {
            console.error("Error deleting rows:", error);
            toast.error('Error Deleting Data: ' + error.message);
        }
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    return (
        <div class="container-fluid Topnav-screen">
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2 mt-2">
                <div className="d-flex justify-content-between">
                    <div className=" justify-content-start">
                        <h1 align="left" className="purbut me-5">Pending Customer</h1>
                    </div>
                    <div class="d-flex justify-content-end mb-2 me-3 ">
                        {["add", "all permission"].some((permission) => purchasePermission.includes(permission)) && (
                            <savebutton className="purbut" title="save" onClick={updateSelectedRows}>
                                <i class="fa-regular fa-floppy-disk"></i>
                            </savebutton>
                        )}
                    </div>
                    <div className="mobileview">
                        <div class=" d-flex justify-content-between ">
                            <div className="" style={{ textAlign: "left" }}>
                                <h1 className="h1">Pending Customer</h1>
                            </div>
                            <div className=" ">
                                <div class="dropdown mt-2 me-3" >
                                    <button class="btn btn-primary dropdown-toggle p-1 ms-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="fa-solid fa-list"></i>
                                    </button>
                                    <ul class="dropdown-menu menu">
                                        <li class="iconbutton  d-flex justify-content-center text-success ">
                                            {['update', 'all permission'].some(permission => purchasePermission.includes(permission)) && (
                                                <icon class="icon">
                                                    <i class="fa-regular fa-floppy-disk"></i>
                                                </icon>
                                            )}
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
                        <div className="col-md-2  form-group">
                            <div class="exp-form-floating">
                               <label for="rid" class="exp-form-labels">Customer Code</label>
                               <div title="select a customer code">
                                <Select
                                    id="status"
                                    value={selectedCustomer}
                                    onChange={handleChangeCustomer}
                                    options={filteredOptionCustomer}
                                    className="exp-input-field"
                                    placeholder=""
                                />
                            </div>
                            </div>
                        </div>
                        <div className="col-md-2 form-group mb-2 ">
                            <div className="exp-form-floating">
                                <label class="exp-form-labels">Transaction Date</label>
                                <input
                                    name="transactionDate"
                                    id="billDate"
                                    className="exp-input-field form-control"
                                    type="date"
                                    placeholder=""
                                    required
                                    value={transactionDate}
                                    onChange={(e) => setTransactionDate(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <div className="col-md-2  form-group">
                            <div class="exp-form-floating">
                               <label for="rid" class="exp-form-labels">Transaction Type</label>
                                 <div title="select a transaction type"></div>
                                <Select
                                    id="status"
                                    value={selectedType}
                                    onChange={handleChangeType}
                                    options={filteredOptionType}
                                    className="exp-input-field"
                                    placeholder=""
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
                            defaultColDef={{ editable: true, resizable: true }}
                            onGridReady={onGridReady}
                            pagination={true}
                            paginationAutoPageSize={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AssetsReturn;
