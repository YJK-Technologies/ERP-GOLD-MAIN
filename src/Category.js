// Category.js
import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { showConfirmationToast } from "./ToastConfirmation";
import LoadingScreen from "./Loading";

const config = require("./Apiconfig");

function CategoryScreen() {
  const [editedData, setEditedData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter States
  const [Item_Category_Code, setItem_Category_Code] = useState("");
  const [Item_Category_Name, setItem_Category_Name] = useState("");
  const [Item_Category_Description, setItem_Category_Description] = useState("");
  const [Region_Code, setRegion_Code] = useState("");
  const [Display_Order, setDisplay_Order] = useState("");
  const [Is_Default, setDefault] = useState("");
  const [status, setStatus] = useState("");

  // Dropdown Option States
  const [defaultDrop, setDefaultDrop] = useState([]);
  const [statusdrop, setStatusdrop] = useState([]);
  const [suomdrop, setSuomdrop] = useState([]);
  const [statusgriddrop, setStatusGriddrop] = useState([]);

  const [selectedDefault, setSelectedDefault] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Audit Logs
  const [createdBy, setCreatedBy] = useState("");
  const [modifiedBy, setModifiedBy] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [modifiedDate, setModifiedDate] = useState("");

  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || [];
  const itemPermissions = permissions
    .filter((p) => p.screen_type === "Item")
    .map((p) => p.permission_type.toLowerCase());

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");
    const location_code = sessionStorage.getItem("selectedLocationCode");
    const reqOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_code, location_code }),
    };

    fetch(`${config.apiBaseUrl}/getDefault`, reqOptions)
      .then((data) => data.json())
      .then((val) => setDefaultDrop(val))
      .catch((error) => console.error("Error fetching Default options:", error));

    fetch(`${config.apiBaseUrl}/status`, reqOptions)
      .then((data) => data.json())
      .then((val) => setStatusdrop(val))
      .catch((error) => console.error("Error fetching Status:", error));

    fetch(`${config.apiBaseUrl}/uom`, reqOptions)
      .then((data) => data.json())
      .then((data) => {
        const versionOptions = data.map((option) => option.attributedetails_name);
        setSuomdrop(versionOptions);
      })
      .catch((error) => console.error("Error fetching Version/UOM:", error));
  }, []);

  useEffect(() => {
    const company_code = sessionStorage.getItem("selectedCompanyCode");

    fetch(`${config.apiBaseUrl}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_code }),
    })
      .then((response) => response.json())
      .then((data) => {
        const statusOption = data.map((option) => option.attributedetails_name);
        setStatusGriddrop(statusOption);
      })
      .catch((error) => console.error("Error fetching grid status:", error));
  }, []);

  // Restore search inputs when navigating back from AddCategory
  useEffect(() => {
    if (location.state?.preservedInputs) {
      const inputs = location.state.preservedInputs;

      setItem_Category_Code(inputs.Item_Category_Code || "");
      setItem_Category_Name(inputs.Item_Category_Name || "");
      setItem_Category_Description(inputs.Item_Category_Description || "");
      setRegion_Code(inputs.Region_Code || "");
      setDisplay_Order(inputs.Display_Order || "");
      setDefault(inputs.Is_Default || "");
      setStatus(inputs.status || "");

      if (inputs.Is_Default) {
        setSelectedDefault({
          label: inputs.Is_Default,
          value: inputs.Is_Default,
        });
      }

      if (inputs.status) {
        setSelectedStatus({
          label: inputs.status,
          value: inputs.status,
        });
      }

      if (location.state?.refreshGrid) {
        handleSearch(inputs);
      }
    }
  }, [location.state]);

  const filteredOptionDefault = defaultDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.descriptions || option.attributedetails_name,
  }));

  const filteredOptionStatus = [
    { value: "All", label: "All" },
    ...statusdrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.descriptions || option.attributedetails_name,
    })),
  ];

  const handleChangeDefault = (selected) => {
    setSelectedDefault(selected);
    setDefault(selected ? selected.value : "");
  };

  const handleChangeStatus = (selected) => {
    setSelectedStatus(selected);
    setStatus(selected ? selected.value : "");
  };

  const handleSearch = async (searchParams = null) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/Categorysearch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_code: sessionStorage.getItem("selectedCompanyCode"),
          location_code: sessionStorage.getItem("selectedLocationCode"),
          Item_Category_Code: searchParams?.Item_Category_Code ?? Item_Category_Code,
          Item_Category_Name: searchParams?.Item_Category_Name ?? Item_Category_Name,
          Item_Category_Description: searchParams?.Item_Category_Description ?? Item_Category_Description,
          Region_Code: searchParams?.Region_Code ?? Region_Code,
          Display_Order: searchParams?.Display_Order ?? Display_Order,
          Is_Default: searchParams?.Is_Default ?? Is_Default,
          status: searchParams?.status ?? status,
        }),
      });

      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
      } else if (response.status === 404) {
        toast.warning("Data not found");
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Search Failed");
      }
    } catch (error) {
      toast.error("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const reloadGridData = () => {
    window.location.reload();
  };

  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const rowIndex = updatedRowData.findIndex(
      (row) => row.Keyfield === params.data.Keyfield
    );

    if (rowIndex !== -1) {
      updatedRowData[rowIndex][params.colDef.field] = params.newValue;
      setRowData(updatedRowData);

      setEditedData((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.Keyfield === params.data.Keyfield
        );
        if (existingIndex !== -1) {
          const updatedEdited = [...prev];
          updatedEdited[existingIndex] = updatedRowData[rowIndex];
          return updatedEdited;
        } else {
          return [...prev, updatedRowData[rowIndex]];
        }
      });
    }
  };

  const saveEditedData = async () => {
    const selectedRowsData = editedData.filter((row) =>
      selectedRows.some((selectedRow) => selectedRow.Keyfield === row.Keyfield)
    );

    if (selectedRowsData.length === 0) {
      toast.warning("Please select and modify at least one row to update.");
      return;
    }

    showConfirmationToast(
      "Are you sure you want to update the data?",
      async () => {
        setLoading(true);
        try {
          const modified_by = sessionStorage.getItem("selectedUserCode");
          const company_code = sessionStorage.getItem("selectedCompanyCode");
          const location_code = sessionStorage.getItem("selectedLocationCode");

          const payloadData = selectedRowsData.map((row) => ({
            ...row,
            company_code,
            modified_by,
            location_code,
          }));

          const response = await fetch(
            `${config.apiBaseUrl}/Item_Category_MasterUpdateRow`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                company_code: company_code,
                "Modified-By": modified_by,
              },
              body: JSON.stringify({ editedData: payloadData }),
            }
          );

          if (response.status === 200) {
            toast.success("Data Updated Successfully");
            setEditedData([]);
            handleSearch();
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to update data");
          }
        } catch (error) {
          toast.error("Error Updating: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => toast.info("Update cancelled.")
    );
  };

  const deleteSelectedRows = async () => {
    const currentSelectedRows = gridApi.getSelectedRows();
    if (currentSelectedRows.length === 0) {
      toast.warning("Please select at least one row to delete");
      return;
    }

    const company_code = sessionStorage.getItem("selectedCompanyCode");
    const modified_by = sessionStorage.getItem("selectedUserCode");
    const keyfieldsToDelete = currentSelectedRows.map((row) => row.Keyfield);

    showConfirmationToast(
      "Are you sure you want to Delete?",
      async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${config.apiBaseUrl}/Item_Category_MasterDelete`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                keyfields: keyfieldsToDelete,
                company_code,
                modified_by,
              }),
            }
          );

          if (response.ok) {
            toast.success("Data Deleted successfully");
            handleSearch();
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to delete data");
          }
        } catch (error) {
          toast.error("Error Deleting: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      () => toast.info("Delete cancelled.")
    );
  };

  const generateReport = () => {
    const currentSelectedRows = gridApi.getSelectedRows();
    if (currentSelectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report");
      return;
    }

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Category Report</title>");
    reportWindow.document.write(
      "<style>body{font-family:Arial;} h1{color:maroon;text-align:center;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;} th{background-color:maroon;color:white;} td{background-color:#fdd9b5;} tr:nth-child(even) td{background-color:#fff0e1;} @media print{.btn{display:none;}}</style></head><body>"
    );
    reportWindow.document.write(
      "<h1><u>Category Information</u></h1><table><thead><tr><th>Category Code</th><th>Category Name</th><th>Country Code</th><th>Display Order</th><th>Status</th><th>Default Display</th><th>Version</th><th>Region Code</th><th>Description</th></tr></thead><tbody>"
    );

    currentSelectedRows.forEach((row) => {
      reportWindow.document.write(`<tr>
        <td>${row.Item_Category_Code || ""}</td>
        <td>${row.Item_Category_Name || ""}</td>
        <td>${row.Country_Code || ""}</td>
        <td>${row.Display_Order || 0}</td>
        <td>${row.Is_Active || ""}</td>
        <td>${row.Is_Default || ""}</td>
        <td>${row.Record_Version || 0}</td>
        <td>${row.Region_Code || ""}</td>
        <td>${row.Item_Category_Description || ""}</td>
      </tr>`);
    });

    reportWindow.document.write(
      "</tbody></table><button class='btn' style='margin:20px auto;display:block;padding:10px 20px;background:maroon;color:white;' onclick='window.print()'>Print</button></body></html>"
    );
    reportWindow.document.close();
  };

  const handleNavigateToForm = () => {
    navigate("/AddCategory", { state: { mode: "create" } });
  };

  const handleNavigateWithRowData = (selectedData) => {
    navigate("/AddCategory", {
      state: {
        mode: "update",
        Keyfield: selectedData.Keyfield,
        selectedData,
        preservedInputs: {
          Item_Category_Code,
          Item_Category_Name,
          Item_Category_Description,
          Region_Code,
          Display_Order,
          Is_Default,
          status,
        },
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      setCreatedBy(event.data.created_by || "");
      setModifiedBy(event.data.modified_by || "");
      setCreatedDate(formatDate(event.data.created_date));
      setModifiedDate(formatDate(event.data.modified_date));
    }
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Shared Link Renderer Component for Code & Name Columns
  const linkCellRenderer = (params) => {
    return (
      <span
        style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
        onClick={() => handleNavigateWithRowData(params.data)}
        title="Click to Edit"
      >
        {params.value}
      </span>
    );
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: "Item Category Code",
      field: "Item_Category_Code",
      editable: false,
      cellRenderer: linkCellRenderer,
    },
    {
      headerName: "Item Category Name",
      field: "Item_Category_Name",
      editable: true,
    },
    { headerName: "Country Code", field: "Country_Code", editable: true },
    { headerName: "Display Order", field: "Display_Order", editable: true },
    {
      headerName: "Status",
      field: "Is_Active",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: statusgriddrop },
    },
    {
      headerName: "Default Display",
      field: "Is_Default",
      editable: true,
      cellEditor: "agCheckboxCellEditor",
    },
    {
      headerName: "Version",
      field: "Record_Version",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: suomdrop },
    },
    { headerName: "Region Code", field: "Region_Code", editable: true },
    {
      headerName: "Description",
      field: "Item_Category_Description",
      editable: true,
    },
    { headerName: "Keyfield", field: "Keyfield", editable: false, hide: true },
    {
      headerName: "Category Image",
      field: "Item_Category_Image",
      hide: true,
      editable: false,
      cellRenderer: (params) => {
        if (params.value && params.value.data) {
          const base64Image = arrayBufferToBase64(params.value.data);
          return (
            <img
              src={`data:image/jpeg;base64,${base64Image}`}
              alt="Category"
              style={{ width: "35px", height: "35px", objectFit: "cover" }}
            />
          );
        }
        return "";
      },
    },
  ];

  return (
    <div className="container-fluid Topnav-screen">
      {loading && <LoadingScreen />}
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div>
        {/* Action Header Card */}
        <div className="shadow-lg p-1 bg-body-tertiary rounded mb-2">
          <div className="d-flex justify-content-between">
            <div className="d-flex justify-content-start">
              <h1 className="purbut">Category</h1>
            </div>

            {/* Desktop Buttons */}
            <div className="d-flex justify-content-end purbut me-3">
              {["add", "all permission"].some((p) => itemPermissions.includes(p)) && (
                <addbutton className="purbut" onClick={handleNavigateToForm} title="Add">
                  <i className="fa-solid fa-user-plus"></i>
                </addbutton>
              )}
              {["delete", "all permission"].some((p) => itemPermissions.includes(p)) && (
                <delbutton className="purbut" onClick={deleteSelectedRows} title="Delete">
                  <i className="fa-solid fa-user-minus"></i>
                </delbutton>
              )}
              {["update", "all permission"].some((p) => itemPermissions.includes(p)) && (
                <savebutton className="purbut" onClick={saveEditedData} title="Update">
                  <i className="fa-solid fa-floppy-disk"></i>
                </savebutton>
              )}
              {["view", "all permission"].some((p) => itemPermissions.includes(p)) && (
                <printbutton className="purbut" onClick={generateReport} title="Report">
                  <i className="fa-solid fa-print"></i>
                </printbutton>
              )}
            </div>

            {/* Mobile Menu Dropdown */}
            <div className="mobileview">
              <div className="d-flex justify-content-between">
                <div className="d-flex justify-content-start">
                  <h1 className="h1">Category</h1>
                </div>
                <div className="d-flex justify-content-end">
                  <div className="dropdown me-3 mt-3">
                    <button
                      className="btn btn-primary dropdown-toggle p-1"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <i className="fa-solid fa-list"></i>
                    </button>
                    <ul className="dropdown-menu menu">
                      <li className="iconbutton d-flex justify-content-center text-success">
                        <icon className="icon" onClick={handleNavigateToForm}>
                          <i className="fa-solid fa-user-plus"></i>
                        </icon>
                      </li>
                      <li className="iconbutton d-flex justify-content-center text-danger">
                        <icon className="icon" onClick={deleteSelectedRows}>
                          <i className="fa-solid fa-user-minus"></i>
                        </icon>
                      </li>
                      <li className="iconbutton d-flex justify-content-center text-primary">
                        <icon className="icon" onClick={saveEditedData}>
                          <i className="fa-solid fa-floppy-disk"></i>
                        </icon>
                      </li>
                      <li className="iconbutton d-flex justify-content-center">
                        <icon className="icon" onClick={generateReport}>
                          <i className="fa-solid fa-print"></i>
                        </icon>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Area Card */}
        <div className="shadow-lg p-1 pb-4 bg-body-tertiary rounded mb-2">
          <div className="row ms-4 mt-3 mb-3 me-4">
            {/* Item Category Code */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Item Category Code</label>
                <input
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  title="Item Category Code"
                  value={Item_Category_Code}
                  onChange={(e) => setItem_Category_Code(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  maxLength={18}
                />
              </div>
            </div>

            {/* Item Category Name */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Item Category Name</label>
                <input
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  title="Item Category Name"
                  value={Item_Category_Name}
                  onChange={(e) => setItem_Category_Name(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  maxLength={18}
                />
              </div>
            </div>

            {/* Item Category Description */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Item Category Description</label>
                <input
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  title="Item Category Description"
                  value={Item_Category_Description}
                  onChange={(e) => setItem_Category_Description(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  maxLength={40}
                />
              </div>
            </div>

            {/* Region Code */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Region Code</label>
                <input
                  className="exp-input-field form-control"
                  type="text"
                  placeholder=""
                  title="Region Code"
                  value={Region_Code}
                  onChange={(e) => setRegion_Code(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  maxLength={50}
                />
              </div>
            </div>

            {/* Display Order */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Display Order</label>
                <input
                  className="exp-input-field form-control"
                  type="number"
                  placeholder=""
                  title="Display Order"
                  value={Display_Order}
                  onChange={(e) => setDisplay_Order(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  maxLength={50}
                />
              </div>
            </div>

            {/* Default */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Default</label>
                  <div title="Select the Default">
                <Select
                  id="Is_Default"
                  options={filteredOptionDefault}
                  value={selectedDefault}
                  onChange={handleChangeDefault}
                  className="exp-input-field"
                  classNamePrefix="react-select"
                  isClearable
                  placeholder=""
                  title="Default"
                  styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating">
                <label className="exp-form-labels">Status</label>
                <div title="Select the Status">
                <Select
                  id="status"
                  options={filteredOptionStatus}
                  value={selectedStatus}
                  onChange={handleChangeStatus}
                  className="exp-input-field"
                  classNamePrefix="react-select"
                  isClearable
                  placeholder=""
                  title="Status"
                  styles={{ menu: (provided) => ({ ...provided, zIndex: 9999 }) }}
                />
                </div>
              </div>
            </div>

            {/* Search and Refresh */}
            <div className="col-md-3 form-group mb-2">
              <div className="exp-form-floating pt-3">
                <div className="d-flex justify-content-center">
                  <icon
                    type="button"
                    className="popups-btn fs-6 p-3 me-3"
                    onClick={() => handleSearch()}
                    title="Search"
                  >
                    <i className="fas fa-search"></i>
                  </icon>

                  <icon
                    type="button"
                    className="popups-btn fs-6 p-3"
                    onClick={reloadGridData}
                    title="Refresh"
                  >
                    <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" />
                  </icon>
                </div>
              </div>
            </div>
          </div>

          {/* Data Grid */}
          <div className="ag-theme-alpine" style={{ height: 485, width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, wrapText: true }}
              onGridReady={(p) => setGridApi(p.api)}
              onCellValueChanged={onCellValueChanged}
              rowSelection="multiple"
              pagination={true}
              onSelectionChanged={() =>
                setSelectedRows(gridApi.getSelectedNodes().map((n) => n.data))
              }
              onRowSelected={onRowSelected}
              headerHeight={28}
              rowHeight={35}
            />
          </div>
        </div>
      </div>

      {/* Footer Log Info */}
      <div className="shadow-lg p-2 bg-body-tertiary rounded mt-2 mb-2">
        <div className="row ms-2">
          <div className="d-flex justify-content-start">
            <p className="col-md-6 mb-1">Created By: {createdBy}</p>
            <p className="col-md-6 mb-1">Created Date: {createdDate}</p>
          </div>
          <div className="d-flex justify-content-start">
            <p className="col-md-6 mb-0">Modified By: {modifiedBy}</p>
            <p className="col-md-6 mb-0">Modified Date: {modifiedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryScreen;