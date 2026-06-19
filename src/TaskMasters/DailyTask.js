import React, { useState, useEffect } from "react";
import "../input.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import './EmployeeLoan.css'
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import '../apps.css'
import Select from 'react-select'
import axios from 'axios';


import { showConfirmationToast } from './ToastConfirmation';
const config = require('../Apiconfig');

function Input({ }) {
  const today = new Date().toISOString().split("T")[0];
  const [TaskMaster, setTaskMaster] = useState('');
  const [Title, setTitle] = useState('');
  const [EndDate, setEndDate] = useState(today);
  const [selectedProject, setSelectedProject] = useState([]);
  const [projectDrop, setProjectDrop] = useState([]);
  const [selectedLoan, setselectedLoan] = useState('');
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [rowData, setrowData] = useState('');
  const [ProjectID, setProjectID] = useState('');
  const [UserID, setUserID] = useState('');
  const [selectedUser, setSelectedUser] = useState([]);
  const [Endtime, setEndtime] = useState('');
  const [StartDate, setStartDate] = useState(today);
  const [selectedtstatus, setselectedtstatus] = useState('');
  const [status_type, setstatus_type] = useState("");
  const [statusdrop, setStatusdrop] = useState([]);
  const [Descriptions, setDescriptions] = useState('');
  const [buffer, setbuffer] = useState("");
  const [TaskMasterID, setTaskMasterID] = useState('');
  const [userid, setUserid] = useState('');
  const [Projectid, setProjectid] = useState('');
  const [TaskTitle, settitle] = useState('');
  const [startdate, setstartdate] = useState('');
  const [enddate, setenddate] = useState('');
  const [editedData, setEditedData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [StatusGriddrop, setStatusGriddrop] = useState([]);
  const [selectedtstatusSC, setselectedtstatusSC] = useState('');
  const [status_typeSC, setstatus_typeSC] = useState('');
  const [selectedPriortyLeavel, setSelectedPriortyLeavel] = useState('');
  const [PriorityLevel, setPriorityLevel] = useState('');
  const [PriorityDrop, setPriorityDrop] = useState([]);
  const [userDrop, setUserDrop] = useState([]);
  const [ProjectiD, setProjectCode] = useState("");
  const [ProjectName, setProjectName] = useState("");
  const [ProjectDescription, setdescriptions] = useState("");
  const [Manager, setManager] = useState("");
  const [startDate, setStartdate] = useState("");
  const [endDate, setEnddate] = useState("");
  const navigate = useNavigate();


  const handleChangeUser = async (selectedUser) => {
    setSelectedUser(selectedUser);
    setUserID(selectedUser ? selectedUser.value : '');
  };



  const filteredOptionUser = Array.isArray(userDrop)
    ? userDrop.map((option) => ({
      value: option.userID,
      label: `${option.userID} - ${option.user_name}`,
    }))
    : [];

  // useEffect(() => {
  //   fetch(`${config.apiBaseUrl}/usercode`)
  //     .then((data) => data.json())
  //     .then((val) => setUserDrop(val));
  // }, []);

  const handleChangePriorityLevel = (selectedPriortyLeavel) => {
    setSelectedPriortyLeavel(selectedPriortyLeavel);
    setPriorityLevel(selectedPriortyLeavel ? selectedPriortyLeavel.value : '');
  };
  const filteredOptionPriorityLevel = PriorityDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/getPriority`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setPriorityDrop(val));
  }, []);

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.TaskMasterID === params.data.TaskMasterID // Use the unique identifier 
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setrowData(updatedRowData);

      // Add the edited row data to the state
      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };

  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };

  const onGridReady = (params) => {
    setGridApi(params.api);

  };


  const handleChangestatus = (selectedstatus) => {
    setselectedtstatus(selectedstatus);
    setstatus_type(selectedstatus ? selectedstatus.value : '');
  };

  const handleChangestatusSC = (selectedstatus) => {
    setselectedtstatusSC(selectedstatus);
    setstatus_typeSC(selectedstatus ? selectedstatus.value : '');
  };


  const filteredOptionTransaction = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredOptionTransactionSC = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const company_code = sessionStorage.getItem("selectedCompanyCode")


  useEffect(() => {
    if (!company_code) return; // Only run if company_code exists

    fetch(`${config.apiBaseUrl}/getProjectDrop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((response) => response.json())
      .then((data) => {
        setProjectDrop(data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/getTaskstatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const statusOption = data.map(option => option.attributedetails_name);
        setStatusGriddrop(statusOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);



  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    fetch(`${config.apiBaseUrl}/getTaskstatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })
      .then((data) => data.json())
      .then((val) => setStatusdrop(val));
  }, []);

  useEffect(() => {
    // Function to fetch data from the backend API
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getDailyTasks`);  // Backend URL
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setrowData(result);  // Set the data in state
      } catch (error) {
        setError(error.message);  // Handle errors
      }
    };

    fetchData();  // Call the fetchData function
  }, []);  // Empty dependency array means this effect runs once when the component mounts

  // Function to handle navigation with row data
  const handleNavigateWithRowData = (selectedRow) => {
    navigate("/ProjectDetails", { state: { selectedRow } });
  };


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

    {
      headerName: "Project ID",
      field: "ProjectID",
      filter: 'agNumberColumnFilter',
      // minWidth: 200,
      //  maxWidth: 200,
      editable: false
    },
    {
      headerName: "Task Master ID",
      field: "TaskMasterID",
      // minWidth: 170,
      //  maxWidth: 170,

    },

    {
      headerName: "User ID",
      field: "userID",
      filter: 'agDateColumnFilter',
      // minWidth: 140, 
      // maxWidth: 140,
      editable: true   // Format the date for display  
    },
    {
      headerName: "Daily Task Title",
      field: "TaskTitle",
      filter: 'agDateColumnFilter',
      //  minWidth: 170,
      //   maxWidth: 170,
      editable: true
    },
    {
      headerName: "Start Date",
      field: "StartDate",
      filter: 'agDateColumnFilter',
      //  minWidth: 130, 
      //  maxWidth: 120,
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
    {
      headerName: "End Date",
      field: "EndDate",
      filter: 'agDateColumnFilter',
      // minWidth: 130,
      //  maxWidth: 120,
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
    {
      headerName: "Task Status",
      field: "TaskStatus",
      // minWidth: 150,
      //  maxWidth: 150 ,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: StatusGriddrop
      },

    },
    {
      headerName: "Estimated Hours",
      field: "EstimatedHours",
      filter: 'agNumberColumnFilter',
      //  minWidth: 160,
      //   maxWidth: 160 ,
      editable: true
    },
    {
      headerName: "Buffer Hours",
      field: "BufferHours",
      filter: 'agNumberColumnFilter',
      //  minWidth: 150,
      //   maxWidth: 150,
      editable: true
    },
    {
      headerName: "Task Description",
      field: "Description",
      filter: 'agNumberColumnFilter',
      //  minWidth: 400,
      editable: true,
      // maxWidth: 400 },
    }

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

  const handleSave = async (e) => {

    if (!ProjectID || !UserID || !Title || !StartDate || !EndDate || !Endtime || !Descriptions) {
      setError(" ");
      toast.warning("Error:Missing Required Fields")
      return;
    }
    e.preventDefault();
    setSaveButtonVisible(true);
    setIsSaving(true);
    setMessage('');

    const data = {

      TaskTitle: Title,
      Description: Descriptions,
      ProjectID: ProjectID,
      userID: UserID,
      StartDate: StartDate,
      EndDate: EndDate,
      EstimatedHours: Endtime,
      TaskStatus: status_type,
      BufferHours: buffer,
      PriorityLevel: PriorityLevel,
      created_by: sessionStorage.getItem('selectedUserCode'),
      company_code: sessionStorage.getItem('selectedCompanyCode')
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/addTask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });


      if (response.ok) {
        const searchData = await response.json();
        console.log(searchData);
        const [{ TaskMasterID }] = searchData;
        setTaskMaster(TaskMasterID);
        toast.success("Data inserted Successfully")
      }
      else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message);
      }

    } catch (error) {
      toast.error("Error inserting data: " + error.message);
    }
  };


  const handleDelete = async (e) => {
    e.preventDefault();

    setIsSaving(true);
    setMessage('');

    // Prepare the data to be sent to the backend (you can send just the ID needed for deletion)
    const data = {
      TaskMaster,
      loanID: selectedLoan,
    };

    try {

      const response = await axios.post(`${config.apiBaseUrl}/deleteEmployeeLoan `, data); // Replace with actual API endpoint for deletion

      setMessage('Data deleted successfully');
      setTimeout(() => {
        toast.success("Data deleted successfully!", {
          onClose: () => window.location.reload(),
        });
      }, 1000);

    } catch (error) {
      setMessage('Error deleting data: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const saveEditedData = async () => {

    try {
      const modified_by = sessionStorage.getItem('selectedUserCode');
      const selectedRowsData = Array.isArray(editedData) ? editedData.filter(row => row.TaskMasterID === row.TaskMasterID) : [editedData];

      const response = await fetch(`${config.apiBaseUrl}/updateTask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Modified-By": modified_by,
          "company_code": sessionStorage.getItem('selectedCompanyCode')

        },
        body: JSON.stringify({ editedData: selectedRowsData }), // Send only the selected rows for saving
        "modified_by": modified_by,

      });

      if (response.status === 200) {
        setTimeout(() => {
          toast.success("Data Updated Successfully")
          handleSearch();
        }, 1000);
        return;
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error Updating Data: " + error.message);
    }


  };

  const deleteSelectedRows = async (rowData) => {
    const TaskMasterDelete = { TaskMasterIDToDelete: Array.isArray(rowData) ? rowData : [rowData] };

    showConfirmationToast(
      "Are you sure you want to delete the data in the selected rows?",
      async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/deleteTask`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "company_code": sessionStorage.getItem('selectedCompanyCode')
            },
            body: JSON.stringify(TaskMasterDelete),
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



  const reloadGridData = () => {
    window.location.reload();
  };

  const reloadGridDatas = () => {
    window.location.reload();
  };



  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };


  const handleSearch = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/DailytaskSC`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ TaskMasterID: TaskMasterID, ProjectID: Projectid, userID: userid, TaskTitle: TaskTitle, StartDate: startdate, EndDate: enddate, TaskStatus: status_typeSC, company_code: sessionStorage.getItem('selectedCompanyCode') }), // Send as search criteria
      });

      if (response.ok) {
        const searchData = await response.json();
        setrowData(searchData);
      } else if (response.status === 404) {
        console.log("Data not found");
        setrowData([]);
        toast.warning("Data not found");
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("Error fetching search data:", error);
    }
  };

  const handleChangeProject = async (selectedProject) => {
    setSelectedProject(selectedProject);
    setProjectID(selectedProject ? selectedProject.value : '');

    if (selectedProject) {
      try {
        const body = { ProjectID: selectedProject.value, company_code: sessionStorage.getItem('selectedCompanyCode') };

        const response = await fetch(`${config.apiBaseUrl}/getProjectDetail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const fetchedData = await response.json();

          if (fetchedData.length > 0) {
            const formatDate = (dateString) => {
              const date = new Date(dateString);
              return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            };

            setManager(fetchedData[0].ProjectManager);
            setProjectCode(fetchedData[0].ProjectID);
            setStartdate(formatDate(fetchedData[0].StartDate));
            setEnddate(formatDate(fetchedData[0].EndDate));
            setdescriptions(fetchedData[0].ProjectDescription);
            setProjectName(fetchedData[0].ProjectName);

            // ?? Fetch User ID after project details are loaded
            fetchUserID(selectedProject.value);
          }
        } else if (response.status === 404) {
          toast.warning("Data Not found");
          setManager("");
        } else {
          const errorResponse = await response.json();
          toast.warning(errorResponse.message || "Failed to fetch project details");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    }
  };

  const fetchUserID = async (projectID) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/Projectusercode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ProjectID: projectID, company_code: sessionStorage.getItem('selectedCompanyCode') }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.length > 0) {
          const userOptions = data.map((item) => ({
            label: `${item.userID} - ${item.user_name}`,
            value: item.userID
          }));

          setUserDrop(data);
          setSelectedUser(userOptions[0]);
          setUserID(userOptions[0]?.value || "");
        } else {
          setSelectedUser(null);
          setUserID("");
        }
      } else {
        console.log("User ID not found.");
        setSelectedUser(null);
        setUserID("");
      }
    } catch (error) {
      console.error("Error fetching User ID:", error);
    }
  };





  const filteredOptionProject = Array.isArray(projectDrop)
    ? projectDrop.map((option) => ({
      value: option.ProjectID,
      label: `${option.ProjectID} - ${option.ProjectName}`
    }))
    : [];

  // useEffect(() => {
  //   // Only fetch if a project is selected from the dropdown
  //   if (!selectedProject) return;

  //   const fetchReport = async () => {
  //     try {
  //       // Use the dropdown's selected value here
  //       const body = { ProjectID: ProjectID };

  //       const response = await fetch(`${config.apiBaseUrl}/getProjectDetail`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(body),
  //       });

  //       if (response.ok) {
  //         const fetchedData = await response.json();

  //         if (fetchedData.length > 0) {
  //           // Format dates using en-GB locale
  //           const formatDate = (dateString) => {
  //             const date = new Date(dateString);
  //             return date.toLocaleDateString("en-GB", {
  //               day: "2-digit",
  //               month: "2-digit",
  //               year: "numeric",
  //             });
  //           };

  //           setManager(fetchedData[0].ProjectManager);
  //           setProjectCode(fetchedData[0].ProjectID);
  //           setStartdate(formatDate(fetchedData[0].StartDate));
  //           setEnddate(formatDate(fetchedData[0].EndDate));
  //           setdescriptions(fetchedData[0].ProjectDescription);
  //           setProjectName(fetchedData[0].ProjectName);
  //         }
  //       } else if (response.status === 404) {
  //         console.log("Data Not found");
  //         toast.warning("Data Not found");
  //         setManager(""); // Reset if no data is found
  //       } else {
  //         const errorResponse = await response.json();
  //         toast.warning(errorResponse.message || "Failed to fetch project details");
  //         console.error(errorResponse.details || errorResponse.message);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching project data:", error);
  //     }
  //   };

  //   fetchReport();
  // }, [selectedProject]);



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
              <h1 align="left" className="">
                Task
              </h1>

              <div className="col-md-1 mt-3 me-5 purbut">

                <div class=" d-flex justify-content-start  me-5">
                  <div className="me-1 ">
                    {saveButtonVisible && (
                      <savebutton className="" onClick={handleSave}
                        required title="save"> <i class="fa-regular fa-floppy-disk"></i> </savebutton>
                    )}


                  </div>
                  <div className="col-md-1">
                    <div className="ms-1">
                      <reloadbutton
                        className="purbut"
                        onClick={reloadGridData}
                        title="Reload" style={{ cursor: "pointer" }}>
                        <i className="fa-solid fa-arrow-rotate-right"></i>
                      </reloadbutton>
                    </div>
                  </div>
                </div>
              </div>
              <div class="dropdown mt-2 me-5 mobileview">
                <button
                  class="btn btn-primary dropdown-toggle p-1"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="fa-solid fa-list"></i>
                </button>
                <ul class="dropdown-menu menu">
                  <li class="iconbutton  d-flex justify-content-center text-success" onClick={handleSave}>
                    <icon
                      class="icon"
                    >

                      <i class="fa-regular fa-floppy-disk"></i>                       </icon>

                  </li>
                  <li class="iconbutton  d-flex justify-content-center" onClick={reloadGridData}>
                    <icon
                      class="icon"
                    >
                      <i className="fa-solid fa-arrow-rotate-right"></i>
                    </icon>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2">
            <div className="row ms-3 mt-2 mb-3">
              {/* <div className="col-md-4 form-group mb-3">
              <div className="exp-form-floating">
                <label className="exp-form-labels partyName">
                  <strong> Project ID: </strong>{ProjectiD}
                </label>
              </div>
            </div> */}
              <div className="col-md-4 col-12 form-group mb-2">
                <div class="exp-form-floating d-flex justify-content-start">
                  <div class="d-flex justify-content-start ms-0">
                    <div>
                      <label for="sname" className={`${error && !ProjectID ? 'red' : ''} exp-form-labels partyName`}><strong>Project ID</strong> <span className="text-danger">*</span> :</label>
                    </div>
                  </div>
                  <Select
                    id="gradeid"
                    className="col-8 col-md-6 form-group mb-2 ms-2"
                    placeholder=""
                     required title="Please Select the Project ID"
                    onChange={handleChangeProject}
                    value={selectedProject}
                    options={filteredOptionProject}
                  />
                </div>
              </div>

              <div className="col-md-4 form-group mb-3">
                <div className="exp-form-floating">
                  <label className="exp-form-labels partyName">
                    <strong>Project Name:</strong>{ProjectName}
                  </label>
                </div>
              </div>

              <div className="col-md-4 form-group mb-3">
                <div className="exp-form-floating">
                  <label className="exp-form-labels partyName">
                    <strong>Project Manager:</strong>{Manager}
                  </label>
                </div>
              </div>
              <div className="col-md-4 form-group mb-3">
                <div className="exp-form-floating">
                  <label className="exp-form-labels partyName">
                    <strong> Start Date:</strong>{startDate}
                  </label>
                </div>
              </div>
              <div className="col-md-4 form-group mb-3">
                <div className="exp-form-floating">
                  <label className="exp-form-labels partyName">
                    <strong>End Date:</strong> {endDate}
                  </label>
                </div>
              </div>


            </div>

            <div className="row ms-3 me-3 mb-3">
              <div className="col-md-10 form-group mb-3">
                <div className="exp-form-floating d-flex">
                  <label className="exp-form-labels col-md-12 partyName">
                    <strong>Project Description:</strong> <textarea className=" exp-input-field " value={ProjectDescription} />
                  </label>

                </div>
              </div>

            </div>



            <div class=" mb-4">

              <div>

                <div className="row ms-3 me-3 mb-3">
                  <div className="col-md-3 form-group mb-2">
                    <div className="exp-form-floating">
                      <div className="d-flex justify-content-start">
                        <div>
                          <label htmlFor="EmployeeId "  className="exp-form-labels partyName">
                           <strong> Task Master ID  :</strong>{TaskMaster}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row ms-3 me-3 mb-3">


                  {/* <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div> <label for="add1"  className={`${error && !ProjectID ? 'red' : ''}`}>
                        Project ID
                        </label></div>
                        <div><span className="text-danger">*</span></div>
                      </div>
                      <input
                        id="LoanEligibleAmount"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        required title="Please enter the address"
                        value={ProjectID}
                        onChange={(e) => setProjectID(e.target.value)}
                        maxLength={50}


                      />
                    </div>
                  </div> */}






                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div> <label for="add1" className={`${error && !UserID ? 'red' : ''}exp-form-labels partyName`}>
                          <strong>User ID</strong><span className="text-danger">*</span>
                        </label></div>

                      </div>
                      <Select
                        id="LoanEligibleAmount"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        required title="Please enter the address"
                        onChange={handleChangeUser}
                        value={selectedUser}
                        options={filteredOptionUser}
                        maxLength={30}


                      />
                    </div>
                  </div>


                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div> <label for="add2" className={`${error && !Title ? 'red' : ''}`}>
                          Task Title
                        </label> </div>
                        <div><span className="text-danger">*</span></div>
                      </div>
                      <input
                        id="EffetiveDate"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        required title="Please enter the address"
                        value={Title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label for="sname" className={`${error && !StartDate ? 'red' : ''}`}>
                            Start Date
                          </label> </div>
                        <div><span className="text-danger">*</span></div>
                      </div>
                      <input
                        id="date"
                        class="exp-input-field form-control"
                        type="date"
                        placeholder=""
                        required title="Please enter the From Date"
                        value={StartDate}
                        onChange={(e) => setStartDate(e.target.value)}

                      />
                    </div>
                  </div>

                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label for="sname" className={`${error && !EndDate ? 'red' : ''}`}>
                            End Date
                          </label> </div>
                        <div><span className="text-danger">*</span></div>
                      </div>
                      <input
                        id="date"
                        class="exp-input-field form-control"
                        type="date"
                        placeholder=""
                        required title="Please enter the From Date"
                        value={EndDate}

                        onChange={(e) => setEndDate(e.target.value)}

                      />
                    </div>
                  </div>

                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="add3" className={`${error && !Endtime ? 'red' : ''}`}>
                        Estimated Hours<span className="text-danger">*</span>
                      </label><input
                        id="EndDate"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        required title="Please enter the address"
                        value={Endtime}
                        onChange={(e) => setEndtime(e.target.value)}
                        maxLength={100}

                      />
                    </div>
                  </div>

                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="add3" className={`${error && !buffer ? 'red' : ''}`}>
                        Buffer Hours <span className="text-danger">*</span>
                      </label><input
                        id="EndDate"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        required title="Please enter the address"
                        value={buffer}
                        onChange={(e) => setbuffer(e.target.value)}
                        maxLength={100}

                      />
                    </div>
                  </div>


                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="add3" className={`${error && !selectedtstatus ? 'red' : ''}`}>
                        Task Status <span className="text-danger">*</span>
                      </label>
                      <Select
                        id="taskstatus"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        value={selectedtstatus}
                        onChange={handleChangestatus}
                        options={filteredOptionTransaction}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 form-group mb-2">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div> <label for="tcode" className={`${error && !PriorityLevel ? 'red' : ''}`}>
                          Priority Level  </label></div>
                        <div><span className="text-danger">*</span></div></div>

                      <Select
                        id="PriorityLevel"
                        className="exp-input-field"
                        type="text"
                        placeholder=""
                        value={selectedPriortyLeavel}
                        onChange={handleChangePriorityLevel}
                        options={filteredOptionPriorityLevel}
                        maxLength={15}


                      />
                      {/* {error && !PriorityLevel && <div className="text-danger"></div>} */}

                    </div>
                  </div>
                  <div className="col-md-12 form-group ">
                    <div class="exp-form-floating">
                      <div class="d-flex justify-content-start">
                        <div>
                          <label For="city"  className={`${error && !Descriptions ? 'red' : ''}`}>Task Description</label>
                        </div>
                        <div><span className="text-danger">*</span></div>
                      </div>
                   
                      <textarea
                        id="HowManyMonth"
                        class="exp-input-field form-control"
                        type="text"
                        placeholder=""
                        value={Descriptions}
                        onChange={(e) => setDescriptions(e.target.value)}
                        style={{height:'150px'}}
                        required title="Please enter the address"

                      />
                   
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className=" shadow-lg bg-white rounded  mt-2  p-3">
            <h4 className="ms-4">Search Criteria :</h4>
            <div class="row ms-3 me-3 mb-3">
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div> <label for="add1" class="exp-form-labels">
                      Project ID
                    </label></div>

                  </div>
                  <input
                    id="LoanEligibleAmount"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the address"
                    value={Projectid}
                    onChange={(e) => setProjectid(e.target.value)}
                    maxLength={50}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div className="exp-form-floating">
                  <div className="d-flex justify-content-start">
                    <div>
                      <label htmlFor="EmployeeId" className="exp-form-labels">
                        Task Master ID
                      </label>
                    </div>
                    <div>
                    </div>
                  </div>
                  <div class="d-flex justify-content-end">
                    <input
                      id="EmployeeId"
                      className="exp-input-field form-control p-2"
                      type="text"
                      placeholder=""
                      required
                      title="Please enter the company code"
                      value={TaskMasterID}
                      onChange={(e) => setTaskMasterID(e.target.value)}
                      maxLength={20}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div> <label for="add1" class="exp-form-labels">
                      User ID
                    </label></div>
                  </div>
                  <input
                    id="LoanEligibleAmount"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the address"
                    value={userid}
                    onChange={(e) => setUserid(e.target.value)}
                    maxLength={30}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div> <label for="add2" class="exp-form-labels">
                      Task Title
                    </label> </div>
                  </div>
                  <input
                    id="EffetiveDate"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    required title="Please enter the address"
                    value={TaskTitle}
                    onChange={(e) => settitle(e.target.value)}
                    maxLength={100}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <label for="add3">
                    Task Status
                  </label>
                  <Select
                    id="taskstatus"
                    class="exp-input-field form-control"
                    type="text"
                    placeholder=""
                    value={selectedtstatusSC}
                    onChange={handleChangestatusSC}
                    options={filteredOptionTransactionSC}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label for="sname" class="exp-form-labels">
                        Start Date
                      </label> </div>
                  </div>
                  <input
                    id="date"
                    class="exp-input-field form-control"
                    type="date"
                    placeholder=""
                    required title="Please enter the From Date"
                    value={startdate}
                    onChange={(e) => setstartdate(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3 form-group mb-2">
                <div class="exp-form-floating">
                  <div class="d-flex justify-content-start">
                    <div>
                      <label for="sname" class="exp-form-labels">
                        End Date
                      </label> </div>

                  </div>
                  <input
                    id="date"
                    class="exp-input-field form-control"
                    type="date"
                    placeholder=""
                    required title="Please enter the From Date"
                    value={enddate}

                    onChange={(e) => setenddate(e.target.value)}

                  />
                </div>
              </div>
              <div className="col-md-2 form-group mt-4">
                <div class="exp-form-floating">
                  <div class=" d-flex justify-content-center ">
                    <div class="">
                      <icon
                        className="popups-btn fs-6 p-3"
                        onClick={handleSearch}
                        required
                        title="Search"
                      >
                        <i className="fas fa-search"></i>
                      </icon>
                    </div>
                    <div>
                      <icon
                        className="popups-btn fs-6 p-3"
                        required
                        onClick={reloadGridDatas}
                        title="Refresh"
                      >
                        <i class="fa-solid fa-rotate-right"></i>
                      </icon>
                    </div>
                  </div>{" "}
                </div>
              </div>
            </div>



            <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
              <AgGridReact
                columnDefs={columnDefs}
                // defaultColDef={defaultColDef}
                rowData={rowData}  // Pass the rowData to AgGridReact
                pagination={true}
                paginationAutoPageSize={true}
                onCellValueChanged={onCellValueChanged}
                onSelectionChanged={onSelectionChanged}
                suppressRowClickSelection={true}
                onGridReady={onGridReady}
                gridOptions={gridOptions}

              // onCellClicked={(params) => handleNavigateWithRowData(params.data)}
              />
            </div>
            <div>
            </div>



          </div>


        </div>
      </div>


    </div>

  );



}
export default Input;
