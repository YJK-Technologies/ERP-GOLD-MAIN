import React, { useState, useEffect, useRef } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';
import './EmployeeLoan.css'
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import '../apps.css'
import TabButtons from './Tabs.js';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  const [company_code, setCompany_Code] = useState("");
  const [Employee_Salary_From, setEmployee_Salary_From] = useState(0);
  const [Employee_Salary_To, setEmployee_Salary_To] = useState(0);
  const [Taxable_Amount, setTaxable_Amount] = useState(0);
  const [EmployeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [open3, setOpen3] = React.useState(false);
  const navigate = useNavigate();

  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [companyImage, setCompanyImage] = useState("");
  const created_by = sessionStorage.getItem('selectedUserCode')
  const [isUpdated, setIsUpdated] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
  const [Start_Year, setStart_Year] = useState(FirstDate);
  const [End_Year, setEnd_Year] = useState(LastDate);
   const [rowData, setRowData] = useState([]);
   const [Empsalaryfrom, setEmpsalaryfrom] = useState(0);
   const [EmpsalaryTo, setEmpsalaryTo] = useState(0);
   const [TaxAMt, setTaxAMt] = useState(0);
  const gridApiRef = useRef(null);
   const gridColumnApiRef = useRef(null);
  const location = useLocation();
  const[activeTab,setActiveTab]=useState("EmpProfessonalTax");
  
  
  const { mode, selectedRow } = location.state || {};

  const modified_by = sessionStorage.getItem("selectedUserCode");

  const clearInputFields = () => {
    setCompany_Code("");
    setEmployee_Salary_From(0);
    setEmployee_Salary_To(0);
    setTaxable_Amount(0);
  };

  console.log(selectedRow)

 
  useEffect(() => {
    if (mode === "update" && selectedRow && !isUpdated) {
      setCompany_Code(selectedRow.company_code|| "");
      setEmployee_Salary_From(selectedRow.Employee_Salary_From || 0);
      setEmployee_Salary_To(selectedRow.Employee_Salary_To || 0);
      setTaxable_Amount(selectedRow.Taxable_Amount || 0);


    } else if (mode === "create") {
      clearInputFields();
    }
  }, [mode, selectedRow, isUpdated]);

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };


  const Employeecol = [
    // { headerName: "EmployeeId", field: "EmployeeId", sortable: true,  minWidth:50, maxWidth:50, cellStyle: { textAlign: "left" }},

    {
      headerName: "Actions",
      field: "action",
      // minWidth: 120,
      // maxWidth: 130,
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
                  onClick={() => handleUpdate(params.data)}
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
    { headerName: "Start Year",
       field: "Start_Year",
       filter: 'agTextColumnFilter', 
      //  minWidth:120,
      //   maxWidth:130,
         cellStyle: { textAlign: "left" },
         },
    { 
      headerName: "End Year",
       field: "End_Year",
       filter: 'agTextColumnFilter',
        sortable: true,
        textAlign:"center",
        filter: true, 
        cellStyle: { textAlign: "left" },
       },
    { 
      headerName: "Employee Salary From", 
      field: "Employee_Salary_From",
      filter: 'agTextColumnFilter',
      sortable: true,
       filter: true,
       editable:true,
        cellStyle: { textAlign: "left" },
       },
    { headerName: "Employee Salary To ",
       field: "Employee_Salary_To",
        filter: 'agTextColumnFilter',
        sortable: true,
        editable:true,
         filter: true, 
         cellStyle: { textAlign: "left" },
         },
    { 
      headerName: "Taxable Amount",
       field: "Taxable_Amount", 
       sortable: true,
       editable:true,
       filter: 'agTextColumnFilter',
        filter: true,
         cellStyle: { textAlign: "left" },
         editable:true
         },

         { headerName: "Keyfield", field: "Keyfield", hide: true },
  ]

  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
  };

  const handleInsert = async () => {
    if (
      !Employee_Salary_From ||
      !Employee_Salary_To ||
      !Start_Year ||
      !End_Year ||
      !Taxable_Amount 
    ) {
      setError(" ");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/addProfessionalTax`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_code: sessionStorage.getItem('selectedCompanyCode'),
          Start_Year,
          End_Year,
          Employee_Salary_From,
          Employee_Salary_To,
          Taxable_Amount,
          created_by: sessionStorage.getItem('selectedUserCode')
        }),
      });

      if (response.status === 200) {
        console.log("Data Inserted successfully");
        setTimeout(() => {
          toast.success("Data Inserted successfully!", {
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
        const company_code = sessionStorage.getItem('selectedCompanyCode');
        const modified_by = sessionStorage.getItem('selectedUserCode');

        const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };

          const response = await fetch(`${config.apiBaseUrl}/updateProfessionalTax`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "company_code":company_code,
              "modified-by":modified_by
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

  const handlePaySlip = () => {
    setOpen3(true);
  };
  const reloadGridData = () => {
    window.location.reload();
  };
  
  const handleDelete= async (rowData) => {
    try {
        const company_code = sessionStorage.getItem('selectedCompanyCode');

        const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };

          const response = await fetch(`${config.apiBaseUrl}/deleteProfessionalTax`, {
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
            toast.warning(errorResponse.message || "Failed to insert sales data");
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error('Error Deleting Data: ' + error.message);
        }
   };




  const handleSearch = async () => {
    try {
      const body = {
        Employee_Salary_From:Empsalaryfrom,
        Employee_Salary_To:EmpsalaryTo,
        Taxable_Amount:TaxAMt,
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      };

      const response = await fetch(`${config.apiBaseUrl}/ProfessionalTaxSC`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const fetchedData  = await response.json();
        const newRows = fetchedData .map((matchedItem) => ({
          Start_Year :formatDate(matchedItem.Start_Year),
          End_Year :formatDate(matchedItem.End_Year),
          Employee_Salary_From:matchedItem.Employee_Salary_From,
          Employee_Salary_To:matchedItem.Employee_Salary_To,
          Taxable_Amount:matchedItem.Taxable_Amount,
          Keyfield:matchedItem.Keyfield,
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
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div className="shadow-lg p-0 bg-light rounded">
            <div className="purbut mb-0 d-flex justify-content-between" >
              <h1 align="left" class="purbut">Payslip Master - Professional Tax</h1>
            </div>
          </div>
          {/* <div className="shadow-lg  bg-light rounded-top mt-2  pt-3">
            <button className=" p-2 ms-2 shadow-sm addTab" >Professional Tax</button>
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
                      required title = "Please Choose the Year"
                      value={Start_Year}
                     
                      onChange={(e) => setStart_Year(e.target.value)}
                     
                    />
                    {error && !Employee_Salary_From && <div className="text-danger"> From Date not be blank</div>}
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
                      placeholder=""
                      required title = "Please Choose the Year"
                      value={End_Year}
                     
                      onChange={(e) => setEnd_Year(e.target.value)}
                     
                    />
                    {error && !Employee_Salary_From && <div className="text-danger"> From Date not be blank</div>}
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname" class="exp-form-labels">
                         Employee Salary From 
                        </label> </div>
                        <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="num"
                      placeholder=""
                      required title="Please enter the Employee Salary From"
                      value={Employee_Salary_From}
                      
                      onChange={(e) => setEmployee_Salary_From(e.target.value)}
                     
                    />
                    {error && !Employee_Salary_From && <div className="text-danger">Employee Salary From  not be blank</div>}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                      Employee Salary To
                      </label></div>
                      <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Employee Salary To"
                      value={Employee_Salary_To}
                     
                      onChange={(e) => setEmployee_Salary_To(e.target.value)}
                    
                    />
                    {error && !Employee_Salary_To && <div className="text-danger">Employee Salary To not be blank</div>}
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
                      id="add3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Taxable Amount"
                      value={Taxable_Amount}
                      onChange={(e) => setTaxable_Amount(e.target.value)}
                      maxLength={250}
                     
                     
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
                        <label for="add1" class="exp-form-labels">
                       Employee Salary From
                       </label> </div>
                       </div>
                <input id="status"
                 className="exp-input-field form-control"
                 required title="Please enter the Employee Salary From"
                  value={Empsalaryfrom}
                  onChange={(e) => setEmpsalaryfrom(Number(e.target.value))}
                   type="text" 
                   onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                 />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname" class="exp-form-labels">
                       Employee Salary To
                       </label> </div>
                       </div>
                <input id="status"
                 className="exp-input-field form-control"
                  type="text" 
                  required title="Please enter the Employee Salary To"
                  value={EmpsalaryTo}
                  onChange={(e) => setEmpsalaryTo(Number(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                   />
              </div>
            </div>
            <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="add1" class="exp-form-labels">
                       Taxable Amount
                       </label></div>
                       </div>
                <input id="status"
                 className="exp-input-field form-control"
                 required title="Please enter the Taxable Amount"
                  value={TaxAMt}
                  onChange={(e) => setTaxAMt(Number(e.target.value))}
                  type="number"  
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                 />
              </div>
            </div>
                     
            </div> 
            <div className="col-md-3 form-group mt-4">
                          <div class="exp-form-floating">
                            <div class=" d-flex  justify-content-center">
            
                              <div class=''><icon className="popups-btn fs-6 p-3" onClick={handleSearch} 
                              required title="Search">
                                <i className="fas fa-search"></i></icon></div>
                              <div><icon className="popups-btn fs-6 p-3" onClick={reloadGridData} required title="Refresh">
                                <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" /></icon></div>
                            </div> </div></div>
         
                            <div className="ag-theme-alpine mt-2 rounded-4" style={{ height: 540, width: '100%' }}>
                              <AgGridReact 
                              columnDefs={Employeecol} 
                              rowData={rowData}
                              
                              gridOptions={gridOptions}
                              suppressRowClickSelection={true}
                              onGridReady={(params) => {
                                gridApiRef.current = params.api;
                                gridColumnApiRef.current = params.columnApi;
                              }
                            }
                              
                              />
                            </div>
                          </div>
              </div>
            </div>
          </div>
        </div>
        </div>

  );
}
export default Input;
