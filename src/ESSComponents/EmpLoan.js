import React, { useState, useEffect, useRef } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import './EmployeeLoan.css'
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import '../apps.css'
import Select from 'react-select'
import axios from 'axios';
import EmployeeInfo from "./EmployeeinfoPopup.js";
import EmployeeInfoPopup from "./EmployeeinfoPopup.js";
import { showConfirmationToast } from '../ToastConfirmation';
const config = require('../Apiconfig');

function Input({ }) {
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [loanAction, setLoanAction] = useState('update'); // Default to 'add'
  const [ApprovedDrop, setApprovedDrop] = useState('');
  const [approveddrop, setapproveddrop] = useState('');
  const [EmployeeId, setEmployeeId] = useState('');
  const [loanID, setLoanID] = useState('');
  const [loanid, setLoanid] = useState('');
  const [ApprovedBy, setApprovedBy] = useState('');
  const [approvedby, setapprovedby] = useState('');
  const [LoanEligibleAmount, setLoanEligibleAmount] = useState('');
  const [EffectiveDate, setEffectiveDate] = useState('');
  const [EndDate, setEndDate] = useState('');
  const [HowManyMonth, setHowManyMonth] = useState('');
  const [EMIAmount, setEMIAmount] = useState('');
 const[Howmanymonth,setHowmanymonth]=useState('');
  const [selectedApprovedBy, setselectedApprovedBy] = useState('');
  const [selectedapprovedby, setselectedapprovedby] = useState('');
  const [SelectedUserName, setSelectedUserName] = useState('');
const[showAsterisk,setShowAsterisk]=useState(true);
  //filte option

  const [EmployeeID, setEmployeeID] = useState('');
  const [Loaneligibleamount, setloanEligibleamount] = useState('');
  const [EffetiveDate, setEffectivedate] = useState('');
  const [Enddate, setEnddate] = useState('');
  const [EMIamount, setEMIamount] = useState('');
  const [company_code, setCompany_code] = useState('');
  
   const [editedData, setEditedData] = useState([]);
      const [gridApi, setGridApi] = useState(null);
      const [modifiedBy, setModifiedBy] = useState("");
          const [createdDate, setCreatedDate] = useState("");
                 const [modifiedDate, setModifiedDate] = useState("");
           const [createdBy, setCreatedBy] = useState("");
      
     

  const gridApiRef = useRef(null);
  const gridColumnApiRef = useRef(null);


  const [open3, setOpen3] = React.useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
  const [error, setError] = useState("");

  const [LoanDrop, setLoanDrop] = useState([]);
  const [loandrop, setloandrop] = useState([]);
  const[selectedLoan,setSelectedLoan]=useState("");
  const[selectedloan,setselectedloan]=useState("");
  

  const [selectedStatus, setselectedStatus] = useState('');
  const [selectedLocation, setselectedLocation] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const companycode = useRef(null);
  const companyname = useRef(null);
  const Address2 = useRef(null);
  const Address3 = useRef(null);
  const City = useRef(null);
  const WebsiteUrl = useRef(null);
  const found = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [companyImage, setCompanyImage] = useState("");
  const created_by = sessionStorage.getItem('selectedUserCode')
  const [isUpdated, setIsUpdated] = useState(false);
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [rowData, setRowData] = useState('');
  
  
  const modified_by = sessionStorage.getItem("selectedUserCode");

  const options = [
    { value: 'add', label: 'Add' },
    { value: 'update', label: 'Update ' }
  ];

  const handleSelectChange = (selectedOption) => {
    setLoanAction(selectedOption.value);
  };

  console.log(selectedRow)

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };
  const [data, setData] = useState([]);  // State to store the fetched data
  const [loading, setLoading] = useState(true); 

  // useEffect(() => {
  //   // Function to fetch data from the backend API
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch(`${config.apiBaseUrl}/getsearchEmpLoan`);  // Backend URL
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       const result = await response.json();
  //       setrowData(result);  // Set the data in state
  //     } catch (error) {
  //       setError(error.message);  // Handle errors
  //     } finally {
  //       setLoading(false);  // Stop loading after fetch
  //     }
  //   };

  //   fetchData();  // Call the fetchData function
  // }, []);  // Empty dependency array means this effect runs once when the component mounts


  const columnDefs = [
    {
      headerName: "Actions",
      field: "actions",
      // minWidth: 110,
      // maxWidth: 110,
      cellRenderer: (params) => {
        const cellWidth = params.column.getActualWidth();
        const isWideEnough = cellWidth > 20;
        const showIcons = isWideEnough;
        return (
          <div className="position-relative d-flex align-items-center" style={{ minHeight: '100%', justifyContent: 'center' }}>
            {showIcons && (
              <>
                <span
                  className="icon mx-2"
                  onClick={() => saveEditedData(params.data, params.node.data)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fa-regular fa-floppy-disk"></i>
                </span>

                <span
                  className="icon mx-2"
                  onClick={() => deleteSelectedRows(params.data)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="fa-solid fa-trash"></i>
                </span>
              </>
            )}
          </div>
        );
      },
    },
    { headerName: "Employee Id", 
      field: "EmployeeId", 
      filter: 'agTextColumnFilter',
      editable:false,
      // minWidth:110,
      //  maxWidth:150
      },
    {
       headerName: "Loan ID",
       field: "loanID", 
       filter: 'agTextColumnFilter',
       editable:true,
        // minWidth:110, 
        // maxWidth:150 
      },
    { headerName: "Approved By", 
      field: "ApprovedBy", 
      filter: 'agTextColumnFilter', 
      editable:true,
      // minWidth:200,
      //  maxWidth:200
       },
    { headerName: "Loan Eligible Amount", 
      field: "LoanEligibleAmount", 
      filter: 'agNumberColumnFilter', 
      editable:true,
      // minWidth:200,
      //  maxWidth:200 
      },
    { headerName: "Effective Date",
       field: "EffetiveDate", 
       filter: 'agDateColumnFilter',
       editable:true,
        // minWidth:140, 
        // maxWidth:140, 
        valueFormatter: (params) => formatDate(params.value),  // Format the date for display
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          // Format the cell value and filter value to compare
          const cellDate = new Date(cellValue.split('/').join('-')); // Convert DD/MM/YYYY to a Date object
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
      }, },
    { headerName: "End Date", field: "EndDate", filter: 'agDateColumnFilter',
        // minWidth:130, maxWidth:120,
      valueFormatter: (params) => formatDate(params.value),  
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          const cellDate = new Date(cellValue.split('/').join('-')); 
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
      },
     },
    { headerName: "How Many Months", field: "HowManyMonth", filter: 'agNumberColumnFilter', 
      // minWidth:200, maxWidth:200
     },
    { headerName: "EMI Amount", field: "EMIAmount", filter: 'agNumberColumnFilter',
      //  minWidth:500, maxWidth:500 
      },
  ];
  // const defaultColDef = {
  //   resizable: true,
  //   wrapText: true,
  //   sortable: true,
  //   editable: false,
  //   filter: true,
  // };
  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
  };
 

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      handleRowClick(event.data);
    }
  }

  const handleRowClick = (rowData) => {
    setCreatedBy(rowData.created_by);
    setModifiedBy(rowData.modified_by);
  const formattedCreatedDate = formatDate(rowData.created_date);
  const formattedModifiedDate = formatDate(rowData.modified_date);
    setCreatedDate(formattedCreatedDate);
    setModifiedDate(formattedModifiedDate);
  };


  const handleSave = async (e) => {

    if (!EmployeeId || !selectedLoan || !selectedApprovedBy || !LoanEligibleAmount || !EffectiveDate || !EndDate || !HowManyMonth || !EMIAmount) {
      setError(" ");
      return;
    }
    e.preventDefault();
    
    setIsSaving(true);
    setMessage('');

    // Prepare the data to be sent to the backend
    const data = {
      EmployeeId,
      loanID: selectedLoan,
      ApprovedBy:selectedApprovedBy,
      LoanEligibleAmount: parseFloat(LoanEligibleAmount), // Convert to float for monetary values
      EffectiveDate,
      EndDate,
      HowManyMonth: parseInt(HowManyMonth, 10), // Convert to integer
      EMIAmount: parseFloat(EMIAmount), // Convert to float for monetary values
      company_code:sessionStorage.getItem('selectedCompanyCode'),
      created_by:sessionStorage.getItem('selectedUserCode'),
     
    };

    try {
      const response = await axios.post(`${config.apiBaseUrl}/addEmployeeLoan`, data); // Replace with actual API endpoint
      setMessage('Data inserted successfully');
      setTimeout(() => {
        toast.success("Data inserted successfully!", {
          onClose: () => window.location.reload(),
        });
      }, 1000);
      
    } catch (error) {
      setMessage('Error inserting data: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };


  const saveEditedData = async () => {

    try {
      const company_code = sessionStorage.getItem('selectedCompanyCode');
      const modified_by = sessionStorage.getItem('selectedUserCode');

      const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };

        const response = await fetch(`${config.apiBaseUrl}/updateEmployeeLoan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "company_code":company_code,
            "modified_by":modified_by
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          toast.success("Data updated successfully", {
            onClose: () => handleSearch(), // Runs handleSearch when toast closes
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

 const deleteSelectedRows = async (rowData) => {
  const company_code = sessionStorage.getItem('selectedCompanyCode');
   
  const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };
  showConfirmationToast(
    "Are you sure you want to delete the data in the selected rows?",
    async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/deleteEmployeeLoan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "company_code":company_code
          },
          body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
          setTimeout(() => {
            toast.success("Data deleted successfully");
            handleSearch();
          }, 3000);
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to delete data");
        }
      } catch (error) {
        console.error("Error deleting rows:", error);
        toast.error("Error deleting data: " + error.message);
      }
    },
    () => {
      toast.info("Data delete cancelled.");
    }
  );
};

  function validateEmail(email) {
    const emailRegex = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;
    return emailRegex.test(email);
  }

  const handleNavigate = () => {
    navigate("/Company");
  };

  const handleKeyDown = async (e, nextFieldRef, value, hasValueChanged, setHasValueChanged) => {
    if (e.key === 'Enter') {
      if (hasValueChanged) {
        await handleKeyDownStatus(e);
        setHasValueChanged(false);
      }

      if (value) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault();
      }
    }
  };

  const handleKeyDownStatus = async (e) => {
    if (e.key === 'Enter' && hasValueChanged) {
      setHasValueChanged(false);
    }
  };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.Employee_Salary === params.data.Employee_Salary && row.Taxable_Amount === params.data.Taxable_Amount && row.Start_Year === params.data.Start_Year && row.End_Year === params.data.End_Year
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);
  
      // Add the edited row data to the state
      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  const NavigatecomDet = () => {
    navigate("/CompanyDetails");
  };

 
  const FinanceDet = () => {
    navigate("/FinanceDet");
  };
  const BankAccDet = () => {
    navigate("/BankAccDet");
  };
  const IdentDoc = () => {
    navigate("/IdentDoc");
  };

  const AcademicDet = () => {
    navigate("/AcademicDet");
  };
 
  const Documents = () => {
    navigate("/Documents");
  };

  const Insurance1 = () => {
    navigate("/Family");
  };
   useEffect(() => {
    fetch(`${config.apiBaseUrl}/getLoanID`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })

      .then((data) => data.json())
      .then((val) => {
        setLoanDrop(val)
        setloandrop(val)
    
    });
  }, []);

  const HandleLoan = (selectedLoan) => {
     setLoanID(selectedLoan);
    setSelectedLoan(selectedLoan ? selectedLoan.value :'');
  };
  
  const filteredOptionloan = loandrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const Handleloan = (selectedloan) => {
    setLoanid(selectedloan);
    setselectedloan(selectedloan ? selectedloan.value :'');
  };
  
  const filteredOptionLoan = LoanDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getTeamManager`)
      .then((data) => data.json())
      .then((val) => {
        setApprovedDrop(val)
        setapproveddrop(val)
      });
  }, []);

  const HandleApproved = (ApprovedBy) => {
    setApprovedBy(ApprovedBy);
    setselectedApprovedBy(ApprovedBy.value);
  };
  
  const filteredOptionApproved = Array.isArray(ApprovedDrop) 
  ? ApprovedDrop.map((option) => ({
      value: option.manager,
      label: `${option.EmployeeId} - ${option.manager}`,  // Concatenate ApprovedBy and EmployeeId with ' - '
  }))
  : [];
//filter option

  const handleapproved = (approvedby) => {
    setapprovedby(approvedby);
    setselectedapprovedby(approvedby.value);
  };
  
  const filteredOptionapproved = Array.isArray(approveddrop) 
  ? approveddrop.map((option) => ({
      value: option.manager,
      label: `${option.EmployeeId} - ${option.manager}`,  // Concatenate ApprovedBy and EmployeeId with ' - '
  }))
  : [];
  

  





  const handleEmpLoan= () => {
    setOpen3(true);
  };

  const reloadGridData = () => {
    window.location.reload();
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);

  };


  const handleInsert = async () => {
    if (
      !EmployeeId ||
      !loanID||
      !selectedApprovedBy ||
      !LoanEligibleAmount ||
      !EffectiveDate ||
      !EndDate ||
      !HowManyMonth ||
      !EMIAmount 
     
    ) {
      setError("Please fill all required fields");
      return;
    }
  
    // if (!validateEmail(Email)) {
    //   setError("Please enter a valid email address");
    //   return;
    // }
  
    
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/addEmployeeLoan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            EmployeeId,
            loanID,
            ApprovedBy:selectedApprovedBy,
            LoanEligibleAmount,
            EffectiveDate,
            EndDate,
            HowManyMonth,
            EMIAmount ,
             company_code: sessionStorage.getItem("selectedCompanyCode"),


          }),
        }
      );
  
      if (response.status === 200) {
        const successMessage = isUpdateMode
          ? "Data updated successfully!"
          : "Data inserted successfully!";
        console.log(successMessage);
        setTimeout(() => {
          toast.success(successMessage, {
            onClose: () => window.location.reload(), // Reloads the page after the toast closes
          });
        }, 1000);
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message, {});
      } else {
        console.error("Failed to process data");
        toast.error("Failed to process data", {});
      }
    } catch (error) {
      console.error("Error processing data:", error);
      toast.error("Error processing data: " + error.message, {});
    }
  };
  
  
  
    const [open, setOpen] = React.useState(false);
    const [open1, setOpen1] = React.useState(false);
  
    const handleClose = () => {
      setOpen(false);
      
    };
    const handleClose1 = () => {
      setOpen1(false)
      
    };
    
  
    const handleEmployeeInfoor =()=>{
      setOpen1(true)
    }
    const handleEmployeeInfo= () => {
      setOpen(true);
    };
    const formatDate = (isoDateString) => {
      const date = new Date(isoDateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${day}-${month}-${year}`;
    };

   
    const EmployeeInfo = async (data) => {
      if (data && data.length > 0) {
        setSaveButtonVisible(false);
        setUpdateButtonVisible(true);
        const [{ EmployeeId, loanID, ADDApproved ,ApprovedBy, LoanEligibleAmount, EffetiveDate, EndDate,HowManyMonth, EMIAmount}] = data; 
        console.log(data);
        
       
        const employeeId = document.getElementById('EmployeeId');
        if (employeeId) {
          employeeId.value = EmployeeId;
          setEmployeeId(EmployeeId);
        } else {
          console.error('EmployeeId  not found');
        }
  
  
      } else {
        console.log("Data not fetched...!");
      }
      console.log(data);
    };
    const applyFilter = (field, value) => {
      if (!gridApiRef.current) return;  // Check if gridApi is available
  
      const filterInstance = gridApiRef.current.getFilterInstance(field);
  
      if (value === "") {
        filterInstance.setModel(null);  // Clear the filter if input is empty
      } else {
        filterInstance.setModel({ type: 'contains', filter: value });
      }
  
      gridApiRef.current.onFilterChanged();  // Apply the filter change to the grid
    };


    const handleSearch = async () => {

      try {
        const body ={
          EmployeeId:EmployeeID,
          loanID:selectedloan, 
          ApprovedBy:selectedapprovedby,
          LoanEligibleAmount:Loaneligibleamount,
          EffetiveDate:EffetiveDate,
          EndDate:Enddate,
          HowManyMonth:Howmanymonth,
          EMIAmount:EMIamount,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
        }
        const response = await fetch(`${config.apiBaseUrl}/LoanSC`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body) // Send company_no and company_name as search criteria
        });
         if (response.ok) {
               const fetchedData  = await response.json();
               const newRows = fetchedData .map((matchedItem) => ({
                
                
                EmployeeId: matchedItem.EmployeeId,
                loanID: matchedItem.loanID,
                ApprovedBy: matchedItem.ApprovedBy,
                LoanEligibleAmount: matchedItem.LoanEligibleAmount,
                EffetiveDate: matchedItem.EffetiveDate,
                EndDate: matchedItem.EndDate,
                HowManyMonth: matchedItem.HowManyMonth,
                EMIAmount: matchedItem.EMIAmount,
               
             }));
               setRowData(newRows);
             } else if (response.status === 404) {
               console.log("Data Not found");
               toast.warning("Data Not found");
               setRowData([]);
             } else {
               const errorResponse = await response.json();
               toast.warning(errorResponse.message || "Failed to insert sales data");
               console.error(errorResponse.details || errorResponse.message);
               setRowData([]);
             }
           } catch (error) {
             console.error("Error fetching search data:", error);
           }
         };
  
   
  return (
    <div class="container-fluid Topnav-screen ">
      <div className="">
        <div class="">
          <ToastContainer
            position="top-right"
            className="toast-design" // Adjust this value as needed
            theme="colored"
          />
          <div className=" p-0 shadow-lg bg-white rounded">
          <div className="purbut mb-0 d-flex justify-content-between">
        <h1 align="left" className="purbut">
          {loanAction === 'add' ? 'Add Loan Details' : ' Loan Details'}
        </h1>

        <div className="col-md-1 mt-3 me-5"> 

<div class=" d-flex justify-content-start  me-5">
<div className="me-1 ">
{saveButtonVisible &&(
               <savebutton className="purbut" onClick={handleSave}
                 required title="save"> <i class="fa-regular fa-floppy-disk"></i> </savebutton>
             )}
      {updateButtonVisible &&(
               <savebutton className="purbut" title='update' onClick={handleSave} >
                 <i class="fa-regular fa-floppy-disk"></i>
               </savebutton>
             )}
             

         </div>
         {/* <div className="ms-1">
         <delbutton 
         // onClick={handleDelete} 
         title="Delete" onClick={handleDelete} >
        <i class="fa-solid fa-trash"></i>
         </delbutton>
         </div> */}
         <div className="col-md-1"> 
         <div className="ms-1">
         <reloadbutton
         className="purbut"
         onClick={reloadGridData}
         title="Reload" style={{cursor:"pointer"}}>
         <i className="fa-solid fa-arrow-rotate-right"></i> 
         </reloadbutton>
         </div>
         </div>
         </div>         
               </div>  
      </div>
          </div>

          <div className=" shadow-lg bg-white rounded  mt-2  p-3">

   


          <div class=" mb-4">
            <div className="    mb-2">
            {/* <h5 className="ms-4 mt-4">Add Loan Data:</h5> */}
         
            <div class="row ms-3 me-3 mb-3">
       
     
    
       <div className="col-md-3 form-group mb-2">
         <div className="exp-form-floating">
           <div className="d-flex justify-content-start">
             <div>
               <label htmlFor="EmployeeId" className={`${error && !EmployeeId ? 'red' : ''}`}> Employee ID {showAsterisk && <span className="text-danger">*</span>}</label>
               
               
             </div>
             <div>
               {/* <span className="text-danger">*</span> */}
             </div>
           </div>
           <div class="d-flex justify-content-end">
           <input
             id="EmployeeId"
             className="exp-input-field form-control p-2"
             type="text"
             placeholder=""
             required title="Please enter the Employee ID"
             value={EmployeeId}
             onChange={(e) => setEmployeeId(e.target.value)}
             maxLength={20}
          // onKeyPress={handleKeyPress}
           />
         
            
           </div>

         </div>
       </div>

    
               
         
             



             
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="cname" className={`${error && !loanID ? 'red' : ''}`}> Loan ID{showAsterisk && <span className="text-danger">*</span>}</label>
                          
                      </div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <Select
                    required title="Please select a Loan ID"
                      id="loanID"
                     value={loanID}
                      className="exp-input-field"
                      onChange={HandleLoan}
                      options={filteredOptionLoan}
                      maxLength={20}
                    />
                {/* {error && !loanID && <div className="text-danger">loanID should not be blank</div>} */}

                   
                  </div>
                </div>

                {loanAction &&(
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname"  className={`${error && !ApprovedBy ? 'red' : ''}`}>Approved By{showAsterisk && <span className="text-danger">*</span>}</label>
                        </div>
                    </div>
                   
                    <Select
                      id="Approvedby"
                      class="exp-input-field form-control"
                      required title="Please Select an Approver"
                      placeholder=""
                      value={ApprovedBy}
                      onChange={HandleApproved}
                      options={filteredOptionApproved} 
                      maxLength={35}
                      />
                     
                     {/* {error && !approvedBy && <div className="text-danger">ApprovedBy should not be blank</div>} */}

                    
                  
                  </div>
                </div>
                )}

               
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1"   className={`${error && !LoanEligibleAmount ? 'red' : ''}`}>  Loan Eligible Amount{showAsterisk && <span className="text-danger">*</span>}</label>
                        
                      </div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <input
                      id="LoanEligibleAmount"
                      class="exp-input-field form-control"
                      type="number"
                      placeholder=""
                      required title="Please enter the Eligible Amount"
                      value={LoanEligibleAmount}
                      onChange={(e) => setLoanEligibleAmount(e.target.value.slice(0, 7))}
                      maxLength={30}
                      
                   
                    />
                    {/* {error && !LoanEligibleAmount && <div className="text-danger">EligibleAmount should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add2"  className={`${error && !EffectiveDate ? 'red' : ''}`}> Effective Date {showAsterisk && <span className="text-danger">*</span>}</label>
                      
                       </div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <input
                      id="EffetiveDate"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the Effective Date"
                      value={EffectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      maxLength={100}
                    
                    />
                    {/* {error && !EffectiveDate && <div className="text-danger">EffectiveDate should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="add3" className={`${error && !EndDate ? 'red' : ''}`}>   End Date  {showAsterisk && <span className="text-danger">*</span>}</label>
                      {/* <div><span className="text-danger">*</span></div> */}
                    <input
                      id="EndDate"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the End Date"
                      value={EndDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      maxLength={100}
                  
                    />
                                        {/* {error && !EndDate && <div className="text-danger">EndDate should not be blank</div>} */}

                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label For="city" className={`${error && !EndDate ? 'red' : ''}`}>How Many Months {showAsterisk && <span className="text-danger">*</span>}</label>
                      </div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <input
                      id="HowManyMonth"
                      class="exp-input-field form-control"
                      type="number"
                      placeholder=""
                      required title="Please enter the Months "
                      value={HowManyMonth}
                      onChange={(e) => setHowManyMonth(e.target.value.slice(0, 2))}
                     max={5}
                     
                    />
                    {/* {error && !HowManyMonth && <div className="text-danger">Months should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="add3" className={`${error && !EMIAmount ? 'red' : ''}`}>  EMI Amount {showAsterisk && <span className="text-danger">*</span>}</label>
                    {/* <div><span className="text-danger">*</span></div> */}
                  
                    <input
                      id="EMIAmount"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                    required title="Please Enter the EMI Amount"
                      value={EMIAmount}
                      onChange={(e) => setEMIAmount(e.target.value.slice(0, 6))}
                      maxLength={60}
                      
                     
                    />
        

                  </div>
                </div>
           
               
                <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
                
                
                   
</div>
              </div>      
              
              
              
              
              
              </div>
             
              </div>
              </div>

              <div className=" shadow-lg bg-white rounded  mt-2  p-3">

   


<div class=" mb-4">
  <div className="    mb-2">
  <div className="pe-0 " style={{width:"150px"}}>
                    <h6 className="">Search Criteria:</h6>
                  </div>

  <div class="row ms-3 me-3 mb-3">
              {/* <div className="shadow-lg p-3 bg-light rounded-bottom  mb-2"></div> */}
            {/* <h5 className="ms-4 mt-5">Search Criteria:</h5> */}

               <div class="row">
        
     

        
               <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                  <div><label for="cname" class="exp-form-labels">
                    Employee ID
                      </label></div>
                    <div class="d-flex justify-content-start">
                 
        <input type="text" 
        className="exp-input-field form-control"
         placeholder="" 
         required title="Please enter the Employee ID"
         value={EmployeeID}
         onChange={(e) =>setEmployeeID(e.target.value)}
         onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

        //  onInput={(e) => applyFilter('EmployeeId', e.target.value)} 
         />
        </div>
        </div>
        </div>
        <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                  <div><label for="cname" class="exp-form-labels">
                  Loan ID
                      </label></div>
                    <div class="d-flex justify-content-start">
        <Select type="text"
         className="exp-input-field"
         required title="Please select a Loan ID"
         placeholder="" 
         value={loanid}
         onChange={Handleloan}
         options={filteredOptionloan}
         onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        //  onInput={(e) => applyFilter('loanID', e.target.value)} 
         />
        </div>
        </div>
        </div>
        <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                  <div><label for="cname" class="exp-form-labels">
                  Approved By
                      </label></div>
                    <div class="d-flex justify-content-start">
        <Select type="text"
          required title="Please Select an Approver"
         className="exp-input-field"
         placeholder="" 
         value={approvedby}
         onChange={handleapproved}
         options={filteredOptionapproved} 
         onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        //  onInput={(e) => applyFilter('ApprovedBy', e.target.value)} />
        />
        </div>
        </div></div>
        <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                  <div><label for="cname" class="exp-form-labels">
                  Loan Amount
                      </label></div>
                    <div class="d-flex justify-content-start">
        <input type="number" 
        className="exp-input-field form-control"
        required title="Please enter the Eligible Amount"
        placeholder=" " 
        value={Loaneligibleamount}
        onChange={(e) =>setloanEligibleamount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        // onInput={(e) => applyFilter('LoanEligibleAmount', e.target.value)} 
        />
        </div>
        </div></div>

        <div className="col-md-3 form-group mb-2 ">
                  <div class="exp-form-floating">
                  <div><label for="cname" class="exp-form-labels">
                  Effetive Date
                      </label></div>
                    <div class="d-flex justify-content-start">
        <input 
        type="date" 
        required title="Please enter the Effective Date"
        className="exp-input-field form-control"
        placeholder="" 
        value={EffetiveDate}
        onChange={(e) =>setEffectivedate(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        // onInput={(e) => applyFilter('LoanEligibleAmount', e.target.value)} 
        />
        </div>
        </div>
        </div>

        <div className="col-md-3 form-group mb-2 ">
                  <div class="exp-form-floating">
                  <div><label for="cname" class="exp-form-labels">
                  End Date
                      </label></div>
                    <div class="d-flex justify-content-start">
        <input 
        type="date" 
        required title="Please enter the End Date"
        className="exp-input-field form-control"
        placeholder="" 
        value={Enddate}
        onChange={(e) =>setEnddate(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        // onInput={(e) => applyFilter('LoanEligibleAmount', e.target.value)} 
        />
        </div>
        </div>
      </div>
      <div className="col-md-3 form-group mb-2 ">
                  <div class="exp-form-floating">
                  <div><label for="cname" class="exp-form-labels">
                  How Many Month
                      </label></div>
                    <div class="d-flex justify-content-start">
        <input type="number" 
        className="exp-input-field form-control"
        required title="Please enter the Months "
        placeholder=""
        value={Howmanymonth}
        onChange={(e) =>setHowmanymonth(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        //  onInput={(e) => applyFilter('EMIAmount', e.target.value)}
          />
      </div>
      </div>
      </div>
              
        
      <div className="col-md-3 form-group mb-2 ">
                  <div class="exp-form-floating">
                  <div><label for="cname" class="exp-form-labels">
                  EMI Amount
                      </label></div>
                    <div class="d-flex justify-content-start">
        <input type="number" 
        className="exp-input-field form-control"
        placeholder=""
        required title="Please Enter the EMI Amount"
        value={EMIamount}
        onChange={(e) =>setEMIamount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        //  onInput={(e) => applyFilter('EMIAmount', e.target.value)}
          />
      </div>
      </div>
      </div>

       <div className="col-md-2 form-group mb-2 ">
                <div class="exp-form-floating">
                  <div class=" d-flex  justify-content-center">
                    <div class=''>
                      <icon className="popups-btn fs-6 p-3" 
                      onClick={handleSearch}
                       required title="Search">
                        <i className="fas fa-search"></i>
                      </icon>
                    </div>
                    <div>
                      <icon className="popups-btn fs-6 p-3" 
                      onClick={reloadGridData}
                       required title="Refresh">
                        <i className="fa-solid fa-arrow-rotate-right" />
                      </icon>
                    </div>
                  </div>
                </div>
              </div>
              

               
                
                
             
               
                
           
              </div>      
              
              

              
              
              
          
             <div className="ag-theme-alpine mt-2" style={{ height: 400, width: '100%' }}>
                             <AgGridReact
                               columnDefs={columnDefs}
                               rowData={rowData}
                               pagination={true}
                               paginationAutoPageSize={true}
                               gridOptions={gridOptions}
                               

                             />
                           </div>
              <div>
   
          <EmployeeInfoPopup open={open} handleClose={handleClose} EmployeeInfo={EmployeeInfo} />

      
      </div>
            </div>
         
         </div>
         </div>
</div></div></div></div>
 
  )
              
              }

             export default Input;

             