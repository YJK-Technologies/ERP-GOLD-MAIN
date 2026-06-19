import React, { useState, useEffect } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import './EmployeeLoan.css'
import { useNavigate, useLocation } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import '../apps.css'
import TabButtons from './Tabs.js';
import Select from 'react-select'
import axios from 'axios';
import Swal from 'sweetalert2';
import Companydetailpopup from "./companydetailpopup.js";
import EmployeeInfoPopup from "./EmployeeinfoPopup.js";
import { AgGridReact } from 'ag-grid-react';

const config = require('../Apiconfig');

function Input() {
  const [activeTab, setActiveTab] = useState('Company Details');
  const [Shiftdrop, setShiftdrop] = useState([]);
  const [Shift, setShift] = useState("");
  const [selectedShift, setSelectedShift] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [DPTdrop, setDPTdrop] = useState([]);
  const [status, setStatus] = useState('');
  // const [rowData, setRowData] = useState([{ serialNumber: 1, itemCode: '', itemName: '', purchaseQty: '', ItemTotalWight: '', purchaseAmt: 0, TotalTaxAmount: '', TotalItemAmount: '' }]);
  const [customerDataDrop, setCustomerDatadrop] = useState([]);
  const [open3, setOpen3] = React.useState(false);
  const [EmployeeId, setEmployeeId] = useState("");
  const [selecteddpt, setselecteddept] = useState("");
  const [dpt, setdpt] = useState("");
  const [Designation, setDesignation] = useState("");
  const [DOJ, setDOJ] = useState("");
  const [DOL, setDOL] = useState("");
  const [manager, setManager] = useState("");
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [selecteddesg, setSelecteddesg] = useState('');
  const [selectedmanager, setselectedmanager] = useState('');
    const [showAsterisk, setShowAsterisk] = useState(true);
  const [employeeData, setEmployeeData] = useState({
    EmployeeId: "",
    department_ID: "",
    designation_ID: "",
    DOJ: "",
    DOL: "",
    manager: "",
    shift: "",
    status: "",
    created_by: sessionStorage.getItem("selectedUserCode") || "",  // Retrieve from sessionStorage
    modified_by: sessionStorage.getItem("selectedUserCode") || "",  // Optionally set modified_by as well
  });

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const companyPermissions = permissions
    .filter(permission => permission.screen_type === 'CompanyDetails')
    .map(permission => permission.permission_type.toLowerCase());


  // useEffect(() => {
  //   // Assuming you fetch options dynamically
  //   const options = [
  //     { value: "Higher_authority", label: "Higher Authority" },
  //   ];
  //   setManagerOptions(options);
  //   setselectedmanager(options.value); // Set default option
  // }, []);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};

  // Fetch status options
  useEffect(() => {

     fetch(`${config.apiBaseUrl}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
    
          }),
      })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');

    const fetchDept = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getDept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_code }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const val = await response.json();
        setDPTdrop(val);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    if (company_code) {
      fetchDept();
    }
  }, []);


  // Handle status change
  const handleStatusChange = (selectedStatus) => {
    setSelectedStatus(selectedStatus);
    setStatus(selectedStatus ? selectedStatus.value : '');

  };

  const filteredOptionStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionDPt = DPTdrop.map((option) => ({
    value: option.Department,
    label: option.Department,
  }));

  const filteredOptionShift = Shiftdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));


  // shift dropdown function 
  useEffect(() => {

    fetch(`${config.apiBaseUrl}/getcompanyshift`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })
      .then((data) => data.json())
      .then((val) => setShiftdrop(val));
  }, []);

  // Handle shift change
  const handleShiftChange = (selectedShift) => {
    setSelectedShift(selectedShift);
    setShift(selectedShift ? selectedShift.value : '');
  };

  // Handle shift change
  const handleDPT = (selectedDPT) => {
    setselecteddept(selectedDPT);
    setdpt(selectedDPT ? selectedDPT.value : '');
    fetchProductCodes(selectedDPT ? selectedDPT.value : '');
    setError(false);
  };

  const handleChangedesgination = (selecteddesg) => {
    setDesignation(selecteddesg);
    setSelecteddesg(selecteddesg ? selecteddesg.value : '');
    fetchmanager(selecteddesg ? selecteddesg.value : '')
    setError(false);
  };

  const handleChangeCode = (selectedOption) => {
    setselectedmanager(selectedOption);
    setManager(selectedOption ? selectedOption.value : '');
    setError(false);
  };


  useEffect(() => {
    const createdBy = sessionStorage.getItem("selectedUserCode");
    // console.log("Created_by from sessionStorage:", createdBy); // Confirm the value
    if (createdBy) {
      setEmployeeData(prevState => ({
        ...prevState,
        created_by: createdBy
      }));
    } else {
      setError("Created by should not be blank.");
    }
  }, []);


  const company_code = sessionStorage.getItem('selectedCompanyCode')

  const fetchProductCodes = async (selectedValue) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getDesgination`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dept_id: selectedValue, company_code }),
      });
  
      const data = await response.json();
      const formattedData = data.map((product) => ({
        value: product.Desgination,
        label: product.Desgination,
      }));
  
      setDynamicOptions(formattedData);
      return formattedData; // Return fetched data
    } catch (error) {
      console.error('Error fetching product codes:', error);
      return [];
    }
  };
  
  const fetchmanager = async (selectedValue) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getESSmanager`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ designation_ID :selectedValue,department_ID:dpt,company_code: sessionStorage.getItem('selectedCompanyCode') }), // Send only the value
      });
  
      const data = await response.json();
      const formattedData = data.map((product) => ({
        label: `${product.EmployeeId} - ${product.full_name}`,
        value: product.EmployeeId,
      }));
  
      setManagerOptions(formattedData);
      return formattedData; // Return fetched data
    } catch (error) {
      console.error('Error fetching managers:', error);
      return [];
    }
  };
  

  const handleSave = async () => {

    if (!EmployeeId || !dpt || !selecteddesg || !DOJ  || !manager || !Shift || !status) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return; // Stop further execution if validation fails
    }

    try {
      // Prepare the data to be sent in the request body
      const Header = {
        EmployeeId,
        department_ID: dpt,
        designation_ID: selecteddesg,
        DOJ,
        manager: manager,
        shift: Shift,
        status:status,
        company_code: sessionStorage.getItem('selectedCompanyCode'), 
        created_by: sessionStorage.getItem('selectedUserCode') // Assuming this value is required
      };

      // Sending POST request
      const response = await fetch(`${config.apiBaseUrl}/addEmployeeCompany`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header), // Sending the data
      });

      // Handling different response status codes
      if (response.status === 200) {
        console.log("Data inserted successfully");
        setTimeout(() => {
          toast.success("Data inserted successfully!", {
            onClose: () => window.location.reload(),
          });
        }, 1000);
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      } else {
        console.error("Failed to insert data");
        toast.error('Failed to insert data');
      }

    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };




  // Handle Delete operation
  const handleDelete = async () => {
    if (!EmployeeId) {
      setError("Employee ID is required.");
      return;
    }

    try {
      const Header = {
        EmployeeId: EmployeeId,
        company_code: sessionStorage.getItem("selectedCompanyCode"),
       
      }
        const response = await fetch(`${config.apiBaseUrl}/deleteEmployeeCompany`, { 

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
              toast.warning(errorResponse.message || "Failed to insert sales data");
              console.error(errorResponse.details || errorResponse.message);
            }
          } catch (error) {
            console.error("Error inserting data:", error);
            toast.error('Error inserting data: ' + error.message);
          }
        };
      
  const handleUpdate = async () => {
        
      if (!EmployeeId ||!dpt ||!selecteddesg||!DOJ ||!manager ||!Shift ||!status) {
     setError(" ");
    toast.warning("Error: Missing required fields");
    return;
    }

    try {
      const Header = {
        EmployeeId:EmployeeId,
        department_ID: dpt,
        designation_ID: selecteddesg,
        DOJ,
        manager: manager,
        shift:Shift,
        status:status,
        company_code: sessionStorage.getItem('selectedCompanyCode'),
        modified_by: sessionStorage.getItem('selectedUserCode')
      };

      const response = await fetch(`${config.apiBaseUrl}/updateEmployeeCompany`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Header),
      });

      if (response.ok) {
        setTimeout(() => {
          toast.success("Data updated successfully!", {
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

  // Handle tab navigation
  const handleTabClick = (tabLabel) => {
    setActiveTab(tabLabel);
    switch (tabLabel) {
      case 'Personal Details':
        navigate("/AddEmployeeInfo");
        break;
      case 'Company Details':
        navigate("/CompanyDetails");
        break;
      case 'Financial Details':
        navigate("/FinanceDet");
        break;
      case 'Bank Account Details':
        navigate("/BankAccDet");
        break;
      case 'Identity Documents':
        navigate("/IdentDoc");
        break;
      case 'Academic Details':
        navigate("/AcademicDet");
        break;
      case 'Family':
        navigate("/Family");
        break;
      case 'Documents':
        navigate("/Documents");
        break;
      default:
        break;
    }
  };
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleCompanyDetails = () => {
    setOpen(true);
  };
 const handleEmployeeInfo = () => {
    setOpen(true);
  };
    const EmployeeInfo = async (data) => {
    if (data && data.length > 0) {
      setSaveButtonVisible(false);
      setUpdateButtonVisible(true);
      const [{ EmployeeId}] = data;

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


  const CompanyDetails = async (data) => {

    if (data && data.length > 0) {
      setSaveButtonVisible(false);
      setUpdateButtonVisible(true);
      const [{ EmployeeId, Department, Designation, DOJ, DOL, manager, shift, status }] = data;

      console.log(data);

      const employeeId = document.getElementById('EmployeeId');
      if (employeeId) {
        employeeId.value = EmployeeId;
        setEmployeeId(EmployeeId);
      } else {
        console.error('EmployeeId  not found');
      }

      const dOJ = document.getElementById('DOJ');
      if (dOJ) {
        dOJ.value = DOJ;
        setDOJ(formatDate(DOJ));
      } else {
        console.error('Date of Joining  not found');
      }

      const dOl = document.getElementById('DOL');
      if (dOl) {
        dOl.value = DOL;
        setDOL(formatDate(DOL));
      } else {
        console.error('Date of Leave not found');
      }

      const department = document.getElementById('department');
      if (department) {
      const selectedDepartment = filteredOptionDPt.find(option => option.value === Department);
      setselecteddept(selectedDepartment);
      setdpt(selectedDepartment.value)
      } else {
      console.error('department element not found');
      }

      const designationOptions = await fetchProductCodes(Department);

      const designation = document.getElementById('designation');
      if (designation) {
      const selectedDesignation  = designationOptions.find(option => option.value === Designation);
      setDesignation(selectedDesignation);
      setSelecteddesg(selectedDesignation.value)
      } else {
      console.error('designation element not found');
      }

      const managerOptions = await fetchmanager(Designation);

      const managers = document.getElementById('manager');
      if (managers) {
      const selectedManager   = managerOptions.find(option => option.value === manager);
      console.log(selectedManager)
      if (selectedManager) {
        setselectedmanager(selectedManager);
        setManager(selectedManager.value);
      } else {
        console.warn('Manager not found in options:', manager);
        setselectedmanager(null);
        setManager(''); 
      }
      } else {
      console.error('designation element not found');
      }

      const Shift = document.getElementById('shift');
      if (Shift) {
        const selectedShift = filteredOptionShift.find(option => option.value === shift);
        setShift(selectedShift.value);
        setSelectedShift(selectedShift);
      } else {
        console.error('shift element not found');
      }

      const Status = document.getElementById('status');
      if (Status) {
        const selectedStatus = filteredOptionStatus.find(option => option.value === status);
        setStatus(selectedStatus.value);
        setSelectedStatus(selectedStatus);
      } else {
        console.error('status element not found');
      }


      console.log(data);
    };
  }

  //  const handleFileSelect1 = (event) => {
  //     const file = event.target.files[0];
  //     if (file) {
  //       const maxSize = 1 * 1024 * 1024;
  //       if (file.size > maxSize) {
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'File Too Large',
  //           text: 'File size exceeds 1MB. Please upload a smaller file.',
  //           confirmButtonText: 'OK'
  //         });
  //         event.target.value = null;
  //         return;
  //       }
  //       if (file) {
  //         setSelectedImage(URL.createObjectURL(file));
  //         setuser_image(file);
  //       }
  //     }
  //   };


  const tabs = [
    { label: 'Personal Details' },
    { label: 'Company Details' },
    { label: 'Financial Details' },
    { label: 'Bank Account Details' },
    { label: 'Identity Documents' },
    { label: 'Academic Details' },
    { label: 'Family' },
    { label: 'Documents' }
  ];

  const [headerRowData, setHeaderRowData] = useState([
    { fieldName: 'Department', companyDetails: '' },
    { fieldName: 'Designation', companyDetails: '' },
    { fieldName: 'DOJ ', companyDetails: '' },
    { fieldName: 'DOL ', companyDetails: '' },
    { fieldName: 'manager ', companyDetails: '' },
    { fieldName: 'Shift', companyDetails: '', },
    { fieldName: 'status', companyDetails: '' },
  ])

  const columnHeader = [
    {
      headerName: 'companyDetails',
      field: 'fieldName',
      maxWidth: 240,
      editable: false
    },
    {
      headerName: 'customerData',
      field: 'CustomerData',
      editable: true,
      cellEditor: 'agTextCellEditor',
      cellEditorParams: {
        maxLength: 250,
        values: customerDataDrop,
      }
    },


  ]

  // const formatDate = (dateString) => {
  //   if (!dateString) return ""; // Return 'N/A' if the date is missing
  //   const date = new Date(dateString);

  //   // Format as DD/MM/YYYY
  //   return new Intl.DateTimeFormat("en-GB", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //   }).format(date);
  // };


  // const handleSearchButtonClick = (e) => {
  //   if (EmployeeId) {
  //     handleRefNO(EmployeeId);
  //   } else {
  //     toast.warning("Please enter a valid Employee ID");
  //   }
  // };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRefNO(EmployeeId)
    }
  };

  const handleRefNO = async (code) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getEmpcompanyDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Id: code, company_code: sessionStorage.getItem("selectedCompanyCode"), }),
      });
  
      if (response.ok) {
        setSaveButtonVisible(false);
        setUpdateButtonVisible(true);
        const searchData = await response.json();
  
        if (searchData && searchData.length > 0) {
          const [{ EmployeeId, department_ID, designation_ID, DOJ, DOL, manager, shift, status }] = searchData;
          const formatDateDOJ = DOJ ? new Date(DOJ).toISOString().split('T')[0] : '';
          const formatDateDOL = DOL ? new Date(DOL).toISOString().split('T')[0] : '';
  
          setEmployeeId(EmployeeId);
          setDOJ(formatDateDOJ);
          setDOL(formatDateDOL);
  
          const selecteddept = filteredOptionDPt.find(option => option.value === department_ID);
          setselecteddept(selecteddept);
          setdpt(selecteddept?.value || null);
  
          const designationData = await fetchProductCodes(department_ID);
          const selectedDesg = designationData.find(option => option.value === designation_ID);
          setDesignation(selectedDesg);
          setSelecteddesg(selectedDesg?.value || null);
  
          const managerData = await fetchmanager(designation_ID);
          const selectedmanager = managerData.find(option => option.value === manager);
          console.log(selectedmanager)
          setselectedmanager(selectedmanager);
          setManager(selectedmanager?.value || null);
  
          const selectedShift = filteredOptionShift.find(option => option.value === shift);
          setSelectedShift(selectedShift);
          setShift(selectedShift?.value || null);
  
          const selectedStatus = filteredOptionStatus.find(option => option.value === status);
          setSelectedStatus(selectedStatus);
          setStatus(selectedStatus?.value || null);
  
        } else {
          toast.error("Employee not found");
        }
      } else {
        toast.error("Employee not found");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast.error("Error fetching data, please try again.");
    }
  };


  const reloadGridData = () => {
    window.location.reload();
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };



  return (
    <div className="container-fluid Topnav-screen">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow-lg p-0 bg-light rounded">
        <div className="purbut mb-0 d-flex justify-content-between" >
          <div class="d-flex justify-content-start">
            <h1 align="left" class="purbut">Company Details</h1>
          </div>
          <div className="d-flex justify-content-end purbut me-3">
            {saveButtonVisible && ['add', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
              <savebutton className="purbut" onClick={handleSave} title="Save">
                <i class="fa-regular fa-floppy-disk"></i>
              </savebutton>
            )}
            {updateButtonVisible && ['update', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
              <savebutton className="purbut" onClick={handleUpdate} required title="Update">
                <i class="fa-solid fa-floppy-disk"></i>
              </savebutton>
            )}
            {['delete', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
              <delbutton className="purbut" onClick={handleDelete} required title="Delete">
                <i class="fa-solid fa-trash"></i>
              </delbutton>
            )}
            <reloadbutton className="purbut mt-3 me-3" onClick={reloadGridData} title="Reload">
              <i className="fa-solid fa-arrow-rotate-right"></i>
            </reloadbutton>
          </div>
        </div>
        <div class="mobileview">
          <div class="d-flex justify-content-between">
            <div className="d-flex justify-content-start">
              <h1 align="left" className="h1" >Company Details</h1>
            </div>
            <div class="dropdown mt-1" >
              <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fa-solid fa-list"></i>
              </button>
              <ul class="dropdown-menu">
                <li class="iconbutton d-flex justify-content-center text-success">
                  {saveButtonVisible && ['add', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
                    <icon class="icon" onClick={handleSave}>
                      <i class="fa-regular fa-floppy-disk"></i>
                    </icon>
                  )}
                </li>
                {updateButtonVisible && ['update', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
                  <li class="iconbutton  d-flex justify-content-center text-primary ">
                    <icon class="icon" onClick={handleUpdate}>
                      <i class="fa-solid fa-floppy-disk"></i>
                    </icon>
                  </li>
                )}
                <li class="iconbutton  d-flex justify-content-center text-danger">
                  {['delete', 'all permission'].some(permission => companyPermissions.includes(permission)) && (
                    <icon class="icon" onClick={handleDelete}>
                      <i class="fa-solid fa-trash"></i>
                    </icon>
                  )}
                </li>
                <li class="iconbutton  d-flex justify-content-center text-black">
                  <icon class="icon" onClick={reloadGridData}>
                    <i className="fa-solid fa-arrow-rotate-right"></i>
                  </icon>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="shadow-lg bg-light rounded mt-2 p-3">
        <div className="row">
          <div className="col-md-3 form-group mb-2 me-1">
      <label htmlFor="EmployeeId" className={`${error && !EmployeeId ? 'red' : ''}`}>
                    Employee ID {showAsterisk && <span className="text-danger">*</span>}
                    </label>
            <div class="exp-form-floating">
              <div class="d-flex justify-content-end">
                <input
                  id="EmployeeId"
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  maxLength={50}
                  required
                  value={EmployeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoComplete='off'
                />
                <div className="position-absolute mt-1 me-2">
                  <span className="icon searchIcon"  title="Employee Help"
                    onClick={handleCompanyDetails}>
                    <i className="fa fa-search"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div class="me-2 mt-3">
              {/* <div class="d-flex justify-content-start">
              {saveButtonVisible && (
                      <savebutton className="purbut" onClick={handleSave}
                        required title="save"> <i class="fa-regular fa-floppy-disk"></i> </savebutton>
                    )}
                    {updateButtonVisible && (
                      <savebutton className="purbut" title='update' onClick={handleUpdate} >
                        <i class="fa-solid fa-floppy-disk"></i>
                      </savebutton>
                    )}
              <div className="mt-3">
                <delbutton onClick={handleDelete} title="Delete">
                  <i className="fa-solid fa-trash"></i>
                </delbutton>
              </div>
              <div className="col-md-1">
                <div className="ms-2 mt-3"> </div>
                  <reloadbutton className="purbut" onClick={reloadGridData} title="save">
                    <i className="fa-solid fa-arrow-rotate-right"></i>
                  </reloadbutton>
              </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <TabButtons tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
      <div className="shadow-lg p-3 bg-light rounded-bottom mb-2">
        <div className="row">
          <div className="col-md-3 form-group mb-2">
             <label htmlFor="selecteddpt" className={`${error && !selecteddpt ? 'red' : ''}`}>
                  Department{showAsterisk && <span className="text-danger">*</span>}
                    </label>
           
            <Select
              id="department"
              className="exp-input-field"
              type="text"
              value={selecteddpt}
              onChange={handleDPT}
              options={filteredOptionDPt}
            />
            {/* {error && !selecteddpt && <div className="text-danger">Department should not be blank</div>} */}
          </div>
          <div className="col-md-3 form-group mb-2">
           <label htmlFor="selecteddpt" className={`${error && !selecteddpt ? 'red' : ''}`}>
                  Designation{showAsterisk && <span className="text-danger">*</span>}
                    </label>
              
            <Select
              id="designation"
              className=" exp-input-field position-relative"
              name="designation_ID"
               type="text"
              value={Designation}
              options={dynamicOptions}
              onChange={handleChangedesgination}
            />
            {/* {error && !Designation && <div className="text-danger">Designation should not be blank</div>} */}
          </div>
          {/* DOJ */}
          <div className="col-md-3 form-group mb-2">
            <label htmlFor="DOJ" className={`${error && !DOJ ? 'red' : ''}`}>
                  DOJ{showAsterisk && <span className="text-danger">*</span>}
                    </label>
             
            <input
              id="DOJ"
              className="exp-input-field form-control"
              type="date"
              name="DOJ"
              value={DOJ}
              onChange={(e) => setDOJ(e.target.value)}
              required
              title = "Please enter the DOJ"
            />
            {/* {error && !DOJ && <div className="text-danger">DOJ should not be blank</div>} */}
          </div>
          <div className="col-md-3 form-group mb-2">
            <label htmlFor="DOL" className="exp-form-labels">DOL</label>
            <input
              id="DOL"
              className="exp-input-field form-control"
              type="date"
              name="DOL"
              value={DOL}
              onChange={(e) => setDOL(e.target.value)}
            />
          </div>
          <div className="col-md-3 form-group mb-2">
            <div class="exp-form-floating">
            <label htmlFor="selectedmanager" className={`${error && !selectedmanager ? 'red' : ''}`}>
                  Manager{showAsterisk && <span className="text-danger">*</span>}
                    </label>
             
              
              <Select
                id="manager"
                className="exp-input-field"
                type="text"
                name="manager"
                value={selectedmanager}
                options={managerOptions}
                onChange={handleChangeCode}
                required
              />
              {/* {error && !manager && <div className="text-danger">Manager should not be blank</div>} */}
            </div>
          </div>
          <div className="col-md-3 form-group mb-2">
          <label htmlFor="EmployeeId" class="exp-form-labels">Shift</label>
            <Select
              id="shift"
              type="text"
              value={selectedShift}
              onChange={handleShiftChange}
              options={filteredOptionShift}
            />
          </div>
          <div className="col-md-3 form-group mb-2">
              <label htmlFor="Status" className={`${error && !selectedStatus ? 'red' : ''}`}>
                  Status{showAsterisk && <span className="text-danger">*</span>}
                    </label>
            
            <Select
              id="status"
               type="text"
              value={selectedStatus}
              onChange={handleStatusChange}
              options={filteredOptionStatus}
            />
            {/* {error && !status && <div className="text-danger">status should not be blank</div>} */}
          </div>
        </div>
      </div>
      <div>
        <Companydetailpopup open={open} handleClose={handleClose} CompanyDetails={CompanyDetails} />
           
      </div>
    </div>
  );
}

export default Input;
