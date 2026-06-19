import React, { useState } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';
import './EmployeeLoan.css'
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import '../apps.css'

const config = require('../Apiconfig');

function Input({ }) {
  const [GradeID, setGradeID] = useState('');
  const [GradeName, setGradeName] = useState('');
  const [Basic, setBasic] = useState('');
  const [HRA, setHRA] = useState('');
  const [Conveyance, setConveyance] = useState('');
  const [Medical, setMedical] = useState('');
  const [Special_Allowance, setSpecial_Allowance] = useState('');
  const [Company_Pf_Contribution, setCompany_Pf_Contribution] = useState('');
  const [Bonus_Arrears, setBonus_Arrears] = useState('');
  const [Other_Allowance, setOther_Allowance] = useState('');
  const [LeaveDeduction, setLeaveDeduction] = useState('');
  const[otherDeductions,setotherDeductions]=useState('');
  const[error,setError]=useState('');
  const navigate = useNavigate();

  

  const handleNavigate = () => {
    navigate("/Grade");
  };

 
  const handleSave = async () => {
    if (!GradeID || !GradeName || !Basic || !LeaveDeduction) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    try {
      
      const Header = {
       GradeID: GradeID,
       GradeName:GradeName,
       Basic:Basic,
       HRA: HRA,
       Conveyance:parseFloat(Conveyance),
       Medical: parseFloat(Medical),
       Special_Allowance: parseFloat(Special_Allowance),
       Company_Pf_Contribution:parseFloat(Company_Pf_Contribution),
       Bonus_Arrears:parseFloat(Bonus_Arrears),
       Other_Allowance:parseFloat(Other_Allowance),
       LeaveDeduction:parseFloat(LeaveDeduction),
       otherDeductions:parseFloat(otherDeductions),
       created_by:sessionStorage.getItem('selectedUserCode')
      };

      const response = await fetch(`${config.apiBaseUrl}/addGrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(),
          });
        }, 1000);
      } else {
        const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to insert sales data");
          console.error(errorResponse.details || errorResponse.message);
        }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };
  const handleUpdate = async () => {
    if (!GradeID) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    try {
      
      const Header = {
       GradeID: GradeID,
       GradeName:GradeName,
       Basic:Basic,
       HRA: HRA,
       Conveyance:parseFloat(Conveyance),
       Medical: parseFloat(Medical),
       Special_Allowance: parseFloat(Special_Allowance),
       Company_Pf_Contribution:parseFloat(Company_Pf_Contribution),
       Bonus_Arrears:parseFloat(Bonus_Arrears),
       Other_Allowance:parseFloat(Other_Allowance),
       LeaveDeduction:parseFloat(LeaveDeduction),
       otherDeductions:parseFloat(otherDeductions),
       modified_by:sessionStorage.getItem('selectedUserCode')
      };

      const response = await fetch(`${config.apiBaseUrl}/updateGrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });
      if (response.status === 200) {
        console.log("Data updated successfully");
        setTimeout(() => {
          toast.success("Data updated successfully!", {
            onClose: () => window.location.reload(),
          });
        }, 1000);
      } else {
        const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to update sales data");
          console.error(errorResponse.details || errorResponse.message);
        }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };
  const handledelete = async () => {
    if (!GradeID) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }
    try {
      
      const Header = {
       GradeID: GradeID
      };

      const response = await fetch(`${config.apiBaseUrl}/deleteGrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });
      if (response.status === 200) {
        console.log("Data deleted successfully");
        setTimeout(() => {
          toast.success("Data deleted successfully!", {
            onClose: () => window.location.reload(),
          });
        }, 1000);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to delete grade");
          console.error(errorResponse.details || errorResponse.message);
        }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRefNo(GradeID)
    }
  };

  const handleRefNo = async (code) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getGrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Id: code })
      });
  
      if (response.ok) {
        const searchData = await response.json();

      const [{Basic,Bonus_Arrears,Company_Pf_Contribution,Conveyance,GradeID,GradeName,HRA,
        LeaveDeduction,Medical,Other_Allowance,Special_Allowance,otherDeductions}] = searchData;
 
       
        setBasic(Basic);
        setBonus_Arrears(Bonus_Arrears);
        setCompany_Pf_Contribution(Company_Pf_Contribution);
        setConveyance(Conveyance);
        setGradeID(GradeID);
        setGradeName(GradeName);
        setHRA(HRA);
        setLeaveDeduction(LeaveDeduction);
        setMedical(Medical);
        setOther_Allowance(Other_Allowance);
        setSpecial_Allowance(Special_Allowance);
        setotherDeductions(otherDeductions);




        } else if (response.status === 404) {
        toast.warning('Data not found');
        setGradeID('');
        setGradeName('');
        setBasic('');
        setHRA('');
        setConveyance('');
        setMedical('');
        setSpecial_Allowance('');
        setCompany_Pf_Contribution('');
        setBonus_Arrears('');
        setOther_Allowance('');
        setLeaveDeduction('');
        setotherDeductions('');

      } else {
        console.log("Bad request");
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
          <div className="shadow-lg p-0 bg-light rounded">
            <div className="purbut mb-0 d-flex justify-content-between" >
              <h1 align="left" class="purbut">Add Grade Details</h1>
              <button onClick={handleNavigate} className="purbut btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
              <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

<div className="shadow-lg  bg-light rounded-top mt-2  pt-3">
                        
                        
                        <button className=" p-2 ms-2 shadow-sm addTab" > Grade Details</button>
                   
                       
        </div>









          <div class=" mb-4">
            <div className="shadow-lg p-3 bg-light rounded-bottom  mb-2">
              <div class="row">
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="cname" class="exp-form-labels">
                      Grade ID
                      </label></div>
                      <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id=" Grade ID"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the founded date"
                      value={ GradeID}
                      onChange={(e) => setGradeID(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname" class="exp-form-labels">
                        Grade Name 
                        </label> </div>
                    </div>
                    <input
                      id="Grade Name "
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the founded date"
                      value={  GradeName }
                      onChange={(e) => setGradeName (e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        Basic
                      </label></div>
                      <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id=" Basic"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={ Basic}
                      onChange={(e) => setBasic(e.target.value)}
                    />
                 
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add2" class="exp-form-labels">
                        HRA 
                      </label> </div>
                      <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="HRA "
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={  HRA }
                      onChange={(e) => setHRA (e.target.value)}
                      maxLength={250}
                    />
                  
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="add3" class="exp-form-labels  ">
                      Conveyance
                    </label><input
                      id="add3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={ Conveyance}
                      onChange={(e) => setConveyance(e.target.value)}
                      maxLength={250}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label For="city" className="exp-form-labels">Medical</label>
                      </div>
                      <div><span className="text-danger">*</span></div>
                    </div>
                    <input
                      id="add3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={Medical}
                      onChange={(e) => setMedical(e.target.value)}
                    />
                   
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="add3" class="exp-form-labels  ">
                      Special Allowance
                    </label><input
                      id="add3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={ Special_Allowance}
                      onChange={(e) => setSpecial_Allowance(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="add3" class="exp-form-labels  ">
                      Company PF Contribution
                    </label><input
                      id="add3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={ Company_Pf_Contribution}
                      onChange={(e) => setCompany_Pf_Contribution(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="add3" class="exp-form-labels  ">
                      Bonus / Arrears
                    </label><input
                      id="add3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={ Bonus_Arrears} 
                      onChange={(e) => setBonus_Arrears(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="add3" class="exp-form-labels  ">
                      Other Allowance
                    </label><input
                      id="add3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={Other_Allowance}
                      onChange={(e) => setOther_Allowance(e.target.value)}
                    />
                  </div>
                </div>
               
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="add3" class="exp-form-labels  ">
                      Leave Deductions
                    </label>  <div>
                      {/* <span className="text-danger">*</span> */}
                      </div>
                    <input
                      id="add3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={ LeaveDeduction}
                      onChange={(e) => setLeaveDeduction(e.target.value)}
                      maxLength={250}
                    />
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <label for="add3" class="exp-form-labels  ">
                      Other Deductions
                    </label><input
                      id="add3"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the address"
                      value={otherDeductions}
                      onChange={(e) => setotherDeductions(e.target.value)}
                    />
                  </div>
                </div>
                
                
                

               
               
                
                <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
                
                    <button onClick={handleSave} className="" title="Save">
                      Save
                    </button>
                    <button onClick={handleUpdate} className="" title="update">
                      update
                    </button>
                    <button onClick={handledelete} className="" title="delete">
                      delete
                    </button>
                   
                   

                 
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
