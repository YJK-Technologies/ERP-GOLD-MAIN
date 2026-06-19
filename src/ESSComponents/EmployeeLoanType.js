import React, { useState, useEffect, useRef } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import Swal from 'sweetalert2';
import './EmployeeLoan.css'
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import TabButtons from './Tabs.js';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../apps.css'
import Select from 'react-select'

const config = require('../Apiconfig');

const getFinancialYearDates = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-based
console.log(currentMonth) 
  let startYear, endYear;

  if (currentMonth < 4) {
    // Jan, Feb, Mar ? current FY started last year
    startYear = currentYear - 1;
    endYear = currentYear;
  } else {
    // Apr to Dec ? FY starts this year
    startYear = currentYear;
    endYear = currentYear + 1;
  }

  const FirstDate = `${startYear}-04-01`;
  const LastDate = `${endYear}-03-31`;

  return { FirstDate, LastDate };
};
const { FirstDate, LastDate } = getFinancialYearDates();

function Input({ }) {
const[company_code,setcompany_code]=useState('');
const[Loan_ID,setLoan_ID]=useState('');
const[Loan_Eligible_Amount,setLoan_Eligible_Amount]=useState(0);
const[Start_Year,setStart_Year]=useState(FirstDate);
const[End_Year,setEnd_Year]=useState(LastDate);
const[error,setError]=useState('');
const [updateButtonVisible, setUpdateButtonVisible] = useState(false);  // Controls Update button visibility
const [saveButtonVisible, setSaveButtonVisible] = useState(true);
const [gridColumnApi, setGridColumnApi] = useState(null);
const [selectedRows, setSelectedRows] = useState([]);
const [rowData, setRowData] = useState([]);
const [createdDate, setCreatedDate] = useState("");
const [modifiedDate, setModifiedDate] = useState("");
 const [gridApi, setGridApi] = useState(null);
 const [createdBy, setCreatedBy] = useState("");
 const [modifiedBy, setModifiedBy] = useState("");
 const [editedData, setEditedData] = useState([]);
 const[keyfield,setkeyfield]=useState("");
 const[Loan_id,setLoan_id]=useState("");
 const[LoanEligibleAmount,setLoanEligibleAmount]=useState(0);
 const[StartYear,setStartYear]=useState(FirstDate);
 const[EndYear,setEndYear]=useState(LastDate);
const [hasValueChanged, setHasValueChanged] = useState(false);
const[activeTab,setActiveTab]=useState("EmpLoanType")
  const navigate= useNavigate();

 const columnDefs = [
  {
    headerName: "Actions",
    field: "actions",
    // minWidth: 80,
    // maxWidth: 80,
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
                onClick={() => handleUpdate(params.data, params.node.data)}
                style={{ cursor: 'pointer' }}
              >
                <i className="fa-regular fa-floppy-disk"></i>
              </span>

              <span
                className="icon mx-2"
                onClick={() => handleDelete(params.data)}
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
  
  

  {
    headerName: "Loan ID",
    field: "Loan_ID",
    editable: true,
    textAlign:"center",
    cellEditorParams: {
      maxLength: 150,
      valueFormatter: (params) => formatDate(params.value)
      
  }
},
{
  headerName: "Loan Eligible Amount",
  field: "Loan_Eligible_Amount",
  editable: true,
  cellEditorParams: {
    maxLength: 150,
    valueFormatter: (params) => formatDate(params.value)
}
},
{ 
      headerName: "Start Year",
       field: "Start_year",
       filter: 'agTextColumnFilter', 
      //  minWidth:120,
      //   maxWidth:130,
        editable:true,
         
     
       },
  { 
    headerName: "End Year",
     field: "End_Year",
     filter: 'agTextColumnFilter',
      sortable: true,
      textAlign:"center",
      editable:true,
    
       
     },
     { headerName: "Keyfield", 
      field: "keyfield", 
      hide: true
     },

  
 ]

 const gridOptions = {
  pagination: true,
  paginationPageSize: 10,
};

//  const defaultColDef = {
//   resizable: true,
//   wrapText: true,
//   // sortable: true,
//   //editable: true,
//   flex: 1,
//   // filter: true,
//   // floatingFilter: true,
// };
const formatDate = (isoDateString) => {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

//   const validateDates = () => {
//     setError("");

//     if (!Start_Year) {
//       setError("Start Year should not be blank");
//       return false;
//     }

//     if (!End_Year) {
//       setError("End Year should not be blank");
//       return false;
//     }

//     if (new Date(End_Year) < new Date(Start_Year)) {
//       setError("End Year cannot be before Start Year");
//       return false;
//     }

//     return true;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (validateDates()) {
//       console.log("Form submitted successfully with dates:", {
//         Start_Year,
//         End_Year,
//       });
    
//   };
// };


const reloadGridData=()=> {
  window.location.reload();
}

const onRowSelected = (event) => {
  if (event.node.isSelected()) {
    handleRowClick(event.data);
  }
};
const handleRowClick = (rowData) => {
  setCreatedBy(rowData.created_by);
  setModifiedBy(rowData.modified_by);
  const formattedCreatedDate = formatDate(rowData.created_date);
  const formattedModifiedDate = formatDate(rowData.modified_date);
  setCreatedDate(formattedCreatedDate);
  setModifiedDate(formattedModifiedDate);
};

const onSelectionChanged = () => {
  const selectedNodes = gridApi.getSelectedNodes();
  const selectedData = selectedNodes.map((node) => node.data);
  setSelectedRows(selectedData);
};

const onGridReady = (params) => {
  setGridApi(params.api);
  setGridColumnApi(params.columnApi);
};


const handleSearch = async () => {
  try {
    const body = {
      company_code: sessionStorage.getItem("selectedCompanyCode"),
      Loan_id,
      LoanEligibleAmount,
      StartYear,
      EndYear,
    };

    const response = await fetch(`${config.apiBaseUrl}/getLoanType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const fetchedData = await response.json();
      const newRows = fetchedData.map((matchedItem) => ({
        Loan_ID: matchedItem.Loan_ID,
        Loan_Eligible_Amount: matchedItem.Loan_Eligible_Amount,
        Start_year: formatDate(matchedItem.Start_year),
        End_Year: formatDate(matchedItem.End_Year),
        keyfield: matchedItem.keyfield,
      }));
      setRowData(newRows);
    } else if (response.status === 404) {
      console.log("Data Not found");
      toast.warning("Data Not found");
      setRowData([]);
    } else {
      const errorResponse = await response.json();
      toast.warning(errorResponse.message || "Failed to fetch loan data");
      console.error(errorResponse.details || errorResponse.message);
      setRowData([]);
    }
  } catch (error) {
    console.error("Error fetching search data:", error);
    toast.error("An unexpected error occurred while fetching data.");
  }
};


const onCellValueChanged = (params) => {
  const updatedRowData = [...rowData];
  const rowIndex = updatedRowData.findIndex(
    (row) => row.location_no === params.data.location_no // Use the unique identifier 
  );
  if (rowIndex !== -1) {
    updatedRowData[rowIndex][params.colDef.field] = params.newValue;
    setRowData(updatedRowData);

    // Add the edited row data to the state
    setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
  }
};


const handleInsert = async () => {
  if (
    !Loan_ID ||
    !Loan_Eligible_Amount ||
    !Start_Year||
    !End_Year
  ) {
    setError(" ");
    toast.warning("Please fill in all fields");
    return;
  }

  try {
  const Headers = {
    Loan_ID:Loan_ID,
    Loan_Eligible_Amount:Loan_Eligible_Amount,
    Start_Year:Start_Year,
    End_Year:End_Year,
    keyfield:sessionStorage.getItem("selectedCompanyCode"), 
    company_code: sessionStorage.getItem("selectedCompanyCode"),
    Created_by : sessionStorage.getItem("selectedUserCode"),
  };

  const response = await fetch(`${config.apiBaseUrl}/addLoanType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Headers),
    });

    if (response.status === 200) {
      toast.success("Data inserted successfully!");  
    } else {
      const errorResponse = await response.json();
      toast.warning(errorResponse.message);
    }
  } catch (error) {
    toast.error("Error inserting data: " + error.message);
  }
};


const handleUpdate = async (rowData) => {

  try {
      // const company_code = sessionStorage.getItem('selectedCompanyCode');
      // const modified_by = sessionStorage.getItem('selectedUserCode');

      const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };

        const response = await fetch(`${config.apiBaseUrl}/updateLoanType`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // "company_code":company_code,
            //   "modified-by":modified_by
            Loan_ID:Loan_ID,
            Loan_Eligible_Amount:Loan_Eligible_Amount,
            Start_year:Start_Year,
            End_Year:End_Year,
            keyfield:sessionStorage.getItem("selectedkeyfield"),
            company_code: sessionStorage.getItem("selectedCompanyCode"),
            modified_by:sessionStorage.getItem("selectedCompanyCode")
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          toast.success("Data updated successfully", {
            onClose: () => handleSearch(), // Runs handleSearch when toast closes
          });
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to employee data");
        }
      } catch (error) {
        toast.error("Error updateing data: " + error.message);
      
      }
 };

const handleDelete = async (rowData) => {
  try {
      const company_code = sessionStorage.getItem('selectedCompanyCode');

      const dataToSend = {editedData: Array.isArray(rowData) ? rowData : [rowData] };

        const response = await fetch(`${config.apiBaseUrl}/deleteLoanType`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "company_code":company_code
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          toast.success("Data deleted successfully", {
            onClose: () => handleSearch(), 
          });
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to delete data");
        }
      } catch (error) {
        console.error("Error deleting rows:", error);
        toast.error('Error Deleting Data: ' + error.message);
      }
 };

const handleKeyDown = async (e, nextFieldRef) => {
  if (e.key === 'Enter') {
    const dataFound = await handleSearch(); // Await the search result

    if (dataFound && nextFieldRef) {
      nextFieldRef.current.focus(); // Move focus to the next field if data was found
    }
  }
};

// const handleKeyDown = async (e, nextFieldRef, value, hasValueChanged, setHasValueChanged) => {
//   if (e.key === 'Enter') {
//     if (hasValueChanged) {
//       await handleKeyDownStatus(e);
//       setHasValueChanged(false);
//     }

//     if (value) {
//       nextFieldRef.current.focus();
//     } else {
//       e.preventDefault();
//     }
//   }
// };

// const handleKeyDownStatus = async (e) => {
//   if (e.key === 'Enter' && hasValueChanged) {
//     setHasValueChanged(false);
//   }
// };




const handleLoanIdChange = (e) => {
  const value = e.target.value;
  const regex = /^[a-zA-Z0-9]*$/;

  if (regex.test(value)) {
    setLoan_ID(value);
    setError(false);
  } else {
    setError(true);
  }
};

const tabs = [
 
  {label:'Salary Eligibility Days'},
  { label: 'Bonus' },
  { label: 'PF Company' },
  { label: 'Professional Tax' },
  { label: 'Loan Type' },
  { label: 'TDS' },
  // { label: 'PayslipReport' },
 
];

const handleTabClick = (tabLabel) => {
  setActiveTab(tabLabel);

switch (tabLabel) {
  case 'EmployeeAllowance':
    NavigateEmployeeAllowance();
    break;

    case 'Salary Eligibility Days':
      FinancialYear();
      break;

    case 'Bonus':
  EmployeeBonus();
      break;
      
      case 'PF Company':
        EmpPFCompany();
        break;
      case 'Professional Tax':
        EmpProfessionalTax();
        break;
      case 'Loan Type':
        EmpLoanType();
        break;
      case 'TDS':
        EmpTDS();
        break;
      // case 'PayslipReport':
      //   PayslipReport();
      //   break;
    
  
      default:
        break;
    }
  };

  const NavigateEmployeeAllowance = () => {
    navigate("/EmployeeAllowance");
  };

  const FinancialYear = () => {
    navigate("/FinancialYear");
  };

  const EmployeeBonus = () => {
    navigate("/PayslipEmpBonus");
  };

  
  const EmpPFCompany= () => {
    navigate("/PayslipEmpPFCompany");
  };

  const EmpProfessionalTax= () => {
    navigate("/PayslipEmpProTax");
  };

  const EmpLoanType= () => {
    navigate("/EmpLoanType");
  };

  const EmpTDS= () => {
    navigate("/PayslipEmpTDS");
  };

  // const PayslipReport= () => {
  //   navigate("/PayslipReport");
  // };



  return (
    <div class="container-fluid Topnav-screen ">
      <div className="">
        <div class="">
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div className="shadow-lg p-0 bg-light rounded">
          <div className=" mb-0 d-flex justify-content-between" >
              <h1 align="left" class="">Payslip Master - Loan Type</h1>
            </div>
           </div>
            </div>
          </div>
          {/* <div className="shadow-lg  bg-light rounded-top mt-2  pt-3">
            <button className=" p-2 ms-2 shadow-sm addTab" >Loan Details</button>
          </div> */}

           <div className="">
                              <TabButtons tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
                            </div>

          <div class=" mb-4">
            <div className="shadow-lg p-3 bg-light rounded-bottom  mb-2">
              <div class="row">
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                      <label for="sname" className={`${error && ! Loan_ID ? 'red' : ''}`}> Loan ID
                        <span className="text-danger">*</span></label>
                       
                        </div>
                    </div>
                    <input
                      id="Loan_ID"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Loan ID"
                      value={Loan_ID}
                       autoComplete="off"
                       onChange={(e) => handleLoanIdChange(e)}
                      maxLength={20}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                      <label for="sname" className={`${error && ! Loan_Eligible_Amount? 'red' : ''}`}> Loan Amount
                      <span className="text-danger">*</span></label>
                       
                       </div>
                  
                    </div>
                    <input
                      id="Loan_Eligible_Amount"
                      class="exp-input-field form-control"
                      type="Number"
                      placeholder=""
                      required title="Please enter the Loan Amount"
                      value={Loan_Eligible_Amount}
                       autoComplete="off"
                      onChange={(e) => setLoan_Eligible_Amount(Number(e.target.value))}
                      
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                    <label For="city">Start Year<span className="text-danger">*</span></label>
                    </div>
                    <input
                      id="Start_Year"
                      class="exp-input-field form-control"
                      type="Date"
                      placeholder=""
                      required title="Please Choose the Year"
                      value={Start_Year}
                       autoComplete="off"
                      onChange={(e) => setStart_Year(e.target.value)}
                    
                    />
                    
  
  
                  </div>
                

                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                    <div>
                        <label For="city">End Year<span className="text-danger">*</span></label>
                      </div>
                    </div>
                    <input
                      id="End_Year"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please Choose the Year"
                      value={End_Year}
                     autoComplete="off"
                      onChange={(e) =>setEnd_Year(e.target.value)}
                      
                    />
                    
                  </div>
                </div>
                </div>

              
                <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
                  <button onClick={handleInsert} className="" title="Save">
                  <i class="fa-solid fa-floppy-disk"></i>
                  </button>
              
                </div>
              </div>


              <div class=" mb-4">
            <div className="shadow-lg p-3 bg-light rounded-bottom  mb-2">
            <div className="pe-0 " style={{width:"150px"}}>
                    <h6 className="">Search Criteria:</h6>
                  </div>
              <div class="row">
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname" class="exp-form-labels">
                        Loan ID
                        </label> </div>
                    </div>
                    <input
                      id="Loan_id"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Loan ID"
                      value={Loan_id}
                      autoComplete="off"
                      maxLength={20}
                      onChange={(e) => setLoan_id(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname" class="exp-form-labels">
                        Loan Amount
                        </label> </div>
                    </div>
                    <input
                      id="LoanEligibleAmount"
                      class="exp-input-field form-control"
                      type="Number"
                      placeholder=""
                      required title="Please enter the Loan Amount"
                      value={LoanEligibleAmount}
                     

                      onChange={(e) => setLoanEligibleAmount(Number(e.target.value))}
                      onKeyDown={(e) => handleKeyDown(e, LoanEligibleAmount)}
                    />
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label For="city">Start Year
                        </label></div>
                    </div>
                    <input
                      id="StartYear"
                      class="exp-input-field form-control"
                      type="Date"
                      placeholder=""
                      required title="Please Choose the Year"
                      value={StartYear}
                      // ref={found}
                      onChange={(e) => setStartYear(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, StartYear)}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label For="city">End Year
                        {/* <span className="text-danger">*</span> */}
                        </label></div>
                    </div>
                    <input
                      id="EndYear"
                      class="exp-input-field form-control"
                      type="Date"
                      placeholder=""
                      required title="Please Choose the Year"
                      value={EndYear}
                      // ref={found}
                      onChange={(e) =>setEndYear(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, EndYear)}
                    />
                  
                  </div>
                </div>
                </div> 
       
            <div className="col-md-3 form-group mt-4 mb-3">
                          <div class="exp-form-floating">
                            <div class=" d-flex  justify-content-center">
            
                              <div class=''><icon className="popups-btn fs-6 p-3" 
                              onClick={handleSearch}
                               required title="Search">
                                <i className="fas fa-search"></i></icon></div>
                              <div><icon className="popups-btn fs-6 p-3" 
                              onClick={reloadGridData} 
                              required title="Refresh">
                                <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" /></icon></div>
                            </div> </div></div>
            
               <div class="ag-theme-alpine" style={{ height: 455, width: "100%" }}>
                          <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            // defaultColDef={defaultColDef}
                            onCellValueChanged={onCellValueChanged}
                            onGridReady={onGridReady}
                            rowSelection="multiple"
                            onSelectionChanged={onSelectionChanged}
                            pagination={true}
                            paginationAutoPageSize={true}
                            onRowSelected={onRowSelected}
                            gridOptions={gridOptions}
                          />
                        </div>
            </div>
          </div>
       </div>
       </div>
    

  );
}
export default Input;
