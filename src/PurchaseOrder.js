import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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
import PurchaseOrderItemPopup from './PurchaseOrderItemPopup';
import PurchaseOrderPopup from './PurchaseOrderPopup';
import PurchaseWarehousePopup from './PurchaseWarehousePopup';
import './mobile.css';
import labels from './Labels';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import PoCustomerPopup from './SalesVendorPopup';
import PoVendorPopup from './PurchaseVendorPopup';
import { ToastContainer, toast } from "react-toastify";
import { showConfirmationToast } from './ToastConfirmation';
import { useLocation } from 'react-router-dom';
import Select from 'react-select';
import DeletedPoPopup from './DeletedPoPopup';
import PoShipToVendorPopup from './POShipToVendorPopup';
import { useNavigate } from "react-router-dom";
import LZString from "lz-string";
import LoadingScreen from './Loading';

const config = require('./Apiconfig');


function PurchaseOrder() {

  const [rowData, setRowData] = useState([{ serialNumber: 1, itemCode: '', itemName: '', warehouse: '', purchaseQty: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }]);
  const [rowDataTerms, setrowDataTerms] = useState([{ serialNumber: 1, Terms_conditions: '' }]);
  const [rowDataTax, setRowDataTax] = useState([]);
  const [activeTable, setActiveTable] = useState('myTable');
  const [entryDate, setEntryDate] = useState("");
  const [TotalBill, setTotalBill] = useState('');
  const [TotalTax, setTotalTax] = useState(0)
  const [TotalPurchase, setTotalPurchase] = useState(0)
  const [round_difference, setRoundDifference] = useState(0)
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [clickedRowIndex, setClickedRowIndex] = useState(null)
  const [global, setGlobal] = useState(null)
  const [globalItem, setGlobalItem] = useState(null)
  const [transactionNo, setTransactionNo] = useState("")
  const [buttonsVisible, setButtonsVisible] = useState(true);
  const [delButtonVisible, setDelButtonVisible] = useState(false);
  const [printButtonVisible, setPrintButtonVisible] = useState(false);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [showAsterisk, setShowAsterisk] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [party, setParty] = useState(null);
  const [partyDrop, setPartyDrop] = useState([]);
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [Type, setType] = useState("PurchaseOrder");

  const [additionalData] = useState({
    modified_by: '',
    created_by: '',
    modified_date: '',
    created_date: ''
  });

  const [financialYearStart, setFinancialYearStart] = useState('');
  const [financialYearEnd, setFinancialYearEnd] = useState('');
  const [screensDrop, setScreensDrop] = useState([]);
  const [Screens, setScreens] = useState('');
  const [selectedscreens, setSelectedscreens] = useState(null);

  const location = useLocation();
  const savedPath = sessionStorage.getItem('currentPath');

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const purchaseOrderPermission = permissions
    .filter(permission => permission.screen_type === 'PurchaseOrder')
    .map(permission => permission.permission_type.toLowerCase());


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDefaultoptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        Screen_Type: Type

      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) return;

        const { Shiping_to } = data[0];

        const setDefault = (type, setType, options, setSelected) => {
          if (type) {
            setType(type);
            setSelected(options.find((opt) => opt.value === type) || null);
          }
        };


        setDefault(Shiping_to, setParty, filteredOptionParty, setSelectedParty);



      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [partyDrop]);

  useEffect(() => {
    const currentPath = location.pathname;
    console.log(`Current path: ${currentPath}`);
    if (savedPath !== '/PurchaseOrder') {
      sessionStorage.getItem('PurchaseOrderScreenSelection');
    }
  }, [location]);

  useEffect(() => {
    const savedScreen = sessionStorage.getItem('PurchaseOrderScreenSelection');
    if (savedScreen) {
      setSelectedscreens({ value: savedScreen, label: savedScreen === 'Add' ? 'Add' : 'Delete' });
      setScreens(savedScreen);
    } else {
      setSelectedscreens({ value: 'Add', label: 'Add' });
      setScreens('Add');
    }
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),

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
    sessionStorage.setItem('PurchaseOrderScreenSelection', screenValue);
  };

  const filteredOptionScreens = screensDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/TermsPO`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_code: sessionStorage.getItem("selectedCompanyCode"),

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

  const columnDefsTax = [
    {
      headerName: 'S.No',
      field: 'ItemSNO',
      maxWidth: 80,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax S.No',
      field: 'TaxSNO',
      maxWidth: 120,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Item Code',
      field: 'Item_code',
      // minWidth: 315,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax Type ',
      field: 'TaxType',
      // minWidth: 201,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax %',
      field: 'TaxPercentage',
      // minWidth: 201,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax Amount',
      field: 'TaxAmount',
      // minWidth: 201,
      sortable: false,
      editable: false
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

  const handlePurchase = () => {
    setOpen3(true);
  };



  //Item Name Popup
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [open4, setOpen4] = React.useState(false);
  const [open6, setOpen6] = React.useState(false);

  //Item Popup
  const handleClickOpen = (params) => {
    const GlobalSerialNumber = params.data.serialNumber
    setGlobal(GlobalSerialNumber)
    const GlobalItem = params.data.itemCode
    setGlobalItem(GlobalItem)
    setOpen(true);
    console.log('Opening popup...');
  };

  const handleClose = () => {
    setOpen(false);
    setOpen1(false);
    setOpen2(false);
    setOpen3(false);
    setOpen4(false);
    setOpen5(false);
    setOpen6(false);
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getGSTReport`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPartyDrop(data);
        const defaultParty = data.find((item) => item.descriptions === "Customer") || data[0];
        if (defaultParty) {
          setSelectedParty({
            value: defaultParty.descriptions,
            label: defaultParty.descriptions,
          });
          setParty(defaultParty.descriptions);
        }
      })
      .catch((error) => console.error("Error fetching invoice types:", error));
  }, []);

  const filteredOptionParty = Array.isArray(partyDrop)
    ? partyDrop.map((option) => ({
      value: option.descriptions,
      label: option.descriptions,
    }))
    : [];

  const handleChangeParty = (selectedParty) => {
    setSelectedParty(selectedParty);
    const selectedValue = selectedParty ? selectedParty.value : "";

    setParty(selectedValue);

    // if (selectedValue === "Customer") {
    //   const shipToField = headerRowData.find((row) => row.fieldName === "Vendor / Customer Code");
    //   if (shipToField?.shipTo) {
    //     handleCustomerDetailsShipTo(shipToField.shipTo);
    //   }
    // } else if (selectedValue === "Vendor") {
    //   const shipToField = headerRowData.find((row) => row.fieldName === "Vendor / Customer Code");
    //   if (shipToField?.shipTo) {
    //     handleVendorDetailsShipTo(shipToField.shipTo);
    //   }
    // }
  };

  const onCellValueChangedBillTo = (params) => {
    if (params.data.fieldName === "Vendor / Customer Code") {
      if (!params.data.billTo) {
        setHeaderRowData((prevData) =>
          prevData.map((row) => ({
            ...row,
            billTo: row.fieldName === "Vendor / Customer Code" ? row.billTo : "", // Retain only Customer Code field's value
          }))
        );
      } else {
        handleCustomerDetailsBillTo(params.data.billTo);
      }
    }
  };

  const onCellValueChangedShipTo = (params) => {
    if (party === "Customer") {
      if (params.data.fieldName === "Vendor / Customer Code") {
        if (!params.data.shipTo) {
          setHeaderRowData((prevData) =>
            prevData.map((row) => ({
              ...row,
              shipTo: row.fieldName === "Vendor / Customer Code" ? row.shipTo : "", // Retain only Customer Code field's value
            }))
          );
        } else {
          handleCustomerDetailsShipTo(params.data.shipTo);
        }
      }
    }
    else if (party === "Vendor") {
      if (params.data.fieldName === "Vendor / Customer Code") {
        if (!params.data.shipTo) {
          setHeaderRowData((prevData) =>
            prevData.map((row) => ({
              ...row,
              shipTo: row.fieldName === "Vendor / Customer Code" ? row.shipTo : "", // Retain only Customer Code field's value
            }))
          );
        } else {
          handleVendorDetailsShipTo(params.data.shipTo);
        }
      }
    }
  };

  const columnHeader = [
    { headerName: 'Details', field: 'fieldName', maxWidth: 240, editable: false },
    {
      headerName: 'Bill To',
      field: 'billTo',
      editable: true,
      cellEditorParams: {
        maxLength: 250
      },
      onCellValueChanged: onCellValueChangedBillTo,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 150;
        const showSearchIcon = params.data.fieldName === "Vendor / Customer Code" && isWideEnough;

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
      cellEditorParams: {
        maxLength: 250
      },
      onCellValueChanged: onCellValueChangedShipTo,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 150;
        const showSearchIcon = params.data.fieldName === "Vendor / Customer Code" && isWideEnough;

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
                onClick={() => {
                  if (party === 'Vendor') {
                    handleShipToVendor();
                  } else if (party === 'Customer') {
                    handleShipToCustomer();
                  }
                }}
              >
                <i className="fa fa-search"></i>
              </span>
            )}
          </div>
        );
      },
    }
  ];

  const DateEditor = forwardRef((props, ref) => {
    const [value, setValue] = useState(props.value || "");

    useImperativeHandle(ref, () => ({
      getValue: () => value,
    }));

    return (
      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
    );
  });

  const columnNotes = [
    { headerName: 'Details', field: 'fieldName', editable: false },
    {
      headerName: "Notes",
      field: "notes",
      editable: true,
      cellEditorSelector: (params) => {
        if (params.data.fieldName === "Deliever Date") {
          return { component: DateEditor };
        }
        return { component: "agTextCellEditor" };
      },
    },
  ];

  const handleShipToCustomer = () => {
    setOpen2(true);
  };

  const handleBillToCustomer = () => {
    setOpen4(true);
  };

  const handleShipToVendor = () => {
    setOpen6(true);
  };

  const [headerRowData, setHeaderRowData] = useState([
    { fieldName: 'Vendor / Customer Code', billTo: '', shipTo: '' },
    { fieldName: 'Vendor / Customer Name', billTo: '', shipTo: '' },
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

  const [notesRowData, setNotesRowData] = useState([
    { fieldName: 'Credit', notes: '', },
    { fieldName: 'Deliever Date', notes: '', },
    { fieldName: 'Remarks', notes: '', },
  ]);

  const handleCustomerDetailsBillTo = async (vendorCode) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getVendorDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor_code: vendorCode,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (response.ok) {
        const searchData = await response.json();

        if (searchData.length === 0) {
          toast.warning("Customer code is not available!");
          return;
        }

        const [{ vendor_code, vendor_name, vendor_addr_1, vendor_addr_2, vendor_addr_3, vendor_addr_4, vendor_state_code,
          vendor_country_code, vendor_mobile_no, contact_person, vendor_gst_no }] = searchData;

        setHeaderRowData((prevRowData) =>
          prevRowData.map((row) => {
            switch (row.fieldName) {
              case 'Vendor / Customer Code': return { ...row, billTo: vendor_code };
              case 'Vendor / Customer Name': return { ...row, billTo: vendor_name };
              case 'Address 1': return { ...row, billTo: vendor_addr_1 };
              case 'Address 2': return { ...row, billTo: vendor_addr_2 };
              case 'Address 3': return { ...row, billTo: vendor_addr_3 };
              case 'Address 4': return { ...row, billTo: vendor_addr_4 };
              case 'State': return { ...row, billTo: vendor_state_code };
              case 'Country': return { ...row, billTo: vendor_country_code };
              case 'Mobile No': return { ...row, billTo: vendor_mobile_no };
              case 'GST No': return { ...row, billTo: vendor_gst_no };
              case 'Contact Person': return { ...row, billTo: contact_person };
              default: return row;
            }
          })
        );
      } else if (response.status === 404) {
        toast.warning("Data not found", {
          // onClose: () => {
          //   setHeaderRowData((prevRowData) =>
          //     prevRowData.map((row) => ({
          //       ...row,
          //       billTo: "",
          //     }))
          //   );
          // },
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("An error occurred while fetching customer details.");
    }
  };

  const handleVendorDetailsShipTo = async (vendorCode) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getVendorDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendor_code: vendorCode,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }),
      });

      if (response.ok) {
        const searchData = await response.json();

        if (searchData.length === 0) {
          toast.warning("Customer code is not available!");
          return;
        }

        const [{ vendor_code, vendor_name, vendor_addr_1, vendor_addr_2, vendor_addr_3, vendor_addr_4, vendor_state_code,
          vendor_country_code, vendor_mobile_no, contact_person, vendor_gst_no }] = searchData;

        setHeaderRowData((prevRowData) =>
          prevRowData.map((row) => {
            switch (row.fieldName) {
              case 'Vendor / Customer Code': return { ...row, shipTo: vendor_code };
              case 'Vendor / Customer Name': return { ...row, shipTo: vendor_name };
              case 'Address 1': return { ...row, shipTo: vendor_addr_1 };
              case 'Address 2': return { ...row, shipTo: vendor_addr_2 };
              case 'Address 3': return { ...row, shipTo: vendor_addr_3 };
              case 'Address 4': return { ...row, shipTo: vendor_addr_4 };
              case 'State': return { ...row, shipTo: vendor_state_code };
              case 'Country': return { ...row, shipTo: vendor_country_code };
              case 'Mobile No': return { ...row, shipTo: vendor_mobile_no };
              case 'GST No': return { ...row, shipTo: vendor_gst_no };
              case 'Contact Person': return { ...row, shipTo: contact_person };
              default: return row;
            }
          })
        );
      } else if (response.status === 404) {
        toast.warning("Data not found", {
          // onClose: () => {
          //   setHeaderRowData((prevRowData) =>
          //     prevRowData.map((row) => ({
          //       ...row,
          //       shipTo: "",
          //     }))
          //   );
          // },
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("An error occurred while fetching customer details.");
    }
  };

  const handleCustomerDetailsShipTo = async (customerCode) => {
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
              case 'Vendor / Customer Code': return { ...row, shipTo: customer_code };
              case 'Vendor / Customer Name': return { ...row, shipTo: customer_name };
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
        toast.warning("Data not found", {
          onClose: () => {
            setHeaderRowData((prevRowData) =>
              prevRowData.map((row) => ({
                ...row,
                shipTo: "",
              }))
            );
          },
        });
      } else {
        console.log("Bad request");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleVendorBillTo = async (data) => {
    if (data && data.length > 0) {
      const [{ VendorCode, VendorName, Address1, Address2, Address3, Address4, State, Country, MobileNo, ContactPerson, GSTNo }] = data;

      setHeaderRowData((prevRowData) =>
        prevRowData.map((row) => {
          switch (row.fieldName) {
            case 'Vendor / Customer Code': return { ...row, billTo: VendorCode };
            case 'Vendor / Customer Name': return { ...row, billTo: VendorName };
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

  const handleVendorShipTo = async (data) => {
    if (data && data.length > 0) {
      const [{ VendorCode, VendorName, Address1, Address2, Address3, Address4, State, Country, MobileNo, ContactPerson, GSTNo }] = data;

      setHeaderRowData((prevRowData) =>
        prevRowData.map((row) => {
          switch (row.fieldName) {
            case 'Vendor / Customer Code': return { ...row, shipTo: VendorCode };
            case 'Vendor / Customer Name': return { ...row, shipTo: VendorName };
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

  const handleCustomerShipTo = async (data) => {
    if (data && data.length > 0) {
      const [{ CustomerCode, CustomerName, Address1, Address2, Address3, Address4, State, Country, MobileNo, ContactPerson, GSTNo }] = data;

      setHeaderRowData((prevRowData) =>
        prevRowData.map((row) => {
          switch (row.fieldName) {
            case 'Vendor / Customer Code': return { ...row, shipTo: CustomerCode };
            case 'Vendor / Customer Name': return { ...row, shipTo: CustomerName };
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

  const handleSwiftButtonClick = () => {
    const updatedRowData = headerRowData.map(row => ({
      ...row,
      shipTo: row.billTo
    }));
    setHeaderRowData(updatedRowData);
  };

  //CODE FOR TOTAL WEIGHT, TOTAL TAX AND TOTAL AMOUNT CALCULATION
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
          bill_qty: params.data.purchaseQty,
          purchaser_amt: params.data.purchaseAmt,
          tax_type_header: params.data.taxType,
          tax_name_details: params.data.taxDetails,
          tax_percentage: params.data.taxPer,
          keyfield: params.data.keyField
        })
      });

      if (response.ok) {
        const searchData = await response.json();

        // Update rowData
        const updatedRowData = rowData.map(row => {
          if (row.itemCode === params.data.itemCode && row.serialNumber === params.data.serialNumber) {
            const matchedItem = searchData.find(item => item.id === row.id);
            if (matchedItem) {
              return {
                ...row,
                ItemTotalWight: formatToTwoDecimalPoints(matchedItem.ItemTotalWight ?? 0),
                TotalItemAmount: formatToTwoDecimalPoints(matchedItem.TotalItemAmount ?? 0),
                TotalTaxAmount: formatToTwoDecimalPoints(matchedItem.TotalTaxAmount ?? 0)
              };
            }
          }
          return row;
        });
        setRowData(updatedRowData);

        setRowDataTax((prevRowDataTax) => {
          let updatedRowDataTaxCopy = [...prevRowDataTax];

          searchData.forEach(item => {
            updatedRowDataTaxCopy = updatedRowDataTaxCopy.filter(row =>
              !(row.ItemSNO === item.ItemSNO && row.TaxSNO === item.TaxSNO)
            );

            const newRow = {
              ItemSNO: item.ItemSNO,
              TaxSNO: item.TaxSNO,
              Item_code: item.Item_code,
              TaxType: item.TaxType,
              TaxPercentage: item.TaxPercentage ?? 0,
              TaxAmount: parseFloat(item.TaxAmount ?? 0).toFixed(2),
              ItemTotalWight: parseFloat(item.ItemTotalWight ?? 0).toFixed(2),
              keyfield: item.keyfield,
            };

            updatedRowDataTaxCopy.push(newRow);
          });

          updatedRowDataTaxCopy.sort((a, b) => a.ItemSNO - b.ItemSNO);

          return updatedRowDataTaxCopy;
        });

        const hasPurchaseQty = updatedRowData.some(row => row.purchaseQty >= 0);

        if (hasPurchaseQty) {
          const totalItemAmounts = updatedRowData.map(row => row.TotalItemAmount || 0).join(',');
          const totalTaxAmounts = updatedRowData.map(row => row.TotalTaxAmount || 0).join(',');

          const formattedTotalItemAmounts = totalItemAmounts.endsWith(',') ? totalItemAmounts.slice(0, -1) : totalItemAmounts;
          const formattedTotalTaxAmounts = totalTaxAmounts.endsWith(',') ? totalTaxAmounts.slice(0, -1) : totalTaxAmounts;

          console.log("formattedTotalItemAmounts", formattedTotalItemAmounts);
          console.log("formattedTotalTaxAmounts", formattedTotalTaxAmounts);

          // Call for total amount calculation
          await TotalAmountCalculation(formattedTotalTaxAmounts, formattedTotalItemAmounts);

          console.log("TotalAmountCalculation executed successfully");
        } else {
          console.log("No rows with purchaseQty greater than 0 found");
        }

        console.log("Data fetched and updated successfully");
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
        const response = await fetch(`${config.apiBaseUrl}/TotalAmountCalculation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Tax_amount: formattedTotalTaxAmounts, Putchase_amount: formattedTotalItemAmounts, company_code: sessionStorage.getItem("selectedCompanyCode") }),
        });
        if (response.ok) {
          const data = await response.json();
          const [{ rounded_amount, round_difference, TotalPurchase, TotalTax }] = data;
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
                warehouse: matchedItem.warehouse,
                keyField: `${row.serialNumber || ''}-${matchedItem.Item_code || ''}`
              };
            }
          }
          return row;
        });
        setRowData(updatedRow);
        console.log(updatedRow);
      } else if (response.status === 404) {
        toast.warning('Data not found');
        const updatedRowData = rowData.map(row => {
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
              warehouse: ''
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

  const handleKeyPressRef = (e) => {
    if (e.key === 'Enter') {
      handleRefNo(transactionNo)
    }
  };

  //CODE ITEM CODE TO ADD NEW ROW FUNCTION
  const handleCellValueChanged = (params) => {
    const { colDef, rowIndex, newValue } = params;
    const lastRowIndex = rowData.length - 1;

    if (colDef.field === 'purchaseQty') {
      const quantity = parseFloat(newValue);

      if (quantity > 0 && rowIndex === lastRowIndex) {
        const serialNumber = rowData.length + 1;
        const newRowData = {
          serialNumber,
          itemCode: null,
          itemName: null,
          purchaseQty: 0,
          purchaseAmt: null,
          totalWeight: null,
          taxAmt: null,
          totalAmt: null,
        };

        setRowData(prevRowData => [...prevRowData, newRowData]);
      }
    }
  };

  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.serialNumber;

    const updatedRowData = rowData.filter(row => Number(row.serialNumber) !== Number(serialNumberToDelete));
    const updatedRowDataTax = rowDataTax.filter(row => Number(row.ItemSNO) !== Number(serialNumberToDelete));

    setRowData(updatedRowData);
    setRowDataTax(updatedRowDataTax);

    if (updatedRowData.length === 0) {
      const newRow = {
        serialNumber: 1,
        itemCode: '',
        itemName: '',
        unitWeight: '',
        warehouse: '',
        purchaseQty: 0,
        ItemTotalWight: 0,
        purchaseAmt: 0,
        TotalTaxAmount: 0,
        TotalItemAmount: 0
      };
      setRowData([newRow]);

      TotalAmountCalculation('0.00', '0.00');
    } else {
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

      const totalItemAmounts = updatedRowDataWithNewSerials.reduce((sum, row) => sum + parseFloat(row.TotalItemAmount || '0.00'), 0).toFixed(2);
      const totalTaxAmounts = updatedRowDataWithNewSerials.reduce((sum, row) => sum + parseFloat(row.TotalTaxAmount || '0.00'), 0).toFixed(2);

      TotalAmountCalculation(totalTaxAmounts, totalItemAmounts);
    }
  };

  function qtyValueSetter(params) {
    const newValue = parseFloat(params.newValue);

    if (isNaN(newValue) || params.newValue.toString().trim() === '' || params.newValue.toString().match(/[^0-9.]/)) {
      toast.warning('Please enter a valid numeric quantity.');
      return false;
    }

    if (newValue < 0) {
      toast.warning('Quantity cannot be negative.');
      return false;
    }

    params.data.purchaseQty = newValue;
    return true;
  }

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
      onCellValueChanged: function (params) {
        handleItemCode(params);
      },
      sortable: false,
    },
    {
      headerName: 'Item Name',
      field: 'itemName',
      editable: true,
      filter: true,
      sortable: false,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 30;
        const showSearchIcon = isWideEnough;

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
                  right: '-10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
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
    //   headerName: '',
    //   field: 'Search',
    //   editable: true,
    //   maxWidth: 25,
    //   tooltipValueGetter: (params) =>
    //     "Item Help",
    //   onCellClicked: handleClickOpen,
    //   cellRenderer: function () {
    //     return <FontAwesomeIcon icon="fa-solid fa-magnifying-glass-plus" style={{ cursor: 'pointer', marginRight: "12px" }} />
    //   },
    //   cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    //   sortable: false,
    //   filter: false
    // },
    {
      headerName: 'Qty',
      field: 'purchaseQty',
      editable: true,
      filter: true,
      sortable: false,
      // minWidth: 150,
      valueSetter: qtyValueSetter,
    },
    {
      headerName: 'Unit Price',
      field: 'purchaseAmt',
      editable: true,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Tax Amount',
      field: 'TotalTaxAmount',
      editable: true,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Total',
      field: 'TotalItemAmount',
      editable: true,
      filter: true,
      sortable: false,
      // minWidth: 201,
    },
    {
      headerName: 'Purchase Tax Type',
      field: 'taxType',
      editable: true,
      hide: true,
      filter: true,

      sortable: false
    },
    {
      headerName: 'Tax Detail',
      field: 'taxDetails',
      editable: true,
      filter: true,
      hide: true,
      sortable: false
    },
    {
      headerName: 'tax Percentage',
      field: 'taxPer',
      editable: true,
      filter: true,
      hide: true,
      sortable: false
    },
    {
      headerName: 'KeyField',
      field: 'keyField',
      editable: false,
      // minWidth: 150,
      filter: true,
      sortable: false,
      hide: true,
    },
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
      maxLength: 250,
      minHeight: 50,
      maxHeight: 50,
      sortable: false,
      editable: true,
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

  const handleSaveButtonClick = async () => {
    if (!entryDate) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (rowData.length === 0 || rowDataTax.length === 0) {
      toast.warning("No item details or tax details found to save.");
      return;
    }

    const filteredRowData = rowData.filter(row => row.purchaseQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0);

    if (filteredRowData.length === 0) {
      toast.warning("Please check Qty, Unit price and Total values are greater than Zero");
      return;
    }

    try {

      const notes = notesRowData.reduce((acc, row) => {
        acc[row.fieldName] = row.notes;
        return acc;
      }, {});

      const Header = {
        company_code: sessionStorage.getItem("selectedCompanyCode"),
        vendor_code: headerRowData[0].billTo,
        Entry_date: entryDate,
        purchase_amount: TotalPurchase,
        tax_amount: TotalTax,
        total_amount: TotalBill,
        rounded_off: round_difference,
        created_by: sessionStorage.getItem("selectedUserCode"),
        delivery_date: notes['Deliever Date'] ? notes['Deliever Date'] : null,
        credit: notes['Credit'] ? notes['Credit'] : null,
        remarks: notes['Remarks'] ? notes['Remarks'] : null,
      };

      const response = await fetch(`${config.apiBaseUrl}/addPurchaseOrderheader`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        const [{ transaction_no }] = searchData;
        setTransactionNo(transaction_no);

        toast.success("Data Inserted Successfully");

        setShowExcelButton(true);
        setDelButtonVisible(true);
        setPrintButtonVisible(true);

        await savePurchaseOrderDetails(transaction_no);
        await savePurchaseOrderTaxDetail(transaction_no);
        await savequoDetailTerms(transaction_no);
        console.log("Data inserted Successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      toast.error("Error inserting data: " + error.message);
    }
  };

  //CODE TO SAVE PURCHASE DETAILS
  const savePurchaseOrderDetails = async (transaction_no) => {
    try {
      const validRows = rowData.filter(row =>
        row.itemCode && row.itemName && row.purchaseQty > 0
      );

      const billToData = headerRowData.reduce((acc, row) => {
        acc[row.fieldName] = row.billTo;
        return acc;
      }, {});

      const shipToData = headerRowData.reduce((acc, row) => {
        acc[row.fieldName] = row.shipTo;
        return acc;
      }, {});

      for (const row of validRows) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          created_by: sessionStorage.getItem('selectedUserCode'),
          transaction_no: transaction_no.toString(),
          item_code: row.itemCode,
          item_name: row.itemName,
          bill_qty: row.purchaseQty,
          item_amt: row.purchaseAmt,
          bill_rate: Number(row.TotalItemAmount),
          tax_amount: Number(row.TotalTaxAmount),
          Entry_date: entryDate,
          ItemSNo: row.serialNumber,
          vendor_code: billToData['Vendor / Customer Code'],
          vendor_name: billToData['Vendor / Customer Name'],
          vendor_addr_1: billToData['Address 1'],
          vendor_addr_2: billToData['Address 2'],
          vendor_addr_3: billToData['Address 3'],
          vendor_addr_4: billToData['Address 4'],
          state: billToData['State'],
          country: billToData['Country'],
          contact_number: billToData['Mobile No'],
          vendor_gst_no: billToData['GST No'],
          contact_person: billToData['Contact Person'],
          ShipTo_customer_code: shipToData['Vendor / Customer Code'],
          ShipTo_customer_name: shipToData['Vendor / Customer Name'],
          ShipTo_customer_addr_1: shipToData['Address 1'],
          ShipTo_customer_addr_2: shipToData['Address 2'],
          ShipTo_customer_addr_3: shipToData['Address 3'],
          ShipTo_customer_addr_4: shipToData['Address 4'],
          ship_to_state: shipToData['State'],
          ship_to_country: shipToData['Country'],
          ship_to_contact_number: shipToData['Mobile No'],
          ShipTo_vendor_gst_no: shipToData['GST No'],
          ship_to_contact_person: shipToData['Contact Person'],
        };

        const response = await fetch(`${config.apiBaseUrl}/addPurchaseOrderdetail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Purchase Detail Data inserted successfully");
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

  const savePurchaseOrderTaxDetail = async (transaction_no) => {
    try {
      const savedRows = new Set();

      for (const row of rowData) {
        const matchingTaxRows = rowDataTax.filter(taxRow => taxRow.Item_code === row.itemCode);

        for (const taxRow of matchingTaxRows) {
          const uniqueKey = `${transaction_no}-${taxRow.ItemSNO}-${taxRow.TaxSNO}`;

          if (savedRows.has(uniqueKey)) {
            continue;
          }

          const vendor_code = headerRowData[0].billTo;

          const Details = {
            vendor_code,
            company_code: sessionStorage.getItem('selectedCompanyCode'),
            transaction_no: transaction_no.toString(),
            tax_type: row.taxType,
            item_code: row.itemCode,
            item_name: row.itemName,
            ItemSNo: taxRow.ItemSNO,
            TaxSNo: taxRow.TaxSNO,
            Entry_date: entryDate,
            tax_name_details: taxRow.TaxType,
            tax_amt: taxRow.TaxAmount,
            tax_per: taxRow.TaxPercentage,
            created_by: sessionStorage.getItem('selectedUserCode')
          };

          const response = await fetch(`${config.apiBaseUrl}/addPOtaxdetail`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Details),
          });

          if (response.ok) {

            console.log("Purchase Detail Data inserted successfully");
            savedRows.add(uniqueKey);
          } else {
            const errorResponse = await response.json();
            console.error(errorResponse.error);
            toast.warning(errorResponse.message);
          }
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };
  const savequoDetailTerms = async (transaction_no) => {
    try {

      const validRows = rowDataTerms.filter(row => row.Terms_conditions.trim() !== '');

      if (validRows.length === 0) {
        toast.warning('No valid Terms & Conditions to save.');
        return;
      }

      for (const row of validRows) {
        const Details = {
          created_by: sessionStorage.getItem('selectedUserCode'),
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          transaction_no: transaction_no,
          Terms_conditions: row.Terms_conditions,
        };

        try {
          const response = await fetch(`${config.apiBaseUrl}/POTermsandConditions`, {
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
            console.error(errorResponse.message); // Log error message
            toast.warning(errorResponse.message || "Failed to save Terms & Conditions");
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

  const handleUpdateButtonClick = async () => {
    if (!transactionNo || !entryDate) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    showConfirmationToast(
      "Are you sure you want to update the data ?",
      async () => {
        setLoading(true);

        try {

          const notes = notesRowData.reduce((acc, row) => {
            acc[row.fieldName] = row.notes;
            return acc;
          }, {});
          const Header = {
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            transaction_no: transactionNo,
            vendor_code: headerRowData[0].billTo,
            Entry_date: entryDate,
            purchase_amount: TotalPurchase,
            tax_amount: TotalTax,
            total_amount: TotalBill,
            rounded_off: round_difference,
            modified_by: sessionStorage.getItem('selectedUserCode'),
            delivery_date: notes['Deliever Date'] ? notes['Deliever Date'] : null,
            credit: notes['Credit'] ? notes['Credit'] : null,
            remarks: notes['Remarks'] ? notes['Remarks'] : null,
          };

          const response = await fetch(`${config.apiBaseUrl}/updPurchaseOrderheader`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Header),
          });

          if (response.ok) {


            await savePurchaseOrderTaxDetail(transactionNo);
            await savePurchaseOrderDetails(transactionNo);
            await savequoDetailTerms(transactionNo);
            setShowExcelButton(true);
            toast.success("Purchase Order Data updated Successfully")

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
      }, () => {
        toast.info("Data update cancelled.");
      }
    );
  };


  const PrintHeaderData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/purchaseOrderhdrprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo })
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
      const response = await fetch(`${config.apiBaseUrl}/purchaseOrderdetprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo })
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

  const PrintSumTax = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/refNumberToPOSumTax`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'), transaction_no: transactionNo.toString() })
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

      if (headerData && detailData) {
        console.log("All API calls completed successfully");

        let url, headerKey, detailKey, taxKey;

        headerKey = 'POheaderData';
        detailKey = 'POdetailData';
        taxKey = 'POtaxData';
        url = '/PurchaseOrderPrint';

        sessionStorage.setItem(headerKey, LZString.compress(JSON.stringify(headerData)));
        sessionStorage.setItem(detailKey, LZString.compress(JSON.stringify(detailData)));
        sessionStorage.setItem(taxKey, LZString.compress(JSON.stringify(taxData)));

        // sessionStorage.setItem('POheaderData', JSON.stringify(headerData));
        // sessionStorage.setItem('POdetailData', JSON.stringify(detailData));
        // sessionStorage.setItem('POtaxData', JSON.stringify(taxData));

        // window.open('/PurchaseOrderPrint', '_blank');

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

  const handleToggleTable = (table) => {
    setActiveTable(table);
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
        existingItemWithSameCode.keyField = `${existingItemWithSameCode.serialNumber || ''}-${existingItemWithSameCode.itemCode || ''}`;
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
          keyField: `${highestSerialNumber}-${item.itemCode || ''}`,
        };
        updatedRowDataCopy.push(newRow);
        return true;
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

      const updatedRowData = rowData.map((row) => {
        if (row.itemCode === globalItem) {
          return {
            ...row,
            warehouse: "",
          };
        }
        return row;
      });
      setRowData(updatedRowData);
      return;
    }

    const updatedRowData = rowData.map((row) => {
      if (row.serialNumber === global) {
        console.log("1st if condition met, row:", row);
        const matchedItem = data.find((item) => item.id === row.id);

        if (matchedItem) {
          console.log("2nd if condition met, matchedItem:", matchedItem);
          return {
            ...row,
            warehouse: matchedItem.warehouse,
          };
        } else {
          console.log("No matching item found for row.id:", row.id);
        }
      } else {
        console.log("No match for row.serialNumber:", row.serialNumber, global);
      }
      return row;
    });

    setRowData(updatedRowData);
  };

  const handleRowClicked = (event) => {
    const clickedRowIndex = event.rowIndex;
    setClickedRowIndex(clickedRowIndex)
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

  // const handleTransactionDateChange = (e) => {
  //   const date = e.target.value;
  //   if (date >= financialYearStart && date <= financialYearEnd) {
  //     setEntryDate(date);
  //   } else {
  //     toast.warning('Transaction date must be between April 1st, 2024 and March 31st, 2025.');
  //   }
  // };

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

  // const formatDate = (isoDateString) => {
  //   const date = new Date(isoDateString);
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // };

  const formatDate = (value) => {
    if (!value) return ''; // if null, undefined, '', etc.

    const date = new Date(value);

    // Optional: handle invalid date explicitly
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Final check: avoid showing 1900-01-01
    if (year === 1900 && month === '01' && day === '01') return '';

    return `${year}-${month}-${day}`;
  };

  const formatToTwoDecimalPoints = (number) => {
    return parseFloat(number).toFixed(2);
  };

  // const formatDateForDisplay = (dateString) => {
  //   if (!dateString) return "";
  //   const dateObj = new Date(dateString);
  //   const day = String(dateObj.getDate()).padStart(2, "0");
  //   const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  //   const year = dateObj.getFullYear();
  //   return `${day}-${month}-${year}`; // Returns dd-mm-yyyy format
  // };

  //   const formatDateForSend = (dateString) => {
  //     if (!dateString) return null;

  //     const parts = dateString.split('-');

  //     if (parts.length === 3) {
  //         const day = parts[0].padStart(2, '0');  // Ensuring day has two digits
  //         const month = parts[1].padStart(2, '0');  // Ensuring month has two digits
  //         const year = parts[2];

  //         // Reformat to YYYY-MM-DD
  //         return `${year}-${month}-${day}`;
  //     } else {
  //         console.error("Invalid date format");
  //         return null;
  //     }
  // };


  const handleRefNo = async (code) => {
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/getPurchaseOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.warning("Data not found");
          clearFormFields();
          setRowDataTax([]);
        } else {
          const errorResponse = await response.json();
          toast.error(errorResponse.message || "An error occurred");
        }
        return;
      }

      setButtonsVisible(false);
      setShowExcelButton(true);
      setDelButtonVisible(true);
      setPrintButtonVisible(true);
      setShowAsterisk(true);
      setShowUpdateButton(true);

      const searchData = await response.json();
      if (searchData.Header && searchData.Header.length > 0) {
        console.log(searchData.Header[0])
        const item = searchData.Header[0];

        setEntryDate(formatDate(item.Entry_date));
        setTransactionNo(item.transaction_no)
        setTotalPurchase(item.purchase_amount)
        setTotalBill(item.total_amount)
        setRoundDifference(item.rounded_off)
        setTotalTax(item.tax_amount)

        setNotesRowData([
          { fieldName: "Credit", notes: item.credit },
          { fieldName: "Deliever Date", notes: formatDate(item.delivery_date) },
          { fieldName: "Remarks", notes: item.remarks },
        ]);

      } else {
        console.log("Header Data is empty or not found");
        setEntryDate('');
        setTransactionNo('');
        setTotalPurchase('');
        setTotalBill('');
        setRoundDifference('');
        setTotalTax('');
        setNotesRowData([]);
      }

      if (searchData.Detail && searchData.Detail.length > 0) {
        const item = searchData.Detail[0];

        const updatedRowData = searchData.Detail.map(item => {
          const matchingDetails = searchData.TaxDetail.filter(
            (detailItem) => detailItem.ItemSNo === item.ItemSNo
          );
          const taxDetails = matchingDetails.map((detail) => detail.tax_name_details).join(', ');
          const taxPer = matchingDetails.map((detail) => detail.tax_per).join(', ');
          const taxType = matchingDetails.length > 0 ? matchingDetails[0].tax_type : '';

          return {
            serialNumber: item.ItemSNo,
            itemCode: item.item_code,
            itemName: item.item_name,
            purchaseQty: item.bill_qty,
            purchaseAmt: item.item_amt,
            taxType,
            taxDetails,
            taxPer,
            keyField: `${item.ItemSNo}-${item.item_code || ''}`,
            TotalTaxAmount: parseFloat(item.tax_amount).toFixed(2),
            TotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
          };
        });

        setHeaderRowData([
          { fieldName: 'Vendor / Customer Code', billTo: item.vendor_code, shipTo: item.ShipTo_customer_code },
          { fieldName: 'Vendor / Customer Name', billTo: item.vendor_name, shipTo: item.ShipTo_customer_name },
          { fieldName: 'Address 1', billTo: item.vendor_addr_1, shipTo: item.ShipTo_customer_addr_1 },
          { fieldName: 'Address 2', billTo: item.vendor_addr_2, shipTo: item.ShipTo_customer_addr_2 },
          { fieldName: 'Address 3', billTo: item.vendor_addr_3, shipTo: item.ShipTo_customer_addr_3 },
          { fieldName: 'Address 4', billTo: item.vendor_addr_4, shipTo: item.ShipTo_customer_addr_4 },
          { fieldName: 'State', billTo: item.state, shipTo: item.ship_to_state },
          { fieldName: 'Country', billTo: item.country, shipTo: item.ship_to_country },
          { fieldName: 'Mobile No', billTo: item.contact_number, shipTo: item.ship_to_contact_number }, // Assuming no mobile numbers are fetched
          { fieldName: 'GST No', billTo: item.vendor_gst_no, shipTo: item.ShipTo_vendor_gst_no }, // Assuming no mobile numbers are fetched
          { fieldName: 'Contact Person', billTo: item.contact_person, shipTo: item.ship_to_contact_person }
        ]);

        setRowData(updatedRowData);
      } else {
        console.log("Detail Data is empty or not found");
        setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', search: '', unitWeight: 0, warehouse: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }])
      }
      if (searchData.TaxDetail && searchData.TaxDetail.length > 0) {
        const updatedRowDataTax = searchData.TaxDetail.map(item => {
          return {
            ItemSNO: item.ItemSNo,
            TaxSNO: item.TaxSNo,
            Item_code: item.item_code,
            TaxType: item.tax_name_details,
            TaxPercentage: item.tax_per,
            TaxAmount: parseFloat(item.tax_amt).toFixed(2),
            TaxName: item.tax_type,
            keyfield: `${item.ItemSNo}-${item.item_code || ''}`,
          };
        });

        console.log(updatedRowDataTax);
        setRowDataTax(updatedRowDataTax);
      } else {
        console.log("Detail Data is empty or not found");
        setRowData([{ serialNumber: 1, delete: '', itemCode: '', itemName: '', search: '', unitWeight: 0, warehouse: '', purchaseQty: 0, ItemTotalWight: 0, purchaseAmt: 0, TotalTaxAmount: 0, TotalItemAmount: 0 }])
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
        setrowDataTerms([])
      }
      console.log("data fetched successfully")
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const clearFormFields = () => {
    setEntryDate('');
    setTransactionNo('');
    setTotalPurchase('');
    setTotalBill('');
    setRoundDifference('');
    setTotalTax('');
    setRowData([{
      serialNumber: 1,
      delete: '',
      itemCode: '',
      itemName: '',
      search: '',
      unitWeight: 0,
      warehouse: '',
      purchaseQty: 0,
      ItemTotalWight: 0,
      purchaseAmt: 0,
      TotalTaxAmount: 0,
      TotalItemAmount: 0
    }])
    setRowDataTax([]);
  };

  const handleDeleteHeader = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/POdeletehdrData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_no: transactionNo, company_code: sessionStorage.getItem("selectedCompanyCode"),
          modified_by: sessionStorage.getItem("selectedUserCode")
        })
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
      const response = await fetch(`${config.apiBaseUrl}/POdeletedetData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: transactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
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
      const response = await fetch(`${config.apiBaseUrl}/PODeleteTaxData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: transactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
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

  const handleDeleteTermsPO = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/POTermsandConditionsDelete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_no: transactionNo.toString(), company_code: sessionStorage.getItem("selectedCompanyCode"),
          modified_by: sessionStorage.getItem("selectedUserCode")
        })
      });
      if (response.ok) {
        console.log("Terms and conditions deleted successfully:", transactionNo);
        return true
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
      toast.warning('Error: Missing required fields');
      return;
    }

    showConfirmationToast(
      "Are you sure you want to delete the data ?",
      async () => {
        setLoading(true)
        try {
          const taxDetailResult = await handleDeleteTaxDetail();
          const detailResult = await handleDeleteDetail();
          const TermsResult = await handleDeleteTermsPO();
          const headerResult = await handleDeleteHeader();

          if (headerResult === true && detailResult === true && taxDetailResult === true && TermsResult === true) {
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
                  : taxDetailResult !== true
                    ? taxDetailResult
                    : "An unknown error occurred.";

            toast.error(errorMessage);
          }
        } catch (error) {
          console.error("Error executing API calls:", error);
          toast.error('Error occurred: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.info("Data deleted cancelled.");
      }
    );
  };

  const handleReload = () => {
    setLoading(true);
    window.location.reload();
  };


  const handleExcelDownload = () => {

    const filteredRowData = rowData.filter(row => row.purchaseQty > 0 && row.TotalItemAmount > 0 && row.purchaseAmt > 0);
    const filteredRowDataTax = rowDataTax.filter(taxRow => taxRow.TaxAmount > 0 && taxRow.TaxPercentage > 0);
    const headerData = [{
      company_code: sessionStorage.getItem('selectedCompanyCode'),
      'Transaction No': transactionNo,
      'Vendor / Customer Code': headerRowData[0].billTo,
      'Vendor / Customer Name': headerRowData[1].billTo,
      'Address 1': headerRowData[2].billTo,
      'Address 2': headerRowData[3].billTo,
      'Address 3': headerRowData[4].billTo,
      'Address 4': headerRowData[5].billTo,
      'State': headerRowData[6].billTo,
      'Country': headerRowData[7].billTo,
      'Mobile No': headerRowData[8].billTo,
      'GST No': headerRowData[9].billTo,
      'Contact Person': headerRowData[10].billTo,
      'Purchase Amount': TotalPurchase,
      'Tax Amount': TotalTax,
      'Rounded Off': round_difference,
      'Total Amount': TotalBill,
    }];

    const shipto = [{
      'Transaction No': transactionNo,
      'Vendor / Customer Code': headerRowData[0].shipTo,
      'Vendor / Customer Name': headerRowData[1].shipTo,
      'Address 1': headerRowData[2].shipTo,
      'Address 2': headerRowData[3].shipTo,
      'Address 3': headerRowData[4].shipTo,
      'Address 4': headerRowData[5].shipTo,
      'State': headerRowData[6].shipTo,
      'Country': headerRowData[7].shipTo,
      'Mobile No': headerRowData[8].shipTo,
      'GST No': headerRowData[9].shipTo,
      'Contact Person': headerRowData[10].shipTo,
      'Purchase Amount': TotalPurchase,
      'Tax Amount': TotalTax,
      'Rounded Off': round_difference,
      'Total Amount': TotalBill,
    }];

    const headerSheet = XLSX.utils.json_to_sheet(headerData);
    const rowDataSheet = XLSX.utils.json_to_sheet(filteredRowData);
    const rowDataTaxSheet = XLSX.utils.json_to_sheet(filteredRowDataTax);
    const ShipTo = XLSX.utils.json_to_sheet(shipto);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Bill to Header Data");
    XLSX.utils.book_append_sheet(workbook, ShipTo, "Ship to Header Data");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "Purchase Order Details");
    XLSX.utils.book_append_sheet(workbook, rowDataTaxSheet, "Purchase Order Tax Details");


    XLSX.writeFile(workbook, "purchase_order_data.xlsx");

  };

  const handlePoData = async (data) => {
    if (data && data.length > 0) {
      setButtonsVisible(false);
      setDelButtonVisible(true);
      setPrintButtonVisible(true);
      setShowUpdateButton(true);
      setShowExcelButton(true);
      setShowAsterisk(true);
      const [{ deliveryDate, credit, remarks, TransactionNo, EntryDate, TaxAmount, VendorName, VendorAddr1, VendorAddr2, VendorAddr3, VendorAddr4, VendorState, VendorCountry,
        ContactPerson, ContactMobileNo, ShipToCustomerName, ShipToCustomerAddr1, ShipToCustomerAddr2, ShipToCustomerAddr3, ShipToCustomerAddr4, ShipToCustomerState, ShipToCustomerCountry,
        ShipToContactPerson, ShipToContactMobileNo, PurchaseAmount, RoundOff, TotalAmount, VendorCode, ShipToCustomerCode, GSTNo, ShipToGSTNo }] = data;

      const transactionNumber = document.getElementById('RefNo');
      if (transactionNumber) {
        transactionNumber.value = TransactionNo;
        setTransactionNo(TransactionNo);
      } else {
        console.error('transactionNumber element not found');
      }

      const entrydate = document.getElementById('transactionDate');
      if (entrydate) {
        entrydate.value = EntryDate;
        setEntryDate(formatDate(EntryDate));
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

      const roundOff = document.getElementById('roundOff');
      if (roundOff) {
        roundOff.value = RoundOff;
        setRoundDifference(RoundOff);
      } else {
        console.error('transactionNumber element not found');
      }

      const taxAmount = document.getElementById('totalTaxAmount');
      if (taxAmount) {
        taxAmount.value = TaxAmount;
        setTotalTax(formatToTwoDecimalPoints(TaxAmount));
      } else {
        console.error('transactionNumber element not found');
      }

      setNotesRowData([
        { fieldName: 'Credit', notes: credit },
        { fieldName: 'Deliever Date', notes: formatDate(deliveryDate) },
        { fieldName: 'Remarks', notes: remarks },
      ])

      await PODetailView(TransactionNo)
      await POTax(TransactionNo)

      setHeaderRowData([
        { fieldName: 'Vendor / Customer Code', billTo: VendorCode, shipTo: ShipToCustomerCode },
        { fieldName: 'Vendor / Customer Name', billTo: VendorName, shipTo: ShipToCustomerName },
        { fieldName: 'Address 1', billTo: VendorAddr1, shipTo: ShipToCustomerAddr1 },
        { fieldName: 'Address 2', billTo: VendorAddr2, shipTo: ShipToCustomerAddr2 },
        { fieldName: 'Address 3', billTo: VendorAddr3, shipTo: ShipToCustomerAddr3 },
        { fieldName: 'Address 4', billTo: VendorAddr4, shipTo: ShipToCustomerAddr4 },
        { fieldName: 'State', billTo: VendorState, shipTo: ShipToCustomerState },
        { fieldName: 'Country', billTo: VendorCountry, shipTo: ShipToCustomerCountry },
        { fieldName: 'Mobile No', billTo: ContactMobileNo, shipTo: ShipToContactMobileNo }, // Assuming no mobile numbers are fetched
        { fieldName: 'GST No', billTo: GSTNo, shipTo: ShipToGSTNo }, // Assuming no mobile numbers are fetched
        { fieldName: 'Contact Person', billTo: ContactPerson, shipTo: ShipToContactPerson }
      ]);

    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  };

  const POTax = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getPOTaxDetailView`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: TransactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];
        const taxDataMap = {};

        searchData.forEach(({ ItemSNo, TaxSNo, item_code, tax_name_details, tax_per, tax_amt, tax_type }) => {
          newRowData.push({
            ItemSNO: ItemSNo,
            TaxSNO: TaxSNo,
            Item_code: item_code,
            TaxType: tax_name_details,
            TaxPercentage: tax_per,
            TaxAmount: parseFloat(tax_amt).toFixed(2),
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

        });

        PODetailView(TransactionNo, taxDataMap);

        setRowDataTax(newRowData)
      } else if (response.status === 404) {
        console.log("Data not found");
        setRowDataTax([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const PODetailView = async (TransactionNo, taxDataMap) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getPODetailView`, {
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
            ItemSNo,
            item_code,
            item_name,
            bill_qty,
            item_amt,
            tax_amount,
            bill_rate,
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
            purchaseQty: bill_qty,
            TotalTaxAmount: parseFloat(tax_amount).toFixed(2),
            purchaseAmt: parseFloat(item_amt).toFixed(2),
            TotalItemAmount: parseFloat(bill_rate).toFixed(2),
            taxType: taxInfo.tax_type,
            taxPer: taxInfo.tax_percents.join(", "),
            taxDetails: taxInfo.tax_names.join(", "),
            keyField: `${ItemSNo}-${item_code || ''}`,
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
      const response = await fetch(`${config.apiBaseUrl}/getPOTCDetailView`, {
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



  const handleAddRow = () => {
    const serialNumber = rowData.length + 1;
    const newRow = { serialNumber, itemCode: '', itemName: '', warehouse: '', purchaseQty: 0, purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' };
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1);
      if (updatedRowData.length === 0) {
        setRowData([{ serialNumber: 1, itemCode: '', itemName: '', warehouse: '', purchaseQty: '', purchaseAmt: '', TotalTaxAmount: '', TotalItemAmount: '' }]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };

  //Deleted Screen
  const [deletedRowData, setDeletedRowData] = useState([]);
  const [deletedRowDataTerms, setDeletedRowDataTerms] = useState([]);
  const [deletedRowDataTax, setDeletedRowDataTax] = useState([]);
  const [TransactionNo, setTransactionno] = useState("");
  const [TransactionDate, setTransactionDate] = useState("");
  const [Total, setTotal] = useState("");
  const [Tax, setTax] = useState("");
  const [RoundOff, setRoundOff] = useState("");
  const [GrandTotal, setGrandTotal] = useState("");

  const deletedColumnDetail = [
    {
      headerName: 'S.No',
      field: 'deletedSerialNumber',
      maxWidth: 80,
      sortable: false,
      editable: false,
    },
    {
      headerName: 'Item Code',
      field: 'deletedItemCode',
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Item Name',
      field: 'deletedItemName',
      editable: false,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Qty',
      field: 'deletedPurchaseQty',
      editable: false,
      filter: true,
      sortable: false,
      // maxWidth: 150,
      // minWidth: 150,
    },
    {
      headerName: 'Unit Price',
      field: 'deletedPurchaseAmt',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Tax Amount',
      field: 'deletedTotalTaxAmount',
      editable: false,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Total',
      field: 'deletedTotalItemAmount',
      editable: false,
      filter: true,
      sortable: false,
      // maxWidth: 201,
      // minWidth: 201,
    },
  ];

  const deletedColumnTax = [
    {
      headerName: 'S.No',
      field: 'deletedItemSNO',
      maxWidth: 80,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax S.No',
      field: 'deletedTaxSNO',
      maxWidth: 120,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Item Code',
      field: 'deletedItem_code',
      // minWidth: 315,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax Type ',
      field: 'deletedTaxType',
      // minWidth: 201,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax %',
      field: 'deletedTaxPercentage',
      // minWidth: 201,
      sortable: false,
      editable: false
    },
    {
      headerName: 'Tax Amount',
      field: 'deletedTaxAmount',
      // minWidth: 201,
      sortable: false,
      editable: false
    },
  ];

  const deletedColumnHeader = [
    {
      headerName: 'Details',
      field: 'fieldName',
      editable: false
    },
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

  const deletedColumnNext = [
    {
      headerName: 'Details',
      field: 'fieldName',
      editable: false
    },
    {
      headerName: 'Notes',
      field: 'deletedNotes',
      editable: false,
    },
  ];

  const [deletedHeaderRowData, setDeletedHeaderRowData] = useState([
    { fieldName: 'Vendor / Customer Code', deletedBillTo: '', deletedShipTo: '' },
    { fieldName: 'Vendor / Customer Name', deletedBillTo: '', deletedShipTo: '' },
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

  const [deletedNotesRowData, setDeletedNotesRowData] = useState([
    { fieldName: 'Deliever Date', deletedNotes: '', },
    { fieldName: 'Credit', deletedNotes: '', },
    { fieldName: 'Remarks', deletedNotes: '', },
  ]);

  const deletedColumnTermsConditions = [
    {
      headerName: 'S.No',
      field: 'deletedSerialNumber',
      maxWidth: 70,
      valueGetter: (params) => params.node.rowIndex + 1,
      sortable: false,
      minHeight: 50,
      maxHeight: 50,
      editable: false,
    },
    {
      headerName: 'Terms & Conditions',
      field: 'deletedTermsConditions',
      // minWidth: 1000,
      // maxWidth: 1000,
      maxLength: 250,
      minHeight: 50,
      maxHeight: 50,
      sortable: false,
      editable: false,
    },
  ];

  const handleDeletedKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleDeletedTransaction(TransactionNo)
    }
  };

  const handleDeletedTransaction = async (code) => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedPurchaseOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: code, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.warning("Data not found");
          setTransactionDate('');
          setTransactionno('');
          setTotal('');
          setGrandTotal('');
          setRoundOff('');
          setTax('');
          setDeletedRowData([]);
          setDeletedRowDataTerms([]);
          setDeletedRowDataTax([]);
          setDeletedNotesRowData([]);
        } else {
          const errorResponse = await response.json();
          toast.error(errorResponse.message || "An error occurred");
        }
        return;
      }

      const searchData = await response.json();
      if (searchData.Header && searchData.Header.length > 0) {
        console.log(searchData.Header[0])
        const item = searchData.Header[0];

        setTransactionDate(formatDate(item.Entry_date));
        setTransactionno(item.transaction_no)
        setTotal(item.purchase_amount)
        setGrandTotal(item.total_amount)
        setRoundOff(item.rounded_off)
        setTax(item.tax_amount)

        setDeletedNotesRowData([
          { fieldName: 'Credit', deletedNotes: item.credit },
          { fieldName: 'Deliever Date', deletedNotes: formatDate(item.delivery_date) },
          { fieldName: 'Remarks', deletedNotes: item.remarks },
        ])

      } else {
        console.log("Header Data is empty or not found");
        setTransactionDate('');
        setTransactionno('');
        setTotal('');
        setGrandTotal('');
        setRoundOff('');
        setTax('');
        setDeletedNotesRowData([]);
      }

      if (searchData.Detail && searchData.Detail.length > 0) {
        const item = searchData.Detail[0];
        const updatedRowData = searchData.Detail.map(item => {
          return {
            deletedSerialNumber: item.ItemSNo,
            deletedItemCode: item.item_code,
            deletedItemName: item.item_name,
            deletedPurchaseQty: item.bill_qty,
            deletedPurchaseAmt: item.item_amt,
            deletedTotalTaxAmount: parseFloat(item.tax_amount).toFixed(2),
            deletedTotalItemAmount: parseFloat(item.bill_rate).toFixed(2),
          };
        });

        setDeletedHeaderRowData([
          { fieldName: 'Vendor / Customer Code', deletedBillTo: item.vendor_code, deletedShipTo: item.ShipTo_customer_code },
          { fieldName: 'Vendor / Customer Name', deletedBillTo: item.vendor_name, deletedShipTo: item.ShipTo_customer_name },
          { fieldName: 'Address 1', deletedBillTo: item.vendor_addr_1, deletedShipTo: item.ShipTo_customer_addr_1 },
          { fieldName: 'Address 2', deletedBillTo: item.vendor_addr_2, deletedShipTo: item.ShipTo_customer_addr_2 },
          { fieldName: 'Address 3', deletedBillTo: item.vendor_addr_3, deletedShipTo: item.ShipTo_customer_addr_3 },
          { fieldName: 'Address 4', deletedBillTo: item.vendor_addr_4, deletedShipTo: item.ShipTo_customer_addr_4 },
          { fieldName: 'State', deletedBillTo: item.state, deletedShipTo: item.ship_to_state },
          { fieldName: 'Country', deletedBillTo: item.country, deletedShipTo: item.ship_to_country },
          { fieldName: 'Mobile No', deletedBillTo: item.contact_number, deletedShipTo: item.ship_to_contact_number }, // Assuming no mobile numbers are fetched
          { fieldName: 'GST No', deletedBillTo: item.vendor_gst_no, deletedShipTo: item.ShipTo_vendor_gst_no }, // Assuming no mobile numbers are fetched
          { fieldName: 'Contact Person', deletedBillTo: item.contact_person, deletedShipTo: item.ship_to_contact_person }
        ]);

        setDeletedRowData(updatedRowData);
      } else {
        console.log("Detail Data is empty or not found");
        setDeletedRowData([])
      }
      if (searchData.TaxDetail && searchData.TaxDetail.length > 0) {
        const updatedRowDataTax = searchData.TaxDetail.map(item => {
          return {
            deletedItemSNO: item.ItemSNo,
            deletedTaxSNO: item.TaxSNo,
            deletedItem_code: item.item_code,
            deletedTaxType: item.tax_name_details,
            deletedTaxPercentage: item.tax_per,
            deletedTaxAmount: parseFloat(item.tax_amt).toFixed(2),
          };
        });

        setDeletedRowDataTax(updatedRowDataTax);

      } else {
        console.log("Detail Data is empty or not found");
        setRowDataTax([])
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
        setDeletedRowDataTerms([])
      }

    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const [open5, setOpen5] = React.useState(false);

  const handleDeletedPo = () => {
    setOpen5(true);
  };

  const handleDeletedPoData = async (data) => {
    if (data && data.length > 0) {
      const [{ deliveryDate, credit, remarks, TransactionNo, EntryDate, TaxAmount, VendorName, VendorAddr1, VendorAddr2, VendorAddr3, VendorAddr4, VendorState, VendorCountry,
        ContactPerson, ContactMobileNo, ShipToCustomerName, ShipToCustomerAddr1, ShipToCustomerAddr2, ShipToCustomerAddr3, ShipToCustomerAddr4, ShipToCustomerState, ShipToCustomerCountry,
        ShipToContactPerson, ShipToContactMobileNo, PurchaseAmount, RoundOff, GSTNo, ShipToGSTNo, TotalAmount, VendorCode, ShipToCustomerCode }] = data;

      const transactionNumber = document.getElementById('TransactionNo');
      if (transactionNumber) {
        transactionNumber.value = TransactionNo;
        setTransactionno(TransactionNo);
      } else {
        console.error('transactionNumber element not found');
      }

      const transactiondate = document.getElementById('TransactionDate');
      if (transactiondate) {
        transactiondate.value = EntryDate;
        setTransactionDate(formatDate(EntryDate));
      } else {
        console.error('EntryDate element not found');
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

      const roundOff = document.getElementById('RoundOff');
      if (roundOff) {
        roundOff.value = RoundOff;
        setRoundOff(RoundOff);
      } else {
        console.error('RoundOff element not found');
      }

      const taxAmount = document.getElementById('Tax');
      if (taxAmount) {
        taxAmount.value = TaxAmount;
        setTax(formatToTwoDecimalPoints(TaxAmount));
      } else {
        console.error('TaxAmount element not found');
      }

      setDeletedNotesRowData([
        { fieldName: 'Credit', deletedNotes: credit },
        { fieldName: 'Deliever Date', deletedNotes: formatDate(deliveryDate) },
        { fieldName: 'Remarks', deletedNotes: remarks },
      ])

      await DeletedTaxView(TransactionNo)

      setDeletedHeaderRowData([
        { fieldName: 'Vendor / Customer Code', deletedBillTo: VendorCode, deletedShipTo: ShipToCustomerCode },
        { fieldName: 'Vendor / Customer Name', deletedBillTo: VendorName, deletedShipTo: ShipToCustomerName },
        { fieldName: 'Address 1', deletedBillTo: VendorAddr1, deletedShipTo: ShipToCustomerAddr1 },
        { fieldName: 'Address 2', deletedBillTo: VendorAddr2, deletedShipTo: ShipToCustomerAddr2 },
        { fieldName: 'Address 3', deletedBillTo: VendorAddr3, deletedShipTo: ShipToCustomerAddr3 },
        { fieldName: 'Address 4', deletedBillTo: VendorAddr4, deletedShipTo: ShipToCustomerAddr4 },
        { fieldName: 'State', deletedBillTo: VendorState, deletedShipTo: ShipToCustomerState },
        { fieldName: 'Country', deletedBillTo: VendorCountry, deletedShipTo: ShipToCustomerCountry },
        { fieldName: 'Mobile No', deletedBillTo: ContactMobileNo, deletedShipTo: ShipToContactMobileNo }, // Assuming no mobile numbers are fetched
        { fieldName: 'GST No', deletedBillTo: GSTNo, deletedShipTo: ShipToGSTNo }, // Assuming no mobile numbers are fetched
        { fieldName: 'Contact Person', deletedBillTo: ContactPerson, deletedShipTo: ShipToContactPerson }
      ]);

    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  };

  const DeletedTaxView = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedPoTaxDetail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ transaction_no: TransactionNo, company_code: sessionStorage.getItem("selectedCompanyCode") })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];

        searchData.forEach(({ ItemSNo, TaxSNo, item_code, tax_name_details, tax_per, tax_amt, tax_type }) => {
          newRowData.push({
            deletedItemSNO: ItemSNo,
            deletedTaxSNO: TaxSNo,
            deletedItem_code: item_code,
            deletedTaxType: tax_name_details,
            deletedTaxPercentage: tax_per,
            deletedTaxAmount: parseFloat(tax_amt).toFixed(2),
          });
        });

        setDeletedRowDataTax(newRowData);

        await DeletedDetailView(TransactionNo);

      } else if (response.status === 404) {
        console.log("Data not found");
        setDeletedRowDataTax([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const DeletedDetailView = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedPoDetail`, {
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
            ItemSNo,
            item_code,
            item_name,
            bill_qty,
            item_amt,
            tax_amount,
            bill_rate,
          } = item;

          newRowData.push({
            deletedSerialNumber: ItemSNo,
            deletedItemCode: item_code,
            deletedItemName: item_name,
            deletedPurchaseQty: bill_qty,
            deletedPurchaseAmt: parseFloat(item_amt).toFixed(2),
            deletedTotalTaxAmount: parseFloat(tax_amount).toFixed(2),
            deletedTotalItemAmount: parseFloat(bill_rate).toFixed(2),
          });
        });

        setDeletedRowData(newRowData);

        await DeletedTermsView(TransactionNo);

      } else if (response.status === 404) {
        console.log("Data not found");
        setDeletedRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const DeletedTermsView = async (TransactionNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDeletedPoTerms`, {
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
        toast.warning(errorResponse.message || "Failed to insert sales data");
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


  const navigateToSettings = () => {
    navigate('/POsettings'); // Adjust the path as per your route setup
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
                  <h1 align="left" className="purbut me-5">Purchase Order</h1>
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
                  {buttonsVisible && ['add', 'all permission'].some(permission => purchaseOrderPermission.includes(permission)) && (
                    <savebutton className="purbut" onClick={handleSaveButtonClick} title='save' >
                      <i class="fa-regular fa-floppy-disk"></i>
                    </savebutton>
                  )}
                  {showUpdateButton && ['update', 'all permission'].some(permission => purchaseOrderPermission.includes(permission)) && (
                    <savebutton className="purbut" onClick={handleUpdateButtonClick} title='Update' >
                      <i class="fa-solid fa-floppy-disk"></i>
                    </savebutton>
                  )}
                  {delButtonVisible && ['delete', 'all permission'].some(permission => purchaseOrderPermission.includes(permission)) && (
                    <delbutton className="purbut" onClick={handleDeleteButtonClick} title='delete' >
                      <i class="fa-solid fa-trash"></i>
                    </delbutton>
                  )}
                  {printButtonVisible && ['all permission', 'view'].some(permission => purchaseOrderPermission.includes(permission)) && (
                    <printbutton className="purbut" title="print" onClick={generateReport} >
                      <i class="fa-solid fa-file-pdf"></i>
                    </printbutton>
                  )}
                  <printbutton className="purbut" title='excel' onClick={handleExcelDownload} style={{ display: showExcelButton ? 'block' : 'none' }}>
                    <i class="fa-solid fa-file-excel"></i>
                  </printbutton>
                  <printbutton className="purbut" onClick={handleReload} >
                    <i class="fa-solid fa-arrow-rotate-right"></i>
                  </printbutton>
                  <button className="purbut" onClick={navigateToSettings}>
                    <i className="fa-solid fa-cog"></i>
                  </button>
                </div>
              </div>
              <div class="mobileview">
                <div class="d-flex justify-content-between ">
                  <div className="d-flex justify-content-start">
                    <h1 align="left" className="h1">Purchase Order</h1>
                  </div>
                  <div class="dropdown mt-1" style={{ paddingLeft: 0 }}>
                    <button class="btn btn-primary dropdown-toggle p-1 ms-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="fa-solid fa-list"></i>
                    </button>
                    <ul class="dropdown-menu menu">
                      {buttonsVisible && (
                        <li class="iconbutton d-flex justify-content-center text-success">
                          {['add', 'all permission'].some(permission => purchaseOrderPermission.includes(permission)) && (
                            <icon class="icon" onClick={handleSaveButtonClick} >
                              <i class="fa-regular fa-floppy-disk"></i>
                            </icon>
                          )}
                        </li>
                      )}
                      <li class="iconbutton  d-flex justify-content-center text-danger">
                        {['delete', 'all permission'].some(permission => purchaseOrderPermission.includes(permission)) && (
                          <icon class="icon" onClick={handleDeleteButtonClick}>
                            <i class="fa-solid fa-trash"></i>
                          </icon>
                        )}
                      </li>
                      <li class="iconbutton  d-flex justify-content-center text-warning">
                        {['all permission', 'view'].some(permission => purchaseOrderPermission.includes(permission)) && (
                          <icon class="icon" onClick={generateReport}>
                            <i class="fa-solid fa-file-pdf"></i>
                          </icon>
                        )}
                      </li>
                      <li class="iconbutton  d-flex justify-content-center text-success">
                        <icon class="icon" onClick={handleExcelDownload}>
                          <i class="fa-solid fa-file-excel"></i>
                        </icon>
                      </li>
                      <li class="iconbutton  d-flex justify-content-center">
                        <icon class="icon" onClick={handleReload}>
                          <i class="fa-solid fa-arrow-rotate-right"></i>
                        </icon>
                      </li>
                      <button className="purbut" onClick={navigateToSettings}>
                        <i className="fa-solid fa-cog"></i>
                      </button>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded  pt-3 pb-4" align="left">
              <div className="row ms-3 me-3">
                <div className='col-md-3'>
                  <div className="col-md-12 form-group mb-2">
                    <label htmlFor="party_code" className={`${deleteError && !transactionNo ? 'red' : ''}`}>Transaction No{showAsterisk && <span className="text-danger">*</span>}</label>
                    <div className="exp-form-floating">
                      <div class="d-flex justify-content-end">
                        <input
                          id="RefNo"
                          className="exp-input-field form-control justify-content-start"
                          type="text"
                          placeholder=""
                          required
                          value={transactionNo}
                          onChange={(e) => setTransactionNo(e.target.value)}
                          onKeyPress={handleKeyPressRef}
                          maxLength={50}
                          autoComplete='off'
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
                  <div className="col-md-12 form-group mb-2" >
                    <div class="exp-form-floating" >
                      <label for="" className={`${error && !entryDate ? 'red' : ''}`}>Transaction Date{!showAsterisk && <span className="text-danger">*</span>}</label>
                      <input
                        name="entryDate"
                        id="transactionDate"
                        className="exp-input-field form-control"
                        type="date"
                        placeholder=""
                        required
                        min={financialYearStart}
                        max={financialYearEnd}
                        value={entryDate}
                        onChange={handleDateChange}

                        title="please fill the Transaction date"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 form-group mb-2" >
                    <div class="exp-form-floating" >
                      <label for="">Ship To</label>
                      <div title="Select a Ship To">
                        <Select
                          id="status"
                          value={selectedParty}
                          onChange={handleChangeParty}
                          options={filteredOptionParty}
                          className="exp-input-field"
                          placeholder=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-5 g-0">
                  <div className="ag-theme-alpine" style={{ height: 210, width: "100%" }}>
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
                <div className="col-md-4">
                  <div className="ag-theme-alpine" style={{ height: 210, width: "100%" }}>
                    <AgGridReact
                      columnDefs={columnNotes}
                      rowData={notesRowData}
                      defaultColDef={{ editable: true, resizable: true }}
                      rowHeight={28}
                    />
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between ms-2" style={{ marginBlock: "", marginTop: "10px" }} >
                <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "30px" }}>
                  <purButton type="button" onClick={handleSwiftButtonClick} >
                    Copy
                  </purButton>
                </div>
              </div>
              <div className="ag-theme-alpine" style={{ height: 390, width: '100%' }}>
                <AgGridReact
                  columnDefs={columnHeader}
                  rowData={headerRowData}
                  defaultColDef={{ flex: 1 }}
                  rowHeight={30}
                />
              </div>
            </div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4" align="left">
              <div className='row ms-4 mb-3'>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName">Total Amount</label>
                    <input
                      id="totalPurchaseAmount"
                      class="exp-input-field form-control input"
                      type="text"
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
                    <label for="" class="exp-form-labels" className="partyName"> Total Tax </label>
                    <input
                      name="totalTaxAmount"
                      id="totalTaxAmount"
                      text="text"
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
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName">Total Bill Amount</label>
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
                    />
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between ms-3" style={{ marginBlock: "", marginTop: "10px" }} >
                <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "22px" }}>
                  <purButton type="button" className={`"toggle-btn"  ${activeTable === 'myTable' ? 'active' : ''}`} onClick={() => handleToggleTable('myTable')}>
                    Item Details
                  </purButton>
                  <purButton type="button" className={`"toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`} onClick={() => handleToggleTable('tax')}>
                    Tax Details
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
              <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                <AgGridReact
                  columnDefs={activeTable === 'myTable' ? columnDefs : columnDefsTax}
                  rowData={activeTable === 'myTable' ? rowData : rowDataTax}
                  defaultColDef={{ editable: true, resizable: true }}
                  onCellValueChanged={async (event) => {
                    if (event.colDef.field === 'purchaseQty' || event.colDef.field === 'purchaseAmt') {
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
            <PurchaseOrderItemPopup open={open} handleClose={handleClose} handleItem={handleItem} />
            <PurchaseWarehousePopup open={open1} handleClose={handleClose} handleWarehouse={handleWarehouse} />
            <PoCustomerPopup open={open2} handleClose={handleClose} handleVendor={handleCustomerShipTo} />
            <PurchaseOrderPopup open={open3} handleClose={handleClose} handlePoData={handlePoData} />
            <PoVendorPopup open={open4} handleClose={handleClose} handleVendor={handleVendorBillTo} />
            <PoShipToVendorPopup open={open6} handleClose={handleClose} handleVendorShipTo={handleVendorShipTo} />
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
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
              <div class="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 align="left" className="purbut me-5">Deleted Purchase Order</h1>
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
                    <h1 align="left" className="h1">Deleted Purchase Order</h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded  pt-3 pb-4" align="left">
              <div className="row ms-4">
                <div className='col-md-3'>
                  <div className="col-md-12 form-group mb-2">
                    <label htmlFor="party_code">Transaction No</label>
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
                          onKeyPress={handleDeletedKeyPress}
                          maxLength={50}
                          autoComplete='off'
                        />
                        <div className='position-absolute mt-1 me-2'>
                          <span className="icon searchIcon"
                            onClick={handleDeletedPo}>
                            <i class="fa fa-search"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12 form-group mb-2" >
                    <div class="exp-form-floating" >
                      <label for="">Transaction Date</label>
                      <input
                        name="entryDate"
                        id="TransactionDate"
                        className="exp-input-field form-control"
                        type="date"
                        placeholder=""
                        value={TransactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        title='please enter the entry date'
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="ag-theme-alpine" style={{ height: 150, width: "100%" }}>
                    <AgGridReact
                      columnDefs={deletedColumnTermsConditions}
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
                  <div className="ag-theme-alpine" style={{ height: 150, width: "100%" }}>
                    <AgGridReact
                      columnDefs={deletedColumnNext}
                      rowData={deletedNotesRowData}
                      defaultColDef={{ editable: true, resizable: true }}
                      rowHeight={28}
                    />
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between ms-2" style={{ marginBlock: "", marginTop: "10px" }} >
                <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "30px" }}>
                  <purButton type="button" onClick={handleSwiftButtonClick} >
                    Copy
                  </purButton>
                </div>
              </div>
              <div className="ag-theme-alpine" style={{ height: 390, width: '100%' }}>
                <AgGridReact
                  columnDefs={deletedColumnHeader}
                  rowData={deletedHeaderRowData}
                  defaultColDef={{ flex: 1 }}
                  rowHeight={30}
                />
              </div>
            </div>
            <div className="shadow-lg p-1 bg-body-tertiary rounded mt-2 pt-3 pb-4" align="left">
              <div className='row ms-4 mb-3'>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName">Total Amount</label>
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
                  <div class="exp-form-floating">
                    <label for="" class="exp-form-labels" className="partyName"> Total Tax </label>
                    <input
                      name="totalTaxAmount"
                      id="Tax"
                      text="text"
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
                    <label for="" class="exp-form-labels" className="partyName">Total Bill Amount</label>
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
                <div className="col-md-3 form-group mb-2" style={{ display: "none" }}>
                  <div className="exp-form-floating">
                    <label id="customer">Screen Type</label>
                    <input
                      className="exp-input-field form-control"
                      id="customername"
                      required
                      value={Type}
                      onChange={(e) => setType(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-between ms-3" style={{ marginBlock: "", marginTop: "10px" }} >
                <div align="left" class="d-flex justify-content-start" style={{ marginLeft: "22px" }}>
                  <purButton type="button" className={`"toggle-btn"  ${activeTable === 'myTable' ? 'active' : ''}`} onClick={() => handleToggleTable('myTable')}>
                    Item Details
                  </purButton>
                  <purButton type="button" className={`"toggle-btn" ${activeTable === 'tax' ? 'active' : ''}`} onClick={() => handleToggleTable('tax')}>
                    Tax Details
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
              <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                <AgGridReact
                  columnDefs={activeTable === 'myTable' ? deletedColumnDetail : deletedColumnTax}
                  rowData={activeTable === 'myTable' ? deletedRowData : deletedRowDataTax}
                  defaultColDef={{ editable: true, resizable: true }}
                  onGridReady={onGridReady}
                  onRowClicked={handleRowClicked}
                  onColumnMoved={onColumnMoved}
                />
              </div>
            </div>
          </div>
          <div>
            <DeletedPoPopup open={open5} handleClose={handleClose} handleDeletedPoData={handleDeletedPoData} />
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

export default PurchaseOrder;