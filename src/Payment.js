import React, { useState, useEffect } from 'react';
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
import DeletedDebitCrediNoteHelp from './DeleteDebitCreditNotePopup';
import { showConfirmationToast } from './ToastConfirmation';
import PurchaseVendorPopup from './PurchaseVendorPopup'
import SalesVendorPopup from './SalesVendorPopup';

const config = require('./Apiconfig');

function Payment() {
    // Form States
    const [selectedPartyName, setSelectedPartyName] = useState(null);
    const [partyName, setPartyName] = useState('');
    const [narration, setNarration] = useState('');
    const [refTransactionDate, setRefTransactionDate] = useState('');

const [rowData, setRowData] = useState([
    {
        serialNumber: 1,
        Invoice_ID: "",
        Invoice_Date: "",
        Invoice_Amount: 0,
        Previous_Paid_Amount: 0,
        Outstanding_Amount: 0,
        Adjust_Amount: 0,
        Keyfield: ""
    }
]);
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

    const [vendorCodeDrop, setVendorCodeDrop] = useState([]);
    const [customerCodeDrop, setCustomerCodeDrop] = useState([]);

    const [noteType, setNoteType] = useState('');

    // Vendor / Customer Type
    const [partyTypeDrop, setPartyTypeDrop] = useState([])
    const [selectedPartyType, setSelectedPartyType] = useState('');
    const [partyType, setPartyType] = useState('');

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

    const [partyCode, setPartyCode] = useState('');
    const [partyNameDisplay, setPartyNameDisplay] = useState('');

    const [openVendorPartyHelp, setOpenVendorPartyHelp] = useState(false);
    const [openCustomerPartyHelp, setOpenCustomerPartyHelp] = useState(false);

    const [selectedInvoiceRow, setSelectedInvoiceRow] = useState(null);

    const [paymentModeDrop, setPaymentModeDrop] = useState([])
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
    const [paymentMode, setPaymentMode] = useState('');

    const [paymentTypeDrop, setPaymentTypeDrop] = useState([])
    const [selectedPaymentType, setSelectedPaymentType] = useState('');
    const [paymentType, setPaymentType] = useState('');

    const [bankCashAccountDrop, setBankCashAccountDrop] = useState([])
    const [selectedBankCashAccount, setSelectedBankCashAccount] = useState('');
    const [bankCashAccount, setBankCashAccount] = useState('');

    const [amount, setAmount] = useState('');

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: companyCode }),
        })
            .then((res) => res.json())
            .then((data) => setVendorCodeDrop(data))
            .catch((err) => console.error("Error fetching Vendors:", err));

        // Customer
        fetch(`${config.apiBaseUrl}/customerCodeDropdown`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: companyCode }),
        })
            .then((res) => res.json())
            .then((data) => setCustomerCodeDrop(data))
            .catch((err) => console.error("Error fetching Customers:", err));
    }, []);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getPaymentMode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode') }),
        })
            .then((res) => res.json())
            .then(setPaymentModeDrop)
            .catch((err) => console.error('Error fetching Payment Mode:', err));
    }, []);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getPartyType`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: sessionStorage.getItem("selectedCompanyCode") }),
        })
            .then((res) => res.json())
            .then((data) => setPartyTypeDrop(data))
            .catch((err) => console.error("Error fetching Party Type:", err));
    }, []);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getPaymentType`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: sessionStorage.getItem("selectedCompanyCode") }),
        })
            .then((res) => res.json())
            .then((data) => setPaymentTypeDrop(data))
            .catch((err) => console.error("Error fetching Payment Type:", err));
    }, []);

    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getEvent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company_code: sessionStorage.getItem("selectedCompanyCode") }),
        })
            .then((response) => response.json())
            .then((data) => setScreensDrop(data))
            .catch((error) => console.error("Error fetching events:", error));
    }, []);

    useEffect(() => {
        const savedScreen = sessionStorage.getItem('DebitCreditScreenSelection');
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

        fetch(`${config.apiBaseUrl}/getBankAccountPayment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_code })
        })
            .then((data) => data.json())
            .then((val) => setBankCashAccountDrop(val))
            .catch((error) => console.error('Error fetching Bank Account:', error));
    }, []);

    const filteredOptionCode = partyType === "Vendor"
        ? vendorCodeDrop.map((opt) => ({ value: opt.vendor_code, label: `${opt.vendor_code} - ${opt.vendor_name}` }))
        : partyType === "Customer"
            ? customerCodeDrop.map((opt) => ({ value: opt.customer_code, label: `${opt.customer_code} - ${opt.customer_name}` }))
            : [];
    const filteredOptionScreens = screensDrop.map((opt) => ({ value: opt.attributedetails_name, label: opt.attributedetails_name }));
    const filteredOptionPartyType = partyTypeDrop.map((opt) => ({ value: opt.attributedetails_name, label: opt.attributedetails_name }));
    const filteredOptionPaymentType = paymentTypeDrop.map((opt) => ({ value: opt.attributedetails_name, label: opt.attributedetails_name }));
    const filteredOptionPaymentMode = paymentModeDrop.map((opt) => ({ value: opt.attributedetails_name, label: opt.attributedetails_name }));
    const filteredOptionBankCashAccount = bankCashAccountDrop.map((opt) => ({ value: opt.account_code, label: `${opt.account_code} - ${opt.account_name}` }));

    const handleChangePaymentMode = (selectedOption) => {
        setSelectedPaymentMode(selectedOption);
        setPaymentMode(selectedOption ? selectedOption.value : "");
    };

    const handleChangePartyType = (selectedOption) => {
        setSelectedPartyType(selectedOption);
        setPartyType(selectedOption ? selectedOption.value : "");
    };

    const handleChangePaymentType = (selectedOption) => {
        setSelectedPaymentType(selectedOption);
        setPaymentType(selectedOption ? selectedOption.value : "");
    };

    const handleChangeBankCashAccount = (selectedOption) => {
        setSelectedBankCashAccount(selectedOption);
        setBankCashAccount(selectedOption ? selectedOption.value : "");
    };

    const handleChangeScreens = (selected) => {
        setSelectedscreens(selected);
        const screenValue = selected?.value === 'Add' ? 'Add' : 'Delete';
        setScreens(screenValue);
        sessionStorage.setItem('DebitCreditScreenSelection', screenValue);
    };

    const handleVendor = (selectedData) => {
        if (!selectedData || selectedData.length === 0) return;
        const vendor = selectedData[0];
        setPartyCode(vendor.VendorCode || "");
        setPartyName(vendor.VendorCode || "");
        setPartyNameDisplay(vendor.VendorName || "");
        setOpenVendorPartyHelp(false);
    };

    const handleCustomer = (selectedData) => {
        if (!selectedData || selectedData.length === 0) return;
        const customer = selectedData[0];
        setPartyCode(customer.CustomerCode || "");
        setPartyName(customer.CustomerCode || "");
        setPartyNameDisplay(customer.CustomerName || "");
        setOpenCustomerPartyHelp(false);
    };

    const handlePartyCodeSearch = () => {
        if (!partyType) {
            toast.warning("Please select Vendor / Customer Type first");
            return;
        }
        if (partyType === "Vendor") setOpenVendorPartyHelp(true);
        else if (partyType === "Customer") setOpenCustomerPartyHelp(true);
    };

    const handlePartyCodeChange = (e) => {
        const value = e.target.value;
        setPartyCode(value);
        setPartyName('');
        setPartyNameDisplay('');

        if (!value.trim()) return;

        if (partyType === "Vendor") {
            const vendor = vendorCodeDrop.find((item) => item.vendor_code?.toLowerCase() === value.trim().toLowerCase());
            if (vendor) {
                setPartyCode(vendor.vendor_code);
                setPartyName(vendor.vendor_code);
                setPartyNameDisplay(vendor.vendor_name);
            }
        } else if (partyType === "Customer") {
            const customer = customerCodeDrop.find((item) => item.customer_code?.toLowerCase() === value.trim().toLowerCase());
            if (customer) {
                setPartyCode(customer.customer_code);
                setPartyName(customer.customer_code);
                setPartyNameDisplay(customer.customer_name);
            }
        }
    };

    const handlePartyCodeKeyPress = (e) => {
        if (e.key !== "Enter") return;
        const value = partyCode.trim();

        if (!value) {
            setPartyName('');
            setPartyNameDisplay('');
            return;
        }

        if (!partyType) {
            toast.warning("Please select Vendor / Customer Type first");
            return;
        }

        if (partyType === "Vendor") {
            const vendor = vendorCodeDrop.find((item) => item.vendor_code?.toLowerCase() === value.toLowerCase());
            if (!vendor) {
                setPartyName('');
                setPartyNameDisplay('');
                toast.warning("Vendor code not found");
                return;
            }
            setPartyCode(vendor.vendor_code);
            setPartyName(vendor.vendor_code);
            setPartyNameDisplay(vendor.vendor_name || 'Vendor name not found');
        } else if (partyType === "Customer") {
            const customer = customerCodeDrop.find((item) => item.customer_code?.toLowerCase() === value.toLowerCase());
            if (!customer) {
                setPartyName('');
                setPartyNameDisplay('');
                toast.warning("Customer code not found");
                return;
            }
            setPartyCode(customer.customer_code);
            setPartyName(customer.customer_code);
            setPartyNameDisplay(customer.customer_name || 'Customer name not found');
        }
    };

    const formatToTwoDecimalPoints = (number) => parseFloat(number).toFixed(2);

    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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

    const fillSelectedInvoice = (invoice, invoiceType) => {
    if (!invoice || !selectedInvoiceRow?.node) {
        toast.warning("Please select an invoice.");
        return;
    }

    console.log("Selected invoice:", invoice);
    console.log("Selected grid row:", selectedInvoiceRow);

    const isVendor = invoiceType === "Vendor";
    const rowNode = selectedInvoiceRow.node;

    if (!rowNode.data) {
        toast.warning("Selected grid row is no longer available.");
        return;
    }

    // Map the popup fields to the Payment grid fields.
    const invoiceNo = isVendor
        ? (invoice.TransactionNo ?? invoice.transaction_no ?? invoice.bill_no)
        : (invoice.bill_no ?? invoice.BillNo ?? invoice.TransactionNo);

    const invoiceDate =
        invoice.bill_date ??
        invoice.Invoice_Date ??
        invoice.TransactionDate ??
        "";

    const invoiceAmount = Number(
        invoice.bill_amt ??
        invoice.TotalAmount ??
        invoice.total_amount ??
        invoice.Invoice_Amount ??
        invoice.Amount ??
        0
    );

    const paidAmount = Number(
        invoice.paid_amount ??
        invoice.PaidAmount ??
        invoice.Previous_Paid_Amount ??
        0
    );

    const outstandingAmount = Math.max(
        0,
        Number(
            invoice.OutstandingAmount ??
            invoice.outstanding_amount ??
            (invoiceAmount - paidAmount)
        )
    );

    // Update the selected AG Grid row.
    const updatedRow = {
        ...rowNode.data,
        Invoice_ID: invoiceNo ?? "",
        Invoice_Date: invoiceDate,
        Invoice_Amount: invoiceAmount,
        Previous_Paid_Amount: paidAmount,
        Outstanding_Amount: outstandingAmount,
        Adjust_Amount: 0,
        Keyfield: invoice.key_field ?? invoice.Keyfield ?? ""
    };

    rowNode.setData(updatedRow);

    // IMPORTANT: Also update React state because savePaymentDetails()
    // reads rowData, not the AG Grid row directly.
    const rowIndex = rowNode.rowIndex;

    setRowData((previousRows) =>
        previousRows.map((row, index) =>
            index === rowIndex
                ? updatedRow
                : row
        )
    );

    console.log("Updated invoice row:", updatedRow);

    setOpenPurchaseHelp(false);
    setOpenSalesHelp(false);
    setSelectedInvoiceRow(null);
};

    const handlePurchaseDataSelect = (selectedData) => {
        const invoice = Array.isArray(selectedData) ? selectedData[0] : selectedData;
        fillSelectedInvoice(invoice, "Vendor");
    };

    const handleSalesDataSelect = (selectedData) => {
        const invoice = Array.isArray(selectedData) ? selectedData[0] : selectedData;
        fillSelectedInvoice(invoice, "Customer");
    };

    const handleInvoiceSearchOpen = (params) => {
        setSelectedInvoiceRow(params);
        const selectedType = String(partyType || "").trim().toLowerCase();

        if (selectedType === "vendor") {
            setOpenPurchaseHelp(true);
            setOpenSalesHelp(false);
        } else if (selectedType === "customer") {
            setOpenSalesHelp(true);
            setOpenPurchaseHelp(false);
        } else {
            toast.warning("Please select Vendor / Customer Type first.");
        }
    };

    const handleDelete = (params) => {
        const serialNumberToDelete = params.data.serialNumber;
        const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);
        setRowData(updatedRowData.length ? updatedRowData : [{ serialNumber: 1, itemCode: '', itemName: '', unitWeight: '', warehouse: '', purchaseQty: '', ItemTotalWight: '', purchaseAmt: '', TotalTaxAmount: '', TotalItemAmount: '' }]);
    };

    const handleDebitCreditNoteHelp = () => setOpenDebitCreditNoteHelp(true);

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

        params.data.Previous_Paid_Amount = newValue;
        return true;
    }

    function Outstanding_AmountValueSetter(params) {
        const newValue = parseFloat(params.newValue);

        if (isNaN(newValue) || params.newValue.toString().trim() === '' || params.newValue.toString().match(/[^0-9.]/)) {
            toast.warning("Please enter a valid numeric quantity.");
            return false;
        }

        if (newValue < 0) {
            toast.warning("Quantity cannot be negative.");
            return false;
        }

        params.data.Outstanding_Amount = newValue;
        return true;
    }

    function Adjust_AmountValueSetter(params) {
        const newValue = parseFloat(params.newValue);

        if (isNaN(newValue) || params.newValue.toString().trim() === '' || params.newValue.toString().match(/[^0-9.]/)) {
            toast.warning("Please enter a valid numeric quantity.");
            return false;
        }

        if (newValue < 0) {
            toast.warning("Quantity cannot be negative.");
            return false;
        }

        params.data.Adjust_Amount = newValue;
        return true;
    }

    const columnDefs = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            headerName: 'S.No',
            field: 'serialNumber',
            minWidth: 100,
            maxWidth: 100,
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
            headerName: "Invoice No",
            field: "Invoice_ID",
            editable: false,
            filter: true,
            sortable: false,
            cellEditorParams: { maxLength: 40 },
            cellRenderer: (params) => {
                const cellWidth = params.column.getActualWidth();
                return (
                    <div className="position-relative d-flex align-items-center" style={{ minHeight: "100%" }}>
                        <div className="flex-grow-1">{params.value || ""}</div>
                        {cellWidth > 30 && (
                            <span
                                className="icon searchIcon"
                                title="Search Invoice"
                                style={{ position: "absolute", right: "0px", top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleInvoiceSearchOpen(params);
                                }}
                            >
                                <i className="fa fa-search"></i>
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            headerName: 'Invoice Amount',
            field: 'Invoice_Amount',
            editable: false,
            filter: true,
            sortable: false,
            cellEditorParams: { maxLength: 10 }
        },
        {
            headerName: 'Paid',
            field: 'Previous_Paid_Amount',
            editable: true,
            filter: true,
            sortable: false,
            valueSetter: qtyValueSetter,
            cellEditorParams: { maxLength: 10 }
        },
        {
            headerName: 'Outstanding',
            field: 'Outstanding_Amount',
            editable: true,
            filter: true,
            sortable: false,
            valueSetter: Outstanding_AmountValueSetter,
            cellEditorParams: { maxLength: 10 }
        },
        {
            headerName: 'Adjustment Amount',
            field: 'Adjust_Amount',
            editable: true,
            filter: true,
            sortable: false,
            valueSetter: Adjust_AmountValueSetter,
            cellEditorParams: { maxLength: 18 }
        },
        {
            headerName: 'KeyField',
            field: 'Keyfield',
            editable: false,
            filter: true,
            sortable: false,
            hide: true
        }
    ];

    const columnDefsTax = [
        { headerName: 'S.No', field: 'ItemSNO', maxWidth: 250, sortable: false, editable: true },
        { headerName: 'Tax S.No', field: 'TaxSNO', sortable: false, editable: false },
        { headerName: 'Item Code', field: 'Item_code', sortable: false, editable: false },
        { headerName: 'Tax Type ', field: 'TaxType', sortable: false, editable: false },
        { headerName: 'Tax %', field: 'TaxPercentage', sortable: false, editable: false },
        { headerName: 'Tax Amount', field: 'TaxAmount', sortable: false, editable: false },
        { headerName: 'Keyfield', field: 'keyfield', sortable: false, editable: false, hide: true }
    ];

   // 1. Header Field Validation
    const handleSaveButtonClick = async () => {
        setError(false);
        setLoading(true);

        try {
            // 1. Construct Header Data Payload
            const headerPayload = {
                Payment_Type: paymentType,
                Payment_Date: transactionDate,
                Party_Type: partyType,
                Party_ID: partyName,
                Payment_Mode: paymentMode,
                Keyfield: keyfield,
                Account_ID: bankCashAccount,
                Reference_No: refTransactionNumber,
                Reference_Date: refTransactionDate,
                Amount: amount,
                Narration: narration,
                company_code: sessionStorage.getItem("selectedCompanyCode"),
                location_code: sessionStorage.getItem("selectedLocationCode") || "LOC01",
                created_by: sessionStorage.getItem("selectedUserCode")
            };

            const response = await fetch(`${config.apiBaseUrl}/PaymentHdrInsert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(headerPayload)
            });

            if (response.ok) {
                const result = await response.json();

                // Extract generated Keyfield and Payment_ID from backend response
                const keyfieldHeader = result.Keyfield;
                const paymentId = result.Payment_ID;

                setTransactionNumber(paymentId || "");

                // 2. Save Details directly without validations
                await savePaymentDetails(paymentId, keyfieldHeader);

                toast.success("Payment Note and Details saved successfully!");
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

    // SAVE PAYMENT DETAILS FUNCTION (Without Validations)
    const savePaymentDetails = async (paymentId, keyfieldHeader) => {
        try {
            for (const row of (rowData || [])) {
                const detailPayload = {
                    Payment_ID: paymentId,
                    Invoice_ID: row.Invoice_ID ?? row.invoice_ID ?? row.InvoiceId ?? "",
                    Invoice_Date: row.Invoice_Date ?? null,
                    Invoice_Amount: row.Invoice_Amount ?? 0,
                    Previous_Paid_Amount: row.Previous_Paid_Amount ?? 0,
                    Outstanding_Amount: row.Outstanding_Amount ?? 0,
                    Adjust_Amount: row.Adjust_Amount ?? 0,
                    Keyfield_Header: keyfieldHeader,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode") || "LOC01",
                    Created_By: sessionStorage.getItem("selectedUserCode")
                };

                const response = await fetch(`${config.apiBaseUrl}/PaymentDetailsInsert`, {
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
            toast.error("Error saving payment details: " + error.message);
        }
    };

    const handleTransactionNoKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!transactionNumber || transactionNumber.trim() === "") {
                toast.warning("Please enter a Transaction Number");
                return;
            }
            fetchPaymentData(transactionNumber.trim());
        }
    };

    const handlePaymentData = (selectedData) => {
        if (selectedData && selectedData.length > 0) {
            const item = selectedData[0];
            setTransactionNumber(item.TransactionNo);
            fetchPaymentData(item.TransactionNo);
        }
    };

    const fetchPaymentData = async (code) => {
        if (!code) return;
        setLoading(true);

        try {
            const response = await fetch(`${config.apiBaseUrl}/getPaymentData`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") }),
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

            if (searchData.header && searchData.header.length > 0) {
                const headerItem = searchData.header[0];
                setNoteType(headerItem.Note_Type || "");
                const partyTypeVal = headerItem.Party_Type || "";
                setSelectedPartyType(partyTypeVal ? { value: partyTypeVal, label: partyTypeVal } : null);
                setPartyType(partyTypeVal);
                setPartyName(headerItem.Party_ID || "");

                if (headerItem.Note_Date) setTransactionDate(formatDate(headerItem.Note_Date));
                setRefTransactionNumber(headerItem.Reference_Invoice_No || "");
                if (headerItem.Reference_Invoice_Date) setRefTransactionDate(formatDate(headerItem.Reference_Invoice_Date));
                setTransactionNumber(headerItem.Note_No || "");
                setTotal(formatToTwoDecimalPoints(headerItem.Sub_Total || 0));
                setTotalTax(formatToTwoDecimalPoints(headerItem.Tax_Amount || 0));
                setTotalAmount(formatToTwoDecimalPoints(headerItem.Total_Amount || 0));
                setRoundDifference(formatToTwoDecimalPoints(headerItem.rounded_off || 0));
                setNarration(headerItem.Narration || "");
                setRefNo(headerItem.Reference_No || "");
                setKeyfieldHeader(headerItem.Keyfield || "");
                setKeyfield(headerItem.Reference_ID || "");
            } else {
                toast.warning("Header details not found");
            }
        } catch (error) {
            console.error("Error fetching Debit/Credit Note data:", error);
            toast.error(error.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleExcelDownload = () => {
        const filteredRowData = rowData.filter(row => (row.Qty > 0) && (row.TotalItemAmount > 0 || row.purchaseAmt > 0));
        const filteredRowDataTax = rowDataTax.filter(taxRow => taxRow.TaxAmount > 0 && taxRow.TaxPercentage > 0);

        const mapDataToHeaders = (dataList, colDefs) => {
            const visibleCols = colDefs.filter(col => !col.hide && col.headerName && col.headerName !== '');
            return dataList.map(row => {
                const mappedRow = {};
                visibleCols.forEach(col => {
                    mappedRow[col.headerName] = row[col.field] !== undefined ? row[col.field] : '';
                });
                return mappedRow;
            });
        };

        const formattedItemDetails = mapDataToHeaders(filteredRowData, columnDefs);
        const formattedTaxDetails = mapDataToHeaders(filteredRowDataTax, columnDefsTax);

        const headerData = [{
            "Payment Type": partyType,
            "Vendor / Customer Name": partyName,
            "Payment Mode": paymentMode,
            "Bank / Cash Account": bankCashAccount,
            "Ref Transaction No": refTransactionNumber,
            "Ref Transaction Date": refTransactionDate,
            "Transaction Date": transactionDate,
            "Transaction No": transactionNumber,
            "Remarks": narration,
            "Total Amount": totalAmount
        }];

        const headerSheet = XLSX.utils.aoa_to_sheet([
            ["Payment Voucher"],
            [`Company Name : ${sessionStorage.getItem("selectedCompanyName") || ""}`],
            [],
        ]);

        XLSX.utils.sheet_add_json(headerSheet, headerData, { origin: "A4" });

        headerSheet["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
        ];

        const rowDataSheet = XLSX.utils.json_to_sheet(formattedItemDetails);
        const rowDataTaxSheet = XLSX.utils.json_to_sheet(formattedTaxDetails);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
        XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Note Details");
        XLSX.utils.book_append_sheet(workbook, rowDataTaxSheet, "Tax Details");

        const fileName = `Payment_${transactionNumber || "Data"}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleUpdateButtonClick = async () => {
        if (!noteType || !transactionDate || !partyType || !partyName || !refType || !total || !totalTax || !totalAmount) {
            toast.warning("Error: Missing required fields.");
            setError(true);
            return;
        }

        setError(false);
        setLoading(true);

        try {
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
                Reason_ID: 'Payment',
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
                toast.success("Payment Note updated successfully!");
                setShowExcelButton(true);
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to update Header data");
            }
        } catch (error) {
            console.error("Error updating header data:", error);
            toast.error("Error updating data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHeader = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/Debit_Credit_NoteDelete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Note_No: transactionNumber,
                    company_code: sessionStorage.getItem("selectedCompanyCode"),
                    location_code: sessionStorage.getItem("selectedLocationCode") || ""
                })
            });

            if (response.ok) return true;
            else {
                const errorResponse = await response.json();
                return errorResponse.message || "Failed to delete Header.";
            }
        } catch (error) {
            return "Error deleting Header: " + error.message;
        }
    };

    const handleDeleteButtonClick = async () => {
        if (!transactionNumber) {
            toast.warning('Error: Transaction Number is missing');
            return;
        }

        showConfirmationToast(
            "Are you sure you want to delete this Payment Voucher?",
            async () => {
                setLoading(true);
                try {
                    const headerResult = await handleDeleteHeader();
                    if (headerResult === true) {
                        toast.success("Payment Voucher Deleted Successfully", {
                            autoClose: 1500,
                            onClose: () => { window.location.reload(); }
                        });
                    } else {
                        toast.error(headerResult);
                    }
                } catch (error) {
                    toast.error(error.message || "An Error occurred while Deleting Data");
                } finally {
                    setLoading(false);
                }
            },
            () => { toast.info("Delete cancelled."); }
        );
    };

    // Deleted Screen States
    const [deletedNoteType, setDeletedNoteType] = useState("");
    const [deletedTransactionDate, setDeletedTransactionDate] = useState("");
    const [deletedTransactionNumber, setDeletedTransactionNumber] = useState("");
    const [deletedPartyType, setDeletedPartyType] = useState("");
    const [deletedPartyName, setDeletedPartyName] = useState("");
    const [deletedRefType, setDeletedRefType] = useState("");
    const [deletedReason, setDeletedReason] = useState("");
    const [deletedRefTransactionNumber, setDeletedRefTransactionNumber] = useState("");
    const [deletedRefTransactionDate, setDeletedRefTransactionDate] = useState("");
    const [deletedRefNo, setDeletedRefNo] = useState("");
    const [deletedNarration, setDeletedNarration] = useState("");

    const [openDelDebitCreditNoteHelp, setOpenDelDebitCreditNoteHelp] = useState(false);
    const [deletedRowData, setDeletedRowData] = useState([]);
    const [deletedRowDataTax, setDeletedRowDataTax] = useState([]);

    const handleDelDebitCreditNoteHelp = () => setOpenDelDebitCreditNoteHelp(true);

    const deletedColumnDefs = [
        { headerName: 'S.No', field: 'deletedSerialNumber', maxWidth: 80, sortable: false, editable: false },
        { headerName: 'Ref. Trans No', field: 'deletedItemCode', editable: false, filter: true, sortable: false },
        { headerName: 'Invoice No', field: 'deletedItemName', editable: false, filter: true, sortable: false },
        { headerName: 'Invoice Amount', field: 'deletedWarehouse', editable: false, filter: true },
        { headerName: 'Paid', field: 'deletedQty', editable: false, filter: true, sortable: false },
        { headerName: 'Outstanding', field: 'deletedPurchaseAmt', editable: false, filter: true, sortable: false },
        { headerName: 'Adjustment Amount', field: 'deletedTotalTaxAmount', editable: false, filter: true, sortable: false },
    ];

    const deletedColumnDefsTax = [
        { headerName: 'S.No', field: 'deletedItemSNO', maxWidth: 250, sortable: false, editable: true },
        { headerName: 'Tax S.No', field: 'deletedTaxSNO', sortable: false, editable: false },
        { headerName: 'Item Code', field: 'deletedItem_code', sortable: false, editable: false },
        { headerName: 'Tax Type', field: 'deletedTaxType', sortable: false, editable: false },
        { headerName: 'Tax %', field: 'deletedTaxPercentage', sortable: false, editable: false },
        { headerName: 'Tax Amount', field: 'deletedTaxAmount', sortable: false, editable: false }
    ];

    const handleDeleteNoteNoKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!deletedTransactionNumber || deletedTransactionNumber.trim() === "") {
                toast.warning("Please enter a Transaction Number");
                return;
            }
            fetchDeletedDebitCreditNoteData(deletedTransactionNumber.trim());
        }
    };

    const handleDeleteDebitCreditData = (selectedData) => {
        if (selectedData && selectedData.length > 0) {
            const item = selectedData[0];
            setDeletedTransactionNumber(item.TransactionNo);
            fetchDeletedDebitCreditNoteData(item.TransactionNo);
        }
    };

    const fetchDeletedDebitCreditNoteData = async (code) => {
        if (!code) return;
        setLoading(true);

        try {
            const response = await fetch(`${config.apiBaseUrl}/getDeletedDebitCreditNoteData`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    toast.warning("Transaction Data not found");
                    setDeletedRowData([]);
                    setDeletedRowDataTax([]);
                } else {
                    const errorResponse = await response.json();
                    toast.error(errorResponse.message || "An error occurred while fetching data");
                }
                return;
            }

            const searchData = await response.json();

            if (searchData.header && searchData.header.length > 0) {
                const headerItem = searchData.header[0];
                setDeletedTransactionNumber(headerItem.Note_No || "");
                setDeletedNoteType(headerItem.Note_Type || "");
                setDeletedPartyType(headerItem.Note_Type || "");
                setDeletedPartyName(headerItem.Party_ID || "");
                setDeletedRefType(headerItem.Reference_Type || "");
                setDeletedReason(headerItem.Reason_ID || "");
                setDeletedRefTransactionNumber(headerItem.Reference_Invoice_No || "");
                if (headerItem.Note_Date) setDeletedTransactionDate(formatDate(headerItem.Note_Date));
                if (headerItem.Reference_Invoice_Date) setDeletedRefTransactionDate(formatDate(headerItem.Reference_Invoice_Date));
                setDeletedNarration(headerItem.Narration || "");
                setDeletedRefNo(headerItem.Reference_No || "");
            } else {
                toast.warning("Header details not found");
            }
        } catch (error) {
            console.error("Error fetching Deleted Note data:", error);
            toast.error(error.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {Screens === 'Add' ? (
                <div className="container-fluid Topnav-screen">
                    {loading && <LoadingScreen />}
                    <ToastContainer position="top-right" className="toast-design" theme="colored" />

                    <div className="shadow-lg p-2 bg-body-tertiary rounded mb-2 mt-2">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div className="d-flex align-items-center">
                                <h1 className="purbut">Payment</h1>
                            </div>

                            <div className="d-flex align-items-center gap-2 purbut">
                                <div className="exp-form-floating" style={{ minWidth: '160px' }} title="Select Screen Action">
                                    <Select
                                        id="returnType"
                                        className="exp-input-field"
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
                            </div>
                        </div>
                    </div>

                    <div className="shadow-lg p-2 bg-body-tertiary rounded mb-2 mt-2">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div className="row ms-3 me-3">
                                <div className="col-md-6 form-group mb-2">
                                    <label htmlFor="transactionNumber">Transaction No</label>
                                    <div className="exp-form-floating">
                                        <div className="d-flex justify-content-end">
                                            <input
                                                id="transactionNumber"
                                                className="exp-input-field form-control"
                                                type="text"
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

                                <div className="col-md-6 form-group mb-2">
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
                            </div>
                        </div>
                    </div>

                    <div className="shadow-lg p-1 bg-body-tertiary rounded pt-3 pb-4" align="left">
                        <div className="row ms-3 me-3">
                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="paymentType" className={`exp-form-labels ${error && !paymentType ? 'red' : ''}`}>Payment Type<span className="text-danger">*</span></label>
                                <div className="exp-form-floating" title="Select Payment Type">
                                    <Select
                                        id="paymentType"
                                        value={selectedPaymentType}
                                        onChange={handleChangePaymentType}
                                        options={filteredOptionPaymentType}
                                        className="exp-input-field"
                                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                    />
                                </div>
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="partyType" className={`exp-form-labels ${error && !partyType ? 'red' : ''}`}>Vendor / Customer Type<span className="text-danger">*</span></label>
                                <div className="exp-form-floating" title="Select Vendor / Customer Type">
                                    <Select
                                        id="partyType"
                                        value={selectedPartyType}
                                        onChange={handleChangePartyType}
                                        options={filteredOptionPartyType}
                                        className="exp-input-field"
                                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                    />
                                </div>
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="partyCode" className={`${error && !partyCode ? 'red' : ''}`}>
                                    Vendor / Customer Code<span className="text-danger">*</span>
                                </label>
                                <div className="exp-form-floating" title="Enter Vendor / Customer Code">
                                    <div className="d-flex justify-content-end">
                                        <input
                                            className="exp-input-field form-control justify-content-start"
                                            id="partyCode"
                                            type="text"
                                            value={partyCode}
                                            onChange={handlePartyCodeChange}
                                            onKeyPress={handlePartyCodeKeyPress}
                                            maxLength={18}
                                            autoComplete="off"
                                            disabled={!partyType}
                                        />
                                        <div className="position-absolute mt-1 me-2">
                                            <span className="icon searchIcon" title="Search Vendor / Customer" onClick={handlePartyCodeSearch}>
                                                <i className="fa fa-search"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="partyName" className={`${error && !partyName ? 'red' : ''}`}>
                                    Vendor / Customer Name<span className="text-danger">*</span>
                                </label>
                                <div className="exp-form-floating" title="Vendor / Customer Name">
                                    <input
                                        className="exp-input-field form-control"
                                        id="partyName"
                                        type="text"
                                        value={partyNameDisplay}
                                        readOnly
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="reason" className={`${error && !paymentMode ? 'red' : ''}`}>Payment Mode<span className="text-danger">*</span></label>
                                <div className="exp-form-floating" title="Select Payment Mode">
                                    <Select
                                        id="reason"
                                        value={selectedPaymentMode}
                                        onChange={handleChangePaymentMode}
                                        options={filteredOptionPaymentMode}
                                        className="exp-input-field"
                                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                    />
                                </div>
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="reason" className={`${error && !bankCashAccount ? 'red' : ''}`}>Bank / Cash Account<span className="text-danger">*</span></label>
                                <div className="exp-form-floating" title="Select Bank / Cash Account">
                                    <Select
                                        id="reason"
                                        value={selectedBankCashAccount}
                                        onChange={handleChangeBankCashAccount}
                                        options={filteredOptionBankCashAccount}
                                        className="exp-input-field"
                                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                    />
                                </div>
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="transactionNumber">Reference No</label>
                                <div className="exp-form-floating">
                                    <div className="d-flex justify-content-end">
                                        <input
                                            id="transactionNumber"
                                            className="exp-input-field form-control"
                                            type="text"
                                            title="Enter Original Transaction Reference Number"
                                            value={refTransactionNumber}
                                            onChange={(e) => setRefTransactionNumber(e.target.value)}
                                            maxLength={50}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <div className="exp-form-floating">
                                    <label htmlFor="refTransactionDate">Reference Date</label>
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
                                <label htmlFor="refNo">Amount</label>
                                <div className="exp-form-floating">
                                    <input
                                        className="exp-input-field form-control"
                                        id="refNo"
                                        title="Enter Amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6 form-group mb-2">
                                <label htmlFor="narration">Remarks</label>
                                <div className="exp-form-floating">
                                    <textarea
                                        className="exp-input-field form-control"
                                        id="narration"
                                        title="Enter Remarks"
                                        value={narration}
                                        onChange={(e) => setNarration(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

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
                                <icon type="button" className="popups-btn" title="Add Row" onClick={handleAddRow}>
                                    <FontAwesomeIcon icon={faPlus} />
                                </icon>
                                <icon type="button" className="popups-btn" title="Remove Row" onClick={handleRemoveRow}>
                                    <FontAwesomeIcon icon={faMinus} />
                                </icon>
                            </div>
                        </div>

                        <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                            <AgGridReact
                                columnDefs={activeTable === 'myTable' ? columnDefs : columnDefsTax}
                                rowData={activeTable === 'myTable' ? rowData : rowDataTax}
                                defaultColDef={{ editable: true, resizable: true }}
                                rowSelection="multiple"
                            />
                        </div>
                    </div>

                    <PurchaseItemPopup open={open} handleClose={() => setOpen(false)} handleItem={() => {}} />
                    <PurchaseWarehousePopup open={open1} handleClose={() => setOpen1(false)} handleWarehouse={() => {}} />
                    <PurchasePopup open={openPurchaseHelp} handleClose={() => setOpenPurchaseHelp(false)} handlePurchaseData={handlePurchaseDataSelect} selectedPartyCode={partyName || ""} />
                    <SalesHdrPopup open={openSalesHelp} handleClose={() => setOpenSalesHelp(false)} handleData={handleSalesDataSelect} selectedPartyCode={partyName || ""} />
                    <PurchaseReturnView open={openPurchaseReturnHelp} handleClose={() => setOpenPurchaseReturnHelp(false)} handleItemView={() => {}} selectedPartyCode={partyName || ""} />
                    <SalesRetrunView open={openSalesReturnHelp} handleClose={() => setOpenSalesReturnHelp(false)} handleDataView={() => {}} selectedPartyCode={partyName || ""} />
                    <DebitCrediNoteHelp open={openDebitCreditNoteHelp} handleClose={() => setOpenDebitCreditNoteHelp(false)} handlePaymentData={handlePaymentData} />
                    <PurchaseVendorPopup open={openVendorPartyHelp} handleClose={() => setOpenVendorPartyHelp(false)} handleVendor={handleVendor} />
                    <SalesVendorPopup open={openCustomerPartyHelp} handleClose={() => setOpenCustomerPartyHelp(false)} handleVendor={handleCustomer} />

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
            ) : (
                <div className="container-fluid Topnav-screen">
                    {loading && <LoadingScreen />}
                    <ToastContainer position="top-right" className="toast-design" theme="colored" />

                    <div className="shadow-lg p-2 bg-body-tertiary rounded mb-2 mt-2">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div className="d-flex align-items-center">
                                <h1 className="purbut">Deleted Payment</h1>
                            </div>

                            <div className="d-flex align-items-center gap-3 my-1">
                                <div className="form-group mb-2" style={{ minWidth: '180px' }}>
                                    <label htmlFor="deletedNoteType">Note Type</label>
                                    <input id="deletedNoteType" type="text" className="exp-input-field form-control bg-light" value={deletedNoteType} readOnly />
                                </div>

                                <div className="form-group mb-2" style={{ minWidth: '160px' }}>
                                    <label htmlFor="deletedTransactionDate">Date</label>
                                    <input id="deletedTransactionDate" type="date" className="exp-input-field form-control bg-light" value={deletedTransactionDate} readOnly />
                                </div>

                                <div className="form-group mb-2" style={{ minWidth: '220px' }}>
                                    <label htmlFor="deletedTransactionNumber">Transaction No</label>
                                    <div className="exp-form-floating position-relative">
                                        <input
                                            id="deletedTransactionNumber"
                                            className="exp-input-field form-control"
                                            type="text"
                                            value={deletedTransactionNumber}
                                            onChange={(e) => setDeletedTransactionNumber(e.target.value)}
                                            onKeyDown={handleDeleteNoteNoKeyDown}
                                            maxLength={50}
                                            autoComplete="off"
                                        />
                                        <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                                            <span className="icon searchIcon" title="Search Deleted Transaction" onClick={handleDelDebitCreditNoteHelp}>
                                                <i className="fa fa-search"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex align-items-center gap-2 purbut">
                                <div className="exp-form-floating" style={{ minWidth: '160px' }} title="Select Screen Action">
                                    <Select
                                        id="returnType"
                                        className="exp-input-field"
                                        value={selectedscreens}
                                        onChange={handleChangeScreens}
                                        options={filteredOptionScreens}
                                        styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                                    />
                                </div>

                                <printbutton type="button" className="purbut btn" title="Reload Page" onClick={handleReload}>
                                    <i className="fa-solid fa-arrow-rotate-right"></i>
                                </printbutton>
                            </div>
                        </div>
                    </div>

                    <div className="shadow-lg p-1 bg-body-tertiary rounded pt-3 pb-4" align="left">
                        <div className="row ms-3 me-3">
                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="deletedPartyType" className="exp-form-labels">Payment Type</label>
                                <input id="deletedPartyType" type="text" className="exp-input-field form-control bg-light" value={deletedPartyType} readOnly />
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="deletedPartyType" className="exp-form-labels">Vendor / Customer Type</label>
                                <input id="deletedPartyType" type="text" className="exp-input-field form-control bg-light" value={deletedPartyType} readOnly />
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="deletedPartyName">Vendor / Customer Name</label>
                                <input id="deletedPartyName" type="text" className="exp-input-field form-control bg-light" value={deletedPartyName} readOnly />
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="deletedRefType">Payment Mode</label>
                                <input id="deletedRefType" type="text" className="exp-input-field form-control bg-light" value={deletedRefType} readOnly />
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="deletedReason">Bank / Cash Account</label>
                                <input id="deletedReason" type="text" className="exp-input-field form-control bg-light" value={deletedReason} readOnly />
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="deletedRefTransactionNumber">Reference No</label>
                                <input id="deletedRefTransactionNumber" type="text" className="exp-input-field form-control bg-light" value={deletedRefTransactionNumber} readOnly />
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="deletedRefTransactionDate">Reference Date</label>
                                <input id="deletedRefTransactionDate" type="date" className="exp-input-field form-control bg-light" value={deletedRefTransactionDate} readOnly />
                            </div>

                            <div className="col-md-3 form-group mb-2">
                                <label htmlFor="deletedRefNo">Amount</label>
                                <input id="deletedRefNo" type="text" className="exp-input-field form-control bg-light" value={deletedRefNo} readOnly />
                            </div>

                            <div className="col-md-6 form-group mb-2">
                                <label htmlFor="deletedNarration">Remarks</label>
                                <textarea id="deletedNarration" className="exp-input-field form-control bg-light" value={deletedNarration} rows="2" readOnly />
                            </div>
                        </div>
                    </div>

                    <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4">
                        <div className="d-flex justify-content-between">
                            <div align="left" className="d-flex justify-content-start ms-5">
                                <purButton type="button" className={`"toggle-btn" ${activeTable === 'myTable' ? 'active' : ''}`} onClick={() => handleToggleTable('myTable')}>
                                    Item Details
                                </purButton>
                                <purButton type="button" className={`"toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`} onClick={() => handleToggleTable('tax')}>
                                    Tax Details
                                </purButton>
                            </div>
                        </div>

                        <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                            <AgGridReact
                                columnDefs={activeTable === 'myTable' ? deletedColumnDefs : deletedColumnDefsTax}
                                rowData={activeTable === 'myTable' ? deletedRowData : deletedRowDataTax}
                                defaultColDef={{ editable: false, resizable: true }}
                            />
                        </div>
                    </div>

                    <DeletedDebitCrediNoteHelp
                        open={openDelDebitCreditNoteHelp}
                        handleClose={() => setOpenDelDebitCreditNoteHelp(false)}
                        handleDeleteDebitCreditData={handleDeleteDebitCreditData}
                    />
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
            )}
        </div>
    );
}

export default Payment;