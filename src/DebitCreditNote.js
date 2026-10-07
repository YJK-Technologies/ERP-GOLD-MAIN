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
import Select from 'react-select';
import "./mobile.css";
import PurchaseItemPopup from './PurchaseItemPopup';
import PurchaseWarehousePopup from './PurchaseWarehousePopup';
import PurchasePopup from './PurchasePopup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import labels from './Labels';
import LoadingScreen from './Loading';
import SalesHdrPopup from './SalesPopup'
import PurchaseReturnView from './PurchaseReturnViewPopup';
import SalesRetrunView from './SalesReturnViewPopup';
import DebitCrediNoteHelp from './DebitCreditNotePopup';
import { showConfirmationToast } from './ToastConfirmation';

const config = require('./Apiconfig');

function DebitCreditNote() {

    // Form States
    const [noteNo, setNoteNo] = useState('DN-2026-001');
    const [selectedPartyName, setSelectedPartyName] = useState(null);
    const [partyName, setPartyName] = useState('');
    const [narration, setNarration] = useState('');
    const [refTransactionDate, setRefTransactionDate] = useState('');

    const [rowData, setRowData] = useState([{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', purchaseQty: '', ItemTotalWight: '', purchaseAmt: '', TotalTaxAmount: '', TotalItemAmount: '' }]);
    const [rowDataTax, setRowDataTax] = useState([]);
    const [activeTable, setActiveTable] = useState('myTable');
    const [transactionNumber, setTransactionNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const getTodayDate = () => new Date().toISOString().split('T')[0];
    const [transactionDate, setTransactionDate] = useState(getTodayDate());
    const [total, setTotal] = useState(0);
    const [totalTax, setTotalTax] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [roundDifference, setRoundDifference] = useState(0);
    const [error, setError] = useState(false);

    const [global, setGlobal] = useState(null);
    const [globalItem, setGlobalItem] = useState(null);
    const [saveButtonVisible, setSaveButtonVisible] = useState(true);
    const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
    const [printButtonVisible, setPrintButtonVisible] = useState(false);
    const [delButtonVisible, setDelButtonVisible] = useState(false);
    const [showExcelButton, setShowExcelButton] = useState(false);
    const [financialYearStart, setFinancialYearStart] = useState('');
    const [financialYearEnd, setFinancialYearEnd] = useState('');
    const [screensDrop, setScreensDrop] = useState([]);
    const [selectedscreens, setSelectedscreens] = useState(null);
    const [Screens, setScreens] = useState('Add');

    const [reasonOptions, setReasonOptions] = useState([]);
    const [selectedReason, setSelectedReason] = useState('');
    const [reason, setReason] = useState('');

    const [vendorCodeDrop, setVendorCodeDrop] = useState([]);
    const [customerCodeDrop, setCustomerCodeDrop] = useState([]);

    const [noteTypeDrop, setNoteTypeDrop] = useState([])
    const [selectedNoteType, setSelectedNoteType] = useState('');
    const [noteType, setNoteType] = useState('');

    const [partyTypeDrop, setPartyTypeDrop] = useState([])
    const [selectedPartyType, setSelectedPartyType] = useState('');
    const [partyType, setPartyType] = useState('');

    const [refTypeDrop, setRefTypeDrop] = useState([])
    const [selectedRefType, setSelectedRefType] = useState('');
    const [refType, setRefType] = useState('');

    const [openPurchaseHelp, setOpenPurchaseHelp] = useState(false);
    const [openSalesHelp, setOpenSalesHelp] = useState(false);
    const [openPurchaseReturnHelp, setOpenPurchaseReturnHelp] = useState(false);
    const [openSalesReturnHelp, setOpenSalesReturnHelp] = useState(false);
    const [openDebitCreditNoteHelp, setOpenDebitCreditNoteHelp] = useState(false);

    const [refTransactionNumber, setRefTransactionNumber] = useState('');
    const [keyfield, setKeyfield] = useState('');
    const [keyfieldHeader, setKeyfieldHeader] = useState('');
    const [refNo, setRefNo] = useState('');

    const [additionalData, setAdditionalData] = useState({
        modified_by: '',
        created_by: '',
        modified_date: '',
        created_date: ''
    });

    const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);

    const permissions = JSON.parse(sessionStorage.getItem('permissions')) || [];
    const DebitCreditNotePermission = permissions
        .filter(permission => permission.screen_type === 'DebitCreditNote')
        .map(permission => permission.permission_type.toLowerCase());

    useEffect(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        let startYear = currentMonth >= 4 ? currentYear : currentYear - 1;
        let endYear = currentMonth >= 4 ? currentYear + 1 : currentYear;

        setFinancialYearStart(new Date(startYear, 3, 1).toISOString().split('T')[0]);
        setFinancialYearEnd(new Date(endYear, 2, 31).toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        const companyCode = sessionStorage.getItem("selectedCompanyCode");

        // Vendor
        fetch(`${config.apiBaseUrl}/vendorcode`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                company_code: companyCode
            }),
        })
            .then((res) => res.json())
            .then((data) => setVendorCodeDrop(data))
            .catch((err) =>
                console.error("Error fetching Vendors:", err)
            );

        // Customer
        fetch(`${config.apiBaseUrl}/customerCodeDropdown`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                company_code: companyCode
            }),
        })
            .then((res) => res.json())
            .then((data) => setCustomerCodeDrop(data))
            .catch((err) =>
                console.error("Error fetching Customers:", err)
            );
    }, []);

    useEffect(() => {
        if (!noteType) {
            setReasonOptions([]);
            setSelectedReason(null);
            return;
        }

        const fetchReasonOptions = async () => {
            try {
                const apiPath =
                    noteType === "DN"
                        ? "/getDebiteNote"
                        : noteType === "CN"
                            ? "/getCreditNote"
                            : null;

                if (!apiPath) {
                    setReasonOptions([]);
                    setSelectedReason(null);
                    return;
                }

                const response = await fetch(`${config.apiBaseUrl}${apiPath}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        company_code: sessionStorage.getItem("selectedCompanyCode")
                    })
                });

                const data = await response.json();

                console.log("Reason API Response:", data);

                const options = data.map((item) => ({
                    value: item.attributedetails_name,
                    label: item.attributedetails_name
                }));

                setReasonOptions(options);
                setSelectedReason(null);

            } catch (error) {
                console.error("Error fetching Reason:", error);
                setReasonOptions([]);
                setSelectedReason(null);
            }
        };

        fetchReasonOptions();

    }, [noteType]);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getReferenceType`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode') }),
        })
            .then((res) => res.json())
            .then(setRefTypeDrop)
            .catch((err) => console.error('Error fetching Vendors:', err));
    }, []);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getNoteType`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode")
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setNoteTypeDrop(data);

                if (data.length > 0) {
                    const firstOption = {
                        value: data[0].attributedetails_code,
                        label: data[0].attributedetails_name
                    };

                    setSelectedNoteType(firstOption);
                    setNoteType(firstOption.value);

                    // Set Party Type based on Note Type
                    if (firstOption.value === "DN") {
                        setSelectedPartyType({
                            value: "Vendor",
                            label: "Vendor"
                        });
                        setPartyType("Vendor");
                    }
                    else if (firstOption.value === "CN") {
                        setSelectedPartyType({
                            value: "Customer",
                            label: "Customer"
                        });
                        setPartyType("Customer");
                    }
                }
            })
            .catch((err) => console.error("Error fetching Note Type:", err));
    }, []);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getPartyName`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode")
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setPartyTypeDrop(data);

                if (data.length > 0) {
                    const firstOption = {
                        value: data[0].attributedetails_name,
                        label: data[0].attributedetails_name
                    };

                    setSelectedPartyType(firstOption);
                    setPartyType(firstOption.value);
                }
            })
            .catch((err) => console.error("Error fetching Note Type:", err));
    }, []);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getEvent`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                company_code: sessionStorage.getItem("selectedCompanyCode"),
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                setScreensDrop(data);

                if (data.length > 0) {
                    const firstOption = {
                        value: data[0].attributedetails_code,
                        label: data[0].attributedetails_name,
                    };

                    setSelectedscreens(firstOption);

                    setScreens(
                        firstOption.value === "Add" ? "Add" : "Delete"
                    );
                }
            })
            .catch((error) =>
                console.error("Error fetching events:", error)
            );
    }, []);

    const filteredOptionNoteType = noteTypeDrop.map((opt) => ({ value: opt.attributedetails_code, label: opt.attributedetails_name }));
    const filteredOptionCode =
        partyType === "Vendor"
            ? vendorCodeDrop.map((opt) => ({
                value: opt.vendor_code,
                label: `${opt.vendor_code} - ${opt.vendor_name}`
            }))
            : partyType === "Customer"
                ? customerCodeDrop.map((opt) => ({
                    value: opt.customer_code,
                    label: `${opt.customer_code} - ${opt.customer_name}`
                }))
                : [];
    const filteredOptionScreens = screensDrop.map((opt) => ({ value: opt.attributedetails_name, label: opt.attributedetails_name }));
    const filteredOptionPartyType = partyTypeDrop.map((opt) => ({ value: opt.attributedetails_name, label: opt.attributedetails_name }));
    const filteredOptionRefType = refTypeDrop.map((opt) => ({ value: opt.attributedetails_name, label: opt.attributedetails_name }));

    const handleChangeNoteType = (selectedOption) => {
        setSelectedNoteType(selectedOption);

        const selectedValue = selectedOption?.value || "";
        setNoteType(selectedValue);

        if (selectedValue === "DN") {
            const vendorOption = {
                value: "Vendor",
                label: "Vendor"
            };

            setSelectedPartyType(vendorOption);
            setPartyType("Vendor");
        }
        else if (selectedValue === "CN") {
            const customerOption = {
                value: "Customer",
                label: "Customer"
            };

            setSelectedPartyType(customerOption);
            setPartyType("Customer");
        }
        else {
            setSelectedPartyType(null);
            setPartyType("");
        }
    };

    const handleChangeRefType = (selectedOption) => {
        setSelectedRefType(selectedOption);
        setRefType(selectedOption ? selectedOption.value : "");
    };

    const handleChangeReason = (selectedOption) => {
        setSelectedReason(selectedOption);
        setReason(selectedOption ? selectedOption.value : "");
    };

    const handleChangePartyType = (selectedOption) => {
        setSelectedPartyType(selectedOption);
        setPartyType(selectedOption ? selectedOption.value : "");
    };

    const handleChangeScreens = (selected) => {
        setSelectedscreens(selected);
        setScreens(selected?.value === 'Add' ? 'Add' : 'Delete');
    };

    const handleSearchRefTransaction = () => {
        if (!refType) {
            toast.warning("Please select a Ref. Type first");
            return;
        }

        // Compare normalized value (handling casing variations like 'Purchase', 'PURCHASE', 'Sales', etc.)
        const selectedType = refType.trim().toLowerCase();

        const partyCode = partyName || "";

        if (selectedType === "purchase") {
            setOpenPurchaseHelp(true);
        } else if (selectedType === "sales") {
            setOpenSalesHelp(true);
        } else if (selectedType === "purchase_return") {
            setOpenPurchaseReturnHelp(true);
        } else if (selectedType === "sales_return") {
            setOpenSalesReturnHelp(true);
        } else {
            toast.warning(`No help popup configured for Ref. Type: ${refType}`);
        }
    };

    const formatToTwoDecimalPoints = (number) => {
        return parseFloat(number).toFixed(2);
    };

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return (`${year}-${month}-${day}`);
    };

    const handlePurchaseDataSelect = (selectedData) => {
        if (selectedData && selectedData.length > 0) {
            const item = selectedData[0];
            setRefTransactionNumber(item.TransactionNo);
            // Fetch full transaction details using your existing handleRefNo
            handleRefPurchaseNo(item.TransactionNo);
        }
    };

    const handleRefPurchaseNo = async (code) => {
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
                    // clearFormFields();
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
                setRefTransactionDate(formatDate(item.transaction_date));
                setRefTransactionNumber(item.transaction_no);
                setTotal(formatToTwoDecimalPoints(item.purchase_amount));
                setTotalTax(formatToTwoDecimalPoints(item.tax_amount));
                setTotalAmount(formatToTwoDecimalPoints(item.total_amount));
                setRoundDifference(formatToTwoDecimalPoints(item.rounded_off));
                setKeyfield(item.keyfield);

            } else {
                console.log("Header Data is empty or not found");
                // clearFormFields();
            }

            if (searchData.table2 && searchData.table2.length > 0) {

                const updatedRowData = searchData.table2.map((item) => {
                    const taxDetailsList = searchData.table3.filter(
                        (taxItem) => taxItem.item_code === item.item_code
                    );

                    const taxDetails = taxDetailsList.map((taxItem) => taxItem.tax_name_details).join(",");
                    const taxPer = taxDetailsList.map((taxItem) => taxItem.tax_per).join(",");
                    const taxType = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;

                    return {
                        serialNumber: item.ItemSNo,
                        itemCode: item.item_code,
                        itemName: item.item_name,
                        warehouse: item.warehouse_code,
                        Qty: item.bill_qty,
                        purchaseAmt: item.item_amt,
                        TotalTaxAmount: parseFloat(item.tax_amount).toFixed(2),
                        TotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
                        taxType: taxType || null,
                        taxPer: taxPer || null,
                        taxDetails: taxDetails || null,
                        keyField: `${item.ItemSNo || ''}-${item.item_code || ''}`,
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

    const handlePurchaseReturnDataSelect = (selectedData) => {
        if (selectedData && selectedData.length > 0) {
            const item = selectedData[0];
            setRefTransactionNumber(item.ReturnNo);
            // Fetch full transaction details using your existing handleRefNo
            handleRefPurchaseReturnNo(item.ReturnNo);
        }
    };

    const handleRefPurchaseReturnNo = async (code) => {
        setLoading(true)
        try {
            const response = await fetch(`${config.apiBaseUrl}/getpurchasereturnView`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    toast.warning("Data not found");
                    // clearFormFields();
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
                setRefTransactionNumber(item.return_no);
                setRefTransactionDate(formatDate(item.return_date));
                setRoundDifference(item.rounded_off);
                setTotalAmount(item.purchase_amount_returne);
                setTotal(item.total_amount);
                setTotalTax(item.tax_amount);
                setKeyfield(item.keyfield);
            } else {
                console.log("Table 1 is empty or not found");
                // clearFormFields();
            }

            if (searchData.table2 && searchData.table2.length > 0) {
                const updatedRowData = searchData.table2.map(item => {

                    const taxDetailsList = (searchData.table3 && searchData.table3.length > 0)
                        ? searchData.table3.filter(taxItem => taxItem.item_code === item.item_code)
                        : [];

                    const taxDetails = taxDetailsList.map(taxItem => taxItem.tax_name_details || taxItem.TaxType).join(",");
                    const taxPer = taxDetailsList.map(taxItem => taxItem.tax_per || taxItem.TaxPercentage).join(",");
                    const taxType = taxDetailsList.length > 0 ? (taxDetailsList[0].tax_type || taxDetailsList[0].TaxType) : null;

                    return {
                        serialNumber: item.ItemSNo,
                        itemCode: item.item_code,
                        itemName: item.item_name,
                        warehouse: item.warehouse_code,
                        Qty: item.return_qty,
                        purchaseAmt: item.item_amt,
                        TotalTaxAmount: item.tax_amount,
                        TotalItemAmount: item.bill_rate,
                        taxType: taxType || null,
                        taxPer: taxPer || null,
                        taxDetails: taxDetails || null,
                        keyField: `${item.ItemSNo || ''}-${item.item_code || ''}`,

                    };
                });

                setRowData(updatedRowData);
            } else {
                console.log("Table 2 is empty or not found");
                setRowData([]);
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
                    };
                });

                setRowDataTax(updatedRowDataTax);
            } else {
                console.log("Table 3 is empty or not found");
                setRowDataTax([]);
            }

            console.log("Data fetched successfully");

        } catch (error) {
            console.error("Error fetching search data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSalesDataSelect = (selectedData) => {
        if (selectedData && selectedData.length > 0) {
            const item = selectedData[0];
            setRefTransactionNumber(item.BillNo);
            // Fetch full transaction details using your existing handleRefNo
            handleRefSalesNo(item.BillNo);
        }
    };

    const handleRefSalesNo = async (code) => {
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
                    // clearFormFields();
                    return false;
                } else {
                    const errorResponse = await response.json();
                    toast.error(errorResponse.message || "An error occurred");
                    return false;
                }
            }
            const searchData = await response.json();
            if (searchData.table1 && searchData.table1.length > 0) {
                const item = searchData.table1[0];

                setRefTransactionDate(formatDate(item.bill_date));
                setRefTransactionNumber(item.bill_no);
                setTotalAmount(formatToTwoDecimalPoints(item.bill_amt));
                setRoundDifference(formatToTwoDecimalPoints(item.roff_amt));
                setTotal(formatToTwoDecimalPoints(item.sale_amt));
                setTotalTax(formatToTwoDecimalPoints(item.tax_amount));
                setKeyfield(item.keyfield);

            } else {
                console.log("Header Data is empty or not found");
                // clearFormFields();
                return false;
            }

            if (searchData.table2 && searchData.table2.length > 0) {

                const updatedRowData = searchData.table2.map(item => {
                    const taxDetailsList = searchData.table3.filter(taxItem => taxItem.item_code === item.item_code);

                    const taxDetails = taxDetailsList.map(taxItem => taxItem.tax_name_details).join(",");
                    const taxPer = taxDetailsList.map(taxItem => taxItem.tax_per).join(",");
                    const taxType = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;

                    return {
                        serialNumber: item.ItemSNo,
                        itemCode: item.item_code,
                        itemName: item.item_name,
                        warehouse: item.warehouse_code,
                        Qty: item.bill_qty,
                        itemAmt: item.item_amt,
                        purchaseAmt: item.item_amt,
                        TotalTaxAmount: parseFloat(item.tax_amt).toFixed(2),
                        TotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
                        taxType: taxType || null,
                        taxPer: taxPer || null,
                        taxDetails: taxDetails || null,
                        keyField: `${item.ItemSNo || ''}-${item.item_code || ''}`,
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

            console.log("data fetched successfully");
            return false;
        } catch (error) {
            console.error("Error fetching search data:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSalesReturnDataSelect = (selectedData) => {
        if (selectedData && selectedData.length > 0) {
            const item = selectedData[0];
            setRefTransactionNumber(item.ReturnNo);
            // Fetch full transaction details using your existing handleRefNo
            handleRefSalesReturnNo(item.ReturnNo);
        }
    };

    const handleRefSalesReturnNo = async (code) => {
        setLoading(true);
        try {
            const response = await fetch(`${config.apiBaseUrl}/getSalesreturnView`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode"), }) // Send company_no and company_name as search criteria
            });
            if (response.ok) {
                const searchData = await response.json();
                if (searchData.table1 && searchData.table1.length > 0) {
                    console.log("Table 1 Data:", searchData.table1);
                    const item = searchData.table1[0];
                    setRefTransactionNumber(item.return_no)
                    setRefTransactionDate(formatDate(item.return_date));
                    setTotalAmount(item.bill_amt);
                    setTotalTax(item.tax_amount);
                    setTotal(item.sale_amt);
                    setRoundDifference(item.roff_amt);
                    setKeyfield(item.keyfield);

                } else {
                    console.log("Table 1 is empty or not found");
                }

                if (searchData.table2 && searchData.table2.length > 0) {
                    console.log("Table 2 Data:", searchData.table2);

                    const updatedRowData = searchData.table2.map(item => {
                        // Find all tax details from table3 that correspond to the current item in table2
                        const taxDetailsList = searchData.table3.filter(taxItem => taxItem.item_code === item.item_code);

                        // Extract and join tax types and percentages as comma-separated strings
                        const taxDetails = taxDetailsList.map(taxItem => taxItem.tax_name_details).join(",");
                        const taxPer = taxDetailsList.map(taxItem => taxItem.tax_per).join(",");
                        const taxType = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;


                        return {
                            serialNumber: item.ItemSNo,
                            itemCode: item.item_code,
                            itemName: item.item_name,
                            Qty: item.return_qty,
                            purchaseAmt: item.item_amt,
                            TotalTaxAmount: item.tax_amt,
                            TotalItemAmount: item.return_amt,
                            warehouse: item.warehouse_code,
                            taxType: taxType || null,
                            taxPer: taxPer || null,
                            taxDetails: taxDetails || null,
                            keyField: `${item.ItemSNo || ''}-${item.item_code || ''}`,
                        };
                    });

                    setRowData(updatedRowData);
                } else {
                    console.log("Table 2 is empty or not found");
                }

                if (searchData.table3 && searchData.table3.length > 0) {
                    console.log("Table 3 Data:", searchData.table3);

                    const updatedRowDataTax = searchData.table3.map(item => {
                        return {
                            ItemSNO: item.ItemSNo,
                            TaxSNO: item.TaxSNo,
                            Item_code: item.item_code,
                            TaxType: item.tax_name_details,
                            TaxPercentage: item.tax_per,
                            TaxAmount: item.tax_amt,
                        };
                    });

                    console.log(updatedRowDataTax);
                    setRowDataTax(updatedRowDataTax);
                } else {
                    console.log("Table 3 is empty or not found");
                }

                console.log("data fetched successfully")

            } else if (response.status === 404) {
                toast.warning('Data not found');
                setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', serach: '', unitWeight: 0, warehouse: '', billQty: 0, ItemTotalWight: 0, salesAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
                setRowDataTax([]);
            } else {
                console.log("Bad request"); // Log the message for other errors
            }
        } catch (error) {
            console.error("Error fetching search data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransactionDateChange = (e) => setTransactionDate(e.target.value);
    const handleReload = () => window.location.reload();

    const handleAddRow = () => {
        const serialNumber = rowData.length + 1;
        setRowData([...rowData, { serialNumber, itemCode: '', itemName: '', unitWeight: 0, warehouse: '', purchaseQty: 0, ItemTotalWight: '', purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' }]);
    };

    const handleRemoveRow = () => {
        if (rowData.length > 1) setRowData(rowData.slice(0, -1));
    };

    const handleToggleTable = (table) => setActiveTable(table);

    const handleClickOpen = (params) => {
        setGlobal(params.data.serialNumber);
        setGlobalItem(params.data.itemCode);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false); setOpen1(false);
    };

    const handleOpen = (params) => {
        setGlobal(params.data.serialNumber);
        setGlobalItem(params.data.itemCode);
        setOpen1(true);
    };

    const handleDelete = (params) => {
        const serialNumberToDelete = params.data.serialNumber;
        const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);
        setRowData(updatedRowData.length ? updatedRowData : [{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', purchaseQty: '', ItemTotalWight: '', purchaseAmt: '', TotalTaxAmount: '', TotalItemAmount: '' }]);
    };

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
                        setRowData(prevRowData =>
                            prevRowData.map(row => {
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
                            })
                        );
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
        } finally {
            setLoading(false);
        }
    };

    const handleItem = async (selectedData) => {
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

        const itemDetailsSet = rowData.some(
            (row) => row.itemCode === globalItem && row.itemName
        );

        if (!itemDetailsSet) {
            toast.warning("Please fetch item details first before setting the warehouse.");
            return;
        }

        const updatedRowData = rowData.map(row => {
            if (row.serialNumber === global) {
                const matchedItem = data.find(item => item.id === row.id);

                if (matchedItem) {
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
                    bill_qty: params.data.Qty,
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
                            TaxAmount: item.TaxAmount ?? 0,
                            keyfield: item.keyfield,
                        };
                        updatedRowDataTaxCopy.push(newRow);
                        console.log(newRow);
                    }
                });

                updatedRowDataTaxCopy.sort((a, b) => a.ItemSNO - b.ItemSNO);
                setRowDataTax(updatedRowDataTaxCopy);

                // Check if any row has purchaseQty defined``
                const hasPurchaseQty = updatedRowData.some(row => row.Qty >= 0);

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
                    body: JSON.stringify({
                        Tax_amount: formattedTotalTaxAmounts, Putchase_amount: formattedTotalItemAmounts,
                        company_code: sessionStorage.getItem("selectedCompanyCode")
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    // console.table(data)
                    const [{ rounded_amount, round_difference, TotalPurchase, TotalTax }] = data;
                    setTotalAmount(formatToTwoDecimalPoints(rounded_amount));
                    setRoundDifference(formatToTwoDecimalPoints(round_difference));
                    setTotal(formatToTwoDecimalPoints(TotalPurchase));
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

    const handleDebitCreditNoteHelp = () => setOpenDebitCreditNoteHelp(true);

    // UNTOUCHED AG-GRID COLUMN DEFS
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
            tooltipValueGetter: () => "Delete",
            onCellClicked: handleDelete,
            cellRenderer: () => <FontAwesomeIcon icon="fa-solid fa-trash" style={{ cursor: 'pointer' }} />,
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            sortable: false
        },
        {
            headerName: 'Item Code',
            field: 'itemCode',
            editable: true,
            filter: true,
            cellEditorParams: { maxLength: 18 },
            onCellValueChanged: function (params) {
                handleItemCode(params);
            },
            sortable: false
        },
        {
            headerName: "Item Name",
            field: "itemName",
            editable: false,
            filter: true,
            cellEditorParams: { maxLength: 40 },
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
                                    right: "0px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleClickOpen(params)}
                            >
                                <i className="fa fa-search"></i>
                            </span>
                        )}
                    </div>
                );
            },
        },
        // {
        //     headerName: 'Unit Weight',
        //     field: 'unitWeight',
        //     editable: false,
        //     filter: true,
        //     sortable: false
        // },
        {
            headerName: 'Warehouse',
            field: 'warehouse',
            editable: true,
            filter: true,
            cellEditorParams: { maxLength: 18 },
            onCellValueChanged: function (params) {
                handleWarehouseCode(params);
            },
            sortable: false,
            cellRenderer: (params) => (
                <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%' }}>
                    <div className="flex-grow-1">{params.value}</div>
                    <span className="icon searchIcon" style={{ position: 'absolute', right: '-10px', cursor: 'pointer' }} onClick={() => handleOpen(params)}>
                        <i className="fa fa-search"></i>
                    </span>
                </div>
            )
        },
        {
            headerName: 'Qty',
            field: 'Qty',
            editable: true,
            filter: true,
            sortable: false,
            cellEditorParams: { maxLength: 10 }
        },
        // {
        //     headerName: 'Total Weight',
        //     field: 'ItemTotalWight',
        //     editable: false,
        //     filter: true,
        //     sortable: false
        // },
        {
            headerName: 'Rate',
            field: 'purchaseAmt',
            editable: true,
            filter: true,
            sortable: false,
            cellEditorParams: { maxLength: 18 }
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
        {
            headerName: 'KeyField',
            field: 'keyField',
            editable: false,
            filter: true,
            sortable: false,
            hide: true
        }
    ];

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
            sortable: false,
            editable: false
        },
        {
            headerName: 'Item Code',
            field: 'Item_code',
            sortable: false,
            editable: false
        },
        {
            headerName: 'Tax Type ',
            field: 'TaxType',
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
            hide: true
        }
    ];

    // MAIN SAVE BUTTON CLICK HANDLER
    const handleSaveButtonClick = async () => {
        // 1. Header Field Validation
        if (
            !noteType ||
            !transactionDate ||
            !partyType ||
            !partyName ||
            !refType ||
            !reason ||
            !total ||
            !totalTax ||
            !totalAmount
        ) {
            toast.warning("Error: Missing required fields.");
            setError(true);
            return;
        }

        // 2. Grid Empty Validation
        if (rowData.length === 0 || rowDataTax.length === 0) {
            toast.warning("No item details or tax details found to save.");
            return;
        }

        // 3. Row-level Validation
        const invalidRows = rowData.filter(
            (row) => row.itemCode && (!row.Qty || row.Qty <= 0)
        );
        if (invalidRows.length > 0) {
            toast.warning("Item code is present but Quantity is missing or zero.");
            return;
        }

        const rowsWithQtyNoItemCode = rowData.filter(
            (row) => row.Qty > 0 && (!row.itemCode || row.itemCode.trim() === "")
        );
        if (rowsWithQtyNoItemCode.length > 0) {
            toast.warning("Quantity is entered but Item Code is missing.");
            return;
        }

        const filteredRowData = rowData.filter(
            (row) => row.Qty > 0 && row.purchaseAmt > 0 && row.TotalItemAmount > 0
        );

        const hasNullWarehouse = filteredRowData.some(
            (row) => !row.warehouse || row.warehouse.trim() === ""
        );
        if (hasNullWarehouse) {
            toast.warning("One or more rows have an empty warehouse.");
            return;
        }

        if (filteredRowData.length === 0) {
            toast.warning("Please check Qty, Rate, and Amount values are greater than zero.");
            return;
        }

        setError(false);
        setLoading(true);

        try {
            // 4. Construct Header Data Payload
            const headerPayload = {
                Note_Type: noteType,
                Note_Date: transactionDate,
                Party_Type: partyType,
                Party_ID: partyName,
                Reference_Type: refType,
                Reference_ID: keyfield,
                Reference_Invoice_No: refTransactionNumber,
                Reference_Invoice_Date: refTransactionDate,
                Reason_ID: reason,
                Reference_No: refNo,
                Sub_Total: total,
                Tax_Amount: totalTax,
                Rounded_off: roundDifference,
                Total_Amount: totalAmount,
                Narration: narration,
                company_code: sessionStorage.getItem("selectedCompanyCode"),
                location_code: sessionStorage.getItem("selectedLocationCode") || "LOC01",
                created_by: sessionStorage.getItem("selectedUserCode")
            };

            const response = await fetch(`${config.apiBaseUrl}/Debit_Credit_NoteInsert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(headerPayload)
            });

            if (response.ok) {
                const result = await response.json();

                // Extract generated Keyfield and Note_No from backend response
                const KeyfieldHeader = result.Keyfield;
                const noteNo = result.Note_No;

                setTransactionNumber(noteNo);

                await saveDebitCreditDetails(noteNo, KeyfieldHeader);
                await saveDebitCreditTaxDetails(noteNo, KeyfieldHeader);

                toast.success("Debit/Credit Note saved successfully!");

                // setAuthButtonVisible(false);
                // setDelButtonVisible(true);
                // setPrintButtonVisible(true);
                setShowExcelButton(true);
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to save Header data");
            }
        } catch (error) {
            console.error("Error saving header data:", error);
            toast.error("Error saving data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // 5. SAVE ITEM DETAILS FUNCTION
    const saveDebitCreditDetails = async (noteId, keyfieldHeader) => {
        try {
            const validRows = rowData.filter(
                (row) => row.itemCode && row.itemName && row.Qty > 0
            );

            for (const row of validRows) {
                const detailPayload = {
                    Note_ID: noteId,
                    Item_ID: row.serialNumber,
                    Item_Code: row.itemCode,
                    Item_Name: row.itemName,
                    // UOM_ID: row.uomId,
                    Qty: row.Qty,
                    Rate: row.purchaseAmt,
                    Amount: row.TotalItemAmount,
                    Tax_Amount: row.TotalTaxAmount,
                    Warehouse_ID: row.warehouse,
                    Keyfield_header: keyfieldHeader,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode") || "LOC01",
                    created_by: sessionStorage.getItem("selectedUserCode")
                };

                const response = await fetch(`${config.apiBaseUrl}/Debit_Credit_Note_DetailInsert`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(detailPayload)
                });

                if (!response.ok) {
                    const errorResponse = await response.json();
                    console.error("Detail Insert Error:", errorResponse);
                }
            }
        } catch (error) {
            console.error("Error saving details:", error);
            toast.error("Error saving item details: " + error.message);
        }
    };

    // 6. SAVE TAX DETAILS FUNCTION
    const saveDebitCreditTaxDetails = async (noteId, keyfieldHeader) => {
        try {
            for (const row of rowData) {
                const matchingTaxRows = rowDataTax.filter(
                    (taxRow) => taxRow.Item_code === row.itemCode
                );

                for (const taxRow of matchingTaxRows) {
                    const taxPayload = {
                        Note_ID: noteId,
                        Item_code: row.itemCode,
                        Tax_code: taxRow.TaxType,
                        Tax_percentage: taxRow.TaxPercentage,
                        Tax_amount: taxRow.TaxAmount,
                        Item_SNo: Number(row.serialNumber),
                        Tax_SNo: Number(taxRow.TaxSNO),
                        tax_type: row.taxType,
                        Keyfield_header: keyfieldHeader,
                        company_code: sessionStorage.getItem("selectedCompanyCode"),
                        location_code: sessionStorage.getItem("selectedLocationCode") || "LOC01",
                        created_by: sessionStorage.getItem("selectedUserCode")
                    };

                    const response = await fetch(`${config.apiBaseUrl}/TaxDetailsTableInsert`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(taxPayload)
                    });

                    if (!response.ok) {
                        const errorResponse = await response.json();
                        console.error("Tax Detail Insert Error:", errorResponse);
                    }
                }
            }
        } catch (error) {
            console.error("Error saving tax details:", error);
            toast.error("Error saving tax details: " + error.message);
        }
    };

    const handleTransactionNoKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevents form submission/page refresh on Enter
            if (!transactionNumber || transactionNumber.trim() === "") {
                toast.warning("Please enter a Transaction Number");
                return;
            }
            fetchDebitCreditNoteData(transactionNumber.trim());
        }
    };

    const handleDebitCreditData = (selectedData) => {
        if (selectedData && selectedData.length > 0) {
            const item = selectedData[0];
            setTransactionNumber(item.TransactionNo);
            // Fetch full transaction details using your existing handleRefNo
            fetchDebitCreditNoteData(item.TransactionNo);
        }
    };

    const fetchDebitCreditNoteData = async (code) => {
        if (!code) return;
        setLoading(true);

        try {
            const response = await fetch(`${config.apiBaseUrl}/getDebitCreditNoteData`, {
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
                    toast.warning("Transaction Data not found");
                    setRowData([]);
                    setRowDataTax([]);
                } else {
                    const errorResponse = await response.json();
                    toast.error(errorResponse.message || "An error occurred while fetching data");
                }
                return;
            }

            const searchData = await response.json();
            setShowExcelButton(true);
            setSaveButtonVisible(false);
            setUpdateButtonVisible(true);
            setDelButtonVisible(true);
            setPrintButtonVisible(true);

            // Map Header Data
            if (searchData.header && searchData.header.length > 0) {
                const headerItem = searchData.header[0];

                const matchedNoteTypeOption = filteredOptionNoteType.find(
                    (opt) => opt.value === headerItem.Note_Type
                ) || (headerItem.Note_Type ? { value: headerItem.Note_Type, label: headerItem.Note_Type } : null);

                setSelectedNoteType(matchedNoteTypeOption);
                setNoteType(headerItem.Note_Type || "");

                const partyTypeVal = headerItem.Party_Type || (headerItem.Note_Type === "DN" ? "Vendor" : headerItem.Note_Type === "CN" ? "Customer" : "");
                setSelectedPartyType(partyTypeVal ? { value: partyTypeVal, label: partyTypeVal } : null);
                setPartyType(partyTypeVal);

                const matchedPartyNameOption = filteredOptionCode.find(
                    (opt) => opt.value === headerItem.Party_ID
                ) || (headerItem.Party_ID ? { value: headerItem.Party_ID, label: headerItem.Party_ID } : null);

                setSelectedPartyName(matchedPartyNameOption);
                setPartyName(headerItem.Party_ID || "");

                const matchedRefTypeOption = filteredOptionRefType.find(
                    (opt) => opt.value === headerItem.Reference_Type || opt.label === headerItem.Reference_Type
                ) || (headerItem.Reference_Type ? { value: headerItem.Reference_Type, label: headerItem.Reference_Type } : null);

                setSelectedRefType(matchedRefTypeOption);
                setRefType(headerItem.Reference_Type || "");

                const matchedReasonOption = reasonOptions.find(
                    (opt) => opt.value === headerItem.Reason_ID || opt.label === headerItem.Reason_ID
                ) || (headerItem.Reason_ID ? { value: headerItem.Reason_ID, label: headerItem.Reason_ID } : null);

                setSelectedReason(matchedReasonOption);
                setReason(headerItem.Reason_ID || "");

                setRefTransactionNumber(headerItem.Reference_Invoice_No || "");
                if (headerItem.Reference_Invoice_Date) {
                    setRefTransactionDate(formatDate(headerItem.Reference_Invoice_Date));
                }
                setTotal(formatToTwoDecimalPoints(headerItem.Sub_Total || 0));
                setTotalTax(formatToTwoDecimalPoints(headerItem.Tax_Amount || 0));
                setTotalAmount(formatToTwoDecimalPoints(headerItem.Total_Amount || 0));
                setNarration(headerItem.Narration || "");
                setRefNo(headerItem.Reference_No || "");
                setKeyfieldHeader(headerItem.Keyfield || "");
                setKeyfield(headerItem.Reference_ID || "")
            } else {
                toast.warning("Header details not found");
            }

            // Map Detail/Item Data
            if (searchData.detail && searchData.detail.length > 0) {
                const updatedRowData = searchData.detail.map((item, index) => {
                    const taxDetailsList = (searchData.taxdetail || []).filter(
                        (taxItem) => taxItem.Item_code === item.Item_Code || taxItem.item_code === item.Item_Code
                    );

                    const taxDetails = taxDetailsList.map((t) => t.Tax_code).join(",");
                    const taxPer = taxDetailsList.map((t) => t.tax_per || t.Tax_percentage).join(",");
                    const taxType = taxDetailsList.length > 0 ? taxDetailsList[0].tax_type : null;

                    return {
                        serialNumber: item.Item_ID,
                        itemCode: item.Item_Code,
                        itemName: item.Item_Name,
                        warehouse: item.Warehouse_ID,
                        Qty: item.Qty,
                        purchaseAmt: item.Rate,
                        TotalTaxAmount: parseFloat(item.Tax_Amount || 0).toFixed(2),
                        TotalItemAmount: parseFloat(item.Amount || item.Total_Amount).toFixed(2),
                        taxType: taxType || null,
                        taxPer: taxPer || null,
                        taxDetails: taxDetails || null,
                        keyField: `${index + 1}-${item.Item_Code || ''}`,
                    };
                });

                setRowData(updatedRowData);
            } else {
                setRowData([
                    {
                        serialNumber: 1,
                        itemCode: "",
                        itemName: "",
                        warehouse: "",
                        Qty: 0,
                        purchaseAmt: 0,
                        TotalTaxAmount: 0,
                        TotalItemAmount: 0,
                    },
                ]);
            }

            // Map Tax Details Data
            if (searchData.taxdetail && searchData.taxdetail.length > 0) {
                const updatedRowDataTax = searchData.taxdetail.map((item) => ({
                    ItemSNO: item.Item_SNo,
                    TaxSNO: item.Tax_SNo,
                    Item_code: item.Item_code,
                    TaxType: item.Tax_code,
                    TaxPercentage: item.Tax_percentage,
                    TaxAmount: parseFloat(item.Tax_amount).toFixed(2),
                    TaxName: item.tax_type,
                }));

                setRowDataTax(updatedRowDataTax);
            } else {
                setRowDataTax([]);
            }

        } catch (error) {
            console.error("Error fetching Debit/Credit Note data:", error);
            toast.error(error.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleExcelDownload = () => {
        // 1. Filter valid line items
        const filteredRowData = rowData.filter(
            row => (row.Qty > 0) && (row.TotalItemAmount > 0 || row.purchaseAmt > 0)
        );

        // 2. Filter valid tax details
        const filteredRowDataTax = rowDataTax.filter(
            taxRow => taxRow.TaxAmount > 0 && taxRow.TaxPercentage > 0
        );

        // --- AG Grid Column Header & Hide Mapper Helper Function ---
        const mapDataToHeaders = (dataList, colDefs) => {
            // hide: true இல்லாத மற்றும் headerName காலியாக இல்லாத columns-ஐ மட்டும் filter செய்கிறோம்
            const visibleCols = colDefs.filter(col => !col.hide && col.headerName && col.headerName !== '');

            return dataList.map(row => {
                const mappedRow = {};
                visibleCols.forEach(col => {
                    // key = headerName, value = field value
                    mappedRow[col.headerName] = row[col.field] !== undefined ? row[col.field] : '';
                });
                return mappedRow;
            });
        };

        // 3. Map Row Data using Header Names (Excluding Hidden Columns)
        const formattedItemDetails = mapDataToHeaders(filteredRowData, columnDefs);
        const formattedTaxDetails = mapDataToHeaders(filteredRowDataTax, columnDefsTax);

        // 4. Prepare Debit/Credit Note Header object
        const headerData = [{
            "Note Type": noteType === "DN" ? "Debit Note" : noteType === "CN" ? "Credit Note" : noteType,
            "Party Type": partyType,
            "Party Name": partyName,
            "Reason": reason,
            "Ref Type": refType,
            "Ref Transaction No": refTransactionNumber,
            "Ref Transaction Date": refTransactionDate,
            "Transaction Date": transactionDate,
            "Transaction No": transactionNumber,
            "Narration": narration,
            "Total Amount": total,
            "Total Tax": totalTax,
            "Round Off": roundDifference,
            "Total Bill Amount": totalAmount
        }];

        // 5. Create Header Sheet with Title and Company Name
        const noteTitle = noteType === "DN" ? "Debit Note" : noteType === "CN" ? "Credit Note" : "Debit / Credit Note";

        const headerSheet = XLSX.utils.aoa_to_sheet([
            [noteTitle],
            [`Company Name : ${sessionStorage.getItem("selectedCompanyName") || ""}`],
            [],
        ]);

        // Append header data starting at row A4
        XLSX.utils.sheet_add_json(headerSheet, headerData, {
            origin: "A4",
        });

        // Merge Heading across columns
        headerSheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } },
        ];

        // 6. Convert Formatted Item and Tax Details to Sheets
        const rowDataSheet = XLSX.utils.json_to_sheet(formattedItemDetails);
        const rowDataTaxSheet = XLSX.utils.json_to_sheet(formattedTaxDetails);

        // 7. Auto Column Width Adjustment Function
        const autoFitColumns = (worksheet, data) => {
            if (!data || data.length === 0) return;

            const cols = [];

            data.forEach((row) => {
                Object.keys(row).forEach((key, i) => {
                    const value = row[key] == null ? "" : row[key].toString();

                    cols[i] = Math.max(
                        cols[i] || key.length,
                        key.length,
                        value.length
                    );
                });
            });

            worksheet["!cols"] = cols.map(width => ({
                wch: width + 5,
            }));
        };

        // 8. Apply Column Widths
        autoFitColumns(headerSheet, headerData);
        autoFitColumns(rowDataSheet, formattedItemDetails);
        autoFitColumns(rowDataTaxSheet, formattedTaxDetails);

        // 9. Construct Workbook and Append Sheets
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
        XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Note Details");
        XLSX.utils.book_append_sheet(workbook, rowDataTaxSheet, "Tax Details");

        // 10. Trigger Download
        const fileName = `${noteType === "DN" ? "Debit_Note" : noteType === "CN" ? "Credit_Note" : "Debit_Credit_Note"}_${transactionNumber || "Data"}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleUpdateButtonClick = async () => {
        // 1. Header Field Validation
        if (
            !noteType ||
            !transactionDate ||
            !partyType ||
            !partyName ||
            !refType ||
            !reason ||
            !total ||
            !totalTax ||
            !totalAmount
        ) {
            toast.warning("Error: Missing required fields.");
            setError(true);
            return;
        }

        // 2. Grid Empty Validation
        if (rowData.length === 0 || rowDataTax.length === 0) {
            toast.warning("No item details or tax details found to save.");
            return;
        }

        // 3. Row-level Validation
        const invalidRows = rowData.filter(
            (row) => row.itemCode && (!row.Qty || row.Qty <= 0)
        );
        if (invalidRows.length > 0) {
            toast.warning("Item code is present but Quantity is missing or zero.");
            return;
        }

        const rowsWithQtyNoItemCode = rowData.filter(
            (row) => row.Qty > 0 && (!row.itemCode || row.itemCode.trim() === "")
        );
        if (rowsWithQtyNoItemCode.length > 0) {
            toast.warning("Quantity is entered but Item Code is missing.");
            return;
        }

        const filteredRowData = rowData.filter(
            (row) => row.Qty > 0 && row.purchaseAmt > 0 && row.TotalItemAmount > 0
        );

        const hasNullWarehouse = filteredRowData.some(
            (row) => !row.warehouse || row.warehouse.trim() === ""
        );
        if (hasNullWarehouse) {
            toast.warning("One or more rows have an empty warehouse.");
            return;
        }

        if (filteredRowData.length === 0) {
            toast.warning("Please check Qty, Rate, and Amount values are greater than zero.");
            return;
        }

        setError(false);
        setLoading(true);

        try {
            // 4. Construct Header Data Payload
            const headerPayload = {
                Note_No: transactionNumber,
                Note_Type: noteType,
                Note_Date: transactionDate,
                Party_Type: partyType,
                Party_ID: partyName,
                Reference_Type: refType,
                Reference_ID: keyfield,
                Reference_Invoice_No: refTransactionNumber,
                Reference_Invoice_Date: refTransactionDate,
                Reason_ID: reason,
                Reference_No: refNo,
                Sub_Total: total,
                Tax_Amount: totalTax,
                Rounded_off: roundDifference,
                Total_Amount: totalAmount,
                Narration: narration,
                company_code: sessionStorage.getItem("selectedCompanyCode"),
                location_code: sessionStorage.getItem("selectedLocationCode"),
                modified_by: sessionStorage.getItem("selectedUserCode")
            };

            const response = await fetch(`${config.apiBaseUrl}/Debit_Credit_NoteUpdate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(headerPayload)
            });

            if (response.ok) {
                const result = await response.json();

                await saveDebitCreditDetails(transactionNumber, keyfieldHeader);
                await saveDebitCreditTaxDetails(transactionNumber, keyfieldHeader);

                toast.success("Debit/Credit Note saved successfully!");

                // setAuthButtonVisible(false);
                // setDelButtonVisible(true);
                // setPrintButtonVisible(true);
                setShowExcelButton(true);
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to save Header data");
            }
        } catch (error) {
            console.error("Error saving header data:", error);
            toast.error("Error saving data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // 1. Delete Header Data API
    const handleDeleteHeader = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/Debit_Credit_NoteDelete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Note_No: transactionNumber, // or new_running_no
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode") || ""
                })
            });

            if (response.ok) {
                console.log("Header deleted successfully:", transactionNumber);
                return true;
            } else {
                const errorResponse = await response.json();
                return errorResponse.message || "Failed to delete Header.";
            }
        } catch (error) {
            return "Error deleting Header: " + error.message;
        }
    };

    // 2. Delete Detail Items API
    const handleDeleteDetail = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/Debit_Credit_Note_DetailDelete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Note_ID: transactionNumber,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode") || ""
                })
            });

            if (response.ok) {
                console.log("Detail rows deleted successfully:", transactionNumber);
                return true;
            } else {
                const errorResponse = await response.json();
                return errorResponse.message || "Failed to delete Details.";
            }
        } catch (error) {
            return "Error deleting Details: " + error.message;
        }
    };

    // 3. Delete Tax Details API
    const handleDeleteTaxDetail = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/TaxDetailsTableDelete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    Note_ID: transactionNumber,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode") || ""
                })
            });

            if (response.ok) {
                console.log("Tax Details deleted successfully:", transactionNumber);
                return true;
            } else {
                const errorResponse = await response.json();
                return errorResponse.message || "Failed to delete Tax Details.";
            }
        } catch (error) {
            return "Error deleting Tax Details: " + error.message;
        }
    };

    // Main Delete Trigger Handler
    const handleDeleteButtonClick = async () => {
        if (!transactionNumber) {
            toast.warning('Error: Transaction Number is missing');
            return;
        }

        showConfirmationToast(
            "Are you sure you want to delete this Debit/Credit Note?",
            async () => {
                setLoading(true);
                try {
                    // Delete Tax Details, Details, and Header sequentially/in parallel
                    const taxDetailResult = await handleDeleteTaxDetail();
                    const detailResult = await handleDeleteDetail();
                    const headerResult = await handleDeleteHeader();

                    if (headerResult === true && detailResult === true && taxDetailResult === true) {
                        console.log("All Delete API calls completed successfully");
                        toast.success("Debit/Credit Note Deleted Successfully", {
                            autoClose: 1500,
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
                                        : "An unknown error occurred while deleting.";

                        toast.error(errorMessage);
                    }
                } catch (error) {
                    console.error("Error executing Delete API calls:", error);
                    toast.error(error.message || "An Error occurred while Deleting Data");
                } finally {
                    setLoading(false);
                }
            },
            () => {
                toast.info("Delete cancelled.");
            }
        );
    };

    return (
        <div>
            <div className="container-fluid Topnav-screen">
                {loading && <LoadingScreen />}
                <ToastContainer position="top-right" className="toast-design" theme="colored" />

                {/* ================= HEADER SECTION ================= */}
                <div className="shadow-lg p-2 bg-body-tertiary rounded mb-2 mt-2">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex align-items-center">
                            <h1 className="purbut">Debit / Credit Note</h1>
                        </div>

                        {/* CENTER SECTION: Note Type Dropdown & Note No Label */}
                        <div className="d-flex align-items-center gap-5 my-1">
                            {/* 1. Note Type */}
                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="noteType" className={`${error && !noteType ? 'red' : ''}`}>Note Type<span className="text-danger">*</span></label>
                                <div style={{ minWidth: '180px' }} title="Select Note Type (Debit / Credit)">
                                    <Select
                                        id="noteType"
                                        className="exp-input-field"
                                        placeholder="Select Type"
                                        value={selectedNoteType}
                                        onChange={handleChangeNoteType}
                                        options={filteredOptionNoteType}
                                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                    />
                                </div>
                            </div>

                            {/* 2. Note Date */}
                            <div className="col-md-4 form-group mb-2">
                                <div className="exp-form-floating">
                                    <label htmlFor="transactionDate" className={`${error && !transactionDate ? 'red' : ''}`}>Date<span className="text-danger">*</span></label>
                                    <input
                                        name="transactionDate"
                                        id="transactionDate"
                                        className="exp-input-field form-control"
                                        type="date"
                                        title="Select Note Date"
                                        required
                                        min={financialYearStart}
                                        max={financialYearEnd}
                                        value={transactionDate}
                                        onChange={handleTransactionDateChange}
                                    />
                                </div>
                            </div>

                            <div className="col-md-4 form-group mb-2">
                                <label htmlFor="transactionNumber">Transaction No</label>
                                <div className="exp-form-floating">
                                    <div className="d-flex justify-content-end">
                                        <input
                                            id="transactionNumber"
                                            className="exp-input-field form-control"
                                            type="text"
                                            // placeholder="Enter Transaction ID"
                                            title="Enter Original Transaction Reference Number"
                                            value={transactionNumber}
                                            onChange={(e) => setTransactionNumber(e.target.value)}
                                            onKeyDown={handleTransactionNoKeyDown}
                                            maxLength={50}
                                            autoComplete="off"
                                        />
                                        <div className="position-absolute mt-1 me-2">
                                            <span className="icon searchIcon" title="Search Ref Transaction" onClick={handleDebitCreditNoteHelp}>
                                                <i className="fa fa-search"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="d-flex align-items-center bg-light px-3 py-1" title="Note Document Number">
                                <span className="fw-bold me-2 text-secondary text-nowrap">Note No:</span>
                                <span className="fw-bold text-primary">{noteNo}</span>
                            </div> */}
                        </div>

                        {/* RIGHT SECTION: Screen Selector & Action Buttons */}
                        <div className="d-flex align-items-center gap-2 purbut">
                            {/* 3. Screen Type */}
                            <div className="exp-form-floating" style={{ minWidth: '160px' }} title="Select Screen Action">
                                <Select
                                    id="returnType"
                                    className="exp-input-field"
                                    // placeholder="Select Screen"
                                    value={selectedscreens}
                                    onChange={handleChangeScreens}
                                    options={filteredOptionScreens}
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>

                            {saveButtonVisible && ['add', 'all permission'].some(permission => DebitCreditNotePermission.includes(permission)) && (
                                <addbutton type="button" className="purbut" title="Save Note" onClick={handleSaveButtonClick}>
                                    <i className="fa-regular fa-floppy-disk"></i>
                                </addbutton>
                            )}

                            {updateButtonVisible && ['update', 'all permission'].some(permission => DebitCreditNotePermission.includes(permission)) && (
                                <addbutton type="button" className="purbut" title="Update Note" onClick={handleUpdateButtonClick}>
                                    <i className="fa-solid fa-floppy-disk"></i>
                                </addbutton>
                            )}

                            {delButtonVisible && ['delete', 'all permission'].some(permission => DebitCreditNotePermission.includes(permission)) && (
                                <delbutton type="button" className="purbut" title="Delete Note" onClick={handleDeleteButtonClick}>
                                    <i className="fa-solid fa-trash"></i>
                                </delbutton>
                            )}

                            {printButtonVisible && ['all permission', 'view'].some(permission => DebitCreditNotePermission.includes(permission)) && (
                                <printbutton type="button" className="purbut" title="Print PDF">
                                    <i className="fa-solid fa-file-pdf"></i>
                                </printbutton>
                            )}

                            {showExcelButton && (
                                <printbutton type="button" className="purbut" title="Export Excel" onClick={handleExcelDownload}>
                                    <i className="fa-solid fa-file-excel"></i>
                                </printbutton>
                            )}

                            <printbutton type="button" className="purbut" title="Reload Page" onClick={handleReload}>
                                <i className="fa-solid fa-arrow-rotate-right"></i>
                            </printbutton>

                            {/* <printbutton type="button" className="purbut" title="Settings">
                                <i className="fa-solid fa-gear"></i>
                            </printbutton> */}

                            {/* <button className="btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
                                <i class="fa-solid fa-xmark"></i>
                            </button> */}

                        </div>
                    </div>
                </div>

                {/* ================= FORM INPUT FIELDS SECTION ================= */}
                <div className="shadow-lg p-1 bg-body-tertiary rounded pt-3 pb-4" align="left">
                    <div className="row ms-3 me-3">
                        {/* 4. Party Type */}
                        <div className="col-md-3 form-group mb-2">
                            <label htmlFor="partyType" className={`exp-form-labels ${error && !partyType ? 'red' : ''}`}>Party Type<span className="text-danger">*</span></label>
                            <div className="exp-form-floating" title="Select Party Type (Vendor or Customer)">
                                <Select
                                    id="partyType"
                                    value={selectedPartyType}
                                    // onChange={handleChangePartyType}
                                    // options={filteredOptionPartyType}
                                    className="exp-input-field"
                                    isDisabled={true}
                                    // placeholder="Select Party Type"
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                        {/* 3. Party Name */}
                        <div className="col-md-3 form-group mb-2">
                            <label htmlFor="partyName" className={`${error && !partyName ? 'red' : ''}`}>
                                Party Name<span className="text-danger">*</span>
                            </label>

                            <div
                                className="exp-form-floating"
                                title="Select Vendor or Customer Name"
                            >
                                <Select
                                    id="partyName"
                                    value={selectedPartyName}
                                    onChange={(opt) => {
                                        setSelectedPartyName(opt);
                                        setPartyName(opt?.value || "");
                                    }}
                                    options={filteredOptionCode}
                                    className="exp-input-field"
                                    // placeholder="Select Party Name"
                                    isDisabled={!partyType}
                                    styles={{
                                        menu: (provided) => ({
                                            ...provided,
                                            zIndex: 9999
                                        })
                                    }}
                                />
                            </div>
                        </div>

                        {/* 4. Reason */}
                        <div className="col-md-3 form-group mb-2">
                            <label htmlFor="reason" className={`${error && !refType ? 'red' : ''}`}>Ref. Type<span className="text-danger">*</span></label>
                            <div className="exp-form-floating" title="Select Reference Type for Debit/Credit Note">
                                <Select
                                    id="reason"
                                    value={selectedRefType}
                                    onChange={handleChangeRefType}
                                    options={filteredOptionRefType}
                                    className="exp-input-field"
                                    // placeholder="Select Reason"
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group mb-2">
                            <label htmlFor="reason" className={`${error && !reason ? 'red' : ''}`}>Reason<span className="text-danger">*</span></label>
                            <div className="exp-form-floating" title="Select Reason for Debit/Credit Note">
                                <Select
                                    id="reason"
                                    value={selectedReason}
                                    onChange={handleChangeReason}
                                    options={reasonOptions}
                                    className="exp-input-field"
                                    // placeholder="Select Reason"
                                    styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                />
                            </div>
                        </div>

                        {/* 5. Ref. Transaction No */}
                        <div className="col-md-3 form-group mb-2">
                            <label htmlFor="transactionNumber">Ref. Transaction ID</label>
                            <div className="exp-form-floating">
                                <div className="d-flex justify-content-end">
                                    <input
                                        id="transactionNumber"
                                        className="exp-input-field form-control"
                                        type="text"
                                        // placeholder="Enter Transaction ID"
                                        title="Enter Original Transaction Reference Number"
                                        value={refTransactionNumber}
                                        onChange={(e) => setRefTransactionNumber(e.target.value)}
                                        maxLength={50}
                                        autoComplete="off"
                                    />
                                    <div className="position-absolute mt-1 me-2">
                                        <span className="icon searchIcon" title="Search Ref Transaction" onClick={handleSearchRefTransaction}>
                                            <i className="fa fa-search"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. Ref. Transaction Date */}
                        <div className="col-md-3 form-group mb-2">
                            <div className="exp-form-floating">
                                <label htmlFor="refTransactionDate">Ref. Transaction Date</label>
                                <input
                                    name="refTransactionDate"
                                    id="refTransactionDate"
                                    className="exp-input-field form-control"
                                    type="date"
                                    title="Select Transaction Date"
                                    value={refTransactionDate}
                                    onChange={(e) => setRefTransactionDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3 form-group mb-2">
                            <label htmlFor="refNo">Ref. No</label>
                            <div className="exp-form-floating">
                                <input
                                    className="exp-input-field form-control"
                                    id="refNo"
                                    title="Enter Reference No"
                                    // placeholder="Enter Narration or Remarks"
                                    value={refNo}
                                    onChange={(e) => setRefNo(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 7. Narration */}
                        <div className="col-md-6 form-group mb-2">
                            <label htmlFor="narration">Narration</label>
                            <div className="exp-form-floating">
                                <textarea
                                    className="exp-input-field form-control"
                                    id="narration"
                                    title="Enter Remarks / Narration"
                                    // placeholder="Enter Narration or Remarks"
                                    value={narration}
                                    onChange={(e) => setNarration(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= TOTAL BILL SECTION ================= */}
                <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4" align="left">
                    <div className="row ms-3 me-3 mb-3">
                        <div className="col-md-3 form-group mb-2">
                            <div className="exp-form-floating">
                                <label className={`${error && !total ? 'red' : ''}`}>Total Amount<span className="text-danger">*</span></label>
                                <input
                                    id="totalPurchaseAmount"
                                    className="exp-input-field form-control input"
                                    title="Total Net Amount"
                                    type="text"
                                    value={total}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2">
                            <div className="exp-form-floating">
                                <label className={`${error && !totalTax ? 'red' : ''}`}>Total Tax<span className="text-danger">*</span></label>
                                <input
                                    id="totalTaxAmount"
                                    title="Total Calculated Tax Amount"
                                    type="text"
                                    className="exp-input-field form-control input"
                                    value={totalTax}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2">
                            <div className="exp-form-floating">
                                <label className="exp-form-labels">Round Off</label>
                                <input
                                    id="roundOff"
                                    title="Round Off Difference"
                                    type="text"
                                    className="exp-input-field form-control input"
                                    value={roundDifference}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="col-md-3 form-group mb-2">
                            <div className="exp-form-floating">
                                <label className={`${error && !totalAmount ? 'red' : ''}`}>Total Bill Amount<span className="text-danger">*</span></label>
                                <input
                                    id="totalBillAmount"
                                    title="Final Total Bill Amount"
                                    type="text"
                                    className="exp-input-field form-control input"
                                    value={totalAmount}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= AG GRID TABLE SECTION ================= */}
                <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4" align="left">
                    <div className="d-flex justify-content-between">
                        <div className="d-flex justify-content-start ms-5">
                            <purButton
                                type="button"
                                className={`"toggle-btn"  ${activeTable === 'myTable' ? 'active' : ''}`}
                                onClick={() => handleToggleTable('myTable')}>
                                Item Details
                            </purButton>
                            <purButton
                                type="button"
                                className={`"toggle-btn"  ${activeTable === 'myTable' ? 'active' : ''}`}
                                onClick={() => handleToggleTable('tax')}>
                                Tax Details
                            </purButton>
                        </div>
                        <div className="d-flex me-4 gap-2">
                            <icon
                                type="button"
                                className="popups-btn"
                                title="Add Row"
                                onClick={handleAddRow}>
                                <FontAwesomeIcon icon={faPlus} />
                            </icon>
                            <icon
                                type="button"
                                className="popups-btn"
                                title="Remove Row"
                                onClick={handleRemoveRow}>
                                <FontAwesomeIcon icon={faMinus} />
                            </icon>
                        </div>
                    </div>

                    <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                        <AgGridReact
                            columnDefs={activeTable === 'myTable' ? columnDefs : columnDefsTax}
                            rowData={activeTable === 'myTable' ? rowData : rowDataTax}
                            defaultColDef={{ editable: true, resizable: true }}
                            onCellValueChanged={async (event) => {
                                if (event.colDef.field === 'Qty' || event.colDef.field === 'purchaseAmt') {
                                    await ItemAmountCalculation(event);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* POPUPS & FOOTER */}
                <PurchaseItemPopup open={open} handleClose={handleClose} handleItem={handleItem} />
                <PurchaseWarehousePopup open={open1} handleClose={handleClose} handleWarehouse={handleWarehouse} />
                <PurchasePopup open={openPurchaseHelp} handleClose={() => setOpenPurchaseHelp(false)} handlePurchaseData={handlePurchaseDataSelect} selectedPartyCode={partyName || ""} />
                <SalesHdrPopup open={openSalesHelp} handleClose={() => setOpenSalesHelp(false)} handleData={handleSalesDataSelect} selectedPartyCode={partyName || ""} />
                <PurchaseReturnView open={openPurchaseReturnHelp} handleClose={() => setOpenPurchaseReturnHelp(false)} handleItemView={handlePurchaseReturnDataSelect} selectedPartyCode={partyName || ""} />
                <SalesRetrunView open={openSalesReturnHelp} handleClose={() => setOpenSalesReturnHelp(false)} handleDataView={handleSalesReturnDataSelect} selectedPartyCode={partyName || ""} />
                <DebitCrediNoteHelp open={openDebitCreditNoteHelp} handleClose={() => setOpenDebitCreditNoteHelp(false)} handleDebitCreditData={handleDebitCreditData} />
                <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
                    <div className="row ms-2">
                        <div className="d-flex justify-content-start">
                            <p className="col-md-6">{labels.createdBy}: {additionalData.created_by}</p>
                            <p className="col-md-6">{labels.createdDate}: {additionalData.created_date}</p>
                        </div>
                        <div className="d-flex justify-content-start">
                            <p className="col-md-6">{labels.modifiedBy}: {additionalData.modified_by}</p>
                            <p className="col-md-6">{labels.modifiedDate}: {additionalData.modified_date}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DebitCreditNote;