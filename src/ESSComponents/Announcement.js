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
import Select from 'react-select'
import { showConfirmationToast } from '../ToastConfirmation';
import { AgGridReact } from "ag-grid-react";

const config = require('../Apiconfig');

function Input({ }) {
 
  const [annualreportURL, setAnnualReportURL] = useState("");
  const [error, setError] = useState("");
  const [StatusDrop, setStatusDrop] = useState([]);
  const [statusdrop, setstatusdrop] = useState([]);
  const [statusgriddrop, setStatusGriddrop] = useState([]);
  const [TypeGridDrop, setTypeGridDrop] = useState([]);
  const [DetailsGridDrop, setDetailsGridDrop] = useState([]);
  const [MsgTypeGridDrop, setMsgTypeGridDrop] = useState([]);
  const [DurationGridDrop, setDurationGridDrop] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedstatus, setselectedstatus] = useState('');
  const[Announcementid,setAnnouncementid]=useState('');
  const[Announcement,setAnnouncement]=useState('');
  const[announcement,setannouncement]=useState('');
 const[messagetitle,setmessagetitle]=useState('');
 const[startdate,setstartdate]=useState('');
 const[enddate,setenddate]=useState('');
 const[Start_Time,setstarttime]=useState('');
 const[End_Time, setendtime]=useState('');
  const [IDdrop, setIDdrop] = useState([]);
  const [rowData, setrowData] = useState([]);
  const [saveButtonVisible, setSaveButtonVisible] = useState(true);
  const [editedData, setEditedData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showAsterisk, setShowAsterisk] = useState(true);
  

  
 
 
  const navigate = useNavigate();
  
  const WebsiteUrl = useRef(null);
  
  const found = useRef(null);
  const [hasValueChanged, setHasValueChanged] = useState(false);
  
  
  const location = useLocation();
  const { mode } = location.state || {};
  const [type, settype] = useState("");
  const [Type, setType] = useState("");
  const [typedrop, settypedrop] = useState([]);
  const [TypeDrop, setTypeDrop] = useState([]);
  const [selectDetails, setselectedDetails] = useState("");
  const [selectdetails, setselecteddetails] = useState("");
  const [Details,setDetails] = useState("");
  const [details,setdetails] = useState("");
  const [Detailsdrop, setDetailsrop] = useState([]);
  const [detailsdrop, setdetailsdrop] = useState([]);
  const [MessageType, setMessageType] = useState("");
  const [messagetype, setmessagetype] = useState("");
  const [selectedMessageType,setselectedMessageType]=useState('');
  const [selectedmessagetype,setselectedmessagetype]=useState('');
   const [isUpdateMode, setIsUpdateMode] = useState(false);
  const[Status,setStatus]=useState('');
  const[status,setstatus]=useState('');
  const[SelectedAnnouncement_id,setselectedAnnouncement_id]=useState('');
  const[selectedAnnouncement,setselectedAnnouncement]=useState('');
  const[selectedannouncement,setselectedannouncement]=useState('');
  const[AnnouncementDrop,setAnnouncementDrop]=useState([]);
  const[announcementdrop,setannouncementdrop]=useState([]);
  const[MsgTypeDrop,setMsgTypeDrop]=useState('');
  const[msgtypedrop,setmsgtypedrop]=useState('');
  const[RequestfordoNotShowAgainOption,setRequestfordoNotShowAgainOption]=useState("");
  const[companycode, setCompanycode]=useState("");

//filter option
  const [Announcement_id, setAnnouncement_id] = useState("");
  const [SelectType, setSelectType] = useState("");
  const [selecttype, setselecttype] = useState("");
  const [SelectDetails, setSelectDetails] = useState(null);
  const [AnnouncementValidFor, setAnnouncementValidfor] = useState("");
  const [Start_Date, setstartDate] = useState("");
  const [End_Date, setEndDate] = useState("");
  const [Start_time, setstart_time] = useState("");
  const [endtime, setend_time] = useState("");
  const [MessageTitle, setmessageTitle] = useState("");
  const [selectedAnnouncementvalid,setselectedAnnouncementvalid]=useState("");
  
  const gridApiRef = useRef(null);
    const gridColumnApiRef = useRef(null);
     

  
  const columnDefs = [
   { headerName: "Actions",
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
    
    headerName: "Announcement Id",
    field: "Announcement_id",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 150,
    // maxWidth: 150,
    cellEditorParams: {
      maxLength: 18,
    },
  },
  {
    headerName: "Select Type",
    field: "SelectType",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 150,
    // maxWidth: 150,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: TypeGridDrop,      
      maxLength: 250,
    },
  },
  {
    headerName: "Select Details",
    field: "SelectDetails",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 150,
    
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: DetailsGridDrop,
      maxLength: 10,
    },
  },

  {
    headerName: "Announcement Duration",
    field: "AnnouncementValidFor",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 150,
    cellEditor: "agSelectCellEditor",

    cellEditorParams: {
      values:DurationGridDrop,
      maxLength: 10,
    },
  },
  {
    headerName: "Message Type",
    field: "Messagetype",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 150,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: MsgTypeGridDrop,
      maxLength: 10,
    },
  },

  {
    headerName: "Message Title",
    field: "MessageTitle",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 150,
    // maxWidth: 150,
    cellEditorParams: {
      maxLength: 250,
    },
  },
  {
    headerName: "Status",
    field: "status",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 150,
    // maxWidth: 150,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: statusgriddrop,
         maxLength: 250,
    },
  },
  {
    headerName: "Request for Do Not Show Again",
    field: "RequestfordoNotShowAgainOption",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 150,
    // maxWidth: 150,
    cellEditorParams: {
      maxLength: 250,
    },
  },
  {
    headerName: "Start Date",
    field: "Start_Date",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 250,
    // maxWidth: 250,
    //  filter: 'agDateColumnFilter',
    valueFormatter: (params) => formatDate(params.value),  // Format the date for display
      filterParams: {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          // Format the cell value and filter value to compare
          const cellDate = new Date(cellValue.split('/').join('-')); // Convert DD/MM/YYYY to a Date object
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
      }, },
  //   // cellEditorParams: {
  //   //   maxLength: 250,
  //   // },
  // },

  {
    headerName: "Start Time",
    field: "Start_Time",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 250,
    // maxWidth: 250,
    cellEditorParams: {
      maxLength: 250,
    },
  },

  {
    headerName: "End Date",
    field: "End_Date",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 250,
    // maxWidth: 250,
    //  filter: 'agDateColumnFilter',
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
    headerName: "End Time",
    field: "End_Time",
    editable: true,
    cellStyle: { textAlign: "left" },
    // minWidth: 250,
    // maxWidth: 250,
    cellEditorParams: {
      maxLength: 250,
    },
  },
];

const gridOptions = {
  pagination: true,
  paginationPageSize: 10,
};


// const defaultColDef = {
//   resizable: true,
//   wrapText: true,
//   // sortable: true,
//   //editable: true,
//   flex: 1,
//   // filter: true,
//   // floatingFilter: true,
// };


const handleSearch = async () => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/AnnouncementSearchCretria`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Announcement_id:Announcement_id,
        SelectType:type,
        SelectDetails:details,
        AnnouncementValidFor:announcement,
        Messagetype: messagetype  ,
        RequestfordoNotShowAgainOption:RequestfordoNotShowAgainOption,
        MessageTitle:MessageTitle,
        status: status,
        Start_Date: startdate,
        Start_Time:Start_Time,                    
        End_Date: enddate,
        End_Time: End_Time,
        company_code:sessionStorage.getItem('selectedCompanyCode'),
      })
    });
    if (response.ok) {
      const searchData = await response.json();
      setrowData(searchData);
      console.log("Data fetched successfully");
    } else if (response.status === 404) {
      console.log("Data not found");
      toast.warning("Data not found");
      setrowData([]);
    } else {
      const errorResponse = await response.json();
      toast.warning(errorResponse.message || "Failed to insert data");
    }
  } catch (error) {
    console.error("Error saving data:", error);
    toast.error("Error updating data: " + error.message);
  }
};



  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.account_code === params.data.account_code // Use the unique identifier 
    );
    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setrowData(updatedRowData);

      // Add the edited row data to the state
      setEditedData((prevData) => [...prevData, updatedRowData[rowIndex]]);
    }
  };
  const reloadGridData = () => {
    window.location.reload();
  };
  const reloadData = () => {
    setrowData([])
   };


  const onSelectionChanged = () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };


 

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })

      .then((data) => data.json())
        .then((val) => {
          setStatusDrop(val)
          setstatusdrop(val)
      
      });
  }, []);

  
  const filteredOptionStatus = StatusDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredoptionstatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));


  
  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    
    fetch(`${config.apiBaseUrl}/status`, {
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
 

  const handleChangeStatus = (Status) => {
    setSelectedStatus(Status);
    setStatus(Status ? Status.value : '');
    // setError(false);
  };

  const handlechangestatus = (status) => {
    setselectedstatus(status);
    setstatus(status ? status.value : '');
    // setError(false);
  };

  
   const handleSave = async () => {
      // Validate required fields 
      if (
        !Announcementid ||
        !Type ||
        !Details ||
        !Announcement ||
        !MessageType ||
        !messagetitle ||
        !Status
       
      ) 
    {
      setError(" ");
          //  toast.warning("Error: Missing required fields");
              return;
      }
      try {
        const Header = {
          Announcement_id:Announcementid,
          SelectType: Type,
          SelectDetails:Details,
          AnnouncementValidFor:Announcement,
          Messagetype: MessageType,
          RequestfordoNotShowAgainOption:RequestfordoNotShowAgainOption,
          MessageTitle:messagetitle,
          status: Status,
          Start_Date:startdate,
          Start_Time: Start_Time,
          End_Date:enddate,
          End_Time: End_Time,
          company_code:sessionStorage.getItem('selectedCompanyCode'),
          created_by: sessionStorage.getItem('selectedUserCode'),
        };
    
        const response = await fetch(`${config.apiBaseUrl}/addAnnounmentdetails`, {
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
          toast.warning(errorResponse.message || "Failed to insert announcement data");
          console.error(errorResponse.details || errorResponse.message);
        }
      } catch (error) {
        console.error("Error inserting data:", error);
        toast.error('Error inserting data: ' + error.message);
      }
    };
  const saveEditedData = async () => {

    try {
      const company_code = sessionStorage.getItem('selectedCompanyCode');
      const modified_by = sessionStorage.getItem('selectedUserCode');

      const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };

        const response = await fetch(`${config.apiBaseUrl}/updateAnnouncementDetails`, {
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

  
 const deleteSelectedRows = async (rowData) => {
  const company_code = sessionStorage.getItem('selectedCompanyCode');
  const dataToSend = { editedData: Array.isArray(rowData) ? rowData : [rowData] };
  showConfirmationToast(
    "Are you sure you want to delete the data in the selected rows?",
    async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/deleteAnnouncement`, {
          method: "POST",
          headers: {
         "Content-Type": "application/json",
            "company_code":company_code
          },
          body: JSON.stringify(dataToSend),
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
  


     
  // function validateEmail(email) {
  //   const emailRegex = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;
  //   return emailRegex.test(email);
  // }


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

  // const handleKeyPress = (e) => {
  //   if (e.key === 'Enter') {
  //     handleRefNo(Announcement_id);
  //   }
  // };
  
  
  
  const handlechangetype = (selecttype) => {
    setselecttype(selecttype);
    settype(selecttype ? selecttype.value : '');
    setError(false);
  };
  const handleChangeType = (SelectType) => {
    setSelectType(SelectType);
    setType(SelectType ? SelectType.value : '');
    setError(false);
  };

  const filteredOptiontype = typedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));
  const filteredOptionType = TypeDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));


  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getannoncementtype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })
      .then((data) => data.json())
      .then((val) => {
        settypedrop(val)
        setTypeDrop(val)

      });
  }, []);
  
  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    
    fetch(`${config.apiBaseUrl}/getannoncementtype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })     
     .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const TypeOption = data.map(option => option.attributedetails_name);
        setTypeGridDrop(TypeOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
 

 
  useEffect(() => {
       fetch(`${config.apiBaseUrl}/getAnnouncementDetail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })
      .then((data) => data.json())
      .then((val) => {
        setDetailsrop(val)
        setdetailsdrop(val)
      });
  }, []);


  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    
    fetch(`${config.apiBaseUrl}/getAnnouncementDetail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })     
     .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const DetailsOption = data.map(option => option.attributedetails_name);
        setDetailsGridDrop(DetailsOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
 

  const filteredOptionDetails = Detailsdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));
  const filteredoptiondetails = detailsdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeDetails = (selectDetails) => {
    setselectedDetails(selectDetails);
    setDetails(selectDetails ? selectDetails.value : '');
  };
  
  const handlechangedetails = (selectdetails) => {
    setselecteddetails(selectdetails);
    setdetails(selectdetails ? selectdetails.value : '');
  };

 
  useEffect(() => {
       fetch(`${config.apiBaseUrl}/getAnnouncement_Msg`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })
      .then((data) => data.json())
      .then((val) => {
        setMsgTypeDrop(val)
        setmsgtypedrop(val)
  });
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    
    fetch(`${config.apiBaseUrl}/getAnnouncement_Msg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })     
     .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const MsgTypeOption = data.map(option => option.attributedetails_name);
        setMsgTypeGridDrop(MsgTypeOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
 

  const filteredOptionMsgType = Array.isArray(MsgTypeDrop) 
  ? MsgTypeDrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
  : []; 

  const filteredoptionmsgtype = Array.isArray(msgtypedrop) 
  ? msgtypedrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
  : []; 
  

  const handleChangeMsgType = (selectedMessageType) => {
    setselectedMessageType(selectedMessageType);
    setMessageType(selectedMessageType ? selectedMessageType.value : '');
  };
  const handlechangemsgtype = (selectedmessagetype) => {
    setselectedmessagetype(selectedmessagetype);
    setmessagetype(selectedmessagetype ? selectedmessagetype.value : '');
  };


  useEffect(() => {
     fetch(`${config.apiBaseUrl}/getAnnouncementDuration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      company_code: sessionStorage.getItem("selectedCompanyCode"),

      }),
  })      .then((data) => data.json())
      .then((val) =>{
         setannouncementdrop(val)
      setAnnouncementDrop(val)
    });
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem('selectedCompanyCode');
    
    fetch(`${config.apiBaseUrl}/getAnnouncementDuration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company_code })
    })     
     .then((response) => response.json())
      .then((data) => {
        // Extract city names from the fetched data
        const DurationOption = data.map(option => option.attributedetails_name);
        setDurationGridDrop(DurationOption);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  const handleChangeAnnouncement = (selectedAnnouncement) => {
    setselectedAnnouncement(selectedAnnouncement);
    setAnnouncement(selectedAnnouncement ? selectedAnnouncement.value : '');
  };
  const handleChangeannouncement = (selectedannouncement) => {
    setselectedannouncement(selectedannouncement);
    setannouncement(selectedannouncement ? selectedannouncement.value : '');
  };
  
  const filteredOptionAnnouncement = Array.isArray(AnnouncementDrop)
  ? AnnouncementDrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
  : [];
  const filteredoptionannouncement = Array.isArray(announcementdrop)
  ? announcementdrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
  : [];


  //search option filter


  // const handletype = (selected_type) => {
  //   setSelected_Type(selected_type);
  //   settype(selected_type ? selected_type.value : '');
  //   setError(false);
  // };

  const filteredtype = typedrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const filteredDetails = Detailsdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleDetails = (select_details) => {
    setSelectDetails(select_details);
    setDetails(select_details? select_details.value : '');
  };

  const handleAnnouncement = (selectedAnnouncement) => {
    setselectedAnnouncementvalid(selectedAnnouncement);
    setAnnouncementValidfor(selectedAnnouncement ? selectedAnnouncement.value : '');
  };
  
 



 
  const filteredStatus = statusdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

 

  const handleStatus = (Status) => {
    setstatus(Status);
    setStatus(Status ? Status.value : '');
    // setError(false);
  };


  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (isoTimeString) => {
    const time = new Date(isoTimeString);
    const hours = String(time.getUTCHours()).padStart(2, '0');
    const minutes = String(time.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
         <div className="shadow-lg p-0 bg-white rounded mb-2">
            <div className="purbut mb-0 d-flex justify-content-between" >
              <h1 align="left" class="purbut">Add Announcement</h1>
            
            <div className="col-md-1 mt-3 me-5 purbut">

<div class=" d-flex justify-content-end  me-3">
  <div >
    {/* <savebutton class=" text-dark"  onClick={handleNavigateToForm}
>
        
          <i class="fa-solid fa-user-plus"></i>
          {" "}
      
    </savebutton> */}
  </div>
  <div className="me-1 ">

    {saveButtonVisible && (
      <savebutton className="" onClick={handleSave}
      
        required title="save">
        <i class="fa-regular fa-floppy-disk"></i> </savebutton>
    )}


  </div>
  <div className="ms-1">
    {/* <delbutton 
// onClick={handleDelete} 
title="Delete" onClick={handleDelete} >
<i class="fa-solid fa-trash"></i>
</delbutton> */}
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
</div></div>

          </div>




           <div class=" mb-4">
            <div className="shadow-lg p-3 bg-light rounded-3  mb-2">
              <div class="row ms-2 me-2">
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="cname" className={`${error && !Announcementid ? 'red' : ''}`}> Announcement ID {showAsterisk && <span className="text-danger">*</span>}</label>
                      </div>
                      {/* <div>
                        <span className="text-danger">*</span></div> */}
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Announcement ID "
                      value={Announcementid}
                      ref={found}
                      onChange={(e) => setAnnouncementid(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                      // onKeyDown={handleKeyPress}
                    />
                    {/* {error && !Announcementid && <div className="text-danger"> Announcement ID should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname" className={`${error && !SelectType ? 'red' : ''}`}>Select Type {showAsterisk && <span className="text-danger">*</span>}</label>
                        
                        </div>
                    </div>
                    <Select
                  id="SelectType"
                  className="exp-input-field"
                  value={SelectType}
                  onChange={handleChangeType}
                  options={filteredOptionType}
                  required title="Please Select the Type"

                    
                 />

              {/* {error && !selectedtype && <div className="text-danger">Select Type should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1"className={`${error && !selectDetails ? 'red' : ''}`}> Select Details {showAsterisk && <span className="text-danger">*</span>}</label>
                        
                      </div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <Select
                      id="SelectDetails"
                      class="exp-input-field form-control"
                      required title="Please Select the Details"
                      value={selectDetails}
                  onChange={handleChangeDetails}
                  options={filteredOptionDetails}
                    />
                    {/* {error && !selectDetails && <div className="text-danger">Select Details should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                  
                      <div> <label for="add1" className={`${error && !selectedAnnouncement ? 'red' : ''}`}>  Announcement Duration {showAsterisk && <span className="text-danger">*</span>}</label>
                        
                      </div>
                      
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <Select
                      id="SelectDetails"
                      class="exp-input-field form-control"
                      required title="Please Select the Announcement Duration"
                      value={selectedAnnouncement}
                  onChange={handleChangeAnnouncement}
                  options={filteredOptionAnnouncement}
                    />
                    {/* {error && !selectedAnnouncement                 
 && <div className="text-danger">Select Details should not be blank</div>} */}
                  </div> 
                </div>
              
                {selectedAnnouncement.label === "Day" && (
                    <div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" className={`${error && !startdate ? 'red' : ''}`}>  Start Date {showAsterisk && <span className="text-danger">*</span>}</label>
                        
                      </div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the Date"
                      value={startdate}
                      ref={found}
                      onChange={(e) => setstartdate(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    />
                    {/* {error && !Start_Date && <div className="text-danger">Announcement Duration should not be blank</div>} */}
                  </div>
                

                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" className={`${error && !enddate ? 'red' : ''}`}>End Date{showAsterisk && <span className="text-danger">*</span>}</label>
                        
                      </div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the Date"
                      value={enddate}
                      onChange={(e) =>setenddate(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    />
                    {/* {error && !End_Date && <div className="text-danger">End_Date should not be blank</div>} */}
                  </div>
                </div>
                </div>
                )}

               {selectedAnnouncement.label === "Time" && (
                <div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1"className={`${error && !Start_Time ? 'red' : ''}`}> Start Time {showAsterisk && <span className="text-danger">*</span>}</label>
                      
                      </div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="time"
                      placeholder=""
                      required title="Please enter the Time"
                      value={Start_Time}
                      ref={found}
                      onChange={(e) => setstarttime(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    />
                    {/* {error && !Start_Time && <div className="text-danger">Announcement Duration should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" className={`${error && !End_Time ? 'red' : ''}`}> End Time {showAsterisk && <span className="text-danger">*</span>}</label>
                       
                      </div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="time"
                      placeholder=""
                      required title="Please enter the Time"
                      value={End_Time}
                      ref={found}
                      onChange={(e) => setendtime(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    />
                    {/* {error && !End_Time && <div className="text-danger">EndDate should not be blank</div>} */}
                  </div>
                </div>
                </div>
              )
}
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> 
                        <label for="add1" className={`${error && !selectedMessageType ? 'red' : ''}`}> Message Type {showAsterisk && <span className="text-danger">*</span>}</label>
                       
                      
                      </div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <Select
                      id="MessageType"
                      value={selectedMessageType}
                      onChange={handleChangeMsgType}
                      options={filteredOptionMsgType}
                      className="exp-input-field"
                      required title="Please Select the Message Type"
                   
                    />
        
                  </div>
                </div>
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" className={`${error && !messagetitle ? 'red' : ''}`}> Message Title {showAsterisk && <span className="text-danger">*</span>}</label>
                      
                      </div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Message Title"
                      value={messagetitle}
                      ref={found}
                      onChange={(e) => setmessagetitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    />
                    {/* {error && !MessageTitle && <div className="text-danger">Message Title should not be blank</div>} */}
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                         <label for="add1" className={`${error && !selectedStatus ? 'red' : ''}`}>Status {showAsterisk && <span className="text-danger">*</span>}</label>
                        
                      </div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <Select
                      id="status"
                      required title="Please Select the Status"
                      value={selectedStatus}
                      onChange={handleChangeStatus}
                      options={filteredOptionStatus}

                      className="exp-input-field"
                   
                    />
                    {/* {error && !selectedStatus && <div className="text-danger">Status should not be blank</div>} */}
                  </div>
                </div>

              
                
               
               
                
             
               
                
                

               
               
                
                <div class="col-md-3 form-group d-flex justify-content-start mt-4 mb-4">
                 
                   
                    {/* <button onClick={handleUpdate}>update</button>
                   
              <button onClick={handleDelete}>Delete</button> */}

                 
                </div>
              </div>
            </div>

            <div className="shadow-lg p-3 bg-light rounded-3  mb-5">
              <div class="row ms-2 me-2">
            <h6 className="">Search Criteria:</h6>
            <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div><label for="cname" class="exp-form-labels">
                      Announcement ID
                      </label></div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Announcement ID"
                      value={Announcement_id}
                      ref={found}
                      onChange={(e) => setAnnouncement_id(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                      // onKeyDown={handleKeyPress}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}

                    />
                    {/* {error && !Announcement_id && <div className="text-danger"> Announcement ID should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div>
                        <label for="sname" class="exp-form-labels">
                        Select Type
                        </label> </div>
                    </div>
                    <Select
                  id="SelectType"
                  required title="Please Select the Type"
                  className="exp-input-field"
                  value={selecttype}
                  onChange={handlechangetype}
                  options={filteredOptiontype}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    
                 />

              {/* {error && !selectedtype && <div className="text-danger">Select Type should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        Select Details
                      </label></div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <Select
                      id="SelectDetails"
                      required title="Please Select the Details"
                      class="exp-input-field form-control"
                      value={selectdetails}
                  onChange={handlechangedetails}
                  options={filteredoptiondetails}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {/* {error && !selectDetails && <div className="text-danger">Select Details should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                  
                      <div> <label for="add1" class="exp-form-labels">
                      Announcement Duration
                      </label></div>
                      
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <Select
                      required title="Please Select the  Announcement Duration"
                      id="SelectDetails"
                      class="exp-input-field form-control"
                      value={selectedannouncement}
                  onChange={handleChangeannouncement}
                  options={filteredoptionannouncement}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div> 
                </div>
              
                {selectedAnnouncementvalid.label === "Day" && (
                    <div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        Start Date
                      </label></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the Date"
                      value={Start_Date}
                      ref={found}
                      onChange={(e) => setstartDate(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {/* {error && !Start_Date && <div className="text-danger">Announcement Duration should not be blank</div>} */}
                  </div>
                

                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        End Date
                      </label></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="date"
                      placeholder=""
                      required title="Please enter the Date"
                      value={End_Date}
                      onChange={(e) =>setEndDate(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                    />
                    {/* {error && !End_Date && <div className="text-danger">End_Date should not be blank</div>} */}
                  </div>
                </div>
                </div>
                )}

               {selectedAnnouncementvalid.label === "Time" && (
                <div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        Start Time
                      </label></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="time"
                      placeholder=""
                      required title="Please enter the Time"
                      value={Start_time}
                      ref={found}
                      onChange={(e) => setstart_time(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      

                    />
                    {/* {error && !Start_Time && <div className="text-danger">Announcement Duration should not be blank</div>} */}
                  </div>
                </div>
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        End Time
                      </label></div>
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="time"
                      placeholder=""
                      required title="Please enter the Time"
                      value={endtime}
                      ref={found}
                      onChange={(e) => setend_time(e.target.value)}
                      // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {/* {error && !End_Time && <div className="text-danger">EndDate should not be blank</div>} */}
                  </div>
                </div>
                </div>
              )
}
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        Message Type
                      </label></div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <Select
                      id="MessageType"
                      required title="Please Select the Message Type"
                      value={selectedmessagetype}
                      onChange={handlechangemsgtype}
                      options={filteredoptionmsgtype}
                      className="exp-input-field"
                      // onChange={(e) => setend_Time(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                   
                    />
                    {/* {error && !selectedMessageType&& <div className="text-danger">Message Type should not be blank</div>} */}
                  </div>
                </div>
                
                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        Message Title
                      </label></div>
                      {/* <div><span className="text-danger">*</span></div> */}
                    </div>
                    <input
                      id="fdate"
                      class="exp-input-field form-control"
                      type="text"
                      placeholder=""
                      required title="Please enter the Message Title"
                      value={MessageTitle}
                      ref={found}
                      onChange={(e) => setmessageTitle(e.target.value)}
                      // // onKeyDown={(e) => handleKeyDown(e, WebsiteUrl, found)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    {/* {error && !MessageTitle && <div className="text-danger">Message Title should not be blank</div>} */}
                  </div>
                </div>

                <div className="col-md-3 form-group mb-2">
                  <div class="exp-form-floating">
                    <div class="d-flex justify-content-start">
                      <div> <label for="add1" class="exp-form-labels">
                        Status
                      </label></div>
                      {/* <div>
                        <span className="text-danger">*</span></div> */}
                    </div>
                    <Select
                      id="status"
                      value={selectedstatus}
                      onChange={handlechangestatus}
                      options={filteredoptionstatus}
                      required title="Please Select the Status"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      // onChange={(e) => setend_Time(e.target.value)}
                      className="exp-input-field"
                   
                    />
                    {/* {error && !status && <div className="text-danger">Status should not be blank</div>} */}
                  </div>
                </div>

                <div className="col-md-2 form-group mt-3 mb-3">
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
                              onClick={reloadData}
                              title="Refresh"
                            >
                              <i class="fa-solid fa-rotate-right"></i>
                            </icon>
                          </div>
                          </div>
                          </div>
                          </div>
          </div>
        
   <div class="ag-theme-alpine mt-3" style={{ height: 485, width: "100%" }}>
                            <AgGridReact
                              rowData={rowData}
                              columnDefs={columnDefs}
                              // defaultColDef={defaultColDef}
                            
                              pagination={true}
                              gridOptions={gridOptions}
                              paginationAutoPageSize={true}
                              // onGridReady={(params) => {
                              //   gridApiRef.current = params.api;
                              //   gridColumnApiRef.current = params.columnApi;
                              // }}
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
