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
import Select from 'react-select';
import { AgGridReact } from 'ag-grid-react';
import EmployeeInfoPopup from "./EmployeeinfoPopup.js";

const config = require('../Apiconfig');

function Input({ }) {
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [EmployeeId, setEmployeeId] = useState("");
  const [First_Name, setFirst_Name] = useState("");
  const [Middle_Name, setMiddle_Name] = useState("");
  const [Last_Name, setLast_Name] = useState("");
  const [Father_Name, setFather_Name] = useState("");
  const [Mother_Name, setMother_Name] = useState("");
  const [DOB, setDOB] = useState("");
  const [Gender, setGender] = useState("");
  const [Email, setEmail] = useState("");
  const [Grade_id, setGrade_id] = useState("");
  const [Phone1, setPhone1] = useState("");
  const [Phone2, setPhone2] = useState("");
  const [status, setStatus] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");
  const [error, setError] = useState("");
  const [permanantAddress, setPermanantAddress] = useState("");
  const [reference_Name, setReference_Name] = useState("");
  const [reference_Phone, setReference_Phone] = useState("");
  const [marital_Status, setMarital_Status] = useState([]);
  const [Marital_StatusDrop, setMarital_StatusDrop] = useState([]);
  const [pan_No, setPan_No] = useState('');
  const [Aadhaar_no, setAadhar_no] = useState([]);
  const [kids, setKids] = useState([]);
  const [KidsDrop, setKidsDrop] = useState([]);
  const [Siblings, setSiblings] = useState([]);
  const [genderdrop, setgenderdrop] = useState([]);
  const [IDdrop, setIDdrop] = useState([]);
  const [selectedGender, setselectedGender] = useState([]);
  const [selectedkids, setselectedkids] = useState([]);
  const [selectedmartial, setselectedmartial] = useState([]);
  const [selectedgradeid, setselectedgradeid] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const navigate = useNavigate();
  const [hasValueChanged, setHasValueChanged] = useState(false);
  const [companyImage, setCompanyImage] = useState("");
  const [open3, setOpen3] = React.useState(false);
  const created_by = sessionStorage.getItem('selectedUserCode')
  const [isUpdated, setIsUpdated] = useState(false);
  const location = useLocation();
  const { mode, selectedRow } = location.state || {};
  const [user_images, setuser_image] = useState("");
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [updateButtonVisible, setUpdateButtonVisible] = useState(false);
  const [showAsterisk, setShowAsterisk] = useState(true);
  const modified_by = sessionStorage.getItem("selectedUserCode");

  //code added by Pavun purpose of set user permisssion
  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const employeePermissions = permissions
    .filter(permission => permission.screen_type === 'AddEmployeeInfo')
    .map(permission => permission.permission_type.toLowerCase());

  const handleDOBChange = (e) => {
    const selectedValue = e.target.value;

    // Ensure that the user selects a full date (YYYY-MM-DD)
    if (!selectedValue || !/^\d{4}-\d{2}-\d{2}$/.test(selectedValue)) {
      return; // Exit if only year/month is selected
    }

    const selectedDate = new Date(selectedValue);
    const today = new Date();

    let age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDate() - selectedDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age < 18) {
      toast.warning("Please enter a valid date. You must be 18 years or older.");
      setDOB("");
    } else {
      setDOB(selectedValue);
    }
  };



  //   const [headerRowData, setHeaderRowData] = useState([
  //     { fieldName: 'First Name', INFO: '' },
  //     { fieldName: 'Middle Name', INFO: '' },
  //     { fieldName: 'Last Name', INFO: '' },
  //     { fieldName: 'Father Name', INFO: '' },
  //     { fieldName: 'Mother Name', INFO: '' },
  //     { fieldName: 'DOB', INFO: '' },
  //     { fieldName: 'Gender', INFO: '' },
  //     { fieldName: 'Email', INFO: '' },
  //     { fieldName: 'Grade ID', INFO: '' },
  //     { fieldName: 'Phone 1', INFO: '' },
  //     { fieldName: 'Phone 2', INFO: '' },
  //     { fieldName: 'Address 1', INFO: '' },
  //     { fieldName: 'Address 2', INFO: '' },
  //     { fieldName: 'Address 3', INFO: '' },
  //     { fieldName: 'PermanantAddress', INFO: '' },
  //     { fieldName: 'Reference Name', INFO: '' },
  //     { fieldName: 'Reference Phone', INFO: '' },
  //     { fieldName: 'Martial Status', INFO: '' },
  //     { fieldName: 'Pan No', INFO: '' },
  //     { fieldName: 'Aadhaar No', INFO: '' },
  //     { fieldName: 'Kids', INFO: '' },
  //     { fieldName: 'Photo', INFO: '' },
  // ])
  // const columnHeader = [
  //     { headerName: 'Details', field: 'fieldName', maxWidth: 240, editable: false },
  //     {
  //         headerName: 'Info',
  //         field: 'INFO',
  //         editable: true,
  //         cellEditor: 'agRichSelectCellEditor',
  //         cellEditorParams: (params) => {
  //           // Check if the fieldName is 'Gender'
  //           if (params.data.fieldName === 'Gender') {
  //             return {
  //               values: genderdrop, // Use the dynamic gender options for the Gender field
  //             };
  //           }
  //           return {}; // Return empty for other fields
  //         }
  //     },
  // ];



  const base64ToFile = (base64Data, fileName) => {
    if (!base64Data || !base64Data.startsWith("data:")) {
      throw new Error("Invalid base64 string");
    }

    const parts = base64Data.split(',');
    if (parts.length !== 2) {
      throw new Error("Base64 string is not properly formatted");
    }

    const mimePart = parts[0];
    const dataPart = parts[1];

    const mime = mimePart.match(/:(.*?);/);
    if (!mime || !mime[1]) {
      throw new Error("Could not extract MIME type");
    }

    const binaryString = atob(dataPart);
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    const fileBlob = new Blob([uint8Array], { type: mime[1] });
    return new File([fileBlob], fileName, { type: mime[1] });
  };

  // const filteredOptionCity = drop.map((option) => ({
  //   value: option.attributedetails_name,
  //   label: option.attributedetails_name,
  // }));

  // const filteredOptionState = statedrop.map((option) => ({
  //   value: option.attributedetails_name,
  //   label: option.attributedetails_name,
  // }));

  // const filteredOptionCountry = condrop.map((option) => ({
  //   value: option.attributedetails_name,
  //   label: option.attributedetails_name,
  // }));

  // const filteredOptionStatus = statusdrop.map((option) => ({
  //   value: option.attributedetails_name,
  //   label: option.attributedetails_name,
  // }));


  const handleInsert = async () => {
    if (

      !First_Name ||
      !Last_Name ||
      !Father_Name ||
      !Mother_Name ||
      !DOB ||
      !Gender ||
      !Email ||
      !Phone1 ||
      !Phone2 ||
      !address1 ||
      !address2 ||
      !address3 ||
      !permanantAddress ||
      !pan_No ||
      !Aadhaar_no ||
      !marital_Status ||
      !kids ||
      !Grade_id

    ) {
      setError(" ");
      toast.warning("Error: Missing required fields");
      return;
    }

    if (!validateEmail(Email)) {
      toast.warning("Please enter a valid email address")
      setError("Please enter a valid email address");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("EmployeeId", EmployeeId);
      formData.append("First_Name", First_Name);
      formData.append("Middle_Name", Middle_Name);
      formData.append("Last_Name", Last_Name);
      formData.append("Father_Name", Father_Name);
      formData.append("Mother_Name", Mother_Name);
      formData.append("DOB", DOB);
      formData.append("Gender", selectedGender);
      formData.append("Email", Email);
      formData.append("Phone1", Phone1);
      formData.append("Phone2", Phone2);
      formData.append("Address1", address1);
      formData.append("Address2", address2);
      formData.append("Address3", address3);
      formData.append("PermanantAddress", permanantAddress);
      formData.append("Reference_Name", reference_Name);
      formData.append("Reference_Phone", reference_Phone);
      formData.append("Pan_No", pan_No);
      formData.append("Aadhar_no", Aadhaar_no);
      formData.append("Marital_Status", selectedmartial);
      formData.append("Kids", selectedkids);
      formData.append("Grade_id", selectedgradeid);
      formData.append("Created_by", sessionStorage.getItem("selectedUserCode"));
      formData.append("company_code", sessionStorage.getItem('selectedCompanyCode'));
      if (user_images) {
        formData.append("Photos", user_images);
      }

      const response = await fetch(`${config.apiBaseUrl}/addEmployeePersonalData`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ EmployeeId }] = searchData;
        setEmployeeId(EmployeeId);

        toast.success("Employee Personal Data inserted Successfully")

        console.log("Employee Personal Data Data inserted successfully");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to insert Employee Personal Data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };;



  function validateEmail(email) {
    const emailRegex = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;
    return emailRegex.test(email);
  }


  const handleNavigate = () => {
    navigate("/Company");
  };



  const handleKeyDownStatus = async (e) => {
    if (e.key === 'Enter' && hasValueChanged) {
      setHasValueChanged(false);
    }
  };

  const handleUpdate = async () => {
    if (

      !First_Name ||
      !Middle_Name ||
      !Last_Name ||
      !Father_Name ||
      !Mother_Name ||
      !DOB ||
      !Gender ||
      !Email ||
      !Phone1 ||
      !Phone2 ||
      !address2 ||
      !address3 ||
      !permanantAddress ||
      !reference_Name ||
      !pan_No||
      !Aadhaar_no ||
      !marital_Status ||
      !kids ||
      !Grade_id
    ) {
      setError(" ");
      return;
    }

    if (!validateEmail(Email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("EmployeeId", EmployeeId);
      formData.append("First_Name", First_Name);
      formData.append("Middle_Name", Middle_Name);
      formData.append("Last_Name", Last_Name);
      formData.append("Father_Name", Father_Name);
      formData.append("Mother_Name", Mother_Name);
      formData.append("DOB", DOB);
      formData.append("Gender", selectedGender ? selectedGender : '');
      formData.append("Email", Email);
      formData.append("Phone1", Phone1);
      formData.append("Phone2", Phone2);
      formData.append("Address1", address1);
      formData.append("Address2", address2);
      formData.append("Address3", address3);
      formData.append("PermanantAddress", permanantAddress);
      formData.append("Reference_name", reference_Name);
      formData.append("Reference_Phone", reference_Phone);
      formData.append("Pan_No", pan_No);
      formData.append("Aadhar_no", Aadhaar_no);
      formData.append("Marital_Status", marital_Status ? marital_Status.value : '');
      formData.append("Kids",selectedkids);
      formData.append("Grade_id", selectedgradeid);
      formData.append("company_code", sessionStorage.getItem('selectedCompanyCode'));
      formData.append("modified_by", sessionStorage.getItem('selectedUserCode'));
      

      if (user_images) {
        formData.append("Photos", user_images);
      }
      const response = await fetch(`${config.apiBaseUrl}/Employeedataupdate`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 200) {
        console.log("Data Updated successfully");
        setIsUpdated(true);
        // clearInputFields();
        toast.success("Data Updated successfully!")
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        console.error(errorResponse.message);
        toast.warning(errorResponse.message);
      } else {
        console.error("Failed to Update data");
        toast.error("Failed to Update data");

      }
    } catch (error) {
      console.error("Error Update data:", error);
      toast.error('Error inserting data: ' + error.message);
    }
  };

  const NavigatecomDet = () => {
    navigate("/CompanyDetails");
  };

  const EmployeeLoan = () => {
    navigate("/AddEmployeeInfo");
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
  const Insurance1 = () => {
    navigate("/Family");
  };
  const Documents = () => {
    navigate("/Documents");
  };

  const handleTabClick = (tabLabel) => {
    setActiveTab(tabLabel);

    // Here you can call the appropriate functions depending on the tab clicked
    switch (tabLabel) {
      case 'Personal Details':
        EmployeeLoan();
        break;
      case 'Company Details':
        NavigatecomDet();
        break;
      case 'Financial Details':
        FinanceDet();
        break;
      case 'Bank Account Details':
        BankAccDet();
        break;
      case 'Identity Documents':
        IdentDoc();
        break;
      case 'Academic Details':
        AcademicDet();
        break;
      case 'Family':
        Insurance1();
        break;
      case 'Documents':
        Documents();
        break;
      default:
        break;
    }
  };

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


  const handleGradeID = (selectedgradeid) => {
    setGrade_id(selectedgradeid);
    setselectedgradeid(selectedgradeid ? selectedgradeid.value : '');
  };

  // const filteredOptionGradeid = IDdrop.map((option) => ({
  //   value: option.GradeID,
  //   label: option.GradeID,
  // }));

  const filteredOptionGradeid = Array.isArray(IDdrop)
    ? IDdrop.map((option) => ({
      value: option.GradeID,
      label: option.GradeID,
    }))
    : [];

  // useEffect(() => {
  //   fetch(`${config.apiBaseUrl}/getID`)
  //     .then((data) => data.json())
  //     .then((val) => setIDdrop(val));
  // }, []);

  useEffect(() => {
    // Fetch gender options from the API
    fetch(`${config.apiBaseUrl}/getID`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })

      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setIDdrop(data); // Store the fetched gender options in state
        }
      })
      .catch((error) => {
        console.error('Error fetching gender data:', error);
      });
  }, []);

  const Handlegender = (selectedgender) => {
    setGender(selectedgender);
    setselectedGender(selectedgender ? selectedgender.value : '');

  };

  const filteredOptiongender = genderdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    // Fetch gender options from the API
    fetch(`${config.apiBaseUrl}/gender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })

      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setgenderdrop(data); // Store the fetched gender options in state
        }
      })
      .catch((error) => {
        console.error('Error fetching gender data:', error);
      });
  }, []);


  const handleKids = (selectedkids) => {
    setKids(selectedkids);
    setselectedkids(selectedkids ? selectedkids.value : '');
  };

  const filteredOptionKids = KidsDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getKids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
    })
      .then((data) => data.json())
      .then((val) => setKidsDrop(val));
  }, []);


  const handlemartial = (martilalselected) => {
    setMarital_Status(martilalselected);
    setselectedmartial(martilalselected ? martilalselected.value : '');
  };

  const filteredOptionmartial = Marital_StatusDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getMartial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })
      .then((data) => data.json())
      .then((val) => setMarital_StatusDrop(val));
  }, []);

  const handleFileSelect1 = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'File size exceeds 1MB. Please upload a smaller file.',
          confirmButtonText: 'OK'
        });
        event.target.value = null;
        return;
      }
      if (file) {
        setSelectedImage(URL.createObjectURL(file));
        setuser_image(file);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRefNo(EmployeeId)
    }
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };



  const handleRefNo = async (code) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getEmployeePersonaldet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Id: code,company_code: sessionStorage.getItem("selectedCompanyCode"), })
      });
      if (response.ok) {
        setSaveButtonVisible(false);
        setUpdateButtonVisible(true);
        const searchData = await response.json();
        const [{ EmployeeId, First_Name, Middle_Name, Last_Name, father_name, mother_name, DOB,
          email, Aadhar_no, Reference_Phone, phone1, phone2, Address1, address2, address3,
          PermanantAddress, Reference_name, Pan_No, Photos, Grade_id, Gender, marital_status, Kids }] = searchData;

        setEmployeeId(EmployeeId);
        setFirst_Name(First_Name);
        setMiddle_Name(Middle_Name);
        setLast_Name(Last_Name);
        setFather_Name(father_name);
        setMother_Name(mother_name);
        setDOB(formatDate(DOB));
        setEmail(email);
        setAadhar_no(Aadhar_no);
        setReference_Phone(Reference_Phone);
        setPhone1(phone1);
        setPhone2(phone2);
        setAddress1(Address1);
        setAddress2(address2);
        setAddress3(address3);
        setPermanantAddress(PermanantAddress);
        setReference_Name(Reference_name);
        const imageBlob = new Blob([new Uint8Array(Photos.data)], { type: 'image/jpeg' });

        setuser_image(imageBlob);

        const imageUrl = URL.createObjectURL(imageBlob);
        setSelectedImage(imageUrl);

        setPan_No(Pan_No);

        const selectedGrade = filteredOptionGradeid.find(option => option.value === Grade_id);
        setGrade_id(selectedGrade);
        setselectedgradeid(selectedGrade?.value || null);

        const selectedGender = filteredOptiongender.find(option => option.value === Gender);
        setGender(selectedGender);
        setselectedGender(selectedGender?.value || null);

        const martialStatus = filteredOptionmartial.find(option => option.value === marital_status);
        setMarital_Status(martialStatus);
        setselectedmartial(martialStatus?.value || null);

        const kids = filteredOptionKids.find(option => option.value === Kids);
        setKids(kids);
        setselectedkids(kids?.value || null);

        console.log("data fetched successfully")
      } else if (response.status === 404) {
        toast.error("Data not found")
      } else {
        console.log("Bad request"); // Log the message for other errors
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleDelete = async () => {
    if (
      !EmployeeId) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const deatils = {
        EmployeeId: EmployeeId
      }

      const response = await fetch(`${config.apiBaseUrl}/deleteemployeedata`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deatils),
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
        console.error(errorResponse.message);
        toast.warning(errorResponse.message, {
        })
      }
    } catch (error) {
      console.error("Error delete data:", error);
      toast.error('Error delete data: ' + error.message, {
      });
    }
  };


  const reloadGridData = () => {
    window.location.reload();
  };



  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleEmployeeInfo = () => {
    setOpen(true);
  };

  const EmployeeInfo = async (data) => {
    if (data && data.length > 0) {
      setSaveButtonVisible(false);
      setUpdateButtonVisible(true);
      const [{ EmployeeId, DOB, First_Name, Middle_Name, Last_Name, Gender, grade_id, Father_Name, Mother_Name, Reference_Phone, Email, Aadhar_no, phone1, phone2, PermanantAddress, Address3, Address1, Pan_No, Address2, Reference_Name, Marital_Status, Kids }] = data;

      console.log(data);

      setSelectedImage(`data:image/jpeg;base64,${data[0].Photos}`);

      const employeeId = document.getElementById('EmployeeId');
      if (employeeId) {
        employeeId.value = EmployeeId;
        setEmployeeId(EmployeeId);
      } else {
        console.error('EmployeeId  not found');
      }

      const dOB = document.getElementById('dob');
      if (dOB) {
        dOB.value = DOB;
        setDOB(formatDate(DOB));
      } else {
        console.error('Date of Birth  not found');
      }

      const first_Name = document.getElementById('FirstName');
      if (first_Name) {
        first_Name.value = First_Name;
        setFirst_Name(First_Name);
      } else {
        console.error('entry element not found');
      }

      const MiddleName = document.getElementById('MiddleName');
      if (MiddleName) {
        MiddleName.value = Middle_Name;
        setMiddle_Name(Middle_Name);
      } else {
        console.error('MiddleName element not found');
      }

      const lastName = document.getElementById('LastName');
      if (lastName) {
        lastName.value = Last_Name;
        setLast_Name(Last_Name);
      } else {
        console.error('LastName  not found');
      }

      const gender = document.getElementById('gender');
      if (gender) {
        const selectedgender = filteredOptiongender.find(option => option.value === Gender);
        setGender(selectedgender);
        setselectedGender(selectedgender);
      } else {
        console.error('Gender element not found');
      }

      const gradeid = document.getElementById('gradeid');
      if (gradeid) {
        const Grade_id = filteredOptionGradeid.find(option => option.value === grade_id);
        setGrade_id(Grade_id);
        setselectedgradeid(Grade_id);
      } else {
        console.error('entry element not found');
      }

      const maritalstatus = document.getElementById('maritalStatus');
      if (maritalstatus) {
        const selectedmartial = filteredOptionmartial.find(option => option.value === Marital_Status);
        setMarital_Status(selectedmartial);
        setselectedmartial(selectedmartial);
      } else {
        console.error('entry element not found');
      }

      const fatherName = document.getElementById('FatherName');
      if (fatherName) {
        fatherName.value = Father_Name;
        setFather_Name(Father_Name);
      } else {
        console.error('FatherName element not found');
      }

      const MotherName = document.getElementById('MotherName');
      if (MotherName) {
        MotherName.value = Mother_Name;
        setMother_Name(Mother_Name);
      } else {
        console.error('MotherName  not found');
      }

      const email = document.getElementById('email');
      if (email) {
        email.value = Email;
        setEmail(Email);
      } else {
        console.error('Email element not found');
      }

      const PhoneNo = document.getElementById('Phone');
      if (PhoneNo) {
        PhoneNo.value = phone1;
        setPhone1(phone1);
      } else {
        console.error('Phone1 element not found');
      }

      const alternaiveNo = document.getElementById('phone2');
      if (alternaiveNo) {
        alternaiveNo.value = phone2;
        setPhone2(phone2);
      } else {
        console.error('Phone2 element not found');
      }


      const address1 = document.getElementById('address1');
      if (address1) {
        address1.value = Address1;
        setAddress1(Address1);
      } else {
        console.error('Address1 element not found');
      }


      const Address2nd = document.getElementById('address2');
      if (Address2nd) {
        Address2nd.value = Address2;
        setAddress2(Address2);
      } else {
        console.error('Address2 element not found');
      }

      const Address3rd = document.getElementById('address3');
      if (Address3rd) {
        Address3rd.value = Address3;
        setAddress3(Address3);
      } else {
        console.error('Address2 element not found');
      }

      const address3 = document.getElementById('address3');
      if (address3) {
        address3.value = Address3;
        setAddress3(Address3);
      } else {
        console.error('Address3 element not found');
      }

      const permanantAddress = document.getElementById('permanantAddress');
      if (permanantAddress) {
        permanantAddress.value = PermanantAddress;
        setPermanantAddress(PermanantAddress);
      } else {
        console.error('PermanantAddress element not found');
      }

      const ReferenceName = document.getElementById('ReferenceName');
      if (ReferenceName) {
        ReferenceName.value = Reference_Name;
        setReference_Name(Reference_Name);
      } else {
        console.error('ReferenceName element not found');
      }

      const ReferencePhone = document.getElementById('ReferencePhone');
      if (ReferencePhone) {
        ReferencePhone.value = Reference_Phone;
        setReference_Phone(Reference_Phone);
      } else {
        console.error('ReferencePhone element not found');
      }

      const panno = document.getElementById('Panno');
      if (panno) {
        panno.value = Pan_No;
        setPan_No(Pan_No);
      } else {
        console.error('PanNo element not found');
      }

      const Aadharno = document.getElementById('Aadharno');
      if (Aadharno) {
        Aadharno.value = Aadhar_no;
        setAadhar_no(Aadhar_no);
      } else {
        console.error('Aadhar no element not found');
      }

      const kids = document.getElementById('KidS');
      if (kids) {
        const selectedOption = filteredOptionKids.find(option => option.value === Kids);
        setKids(selectedOption);
        setselectedkids(selectedOption);
      } else {
        console.error('Kids  element not found');
      }

    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  };

  return (
    <div class="container-fluid Topnav-screen ">
      <div className="">
        <div class="">
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div className="shadow-lg p-0 bg-light rounded">
            <div className="purbut mb-0 d-flex justify-content-between">
              <div class="d-flex justify-content-start">
                <h1 align="left" class="purbut">Add Employee Info</h1>
              </div>
              <div className="d-flex justify-content-end purbut me-3">
                {saveButtonVisible && ['add', 'all permission'].some(permission => employeePermissions.includes(permission)) && (
                  <savebutton className="purbut" onClick={handleInsert} title="Save">
                    <i class="fa-regular fa-floppy-disk"></i>
                  </savebutton>
                )}
                {updateButtonVisible && ['update', 'all permission'].some(permission => employeePermissions.includes(permission)) && (
                  <savebutton className="purbut" onClick={handleUpdate} required title="Update">
                    <i class="fa-solid fa-floppy-disk"></i>
                  </savebutton>
                )}
                {['delete', 'all permission'].some(permission => employeePermissions.includes(permission)) && (
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
                <h1 align="left" className="h1" >Add Employee Info</h1>
              </div>
              <div class="dropdown mt-1" >
                <button class="btn btn-primary dropdown-toggle p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fa-solid fa-list"></i>
                </button>
                <ul class="dropdown-menu">
                  <li class="iconbutton d-flex justify-content-center text-success">
                  {saveButtonVisible && ['add', 'all permission'].some(permission => employeePermissions.includes(permission)) && (
                      <icon class="icon" onClick={handleInsert}>
                          <i class="fa-regular fa-floppy-disk"></i>
                      </icon>
                    )}
                  </li>
                  {updateButtonVisible && ['update', 'all permission'].some(permission => employeePermissions.includes(permission)) && (
                  <li class="iconbutton  d-flex justify-content-center text-primary ">                
                    <icon class="icon" onClick={handleUpdate}>
                    <i class="fa-solid fa-floppy-disk"></i>
                    </icon>
                  </li>
                  )}
                  <li class="iconbutton  d-flex justify-content-center text-danger">
                    {['delete', 'all permission'].some(permission => employeePermissions.includes(permission)) && (
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
            <div class="row">
              <div className="col-md-3 form-group mb-2 me-1">
                <label htmlFor="EmployeeId" class="exp-form-labels">Employee ID</label>
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-end">
                    <input
                      id="EmployeeId"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Employee ID"
                      value={EmployeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <div className="position-absolute mt-1 me-2">
                      <span className="icon searchIcon" title="Employee Help"
                        onClick={handleEmployeeInfo}>
                        <i className="fa fa-search"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="col-md-2">
                <div class="me-2 mt-3">
                  <div class=" d-flex justify-content-start">
                    {saveButtonVisible && (
                      <savebutton className="purbut" onClick={handleInsert}
                        required title="save"> <i class="fa-regular fa-floppy-disk"></i> </savebutton>
                    )}
                    {updateButtonVisible && (
                      <savebutton className="purbut" title='update' onClick={handleUpdate} >
                        <i class="fa-solid fa-floppy-disk"></i>
                      </savebutton>
                    )}
                    <div class="mt-3">
                      <delbutton onClick={handleDelete} required title="Delete">
                        <i class="fa-solid fa-trash"></i>
                      </delbutton>
                    </div>
                    <div className="col-md-1">
                      <div className="ms-2 mt-3"></div>
                      <reloadbutton className="purbut" onClick={reloadGridData} title="save">
                        <i className="fa-solid fa-arrow-rotate-right"></i>
                      </reloadbutton>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        <div className="">
          <TabButtons tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
        </div>
        <div class=" mb-4">
          <div className="shadow-lg p-3 bg-light rounded-bottom  mb-2">
            <div class="row">

              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div><label htmlFor="FirstName" className={`${error && !First_Name ? 'red' : ''}`}>
                      First Name {showAsterisk && <span className="text-danger">*</span>}
                    </label></div>
                  </div>
                  <input
                    id="FirstName"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the First Name"
                    value={First_Name}
                    onChange={(e) => setFirst_Name(e.target.value)}
                    maxLength={75}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="MiddleName" >
                        Middle Name
                      </label> </div>
                  </div>
                  <input
                    id="MiddleName"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the Middle Name"
                    value={Middle_Name}
                    onChange={(e) => setMiddle_Name(e.target.value)}
                    maxLength={75}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div> <label htmlFor="LastName" className={`${error && !Last_Name ? 'red' : ''}`}>
                      Last Name {showAsterisk && <span className="text-danger">*</span>}
                    </label></div>

                  </div>
                  <input
                    id="LastName"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the Last Name"
                    value={Last_Name}
                    onChange={(e) => setLast_Name(e.target.value)}
                    maxLength={75}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div> <label htmlFor="FatherName" className={`${error && !Father_Name ? 'red' : ''}`}>
                      Father Name {showAsterisk && <span className="text-danger">*</span>}
                    </label> </div>

                  </div>
                  <input
                    id="FatherName"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the Father Name"
                    value={Father_Name}
                    onChange={(e) => setFather_Name(e.target.value)}
                    maxLength={100}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <label htmlFor="MotherName" className={`${error && !Mother_Name ? 'red' : ''}`}>
                    Mother Name {showAsterisk && <span className="text-danger">*</span>}
                  </label><input
                    id="MotherName"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the Mother Name"
                    value={Mother_Name}
                    onChange={(e) => setMother_Name(e.target.value)}
                    maxLength={100}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="dob" className={`${error && !DOB ? 'red' : ''}`}>DOB {showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                  </div>
                  <input
                    id="dob"
                    class="exp-input-field form-control"
                    type="date"
                    placeholder=""
                    required title="Please enter the Date of Birth"
                    value={DOB}
                    onChange={(e) => setDOB(e.target.value)}

                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="gender" className={`${error && !Gender ? 'red' : ''}`}>Gender {showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>

                    </div>
                  </div>
                  <Select
                    inputId="gender"
                    name="gender"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please Select the Gender"
                    value={Gender}
                    options={filteredOptiongender}
                    onChange={Handlegender}
                    maxLength={10}
                    autoComplete="off"
                  />

                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="email" className={`${error && !Email ? 'red' : ''}`}>Email {showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>
                    </div>
                  </div>
                  <input
                    id="email"
                    className="exp-input-field form-control"
                    type="email"
                    placeholder=""
                    required title="Please enter the Email ID"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={225}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label  htmlFor="gradeid" className={`${error && !Grade_id ? 'red' : ''}`}>Grade ID{showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>
                    </div>
                  </div>
                  <Select
                    inputId="gradeid"
                    name="gradeid"
                    className="exp-input-field"
                    placeholder=""
                    required title="Please Select the Grade"
                    value={Grade_id}
                    onChange={handleGradeID}
                    options={filteredOptionGradeid}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="Phone" className={`${error && !Phone1 ? 'red' : ''}`}>Phone No {showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>

                    </div>
                  </div>
                  <input
                    id="Phone"
                    className="exp-input-field form-control"
                    type="number"
                    placeholder=""
                    required
                    title="Please enter the Phone Number"
                    value={Phone1}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 13) {
                        setPhone1(value);
                      }
                    }}
                    maxLength={13}
                    autoComplete="off"
                  />

                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="phone2" className={`${error && !Phone2 ? 'red' : ''}`}>Alternative Phone No{showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>

                    </div>
                  </div><input
                    id="phone2"
                    className="exp-input-field form-control"
                    type="Number"
                    placeholder=""
                    required title="Please enter the Alternative Phone Number"
                    value={Phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    maxLength={20}
                    autoComplete="off"
                  />

                </div>
              </div>{" "}
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <label htmlFor="address1" className={`${error && !address1 ? 'red' : ''}`}>Address 1{showAsterisk && <span className="text-danger">*</span>}</label>
                  <input
                    id="address1"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the Address"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    maxLength={100}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="address2" className={`${error && !address2 ? 'red' : ''}`}>Address 2{showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>

                    </div>
                  </div>
                  <input
                    id="address2"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the Address"
                    value={address2}
                    maxLength={100}
                    onChange={(e) => setAddress2(e.target.value)}
                    autoComplete="off"
                  />

                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="address3" className={`${error && !address3 ? 'red' : ''}`}>Address 3{showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>

                    </div>
                  </div>
                  <input
                    id="address3"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the Address"
                    value={address3}
                    onChange={(e) => setAddress3(e.target.value)}
                    autoComplete="off"
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="permanantAddress" className={`${error && !permanantAddress ? 'red' : ''}`}>Permanent Address{showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>
                    </div>
                  </div>
                  <input
                    id="permanantAddress"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the permanant Address"
                    value={permanantAddress}
                    onChange={(e) => setPermanantAddress(e.target.value)}
                    autoComplete="off"
                    maxLength={300}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="ReferenceName">
                        Reference Name
                      </label>
                    </div>
                    <div>
                    </div>
                  </div>
                  <input
                    id="ReferenceName"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the Reference Name"
                    value={reference_Name}
                    onChange={(e) => setReference_Name(e.target.value)}
                    autoComplete="off"
                    maxLength={100}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="ReferencePhone">Reference Phone No</label>
                    </div>
                    <div>
                    </div>
                  </div>
                  <input
                    id="ReferencePhone"
                    class="exp-input-field form-control"
                    type="Number"
                    placeholder=""
                    required title="Please enter the Reference Phone Number"
                    value={reference_Phone}
                    onChange={(e) => setReference_Phone(e.target.value)}
                    autoComplete="off"
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="maritalStatus" className={`${error && !marital_Status ? 'red' : ''}`}>Marital Status{showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>
                    </div>
                  </div>
                  <Select
                    inputId="maritalStatus"
                    className="exp-input-field"
                    name="maritalStatus"
                    placeholder=""
                    required title="Please Select the Marital Status"
                    value={marital_Status}
                    onChange={handlemartial}
                    options={filteredOptionmartial}
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="Panno" className={`${error && !pan_No ? 'red' : ''}`}>Pan No{showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>

                    </div>
                  </div>
                  <input
                    id="Panno"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the PAN No"
                    value={pan_No}
                    onChange={(e) => setPan_No(e.target.value)}
                    autoComplete="off"
                    maxLength={10}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="Aadharno" className={`${error && !Aadhaar_no ? 'red' : ''}`}>Aadhaar No{showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>
                    </div>
                  </div>
                  <input
                    id="Aadharno"
                    class="exp-input-field form-control"
                    type="Number"
                    placeholder=""
                    required title="Please enter the Aadhaar No"
                    value={Aadhaar_no}
                    onChange={(e) => setAadhar_no(e.target.value)}
                    autoComplete="off"
                    maxLength={18}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label htmlFor="KidS" className={`${error && !kids ? 'red' : ''}`}>Kids{showAsterisk && <span className="text-danger">*</span>}</label>
                    </div>
                    <div>

                    </div>
                  </div>
                  <Select
                  inputId="KidS"
                  name="KidS"
                    className="exp-input-field"
                    required title="Please select the Kids"
                    value={kids}
                    onChange={handleKids}
                    options={filteredOptionKids}
                    autoComplete="off"

                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label htmlFor="file" >Employee Photo</label>
                    </div>
                    <div>
                    </div>
                  </div>
                  <input
                  id = "file"
                    type="file"
                    className="exp-input-field form-control"
                    accept="image/*"
                    onChange={handleFileSelect1}

                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="image-frame" style={{
                    width: "200px",
                    height: "200px",
                    border: "2px solid #ccc",
                    padding: "10px",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <img
                      src={selectedImage || 'default-placeholder.png'}
                      alt="Preview"
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "fill"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <EmployeeInfoPopup open={open} handleClose={handleClose} EmployeeInfo={EmployeeInfo} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Input;
