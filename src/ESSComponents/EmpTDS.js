import React, { useState, useEffect, useRef } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';
import './EmployeeLoan.css'
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TabButtons from './Tabs.js';
import { ToastContainer, toast } from 'react-toastify';
import '../apps.css'
import { AgGridReact } from "ag-grid-react";
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
  const [Company_Code, setCompany_Code] = useState("");
  const [Employee_Salary, setEmployee_Salary] = useState(0);
  const [Employee_Salarys, setEmployee_Salarys] = useState(0);
  const [Taxable_Amounts, setTaxable_Amounts] = useState(0);
  const [Taxable_Amount, setTaxable_Amount] = useState(0);
  const [Start_Years, setStart_Years] = useState(FirstDate);
  const [End_Years, setEnd_Years] = useState(LastDate);
  const [error, setError] = useState("");
  const [Start_Year, setStart_Year] = useState(FirstDate);
  const [originalRowData, setoriginalRowData] = useState('');
    const [End_Year, setEnd_Year] = useState(LastDate);
      const [editedData, setEditedData] = useState([]);
     const [rowData, setRowData] = useState([]);
         const [selectedRows, setSelectedRows] = useState([]);
     const [gridApi, setGridApi] = useState(null);
  
  const [open3, setOpen3] = React.useState(false);
  const navigate = useNavigate();
  const companycode = useRef(null);
  const EmployeeSalary = useRef(null);
  const TaxableAmount = useRef(null);
  const startyear = useRef(null);
  const endyear = useRef(null);
  const found = useRef(null);
    const gridApiRef = useRef(null);
    const gridColumnApiRef = useRef(null);
  
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode')
  const [isUpdated, setIsUpdated] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
  const[activeTab,setActiveTab]=useState("EmpTDS")

  const location = useLocation();
  const { mode, selectedRow } = location.state || {};

  const modified_by = sessionStorage.getItem("selectedUserCode");

  const clearInputFields = () => {
    setCompany_Code("");
    setEmployee_Salary(0);
    setTaxable_Amount(0);
  };

  console.log(selectedRow)
  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const columnDefs = [
    {
      headerName: "Actions",
      field: "action",
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
    
      headerName: "Start Year",
      field: "Start_Year",
      editable:true ,
      valueFormatter: (params) => formatDate(params.value),
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      // maxWidth: 150,
      cellEditorParams: {
        maxLength: 18,
      },
    },
    {
      headerName: "End Year",
      field: "End_Year",
      editable:true ,
      valueFormatter: (params) => formatDate(params.value),
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      // maxWidth: 150,
      cellEditorParams: {
        maxLength: 250,
      },
    },
    {
      headerName: "Employee Salary",
      field: "Employee_Salary",
      editable:true ,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 10,
      },
    },

    {
      headerName: "Taxable Amount",
      field: "Taxable_Amount",
      editable:true ,
      cellStyle: { textAlign: "left" },
      // minWidth: 150,
      cellEditorParams: {
        maxLength: 10,
      },
    },

    {
      headerName: "Key Field ",
      field: "keyfield",
      editable: false,
      hide: true 
    },
    
  ];

const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
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

  
   
  const handleSearch = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/SearchTDS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          company_code : sessionStorage.getItem('selectedCompanyCode'),
          Start_Years,
          End_Years, 
          Employee_Salarys, 
          Taxable_Amounts
        })
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert sales data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error updating data: " + error.message);
    }
  };


  const handleInsert = async () => {
    if (
      !Start_Year ||
      !End_Year ||
      !Employee_Salary ||
      !Taxable_Amount
    ) {
      setError(" ");
      return;
    }

    // Email validation
 

    try {
      // const formData = new FormData();
      // formData.append("company_code", sessionStorage.getItem("selectedCompanyCode") );
      // formData.append("Employee_Salary", Employee_Salary);
      // formData.append("Taxable_Amount", Taxable_Amount);
      // formData.append("created_by", sessionStorage.getItem('selectedUserCode'));

      const response = await fetch(`${config.apiBaseUrl}/addTDS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code : sessionStorage.getItem('selectedCompanyCode'),
          Start_Year,
          End_Year,
          Employee_Salary,
          Taxable_Amount,
          created_by : sessionStorage.getItem('selectedUserCode'),
        }),

        });
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(), // Reloads the page after the toast closes
          });
        }, 1000);
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        //setError(errorResponse.error);
        toast.warning(errorResponse.message, {

        });
      } else {
        console.error("Failed to insert data");
        // Show generic error message using SweetAlert
        console.error("Failed to insert data");
        // Show generic error message using SweetAlert
        toast.error('Failed to insert data', {

        });
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      // Show error message using SweetAlert
      toast.error('Error inserting data: ' + error.message, {

      });
    }
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

  const handleUpdate = async (rowData) => {
 try {
      // Check if any data is actually modified
      if (rowData.every((row) => JSON.stringify(row) === JSON.stringify(rowData.find((original) => original.id === row.id)))) {
        toast.warning("Please modify at least one cell to update the row.");
        return; // Don't proceed with update if no data has changed
      }
  
      const company_code = sessionStorage.getItem('selectedCompanyCode');
      const modified_by = sessionStorage.getItem('selectedUserCode');

      const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };

        const response = await fetch(`${config.apiBaseUrl}/updateTDS`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "company_code":company_code,
            "modified-by":modified_by
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          toast.success("Data updated successfully")
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to insert sales data");
        }
      } catch (error) {
        console.error("Error update rows:", error);
        toast.error('Error update Data: ' + error.message);
      }
 };


 const handleDelete = async (rowData) => {
  try {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

      const dataToSend = { deletedData: Array.isArray(rowData) ? rowData : [rowData] };

        const response = await fetch(`${config.apiBaseUrl}/deleteTDS`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "company_code":company_code,
          },
          body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
          toast.success("Data deleted successfully", {
            onClose: () => handleSearch(), 
          });
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to Delete data");
        }
      } catch (error) {
        console.error("Error deleting rows:", error);
        toast.error('Error Deleting Data: ' + error.message);
      }
 };
  

  const handlePaySlip = () => {
    setOpen3(true);
  };
  const reloadGridData = () => {
    window.location.reload();
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
      navigate("/PayslipEmpLoanType");
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
            <div className="purbut mb-0 d-flex justify-content-between" >
              <h1 align="left" class="purbut">Payslip Master - TDS</h1>
            </div>
          </div>
          
          {/* <div className="shadow-lg  bg-light rounded-top mt-2  pt-3">
            <button className=" p-2 ms-2 shadow-sm addTab" > TDS Details</button>
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
                        <label for="sname" class="exp-form-labels">
                        Start Year
                        </label> </div>
                        <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="date"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the From Date"
                      value={Start_Year}
                      onChange={(e) => setStart_Year(e.target.value)}
                     
                    />
                    {error && !Start_Year && <div className="text-danger"> Start Year should  not be blank</div>}
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname" class="exp-form-labels">
                          End Year
                        </label> </div>
                        <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="date"
                      class="exp-input-field form-control"
                      type="date"
                      required title="Please Choose the Year"
                      placeholder=""
                      value={End_Year}
                      
                      onChange={(e) => setEnd_Year(e.target.value)}
                     
                    />
                    {error && !End_Year && <div className="text-danger"> End Year should not be blank</div>}
                  </div>
                </div>
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname" class="exp-form-labels">
                        Employee Salary
                        </label> </div>
                        <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Employee Salary"
                      value={Employee_Salary}
                      onChange={(e) => setEmployee_Salary(e.target.value)}
                      ref={EmployeeSalary}
                      onKeyDown={(e) => handleKeyDown(e, TaxableAmount, EmployeeSalary)}
                    />
                    {error && !Employee_Salary && <div className="text-danger">Employee Salary should not be blank</div>}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                       Taxable Amount
                      </label></div>
                      <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Taxable Amount"
                      value={Taxable_Amount}
                      ref={TaxableAmount}
                      onChange={(e) => setTaxable_Amount(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, TaxableAmount)}
                    />
                    {error && !Taxable_Amount && <div className="text-danger">Taxable Amount should not be blank</div>}
                  </div>
                </div>
               
                <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
                  <button onClick={handleInsert} className="" title="Save">
                  <i class="fa-solid fa-floppy-disk"></i>
                  </button>
                </div>
                </div>
                </div>

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
                        Start Year
                        </label>
                        </div>
                        </div>
        <input 
                      type="date"
                      className="exp-input-field form-control"
                      required title="Please Choose the Year"
          value={Start_Years}
          onChange={(e) => setStart_Years(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        </div>
                   <div className="col-md-3 form-group mb-2">
                     <div class="exp-form-floating">
                       <div class="d-flex justify-content-start">
                         <div>
        <label for="sname" class="exp-form-labels">
                        End Year
                        </label>
                        </div>
                        </div>

        <input             
                              required title="Please Choose the Year"
        type="date"
        className="exp-input-field form-control"
        value={End_Years}
        onChange={(e) => setEnd_Years(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        </div>
                   <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
        <label for="sname" class="exp-form-labels">
                        Employee Salary
                        </label>
                        </div>
                       </div>
                       
        <input type="Number" 
        className="exp-input-field form-control"
        required title="Please enter the Employee Salary"
        value={Employee_Salarys}
        onChange={(e) => setEmployee_Salarys(Number(e.target.value))}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        </div>
        <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                                <label for="sname" class="exp-form-labels">
                        Taxable Amount
                        </label>
                        </div>
                        </div>
        <input type="Number" 
        className="exp-input-field form-control"
        required title="Please enter the Taxable Amount"
        value={Taxable_Amounts}
        onChange={(e) => setTaxable_Amounts(Number(e.target.value))}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        </div>
      

      
      <div className="col-md-2 form-group mb-2 mt-4">
                  <div class=" d-flex  justify-content-center">
                    <div class=''>
                      <icon className="popups-btn fs-6 p-3" onClick={handleSearch} required title="Search">
                        <i className="fas fa-search"></i>
                      </icon>
                    </div>
                    <div>
                      <icon className="popups-btn fs-6 p-3" onClick={reloadGridData} required title="Refresh">
                        <i className="fa-solid fa-arrow-rotate-right" />
                      </icon>
                    </div>
                  </div>
              </div>
              </div> 
                 <div class="ag-theme-alpine" style={{ height: 485, width: "100%" }}>
                                            <AgGridReact
                                              rowData={rowData}
                                              columnDefs={columnDefs}
                                              onCellValueChanged={onCellValueChanged}
                                              rowSelection="multiple"
                                              pagination={true}
                                              paginationAutoPageSize={true}
                                              gridOptions={gridOptions}
                                              onGridReady={(params) => {
                                                gridApiRef.current = params.api;
                                                gridColumnApiRef.current = params.columnApi;
                                              }}
                                            />
                                          </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        
     

  );
}
export default Input;
