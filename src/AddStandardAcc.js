import React, { useState, useEffect, useRef } from "react";
import "./input.css";
//import "./exp.css";

import { useNavigate } from "react-router-dom";  
import Select from 'react-select'
import { ToastContainer, toast } from 'react-toastify';


function StdAccInput({  }) {
  const navigate = useNavigate();
  const [standard_accgroup_code, setstandard_accgroup_code] = useState("");
  const [standard_accgroup_name, setstandard_accgroup_name] = useState("");
  const [base_accgroup_code, setbase_accgroup_code] = useState("");
  const [user_accgroup_from, setuser_accgroup_from] = useState("");
  const [user_accgroup_to, setuser_accgroup_to] = useState("");
  const [status, setstatus] = useState(""); 
  const [deletePermission, setdeletePermission] = useState("");
  const [statusdrop, setStatusdrop] = useState([]);
  const [baseaccdrop, setbaseaccdrop] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('base');
  const [selectBaseacc, setselectedbaseacc] = useState('');
  const [selectedDelete, setSelectedDelete] = useState('');
  const [deletedrop, setdeletedrop] = useState('');
  const StandardAccount =useRef(null)
  const Delete =useRef(null)
  const Status =useRef(null)
  const User =useRef(null)
  const Account =useRef(null)
  const Base =useRef(null)
  const Standard =useRef(null)
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode')
  

  
  const config = require('./Apiconfig');

  console.log(selectedRows);

  
  
  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    
    fetch(`${config.apiBaseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  // useEffect(() => {
  //   fetch(`${config.apiBaseUrl}/getbasaccode`)
  //     .then((data) => data.json())
  //     .then((val) => setbaseaccdrop(val));
  // }, []);

  const company_code = sessionStorage.getItem('selectedCompanyCode');

useEffect(() => {
fetch(`${config.apiBaseUrl}/getbasaccode`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ company_code }),
})
.then((data) => data.json())
.then((val) => setbaseaccdrop(val));
}, []);



  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    
    fetch(`${config.apiBaseUrl}/delPer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setdeletedrop(val))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  const filteredOptionbaseacc = baseaccdrop.map((option) => ({
    value: option.base_accgroup_code,
    label: option.base_accgroup_code,
  }));

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionDelete = Array.isArray(deletedrop) ? deletedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  })) : [];


  const handleChangeStatus = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setstatus(selectedStatus ? selectedStatus.value : '');
    setError(false);
  };
  
  const handleChangebaseacc = (selectedbaseacc) => {
    setselectedbaseacc(selectedbaseacc);
    setbase_accgroup_code(selectedbaseacc ? selectedbaseacc.value : '');
    setError(false);
  };
    
  const handleChangeDelete = (selectedDelete) => {
    setSelectedDelete(selectedDelete);
    setdeletePermission(selectedDelete ? selectedDelete.value : '');
    setError(false);
  };

  const handleNavigateToForm = () => {
    navigate("/AddBaseAccount", { selectedRows }); // Pass selectedRows as props to the Input component
  };

  const handleInsert = async () => {
    if (
      !standard_accgroup_code ||
      !standard_accgroup_name ||
      !base_accgroup_code ||
      !status 
  ) {
      setError(" ");
      return;
  }
    //   if (validateInputs()) {
    try {
      const response = await fetch(`${config.apiBaseUrl}/addstandardaccountData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

          standard_accgroup_code,
          standard_accgroup_name,
          base_accgroup_code,
          user_accgroup_from,
          user_accgroup_to,
          status,
          deletePermission,
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          created_by: sessionStorage.getItem('selectedUserCode')

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
                         toast.warning(errorResponse.message)
                 
             } else {
                 console.error("Failed to insert data");
                 // Show generic error message using SweetAlert
                toast.error('Failed to insert data')
             }
         } catch (error) {
             console.error("Error inserting data:", error);
             // Show error message using SweetAlert
           toast.error('Error inserting data: ' + error.message)
         }
       };
  const handleNavigate = () => {
    navigate("/AddUserAccGrp"); // Pass selectedRows as props to the Input component
  };
  

  const handleKeyDown = async (e, nextFieldRef, value, hasValueChanged, setHasValueChanged) => {
    if (e.key === 'Enter') {
      // Check if the value has changed and handle the search logic
      if (hasValueChanged) {
        await handleKeyDownStatus(e); // Trigger the search function
        setHasValueChanged(false); // Reset the flag after the search
      }
  
      // Move to the next field if the current field has a valid value
      if (value) {
        nextFieldRef.current.focus();
      } else {
        e.preventDefault(); // Prevent moving to the next field if the value is empty
      }
    }
  };
  
  
  
  const handleKeyDownStatus = async (e) => {
    if (e.key === 'Enter' && hasValueChanged) { // Only trigger search if the value has changed
       // Trigger the search function
      setHasValueChanged(false); // Reset the flag after search
    }
  };
  
  return (
    
    <div class="container-fluid Topnav-screen ">
            <ToastContainer position="top-right" className="toast-design" theme="colored"/>
      <div className="">
    <div class="">

      
      <div className="shadow-lg p-0 bg-body-tertiary rounded">
   <div className=" mb-0 d-flex justify-content-between" >
              <h1 align="left" class="fs-4"> Add Standard Account</h1>
              <button onClick={handleNavigate} className=" btn btn-danger shadow-none rounded-0 h-70 fs-5" required title="Close">
              <i class="fa-solid fa-xmark"></i>
              </button>
            </div>  
  
</div>
        <div className="shadow-lg p-1 mt-2 pt-4 pb-4 bg-body-tertiary rounded">
          <div className="row ">
            <div className="col-md-3 form-group ">
              <div class="exp-form-floating">
              <div class="d-flex justify-content-start">
                <label
                                    htmlFor="partyName"
                                    className={`${error && !standard_accgroup_code ? 'red' : ''}`}
                                >
                                    Standard Account<span className="text-danger">*</span>
                                </label>
                 </div> <input
                  id="stdcode"
                  class="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please enter the Standard Account Code"
                  value={standard_accgroup_code}
                  onChange={(e) => setstandard_accgroup_code(e.target.value)}
                  ref={Standard}
                  onKeyDown={(e) => handleKeyDown(e, StandardAccount, Standard)}
                />           

                
              </div>
            </div>
            <div className="col-md-3 form-group ">
              <div class="exp-form-floating">
              <div class="d-flex justify-content-start">
                <label
                                    htmlFor="partyName"
                                    className={`${error && !standard_accgroup_name ? 'red' : ''}`}
                                >
                                    Standard Account Name<span className="text-danger">*</span>
                                </label>
                 </div><input
                  id="stdname"
                  class="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please enter the Standard Account Name"
                  value={standard_accgroup_name}
                  onChange={(e) => setstandard_accgroup_name(e.target.value)}
                  ref={StandardAccount}
                  onKeyDown={(e) => handleKeyDown(e, Base, StandardAccount)}
                />            

                
              </div>
            </div>

            
            <div className="col-md-3 form-group ">
            
              <div class="d-flex justify-content-start">
                <label
                                    htmlFor="partyName"
                                    className={`${error && !base_accgroup_code ? 'red' : ''}`}
                                >
                                    Base Account Code<span className="text-danger">*</span>
                                </label>
                 </div>
                <div title="Select the Base Account Code">        
                <div className="input-group">
                <Select
                id="taxtransaction"
                value={selectBaseacc}
                onChange={handleChangebaseacc}
                options={filteredOptionbaseacc}
                className="exp-input-field position-relative"
                classNamePrefix="react-select"
                placeholder=""
                ref={Base}
                onKeyDown={(e) => handleKeyDown(e, Account, Base)}
              /><button onClick={handleNavigateToForm} class="stahdrcode position-absolute pb-2  me-5" required title="Add Standard Code"><i class="fa-solid fa-plus"></i></button>
              </div>
              </div>
               
              </div>
            

            

           
      

            <div className="col-md-3 form-group ">
              <div class="exp-form-floating">
              <div class="d-flex justify-content-start">
                <label
                                    htmlFor="partyName"
                                    className={`${error && !user_accgroup_from ? 'red' : ''}`}
                                >
                                    User Account Group From<span className="text-danger">*</span>
                                </label>
                 </div><input
                  id="taxpercent"
                  class="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please enter the tax percentage"
                  value={user_accgroup_from}
                  onChange={(e) => setuser_accgroup_from(e.target.value)}
                  ref={Account}
                  onKeyDown={(e) => handleKeyDown(e, User, Account)}
                />       

              </div>
            </div>
           
            <div className="col-md-3 form-group ">
              <div class="exp-form-floating">
              <div class="d-flex justify-content-start">
                <label
                                    htmlFor="partyName"
                                    className={`${error && !user_accgroup_to ? 'red' : ''}`}
                                >
                                    User Account Group To<span className="text-danger">*</span>
                                </label>
                 </div> <input
                  id="taxcode"
                  class="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  required title="Please enter the tax account code"
                  value={user_accgroup_to}
                  onChange={(e) => setuser_accgroup_to(e.target.value)}
                  ref={User}
                  onKeyDown={(e) => handleKeyDown(e, Status, User)}
                />           
               
              </div>
            </div>
            
            <div className="col-md-3 form-group ">
              <div class="exp-form-floating">
              <div class="d-flex justify-content-start">
                <label
                                    htmlFor="partyName"
                                    className={`${error && !status ? 'red' : ''}`}
                                >
                                    Status<span className="text-danger">*</span>
                                </label>
                 </div>
                <div title="Select the Status">        
                <Select
                id="status"
                value={selectedStatus}
                onChange={handleChangeStatus}
                options={filteredOptionStatus}
                className="exp-input-field"
                classNamePrefix="react-select"
                placeholder=""
                ref={Status}
                onKeyDown={(e) => handleKeyDown(e, Delete, Status)}
              />

               
              </div>
              </div>
            </div>

            <div className="col-md-3 form-group">
              <div class="exp-form-floating">
              <div class="d-flex justify-content-start">
                  <label
                                    htmlFor="partyName"
                                    className={`${error && !deletePermission ? 'red' : ''}`}
                                >
                                    Delete Permission<span className="text-danger">*</span>
                                </label>  
                </div>
                <div title="Select the Delete Permission">        
                  <Select
                id="ahdelper"
                value={selectedDelete}
                onChange={handleChangeDelete}
                options={filteredOptionDelete}
                className="exp-input-field"
                classNamePrefix="react-select"
                placeholder=""
                required
                ref={Delete}
                onKeyDown={(e) => handleKeyDown}
              />

                
              </div>
              </div>
            </div>
            {/* <div className="col-md-3 form-group  ">
            <div class="exp-form-floating">
            <div class="d-flex justify-content-start">
                <div>
                   <label for="state" class="exp-form-labels">
                 Created By 
                  
                </label>
                </div> 
                </div><input
                id="emailid"
                class="exp-input-field form-control"
                type="text"
                placeholder=""
                required title="Please enter the email ID"
                value={created_by}
              />  
            </div>
          </div> */}
            <div className="col-md-3 form-group ">
            <div class="mt-3 ">
            <button onClick={handleInsert}  required title="Save"> <i class="fa-solid fa-floppy-disk"></i>
            </button>
            </div></div>
          </div>
          

          
        </div>
</div>
</div>
      
</div>
  );
}
export default StdAccInput;