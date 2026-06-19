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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./mobile.css";
import DCItemPopup from './DCItemPopup';
import DcPopup from './DcPopup';
import './mobile.css';
import labels from './Labels';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';
import DcCustomerPopup from './SalesVendorPopup';
import Select from 'react-select';
import { useLocation } from 'react-router-dom';
import DeletedDcOPopup from './DeletedDcPopup';
import LZString from "lz-string";
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

function DeliveryChallan() {

    const [rowData, setRowData] = useState([]);
    const [rowDataTerms, setrowDataTerms] = useState([{ serialNumber: 1, Terms_conditions: '' }]);
    const [transactionDate, setTransactionDate] = useState("");
    const [TotalBill, setTotalBill] = useState('');
    const [Totaltransport, setTotalTransport] = useState(0)
    const [TotalPurchase, setTotalPurchase] = useState(0)
    const [round_difference, setRoundDifference] = useState(0)
    const [new_running_no, setNew_running_no] = useState("");
    const [error, setError] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [clickedRowIndex, setClickedRowIndex] = useState(null)
    const [global, setGlobal] = useState(null)
    const [globalItem, setGlobalItem] = useState(null)
    const [additionalData, setAdditionalData] = useState({
        modified_by: '',
        created_by: '',
        modified_date: '',
        created_date: ''
    });
    const [showUpdateButton, setShowUpdateButton] = useState(false);
    const [buttonsVisible, setButtonsVisible] = useState(true);
    const [showExcelButton, setShowExcelButton] = useState(false);
    const [showAsterisk, setShowAsterisk] = useState(false);
    const [selectedPay, setSelectedPay] = useState(null);
    const [selectedSales, setSelectedSales] = useState(null);
    const [payType, setPayType] = useState("");
    const [salesType, setSalesType] = useState("");
    const [paydrop, setPaydrop] = useState([]);
    const [salesdrop, setSalesdrop] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [product, setProduct] = useState("");
    const [productDrop, setProductDrop] = useState([]);
    const [dynamicOptions, setDynamicOptions] = useState([]);
    const transactionNoRef = useRef(null);
    const transactionDateRef = useRef(null);
    const payTypeRef = useRef(null);
    const salesTypeRef = useRef(null);
    const totalRef = useRef(null);
    const transportRef = useRef(null);
    const roundAmountRef = useRef(null);
    const grandTotalRef = useRef(null);
    const [screensDrop, setScreensDrop] = useState([]);
    const [Screens, setScreens] = useState('');
    const [selectedscreens, setSelectedscreens] = useState(null);
    const [loading, setLoading] = useState(false);

    const location = useLocation();
    const savedPath = sessionStorage.getItem('currentPath');

    const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
    const DcPermission = permissions
        .filter(permission => permission.screen_type === 'DeliveryChallan')
        .map(permission => permission.permission_type.toLowerCase());

    useEffect(() => {
        const currentPath = location.pathname;
        console.log(`Current path: ${currentPath}`);
        if (savedPath !== '/DeliveryChallan') {
            sessionStorage.getItem('DeliveryChallanScreenSelection');
        }
    }, [location]);

    useEffect(() => {
        const savedScreen = sessionStorage.getItem('DeliveryChallanScreenSelection');
        if (savedScreen) {
            setSelectedscreens({ value: savedScreen, label: savedScreen === 'Add' ? 'Add' : 'Delete' });
            setScreens(savedScreen);
        } else {
            setSelectedscreens({ value: 'Add', label: 'Add' });
            setScreens('Add');
        }
    }, []);

    useEffect(() => {
        const company_code = sessionStorage.getItem('selectedCompanyCode');

        fetch(`${config.apiBaseUrl}/getEvent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code })
        })
            .then((data) => data.json())
            .then((val) => setScreensDrop(val))
            .catch((error) => console.error('Error fetching data:', error));
    }, []);

    const handleChangeScreens = (selected) => {
        setSelectedscreens(selected);
        const screenValue = selected?.value === 'Add' ? 'Add' : 'Delete';
        setScreens(screenValue);
        sessionStorage.setItem('DeliveryChallanScreenSelection', screenValue);
    };

    const filteredOptionScreens = screensDrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

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

    const onCellValueChangedShipTo = (params) => {
        if (params.data.fieldName === "Customer Code") {
            if (!params.data.shipTo) {
                setHeaderRowData((prevData) =>
                    prevData.map((row) => ({
                        ...row,
                        shipTo: row.fieldName === "Customer Code" ? row.shipTo : "", // Retain only Customer Code field's value
                    }))
                );
            } else {
                handleCustomerDetailsShipTo(params.data.shipTo);
            }
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            const company_code = sessionStorage.getItem('selectedCompanyCode');

            try {
                const response = await fetch(`${config.apiBaseUrl}/Terms`, {
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
                setrowDataTerms(updatedData);
            } catch (error) {
                console.log(error.message);
            }
        };

        fetchData();
    }, []);


    const columnPatch = [
        { headerName: 'Details', field: 'fieldName', maxWidth: 240, editable: false },
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


    const columnHeader = [
        { headerName: 'Details', field: 'fieldName', maxWidth: 240, editable: false },
        {
            headerName: 'Bill To',
            field: 'billTo',
            editable: true,
            onCellValueChanged: onCellValueChangedBillTo,
            cellEditorParams: {
                maxLength: 250
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
                                onClick={handleBillToCustomer}
                            >
                                <i className="fa fa-search"></i>
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            headerName: 'Ship To',
            field: 'shipTo',
            editable: true,
            onCellValueChanged: onCellValueChangedShipTo,
            cellEditorParams: {
                maxLength: 250
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
                                onClick={handleShipToCustomer}
                            >
                                <i className="fa fa-search"></i>
                            </span>
                        )}
                    </div>
                );
            },
        }
    ];

    const handleBillToCustomer = () => {
        setOpen2(true);
    };

    const handleShipToCustomer = () => {
        setOpen3(true);
    };


    const [headerRowData, setHeaderRowData] = useState([
        { fieldName: 'Customer Code', billTo: '', shipTo: '' },
        { fieldName: 'Customer Name', billTo: '', shipTo: '' },
        { fieldName: 'Address 1', billTo: '', shipTo: '' },
        { fieldName: 'Address 2', billTo: '', shipTo: '' },
        { fieldName: 'Address 3', billTo: '', shipTo: '' },
        { fieldName: 'Address 4', billTo: '', shipTo: '' },
        { fieldName: 'State', billTo: '', shipTo: '' },
        { fieldName: 'Country', billTo: '', shipTo: '' },
        { fieldName: 'Mobile No', billTo: '', shipTo: '' },
        { fieldName: 'GST No', billTo: '', shipTo: '' },
        { fieldName: 'Contact Person', billTo: '', shipTo: '' },
    ]);

    const handleCustomerBillTo = async (data) => {
        if (data && data.length > 0) {
            const [{ CustomerCode, CustomerName, Address1, Address2, Address3, Address4, State, Country, MobileNo, ContactPerson, GSTNo }] = data;

            setHeaderRowData((prevRowData) =>
                prevRowData.map((row) => {
                    switch (row.fieldName) {
                        case 'Customer Code': return { ...row, billTo: CustomerCode };
                        case 'Customer Name': return { ...row, billTo: CustomerName };
                        case 'Address 1': return { ...row, billTo: Address1 };
                        case 'Address 2': return { ...row, billTo: Address2 };
                        case 'Address 3': return { ...row, billTo: Address3 };
                        case 'Address 4': return { ...row, billTo: Address4 };
                        case 'State': return { ...row, billTo: State };
                        case 'Country': return { ...row, billTo: Country };
                        case 'Mobile No': return { ...row, billTo: MobileNo };
                        case 'GST No': return { ...row, billTo: GSTNo };
                        case 'Contact Person': return { ...row, billTo: ContactPerson };
                        default: return row;
                    }
                })
            );

        } else {
            console.error('Data is empty or undefined');
        }
    };

    const handleCustomerShipTo = async (data) => {
        if (data && data.length > 0) {
            const [{ CustomerCode, CustomerName, Address1, Address2, Address3, Address4, State, Country, MobileNo, ContactPerson, GSTNo }] = data;

            setHeaderRowData((prevRowData) =>
                prevRowData.map((row) => {
                    switch (row.fieldName) {
                        case 'Customer Code': return { ...row, shipTo: CustomerCode };
                        case 'Customer Name': return { ...row, shipTo: CustomerName };
                        case 'Address 1': return { ...row, shipTo: Address1 };
                        case 'Address 2': return { ...row, shipTo: Address2 };
                        case 'Address 3': return { ...row, shipTo: Address3 };
                        case 'Address 4': return { ...row, shipTo: Address4 };
                        case 'State': return { ...row, shipTo: State };
                        case 'Country': return { ...row, shipTo: Country };
                        case 'Mobile No': return { ...row, shipTo: MobileNo };
                        case 'GST No': return { ...row, shipTo: GSTNo };
                        case 'Contact Person': return { ...row, shipTo: ContactPerson };
                        default: return row;
                    }
                })
            );
        } else {
            console.error('Data is empty or undefined');
        }
    };


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

                const [{ customer_code, customer_name, customer_addr_1, customer_addr_2, customer_addr_3, customer_addr_4, customer_state,
                    customer_country, customer_mobile_no, contact_person, customer_gst_no }] = searchData;

                setHeaderRowData((prevRowData) =>
                    prevRowData.map((row) => {
                        switch (row.fieldName) {
                            case 'Customer Code': return { ...row, billTo: customer_code };
                            case 'Customer Name': return { ...row, billTo: customer_name };
                            case 'Address 1': return { ...row, billTo: customer_addr_1 };
                            case 'Address 2': return { ...row, billTo: customer_addr_2 };
                            case 'Address 3': return { ...row, billTo: customer_addr_3 };
                            case 'Address 4': return { ...row, billTo: customer_addr_4 };
                            case 'State': return { ...row, billTo: customer_state };
                            case 'Country': return { ...row, billTo: customer_country };
                            case 'Mobile No': return { ...row, billTo: customer_mobile_no };
                            case 'GST No': return { ...row, billTo: customer_gst_no };
                            case 'Contact Person': return { ...row, billTo: contact_person };
                            default: return row;
                        }
                    })
                );
            } else if (response.status === 404) {
                toast.warning("Data not found", {
                    // onClose: () => {
                    //     setHeaderRowData((prevRowData) =>
                    //         prevRowData.map((row) => ({
                    //             ...row,
                    //             billTo: "",
                    //         }))
                    //     );
                    // },
                });
            } else {
                console.log("Bad request");
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
            toast.error("An error occurred while fetching customer details.");
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerDetailsShipTo = async (customerCode) => {
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
                console.log(searchData);

                const [{ customer_code, customer_name, customer_addr_1, customer_addr_2, customer_addr_3, customer_addr_4, customer_state,
                    customer_country, customer_mobile_no, contact_person, customer_gst_no }] = searchData

                setHeaderRowData((prevRowData) =>
                    prevRowData.map((row) => {
                        switch (row.fieldName) {
                            case 'Customer Code': return { ...row, shipTo: customer_code };
                            case 'Customer Name': return { ...row, shipTo: customer_name };
                            case 'Address 1': return { ...row, shipTo: customer_addr_1 };
                            case 'Address 2': return { ...row, shipTo: customer_addr_2 };
                            case 'Address 3': return { ...row, shipTo: customer_addr_3 };
                            case 'Address 4': return { ...row, shipTo: customer_addr_4 };
                            case 'State': return { ...row, shipTo: customer_state };
                            case 'Country': return { ...row, shipTo: customer_country };
                            case 'Mobile No': return { ...row, shipTo: customer_mobile_no };
                            case 'GST No': return { ...row, shipTo: customer_gst_no };
                            case 'Contact Person': return { ...row, shipTo: contact_person };
                            default: return row;
                        }
                    })
                );

            } else if (response.status === 404) {
                console.log("Data Not Found");
                toast.warning("Data not found", {
                    // onClose: () => {
                    //     setHeaderRowData((prevRowData) =>
                    //         prevRowData.map((row) => ({
                    //             ...row,
                    //             shipTo: "",
                    //         }))
                    //     );
                    // },
                });
            } else {
                console.log("Bad request");
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
            toast.error("An error occurred while fetching customer details.");
        } finally {
            setLoading(false);
        }
    };

    const handleSwiftButtonClick = () => {
        const updatedRowData = headerRowData.map(row => ({
            ...row,
            shipTo: row.billTo
        }));
        setHeaderRowData(updatedRowData);
    };


    const [financialYearStart, setFinancialYearStart] = useState('');
    const [financialYearEnd, setFinancialYearEnd] = useState('');

    const handleDc = () => {
        setOpen1(true);
    };

    //Item Name Popup
    const [open, setOpen] = React.useState(false);
    const [open1, setOpen1] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [open3, setOpen3] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
        setOpen1(false);
        setOpen2(false);
        setOpen3(false);
        setOpen4(false);
    };

    //CODE FOR TOTAL WEIGHT, TOTAL TAX AND TOTAL AMOUNT CALCULATION
    const ItemAmountCalculation = async (params) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/DCItemAmountCalculation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    company_code: sessionStorage.getItem('selectedCompanyCode'),
                    type: params.data.type,
                    Item_SNO: params.data.serialNumber,
                    Item_code: params.data.productItemCode,
                    bill_qty: params.data.purchaseQty,
                    purchaser_amt: params.data.unitPrice,
                    // tax_type_header: params.data.taxType,
                    // tax_name_details: params.data.taxDetail,
                    // tax_percentage: params.data.taxPercentage,
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
                                ItemTotalWight: matchedItem.ItemTotalWight,
                                TotalItemAmount: matchedItem.TotalItemAmount,
                                TotalTaxAmount: matchedItem.TotalTaxAmount
                            };
                        }
                    }
                    return row;
                });

                setRowData(updatedRowData);

                const hasPurchaseQty = updatedRowData.some(row => row.purchaseQty >= 0);

                if (hasPurchaseQty) {
                    const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || 0).join(',');
                    const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || 0).join(',');

                    const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
                    const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

                    console.log("formattedTotalItemAmounts", formattedTotalItemAmounts);
                    console.log("formattedTotalTaxAmounts", formattedTotalTaxAmounts);

                    await TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);

                    console.log("TotalAmountCalculation executed successfully");
                } else {
                    console.log("No rows with purchaseQty greater than 0 found");
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
            console.error("Error fetching search data:", error);
        }
    };

    const TotalAmountCalculation = async (formattedTotalTaxAmounts, formattedTotalItemAmounts) => {
        if (parseFloat(formattedTotalTaxAmounts) >= 0 && parseFloat(formattedTotalItemAmounts) >= 0) {
            try {
                const response = await fetch(`${config.apiBaseUrl}/getDCTotalAmountCalculation`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ Tax_amount: Totaltransport.toString(), Putchase_amount: formattedTotalItemAmounts, company_code: sessionStorage.getItem("selectedCompanyCode") }),
                });
                if (response.ok) {
                    const data = await response.json();
                    const [{ rounded_amount, round_difference, TotalPurchase, TotalTax }] = data;
                    setTotalBill(rounded_amount);
                    setRoundDifference(round_difference);
                    setTotalPurchase(TotalPurchase);
                    //setTotalTransport(formatToTwoDecimalPoints(TotalTax));
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
    // const handleItemCode = async (params) => {
    //     try {
    //         const response = await fetch(`${config.apiBaseUrl}/getItemCodeDcData`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({ Item_code: params.data.itemCode })
    //         });

    //         if (response.ok) {
    //             const searchData = await response.json();
    //             const updatedRow = rowData.map(row => {
    //                 if (row.itemCode === params.data.itemCode) {
    //                     const matchedItem = searchData.find(item => item.id === row.id);
    //                     if (matchedItem) {
    //                         return {
    //                             ...row,
    //                             itemCode: matchedItem.Item_code,
    //                             itemName: matchedItem.Item_name,
    //                             unitWeight: matchedItem.Item_wigh,
    //                             Hsn: matchedItem.hsn,
    //                             baseuom: matchedItem.Item_BaseUOM,
    //                             purchaseAmt: matchedItem.Item_std_sales_price,
    //                             taxType: matchedItem.Item_sales_tax_type,
    //                             taxDetails: matchedItem.combined_tax_details,
    //                             taxPer: matchedItem.combined_tax_percent
    //                         };
    //                     }
    //                 }
    //                 return row;
    //             });
    //             setRowData(updatedRow);
    //             console.log(updatedRow);
    //         } else if (response.status === 404) {
    //             toast.warning('Data not found');
    //         } else {
    //             console.log("Bad request");
    //         }
    //     } catch (error) {
    //         console.error("Error fetching search data:", error);
    //     }
    // };

    const handleKeyPressRef = (e) => {
        if (e.key === 'Enter') {
            handleRefNo(new_running_no)
        }
    };

    //CODE ITEM CODE TO ADD NEW ROW FUNCTION
    const handleCellValueChanged = (params) => {
        const { colDef, rowIndex, newValue } = params;
        const lastRowIndex = rowData.length - 1;

        // Check if the change occurred in the purchaseQty field
        if (colDef.field === 'purchaseQty') {
            const quantity = parseFloat(newValue);

            // Check if the entered quantity is positive and the row is the last one
            if (quantity > 0 && rowIndex === lastRowIndex) {
                const serialNumber = rowData.length + 1;
                const newRowData = {
                    serialNumber,
                    itemCode: null,
                    itemName: null,
                    Hsn: null,
                    purchaseQty: 0,
                    baseuom: null,
                    purchaseAmt: null,
                    TotalItemAmount: null,
                };

                setRowData(prevRowData => [...prevRowData, newRowData]);
            }
        }
    };

    const handleDelete = (params) => {
        const serialNumberToDelete = params.data.serialNumber;

        const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);

        setRowData(updatedRowData);

        if (updatedRowData.length === 0) {

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

            const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || '0.00').join(',');
            const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || '0.00').join(',');

            const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
            const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

            TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);

        }
    };

    function qtyValueSetter(params) {
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

    const [rowdatapatch, setrowdatapatch] = useState([
        { fieldName: 'Delivery Note', Notes: '' },
        { fieldName: 'Dispatched Through', Notes: '' },
        { fieldName: 'Destination', Notes: '' },
        { fieldName: 'Note For Sale', Notes: '' },
    ]);


    const columnDefs = [
        {
            headerName: 'S.No',
            field: 'serialNumber',
            maxWidth: 80,
            sortable: false
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
            field: 'productItemCode',
            editable: false,
            filter: true,
            cellEditorParams: {
                maxLength: 18,
            },
            // onCellValueChanged: function (params) {
            //     handleItemCode(params);
            // },
            sortable: false,
        },
        {
            headerName: 'Item Name',
            field: 'productItemName',
            editable: false,
            filter: true,
            cellEditorParams: {
                maxLength: 40,
            },
            sortable: false,
            // cellRenderer: (params) => {
            //     const cellWidth = params.column.getActualWidth();
            //     const isWideEnough = cellWidth > 30;
            //     const showSearchIcon = isWideEnough;

            //     return (
            //         <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%' }}>
            //             <div className="flex-grow-1">
            //                 {params.editing ? (
            //                     <input
            //                         type="text"
            //                         className="form-control"
            //                         value={params.value || ''}
            //                         onChange={(e) => params.setValue(e.target.value)}
            //                         style={{ width: '100%' }}
            //                     />
            //                 ) : (
            //                     params.value
            //                 )}
            //             </div>

            //             {showSearchIcon && (
            //                 <span
            //                     className="icon searchIcon"
            //                     style={{
            //                         position: 'absolute',
            //                         right: '-10px',
            //                         top: '50%',
            //                         transform: 'translateY(-50%)',
            //                     }}
            //                     onClick={() => handleClickOpen(params)}
            //                 >
            //                     <i className="fa fa-search"></i>
            //                 </span>
            //             )}
            //         </div>
            //     );
            // },
        },
        // {
        //     headerName: '',
        //     field: 'Search',
        //     editable: true,
        //     maxWidth: 25,
        //     tooltipValueGetter: (params) =>
        //         "Item Help",
        //     onCellClicked: handleClickOpen,
        //     cellRenderer: function () {
        //         return <FontAwesomeIcon icon="fa-solid fa-magnifying-glass-plus" style={{ cursor: 'pointer', marginRight: "10px" }} />
        //     },
        //     cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
        //     sortable: false,
        //     filter: false
        // },
        {
            headerName: 'Product Description',
            field: 'productDescription',
            editable: true,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'HSN/SAC',
            field: 'HSNCode',
            editable: false,
            filter: true,
            sortable: false,
            cellEditorParams: {
                maxLength: 10,
            },
        },
        {
            headerName: 'Qty',
            field: 'purchaseQty',
            editable: true,
            filter: true,
            maxLength: 10,
            maxWidth: 90,
            valueSetter: qtyValueSetter,
        },
        {
            headerName: 'Price',
            field: 'unitPrice',
            editable: true,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Type',
            field: 'type',
            editable: false,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Total',
            field: 'TotalItemAmount',
            editable: false,
            filter: true,
            sortable: false,
            maxWidth: 150,
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
            field: 'taxDetail',
            editable: false,
            filter: true,
            hide: true,
            sortable: false
        },
        {
            headerName: 'Tax Percentage',
            field: 'taxPercentage',
            editable: false,
            filter: true,
            hide: true,
            sortable: false
        },
    ];

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
            maxLength: 250,
            maxHeight: 50,
            sortable: false,
            editable: true,
            flex: true,
            onCellValueChanged: (params) => handleValueChanged(params),
        },
    ];

    const handleValueChanged = (params) => {
        const { data, colDef } = params;
        if (colDef.field === "Terms_conditions" && data.Terms_conditions?.trim() !== "") {
            const isLastRow = rowDataTerms[rowDataTerms.length - 1] === data;
            if (isLastRow) {
                const newRow = {
                    serialNumber: rowDataTerms.length + 1,
                    Terms_conditions: "",
                };
                setrowDataTerms((prevRows) => [...prevRows, newRow]);
            }
        }
    };

    const handleUpdateButtonClick = async () => {
        if (!new_running_no || !payType || !salesType) {
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

            const shipToData = headerRowData.reduce((acc, row) => {
                acc[row.fieldName] = row.shipTo;
                return acc;
            }, {});


            const datapatch = rowdatapatch.reduce((acc, row) => {
                acc[row.fieldName] = row.Notes;
                return acc;
            }, {});

            const Header = {
                company_code: sessionStorage.getItem('selectedCompanyCode'),
                transport_charges: Totaltransport,
                bill_to_customer_code: billToData['Customer Code'],
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
                Ship_to_customer_code: shipToData['Customer Code'],
                ShipTo_customer_name: shipToData['Customer Name'],
                ShipTo_customer_addr_1: shipToData['Address 1'],
                ShipTo_customer_addr_2: shipToData['Address 2'],
                ShipTo_customer_addr_3: shipToData['Address 3'],
                ShipTo_customer_addr_4: shipToData['Address 4'],
                ShipTo_customer_state: shipToData['State'],
                ShipTo_customer_country: shipToData['Country'],
                ShipTo_customer_mobile_no: shipToData['Mobile No'],
                ShipTocustomer_gst_no: shipToData['GST No'],
                ShipTocontact_person: shipToData['Contact Person'],
                delivery_note: datapatch['Delivery Note'] ? datapatch['Delivery Note'] : null,
                dispatched_through: datapatch['Dispatched Through'] ? datapatch['Dispatched Through'] : null,
                note_not_for_sale: datapatch['Note For Sale'] ? datapatch['Note For Sale'] : null,
                destination: datapatch['Destination'] ? datapatch['Destination'] : null,
                transaction_date: transactionDate,
                transaction_no: new_running_no,
                purchase_amount: TotalPurchase,
                total_amount: TotalBill,
                rounded_off: round_difference,
                pay_type: payType,
                sales_type: salesType,
                modified_by: sessionStorage.getItem('selectedUserCode')
            };

            const response = await fetch(`${config.apiBaseUrl}/updDeliveryChallanheader`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Header),
            });

            if (response.ok) {

                await saveDcDetails(new_running_no);
                await saveDcDetailsTerms(new_running_no);
                setShowExcelButton(true);
                toast.success("Delivery challan Data updated Successfully")

            } else {
                const errorResponse = await response.json();
                console.error(errorResponse.message);
                toast.error('Error inserting data' + errorResponse.message);
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
        if (!transactionDate) {
            setError(" ");
            toast.warning('Error: Missing required fields');
            return;
        }

        if (rowData.length === 0) {
            toast.warning('No DC details or tax details found to save.');
            return;
        }

        const filteredRowData = rowData.filter(row => row.purchaseQty > 0 && row.TotalItemAmount > 0 && row.unitPrice > 0);

        if (filteredRowData.length === 0) {
            toast.warning('please check Qty, Unit price and Total values are greaterthan Zero');
            return;
        }
        setLoading(true);

        try {

            const billToData = headerRowData.reduce((acc, row) => {
                acc[row.fieldName] = row.billTo;
                return acc;
            }, {});

            const shipToData = headerRowData.reduce((acc, row) => {
                acc[row.fieldName] = row.shipTo;
                return acc;
            }, {});


            const datapatch = rowdatapatch.reduce((acc, row) => {
                acc[row.fieldName] = row.Notes;
                return acc;
            }, {});

            const Header = {
                company_code: sessionStorage.getItem('selectedCompanyCode'),
                bill_to_customer_code: billToData['Customer Code'],
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
                Ship_to_customer_code: shipToData['Customer Code'],
                ShipTo_customer_name: shipToData['Customer Name'],
                ShipTo_customer_addr_1: shipToData['Address 1'],
                ShipTo_customer_addr_2: shipToData['Address 2'],
                ShipTo_customer_addr_3: shipToData['Address 3'],
                ShipTo_customer_addr_4: shipToData['Address 4'],
                ShipTo_customer_state: shipToData['State'],
                ShipTo_customer_country: shipToData['Country'],
                ShipTo_customer_mobile_no: shipToData['Mobile No'],
                ShipTocustomer_gst_no: shipToData['GST No'],
                ShipTocontact_person: shipToData['Contact Person'],
                delivery_note: datapatch['Delivery Note'] ? datapatch['Delivery Note'] : null,
                dispatched_through: datapatch['Dispatched Through'] ? datapatch['Dispatched Through'] : null,
                note_not_for_sale: datapatch['Note For Sale'] ? datapatch['Note For Sale'] : null,
                destination: datapatch['Destination'] ? datapatch['Destination'] : null,
                transaction_date: transactionDate,
                purchase_amount: TotalPurchase,
                total_amount: TotalBill,
                rounded_off: round_difference,
                transport_charges: Totaltransport,
                pay_type: payType,
                sales_type: salesType,
                created_by: sessionStorage.getItem('selectedUserCode')
            };

            const response = await fetch(`${config.apiBaseUrl}/addDeliveryChallanheader`, {
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

                await saveDcDetails(transaction_no);
                await saveDcDetailsTerms(transaction_no);
                setShowExcelButton(true);
                toast.success("Data Inserted Successfully")
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to insert sales data");
                console.error(errorResponse.details || errorResponse.message);
            }
        } catch (error) {
            console.error("Error inserting data:", error);
            toast.error('Error inserting data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    //CODE TO SAVE PURCHASE DETAILS
    const saveDcDetails = async (transaction_no) => {
        try {
            const validRows = rowData.filter(row =>
                row.productItemCode && row.productItemName && row.purchaseQty > 0
            );

            const customer_code = headerRowData[0].billTo;
            const customer_name = headerRowData[1].billTo;

            for (const row of validRows) {
                const Details = {
                    created_by: sessionStorage.getItem('selectedUserCode'),
                    company_code: sessionStorage.getItem('selectedCompanyCode'),
                    transaction_no: transaction_no,
                    transaction_date: transactionDate,
                    code: row.productItemCode,
                    name: row.productItemName,
                    Description: row.productDescription,
                    type: row.type,
                    customer_code,
                    customer_name,
                    pay_type: payType,
                    sales_type: salesType,
                    hsn_code: row.HSNCode,
                    transport_charges: Totaltransport,
                    bill_qty: Number(row.purchaseQty),
                    unit_price: Number(row.unitPrice),
                    bill_rate: Number(row.TotalItemAmount),
                    SNo: Number(row.serialNumber)
                };

                const response = await fetch(`${config.apiBaseUrl}/addDeliveryChallandetail`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(Details),
                });

                if (response.ok) {
                    console.log("Dc Detail Data inserted successfully");
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

    const saveDcDetailsTerms = async (transaction_no) => {
        try {

            const validRows = rowDataTerms.filter(row => row.Terms_conditions.trim() !== '');

            for (const row of validRows) {
                const Details = {
                    created_by: sessionStorage.getItem('selectedUserCode'),
                    company_code: sessionStorage.getItem('selectedCompanyCode'),
                    transaction_no: transaction_no,
                    Terms_conditions: row.Terms_conditions,
                };

                try {
                    const response = await fetch(`${config.apiBaseUrl}/DCTermsandConditions`, {
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


    const PrintHeaderData = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/deliverychallanhdrprint`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: new_running_no.toString() })
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
            const response = await fetch(`${config.apiBaseUrl}/deliverychallandetprint`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: new_running_no.toString() })
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

    const openPrintWindow = (url, headerKey, detailKey) => {
        const printWindow = window.open(url, '_blank');

        if (printWindow) {
            printWindow.addEventListener("beforeunload", () => {
                sessionStorage.removeItem(headerKey);
                sessionStorage.removeItem(detailKey);
                console.log("Session storage cleared after print window closed.");
            });
        }
    };


    const generateReport = async () => {
        if (!new_running_no) {
            setDeleteError(" ");
            toast.warning('Error: Missing required fields');
            return;
        }
        setLoading(true);
        try {
            const headerData = await PrintHeaderData();
            const detailData = await PrintDetailData();

            if (headerData && detailData) {
                console.log("All API calls completed successfully");

                let url, headerKey, detailKey;

                headerKey = 'DcheaderData';
                detailKey = 'DcdetailData';
                url = '/DCPrint';

                sessionStorage.setItem(headerKey, LZString.compress(JSON.stringify(headerData)));
                sessionStorage.setItem(detailKey, LZString.compress(JSON.stringify(detailData)));

                openPrintWindow(url, headerKey, detailKey);
                // window.open('/DCPrint', '_blank');
            } else {
                console.log("Failed to fetch some data");
                toast.warning('Reference Number Does Not Exits');
            }
        } catch (error) {
            console.error("Error executing API calls:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleItem = async (selectedData) => {
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
                existingItemWithSameCode.Hsn = item.Hsn;
                existingItemWithSameCode.baseuom = item.baseuom;
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
                    Hsn: item.Hsn,
                    baseuom: item.baseuom
                };
                updatedRowDataCopy.push(newRow);
                return true;
            }
        });

        setRowData(updatedRowDataCopy);
        return true;
    };

    //code for ag grid clicked to get rowIndex
    const handleRowClicked = (event) => {
        const clickedRowIndex = event.rowIndex;
        setClickedRowIndex(clickedRowIndex)
    };

    const handleTransactionDateChange = (e) => {
        const date = e.target.value;
        if (date >= financialYearStart && date <= financialYearEnd) {
            setTransactionDate(date);
        } else {
            toast.warning('Transaction date must be between April 1st, 2024 and March 31st, 2025.');
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
        setNew_running_no(refNo);
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
        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/getDeliveryChallan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") }) // Send company_no and company_name as search criteria
            });
            if (response.ok) {
                const searchData = await response.json();
                setButtonsVisible(false);
                setShowExcelButton(true);
                setShowUpdateButton(true);
                setShowAsterisk(true);
                if (searchData.Header && searchData.Header.length > 0) {
                    const item = searchData.Header[0];
                    setTotalBill(item.total_amount.toFixed(2));
                    setNew_running_no(item.transaction_no);
                    setRoundDifference(parseFloat(item.rounded_off).toFixed(2));
                    setTotalTransport(parseFloat(item.transport_charges).toFixed(2));
                    setTransactionDate(formatDate(item.transaction_date));
                    setTotalPurchase(parseFloat(item.purchase_amount).toFixed(2));

                    const selectedPayType = filteredOptionPay.find(option => option.value === item.pay_type);
                    setSelectedPay(selectedPayType);
                    setPayType(selectedPayType.value);

                    const selectedSalesType = filteredOptionSales.find(option => option.value === item.sales_type);
                    setSelectedSales(selectedSalesType);
                    setSalesType(selectedSalesType.value);

                    setHeaderRowData([
                        { fieldName: 'Customer Code', billTo: item.bill_to_customer_code, shipTo: item.Ship_to_customer_code },
                        { fieldName: 'Customer Name', billTo: item.customer_name, shipTo: item.ShipTo_customer_name },
                        { fieldName: 'Address 1', billTo: item.customer_addr_1, shipTo: item.ShipTo_customer_addr_1 },
                        { fieldName: 'Address 2', billTo: item.customer_addr_2, shipTo: item.ShipTocustomer_addr_2 },
                        { fieldName: 'Address 3', billTo: item.customer_addr_3, shipTo: item.ShipTocustomer_addr_3 },
                        { fieldName: 'Address 4', billTo: item.customer_addr_4, shipTo: item.ShipTocustomer_addr_4 },
                        { fieldName: 'State', billTo: item.customer_state, shipTo: item.ShipTocustomer_state },
                        { fieldName: 'Country', billTo: item.customer_country, shipTo: item.ShipTocustomer_country },
                        { fieldName: 'Mobile No', billTo: item.customer_mobile_no, shipTo: item.ShipTocustomer_mobile_no },
                        { fieldName: 'GST No', billTo: item.customer_gst_no, shipTo: item.ShipTocustomer_gst_no },
                        { fieldName: 'Contact Person', billTo: item.contact_person, shipTo: item.ShipTocontact_person }
                    ]);

                    setrowdatapatch([
                        { fieldName: 'Delivery Note', Notes: item.delivery_note },
                        { fieldName: 'Dispatched Through', Notes: item.dispatched_through },
                        { fieldName: 'Destination', Notes: item.Destination },
                        { fieldName: 'Note For Sale', Notes: item.note_not_for_sale }

                    ]);
                }
                else {
                    console.log("Header Data is empty or not found");
                    setNew_running_no('');
                    setRoundDifference('');
                    setTransactionDate('');
                    setTotalPurchase('');
                    setTotalBill("");
                }

                if (searchData.Detail && searchData.Detail.length > 0) {
                    const updatedRowData = searchData.Detail.map(item => {

                        // setTotalTransport(item.transport_charges)
                        return {
                            serialNumber: item.SNo,
                            productItemCode: item.code,
                            productItemName: item.name,
                            productDescription: item.Description,
                            HSNCode: item.hsn_code,
                            purchaseQty: item.bill_qty,
                            unitPrice: item.unit_price,
                            type: item.type,
                            TotalItemAmount: parseFloat(item.bill_rate).toFixed(2)
                        };
                    });

                    setRowData(updatedRowData);

                }

                if (searchData.Terms && searchData.Terms.length > 0) {
                    const updatedRowData = searchData.Terms.map(item => {

                        return {
                            Terms_conditions: item.Terms_conditions,

                        };
                    });
                    setrowDataTerms(updatedRowData);
                }
                else {
                    console.log("Detail Data is empty or not found");
                    setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', search: '', unitWeight: 0, warehouse: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }])
                }
                console.log("data fetched successfully")
            } else if (response.status === 404) {
                toast.warning('Data not found');

                setNew_running_no("")
                setNew_running_no("");
                setTransactionDate("");
                setTotalPurchase("");
                setTotalTransport("");
                setRoundDifference("");
                setTotalBill("")
                setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', search: '', unitWeight: 0, warehouse: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }])
            } else {
                const errorResponse = await response.json();
                console.error(errorResponse.message);
                toast.warning(errorResponse.message || "Error");
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHeader = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/DCdeletehdrData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    transaction_no: new_running_no,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    modified_by: sessionStorage.getItem("selectedUserCode")
                })
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

    const handleDeleteDetail = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/DCdeletedetData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    transaction_no: new_running_no.toString(),
                    company_code: sessionStorage.getItem("selectedCompanyCode")
                })
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

    const handleDeleteTerms = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/DCTermsandConditionsDelete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    transaction_no: new_running_no.toString(),
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
        if (!new_running_no) {
            setDeleteError(" ");
            toast.warning("Error: Missing required fields");
            return;
        }

        showConfirmationToast(
            "Are you sure you want to delete the data?",
            async () => {
                setLoading(true);
                try {
                    const termsResult = await handleDeleteTerms();
                    const detailResult = await handleDeleteDetail();
                    const headerResult = await handleDeleteHeader();

                    if (headerResult === true && detailResult === true && termsResult === true) {
                        console.log("Data Deleted Successfully");
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
                                    : "Failed to delete terms and conditions.";

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

        const financialYearStartDate = new Date(startYear, 3, 1).toISOString().split('T')[0]; // April 1
        const financialYearEndDate = new Date(endYear, 2, 31).toISOString().split('T')[0]; // March 31

        setFinancialYearStart(financialYearStartDate);
        setFinancialYearEnd(financialYearEndDate);
    }, []);


    const handleExcelDownload = () => {
        const filteredRowData = rowData.filter(row => row.purchaseQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0);
        const headerData = [{
            company_code: sessionStorage.getItem('selectedCompanyCode'),

            'Bill to customer code': headerRowData[0].billTo,
            'Bill to customer name': headerRowData[1].billTo,
            'Bill to customer address 1': headerRowData[2].billTo,
            'Bill to customer address 2': headerRowData[3].billTo,
            'Bill to customer address 3': headerRowData[4].billTo,
            'Bill to customer address 4': headerRowData[5].billTo,
            'Bill to customer state': headerRowData[6].billTo,
            'Bill to customer country': headerRowData[7].billTo,
            'Bill to customer mobile no': headerRowData[8].billTo,
            'Bill to customer GST No': headerRowData[9].billTo,
            'Bill to customer contact person': headerRowData[10].billTo,

            'Ship to customer code': headerRowData[0].shipTo,
            'Ship to customer name': headerRowData[1].shipTo,
            'Ship to customer address 1': headerRowData[2].shipTo,
            'Ship to customer address 2': headerRowData[3].shipTo,
            'Ship to customer address 3': headerRowData[4].shipTo,
            'Ship to customer address 4': headerRowData[5].shipTo,
            'Ship to customer state': headerRowData[6].shipTo,
            'Ship to customer country': headerRowData[7].shipTo,
            'Ship to customer mobile no': headerRowData[8].shipTo,
            'Ship to customer GST No': headerRowData[9].shipTo,
            'Ship to customer contact person': headerRowData[10].shipTo,
            "Transaction No": new_running_no,
            "Transaction Date": transactionDate,
            "Purchase Amount": TotalPurchase,
            "Transport Charges": Totaltransport,
            "Total Amount": TotalBill,
            "Rounded Off": round_difference,
        }];

        const headerSheet = XLSX.utils.json_to_sheet(headerData);
        const rowDataSheet = XLSX.utils.json_to_sheet(filteredRowData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
        XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Delivery Challan Details");

        XLSX.writeFile(workbook, "Delivery_Challan.xlsx");
    };

    const handleDcData = async (data) => {
        if (data && data.length > 0) {
            setButtonsVisible(false);
            setShowUpdateButton(true)
            setShowExcelButton(true);
            setShowAsterisk(true);
            const [{ TransactionNo, TransactionDate, bill_to_customer_code, CustomerName, CustomerAddr1, CustomerAddr2, CustomerAddr3, CustomerAddr4, CustomerState, CustomerCountry,
                ContactPerson, ContactMobileNo, Ship_to_customer_code, ShipToCustomerName, ShipToCustomerAddr1, ShipToCustomerAddr2, ShipToCustomerAddr3, ShipToCustomerAddr4, ShipToCustomerState, ShipToCustomerCountry,
                ShipToContactPerson, SalesType, PayType, ShipToContactMobileNo, PurchaseAmount, RoundOff, Transport_charges, TotalAmount, GSTNo, ShipTo_GSTNo, Dispatched_through, destination, Delivery_note, Note_not_for_sale }] = data;

            const transactionNumber = document.getElementById('RefNo');
            if (transactionNumber) {
                transactionNumber.value = TransactionNo;
                setNew_running_no(TransactionNo);
            } else {
                console.error('transactionNumber element not found');
            }

            const transactiondate = document.getElementById('transactionDate');
            if (transactiondate) {
                transactiondate.value = TransactionDate;
                setTransactionDate(formatDate(TransactionDate));  // You can choose to use formattedDate instead if required
            } else {
                console.error('entry element not found');
            }

            const totalPurchaseAmount = document.getElementById('totalPurchaseAmount');
            if (totalPurchaseAmount) {
                totalPurchaseAmount.value = PurchaseAmount;
                setTotalPurchase(formatToTwoDecimalPoints(PurchaseAmount));
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

            const transport = document.getElementById('transport');
            if (transport) {
                transport.value = Transport_charges;
                setTotalTransport(formatToTwoDecimalPoints(Transport_charges));
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

            const paytype = document.getElementById('payType');
            if (paytype) {
                const selectedPay = filteredOptionPay.find(option => option.value === PayType);
                setSelectedPay(selectedPay);
                setPayType(selectedPay.value);
            } else {
                console.error('entry element not found');
            }

            const salestype = document.getElementById('salesType');
            if (salestype) {
                const selectedSales = filteredOptionSales.find(option => option.value === SalesType);
                setSelectedSales(selectedSales);
                setSalesType(selectedSales.value);
            } else {
                console.error('entry element not found');
            }


            await DcDetailView(TransactionNo);

            console.log(bill_to_customer_code, Ship_to_customer_code)

            setHeaderRowData([
                { fieldName: 'Customer Code', billTo: bill_to_customer_code, shipTo: Ship_to_customer_code },
                { fieldName: 'Customer Name', billTo: CustomerName, shipTo: ShipToCustomerName },
                { fieldName: 'Address 1', billTo: CustomerAddr1, shipTo: ShipToCustomerAddr1 },
                { fieldName: 'Address 2', billTo: CustomerAddr2, shipTo: ShipToCustomerAddr2 },
                { fieldName: 'Address 3', billTo: CustomerAddr3, shipTo: ShipToCustomerAddr3 },
                { fieldName: 'Address 4', billTo: CustomerAddr4, shipTo: ShipToCustomerAddr4 },
                { fieldName: 'State', billTo: CustomerState, shipTo: ShipToCustomerState },
                { fieldName: 'Country', billTo: CustomerCountry, shipTo: ShipToCustomerCountry },
                { fieldName: 'Mobile No', billTo: ContactMobileNo, shipTo: ShipToContactMobileNo },
                { fieldName: 'GST No', billTo: GSTNo, shipTo: ShipTo_GSTNo },
                { fieldName: 'Contact Person', billTo: ContactPerson, shipTo: ShipToContactPerson }
            ]);


            setrowdatapatch([
                { fieldName: 'Delivery Note', Notes: Dispatched_through },
                { fieldName: 'Dispatched Through', Notes: destination },
                { fieldName: 'Destination', Notes: Delivery_note },
                { fieldName: 'Note For Sale', Notes: Note_not_for_sale }

            ]);


        } else {
            console.log("Data not fetched...!");
        }
        console.log(data);
    };

    const DcDetailView = async (TransactionNo) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/getDcDetailView`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ transaction_no: TransactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
            });

            if (response.ok) {
                const searchData = await response.json();
                console.log(searchData)

                const newRowData = [];
                searchData.forEach(item => {
                    const {
                        Description,
                        SNo,
                        bill_qty,
                        bill_rate,
                        code,
                        hsn_code,
                        name,
                        type,
                        unit_price
                    } = item;

                    newRowData.push({
                        serialNumber: SNo,
                        productItemCode: code,
                        productItemName: name,
                        HSNCode: hsn_code,
                        purchaseQty: bill_qty,
                        unitPrice: unit_price,
                        type: type,
                        productDescription: Description,
                        TotalItemAmount: parseFloat(bill_rate).toFixed(2),
                    });

                });

                await TermsDcDetailView(TransactionNo);

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

    const TermsDcDetailView = async (TransactionNo) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/gettermsdc`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ transaction_no: TransactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
            });

            if (response.ok) {
                const searchData = await response.json();
                console.log(searchData)

                const newRowData = [];
                searchData.forEach(item => {
                    const { Terms_conditions } = item;
                    newRowData.push({ Terms_conditions: Terms_conditions });
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

    const BalanceAmountCalculation = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/taxInvoiceBalanceAmountCalculation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ TotalAmount: parseFloat(TotalPurchase), AdvanceAmount: parseFloat(Totaltransport) }),
            });
            if (response.ok) {
                const data = await response.json();
                const [{ Balance_Amount }] = data;
                setTotalBill(formatToTwoDecimalPoints(Balance_Amount))
            } else {
                const errorMessage = await response.text();
                console.error(`Server responded with error: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        if (Totaltransport) { // Runs only if Totaltransport is truthy
            BalanceAmountCalculation();
        }
    }, [TotalPurchase, Totaltransport]);

    useEffect(() => {
        const company_code = sessionStorage.getItem('selectedCompanyCode');
        fetch(`${config.apiBaseUrl}/salestype`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code })
        })
            .then((response) => response.json())
            .then((data) => {
                setSalesdrop(data);
                const defaultInvoice = data.find((item) => item.attributedetails_name === "LocalSales") || data[0];
                if (defaultInvoice) {
                    setSelectedSales({
                        value: defaultInvoice.attributedetails_name,
                        label: defaultInvoice.attributedetails_name,
                    });
                    setSalesType(defaultInvoice.attributedetails_name);
                }
            })
            .catch((error) => console.error("Error fetching sales types:", error));


        fetch(`${config.apiBaseUrl}/paytype`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code })
        })

            .then((response) => response.json())
            .then((data) => {
                setPaydrop(data);
                const defaultInvoice = data.find((item) => item.attributedetails_name === "Credit") || data[0];
                if (defaultInvoice) {
                    setSelectedPay({
                        value: defaultInvoice.attributedetails_name,
                        label: defaultInvoice.attributedetails_name,
                    });
                    setPayType(defaultInvoice.attributedetails_name);
                }
            })
            .catch((error) => console.error("Error fetching payment types:", error));

        fetch(`${config.apiBaseUrl}/getItem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ company_code })
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
            })
            .catch((error) => console.error("Error fetching item types:", error));
    }, []);

    const filteredOptionPay = paydrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const filteredOptionSales = salesdrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const filteredOptionProduct = productDrop.map((option) => ({
        value: option.attributedetails_name,
        label: option.attributedetails_name,
    }));

    const handleChangePay = (selectedOption) => {
        setSelectedPay(selectedOption);
        setPayType(selectedOption ? selectedOption.value : '');
    };

    const handleChangeSales = (selectedOption) => {
        setSelectedSales(selectedOption);
        setSalesType(selectedOption ? selectedOption.value : '');
    };

    const handleChangecode = (selectedOption) => {
        setSelectedProduct(selectedOption);
        setProduct(selectedOption ? selectedOption.value : '');
        fetchCodes(selectedOption.value);
    };

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

    const handleItemCode = async (selectedOption) => {
        const code = selectedOption ? selectedOption.value : null;
        const filter = selectedProduct ? selectedProduct.value : null;
        if (!salesType) {
            toast.warning("Please select the sales type.");
            return;
        }
        try {
            const response = await fetch(`${config.apiBaseUrl}/getCodeSalesDatatest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: code,
                    sales_type: salesType,
                    filter: filter,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                }),
            });
            if (response.ok) {
                const searchData = await response.json();
                const lastSerialNumber = rowData.length > 0 ? rowData[rowData.length - 1].serialNumber : 0;
                const updatedSerialNo = lastSerialNumber + 1;
                const newRows = searchData.map((matchedItem) => ({
                    serialNumber: updatedSerialNo,
                    productItemCode: matchedItem.Code,
                    productItemName: matchedItem.name,
                    productDescription: matchedItem.HeaderDescription,
                    HSNCode: matchedItem.hsn,
                    type: selectedProduct ? selectedProduct.value : '',
                    unitPrice: matchedItem.price,
                    taxType: matchedItem.tax_type,
                    taxDetail: matchedItem.combined_tax_details,
                    taxPercentage: matchedItem.combined_tax_percent,
                    keyField: `${updatedSerialNo}-${matchedItem.code || ''}`,
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

    const currentDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        setTransactionDate(currentDate);
    }, [currentDate]);

    // const handleDateChange = (e) => {
    //     const selectedDate = e.target.value;

    //     if (selectedDate !== currentDate) {
    //         toast.warning("The date cannot be changed.");
    //         setTransactionDate(currentDate);
    //     }
    // };

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;

        if (selectedDate >= financialYearStart && selectedDate <= financialYearEnd) {
            if (selectedDate !== currentDate) {
                console.log("Date has been changed.");
            }
            setTransactionDate(selectedDate);
        } else {
            toast.warning('Transaction date must be between April 1st, 2024 and March 31st, 2025.');
        }
    };

    //Deleted Screen functionality
    const [deletedRowData, setDeletedRowData] = useState([]);
    const [deletedRowDataTerms, setDeletedRowDataTerms] = useState([]);
    const [transactionNo, setTransactionNo] = useState("");
    const [Transactiondate, setTransactiondate] = useState("");
    const [PayType, setPaytype] = useState("");
    const [SalesType, setSalestype] = useState("");
    const [Total, setTotal] = useState("");
    const [Transport, setTransport] = useState("");
    const [RoundOff, setRoundOff] = useState("");
    const [GrandTotal, setGrandTotal] = useState("");

    const deletedColumnHeader = [
        { headerName: 'Details', field: 'fieldName', maxWidth: 240, editable: false },
        {
            headerName: 'Bill To',
            field: 'deletedBillTo',
            editable: false,
        },
        {
            headerName: 'Ship To',
            field: 'deletedShipTo',
            editable: false,
        }
    ];

    const [deletedHeaderRowData, setDeletedHeaderRowData] = useState([
        { fieldName: 'Customer Code', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'Customer Name', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'Address 1', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'Address 2', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'Address 3', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'Address 4', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'State', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'Country', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'Mobile No', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'GST No', deletedBillTo: '', deletedShipTo: '' },
        { fieldName: 'Contact Person', deletedBillTo: '', deletedShipTo: '' },
    ]);


    const [deleterowdatapatch, setdeleterowdatapatch] = useState([
        { fieldName: 'Delivery Note', deleteNotes: '' },
        { fieldName: 'Dispatched Through', deleteNotes: '' },
        { fieldName: 'Destination', deleteNotes: '' },
        { fieldName: 'Note For Sale', deleteNotes: '' }
    ]);


    const deletecolumnPatch = [
        {
            headerName: 'Details',
            field: 'fieldName',
            editable: false
        },
        {
            headerName: 'Notes',
            field: 'deleteNotes',
            editable: true,
            onCellValueChanged: onCellValueChangedBillTo,
            cellEditorParams: {
                maxLength: 250
            },
        }
    ];


    const deletedColumnDefs = [
        {
            headerName: 'S.No',
            field: 'deletedSerialNumber',
            maxWidth: 80,
            sortable: false
        },
        {
            headerName: 'Item Code',
            field: 'deletedProductItemCode',
            editable: false,
            filter: true,
            cellEditorParams: {
                maxLength: 18,
            },
            sortable: false,
        },
        {
            headerName: 'Item Name',
            field: 'deletedProductItemName',
            editable: false,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Product Description',
            field: 'deletedProductDescription',
            editable: false,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'HSN/SAC',
            field: 'deletedHSNCode',
            editable: false,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Qty',
            field: 'deletedPurchaseQty',
            editable: false,
            filter: true,
        },
        {
            headerName: 'Price',
            field: 'deletedUnitPrice',
            editable: false,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Type',
            field: 'deletedType',
            editable: false,
            filter: true,
            sortable: false,
        },
        {
            headerName: 'Total',
            field: 'deletedTotalItemAmount',
            editable: false,
            filter: true,
            sortable: false,
        }
    ];

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
            maxLength: 250,
            maxHeight: 50,
            sortable: false,
            editable: false,
            flex:true
        },
    ];

    const handleDeletedKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleDeletedTransaction(transactionNo)
        }
    };

    const handleDeletedTransaction = async (code) => {
        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/getDeletedDeliveryChallan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") }) // Send company_no and company_name as search criteria
            });
            if (response.ok) {
                const searchData = await response.json();
                if (searchData.Header && searchData.Header.length > 0) {
                    const item = searchData.Header[0];
                    setGrandTotal(item.total_amount.toFixed(2));
                    setTransactionNo(item.transaction_no);
                    setPaytype(item.pay_type);
                    setSalestype(item.sales_type);
                    setRoundOff(parseFloat(item.rounded_off).toFixed(2));
                    setTransport(parseFloat(item.transport_charges).toFixed(2));
                    setTransactiondate(formatDate(item.transaction_date));
                    setTotal(parseFloat(item.purchase_amount).toFixed(2));

                    setDeletedHeaderRowData([
                        { fieldName: 'Customer Code', deletedBillTo: item.bill_to_customer_code, deletedShipTo: item.Ship_to_customer_code },
                        { fieldName: 'Customer Name', deletedBillTo: item.customer_name, deletedShipTo: item.ShipTo_customer_name },
                        { fieldName: 'Address 1', deletedBillTo: item.customer_addr_1, deletedShipTo: item.ShipTo_customer_addr_1 },
                        { fieldName: 'Address 2', deletedBillTo: item.customer_addr_2, deletedShipTo: item.ShipTocustomer_addr_2 },
                        { fieldName: 'Address 3', deletedBillTo: item.customer_addr_3, deletedShipTo: item.ShipTocustomer_addr_3 },
                        { fieldName: 'Address 4', deletedBillTo: item.customer_addr_4, deletedShipTo: item.ShipTocustomer_addr_4 },
                        { fieldName: 'State', deletedBillTo: item.customer_state, deletedShipTo: item.ShipTocustomer_state },
                        { fieldName: 'Country', deletedBillTo: item.customer_country, deletedShipTo: item.ShipTocustomer_country },
                        { fieldName: 'Mobile No', deletedBillTo: item.customer_mobile_no, deletedShipTo: item.ShipTocustomer_mobile_no },
                        { fieldName: 'GST No', deletedBillTo: item.customer_gst_no, deletedShipTo: item.ShipTocustomer_gst_no },
                        { fieldName: 'Contact Person', deletedBillTo: item.contact_person, deletedShipTo: item.ShipTocontact_person }
                    ]);

                    setdeleterowdatapatch([
                        { fieldName: 'Delivery Note', deleteNotes: item.delivery_note },
                        { fieldName: 'Dispatched Through', deleteNotes: item.dispatched_through },
                        { fieldName: 'Destination', deleteNotes: item.Destination },
                        { fieldName: 'Note For Sale', deleteNotes: item.note_not_for_sale },
                    ]);

                }
                else {
                    console.log("Header Data is empty or not found");
                    setTransactionNo('');
                    setGrandTotal('');
                    setPaytype('');
                    setSalestype('');
                    setRoundOff("");
                    setTransport("");
                    setTransactiondate("");
                    setTotal("");
                }

                if (searchData.Detail && searchData.Detail.length > 0) {
                    const updatedRowData = searchData.Detail.map(item => {
                        setTransport(item.transport_charges)
                        return {
                            deletedSerialNumber: item.SNo,
                            deletedProductItemCode: item.code,
                            deletedProductItemName: item.name,
                            deletedProductDescription: item.Description,
                            deletedHSNCode: item.hsn_code,
                            deletedPurchaseQty: item.bill_qty,
                            deletedUnitPrice: item.unit_price,
                            deletedType: item.type,
                            deletedTotalItemAmount: parseFloat(item.bill_rate).toFixed(2)
                        };
                    });
                    setDeletedRowData(updatedRowData);
                }
                if (searchData.Terms && searchData.Terms.length > 0) {
                    const updatedRowData = searchData.Terms.map(item => {
                        return {
                            deletedTermsConditions: item.Terms_conditions,
                        };
                    });
                    setDeletedRowDataTerms(updatedRowData);
                }
                else {
                    console.log("Detail Data is empty or not found");
                    setRowData([])
                }
                console.log("data fetched successfully")
            } else if (response.status === 404) {
                toast.warning('Data not found');
                setTransactionNo('');
                setGrandTotal('');
                setPaytype('');
                setSalestype('');
                setRoundOff("");
                setTransport("");
                setTransactiondate("");
                setTotal("");
                setRowData([])
            } else {
                const errorResponse = await response.json();
                console.error(errorResponse.message);
                toast.warning(errorResponse.message || "Internal Server Error");
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
        } finally {
            setLoading(false);
        }
    };

    const [open4, setOpen4] = React.useState(false);

    const handleDeletedDc = () => {
        setOpen4(true);
    };

    const handleDeletedDcData = async (data) => {
        if (data && data.length > 0) {
            const [{ TransactionNo, GSTNo, ShipTo_GSTNo, TransactionDate, bill_to_customer_code, CustomerName, CustomerAddr1, CustomerAddr2, CustomerAddr3, CustomerAddr4, CustomerState, CustomerCountry,
                ContactPerson, ContactMobileNo, Ship_to_customer_code, ShipToCustomerName, ShipToCustomerAddr1, ShipToCustomerAddr2, ShipToCustomerAddr3, ShipToCustomerAddr4, ShipToCustomerState, ShipToCustomerCountry,
                ShipToContactPerson, SalesType, PayType, ShipToContactMobileNo, PurchaseAmount, RoundOff, Transport_charges, TotalAmount, destination, Note_not_for_sale, Dispatched_through, Delivery_note }] = data;

            const transactionNumber = document.getElementById('transactionNo');
            if (transactionNumber) {
                transactionNumber.value = TransactionNo;
                setTransactionNo(TransactionNo);
            } else {
                console.error('transactionNumber element not found');
            }

            const transactiondate = document.getElementById('Transactiondate');
            if (transactiondate) {
                transactiondate.value = TransactionDate;
                setTransactiondate(formatDate(TransactionDate));
                console.error('entry element not found');
            }

            const total = document.getElementById('Total');
            if (total) {
                total.value = PurchaseAmount;
                setTotal(formatToTwoDecimalPoints(PurchaseAmount));
            } else {
                console.error('PurchaseAmount element not found');
            }

            const grandTotal = document.getElementById('GrandTotal');
            if (grandTotal) {
                grandTotal.value = TotalAmount;
                setGrandTotal(formatToTwoDecimalPoints(TotalAmount));
            } else {
                console.error('TotalAmount element not found');
            }

            const transport = document.getElementById('Transport');
            if (transport) {
                transport.value = Transport_charges;
                setTransport(formatToTwoDecimalPoints(Transport_charges));
            } else {
                console.error('Transport_charges element not found');
            }

            const roundOff = document.getElementById('RoundOff');
            if (roundOff) {
                roundOff.value = RoundOff;
                setRoundOff(RoundOff);
            } else {
                console.error('RoundOff element not found');
            }

            const paytype = document.getElementById('PayType');
            if (paytype) {
                paytype.value = PayType;
                setPaytype(PayType);
            } else {
                console.error('PayType element not found');
            }

            const salestype = document.getElementById('SalesType');
            if (salestype) {
                salestype.value = SalesType;
                setSalestype(SalesType);
            } else {
                console.error('SalesType element not found');
            }

            await deletedDetailView(TransactionNo);

            setDeletedHeaderRowData([
                { fieldName: 'Customer Code', deletedBillTo: bill_to_customer_code, deletedShipTo: Ship_to_customer_code },
                { fieldName: 'Customer Name', deletedBillTo: CustomerName, deletedShipTo: ShipToCustomerName },
                { fieldName: 'Address 1', deletedBillTo: CustomerAddr1, deletedShipTo: ShipToCustomerAddr1 },
                { fieldName: 'Address 2', deletedBillTo: CustomerAddr2, deletedShipTo: ShipToCustomerAddr2 },
                { fieldName: 'Address 3', deletedBillTo: CustomerAddr3, deletedShipTo: ShipToCustomerAddr3 },
                { fieldName: 'Address 4', deletedBillTo: CustomerAddr4, deletedShipTo: ShipToCustomerAddr4 },
                { fieldName: 'State', deletedBillTo: CustomerState, deletedShipTo: ShipToCustomerState },
                { fieldName: 'Country', deletedBillTo: CustomerCountry, deletedShipTo: ShipToCustomerCountry },
                { fieldName: 'Mobile No', deletedBillTo: ContactMobileNo, deletedShipTo: ShipToContactMobileNo },
                { fieldName: 'GST No', deletedBillTo: GSTNo, deletedShipTo: ShipTo_GSTNo },
                { fieldName: 'Contact Person', deletedBillTo: ContactPerson, deletedShipTo: ShipToContactPerson }
            ]);

            setdeleterowdatapatch([
                { fieldName: 'Destination', deleteNotes: destination },
                { fieldName: 'Note For Sale', deleteNotes: Note_not_for_sale },
                { fieldName: 'Dispatched Through', deleteNotes: Dispatched_through },
                { fieldName: 'Delivery Note', deleteNotes: Delivery_note },

            ]);

        } else {
            console.log("Data not fetched...!");
        }
        console.log(data);
    };

    const deletedDetailView = async (TransactionNo) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/getDeletedDcDetailView`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ transaction_no: TransactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
            });

            if (response.ok) {
                const searchData = await response.json();

                const newRowData = [];
                searchData.forEach(item => {
                    const {
                        Description,
                        SNo,
                        bill_qty,
                        bill_rate,
                        code,
                        hsn_code,
                        name,
                        type,
                        unit_price
                    } = item;

                    newRowData.push({
                        deletedSerialNumber: SNo,
                        deletedProductItemCode: code,
                        deletedProductItemName: name,
                        deletedHSNCode: hsn_code,
                        deletedPurchaseQty: bill_qty,
                        deletedUnitPrice: unit_price,
                        deletedType: type,
                        deletedProductDescription: Description,
                        deletedTotalItemAmount: parseFloat(bill_rate).toFixed(2),
                    });
                });

                await deletedTermsConditionsView(TransactionNo);

                setDeletedRowData(newRowData);
            } else if (response.status === 404) {
                console.log("Data not found");
                setDeletedRowData([]);
            } else {
                const errorResponse = await response.json();
                console.error(errorResponse.message);
                toast.warning(errorResponse.message || "Internal Server Error");
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
        }
    };

    const deletedTermsConditionsView = async (TransactionNo) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/getDeletedDcTerms`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ transaction_no: TransactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
            });

            if (response.ok) {
                const searchData = await response.json();
                console.log(searchData)

                const newRowData = [];
                searchData.forEach(item => {
                    const { Terms_conditions } = item;
                    newRowData.push({ deletedTermsConditions: Terms_conditions });
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
                                    <h1 align="left" className="purbut me-5">Delivery Challan</h1>
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
                                    {buttonsVisible && ['add', 'all permission'].some(permission => DcPermission.includes(permission)) && (
                                        <savebutton className="purbut" onClick={handleSaveButtonClick} title='Save' >
                                            <i class="fa-regular fa-floppy-disk"></i>
                                        </savebutton>
                                    )}

                                    {showUpdateButton && ['update', 'all permission'].some(permission => DcPermission.includes(permission)) && (
                                        <savebutton className="purbut" onClick={handleUpdateButtonClick} title='Update' >
                                            <i class="fa-solid fa-floppy-disk"></i>
                                        </savebutton>
                                    )}
                                    {['delete', 'all permission'].some(permission => DcPermission.includes(permission)) && (
                                        <delbutton className="purbut" onClick={handleDeleteButtonClick} title='Delete' >
                                            <i class="fa-solid fa-trash"></i>
                                        </delbutton>
                                    )}
                                    {['all permission', 'view'].some(permission => DcPermission.includes(permission)) && (
                                        <printbutton className="purbut" title="Print" onClick={generateReport} >
                                            <i class="fa-solid fa-file-pdf"></i>
                                        </printbutton>
                                    )}
                                    {showExcelButton && (
                                        <printbutton className="purbut" title='Excel' onClick={handleExcelDownload}>
                                            <i class="fa-solid fa-file-excel"></i>
                                        </printbutton>
                                    )}
                                    <printbutton className="purbut" title='Reload' onClick={handleReload} >
                                        <i class="fa-solid fa-arrow-rotate-right"></i>
                                    </printbutton>
                                </div>
                            </div>
                            <div class="mobileview">
                                <div class="d-flex justify-content-between">
                                    <div className="d-flex justify-content-start">
                                        <h1 align='left' className="h1">Delivery Challan</h1>
                                    </div>
                                    <div class="dropdown mt-1" style={{ paddingLeft: 0 }}>
                                        <button class="btn btn-primary dropdown-toggle p-1 ms-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i class="fa-solid fa-list"></i>
                                        </button>
                                        <ul class="dropdown-menu menu">
                                            {buttonsVisible && (
                                                <li class="iconbutton d-flex justify-content-center text-success">
                                                    {['add', 'all permission'].some(permission => DcPermission.includes(permission)) && (
                                                        <icon class="icon" onClick={handleSaveButtonClick}>
                                                            <i class="fa-regular fa-floppy-disk"></i>
                                                        </icon>
                                                    )}
                                                </li>
                                            )}
                                            <li class="iconbutton  d-flex justify-content-center text-danger">
                                                {['delete', 'all permission'].some(permission => DcPermission.includes(permission)) && (
                                                    <icon class="icon" onClick={handleDeleteButtonClick}>
                                                        <i class="fa-solid fa-trash"></i>
                                                    </icon>
                                                )}
                                            </li>
                                            <li class="iconbutton  d-flex justify-content-center text-warning">
                                                {['all permission', 'view'].some(permission => DcPermission.includes(permission)) && (
                                                    <icon class="icon" onClick={generateReport}>
                                                        <i class="fa-solid fa-file-pdf"></i>
                                                    </icon>
                                                )}
                                            </li>
                                            {showExcelButton && (
                                                <li class="iconbutton  d-flex justify-content-center text-warning">
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
                            <div className="row ms-4 me-3">
                                <div className="col-md-3">
                                    <div className="col-md-12 form-group mb-2">
                                        <label htmlFor="party_code" className={`${deleteError && !new_running_no ? "red" : ""}`}>
                                            Transaction No{showAsterisk && <span className="text-danger">*</span>}
                                        </label>
                                        <div className="exp-form-floating">
                                            <div class="d-flex justify-content-end">
                                                <input
                                                    id="RefNo"
                                                    className="exp-input-field form-control justify-content-start"
                                                    type="text"
                                                    placeholder=""
                                                    required
                                                    value={new_running_no}
                                                    onChange={(e) => setNew_running_no(e.target.value)}
                                                    maxLength={50}
                                                    onKeyPress={handleKeyPressRef}
                                                    autoComplete='off'
                                                    ref={transactionNoRef}
                                                />
                                                <div className='position-absolute mt-1 me-2'>
                                                    <span className="icon searchIcon"
                                                        onClick={handleDc}>
                                                        <i class="fa fa-search"></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 form-group mb-2 " >
                                        <div class="exp-form-floating" >
                                            <label for="" className={`${error && !transactionDate ? 'red' : ''}`}>Transaction Date</label>
                                            {!showAsterisk && <span className="text-danger">*</span>}
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
                                                onChange={handleDateChange}
                                                ref={transactionDateRef}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12 form-group mb-2">
                                        <div className="exp-form-floating">
                                            <label htmlFor="" className={`${error && !payType ? 'red' : ''}`}>Pay Type</label>
                                            {!showAsterisk && <span className="text-danger">*</span>}
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
                                                ref={payTypeRef}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12 form-group mb-2">
                                        <div className="exp-form-floating">
                                            <label htmlFor="" className={`${error && !salesType ? 'red' : ''}`}>Sales Type {!showAsterisk && <span className="text-danger">*</span>}</label>
                                            <Select
                                                id="salesType"
                                                value={selectedSales}
                                                onChange={handleChangeSales}
                                                options={filteredOptionSales}
                                                className="exp-input-field"
                                                placeholder=""
                                                required
                                                data-tip="Please select a sales type"
                                                autoComplete="off"
                                                ref={salesTypeRef}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="ag-theme-alpine" style={{ height: 285, width: "100%" }}>
                                        <AgGridReact
                                            columnDefs={columnDefsTermsConditions}
                                            rowData={rowDataTerms}
                                            defaultColDef={{ editable: true }}
                                            onGridReady={onGridReady}
                                            rowHeight={28}
                                            onRowClicked={handleRowClicked}
                                            onColumnMoved={onColumnMoved}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="ag-theme-alpine" style={{ height: 285, width: "120%" }}>
                                        <AgGridReact
                                            rowData={rowdatapatch}
                                            columnDefs={columnPatch}
                                            defaultColDef={{ flex: 1 }}
                                            rowHeight={28}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='purbut Desktop'>
                                <div class="d-flex justify-content-between ms-3" style={{ marginBlock: "", marginTop: "10px" }} >
                                    <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "22px" }}>
                                        <purButton type="button" onClick={handleSwiftButtonClick} >
                                            Copy
                                        </purButton>
                                    </div>
                                </div>
                            </div>
                            <div className='mobile-only mobileview'>
                                <div class="d-flex justify-content-between " style={{ marginBlock: "", marginTop: "10px" }} >
                                    <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "6px" }}>
                                        <purButton type="button" onClick={handleSwiftButtonClick} >
                                            Copy
                                        </purButton>
                                    </div>
                                </div>
                            </div>
                            <div className="ag-theme-alpine" style={{ height: 360, width: '100%' }}>
                                <AgGridReact
                                    columnDefs={columnHeader}
                                    rowData={headerRowData}
                                    defaultColDef={{ flex: 1 }}
                                    rowHeight={28}
                                />
                            </div>
                        </div>
                        <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4" align="left">
                            <div className='row ms-3 me-3'>
                                <div className="col-md-3 form-group mb-2">
                                    <div class="exp-form-floating">
                                        <label for="" class="exp-form-labels" className="partyName">Total</label>
                                        <input
                                            id="totalPurchaseAmount"
                                            class="exp-input-field form-control input"
                                            type="text"
                                            placeholder=""
                                            required
                                            value={TotalPurchase}
                                            onChange={(e) => setTotalPurchase(e.target.value)}
                                            readOnly
                                            ref={totalRef}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3 form-group mb-2">
                                    <div className="exp-form-floating">
                                        <label htmlFor="transport" className="exp-form-labels partyName">Transport</label>
                                        <input
                                            name="totalTaxAmount"
                                            id="transport"
                                            type="text"
                                            className="exp-input-field form-control input"
                                            placeholder=""
                                            maxLength={18}
                                            required
                                            value={Totaltransport}
                                            autoComplete='off'
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d*$/.test(value)) { // Allow only numeric input
                                                    setTotalTransport(value);

                                                }
                                            }}
                                            ref={transportRef}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3 form-group mb-2">
                                    <div class="exp-form-floating">
                                        <label for="" class="exp-form-labels" className="partyName">Round Off</label>
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
                                            ref={roundAmountRef}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3 form-group mb-2">
                                    <div class="exp-form-floating">
                                        <label for="" class="exp-form-labels" className="partyName">Grand Total</label>
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
                                            ref={grandTotalRef}
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
                                                onChange={handleChangecode}
                                                options={filteredOptionProduct}
                                                className="exp-input-field"
                                                placeholder=""
                                                required

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
                                                onChange={handleItemCode}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/*<div align="" class="d-flex justify-content-end mb-2" style={{ marginRight: "50px" }}>
                        <icon className="popups-btn" type="button" onClick={handleAddRow}>
                            <FontAwesomeIcon icon={faPlus} />
                        </icon>
                        <icon type="button" className="popups-btn" onClick={handleRemoveRow}>
                            <FontAwesomeIcon icon={faMinus} />
                        </icon>
                    </div>*/}
                            <div className="ag-theme-alpine mt-2" style={{ height: 437, width: "100%" }}>
                                <AgGridReact
                                    columnDefs={columnDefs}
                                    rowData={rowData}
                                    defaultColDef={{ editable: true, resizable: true }}
                                    onCellValueChanged={async (event) => {
                                        if (event.colDef.field === 'purchaseQty' || event.colDef.field === 'unitPrice') {
                                            await ItemAmountCalculation(event);
                                        }
                                        // handleCellValueChanged(event);
                                    }}
                                    onGridReady={onGridReady}
                                    onRowClicked={handleRowClicked}
                                    onColumnMoved={onColumnMoved}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <DCItemPopup open={open} handleClose={handleClose} handleItem={handleItem} />
                        <DcPopup open={open1} handleClose={handleClose} handleDcData={handleDcData} />
                        <DcCustomerPopup open={open2} handleClose={handleClose} handleVendor={handleCustomerBillTo} />
                        <DcCustomerPopup open={open3} handleClose={handleClose} handleVendor={handleCustomerShipTo} />
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
                    {loading && <LoadingScreen />}
                    <ToastContainer position="top-right" className="toast-design" theme="colored" />
                    <div>
                        <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
                            <div class="d-flex justify-content-between">
                                <div className="d-flex justify-content-start">
                                    <h1 align="left" className="purbut me-5">Deleted Delivery Challan</h1>
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
                                <div class="d-flex justify-content-between">
                                    <div className="d-flex justify-content-start">
                                        <h1 align='left' className="h1">Delivery Challan</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="shadow-lg p-1 bg-body-tertiary rounded  pt-3 pb-4" align="left">
                            <div className="row ms-4 me-3">
                                <div className="col-md-3">
                                    <div className="col-md-12 form-group mb-2">
                                        <label htmlFor="party_code" className={`${deleteError && !new_running_no ? "red" : ""}`}>
                                            Transaction No{showAsterisk && <span className="text-danger">*</span>}
                                        </label>
                                        <div className="exp-form-floating">
                                            <div class="d-flex justify-content-end">
                                                <input
                                                    id="transactionNo"
                                                    className="exp-input-field form-control justify-content-start"
                                                    type="text"
                                                    placeholder=""
                                                    required
                                                    value={transactionNo}
                                                    maxLength={50}
                                                    onChange={(e) => setTransactionNo(e.target.value)}
                                                    onKeyPress={handleDeletedKeyPress}
                                                    autoComplete='off'
                                                />
                                                <div className='position-absolute mt-1 me-2'>
                                                    <span className="icon searchIcon"
                                                        onClick={handleDeletedDc}>
                                                        <i class="fa fa-search"></i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 form-group mb-2 " >
                                        <div class="exp-form-floating" >
                                            <label for="">Transaction Date</label>
                                            <input
                                                name="transactionDate"
                                                id="Transactiondate"
                                                className="exp-input-field form-control"
                                                type="date"
                                                placeholder=""
                                                required
                                                value={Transactiondate}
                                                onChange={(e) => setTransactiondate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-12 form-group mb-2">
                                        <div className="exp-form-floating">
                                            <label htmlFor="">Pay Type</label>
                                            <div title="Please select a paytype">
                                            <Select
                                                id="PayType"
                                                value={PayType}
                                                onChange={(e) => setPaytype(e.target.value)}
                                                className="exp-input-field form-control"
                                                placeholder=""
                                                required
                                                data-tip="Please select a payment type"
                                                autoComplete="off"
                                            />
                                        </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 form-group mb-2">
                                        <div className="exp-form-floating">
                                            <label htmlFor="">Sales Type </label>
                                            <div title="Please select a sales type">
                                            <Select
                                                id="SalesType"
                                                value={SalesType}
                                                onChange={(e) => setSalestype(e.target.value)}
                                                className="exp-input-field  form-control"
                                                placeholder=""
                                                required
                                                data-tip="Please select a sales type"
                                                autoComplete="off"
                                            /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="ag-theme-alpine" style={{ height: 285, width: "100%" }}>
                                        <AgGridReact
                                            columnDefs={deletedTermsConditions}
                                            rowData={deletedRowDataTerms}
                                            defaultColDef={{ editable: true }}
                                            onGridReady={onGridReady}
                                            rowHeight={28}
                                            onRowClicked={handleRowClicked}
                                            onColumnMoved={onColumnMoved}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="ag-theme-alpine" style={{ height: 285, width: "120%" }}>
                                        <AgGridReact
                                            rowData={deleterowdatapatch}
                                            columnDefs={deletecolumnPatch}
                                            defaultColDef={{ flex: 1 }}
                                            rowHeight={28}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='purbut Desktop'>
                                <div class="d-flex justify-content-between ms-3" style={{ marginBlock: "", marginTop: "10px" }} >
                                    <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "22px" }}>
                                        <purButton type="button" onClick={handleSwiftButtonClick} >
                                            Copy
                                        </purButton>
                                    </div>
                                </div>
                            </div>
                            <div className='mobile-only mobileview'>
                                <div class="d-flex justify-content-between " style={{ marginBlock: "", marginTop: "10px" }} >
                                    <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "6px" }}>
                                        <purButton type="button" onClick={handleSwiftButtonClick} >
                                            Copy
                                        </purButton>
                                    </div>
                                </div>
                            </div>
                            <div className="ag-theme-alpine" style={{ height: 360, width: '100%' }}>
                                <AgGridReact
                                    columnDefs={deletedColumnHeader}
                                    rowData={deletedHeaderRowData}
                                    defaultColDef={{ flex: 1 }}
                                    rowHeight={28}
                                />
                            </div>
                        </div>
                        <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4" align="left">
                            <div className='row ms-3 me-3'>
                                <div className="col-md-3 form-group mb-2">
                                    <div class="exp-form-floating">
                                        <label for="" class="exp-form-labels" className="partyName">Total</label>
                                        <input
                                            id="Total"
                                            class="exp-input-field form-control input"
                                            type="text"
                                            placeholder=""
                                            required
                                            value={Total}
                                            onChange={(e) => setTotal(e.target.value)}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3 form-group mb-2">
                                    <div className="exp-form-floating">
                                        <label htmlFor="transport" className="exp-form-labels partyName">Transport</label>
                                        <input
                                            name="totalTaxAmount"
                                            id="Transport"
                                            type="text"
                                            className="exp-input-field form-control input"
                                            placeholder=""
                                            maxLength={18}
                                            required
                                            value={Transport}
                                            onChange={(e) => setTransport(e.target.value)}
                                            autoComplete='off'
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3 form-group mb-2">
                                    <div class="exp-form-floating">
                                        <label for="" class="exp-form-labels" className="partyName">Round Off</label>
                                        <input
                                            name=""
                                            id="RoundOff"
                                            type="text"
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
                                        <label for="" class="exp-form-labels" className="partyName">Grand Total</label>
                                        <input
                                            name=""
                                            id="GrandTotal"
                                            type="text"
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
                            <div className="ag-theme-alpine mt-2" style={{ height: 437, width: "100%" }}>
                                <AgGridReact
                                    columnDefs={deletedColumnDefs}
                                    rowData={deletedRowData}
                                    defaultColDef={{ editable: true, resizable: true }}
                                    onGridReady={onGridReady}
                                    onRowClicked={handleRowClicked}
                                    onColumnMoved={onColumnMoved}
                                />
                            </div>

                        </div>
                    </div>
                    <div>
                        <DeletedDcOPopup open={open4} handleClose={handleClose} handleDeletedDcData={handleDeletedDcData} />
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

export default DeliveryChallan;