import React, { useState, useEffect, useRef } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import '../apps.css';
import { useNavigate } from "react-router-dom";
import { publicIpv4 } from "public-ip";
const config = require('../Apiconfig');

function Input({ }) {
  const [isCheckedIn, setIsCheckedIn] = useState(
    sessionStorage.getItem("isCheckedIn") === "true"
  );
  const user_code = sessionStorage.getItem('selectedUserCode');
  const gridApiRef = useRef(null);   
  const gridColumnApiRef = useRef(null);
  const [rowData, setrowData] = useState('');
  const [deviceDetails, setDeviceDetails] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();
  const [timer, setTimer] = useState("00:00:00");

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        // Get Device Details
        const userAgent = navigator.userAgent;
        setDeviceDetails(userAgent);

        // Get IP Address
        const ip = await publicIpv4(); // Correct function
        setIpAddress(ip);

        // Get Location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setLocation(`${latitude}, ${longitude}`);
            },
            (error) => {
              console.error("Error fetching location:", error);
              setLocation("Location unavailable");
            }
          );
        } else {
          setLocation("Geolocation not supported");
        }
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    };

    fetchDeviceInfo();
  }, []);

  useEffect(() => {
    const fetchGstReport = async () => {
      try {
        const body = {
          userID: sessionStorage.getItem("selectedUserCode"),
          company_code:sessionStorage.getItem('selectedCompanyCode')
        };

        const response = await fetch(`${config.apiBaseUrl}/getDailyTask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const fetchedData = await response.json();
          const newRows = fetchedData.map((matchedItem, index) => ({
            SNo: index + 1,
            StartDate: formatDate(matchedItem.StartDate),
            EndDate: formatDate(matchedItem.EndDate),
            TaskMasterID: matchedItem.TaskMasterID,
            TaskTitle: matchedItem.TaskTitle,
            ProjectName: matchedItem.ProjectName,
            ProjectID: matchedItem.ProjectID,
            userID: matchedItem.userID,
            TaskStatus: matchedItem.TaskStatus,
            PriorityLevel: matchedItem.PriorityLevel,
            EstimatedHours: matchedItem.EstimatedHours,
            BufferHours: matchedItem.BufferHours,
            Description: matchedItem.Description,
          }));
          setrowData(newRows);
        } else if (response.status === 404) {
          console.log("Data Not found");
          toast.warning("Data Not found");
          setrowData([]);
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to get data");
          console.error(errorResponse.details || errorResponse.message);
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      }
    };
    fetchGstReport();
  }, []);

  // Empty dependency array means this effect runs once when the component mounts

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const columnDefs = [
    {
      headerName: "S.No",
      field: "SNo",
      // minWidth: 70,
      // maxWidth: 70
    },
    {
      headerName: "Project ID",
      field: "ProjectID",
      filter: 'agNumberColumnFilter',
      // minWidth: 200,
      // maxWidth: 200
    },
    {
      headerName: "Project Name",
      field: "ProjectName",
      filter: 'agTextColumnFilter',
      // minWidth: 200,
    },
    {
      headerName: "Task Master ID",
      field: "TaskMasterID",
      filter: 'agTextColumnFilter',
      // minWidth: 200,
      // maxWidth: 200
    },
    {
      headerName: "Priority Level",
      field: "PriorityLevel",
      filter: 'agNumberColumnFilter',
      // minWidth: 150,
      // maxWidth: 150
    },
    {
      headerName: "Description",
      field: "Description",
      filter: 'agNumberColumnFilter',
      // minWidth: 200,
    },
    {
      headerName: "Links",
      field: "EMIAmount",
      filter: "agNumberColumnFilter",
      // minWidth: 400,
      // maxWidth: 400,
      hide:true,
      cellRenderer: (params) => {
        const handleClick = () => {
          handleNavigateWithRowData(params.data);
        };
        return (
          <button
            onClick={handleClick}
            style={{
              cursor: "pointer",
              background: "0",
              color: "black",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              boxShadow: "0px 0px 0px 0px",
            }}
          >
           {params.value}
            Link
          </button>
        );
      },
    }
  ];

// Function to handle navigation with row data
const handleNavigateWithRowData = (selectedRow) => {
  navigate("/ProjectDetails", { state: { selectedRow } });
};

  // const defaultColDef = {
  //   resizable: true,
  //   wrapText: true,
  //   sortable: true,
  //   editable: false,
  // };
  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };
  
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isCheckedIn) {
      startTimer();
    }

    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, [isCheckedIn]);

  const startTimer = () => {
    let storedElapsedTime = sessionStorage.getItem("elapsedTime")
      ? parseInt(sessionStorage.getItem("elapsedTime"))
      : 0;
    
    let startTime = parseInt(sessionStorage.getItem("startTime")) || Date.now() - storedElapsedTime * 1000;
    
    sessionStorage.setItem("startTime", startTime);

    if (intervalRef.current) clearInterval(intervalRef.current); // Clear any existing interval

    intervalRef.current = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      sessionStorage.setItem("elapsedTime", elapsedTime);

      const hours = String(Math.floor(elapsedTime / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, "0");
      const seconds = String(elapsedTime % 60).padStart(2, "0");

      setTimer(`${hours}:${minutes}:${seconds}`);

          // 🕒 Check if 8 hours (28800 seconds) completed
    if (elapsedTime === 28800 && !sessionStorage.getItem("mailSent")) {
      sendAutoMail(); // Call your email function
      sessionStorage.setItem("mailSent", "true"); // Ensure it's only sent once
    }

    }, 1000);
  };



  

  const sendAutoMail = async () => {
    const userEmail = sessionStorage.getItem("userEmailId");
  
    try {
      const response = await fetch(`${config.apiBaseUrl}/sendAutoMail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });
  
      if (response.ok) {
        console.log("Email sent successfully");
      } else {
        console.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending mail:", error.message);
    }
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    let lastElapsedTime = sessionStorage.getItem("elapsedTime") || "0";
    sessionStorage.setItem("lastElapsedTime", lastElapsedTime); // Save last elapsed time
    sessionStorage.removeItem("elapsedTime");
    sessionStorage.removeItem("startTime");
  };




  const handleTime = async () => {
    try {
      const route = isCheckedIn ? "/DailyLogOUT" : "/DailyLogin";
      const response = await fetch(`${config.apiBaseUrl}${route}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: sessionStorage.getItem('selectedUserCode'),
          DeviceDetails: deviceDetails,
          IP_Address: ipAddress,
          Location: location,
        }),
      });

      if (response.status === 200) {
        setIsCheckedIn((prev) => {
          const newState = !prev;
          sessionStorage.setItem("isCheckedIn", newState);

          if (newState) {
            // When checking in, resume from last elapsed time
            let lastElapsedTime = sessionStorage.getItem("lastElapsedTime")
              ? parseInt(sessionStorage.getItem("lastElapsedTime"))
              : 0;
            sessionStorage.setItem("elapsedTime", lastElapsedTime);
            startTimer();
          } else {
            stopTimer();
          }
          return newState;
        });
      } else if (response.status === 400) {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message);
      } else {
        toast.error("Failed to insert data");
      }
    } catch (error) {
      toast.error("Error inserting data: " + error.message);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("elapsedTime")) {
      const storedTime = parseInt(sessionStorage.getItem("elapsedTime"));
      const hours = String(Math.floor(storedTime / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((storedTime % 3600) / 60)).padStart(2, "0");
      const seconds = String(storedTime % 60).padStart(2, "0");
      setTimer(`${hours}:${minutes}:${seconds}`);
    }
  }, []);

  // const startTimer = () => {
  //   const startTime = Date.now() - secondsPassed * 1000; // Start from where it left off
  //   const id = setInterval(() => {
  //     const elapsed = Math.floor((Date.now() - startTime) / 1000); // Calculate elapsed time in seconds
  //     setSecondsPassed(elapsed);
  //     setTimer(formatTime(elapsed));
  //   }, 1000);
  //   setIntervalId(id);
  // };

  // const stopTimer = () => {
  //   if (intervalId) {
  //     clearInterval(intervalId);
  //     setIntervalId(null);
  //   }
  // };

  return (
    <div class="container-fluid Topnav-screen ">
      <div className="">
        <div class="">
          <ToastContainer position="top-right" className="toast-design" theme="colored" />
          <div className=" p-0 shadow-lg bg-white rounded">
            <div className="purbut mb-0 d-flex justify-content-between">
              <h1 align="left" className="">Open Tickets</h1>
              {/* <div className="col-md-2 mt-1  purbut" >
                <div class=" d-flex justify-content-end  ">
                  <div className="col-md-6 form-group me-5">
                    <div className="mt-2 badge rounded-pill text-bg-success">
                      {user_code}
                    </div>
                  </div>
                  <div className="col-md-5 form-group mb-2">
                    <input
                      id="timing"
                      className="form-control mt-1"
                      type="text"
                      readOnly
                      value={timer}
                    />
                  </div>
                  <div className="col-md-12 ms-3">
                    <button
                      onClick={handleTime}
                      className="btn mt-1"
                      style={{
                        backgroundColor: isCheckedIn ? "red" : "green",
                        color: "white",
                      }}
                      title={isCheckedIn ? "Check OUT" : "Check IN"}
                    >
                      <i className="fa-solid fa-clock me-2"></i>
                      {isCheckedIn ? "Check OUT" : "Check IN"}
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
          <div className=" shadow-lg bg-white rounded  mt-2  p-3">
            <div class=" mb-4">
              <div className="mb-2">
              </div>
              {/* <hr className=""></hr> */}
              <div className="ag-theme-alpine" style={{ height: 300, width: '100%' }}>
                <AgGridReact
                  columnDefs={columnDefs}
                  // defaultColDef={defaultColDef}
                  rowData={rowData}
                  onCellClicked={(params) => handleNavigateWithRowData(params.data)}
                  pagination={true}
                  rowHeight={27}
                  headerHeight={27}
                  paginationAutoPageSize={true}
                  gridOptions={gridOptions}
                  suppressRowClickSelection={true}
                  onGridReady={(params) => {
                    gridApiRef.current = params.api;
                    gridColumnApiRef.current = params.columnApi;
                  }}
                />
              </div>
              <div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Input;
