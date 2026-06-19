
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import "./apps.css";
import "./mobile.css"
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import swal from "sweetalert2";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import { faPlus, faMinus} from '@fortawesome/free-solid-svg-icons'
import JournalPopup from "./JournalPopup";
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { ToastContainer, toast } from 'react-toastify';
import { Calendar } from "react-modern-calendar-datepicker";
import LoadingScreen from './Loading';

const config = require('./Apiconfig');

function JournalGrid() {
  const [rowData, setRowData] = useState([{transaction_type:'',original_accountcode:'',contra_accountCode:'',
    journal_amount	:0,Item_SNo	:1,narration1	:'',narration2	:'',narration3	:'',narration4:''}]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [transaction_date, settransaction_date] = useState("");
  const [transaction_type, settransaction_type] = useState("");
  const [transaction_no, settransaction_no] = useState("");
  const [journal_no, setjournal_no] = useState("");
  const [original_accountcode, setoriginal_accountcode] = useState("");
  const [contra_accountCode, setcontra_accountCode] = useState("");
  const [journal_amount, setjournal_amount] = useState("");
  const [narration1, setnarration1] = useState("");
  const [narration2, setnarration2] = useState("");
  const [narration3, setnarration3] = useState("");
  const [narration4, setnarration4] = useState("");
  const [editedData, setEditedData] = useState([]);
  const [error, setError] = useState("");
  const [Transactiondrop, setTransactiondrop] = useState([]);
  const [selectedTransaction, setselectedTransaction] = useState('');
  // const [itemcodedrop, setitemcodedrop] = useState([]);
  const [Transdrop, setTransdrop] = useState([]);
  const [additionalData, setAdditionalData] = useState({
    modified_by: '',
    created_by: '',
    modified_date: '',
    created_date: ''
  });

  const [financialYearStart, setFinancialYearStart] = useState('');
  const [financialYearEnd, setFinancialYearEnd] = useState('');
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [hovered, setHovered] = useState(false);


  //code added by Harish purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const journalPermission = permissions
    .filter(permission => permission.screen_type === 'Journal')
    .map(permission => permission.permission_type.toLowerCase());

  useEffect(() => {
        const companyCode = sessionStorage.getItem('selectedCompanyCode');
        
        fetch(`${config.apiBaseUrl}/Transaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_code: companyCode,
          }),
        })
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const Transaction = data.map(option => option.attributedetails_name);
        setTransdrop(Transaction);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

   useEffect(() => {
      const companyCode = sessionStorage.getItem('selectedCompanyCode');
  
      fetch(`${config.apiBaseUrl}/Transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: companyCode,
        }),
      })
            .then((response) => response.json())
        .then((data) => setTransactiondrop(data))
        .catch((error) => console.error("Error fetching purchase types:", error));
    }, []);


  const filteredOptionTransaction = Transactiondrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangetransaction = (selectedTransaction) => {
    setselectedTransaction(selectedTransaction);
    settransaction_type(selectedTransaction ? selectedTransaction.value : '');
  };


  const reloadGridData = () => {
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

  const handleSearch = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getjournalSearch
`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_date, transaction_type, transaction_no, journal_no, original_accountcode, contra_accountCode,
          journal_amount, narration1, narration2, narration3, narration4
        }) // Send company_no and company_name as search criteria
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("data fetched successfully")

      } else if (response.status === 404) {
        console.log("Data not found");
        swal.fire({
          title: "Data not found",
          text: "No data matching the search criteria",
          icon: "info",
          confirmButtonText: "OK"
        }) // Log the message for 404 Not Found
      } else {
        console.log("Bad request");
        swal.fire({
          title: "Error!",
          text: "An error occurred. Please try again later",
          icon: "error",
          confirmButtonText: "OK"
        });
      } // Log the message for other errors

    } catch (error) {
      console.error("Error fetching search data:", error);
      swal.fire({
        title: "Error!",
        text: "An error occurred while fetching data. Please try again later",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  
  const handleDelete = (params) => {
    const serialNumberToDelete = params.data.Item_SNo;
  
    // Filter out the row to delete
    let updatedRowData = rowData.filter(row => row.Item_SNo !== serialNumberToDelete);
  
   
    updatedRowData = updatedRowData.map((row, index) => ({
      ...row,
      Item_SNo: index + 1 // Assign new serial number based on index
    }));
  
    
    setRowData(updatedRowData);
  
    if (updatedRowData.length === 0) {
      const newRow = {
        transaction_type: '',
        original_accountcode: '',
        contra_accountCode: '',
        journal_amount: 0,
        narration1: '',
        narration2: '',
        narration3: '',
        narration4: '',
        Item_SNo: 1
        
      };
      setRowData([newRow]);
    }
  };

  function qtyValueSetter(params) {
    const newValue = parseFloat(params.newValue);
    if (isNaN(newValue) || newValue < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Amount',
        text: 'Amount cannot be negative!',
        confirmButtonText: 'OK'
      });
      return false; // Prevent the value from being set
    }
    params.data.journal_amount = newValue;
    return true; // Allow the value to be set
  }



  const columnDefs = [

    {
      
      headerName: "S.NO",
      field: "Item_SNo",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
    },

    // {
      
    //   headerName: "Transaction Date",
    //   field: "transaction_date",
    //     editable: true,
    //   cellStyle: {
    //     textAlign: "left",
    //   },

    //   minWidth: 250,
    //   maxWidth: 250,
    //   cellEditorParams: {
    //     maxLength: 20,

    //   },
    //   valueFormatter: (params) => {
    //     if (!params.value) return ''; 
    //     const date = new Date(params.value);
    //     const day = date.getDate().toString().padStart(2, '0'); 
    //     const month = (date.getMonth() + 1).toString().padStart(2, '0');
    //     const year = date.getFullYear();
    //     return `${day}/${month}/${year}`; 
    //   },

    // },
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
      headerName: "Transaction Type",
      field: "transaction_type",
      editable: true,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: Transdrop,
      },
    },
   
   
    {

      headerName: "Original Account Code",
      field: "original_accountcode",
      editable: true,
      cellStyle: {
        textAlign: "left",
      },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 25,
      },
    },
    {

      headerName: "Contra Account Code",
      field: "contra_accountCode",
      editable: true,
      cellStyle: {
        textAlign: "left",
      },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 25,
      },
    },
    {

      headerName: "Journal Amount",
      field: "journal_amount",
      editable: true,
      valueSetter:qtyValueSetter,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
     
    },
    {

      headerName: "Narration1",
      field: "narration1",
      editable: true,
      cellStyle: {
        textAlign: "left",
      },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 255,
      },
    },
    {

      headerName: "Narration2",
      field: "narration2",
      editable: true,
      cellStyle: {
        textAlign: "left",
      },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 255,
      },
    },
    {

      headerName: "Narration3",
      field: "narration3",
      editable: true,
      cellStyle: {
        textAlign: "left",
      },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 255,
      },
    },
    {

      headerName: "Narration4",
      field: "narration4",
      editable: true,
      cellStyle: {
        textAlign: "left",
      },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 255,
      },
    },
  ];

  const defaultColDef = {
    resizable: true,
    wrapText: true,
    // sortable: true,
    //editable: true,
    // flex: 1,
    // filter: true,
    // floatingFilter: true,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const handleSaveButtonClick = async () => {
    if ( !transaction_date) {
      setError("");
            toast.warning("Missing required fields");
      return;
    }

    if (rowData.length === 0) {
     toast.warning("No Inventory issued details found to save.");
      return;
    }

    

    try {

      const Header = {
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        transaction_date: transaction_date,
        created_by: sessionStorage.getItem('selectedUserCode')
      };

      const response = await fetch(`${config.apiBaseUrl}/AddJournalHdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ journal_no }] = searchData;
        setjournal_no(journal_no)
        toast.success("Journal Issued Data Inserted Successfully")

         await JournalDetails(journal_no);
         console.log(JournalDetails);

      } else {
        const errorResponse = await response.json();
        console.error(errorResponse.message); // Log error message
        toast.error(errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const JournalDetails = async (journal_no) => {
    try {


      for (const row of rowData) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          created_by: sessionStorage.getItem('selectedUserCode'),
          journal_no:journal_no,
          transaction_date:transaction_date,
          transaction_type:row.transaction_type,
          original_accountcode:row.original_accountcode,
          contra_accountCode:row.contra_accountCode,
          journal_amount	:row.journal_amount	,
          Item_SNo:row.Item_SNo,
          narration1:row.narration1,
          narration2:row.narration2,
          narration3:row.narration3,
          narration4:row.narration4,
        };

        const response = await fetch(`${config.apiBaseUrl}/AddJournalDetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Journal Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          console.error(errorResponse.message); // Log error message
          Swal.fire({
            title: "Error!",
            text: errorResponse.message,
            icon: "error",
            confirmButtonText: "OK"
          });
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  const handleDeleteButtonClick = async () => {
    if (!journal_no) {
      setError(" ");
      toast.warning("Error: Missing required fields");      
      return;
    }

    try {

      const detailResult = await journaldetdata();
      if (!detailResult) {
        throw new Error('Detail deletion failed');
      }
      
      const headerResult = await journalhdrdata();
      if (!headerResult) {
        throw new Error('Header deletion failed');
      }

      if (headerResult && detailResult) {
        console.log("All API calls completed successfully");
        Swal.fire({
          title: "Success",
          text: "Successfully Deleted",
          icon: "success",
          confirmButtonText: "OK"
        }).then(() => {
           window.location.reload();
        });
      } else {
        console.log("Failed to fetch some data");
        Swal.fire({
          title: "Error!",
          text: "Reference Number Does Not Exist",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
      Swal.fire({
        title: "Error!",
        text: "An error occurred while deleting data",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const journalhdrdata = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/JournaDeleteHdr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'),journal_no: journal_no })
      });
      if (response.ok) {
        return true
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };
  const journaldetdata = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/JournalDeletedet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'),journal_no: journal_no })
      });
      if (response.ok) {
        return true
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const transformRowData = (data) => {
    return data.map(row => ({
      "Transaction": row.transaction_type,
      "Original Accountcode": row.original_accountcode,
      "Contra AccountCode ": row.contra_accountCode,
      "Journal Amount": row.journal_amount.toString(),
      "Item S.No": row.Item_SNo,
      "Narration 1 ": row.narration1,
      "Narration 2": row.narration2,
      "Narration 3": row.narration3,
      "Narration 4": row.narration4,
     
    }));
  };

  const handleExcelDownload = () => {


    if (rowData.length === 0 || !journal_no || !transaction_date ) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data Available',
        text: 'There is no data to export.',
      });
      return;
    }

    const headerData = [{
      "company code": sessionStorage.getItem('selectedCompanyCode'),
      "Journal No": journal_no,
      "Transaction Date": transaction_date,
    }];

    const transformedData = transformRowData(rowData);
    const rowDataSheet = XLSX.utils.json_to_sheet(transformedData);
    const headerSheet = XLSX.utils.json_to_sheet(headerData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, headerSheet, "Header Data");
    XLSX.utils.book_append_sheet(workbook, rowDataSheet, "journal  Details");

    XLSX.writeFile(workbook, "Journal .xlsx");
  };

  const generateReport = async () => {
    try {
      const headerData = await PrintHeaderData();
      const detailData = await PrintDetailData();

      if (headerData && detailData) {
        console.log("All API calls completed successfully");

        sessionStorage.setItem('JheaderData', JSON.stringify(headerData));
        sessionStorage.setItem('JdetailData', JSON.stringify(detailData));

        window.open('/JournalPrint', '_blank');
      } else {
        console.log("Failed to fetch some data");
        toast.warning("Trasaction ID Does Not Exits");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const PrintHeaderData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/JournalHdrPrint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'),journal_no: journal_no })
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
      const response = await fetch(`${config.apiBaseUrl}/JournalDetPrint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ company_code: sessionStorage.getItem('selectedCompanyCode'),journal_no: journal_no })
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


 
  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };




  // Assuming you have a unique identifier for each row, such as 'id'
  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.transaction_date === params.data.transaction_date && row.journal_no === params.data.journal_no
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      // Add the edited row data to the state
      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  const saveEditedData = async () => {
    try {
      // Filter the editedData state to include only the selected rows
      const selectedRowsData = editedData.filter(row =>
        selectedRows.some(selectedRow =>
          selectedRow.transaction_date === row.transaction_date && selectedRow.journal_no === row.journal_no
        )
      );

      if (selectedRowsData.length === 0) {
        swal.fire({
          title: "No Rows Selected",
          text: "Please select a row to update its data",
          icon: "warning",
          confirmButtonText: "OK"
        });
        return;
      }
      const saveConfirmation = await swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update the data in the selected rows?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      });

      if (!saveConfirmation.value) {
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/saveEditjournal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_datesToUpdate: selectedRowsData.map(row => row.transaction_date),
          journal_nosToUpdate: selectedRowsData.map(row => row.journal_no),
          updatedData: selectedRowsData
        }), // Send the selected rows for saving along with their header and detail codes
      });

      if (response.ok) {
        setTimeout(() => {
          swal.fire({
            text: "Data updated successfully!",
            icon: "success",
            timer: 1000,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            handleSearch();
          });
        }, 1000);
      } else {
        console.error("Failed to save data");
        swal.fire({
          title: "Error!",
          text: "Failed to update data. Please try again later",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    } catch (error) {
      console.error("Error saving data:", error);
      swal.fire({
        title: "Error!",
        text: "An error occurred while saving data. Please try again later",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };
  //delete
  const deleteSelectedRows = async () => {
    const selectedRows = gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
      swal.fire({
        title: "No Rows Selected",
        text: "Please select at least one row to delete",
        icon: "warning",
        confirmButtonText: "OK"
      });
      return;
    }


    const confirmDelete = await swal.fire({
      title: "Confirm Delete",
      text: "Are you sure you want to delete the selected rows?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    });

    if (!confirmDelete.isConfirmed) {
      return;
    }

    const transaction_datesToDelete = selectedRows.map((row) => row.transaction_date);
    const journal_noToDelete = selectedRows.map((row) => row.journal_no);

    try {
      const response = await fetch(`${config.apiBaseUrl}/deletejournal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transaction_datesToDelete, journal_noToDelete }), // Corrected the key name to match the server-side expectation
      });

      if (response.ok) {
        console.log("Rows deleted successfully:", transaction_datesToDelete, journal_noToDelete);
        handleSearch(); // Fetch updated data after deletion
        swal.fire({
          title: "Success",
          text: "Rows deleted successfully",
          icon: "success",
          confirmButtonText: "OK"
        });
      } else {
        // Check if the response status is 400 for custom error handling
        if (response.status === 400) {
          const errorMessage = await response.text(); // Extract error message from response
          swal.fire({
            title: "Error",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK"
          }); // Display error message to the user
        } else {
          console.error("Failed to delete rows");
        }
      }
    } catch (error) {
      console.error("Error deleting rows:", error);
      // Handle network errors or other exceptions
      swal.fire({
        title: "Error",
        text: "An error occurred while deleting rows. Please try again later.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };


  const fetchAdditionalData = async (company_no) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/AdditionalData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_no }), 
      });
      
      const result = await response.json();
      setAdditionalData({
        modified_by: result.modified_by,
        created_by: result.created_by,
        modified_date: result.modified_date,
        created_date: result.created_date
      });
    } catch (error) {
      console.error("Error fetching additional data:", error);
    }
  };

  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      setSelectedRows(event.data);
      fetchAdditionalData(event.data); // Fetch additional data on row selection
    }
  };

  const handleAddRow = () => {
    const Item_SNo = rowData.length + 1;
    const newRow = { Item_SNo, item_code: '', qty: 0};
    setRowData([...rowData, newRow]);
  };

  const handleRemoveRow = () => {
    if (rowData.length > 0) {
      const updatedRowData = rowData.slice(0, -1); 
      if (updatedRowData.length === 0) {
        setRowData([{ Item_SNo:'', item_code: '', qty: 0}]);
      } else {
        setRowData(updatedRowData);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
   
  };

  const handleadjustmentbtn = () => {
    setOpen(true);
  };

  const [open, setOpen] = React.useState(false);

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handlejournal = async (data) => {
    setShowExcelButton(true)
    setSaveButtonVisible(false);
    setUpdateButtonVisible(true);
    if (data && data.length > 0) {
      const [{ JournalNo, Transactiondate }] = data;

      const No = document.getElementById('JournalNo');
      if (No) {
        No.value = JournalNo;
        setjournal_no(JournalNo);
      } else {
        console.error('Journal  element not found');
      }

      const Date = document.getElementById('TransactionDate');
      if (Date) {
        Date.value = Transactiondate;
        settransaction_date(formatDate(Transactiondate));
      } else {
        console.error('transactionDate element not found');
      }

      await Journaldetails(JournalNo);

    } else {
      console.log("Data not fetched...!");
    }
  };

  const Journaldetails = async (JournalNo) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getJournalDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ journal_no: JournalNo })
      });

      if (response.ok) {
        const searchData = await response.json();
        const newRowData = [];
        searchData.forEach(item => {
          const { transaction_type, original_accountcode,Item_SNo,narration1,narration4,narration3,narration2,contra_accountCode,journal_amount,} = item;
          newRowData.push({
            Item_SNo: Item_SNo,
            transaction_type: transaction_type,
            original_accountcode: original_accountcode,
            contra_accountCode: contra_accountCode,
            journal_amount: journal_amount,
            narration1: narration1,
            narration2: narration2,
            narration3: narration3,
            narration4: narration4,
           
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
    if (!journal_no || !transaction_date ) {
      
      return;
    }

    if (rowData.length === 0) {
      Swal.fire({
        title: "Error!",
        text: "No  details found to save.",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    try {

      const [detailResult] = await Promise.all([
        handleDeleteUpdateDetail()
      ]);

      if (!detailResult) {
        throw new Error('Detail deletion failed');
      }

      await Promise.all([
        updateJournalDetails()
      ]);

      Swal.fire({
        title: "Success",
        text: "Journal  Data Upadated Successfully",
        icon: "success",
        confirmButtonText: "OK"
      });

      console.log('Update successful');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDeleteUpdateDetail = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/JournalDeletedet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ journal_no })
      });
      if (response.ok) {
        return true
      } else {
        console.log("Failed to fetch some data");
      }
    } catch (error) {
      console.error("Error executing API calls:", error);
    }
  };

  const updateJournalDetails = async () => {
    try {

  
      for (const row of rowData) {
        const Details = {
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          created_by: sessionStorage.getItem('selectedUserCode'),
          transaction_date,
          journal_no,
          transaction_type:row.transaction_type,
          original_accountcode:row.original_accountcode,
          contra_accountCode:row.contra_accountCode,
          journal_amount:row.journal_amount,
          Item_SNo:row.Item_SNo,
          narration1:row.narration1,
          narration2:row.narration2,
          narration3:row.narration3,
          narration4:row.narration4
        };

        const response = await fetch(`${config.apiBaseUrl}/AddJournalDetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(Details),
        });

        if (response.ok) {
          console.log("Journal  Data inserted successfully");
        } else {
          const errorResponse = await response.json();
          console.error(errorResponse.message); // Log error message
          Swal.fire({
            title: "Error!",
            text: errorResponse.message,
            icon: "error",
            confirmButtonText: "OK"
          });
        }
      }
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlejournaldata(journal_no)
    }
  };


  const handlejournaldata = async (code) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getJournaldata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ journal_no: code }) 
      });
      if (response.ok) {
        setSaveButtonVisible(false);
        setShowExcelButton(true);
        setUpdateButtonVisible(true);
        const searchData = await response.json();
        if (searchData.Header && searchData.Header.length > 0) {
          const item = searchData.Header[0];
          settransaction_date(formatDate(item.transaction_date));
         
        } else {
          console.log("Header Data is empty or not found");
          // Clear the fields
          settransaction_date('');
          settransaction_no('');
          settransaction_type('')
        }

        if (searchData.Detail && searchData.Detail.length > 0) {
          const updatedRowData = searchData.Detail.map(item => {

            return {
              transaction_type: item.transaction_type,
              original_accountcode: item.original_accountcode,
              contra_accountCode: item.contra_accountCode,
              journal_amount: item.journal_amount,
              Item_SNo: item.Item_SNo,
              narration1: item.narration1,
              narration2: item.narration2,
              narration3: item.narration3,
              narration4: item.narration4
             
            };
          });

          setRowData(updatedRowData);
        } else {
          console.log("Detail Data is empty or not found");
          setRowData([{ Item_SNo: 1, item_code: '', qty: 0}]);
        }

        console.log("data fetched successfully")
      } else if (response.status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'Data not found',
          text: 'The requested data could not be found.',
        });

        settransaction_date('');
        setjournal_no('');
        setRowData([{transaction_type:'',original_accountcode:'',contra_accountCode:'',
          journal_amount	:0,Item_SNo	:1,narration1	:'',narration2	:'',narration3	:'',narration4:''}]);

      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

   //CODE ITEM CODE TO ADD NEW ROW FUNCTION
   const handleCellValueChanged = (params) => {
    const { colDef, rowIndex, newValue } = params;
    const lastRowIndex = rowData.length - 1;

    // Check if the change occurred in the purchaseQty field
    if (colDef.field === 'journal_amount') {
      const quantity = parseFloat(newValue);

      // Check if the entered quantity is positive and the row is the last one
      if (quantity > 0 && rowIndex === lastRowIndex) {
        const Item_SNo = rowData.length + 1;
        const newRowData = {
          Item_SNo,
          transaction_type: null,
          original_accountcode: null,
          contra_accountCode: null,
          journal_amount: 0,
          narration1: null,
          narration2: null,
          narration3: null,
          narration4: null,
        };

        setRowData(prevRowData => [...prevRowData, newRowData]);
      }
    }
  };


  return (
    <div className="container-fluid Topnav-screen">
    <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div align="right">

      <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">
        <div class="d-flex justify-content-between" >
          <div className="d-flex justify-content-start "><h1 align="left" class="purbut" >
            Journal
          </h1></div>
          <div className="d-flex justify-content-end me-3" >
          {saveButtonVisible &&['add', 'all permission'].some(permission => journalPermission.includes(permission)) && (
                <savebutton className="purbut" onClick={handleSaveButtonClick}
                  required title="save"> <i class="fa-regular fa-floppy-disk"></i> </savebutton>
              )}
               {/* {updateButtonVisible && ['update', 'all permission'].some(permission => journalPermission.includes(permission)) && (
                <savebutton className="purbut" title='update' onClick={handleUpdateButtonClick} >
                  <i class="fa-solid fa-floppy-disk"></i>
                </savebutton>
              )} */}
            {['delete', 'all permission'].some(permission => journalPermission.includes(permission)) && (
                <delbutton  onClick={handleDeleteButtonClick} required title="Delete">
                  <i class="fa-solid fa-trash"></i>
                </delbutton>
              )}
            <printbutton className="purbut" title='excel' onClick={handleExcelDownload}>
              <i class="fa-solid fa-file-excel"></i>
            </printbutton>

             {['all permission', 'view'].some(permission => journalPermission.includes(permission)) && (
                <printbutton class="print" className="purbut" onClick={generateReport} required title="Generate Report" >
                   <i class="fa-solid fa-file-pdf"></i></printbutton>
              )}


            {/* <div class="d-flex flex-row my-2 mt-3 ">
          <button  onClick={} title="print"><i class="fa fa-print" aria-hidden="true"></i></button>

        
         */}
            
          </div>
          </div>
          <div className="mobileview">

            <div class="d-flex justify-content-between">
            <div className="d-flex justify-content-start">
              <h1 align="left" className="h1">
                Journal
              </h1></div>
              <div class="dropdown mt-2 me-5 ms-5" >
                  <button
                    class="btn btn-primary dropdown-toggle p-1 show"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i class="fa-solid fa-list"></i>
                  </button>

                  <ul class="dropdown-menu"  href="#" id="navbarDropdownLbl" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <li class="iconbutton d-flex justify-content-center text-success">
          {['add', 'all permission'].some(permission => journalPermission.includes(permission)) && (
              <icon
              class="icon"
              onClick={handleSaveButtonClick}
            > 
            <i class="fa-regular fa-floppy-disk"></i>
              {" "}
            </icon>
          )}
        </li>
        {/* <li class="iconbutton  d-flex justify-content-center text-danger">
          {['delete', 'all permission'].some(permission => journalPermission.includes(permission)) && (
              <icon
              class="icon" onClick={handleUpdateButtonClick} ><i class="fa-solid fa-user-minus"></i>
</icon>
            )}
             </li> */}
             {/* <li class="iconbutton  d-flex justify-content-center text-primary ">
             {['update', 'all permission'].some(permission => journalPermission.includes(permission)) && (
            <icon
            class="icon"onClick={handleUpdateButtonClick} ><i class="fa-solid fa-floppy-disk"></i>
                    </icon>
            )}
             </li> */}
             <li class="iconbutton  d-flex justify-content-center">
             {['all permission', 'view'].some(permission => journalPermission.includes(permission)) && (
             <icon
             class="icon" onClick={handleDeleteButtonClick}> <i class="fa-solid fa-trash"></i>
                    </icon>
            )}
               </li>
                    <li class=" iconbutton d-flex justify-content-center">
                      {["all permission", "view"].some((permission) =>
                        journalPermission.includes(permission)
                      ) && (
                        <icon
                          class="icon"
                          onClick={generateReport}
                        >
                          <i class="fa-solid fa-file-excel"></i>
                        </icon>
                      )}
                    </li>
                  </ul>
                </div>
            </div></div>

</div>
       </div>
       <div className="shadow-lg p-1 bg-body-tertiary rounded  mb-2 mt-2">


    

     
      <div className="row ms-3 mb-3">

      <div className="col-md-3 form-group ">
          <div class="exp-form-floating">
            <label for="rolname" class="exp-form-labels">
              Journal No
            </label>
            <div class="d-flex justify-content-end">
            <input
              id="JournalNo"
              className="exp-input-field form-control"
              type="text"
              placeholder=""
              required title="Please fill the journal number here"
              value={journal_no}
              maxLength={25}
              onKeyPress={handleKeyPress}
              onChange={(e) => setjournal_no(e.target.value)}
            />
            <div className='position-absolute mt-2 me-2'>
                    <span  
                    style={hovered ? { cursor: "pointer", borderRadius: "50%", backgroundColor: "#f0f0f0", padding: "10px" } : { cursor: "pointer", borderRadius: "50%", padding: "10px" }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onClick={handleadjustmentbtn}>
                     <i class="fa fa-search"></i>
                      </span>
                      </div>
                      </div>

          </div>
        </div>

        <div className="col-md-3 form-group ">
          <div class="exp-form-floating">
            <label for="" className={`${error && !transaction_date ? 'red' : ''}`}>
            <span className="text-danger">*</span>
              Transaction Date
            </label>
            <input
              id="TransactionDate"
              className="exp-input-field form-control"
              type="date"
              placeholder=""
              required title="Please fill the transaction date here"
              min={financialYearStart}
              max={financialYearEnd}
              value={transaction_date}
              onChange={(e) => settransaction_date(e.target.value)}

              maxLength={50}
            />

          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end me-5 mb-2" style={{ marginBlock: "", marginTop: "10px" }} >
         
         <div align="" class="d-flex justify-content-end" >
           <icon
             type="button"
             class="popups-btn"
             onClick={handleAddRow}>
             <FontAwesomeIcon icon={faPlus} />
           </icon>
           <icon
             type="button"
             class="popups-btn"
             onClick={handleRemoveRow}>
             <FontAwesomeIcon icon={faMinus} />
           </icon>
         </div>
       </div>

        <div class="ag-theme-alpine" style={{ height: 430, width: "100%" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{ editable: true, resizable: true }}
            onCellValueChanged={handleCellValueChanged}
            rowSelection="multiple"
            pagination={true}
            paginationAutoPageSize={true}
            />
        </div>
        
       
      </div>
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
       <div className="row ms-2">
       <div className="d-flex justify-content-start">
       <p className="col-md-6">Created_by: {additionalData.created_by}</p>
       <p className="col-md-">Created_date: {additionalData.created_date}</p>
       
       </div>
       <div className="d-flex justify-content-start">
       <p className="col-md-6">modified_by: {additionalData.modified_by} </p>
       <p className="col-md-6">modified_date:  {additionalData.modified_date}</p>
       </div>
       </div>
       <div>
       <JournalPopup open={open} handleClose={handleClose} handlejournal={handlejournal}/>
       </div>
       </div>
      </div>
  );
}

export default JournalGrid;