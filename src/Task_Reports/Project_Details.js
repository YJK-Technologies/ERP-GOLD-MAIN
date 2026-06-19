import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


const MyAgGridComponent = () => {
  const [rowData] = useState([
    { taskTitle: 'Task 1', user: 'User 1', description: 'Task 1 description', startDate: '2025-02-01', endDate: '2025-02-05', estimatedHours: 8, bufferHours: 2, totalHours: 10, taskStatus: 'Completed' },
    { taskTitle: 'Task 2', user: 'User 2', description: 'Task 2 description', startDate: '2025-02-02', endDate: '2025-02-06', estimatedHours: 10, bufferHours: 3, totalHours: 13, taskStatus: 'In Progress' },
    { taskTitle: 'Task 3', user: 'User 3', description: 'Task 3 description', startDate: '2025-02-03', endDate: '2025-02-07', estimatedHours: 5, bufferHours: 1, totalHours: 6, taskStatus: 'Not Started' },
  ]);

  const columnDefs = [
    { headerName: 'S.No', field: 'taskTitle' },
    { headerName: 'Project Code', field: 'user' },
    { headerName: 'Project Name', field: 'description' },
    { headerName: 'Estimated Hours', field: 'estimatedHours' },
    { headerName: 'Hours Taken', field: 'totalHours' },
    { headerName: 'Project Description', field: 'description' },
  ];

  const columnDefs2 = [
    { headerName: 'S.No', field: 'taskTitle' },
    { headerName: 'Task Master ID', field: 'user' },
    { headerName: 'Task Title ', field: 'taskTitle' },
    { headerName: 'Hours Taken', field: 'totalHours' },
    { headerName: 'Estimated Hours', field: 'estimatedHours' },
    { headerName: 'Description', field: 'description' }
   
  ];


  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
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

<div className=" p-0 shadow-lg bg-white rounded mb-2">
          <div className="purbut mb-0 d-flex justify-content-between">
        <h1 align="left" className="">
                Project Progress
        </h1></div></div>
        <div className=" p-0 shadow-lg bg-white rounded">



<div className='pt-3 pb-3'>
    <div className="ag-theme-alpine" style={{ height: 300, width: '90%' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        gridOptions={gridOptions}
        
      />
    </div>
    </div>
    <div className='pt-3 pb-3'>
    <div className="ag-theme-alpine" style={{ height: 300, width: '90%' }}>
      <AgGridReact
        columnDefs={columnDefs2}
        rowData={rowData}
        gridOptions={gridOptions}
        
      />
    </div>
    </div>
    </div>
    </div>  </div></div>
  );
};

export default MyAgGridComponent;
