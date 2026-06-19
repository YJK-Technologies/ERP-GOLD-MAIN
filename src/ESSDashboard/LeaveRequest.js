import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import LeavePopup from './LeaveReqPopup.js'

const config = require('../Apiconfig');


const LeaveRequestPage = () => {
  const [LeaveType, setLeaveType] = useState("");
  const [FromDate, setFromDate] = useState("");
  const [ToDate, setToDate] = useState("");
  const [Reason, setReason] = useState("");
  const [leaveStatus, setLeaveStatus] = useState("");
  const [Select_slots, setSelect_Slots] = useState("");
  const [AlternativeReponsablePerson, setReasponsiblePerson] = useState("");
  const [ReportingManager, setReportingManager] = useState("");
  const [LeaveDrop, setLeaveDrop] = useState([]);
  const [SelectedLeave, setSelectedLeave] = useState("");
  const navigate = useNavigate();
  const [SlotDrop, setSlotDrop] = useState([]);
  const [SelectedSlot, setSelectedSlot] = useState("");
  const created_by = sessionStorage.getItem('selectedUserCode')
  const [rowData, setrowData] = useState([]);
  const [error, setError] = useState('');
  const [Managerdrop, setManagerdrop] = useState([]);
  const [selectedmanager, setselectedmanager] = useState('');

  // useEffect(() => {
  //   fetch(`${config.apiBaseUrl}/getapplyLeavetype`,{
  //   method: "GET",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //   company_code: sessionStorage.getItem("selectedCompanyCode"),
  //   })
  // })
  //     .then((data) => data.json())
  //     .then((val) => setLeaveDrop(val));
  // }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/ESSManager`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((response) => response.json())
      .then(setManagerdrop)
      .catch((error) => console.error("Error fetching warehouse:", error));
  }, []);


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getapplyLeavetype`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((data) => data.json())
      .then((val) => setLeaveDrop(val))
  }, []);

  const filterOptionLeaveType = LeaveDrop.map((option) => ({
    value: option.LeaveId,
    label: option.LeaveId,
  }));


  const handleLeaveType = (SelectedLeave) => {
    setSelectedLeave(SelectedLeave);
    setLeaveType(SelectedLeave ? SelectedLeave.value : '');
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getSelectslot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((data) => data.json())
      .then((val) => setSlotDrop(val));
  }, []);


  // useEffect(() => {
  // //   fetch(`${config.apiBaseUrl}/getSelectslot`)
  //  .then((data) => data.json())
  //     .then((val) => setSlotDrop(val));
  // }, []);


  const filterOptionSelect_Slots = SlotDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleSelect_Slots = (selectedSlot) => {
    setSelectedSlot(selectedSlot);
    setSelect_Slots(selectedSlot ? selectedSlot.value : '');
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    validateDates(FromDate, e.target.value);
  };

  const handleFromDate = (e) => {
    setFromDate(e.target.value);
    validateDates(ToDate, e.target.value);
  };

  const validateDates = (FromDate, ToDate) => {
    if (FromDate && ToDate) {
      const Fromdate = new Date(FromDate);
      const Todate = new Date(ToDate);


      if (Fromdate >= Todate) {
        setError("From Date should be earlier than To Date");
      } else {
        setError("");
      }
    }
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getEmployeeTotalLeaveBalance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        EmployeeId: sessionStorage.getItem('selectedUserCode'),
        company_code: sessionStorage.getItem("selectedCompanyCode"),
      }),
    })
      .then((data) => data.json())
      .then((val) => setrowData(val));
  }, []);

  // const handleFileSelect = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const maxSize = 1 * 1024 * 1024;
  //     if (file.size > maxSize) {
  //       toast.warning('File size exceeds 1MB. Please upload a smaller file.');
  //       event.target.value = null;
  //       return;
  //     }
  //     setSelectedImage(URL.createObjectURL(file));
  //     setDoucment(file);
  //   }
  // };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!LeaveType ||
      !FromDate ||
      !ToDate ||
      !Select_slots ||
      !Reason ||
      !ReportingManager ||
      !AlternativeReponsablePerson) {
      setError("All fields are required.");
      toast.warning("Please fill in all required fields.");
      return;
    }

    const formData = {
      LeaveType,
      FromDate,
      ToDate,
      Select_slots,
      Reason,
      ReportingManager,
      EmployeeId: sessionStorage.getItem("selectedUserCode"),
      company_code: sessionStorage.getItem('selectedCompanyCode'),
      created_by: sessionStorage.getItem("selectedUserCode"),
      AlternativeReponsablePerson,
    };

    try {

      const response = await fetch(`${config.apiBaseUrl}/addEmployeeLeave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Form Submitted Successfully", data);
        toast.success("Form Submitted Successfully");
        setLeaveType("");
        setFromDate("");
        setToDate("");
        setSelect_Slots("");
        setReason("");
        setReportingManager("");
        setReasponsiblePerson("");
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message || 'Something went wrong.'}`);
      }

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("There was an error submitting the form. Please try again.");
    }
  };

  const [columnDefs] = useState([
    { headerName: 'Leave Type', field: 'leavetype', sortable: true, filter: true },
    { headerName: 'No of Leaves', field: 'availableleave', sortable: true, filter: true },
  ]);


  const goBack = () => {
    navigate('/EmployeeDashboard');
  };

  const handleClose = () => {
    setOpen(false);

  };

  const [open, setOpen] = React.useState(false);
  const handleadjustmentbtn = () => {
    setOpen(true);
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const handleLeave = async (data) => {

    if (data && data.length > 0) {
      const [{ LeaveType, FromDate, ToDate, LeaveStatus }] = data;
      
      setLeaveStatus(LeaveStatus);

      const fromDate = document.getElementById('FromDate');
      if (fromDate) {
        fromDate.value = FromDate;
        setFromDate(formatDate(FromDate));
      } else {
        console.error('FromDate not found');
      }

      const toDate = document.getElementById('ToDate');
      if (toDate) {
        toDate.value = ToDate;
        setToDate(formatDate(ToDate));
      } else {
        console.error('ToDate not found');
      }

      const leaveType = document.getElementById('LeaveType');
      if (leaveType) {
        const selectedLeaveType = filterOptionLeaveType.find(option => option.value === LeaveType);
        setSelectedLeave(selectedLeaveType);
        setLeaveType(selectedLeaveType.value);
      } else {
        console.error('LeaveType not found');
      }

    } else {
      console.log("Data not fetched...!");
    }
    console.log(data);
  };

  const filteredOptionManager = Managerdrop.map((option) => ({
    value: option.EmployeeId,
    label: `${option.EmployeeId}-${option.full_name}`,
  }));

  const handleChangemanager = (selectedOption) => {
    setselectedmanager(selectedOption);
    setReportingManager(selectedOption ? selectedOption.value : '');
  };

  return (
    <div className="container-fluid Topnav-screen">
      <div className="shadow bg-white p-1 mt-2 mb-2 border-secondary rounded-3">
        <div className="d-flex justify-content-between">
          <div className="d-flex justify-content-start">
            <h1 className="mb-2 d-flex justify-content-start">Apply Leave</h1>
          </div>
          <div className="d-flex justify-content-start">
            <div class="mt-3">
              <delbutton class="p-5" style={{ cursor: "pointer" }} onClick={goBack}>
                <i class="fa-solid fa-circle-xmark"></i>
              </delbutton>
            </div>
          </div>
        </div>
      </div>
      <div>
      </div>
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow bg-white border-secondary rounded-3">
        <div className="row ">
          <div className="col-md-8">
            <div className="p-4">
              <div className="col-md-5 mb-3">
                <label htmlFor="LeaveType" className={`d-flex justify-content-start ms-1 ${error && !LeaveType ? 'red' : ''}`}>
                  Leave Type<span className="text-danger">*</span>
                </label>
                <Select
                  id="LeaveType"
                  value={SelectedLeave}
                  onChange={handleLeaveType}
                  options={filterOptionLeaveType}
                />
              </div>
              <div className="row">
                <div className="col-md-5 mb-3">
                  <label htmlFor="FromDate" className={`d-flex justify-content-start ms-1 ${error && !FromDate ? 'red' : ''}`}>
                    From Date<span className="text-danger">*</span>
                  </label>
                  <input
                    id="FromDate"
                    type="date"
                    className="exp-input-field form-control"
                    name="FromDate"
                    value={FromDate}
                    onChange={handleFromDate}
                  />
                </div>
                <div className="col-md-5 mb-3">
                  <label htmlFor="ToDate" className={`d-flex justify-content-start ms-1 ${error && !ToDate ? 'red' : ''}`}>
                    To Date<span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="ToDate"
                    name="ToDate"
                    value={ToDate}
                    onChange={handleToDateChange}
                  />
                </div>
              </div>
              <div className="col-md-5 mb-3">
                <label htmlFor="slot" className="d-flex justify-content-start ms-1">
                  Select Slot
                </label>
                <Select
                  id="Select_slots"
                  value={SelectedSlot}
                  onChange={handleSelect_Slots}
                  options={filterOptionSelect_Slots}
                />
              </div>
              <div className="col-md-5 mb-3">
                <label htmlFor="Reason" className={`d-flex justify-content-start ms-1 mb-2 ${error && !Reason ? 'red' : ''}`}>
                  Reason<span className="text-danger">*</span>
                </label>
                <textarea
                  id="Reason"
                  className="form-control"
                  name="Reason"
                  value={Reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="3"
                  placeholder="Enter Reason for leave"
                />
              </div>
              <div className="col-md-5 mb-3">
                <label htmlFor="applyTo" className={`d-flex justify-content-start ms-1 ${error && !ReportingManager ? 'red' : ''}`}>
                  Reporting Manager<span className="text-danger">*</span>
                </label>
                <Select
                  id="LoanEligibleAmount"
                  class="exp-input-field form-control p-2"
                  type="text"
                  placeholder=""
                  required title="Please enter the Project Manager"
                  value={selectedmanager}
                  options={filteredOptionManager}
                  onChange={handleChangemanager}
                  maxLength={18}
                />
              </div>
              <div className="col-md-5 mb-3">
                <label htmlFor="applyTo" className="d-flex justify-content-start ms-1">
                  Responsible Person
                </label>
                <input
                  type="text"
                  id="AlternativeReponsablePerson"
                  className="form-control"
                  placeholder=""
                  name="AlternativeReponsablePerson"
                  value={AlternativeReponsablePerson}
                  onChange={(e) => setReasponsiblePerson(e.target.value)}
                />
              </div>
              <div className="row">
                {leaveStatus !== "Pending" && leaveStatus !== "Approved" && (
                  <div className="col-md-1 me-2">
                    <button className="" onClick={handleSave}>Apply</button>
                  </div>
                )}
                <div className="col-md-3">
                  <button className="fs-7" onClick={handleadjustmentbtn}>Applied Leaves</button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="pt-5">
              <h5 className="ms-3">Leave Balance</h5>
              <div className="ag-theme-alpine" style={{ height: 500, width: 400, borderRadius: '20px' }}>
                <AgGridReact rowData={rowData} columnDefs={columnDefs} rowHeight={30} />
              </div>
            </div>
          </div>
        </div>
        <div>
          <LeavePopup open={open} handleClose={handleClose} handleLeave={handleLeave} />
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestPage;
